# MongoDB Storage FastAPI Server
# Standalone server for AgentSwot storage operations
# Run this separately from your ADK server

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import pymongo
from pymongo import MongoClient
from bson import ObjectId
import os
import uvicorn

# MongoDB Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://chandanbarada727_db_user:chandanbarada727@a0.emc8jsx.mongodb.net/?retryWrites=true&w=majority&appName=A0")
DB_NAME = os.getenv("DB_NAME", "agentswot")

# Initialize FastAPI app
app = FastAPI(
    title="AgentSwot Storage API",
    description="MongoDB storage service for AgentSwot application",
    version="1.0.0"
)

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# Collections
sessions_collection = db.sessions
messages_collection = db.messages
infographics_collection = db.infographics

# Pydantic models
class SessionCreate(BaseModel):
    sessionId: str
    userId: str
    appName: str
    title: Optional[str] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class SessionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    lastActivity: Optional[str] = None
    updatedAt: Optional[str] = None
    hasInfographics: Optional[bool] = None

class MessageCreate(BaseModel):
    sessionId: str
    messageId: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: int
    infographics: Optional[List[Dict[str, Any]]] = None
    tokens: Optional[int] = None

class InfographicCreate(BaseModel):
    sessionId: str
    messageId: str
    type: str
    data: Dict[str, Any]

class InfographicsCreate(BaseModel):
    infographics: List[InfographicCreate]

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def serialize_docs(docs):
    """Convert list of MongoDB documents to JSON serializable format"""
    return [serialize_doc(doc) for doc in docs]

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AgentSwot Storage API",
        "version": "1.0.0",
        "status": "running",
        "database": DB_NAME
    }

# Health check
@app.get("/storage/health")
async def storage_health():
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return {
            "status": "healthy",
            "message": "MongoDB storage service is operational",
            "database": DB_NAME,
            "collections": {
                "sessions": sessions_collection.estimated_document_count(),
                "messages": messages_collection.estimated_document_count(),
                "infographics": infographics_collection.estimated_document_count(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage service unavailable: {str(e)}")

# Session endpoints
@app.post("/storage/sessions")
async def create_session(session: SessionCreate):
    try:
        now = datetime.utcnow().isoformat()
        session_doc = {
            "sessionId": session.sessionId,
            "userId": session.userId,
            "appName": session.appName,
            "title": session.title or f"Analysis {datetime.now().strftime('%m/%d/%Y')}",
            "status": "active",
            "createdAt": now,
            "updatedAt": now,
            "lastActivity": now,
            "messageCount": 0,
            "hasInfographics": False,
            "tags": session.tags,
            "metadata": session.metadata
        }
        
        result = sessions_collection.insert_one(session_doc)
        session_doc["_id"] = str(result.inserted_id)
        
        return session_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.get("/storage/sessions/{session_id}")
async def get_session(session_id: str):
    try:
        session = sessions_collection.find_one({"sessionId": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return serialize_doc(session)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

@app.get("/storage/sessions")
async def get_all_sessions(userId: Optional[str] = None):
    try:
        query = {"userId": userId} if userId else {}
        sessions = list(sessions_collection.find(query).sort("lastActivity", -1))
        return serialize_docs(sessions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@app.patch("/storage/sessions/{session_id}")
async def update_session(session_id: str, updates: SessionUpdate):
    try:
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        
        result = sessions_collection.update_one(
            {"sessionId": session_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        updated_session = sessions_collection.find_one({"sessionId": session_id})
        return serialize_doc(updated_session)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update session: {str(e)}")

# Message endpoints
@app.post("/storage/messages")
async def save_message(message: MessageCreate):
    try:
        message_doc = message.dict()
        message_doc["createdAt"] = datetime.utcnow().isoformat()
        
        result = messages_collection.insert_one(message_doc)
        message_doc["_id"] = str(result.inserted_id)
        
        # Update session message count
        sessions_collection.update_one(
            {"sessionId": message.sessionId},
            {
                "$inc": {"messageCount": 1},
                "$set": {
                    "lastActivity": datetime.utcnow().isoformat(),
                    "updatedAt": datetime.utcnow().isoformat()
                }
            }
        )
        
        return message_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")

@app.get("/storage/messages/{session_id}")
async def get_session_messages(session_id: str):
    try:
        messages = list(messages_collection.find({"sessionId": session_id}).sort("timestamp", 1))
        return serialize_docs(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

# Infographic endpoints
@app.post("/storage/infographics")
async def save_infographics(infographics_data: InfographicsCreate):
    try:
        now = datetime.utcnow().isoformat()
        infographic_docs = []
        
        for infographic in infographics_data.infographics:
            doc = infographic.dict()
            doc["createdAt"] = now
            infographic_docs.append(doc)
        
        if infographic_docs:
            result = infographics_collection.insert_many(infographic_docs)
            for i, doc in enumerate(infographic_docs):
                doc["_id"] = str(result.inserted_ids[i])
            
            # Update session to mark it has infographics
            if infographic_docs:
                sessions_collection.update_one(
                    {"sessionId": infographic_docs[0]["sessionId"]},
                    {"$set": {"hasInfographics": True}}
                )
        
        return infographic_docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save infographics: {str(e)}")

@app.get("/storage/infographics/{session_id}")
async def get_session_infographics(session_id: str):
    try:
        infographics = list(infographics_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        return serialize_docs(infographics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get infographics: {str(e)}")

# Export endpoint
@app.get("/storage/export/{session_id}")
async def export_session(session_id: str):
    try:
        session = sessions_collection.find_one({"sessionId": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = list(messages_collection.find({"sessionId": session_id}).sort("timestamp", 1))
        infographics = list(infographics_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        
        return {
            "session": serialize_doc(session),
            "messages": serialize_docs(messages),
            "infographics": serialize_docs(infographics),
            "exportedAt": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export session: {str(e)}")

# Stats endpoint
@app.get("/storage/stats")
async def get_storage_stats():
    try:
        total_sessions = sessions_collection.estimated_document_count()
        total_messages = messages_collection.estimated_document_count()
        total_infographics = infographics_collection.estimated_document_count()
        
        # Get recent sessions
        recent_sessions = list(sessions_collection.find().sort("lastActivity", -1).limit(1))
        last_activity = recent_sessions[0]["lastActivity"] if recent_sessions else None
        
        return {
            "totalSessions": total_sessions,
            "totalMessages": total_messages,
            "totalInfographics": total_infographics,
            "lastActivity": last_activity,
            "database": DB_NAME
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get storage stats: {str(e)}")

# Search endpoint
@app.post("/storage/search/sessions")
async def search_sessions(search_request: SearchRequest):
    try:
        query = search_request.query
        filters = search_request.filters or {}
        
        # Build MongoDB search query
        search_query = {}
        
        # Text search
        if query:
            search_query["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"tags": {"$regex": query, "$options": "i"}},
                {"metadata.firstUserMessage": {"$regex": query, "$options": "i"}}
            ]
        
        # Apply filters
        if filters.get("status"):
            search_query["status"] = filters["status"]
        if filters.get("userId"):
            search_query["userId"] = filters["userId"]
        if filters.get("hasInfographics") is not None:
            search_query["hasInfographics"] = filters["hasInfographics"]
        
        sessions = list(sessions_collection.find(search_query).sort("lastActivity", -1))
        return serialize_docs(sessions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search sessions: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting AgentSwot Storage API Server...")
    print(f"📊 Database: {DB_NAME}")
    print("🌐 Server will be available at: http://localhost:8001")
    print("📚 API docs will be available at: http://localhost:8001/docs")
    
    uvicorn.run(
        "storage_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )