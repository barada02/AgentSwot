# AgentSwot MongoDB Integration - Clean Architecture

## System Architecture

```
Frontend (Port 5173)
    ↓ ← AI Chat interactions
    ↓ ← Storage operations (parallel)
    ↓
ADK Server (Port 8000)    Storage Server (Port 8001)
    ↓                           ↓
AI Agent Processing          MongoDB Atlas
```

## Data Flow

### 1. Session Creation
- Frontend → ADK Server: Create AI session
- Frontend → Storage Server: Create MongoDB session (parallel)

### 2. Message Processing
- Frontend → ADK Server: Send user message
- ADK Server → Frontend: Return AI response
- Frontend → Storage Server: Auto-save both messages to MongoDB

### 3. Data Retrieval
- Frontend → Storage Server: Get session history
- Frontend → Storage Server: Get stored infographics
- Frontend → Storage Server: Search past sessions

## Server Setup

### ADK Server (Existing)
```bash
cd agentsvertex
adk api_server
# Runs on port 8000
```

### Storage Server (New)
```bash
cd agentsvertex
pip install -r storage_requirements.txt
python storage_server.py
# Runs on port 8001
```

## Key Components

### Frontend Hooks
- `useApiWithStorage()` - Enhanced API hook with auto-storage
- `useMongoDBStorage()` - Direct MongoDB operations

### Backend Services
- `storage_server.py` - Standalone FastAPI server for MongoDB
- ADK server - Unchanged, handles AI interactions

## Environment Variables

```env
# ADK Server
VITE_API_BASE_URL=http://127.0.0.1:8000

# Storage Server  
VITE_STORAGE_API_URL=http://127.0.0.1:8001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...
DB_NAME=agentswot
```

## Integration Features

✅ **Auto-save conversations** - Messages saved after ADK responses
✅ **Session history** - Browse past analyses from MongoDB
✅ **Infographic gallery** - Store and retrieve visualizations  
✅ **Export features** - Download complete session data
✅ **Search functionality** - Find past sessions by content
✅ **Parallel processing** - No impact on ADK performance

## Testing

1. Start both servers (ADK + Storage)
2. Go to Dashboard → MongoDB Integration Test
3. Run "Test Complete Integration"
4. Verify all connections and data flow

The architecture is now clean with proper separation of concerns:
- ADK handles AI processing
- Storage server handles data persistence
- Frontend orchestrates both services