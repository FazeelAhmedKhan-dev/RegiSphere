# RegiSphere Backend API

FastAPI backend service that connects the RegiSphere frontend with the Coral Interface Agent for compliance analysis.

## Features

- **Project Upload**: Accept project details and repository URLs
- **Pipeline Management**: Track compliance analysis progress through multiple agents
- **Agent Integration**: Interface with Coral Interface Agent for analysis
- **Real-time Status**: WebSocket-like status updates for pipeline progress
- **Report Generation**: Generate comprehensive compliance reports

## API Endpoints

### Core Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/projects/upload` - Upload project for analysis
- `GET /api/pipeline/{session_id}/status` - Get pipeline status
- `GET /api/pipeline/{session_id}/report` - Get compliance report
- `GET /api/agents/status` - Get agent status

### Request/Response Models

#### Project Upload
```json
{
  "projectName": "My Web App",
  "projectType": "web-app",
  "projectDescription": "A modern web application",
  "projectUrl": "https://github.com/user/repo.git"
}
```

#### Pipeline Status
```json
{
  "session_id": "uuid",
  "status": "processing",
  "steps": [
    {
      "id": "1",
      "name": "Repo Understanding Agent",
      "status": "done",
      "message": "Repository analysis completed"
    }
  ],
  "progress": 25
}
```

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create a `.env` file:
   ```
   CORAL_AGENT_PATH=d:\RegiSphere\Coral-Agents\Coral-Interface-Agent
   AGENT_URL=http://localhost:8001
   ```

3. **Run the Server**
   ```bash
   python main.py
   ```
   
   Or with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Architecture

### Components

1. **FastAPI Application** (`main.py`)
   - Main application with CORS configuration
   - Route definitions and middleware
   - Background task management

2. **Agent Service** (`services/agent_service.py`)
   - Manages communication with Coral Interface Agent
   - Handles agent lifecycle and health checks
   - Processes analysis requests

3. **Data Models** (`models/project.py`)
   - Pydantic models for request/response validation
   - Type definitions for pipeline and agent data

### Pipeline Flow

1. **Project Upload**: Frontend submits project details
2. **Session Creation**: Backend creates unique session ID
3. **Background Processing**: Agents process project through pipeline:
   - Repo Understanding Agent
   - Compliance Rules Checker
   - Risk Analyzer
   - Report Generator
4. **Status Updates**: Frontend polls for progress updates
5. **Report Delivery**: Final compliance report generated

## Integration with Frontend

The backend is designed to work with the React frontend running on `http://localhost:5173`. CORS is configured to allow requests from the frontend.

### Frontend Integration Points

- Upload form submits to `/api/projects/upload`
- Pipeline component polls `/api/pipeline/{session_id}/status`
- Report component fetches from `/api/pipeline/{session_id}/report`

## Agent Communication

The backend communicates with the Coral Interface Agent through:

1. **Process Management**: Starts/stops agent processes
2. **Health Monitoring**: Checks agent availability
3. **Query Interface**: Sends analysis requests to agents
4. **Response Processing**: Handles agent responses and errors

## Development

### Running in Development Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Testing

The API can be tested using the interactive documentation or tools like curl/Postman.

Example curl command:
```bash
curl -X POST "http://localhost:8000/api/projects/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Project",
    "projectType": "web-app",
    "projectUrl": "https://github.com/user/repo.git"
  }'
```

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (422)
- Not found errors (404)
- Internal server errors (500)
- Agent communication errors

All errors return structured JSON responses with error details and timestamps.