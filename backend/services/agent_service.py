"""
AgentService
------------
Manages the lifecycle of the Coral Interface Agent and sends
compliance-assessment requests with throttling + backoff.

Requirements:
    pip install aiohttp
"""

import asyncio
import subprocess
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional

import aiohttp
from config.agent_config import AgentConfig

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Throttling / backoff configuration
# -------------------------------------------------------------------

MAX_CONCURRENT_CALLS = 3          # limit parallel requests to the agent
BACKOFF_BASE_DELAY = 1.0          # seconds
BACKOFF_MAX_DELAY = 30.0
BACKOFF_RETRIES = 5

# semaphore is shared by all AgentService instances
_api_semaphore = asyncio.Semaphore(MAX_CONCURRENT_CALLS)


class AgentService:
    """Service to manage communication with Coral Interface Agent."""

    def __init__(self):
        self.agent_process: Optional[subprocess.Popen] = None
        self.agent_url: str = "http://localhost:8001"
        self.coral_agent_path: str = r"D:\RegiSphere\Coral-Agents\Coral-Interface-Agent"
        self.is_initialized: bool = False

    # -----------------------------------------------------------------
    # Lifecycle
    # -----------------------------------------------------------------
    async def initialize(self) -> None:
        """Ensure the agent is running before using it."""
        try:
            if await self.check_agent_health():
                logger.info("Coral Interface Agent already running")
                self.is_initialized = True
                return
            await self.start_agent()
            self.is_initialized = True
        except Exception as exc:
            logger.error(f"Failed to initialize agent service: {exc}")
            raise

    async def start_agent(self) -> None:
        """Launch the agent subprocess."""
        try:
            cmd = ["python", "main.py"]
            self.agent_process = subprocess.Popen(
                cmd,
                cwd=self.coral_agent_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            # give the process a moment to bind its port
            await asyncio.sleep(3)
            if self.agent_process.poll() is None:
                logger.info("Coral Interface Agent started successfully")
            else:
                out, err = self.agent_process.communicate()
                raise RuntimeError(f"Agent failed to start: {err or out}")
        except Exception as exc:
            logger.error(f"Error starting agent: {exc}")
            raise

    async def check_agent_health(self) -> bool:
        """Check if the agent process is alive."""
        try:
            return self.agent_process is not None and self.agent_process.poll() is None
        except Exception:
            return False

    # -----------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------
    async def query_agent(self, repo_url: str) -> str:
        """
        Send a GitHub repository URL to the Interface Agent
        for a comprehensive compliance assessment.
        """
        if not await self.check_agent_health():
            return "Error: Interface agent is not available"

        compliance_prompt = (
            f"Here is a GitHub repository URL: {repo_url}\n\n"
            "Generate a comprehensive compliance assessment report including:\n"
            "- Repository overview\n"
            "- Compliance analysis\n"
            "- Risks & gaps\n"
            "- Final summary."
        )

        return await self._send_to_interface_agent(repo_url, compliance_prompt)

    # -----------------------------------------------------------------
    # Internal helpers
    # -----------------------------------------------------------------
    async def _send_to_interface_agent(self, repo_url: str, prompt: str) -> str:
        """
        Prepare payload and send to the Coral Interface Agent
        with throttling & backoff.
        """
        payload = {
            "message": f"Analyze this repo: {repo_url}\n\nPrompt: {prompt}",
            "conversation_id": None,
            "stream": False,
        }
        agent_url = AgentConfig.get_agent_url()
        headers = AgentConfig.get_request_headers()

        async with _api_semaphore:  # throttle concurrent calls
            return await self._send_with_backoff(agent_url, payload, headers)

    async def _send_with_backoff(
        self,
        url: str,
        payload: Dict[str, Any],
        headers: Dict[str, str],
        retries: int = BACKOFF_RETRIES,
        base_delay: float = BACKOFF_BASE_DELAY,
        max_delay: float = BACKOFF_MAX_DELAY,
    ) -> str:
        """
        POST to the agent with exponential backoff on 429/5xx or network errors.
        """
        delay = base_delay
        for attempt in range(1, retries + 1):
            try:
                timeout = aiohttp.ClientTimeout(
                    total=AgentConfig.REQUEST_TIMEOUT,
                    connect=AgentConfig.CONNECTION_TIMEOUT,
                )
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(url, json=payload, headers=headers) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            return (
                                data.get("response")
                                or data.get("message")
                                or data.get("content")
                                or json.dumps(data)
                            )

                        if resp.status in (429, 500, 502, 503, 504):
                            txt = await resp.text()
                            logger.warning(
                                f"API {resp.status} (attempt {attempt}/{retries}) "
                                f"- retrying in {delay:.1f}s: {txt[:120]}"
                            )
                            await asyncio.sleep(delay)
                            delay = min(delay * 2, max_delay)
                            continue

                        # Other error: don't retry
                        txt = await resp.text()
                        return f"Error {resp.status}: {txt}"

            except (asyncio.TimeoutError, aiohttp.ClientError) as exc:
                logger.warning(
                    f"Attempt {attempt}/{retries} failed: {type(exc).__name__} -> {exc}"
                )
                if attempt < retries:
                    await asyncio.sleep(delay)
                    delay = min(delay * 2, max_delay)
                    continue
                return f"Error: failed after {retries} attempts: {exc}"

        return f"Error: all {retries} attempts exhausted"

    # -----------------------------------------------------------------
    # Cleanup
    # -----------------------------------------------------------------
    async def cleanup(self) -> None:
        """Stop the agent process if running."""
        try:
            if self.agent_process and self.agent_process.poll() is None:
                self.agent_process.terminate()
                await asyncio.sleep(1)
                if self.agent_process.poll() is None:
                    self.agent_process.kill()
                logger.info("Agent process terminated")
        except Exception as exc:
            logger.error(f"Error during cleanup: {exc}")
