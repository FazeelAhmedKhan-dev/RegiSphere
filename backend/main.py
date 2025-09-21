from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import uuid
import logging
from datetime import datetime
import json

from services.agent_service import AgentService
from models.project import ProjectUpload, PipelineStatus, AgentStep
from services.coral_service import CoralService


# Initialize coral service
coral_service = CoralService()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RegiSphere Backend API",
    description="FastAPI backend connecting RegiSphere frontend with Coral Interface Agent",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:3000","http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for pipeline tracking
pipeline_sessions: Dict[str, Dict[str, Any]] = {}

# Initialize agent service
agent_service = AgentService()

# --- FIX: define coral_session globally ---
coral_session: Optional[Dict[str, Any]] = None


@app.on_event("startup")
async def startup_event():
    """Initialize the agent service on startup"""
    global coral_session
    try:
        coral_session = await coral_service.create_session_from_file(
            "session/data.json", "startup"
        )
        logger.info(f"Coral session created: {coral_session}")
    except Exception as e:
        logger.error(f"Failed to initialize Coral session: {e}")
        coral_session = None


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "RegiSphere Backend API is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    agent_status = await agent_service.check_health()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agent_service": agent_status,
    }


@app.post("/api/projects/upload")
async def upload_project(project: ProjectUpload, background_tasks: BackgroundTasks):
    """Upload project, create Coral session, and immediately create a thread"""
    try:
        # Generate session ID
        session_id = str(uuid.uuid4())

        # Initialize pipeline session
        pipeline_sessions[session_id] = {
            "project": project.model_dump(),
            "status": "initialized",
            "steps": [
                {"id": "1", "name": "Repo Understanding Agent", "status": "pending", "message": "Waiting to start..."},
                {"id": "2", "name": "Compliance Rules Checker", "status": "pending", "message": "Waiting to start..."},
                {"id": "3", "name": "Risk Analyzer", "status": "pending", "message": "Waiting to start..."},
                {"id": "4", "name": "Report Generator", "status": "pending", "message": "Waiting to start..."},
            ],
            "created_at": datetime.now().isoformat(),
        }

        # Start background processing
        background_tasks.add_task(process_project_pipeline, session_id, project)

        print("project noew", project)
        try:
            # Create session Coral from file
            session = await coral_service.create_session_from_file(
                "session/data.json", session_id
            )
            coral = coral_service.get_coral_server_info()

            thread = await coral_service.create_thread(
                coral["application_id"],
                coral["privacy_key"],
                session["sessionId"],
                "interface",
                "Project Initialization Thread",
                ["interface", "github"],
            )

            # Send message to interface
            await coral_service.send_message(
                coral_session_id=session["sessionId"],  # <-- use session id directly
                thread_id=thread["id"],
                application_id=coral["application_id"],       # <-- added
                privacy_key=coral["privacy_key"],
                content=(
                    f"📢 New project uploaded for compliance assessment\n\n"
                    f"**Project Name:** {project.projectName}\n"
                    f"**Project Type:** {project.projectType}\n"
                    f"**Description:** {project.projectDescription or 'No description provided'}\n"
                    f"**Repository URL:** {project.projectUrl}\n\n"
                    "🔍 Task: Perform a **comprehensive KYC/AML compliance assessment** of this repository.\n\n"
                    "The assessment should include:\n"
                    "1. Identification of potential KYC-related risks in the repo\n"
                    "2. AML policy alignment and any gaps found\n"
                    "3. Code, documentation, and configuration review for compliance\n"
                    "4. Risk scoring (low / medium / high)\n"
                    "5. Recommended remediation steps\n"
                    "6. References to relevant standards/regulations\n\n"
                    "Please return the results in a structured compliance report."
                ),
                mentions=["interface"],
                debug_agent_id="interface", 
            )

            return {
                "session_id": session["sessionId"],
                "thread_id": thread["id"],
                "content": "Project uploaded, session and thread created successfully.",
                "status": "processing",
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"Error uploading project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/pipeline/{session_id}/status")
async def get_pipeline_status(session_id: str):
    """Get current pipeline status"""
    if session_id not in pipeline_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = pipeline_sessions[session_id]

    return {
        "session_id": session_id,
        "status": session["status"],
        "steps": session["steps"],
        "progress": calculate_progress(session["steps"]),
    }


@app.get("/api/pipeline/{session_id}/report")
async def get_compliance_report(session_id: str):
    """Get final compliance report"""
    if session_id not in pipeline_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = pipeline_sessions[session_id]
    if session["status"] != "completed":
        raise HTTPException(status_code=400, detail="Pipeline not completed yet")

    return session.get("report", {"message": "Report generation in progress"})


@app.get("/api/agents/status")
async def get_agents_status():
    """Get status of all connected agents"""
    try:
        status = await agent_service.get_agents_status()
        return status
    except Exception as e:
        logger.error(f"Error getting agents status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_project_pipeline(session_id: str, project: ProjectUpload):
    """Background task to process project through the Interface agent"""
    try:
        logger.info(f"Starting compliance assessment for session {session_id}")
        session = pipeline_sessions[session_id]
        session["status"] = "processing"

        logger.info(
            f"Sending repository {project.projectUrl} to Interface Agent for comprehensive compliance assessment"
        )
        await update_step_status(session_id, "1", "running", "Interface Agent analyzing repository...")
        await update_step_status(session_id, "2", "running", "FirecrawlMCP fetching compliance standards...")
        await update_step_status(session_id, "3", "running", "OpenDeepResearch conducting analysis...")
        await update_step_status(session_id, "4", "running", "RepoUnderstanding processing codebase...")

        compliance_report = await agent_service.query_agent(project.projectUrl)

        logger.info("Interface Agent completed comprehensive analysis")
        await update_step_status(session_id, "1", "done", "Repository structure analyzed")
        await update_step_status(session_id, "2", "done", "Compliance standards identified")
        await update_step_status(session_id, "3", "done", "Risk assessment completed")
        await update_step_status(session_id, "4", "done", "Comprehensive report generated")

        session["status"] = "completed"
        session["report"] = {
            "content": compliance_report,
            "generated_at": datetime.now().isoformat(),
            "repository_url": project.projectUrl,
            "project_type": project.projectType,
        }
        session["completed_at"] = datetime.now().isoformat()

    except Exception as e:
        logger.error(f"Error in pipeline processing for session {session_id}: {e}")
        session = pipeline_sessions.get(session_id, {})
        session["status"] = "error"
        session["error"] = str(e)


async def update_step_status(session_id: str, step_id: str, status: str, message: str):
    """Update the status of a specific pipeline step"""
    if session_id in pipeline_sessions:
        for step in pipeline_sessions[session_id]["steps"]:
            if step["id"] == step_id:
                step["status"] = status
                step["message"] = message
                break


def calculate_progress(steps: List[Dict[str, Any]]) -> int:
    """Calculate overall progress percentage"""
    completed = sum(1 for step in steps if step["status"] == "done")
    return int((completed / len(steps)) * 100) if steps else 0


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
