"""
Configuration settings for Interface Agent communication
"""
import os
from typing import Dict, Any

class AgentConfig:
    """Configuration for Interface Agent communication"""
    
    # Coral Interface Agent settings
    INTERFACE_AGENT_HOST = os.getenv("INTERFACE_AGENT_HOST", "localhost")
    INTERFACE_AGENT_PORT = int(os.getenv("INTERFACE_AGENT_PORT", "5174"))
    INTERFACE_AGENT_ENDPOINT = os.getenv("INTERFACE_AGENT_ENDPOINT", "/api/chat")
    
    # Request timeout settings
    REQUEST_TIMEOUT = int(os.getenv("AGENT_REQUEST_TIMEOUT", "300"))  # 5 minutes
    CONNECTION_TIMEOUT = int(os.getenv("AGENT_CONNECTION_TIMEOUT", "30"))  # 30 seconds
    
    # Retry settings
    MAX_RETRIES = int(os.getenv("AGENT_MAX_RETRIES", "3"))
    RETRY_DELAY = int(os.getenv("AGENT_RETRY_DELAY", "5"))  # seconds
    

    
    @classmethod
    def get_agent_url(cls) -> str:
        """Get the full URL for the Interface agent"""
        return f"http://{cls.INTERFACE_AGENT_HOST}:{cls.INTERFACE_AGENT_PORT}{cls.INTERFACE_AGENT_ENDPOINT}"
    
    @classmethod
    def get_request_headers(cls) -> Dict[str, str]:
        """Get default headers for agent requests"""
        return {
            "Content-Type": "application/json",
            "User-Agent": "RegiSphere-Backend/1.0",
            "Accept": "application/json"
        }
    
    @classmethod
    def get_payload_template(cls, repo_url: str, prompt: str) -> Dict[str, Any]:
        """Get the standard payload template for agent requests"""
        return {
            "repository_url": str(repo_url),  # Ensure URL is converted to string
            "prompt": str(prompt),
            "task_type": "compliance_assessment",
            "source": "regisphere",
            "version": "1.0"
        }