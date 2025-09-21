import urllib.parse
from dotenv import load_dotenv
import os
import json
import asyncio
import logging
from typing import List, Dict, Any
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from inputimeout import inputimeout, TimeoutOccurred
import httpx

# ---------------- CONFIG ----------------
REQUEST_QUESTION_TOOL = "request-question"
ANSWER_QUESTION_TOOL = "answer-question"
WAIT_FOR_MENTIONS_TOOL = "wait-for-mentions"
MAX_CHAT_HISTORY = 3
DEFAULT_TEMPERATURE = 0.0
DEFAULT_MAX_TOKENS = 8000
SLEEP_INTERVAL = 1
ERROR_RETRY_INTERVAL = 5

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def load_config() -> Dict[str, Any]:
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", None)
    if runtime is None:
        load_dotenv()
    
    config = {
        "runtime": os.getenv("CORAL_ORCHESTRATION_RUNTIME", None),
        "coral_sse_url": os.getenv("CORAL_SSE_URL"),
        "agent_id": os.getenv("CORAL_AGENT_ID"),
        "coral_prompt_system": os.getenv("CORAL_PROMPT_SYSTEM", default = ""),
        "model_name": os.getenv("MODEL_NAME"),
        "model_provider": os.getenv("MODEL_PROVIDER"),
        "api_key": os.getenv("MODEL_API_KEY"),
        "groq_model_name": os.getenv("GROQ_MODEL_NAME"),
        "groq_api_key": os.getenv("GROQ_API_KEY"),
        "model_temperature": float(os.getenv("MODEL_TEMPERATURE", DEFAULT_TEMPERATURE)),
        "model_token": int(os.getenv("MODEL_TOKEN_LIMIT", DEFAULT_MAX_TOKENS)),
        "base_url": os.getenv("MODEL_BASE_URL")
    }
    
    required_fields = ["coral_sse_url", "agent_id", "model_name", "model_provider", "api_key", "groq_model_name", "groq_api_key"]
    missing = [field for field in required_fields if not config.get(field)]
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    if not 0 <= config["model_temperature"] <= 2:
        raise ValueError(f"Model temperature must be between 0 and 2, got {config['model_temperature']}")
    if config["model_token"] <= 0:
        raise ValueError(f"Model token must be positive, got {config['model_token']}")
    
    return config

# ------------- UTILS -------------------
def get_tools_description(tools: List[Any]) -> str:
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"

        for tool in tools
    )

def format_chat_history(chat_history: List[Dict[str, str]]) -> str:
    if not chat_history:
        return "No previous chat history available."
    
    history_str = "Previous Conversations (use this to resolve ambiguous references like 'it'):\n"
    for i, chat in enumerate(chat_history, 1):
        history_str += f"Conversation {i}:\n"
        history_str += f"User: {chat['user_input']}\n"
        history_str += f"Agent: {chat['response']}\n\n"
    return history_str

async def get_user_input(runtime: str | None, agent_tools: Dict[str, Any]) -> str:
    user_input = None
    if runtime is not None:
        try:
            logger.info(f"Waiting for user input from STUDIO (runtime: {runtime})...")
            user_input = await asyncio.wait_for(
                agent_tools[REQUEST_QUESTION_TOOL].ainvoke({
                    "message": "How can I assist you today?"
                }),
                timeout=120
            )
        except Exception:
            logger.error(f"No input received from studio")
    else:
        try:
            logger.info("Waiting for user input from TERMINAL...")
            user_input = inputimeout(prompt='How can I assist you today? ', timeout=120).strip()
        except Exception:
            logger.error(f"No input received from terminal")

    if user_input is None:
        try:
            logger.info("Calling Wait For Mentions...")
            user_input = await agent_tools[WAIT_FOR_MENTIONS_TOOL].ainvoke({"timeoutMs": 10000})
        except (Exception, asyncio.TimeoutError) as e:
            logger.error(f"Error in {WAIT_FOR_MENTIONS_TOOL}: {str(e)}")
            user_input = "no new messages"

    logger.info(f"User input: {user_input}")
    return user_input

async def send_response(runtime: str, agent_tools: Dict[str, Any], response: str) -> None:
    logger.info(f"Agent response: {response}")
    if runtime is not None:
        try:
            await agent_tools[ANSWER_QUESTION_TOOL].ainvoke({
                "response": response
            })
        except Exception as e:
            logger.error(f"Error invoking answer_question tool: {str(e)}")
            raise

# ------------- AGENT -------------------
async def create_agent(config: Dict[str, Any], coral_tools: List[Any]) -> AgentExecutor:
    coral_tools_description = get_tools_description(coral_tools)
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""Your role is to plan tasks sent by the user and delegate to other agents.
Focus on questions about Coral Server, its tools: {coral_tools_description}, and registered agents.
Use {{chat_history}} for context.
Only answer questions if you cannot delegate: "I'm sorry, I can only answer questions about Coral Server and its tools."
"""
        ),
        ("human", "{user_input}"),
        ("placeholder", "{agent_scratchpad}")
    ])

    # Primary model (Mistral)
    mistral_model = init_chat_model(
        model=config["MODEL_NAME"],
        model_provider=config["MODEL_PROVIDER"],
        api_key=config["MODEL_API_KEY"],
        temperature=config["MODEL_TEMPERATURE"],
        max_tokens=config["MODEL_MAX_TOKENS"],
        base_url=config.get("MODEL_BASE_URL", None)
    )

    # Fallback model (Groq)
    groq_model = init_chat_model(
        model=config["GROQ_MODEL_NAME"],
        model_provider="groq",
        api_key=config["GROQ_API_KEY"],
        temperature=config["MODEL_TEMPERATURE"],
        max_tokens=config["MODEL_MAX_TOKENS"],
    )

    agent = create_tool_calling_agent(mistral_model, coral_tools, prompt)

    # ---------------- Updated: Robust Fallback ----------------
    class AgentWithFallback(AgentExecutor):
        async def ainvoke(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
            try:
                return await super().ainvoke(inputs)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 or "3505" in str(e):
                    logger.warning("Mistral API rate limit hit, switching to Groq API...")
                    groq_agent = create_tool_calling_agent(groq_model, self.tools, prompt)
                    groq_executor = AgentExecutor(
                        agent=groq_agent,
                        tools=self.tools,
                        verbose=True,
                        return_intermediate_steps=True
                    )
                    return await groq_executor.ainvoke(inputs)
                raise
            except Exception as e:
                if "429" in str(e):
                    logger.warning("Detected generic 429 error, switching to Groq API...")
                    groq_agent = create_tool_calling_agent(groq_model, self.tools, prompt)
                    groq_executor = AgentExecutor(
                        agent=groq_agent,
                        tools=self.tools,
                        verbose=True,
                        return_intermediate_steps=True
                    )
                    return await groq_executor.ainvoke(inputs)
                raise

    return AgentWithFallback(agent=agent, tools=coral_tools, verbose=True, return_intermediate_steps=True)

# ------------- MAIN LOOP ----------------
async def main():
    try:
        config = load_config()
        coral_params = {
            "agentId": config["agent_id"],
            "agentDescription": "Agent for user input and agent collaboration"
        }
        query_string = urllib.parse.urlencode(coral_params)
        coral_server_url = f"{config['coral_sse_url']}?{query_string}"
        logger.info(f"Connecting to Coral Server: {coral_server_url}")

        timeout = int(os.getenv("TIMEOUT_MS", 300))
        client = MultiServerMCPClient(
            connections={
                "coral": {
                    "transport": "sse",
                    "url": coral_server_url,
                    "timeout": timeout,
                    "sse_read_timeout": timeout,
                }
            }
        )

        coral_tools = await client.get_tools(server_name="coral")
        agent_tools = {tool.name: tool for tool in coral_tools}
        agent_executor = await create_agent(config, coral_tools)
        logger.info("Agent executor created")

        chat_history: List[Dict[str, str]] = []

        while True:
            try:
                user_input = await get_user_input(config["runtime"], agent_tools)
                if not user_input or "no new messages" in str(user_input).lower():
                    await asyncio.sleep(SLEEP_INTERVAL)
                    continue

                formatted_history = format_chat_history(chat_history)
                result = await agent_executor.ainvoke({
                    "user_input": user_input,
                    "agent_scratchpad": [],
                    "chat_history": formatted_history
                })
                response = result.get('output', 'No output returned')

                await send_response(config["runtime"], agent_tools, response)

                chat_history.append({"user_input": user_input, "response": response})
                if len(chat_history) > MAX_CHAT_HISTORY:
                    chat_history.pop(0)

                await asyncio.sleep(SLEEP_INTERVAL)
            except Exception as e:
                logger.error(f"Error in agent loop: {str(e)}")
                await asyncio.sleep(ERROR_RETRY_INTERVAL)
    except Exception as e:
        logger.error(f"Fatal error in main: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
