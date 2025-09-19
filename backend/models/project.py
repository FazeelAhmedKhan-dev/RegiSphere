from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

class ProjectUpload(BaseModel):
    """Model for project upload request"""
    projectName: str = Field(..., min_length=1, max_length=100, description="Name of the project")
    projectType: str = Field(..., description="Type of project (e.g., 'web-app', 'api', 'library')")
    projectDescription: Optional[str] = Field(None, max_length=500, description="Optional project description")
    projectUrl: HttpUrl = Field(..., description="Git repository URL")

    class Config:
        json_schema_extra = {
            "example": {
                "projectName": "My Web App",
                "projectType": "web-app",
                "projectDescription": "A modern web application",
                "projectUrl": "https://github.com/user/repo.git"
            }
        }

class AgentStep(BaseModel):
    """Model for individual pipeline step"""
    id: str = Field(..., description="Unique step identifier")
    name: str = Field(..., description="Human-readable step name")
    status: Literal["pending", "running", "done", "error"] = Field(..., description="Current step status")
    message: str = Field(..., description="Current step message")
    started_at: Optional[datetime] = Field(None, description="When the step started")
    completed_at: Optional[datetime] = Field(None, description="When the step completed")
    error_details: Optional[str] = Field(None, description="Error details if step failed")

class PipelineStatus(BaseModel):
    """Model for pipeline status response"""
    session_id: str = Field(..., description="Unique session identifier")
    status: Literal["initialized", "processing", "completed", "error"] = Field(..., description="Overall pipeline status")
    steps: List[AgentStep] = Field(..., description="List of pipeline steps")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    created_at: Optional[datetime] = Field(None, description="When the pipeline was created")
    completed_at: Optional[datetime] = Field(None, description="When the pipeline completed")
    error: Optional[str] = Field(None, description="Error message if pipeline failed")

class ComplianceReport(BaseModel):
    """Model for compliance analysis report"""
    session_id: str = Field(..., description="Session identifier")
    project_info: Dict[str, Any] = Field(..., description="Project information")
    repository_analysis: Dict[str, Any] = Field(..., description="Repository structure analysis")
    compliance_results: Dict[str, Any] = Field(..., description="Compliance check results")
    risk_assessment: Dict[str, Any] = Field(..., description="Risk analysis results")
    recommendations: List[str] = Field(..., description="List of recommendations")
    overall_score: float = Field(..., ge=0, le=100, description="Overall compliance score")
    generated_at: datetime = Field(..., description="When the report was generated")

class AgentStatus(BaseModel):
    """Model for agent status"""
    name: str = Field(..., description="Agent name")
    status: Literal["online", "offline", "error"] = Field(..., description="Agent status")
    last_ping: Optional[datetime] = Field(None, description="Last successful ping")
    capabilities: List[str] = Field(..., description="List of agent capabilities")
    error_message: Optional[str] = Field(None, description="Error message if agent is in error state")

class HealthCheck(BaseModel):
    """Model for health check response"""
    status: Literal["healthy", "degraded", "unhealthy"] = Field(..., description="Overall system health")
    timestamp: datetime = Field(..., description="Health check timestamp")
    agent_service: Dict[str, Any] = Field(..., description="Agent service health details")
    uptime: Optional[str] = Field(None, description="System uptime")

class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request identifier for tracking")