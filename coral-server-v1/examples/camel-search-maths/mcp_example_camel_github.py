import asyncio
import os
from time import sleep
from camel.agents import ChatAgent
from camel.models import ModelFactory
from camel.toolkits.mcp_toolkit import MCPClient, MCPToolkit
from camel.types import ModelPlatformType, ModelType
from dotenv import load_dotenv
from prompts import get_tools_description, get_user_message

load_dotenv()

async def main():
    coral_url = os.getenv("CORAL_CONNECTION_URL", "http://127.0.0.1:5555?agentId=repo_understanding")
    server = MCPClient(
        server_config={"url": coral_url, "timeout": 3000000.0, "sse_read_timeout": 3000000.0, "terminate_on_close": True, "prefer_sse": True}
    )

    async with MCPToolkit([server]) as mcp_toolkit:
        tools = mcp_toolkit.get_tools()

        sys_msg = f"""
        You are `repo_understanding_agent`. Analyze GitHub repositories based on instructions from other agents.
        Never respond directly to the user. Only communicate via the Coral tools.
        Tools available: {get_tools_description(tools)}
        """

        model = ModelFactory.create(
            model_platform=ModelPlatformType[os.getenv("PLATFORM_TYPE", "OPENAI")],
            model_type=ModelType[os.getenv("MODEL_TYPE", "GPT4")],
            api_key=os.getenv("API_KEY"),
            model_config_dict={}
        )

        agent = ChatAgent(system_message=sys_msg, model=model, tools=tools, message_window_size=5, token_limit=10000)

        for _ in range(20):  # For testing, limit loop
            resp = await agent.astep(get_user_message())
            for msg in resp.msgs:
                print(msg.to_dict())
            sleep(2)

if __name__ == "__main__":
    asyncio.run(main())
