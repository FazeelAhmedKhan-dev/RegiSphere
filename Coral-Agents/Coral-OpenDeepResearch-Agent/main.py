import logging
import os, json, asyncio, traceback
from dotenv import load_dotenv
import urllib.parse
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from pydantic import BaseModel
import aiohttp
from odr import OpenDeepResearch

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# -------------------- SCHEMA --------------------
class ODRInput(BaseModel):
    topic: str

# -------------------- TOOLS --------------------
async def odr_tool_async(topic: str):
    research = OpenDeepResearch()
    report = await research.generate_research_report(topic)
    temp_dir = os.path.join(os.getcwd(), "temp")
    os.makedirs(temp_dir, exist_ok=True)
    report_path = os.path.join(temp_dir, "report.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)
    return {"report_content": report, "report_path": report_path}

def get_tools_description(tools):
    def serialize_schema(schema):
        # If it's a Pydantic model class, convert to schema dict
        if isinstance(schema, type) and issubclass(schema, BaseModel):
            return schema.model_json_schema()
        # Otherwise fallback to string
        return str(schema)

    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(serialize_schema(tool.args_schema)).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )


# -------------------- AGENT CREATION --------------------
async def create_agent(coral_tools, agent_tools):
    combined_tools = coral_tools + agent_tools
    prompt = ChatPromptTemplate.from_messages([
        ("system",
         f"""You are a specialized research agent. 
These are the list of coral tools: {get_tools_description(coral_tools)}
These are the list of your tools: {get_tools_description(agent_tools)}

**You MUST NEVER finish the chain**"""
        ),
        ("placeholder", "{agent_scratchpad}")
    ])

    mistral_model = init_chat_model(
        model=os.getenv("MODEL_NAME", "mistral-large-latest"),
        model_provider=os.getenv("MODEL_PROVIDER","mistralai"),
        api_key=os.getenv("MODEL_API_KEY","1xzyNsZZWm8bRvjgSjkFTJgY9CAksQfr"),
        temperature=float(os.getenv("MODEL_TEMPERATURE", 0.1)),
        max_tokens=int(os.getenv("MODEL_MAX_TOKENS", 8000)),
        base_url=os.getenv("MODEL_BASE_URL", None)
    )

    # Optional fallback (Groq)
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        groq_model = init_chat_model(
            model=os.getenv("GROQ_MODEL_NAME","llama-3.1-8b-instant"),
            model_provider="groq",
            api_key=groq_api_key,
            temperature=float(os.getenv("MODEL_TEMPERATURE", 0.1)),
            max_tokens=int(os.getenv("MODEL_MAX_TOKENS", 8000)),
        )

    agent = create_tool_calling_agent(mistral_model, combined_tools, prompt)

    class AgentWithFallback(AgentExecutor):
        async def ainvoke(self, inputs: dict):
            try:
                return await super().ainvoke(inputs)
            except Exception as e:
                if groq_api_key and ("429" in str(e) or "3505" in str(e)):
                    logger.warning("Mistral rate limit exceeded, switching to Groq API...")
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

                                for i in range(3):
                                    try:
                                        result = await agent_executor.ainvoke({"agent_scratchpad": [event_data]})
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
        "agentDescription": "Open Deep Research agent performing research tasks via tools"
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

    agent_tools = [
        Tool(
            name="open_deepresearch",
            func=None,
            coroutine=odr_tool_async,
            description="Generates a research report using OpenDeepResearch.",
            args_schema=ODRInput,
            response_format="content_and_artifact"
        )
    ]

    agent_executor = await create_agent(coral_tools, agent_tools)

    await listen_to_coral_sse(CORAL_SERVER_URL, agent_executor)

if __name__ == "__main__":
    asyncio.run(main())
