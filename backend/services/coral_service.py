import httpx
import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class CoralService:
    """Service to interact with Coral-Server"""

    def __init__(self):
        self.base_url = os.getenv("CORAL_SERVER_URL", "http://localhost:5555/api/v1")
        self.application_id = os.getenv("CORAL_SERVER_APPID", "app")
        self.privacy_key = os.getenv("CORAL_SERVER_PRIVKEY", "priv")

    def get_coral_server_info(self) -> dict:
        """Return Coral server information"""
        return {
            "base_url": self.base_url,
            "application_id": self.application_id,
            "privacy_key": self.privacy_key,
        }

    async def create_session(
        self,
        application_id: str,
        session_id: str,
        privacy_key: str,
        agents: List[Dict[str, Any]],
        groups: List[List[str]] = None,
        custom_tools: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Create a new session with Coral-Server using agentGraphRequest"""
        url = f"{self.base_url}/sessions"

        payload = {
            "applicationId": application_id,
            "sessionId": session_id,
            "privacyKey": privacy_key,
            "agentGraphRequest": {
                "agents": agents,
                "groups": groups or [],
                "customTools": custom_tools or {},
            },
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=60.0)
            resp.raise_for_status()
            return resp.json()

    async def create_session_from_file(
        self, file_path: str, session_id: str = None
    ) -> Dict[str, Any]:
        """Create a session by loading configuration from a JSON file"""
        with open(file_path, "r") as f:
            config = json.load(f)

        application_id = config.get("applicationId", "")
        privacy_key = config.get("privacyKey", "")

        agents = config["agentGraphRequest"].get("agents", [])
        groups = config["agentGraphRequest"].get("groups", [])
        custom_tools = config["agentGraphRequest"].get("customTools", {})

        session_id = session_id or config.get("sessionId", "session-001")

        return await self.create_session(
            application_id=application_id,
            session_id=session_id,
            privacy_key=privacy_key,
            agents=agents,
            groups=groups,
            custom_tools=custom_tools,
        )

    async def get_sessions(self) -> List[Dict[str, Any]]:
        """Fetch all sessions from Coral-Server"""
        url = f"{self.base_url}/sessions"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=30.0)
            resp.raise_for_status()
            return resp.json()

    async def get_session(self, session_id: str) -> Dict[str, Any]:
        """Fetch a specific session by session_id"""
        url = f"{self.base_url}/sessions/{session_id}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=30.0)
            resp.raise_for_status()
            return resp.json()

    async def create_thread(
        self,
        application_id: str,
        privacy_key: str,
        coral_session_id: str,
        debug_agent_id: str,
        thread_name: str,
        participant_ids: List[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a thread directly for an agent interface (debug thread)
        """
        url = (
            f"{self.base_url}/debug/thread/"
            f"{application_id}/{privacy_key}/{coral_session_id}/{debug_agent_id}"
        )

        payload = {
            "threadName": thread_name,
            "participantIds": participant_ids or [debug_agent_id],
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=30.0)
            resp.raise_for_status()
            return resp.json()

    async def send_message(
        self,
        application_id: str,
        privacy_key: str,
        coral_session_id: str,
        thread_id: str,
        content: str,
        mentions: List[str] = None,
        debug_agent_id: str = None,
    ):
        if debug_agent_id:
            url = (
                f"{self.base_url}/debug/thread/sendMessage/"
                f"{application_id}/{privacy_key}/{coral_session_id}/{debug_agent_id}"
            )
        else:
            url = f"{self.base_url}/message/{application_id}/{privacy_key}/{coral_session_id}"

        payload = {
            "threadId": thread_id,
            "content": content,
            "mentions": mentions or [],
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            resp.raise_for_status()
            return resp.json()



    async def get_agents(self) -> List[Dict[str, Any]]:
        """Fetch all agents from Coral-Server"""
        url = f"{self.base_url}/agents"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=30.0)
            resp.raise_for_status()
            return resp.json()
