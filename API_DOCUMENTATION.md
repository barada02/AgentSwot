# 📡 AgentSwot API Documentation

> Comprehensive API reference for the AgentSwot Storage & Integration Server

## 🏗️ API Architecture

The AgentSwot API follows a **microservices architecture** where the Storage Server acts as an intelligent middleware layer:

```
React Frontend ←→ Storage Server (Port 8001) ←→ ADK Server (Port 8000)
                        ↓
                  MongoDB Atlas
```

## 🔗 Base URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Storage API** | `http://localhost:8001` | Main API endpoint |
| **API Documentation** | `http://localhost:8001/docs` | Interactive Swagger UI |
| **Health Check** | `http://localhost:8001/health` | System status |
| **ADK Server** | `http://localhost:8000` | Internal AI service |

## 🔐 Authentication

All protected endpoints require JWT authentication:

```bash
Authorization: Bearer <jwt_token>
```

### Authentication Flow
1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` 
3. **Use Token**: Include in `Authorization` header
4. **Refresh**: `POST /auth/refresh` (when implemented)

---

## 📋 API Endpoints

### 🔓 Public Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "adk": {
      "status": "connected", 
      "url": "http://127.0.0.1:8000"
    },
    "mongodb": {
      "status": "connected",
      "database": "agentswot",
      "collections": {
        "users": 150,
        "sessions": 1250,
        "messages": 8900,
        "infographics": 450
      }
    }
  }
}
```

#### Root Endpoint
```http
GET /
```

**Response:**
```json
{
  "message": "AgentSwot Storage & Integration API",
  "version": "2.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

### 🔐 Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com", 
    "full_name": "John Doe",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as registration response

### 🎯 Session Management

#### Create Session
```http
POST /sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "app_name": "multi_tool_agent"
}
```

**Response:**
```json
{
  "session_id": "sess_1705312200318",
  "adk_session": {
    "id": "sess_1705312200318",
    "appName": "multi_tool_agent", 
    "userId": "user_507f1f77bcf86cd799439011",
    "state": {},
    "events": [],
    "lastUpdateTime": 1705312200.318
  },
  "mongodb_session": {
    "session_id": "sess_1705312200318",
    "user_id": "507f1f77bcf86cd799439011",
    "app_name": "multi_tool_agent", 
    "created_at": "2024-01-15T10:30:00Z",
    "last_updated": "2024-01-15T10:30:00Z",
    "is_active": true
  }
}
```

#### Get Session Details
```http
GET /sessions/{session_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "sess_1705312200318",
  "user_id": "507f1f77bcf86cd799439011", 
  "app_name": "multi_tool_agent",
  "created_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-15T10:30:00Z",
  "is_active": true,
  "message_count": 15,
  "infographic_count": 3
}
```

#### Delete Session
```http
DELETE /sessions/{session_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Session and all related data deleted successfully",
  "session_id": "sess_1705312200318",
  "deleted_items": {
    "messages": 15,
    "infographics": 3,
    "grounding_chunks": 8
  }
}
```

### 💬 Chat & Messaging

#### Send Message
```http
POST /chat
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "session_id": "sess_1705312200318",
  "message": "I want to launch a healthy fruit jar product for busy professionals",
  "app_name": "multi_tool_agent"
}
```

**Response:**
```json
{
  "message_id": "msg_1705312250123",
  "session_id": "sess_1705312200318",
  "user_message": {
    "message_id": "msg_1705312250122",
    "role": "user",
    "content": "I want to launch a healthy fruit jar product...",
    "timestamp": 1705312250122
  },
  "agent_response": {
    "message_id": "msg_1705312250123", 
    "role": "assistant",
    "content": "Great idea! To provide a comprehensive SWOT analysis...",
    "timestamp": 1705312250123,
    "metadata": {
      "token_count": 245,
      "processing_time": 2.3,
      "model": "gemini-2.0-flash-001"
    }
  },
  "infographics": [],
  "grounding_chunks": [
    {
      "chunk_id": "chunk_1705312250124",
      "source": "google_search",
      "title": "Healthy Snack Market Trends 2024",
      "url": "https://example.com/market-report",
      "content": "The healthy snack market is experiencing...",
      "relevance_score": 0.89
    }
  ]
}
```

#### Get Conversation History
```http
GET /conversations/{session_id}
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 100)
- `offset` (optional): Number of messages to skip (default: 0)
- `include_infographics` (optional): Include infographic data (default: true)

**Response:**
```json
{
  "session_id": "sess_1705312200318",
  "total_messages": 15,
  "returned_messages": 15,
  "messages": [
    {
      "message_id": "msg_1705312250122",
      "role": "user", 
      "content": "I want to launch a healthy fruit jar product...",
      "timestamp": 1705312250122
    },
    {
      "message_id": "msg_1705312250123",
      "role": "assistant",
      "content": "Great idea! To provide a comprehensive SWOT analysis...",
      "timestamp": 1705312250123,
      "metadata": {
        "token_count": 245,
        "processing_time": 2.3
      }
    }
  ],
  "infographics": [
    {
      "infographic_id": "infog_1705312260125",
      "message_id": "msg_1705312260125", 
      "html_code": "<!DOCTYPE html><html>...",
      "title": "SWOT Analysis: Healthy Fruit Jars",
      "created_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

### 📊 Data Retrieval

#### Get Session Infographics
```http
GET /sessions/{session_id}/infographics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "sess_1705312200318",
  "total_infographics": 3,
  "infographics": [
    {
      "infographic_id": "infog_1705312260125",
      "message_id": "msg_1705312260125",
      "title": "SWOT Analysis: Healthy Fruit Jars", 
      "html_code": "<!DOCTYPE html><html>...",
      "created_at": "2024-01-15T10:31:00Z",
      "size_bytes": 15420
    }
  ]
}
```

#### Get Grounding Data
```http
GET /sessions/{session_id}/grounding
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "sess_1705312200318",
  "total_chunks": 8,
  "grounding_chunks": [
    {
      "chunk_id": "chunk_1705312250124",
      "message_id": "msg_1705312250123",
      "source": "google_search",
      "title": "Healthy Snack Market Trends 2024",
      "url": "https://example.com/market-report", 
      "content": "The healthy snack market is experiencing...",
      "relevance_score": 0.89,
      "timestamp": 1705312250124
    }
  ]
}
```

#### Export Session Data
```http
GET /export/{session_id}
Authorization: Bearer <token>
```

**Query Parameters:**
- `format` (optional): Export format - "json" | "html" (default: "json")
- `include_infographics` (optional): Include infographic data (default: true)

**Response (JSON format):**
```json
{
  "session": {
    "session_id": "sess_1705312200318",
    "user_id": "507f1f77bcf86cd799439011",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "messages": [...],
  "infographics": [...],
  "grounding_chunks": [...],
  "export_metadata": {
    "export_time": "2024-01-15T11:30:00Z",
    "format": "json",
    "total_items": 26
  }
}
```

---

## 📝 Request/Response Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}
```

### Session Model
```typescript
interface Session {
  session_id: string;
  user_id: string;
  app_name: string;
  created_at: string;
  last_updated: string;
  is_active: boolean;
  message_count?: number;
  infographic_count?: number;
}
```

### Message Model
```typescript
interface Message {
  message_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: {
    token_count?: number;
    processing_time?: number;
    model?: string;
  };
}
```

### Infographic Model
```typescript
interface Infographic {
  infographic_id: string;
  session_id: string;
  message_id: string;
  title?: string;
  html_code: string;
  created_at: string;
  size_bytes?: number;
}
```

### Grounding Chunk Model
```typescript
interface GroundingChunk {
  chunk_id: string;
  session_id: string;
  message_id: string;
  source: string;
  title?: string;
  url?: string;
  content: string;
  relevance_score?: number;
  timestamp: number;
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "detail": "Error description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

| Code | Description | Example |
|------|-------------|---------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created (session, user) |
| `400` | Bad Request | Invalid request body or parameters |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | User doesn't have permission |
| `404` | Not Found | Session or resource doesn't exist |
| `409` | Conflict | Email already exists (registration) |
| `422` | Validation Error | Request validation failed |
| `500` | Server Error | Internal server error |
| `502` | Bad Gateway | ADK server unavailable |
| `503` | Service Unavailable | MongoDB connection failed |

### Error Examples

**Authentication Error:**
```json
{
  "detail": "Invalid authentication credentials",
  "error_code": "INVALID_TOKEN",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Service Unavailable:**
```json
{
  "detail": "ADK server is currently unavailable",
  "error_code": "ADK_CONNECTION_ERROR", 
  "timestamp": "2024-01-15T10:30:00Z",
  "retry_after": 30
}
```

---

## 🔧 SDK & Integration

### JavaScript/TypeScript SDK Example

```typescript
import axios from 'axios';

class AgentSwotAPI {
  private baseURL: string;
  private token?: string;

  constructor(baseURL = 'http://localhost:8001') {
    this.baseURL = baseURL;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email, password
    });
    this.token = response.data.access_token;
    return response.data;
  }

  // Session management
  async createSession(appName = 'multi_tool_agent') {
    return await this.request('POST', '/sessions', { app_name: appName });
  }

  async sendMessage(sessionId: string, message: string) {
    return await this.request('POST', '/chat', {
      session_id: sessionId,
      message,
      app_name: 'multi_tool_agent'
    });
  }

  async getConversation(sessionId: string) {
    return await this.request('GET', `/conversations/${sessionId}`);
  }

  // Helper method
  private async request(method: string, endpoint: string, data?: any) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      data
    };
    
    const response = await axios(config);
    return response.data;
  }
}

// Usage
const api = new AgentSwotAPI();
await api.login('user@example.com', 'password');
const session = await api.createSession();
const response = await api.sendMessage(session.session_id, 'Analyze my startup idea');
```

### Python SDK Example

```python
import requests
import json

class AgentSwotAPI:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def login(self, email: str, password: str):
        response = self.session.post(f"{self.base_url}/auth/login", json={
            "email": email,
            "password": password
        })
        response.raise_for_status()
        
        data = response.json()
        self.token = data["access_token"]
        self.session.headers.update({
            "Authorization": f"Bearer {self.token}"
        })
        return data
    
    def create_session(self, app_name="multi_tool_agent"):
        response = self.session.post(f"{self.base_url}/sessions", json={
            "app_name": app_name
        })
        response.raise_for_status()
        return response.json()
    
    def send_message(self, session_id: str, message: str):
        response = self.session.post(f"{self.base_url}/chat", json={
            "session_id": session_id,
            "message": message,
            "app_name": "multi_tool_agent"
        })
        response.raise_for_status()
        return response.json()

# Usage
api = AgentSwotAPI()
api.login("user@example.com", "password")
session = api.create_session()
response = api.send_message(session["session_id"], "Analyze my startup idea")
```

---

## 📚 Additional Resources

- **Interactive API Documentation**: http://localhost:8001/docs
- **Health Monitoring**: http://localhost:8001/health
- **GitHub Repository**: https://github.com/barada02/AgentSwot
- **Setup Guide**: [SETUP_V2.md](./SETUP_V2.md)
- **Architecture Overview**: [NEW_ARCHITECTURE_V2.md](./NEW_ARCHITECTURE_V2.md)

---

*For more detailed information, visit the interactive Swagger documentation at `/docs` when the server is running.*