import urllib.parse
from dotenv import load_dotenv
import os, json, asyncio, traceback
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
import logging
from pydantic import BaseModel
import httpx
import aiohttp

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------- SCHEMA --------------------
class AskHumanInput(BaseModel):
    question: str

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def ask_human_tool(question: str) -> str:
    print(f"Agent asks: {question}")
    response = input("Your response: ")
    return response

# -------------------- AGENT CREATION --------------------
async def create_agent(coral_tools, agent_tools, runtime):
    coral_tools_description = get_tools_description(coral_tools)
    
    if runtime is not None:
        agent_tools_for_description = [tool for tool in coral_tools if tool.name in agent_tools]
        agent_tools_description = get_tools_description(agent_tools_for_description)
        combined_tools = coral_tools + agent_tools_for_description
        user_request_tool = "request_question"
        user_answer_tool = "answer_question"
    else:
        agent_tools_description = get_tools_description(agent_tools)
        combined_tools = coral_tools + agent_tools
        user_request_tool = "ask_human"
        user_answer_tool = "ask_human"

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         f"""You are an agent interacting with the tools from Coral Server and using `{user_request_tool}` and `{user_answer_tool}` to communicate with the user. **You MUST NEVER finish the chain**

These are the list of coral tools: {coral_tools_description}
These are the list of agent tools: {agent_tools_description}

**You MUST NEVER finish the chain**"""
        ),
        ("placeholder", "{agent_scratchpad}")
    ])

    # Primary model (Mistral)
    mistral_model = init_chat_model(
        model=os.getenv("MODEL_NAME","mistral-large-latest"),
        model_provider=os.getenv("MODEL_PROVIDER"),
        api_key=os.getenv("MODEL_API_KEY"),
        temperature=float(os.getenv("MODEL_TEMPERATURE", 0.0)),
        max_tokens=int(os.getenv("MODEL_MAX_TOKENS", 8000)),
        base_url=os.getenv("MODEL_BASE_URL", None)
    )

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing.")

    # Fallback model (Groq)
    groq_model = init_chat_model(
        model=os.getenv("GROQ_MODEL_NAME","llama-3.1-8b-instant"),
        model_provider="groq",
        api_key=groq_api_key,
        temperature=float(os.getenv("MODEL_TEMPERATURE", 0.0)),
        max_tokens=int(os.getenv("MODEL_MAX_TOKENS", 8000)),
    )

    agent = create_tool_calling_agent(mistral_model, combined_tools, prompt)

    # Wrap agent with fallback executor
    class AgentWithFallback(AgentExecutor):
        async def ainvoke(self, inputs: dict):
            try:
                return await super().ainvoke(inputs)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 or "3505" in str(e):
                    logger.warning("Mistral API rate limit / capacity exceeded. Switching to Groq API...")
                    groq_agent = create_tool_calling_agent(groq_model, self.tools, prompt)
                    groq_executor = AgentExecutor(agent=groq_agent, tools=self.tools, verbose=True)
                    return await groq_executor.ainvoke(inputs)
                raise
            except Exception as e:
                if "429" in str(e):
                    logger.warning("Detected generic 429 error, switching to Groq API...")
                    groq_agent = create_tool_calling_agent(groq_model, self.tools, prompt)
                    groq_executor = AgentExecutor(agent=groq_agent, tools=self.tools, verbose=True)
                    return await groq_executor.ainvoke(inputs)
                raise

    return AgentWithFallback(agent=agent, tools=combined_tools, verbose=True)

# -------------------- SSE LISTENER --------------------
async def listen_to_coral_sse(url, agent_executor, max_retries=5):
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as resp:
                    if resp.status != 200:
                        logger.error(f"Failed to connect SSE: {resp.status}")
                        return

                    async for line in resp.content:
                        if line:
                            decoded = line.decode("utf-8").strip()
                            if decoded.startswith("data:"):
                                event_data = decoded.replace("data:", "").strip()
                                logger.info(f"Received SSE event: {event_data}")

                                # Safe agent invocation with retries
                                for i in range(3):
                                    try:
                                        result = await agent_executor.ainvoke({"agent_scratchpad": event_data})
                                        logger.info(f"Agent processed event: {result}")
                                        break
                                    except Exception as e:
                                        logger.warning(f"Agent error on attempt {i+1}: {e}")
                                        await asyncio.sleep(1)
        except (aiohttp.ClientConnectorError, ConnectionRefusedError) as e:
            logger.warning(f"Connection error: {e}. Retrying in {retry_delay}s...")
            await asyncio.sleep(retry_delay)
            retry_delay *= 2
        else:
            break
    else:
        logger.error("Max SSE connection retries reached. Exiting listener.")

# -------------------- MAIN --------------------
async def main():
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", None)
    if runtime is None:
        load_dotenv()

    base_url = os.getenv("CORAL_SSE_URL")
    agentID = os.getenv("CORAL_AGENT_ID")

    coral_params = {
        "agentId": agentID,
        "agentDescription": "An agent that takes user input and interacts with other agents to fulfill requests"
    }

    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    logger.info(f"Connecting to Coral Server: {CORAL_SERVER_URL}")

    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": 300000,
                "sse_read_timeout": 300000,
            }
        }
    )
    logger.info("Coral Server Connection Established")

    coral_tools = await client.get_tools(server_name="coral")
    logger.info(f"Coral tools count: {len(coral_tools)}")
    
    if runtime is not None:
        required_tools = ["request-question", "answer-question"]
        available_tools = [tool.name for tool in coral_tools]
        for tool_name in required_tools:
            if tool_name not in available_tools:
                error_message = f"Required tool '{tool_name}' not found in coral_tools. Include it in Coral Studio."
                logger.error(error_message)
                raise ValueError(error_message)
        agent_tools = required_tools
    else:
        agent_tools = [
            Tool(
                name="ask_human",
                func=None,
                coroutine=ask_human_tool,
                description="Ask the user a question and wait for a response.",
                args_schema=AskHumanInput
            )
        ]
    
    agent_executor = await create_agent(coral_tools, agent_tools, runtime)

    # Start listening to SSE events
    await listen_to_coral_sse(CORAL_SERVER_URL, agent_executor)

if __name__ == "__main__":
    asyncio.run(main())
