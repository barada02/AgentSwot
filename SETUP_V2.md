# AgentSwot V2.0 - Setup Instructions

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd agentsvertex
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies  
```bash
cd Client
npm install
```

### 3. Environment Configuration

#### Backend Environment (`agentsvertex/.env`)
```env
# MongoDB Atlas Configuration
MONGODB_URI=your_mongodb_connection_string
DB_NAME=agentswot

# ADK Server Configuration  
ADK_BASE_URL=http://127.0.0.1:8000

# Storage Server Configuration
STORAGE_SERVER_HOST=0.0.0.0
STORAGE_SERVER_PORT=8001

# Environment
ENVIRONMENT=development
```

#### Frontend Environment (`Client/.env`)
```env
# Storage Server Configuration (Backend)
VITE_STORAGE_API_URL=http://127.0.0.1:8001

# Environment
VITE_APP_ENV=development

# Optional: For development debugging
VITE_API_TIMEOUT=120000
```

### 4. Start Servers

#### Terminal 1: Start ADK Server
```bash
cd agentsvertex
adk api_server
```

#### Terminal 2: Start Storage Server
```bash
cd agentsvertex  
python storage_server.py
```

#### Terminal 3: Start React Frontend
```bash
cd Client
npm run dev
```

## 🌐 Service URLs

- **React Frontend**: http://localhost:5173
- **Storage Server**: http://localhost:8001
- **Storage API Docs**: http://localhost:8001/docs
- **ADK Server**: http://localhost:8000

## 🏗️ Architecture

```
React Frontend (5173) ←→ Storage Server (8001) ←→ ADK Server (8000)
                                 ↓
                            MongoDB Atlas
```

## ✅ Health Check

Visit: http://localhost:8001/health

This will show the status of:
- MongoDB connection
- ADK server connection  
- All database collections

## 🔧 New Features

- **Single API**: React only communicates with Storage Server
- **Auto-storage**: All conversations automatically saved
- **Rich Data**: Separate collections for infographics and grounding chunks
- **Health Monitoring**: Real-time service status
- **Clean Architecture**: Proper separation of concerns