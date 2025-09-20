import asyncio
import subprocess
import json
import logging
import aiohttp
import time
from datetime import datetime
from typing import Dict, Any, Optional

from config.agent_config import AgentConfig

logger = logging.getLogger(__name__)

class AgentService:
    """Service to manage communication with Coral Interface Agent"""
    
    def __init__(self):
        self.agent_process = None
        self.agent_url = "http://localhost:8001"  # Default agent URL
        self.coral_agent_path = "D:\something-coral\RegiSphere\Coral-Agents\Coral-Interface-Agent"
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the agent service"""
        try:
            # Check if agent is already running
            if await self.check_agent_health():
                logger.info("Coral Interface Agent is already running")
                self.is_initialized = True
                return
            
            # Start the agent if not running
            await self.start_agent()
            self.is_initialized = True
            logger.info("Agent service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent service: {e}")
            raise
    
    async def start_agent(self):
        """Start the Coral Interface Agent"""
        try:
            # Change to agent directory
            agent_dir = self.coral_agent_path
            
            # Start the agent process
            cmd = ["python", "main.py"]
            self.agent_process = subprocess.Popen(
                cmd,
                cwd=agent_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a bit for the agent to start
            await asyncio.sleep(3)
            
            # Check if agent started successfully
            if self.agent_process.poll() is None:
                logger.info("Coral Interface Agent started successfully")
            else:
                stdout, stderr = self.agent_process.communicate()
                logger.error(f"Agent failed to start. STDOUT: {stdout}, STDERR: {stderr}")
                raise Exception("Failed to start Coral Interface Agent")
                
        except Exception as e:
            logger.error(f"Error starting agent: {e}")
            raise
    
    async def check_agent_health(self) -> bool:
        """Check if the agent is running and healthy"""
        try:
            # For now, we'll check if the agent process is running
            # In a real implementation, you might have an HTTP health endpoint
            if self.agent_process and self.agent_process.poll() is None:
                return True
            return False
        except Exception as e:
            logger.error(f"Error checking agent health: {e}")
            return False
    
    async def check_health(self) -> Dict[str, Any]:
        """Get detailed health status"""
        try:
            is_healthy = await self.check_agent_health()
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "agent_running": is_healthy,
                "last_check": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "last_check": datetime.now().isoformat()
            }
    
    async def get_agents_status(self) -> Dict[str, Any]:
        """Get status of all connected agents"""
        try:
            coral_status = await self.check_agent_health()
            return {
                "coral_interface_agent": {
                    "status": "online" if coral_status else "offline",
                    "capabilities": [
                        "repository_analysis",
                        "compliance_checking",
                        "risk_assessment",
                        "report_generation"
                    ],
                    "last_ping": datetime.now().isoformat() if coral_status else None
                }
            }
        except Exception as e:
            logger.error(f"Error getting agents status: {e}")
            return {"error": str(e)}
    
    async def analyze_repository(self, repo_url: str) -> Dict[str, Any]:
        """Analyze repository structure and content"""
        try:
            # Convert HttpUrl to string if needed
            repo_url_str = str(repo_url)
            
            # Create a prompt for repository analysis
            prompt = f"""
            Please analyze the repository at {repo_url_str}. 
            
            Provide a comprehensive analysis including:
            1. Repository structure and organization
            2. Programming languages and frameworks used
            3. Dependencies and third-party libraries
            4. Configuration files and their purposes
            5. Documentation quality
            6. Code quality indicators
            7. Security considerations
            
            Format your response as a structured analysis that can be used for compliance checking.
            """
            
            result = await self.query_agent(prompt)
            
            return {
                "repository_url": repo_url_str,
                "analysis": result,
                "analyzed_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing repository: {e}")
            return {
                "repository_url": repo_url_str,
                "error": str(e),
                "status": "error"
            }
    
    async def check_compliance_rules(self, repo_analysis: Dict[str, Any], project_type: str) -> Dict[str, Any]:
        """Check compliance rules based on repository analysis"""
        try:
            prompt = f"""
            Based on the following repository analysis, check compliance for a {project_type} project:
            
            Repository Analysis:
            {json.dumps(repo_analysis, indent=2, default=str)}
            
            Please check compliance against common standards including:
            1. Security best practices
            2. Code quality standards
            3. Documentation requirements
            4. Dependency management
            5. Configuration security
            6. Data protection measures
            7. Industry-specific regulations (if applicable)
            
            Provide a detailed compliance report with:
            - Compliance status for each category
            - Specific issues found
            - Severity levels (Critical, High, Medium, Low)
            - Recommendations for remediation
            """
            
            result = await self.query_agent(prompt)
            
            return {
                "project_type": project_type,
                "compliance_check": result,
                "checked_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error checking compliance: {e}")
            return {
                "project_type": project_type,
                "error": str(e),
                "status": "error"
            }
    
    async def analyze_risks(self, compliance_check: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze risks based on compliance check results"""
        try:
            prompt = f"""
            Based on the following compliance check results, perform a comprehensive risk analysis:
            
            Compliance Check Results:
            {json.dumps(compliance_check, indent=2, default=str)}
            
            Please provide:
            1. Risk assessment for each identified issue
            2. Overall risk score (0-100)
            3. Risk categories (Security, Operational, Compliance, Financial)
            4. Impact analysis
            5. Likelihood assessment
            6. Risk mitigation strategies
            7. Priority recommendations
            
            Format the response as a structured risk assessment report.
            """
            
            result = await self.query_agent(prompt)
            
            return {
                "risk_analysis": result,
                "analyzed_at": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing risks: {e}")
            return {
                "error": str(e),
                "status": "error"
            }
    
    async def generate_report(self, repo_analysis: Dict[str, Any], compliance_check: Dict[str, Any], risk_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final compliance report"""
        try:
            prompt = f"""
            Generate a comprehensive compliance report based on the following analyses:
            
            Repository Analysis:
            {json.dumps(repo_analysis, indent=2, default=str)}
            
            Compliance Check:
            {json.dumps(compliance_check, indent=2, default=str)}
            
            Risk Analysis:
            {json.dumps(risk_analysis, indent=2, default=str)}
            
            Please create a professional compliance report including:
            1. Executive Summary
            2. Project Overview
            3. Compliance Status Summary
            4. Detailed Findings
            5. Risk Assessment
            6. Recommendations
            7. Action Plan
            8. Overall Compliance Score (0-100)
            
            Format the report in a clear, professional manner suitable for stakeholders.
            """
            
            result = await self.query_agent(prompt)
            
            return {
                "report": result,
                "generated_at": datetime.now().isoformat(),
                "status": "completed",
                "components": {
                    "repository_analysis": repo_analysis,
                    "compliance_check": compliance_check,
                    "risk_analysis": risk_analysis
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return {
                "error": str(e),
                "status": "error"
            }
    
    async def query_agent(self, repo_url: str) -> str:
        """Send a repository URL to the Coral Interface Agent for compliance assessment"""
        try:
            # Check if agent is running
            if not await self.check_agent_health():
                logger.error("Interface agent is not running")
                raise Exception("Interface agent is not available")
            
            # Hardcoded compliance assessment prompt
            compliance_prompt = f"""Here is a GitHub repository URL: {repo_url}

Your task is to generate a comprehensive compliance assessment report for this repository. The report should include:

Repository Overview:
- Purpose and description of the project
- Key technologies, frameworks, and dependencies used
- Project structure and organization of files

Compliance-Oriented Analysis:
- Identify the repository's domain (e.g., finance, healthcare, blockchain, AI, etc.)
- Fetch and outline the rules, regulations, and compliance standards relevant to that domain (using the Fire-Crawl agent or other sources)
- Evaluate how well the repository aligns with these compliance requirements

Risk and Gap Assessment:
- Highlight any potential risks, missing documentation, or practices that may violate compliance standards
- Recommend improvements for compliance and best practices

Final Summary:
- A concise conclusion stating whether this repository is likely to fulfill its domain's compliance requirements, and what steps should be taken next.

Please provide a detailed analysis and return the complete compliance assessment report."""

            logger.info(f"Sending compliance assessment request to Interface agent for repo: {repo_url}")
            logger.info(f"Compliance prompt sent: {compliance_prompt[:200]}...")
            
            # Send request to Coral server via HTTP
            response = await self._send_to_interface_agent(repo_url, compliance_prompt)
            
            # Check if we got a valid response
            if response is None:
                raise Exception("Coral server did not return any response")
            
            # Check if response contains an error
            if response.startswith("Error:"):
                logger.error(f"Coral server returned error: {response}")
                # Return the error as the report so it gets displayed to the user
                return response
            
            logger.info(f"Coral server returned successful response: {type(response)}")
            return response
                
        except Exception as e:
            logger.error(f"Error querying Coral server: {e}")
            # Return the error as a report so it gets displayed to the user
            return f"Error: Failed to communicate with Coral server - {str(e)}"
    
    async def _send_to_interface_agent(self, repo_url: str, prompt: str) -> str:
        """Send request to Coral Interface agent and get response"""
        try:
            # Get configuration
            agent_url = AgentConfig.get_agent_url()
            headers = AgentConfig.get_request_headers()
            
            # Create the message for Coral server
            message = f"Please analyze this repository: {repo_url}\n\nPrompt: {prompt}"
            
            # Coral server chat payload
            payload = {
                "message": message,
                "conversation_id": None,  # Start new conversation
                "stream": False
            }
            
            # Setup timeout
            timeout = aiohttp.ClientTimeout(
                total=AgentConfig.REQUEST_TIMEOUT,
                connect=AgentConfig.CONNECTION_TIMEOUT
            )
            
            logger.info(f"Sending chat request to Coral server at {agent_url}")
            logger.info(f"Message: {message[:100]}...")  # Log first 100 chars
            
            # Retry logic
            for attempt in range(AgentConfig.MAX_RETRIES):
                try:
                    logger.info(f"Attempt {attempt + 1}: Connecting to Coral server...")
                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(agent_url, json=payload, headers=headers) as response:
                            logger.info(f"Received response with status: {response.status}")
                            
                            if response.status == 200:
                                result = await response.json()
                                logger.info(f"Successfully received JSON response from Coral server")
                                logger.info(f"Response keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
                                
                                # Extract the response from Coral server
                                if "response" in result:
                                    logger.info("Extracting 'response' field from Coral server")
                                    return result["response"]
                                elif "message" in result:
                                    logger.info("Extracting 'message' field from Coral server")
                                    return result["message"]
                                elif "content" in result:
                                    logger.info("Extracting 'content' field from Coral server")
                                    return result["content"]
                                else:
                                    logger.info("No expected field found, returning full result as string")
                                    return str(result)
                            else:
                                error_text = await response.text()
                                logger.error(f"Coral server returned error {response.status}: {error_text}")
                                
                                # Return the error to be displayed in the report
                                return f"Error from Coral server: {response.status} - {error_text}"
                                    
                except (asyncio.TimeoutError, aiohttp.ClientError) as e:
                    logger.warning(f"Attempt {attempt + 1} failed with error: {type(e).__name__}: {e}")
                    if attempt < AgentConfig.MAX_RETRIES - 1:
                        logger.info(f"Waiting {AgentConfig.RETRY_DELAY} seconds before retry...")
                        await asyncio.sleep(AgentConfig.RETRY_DELAY)
                    else:
                        logger.error(f"All {AgentConfig.MAX_RETRIES} attempts failed")
                        # Return the error to be displayed in the report
                        return f"Error: Failed to connect to Coral server after {AgentConfig.MAX_RETRIES} attempts: {e}"
                        
        except aiohttp.ClientConnectorError as e:
            logger.error(f"Cannot connect to Coral server at {agent_url}: {e}")
            return f"Error: Cannot connect to Coral server at {agent_url}. Please ensure the Coral server is running on localhost:5174"
            
        except asyncio.TimeoutError:
            logger.error("Coral server request timed out")
            return "Error: Request to Coral server timed out"
            
        except Exception as e:
            logger.error(f"Unexpected error communicating with Coral server: {e}")
            return f"Error: Unexpected error communicating with Coral server: {e}"
    
    def _simulate_repo_analysis(self) -> str:
        """Simulate repository analysis response"""
        return """
        Repository Analysis Complete:
        
        Structure: Well-organized with clear separation of concerns
        Languages: Python, JavaScript, TypeScript
        Frameworks: FastAPI, React, Tailwind CSS
        Dependencies: Modern and up-to-date
        Documentation: Good README, inline comments present
        Security: Basic security measures in place
        Code Quality: High, follows best practices
        """
    
    async def cleanup(self):
        """Cleanup agent resources"""
        try:
            if self.agent_process and self.agent_process.poll() is None:
                self.agent_process.terminate()
                await asyncio.sleep(1)
                if self.agent_process.poll() is None:
                    self.agent_process.kill()
                logger.info("Agent process terminated")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")