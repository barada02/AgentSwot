# AgentSwot Storage Server - Intelligent Middleware
# Handles ADK integration and MongoDB storage
# Single API layer for React frontend

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient
from bson import ObjectId
import os
import uvicorn
import httpx
import asyncio
import json
import re
import jwt
import bcrypt
from urllib.parse import urljoin
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://chandanbarada727_db_user:chandanbarada727@a0.emc8jsx.mongodb.net/?retryWrites=true&w=majority&appName=A0")
DB_NAME = os.getenv("DB_NAME", "agentswot")
ADK_BASE_URL = os.getenv("ADK_BASE_URL", "http://127.0.0.1:8000")
STORAGE_SERVER_HOST = os.getenv("STORAGE_SERVER_HOST", "0.0.0.0")
STORAGE_SERVER_PORT = int(os.getenv("STORAGE_SERVER_PORT", "8001"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_super_secret_jwt_key_change_in_production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Initialize FastAPI app
app = FastAPI(
    title="AgentSwot Storage & Integration API",
    description="Intelligent middleware for ADK integration and MongoDB storage",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

# Collections - Extended structure with user management
users_collection = db.users
sessions_collection = db.sessions
conversations_collection = db.conversations
infographics_collection = db.infographics
grounding_chunks_collection = db.grounding_chunks

# HTTP client for ADK communication
adk_client = httpx.AsyncClient(timeout=120.0)

# Security
security = HTTPBearer()

# ========================
# PYDANTIC MODELS
# ========================

# Authentication Models
class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    createdAt: str
    lastLogin: Optional[str] = None
    sessionCount: int = 0

class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    tokenType: str = "bearer"

# Request Models
class CreateSessionRequest(BaseModel):
    userId: str
    sessionId: str
    appName: str = "multi_tool_agent"

class SendMessageRequest(BaseModel):
    sessionId: str
    userId: str
    appName: str = "multi_tool_agent"
    message: str

# Response Models
class SessionResponse(BaseModel):
    sessionId: str
    userId: str
    appName: str
    status: str
    createdAt: str
    lastActivity: str
    messageCount: int
    hasInfographics: bool
    adkSessionData: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    messageId: str
    sessionId: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float
    tokens: Optional[int] = None
    infographicsCount: int = 0
    groundingChunksCount: int = 0

class ConversationResponse(BaseModel):
    sessionId: str
    messages: List[MessageResponse]
    totalMessages: int
    hasInfographics: bool

class InfographicResponse(BaseModel):
    id: str
    sessionId: str
    messageId: str
    contentType: str
    htmlCode: str
    createdAt: str

class GroundingChunkResponse(BaseModel):
    id: str
    sessionId: str
    messageId: str
    title: str
    url: str
    snippet: str
    createdAt: str

# ========================
# AUTHENTICATION HELPERS
# ========================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    # Get user from database
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return serialize_doc(user)

# ========================
# HELPER FUNCTIONS
# ========================

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def serialize_docs(docs):
    """Convert list of MongoDB documents to JSON serializable format"""
    return [serialize_doc(doc) for doc in docs]

def extract_infographics_from_text(text: str) -> List[Dict[str, Any]]:
    """Extract infographic JSON from text content"""
    infographics = []
    
    # Pattern to match JSON blocks with infographic content
    json_pattern = r'```json\s*\n?\s*(\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\})\s*\n?\s*```'
    matches = re.findall(json_pattern, text, re.IGNORECASE)
    
    for i, match in enumerate(matches):
        try:
            parsed = json.loads(match)
            if parsed.get("contenttype") == "infographic" and "code" in parsed:
                infographics.append({
                    "id": f"infographic_{i}_{int(datetime.now().timestamp() * 1000)}",
                    "contentType": "infographic",
                    "htmlCode": clean_html_code(parsed["code"]),
                    "rawCode": parsed["code"]
                })
        except json.JSONDecodeError:
            continue
    
    return infographics

def clean_html_code(html_code: str) -> str:
    """Clean HTML code by removing escape sequences"""
    if not html_code:
        return ""
    
    return html_code.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"').replace('\\\\', '\\').strip()

def extract_grounding_chunks(grounding_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract grounding chunks from ADK response metadata"""
    chunks = []
    
    # Extract from searchEntryPoint if available
    if "searchEntryPoint" in grounding_metadata:
        search_entry = grounding_metadata["searchEntryPoint"]
        if "renderedContent" in search_entry:
            # Extract links from rendered content
            link_pattern = r'href="([^"]*)"[^>]*>([^<]*)</a>'
            matches = re.findall(link_pattern, search_entry["renderedContent"])
            
            for i, (url, title) in enumerate(matches):
                chunks.append({
                    "id": f"grounding_{i}_{int(datetime.now().timestamp() * 1000)}",
                    "title": title.strip(),
                    "url": url,
                    "snippet": f"Referenced in search: {title}"
                })
    
    # Extract from webSearchQueries if available
    if "webSearchQueries" in grounding_metadata:
        for i, query in enumerate(grounding_metadata["webSearchQueries"]):
            chunks.append({
                "id": f"search_query_{i}_{int(datetime.now().timestamp() * 1000)}",
                "title": f"Search Query: {query}",
                "url": "",
                "snippet": f"AI searched for: {query}"
            })
    
    return chunks

def clean_text_from_infographics(text: str) -> str:
    """Remove infographic JSON blocks from text"""
    json_pattern = r'```json\s*\n?\s*\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\}\s*\n?\s*```'
    return re.sub(json_pattern, '', text, flags=re.IGNORECASE).strip()

async def check_adk_health() -> bool:
    """Check if ADK server is running"""
    try:
        response = await adk_client.get(f"{ADK_BASE_URL}/list-apps")
        return response.status_code == 200
    except Exception:
        return False

# ========================
# API ENDPOINTS - ADK INTEGRATION
# ========================

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "AgentSwot Storage & Integration API",
        "version": "2.0.0",
        "status": "running",
        "adk_connected": await check_adk_health(),
        "database": DB_NAME
    }

@app.get("/health")
async def health_check():
    """Complete health check for all services"""
    try:
        # Check MongoDB
        client.admin.command('ping')
        mongo_healthy = True
    except Exception:
        mongo_healthy = False
    
    # Check ADK
    adk_healthy = await check_adk_health()
    
    return {
        "status": "healthy" if (mongo_healthy and adk_healthy) else "degraded",
        "mongodb": {
            "healthy": mongo_healthy,
            "database": DB_NAME,
            "collections": {
                "sessions": sessions_collection.estimated_document_count(),
                "conversations": conversations_collection.estimated_document_count(),
                "infographics": infographics_collection.estimated_document_count(),
                "grounding_chunks": grounding_chunks_collection.estimated_document_count(),
            } if mongo_healthy else {}
        },
        "adk": {
            "healthy": adk_healthy,
            "url": ADK_BASE_URL
        }
    }

# ========================
# AUTHENTICATION ENDPOINTS
# ========================

@app.post("/auth/register", response_model=AuthResponse)
async def register_user(request: UserRegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = users_collection.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        # Create user document
        user_doc = {
            "name": request.name,
            "email": request.email,
            "password": hashed_password,
            "createdAt": datetime.utcnow().isoformat(),
            "lastLogin": None,
            "sessionCount": 0
        }
        
        # Insert user
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Create token
        token = create_access_token({"user_id": user_id, "email": request.email})
        
        # Update last login
        users_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"lastLogin": datetime.utcnow().isoformat()}}
        )
        
        # Prepare response
        user_response = UserResponse(
            id=user_id,
            name=request.name,
            email=request.email,
            createdAt=user_doc["createdAt"],
            lastLogin=datetime.utcnow().isoformat(),
            sessionCount=0
        )
        
        return AuthResponse(user=user_response, token=token)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login", response_model=AuthResponse)
async def login_user(request: UserLoginRequest):
    """Login user and return JWT token"""
    try:
        # Find user by email
        user = users_collection.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        token = create_access_token({"user_id": str(user["_id"]), "email": user["email"]})
        
        # Update last login
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"lastLogin": datetime.utcnow().isoformat()}}
        )
        
        # Get session count
        session_count = sessions_collection.count_documents({"userId": str(user["_id"])})
        
        # Prepare response
        user_response = UserResponse(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            createdAt=user["createdAt"],
            lastLogin=datetime.utcnow().isoformat(),
            sessionCount=session_count
        )
        
        return AuthResponse(user=user_response, token=token)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    # Get session count
    session_count = sessions_collection.count_documents({"userId": current_user["_id"]})
    
    return UserResponse(
        id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        createdAt=current_user["createdAt"],
        lastLogin=current_user.get("lastLogin"),
        sessionCount=session_count
    )

# ========================
# SESSION MANAGEMENT
# ========================

@app.post("/sessions", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest, current_user: dict = Depends(get_current_user)):
    """Create a new session with ADK and store in MongoDB - User Authenticated"""
    try:
        # Verify the session is being created for the authenticated user
        if request.userId != current_user["_id"]:
            raise HTTPException(status_code=403, detail="Cannot create session for another user")
        
        # 1. Check ADK health first
        if not await check_adk_health():
            raise HTTPException(status_code=503, detail="ADK server is not available")
        
        # 2. Create session with ADK (Endpoint #2)
        adk_url = f"{ADK_BASE_URL}/apps/{request.appName}/users/{request.userId}/sessions/{request.sessionId}"
        adk_response = await adk_client.post(adk_url)
        
        if adk_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create ADK session")
        
        adk_session_data = adk_response.json()
        
        # 3. Store session in MongoDB
        now = datetime.utcnow().isoformat()
        session_doc = {
            "sessionId": request.sessionId,
            "userId": request.userId,
            "appName": request.appName,
            "status": "active",
            "createdAt": now,
            "lastActivity": now,
            "messageCount": 0,
            "hasInfographics": False,
            "adkSessionData": adk_session_data
        }
        
        sessions_collection.insert_one(session_doc)
        
        return SessionResponse(
            sessionId=request.sessionId,
            userId=request.userId,
            appName=request.appName,
            status="active",
            createdAt=now,
            lastActivity=now,
            messageCount=0,
            hasInfographics=False,
            adkSessionData=adk_session_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Get session details from MongoDB"""
    try:
        session = sessions_collection.find_one({"sessionId": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return SessionResponse(**serialize_doc(session))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

# ========================
# CHAT OPERATIONS
# ========================

@app.post("/chat", response_model=Dict[str, Any])
async def send_message(request: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    """Send message to ADK, process response, and store everything in MongoDB - User Authenticated"""
    try:
        # 1. Check if session exists and belongs to the authenticated user
        session = sessions_collection.find_one({
            "sessionId": request.sessionId,
            "userId": current_user["_id"]
        })
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or not accessible")
        
        # Verify the message is being sent by the session owner
        if request.userId != current_user["_id"]:
            raise HTTPException(status_code=403, detail="Cannot send message for another user")
        
        # 2. Send message to ADK (Endpoint #3)
        adk_run_payload = {
            "app_name": request.appName,
            "user_id": request.userId,
            "session_id": request.sessionId,
            "new_message": {
                "role": "user",
                "parts": [{"text": request.message}]
            },
            "streaming": False
        }
        
        adk_response = await adk_client.post(f"{ADK_BASE_URL}/run", json=adk_run_payload)
        
        if adk_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get ADK response")
        
        adk_data = adk_response.json()
        
        # 3. Get complete session data from ADK (Endpoint #4)
        session_url = f"{ADK_BASE_URL}/apps/{request.appName}/users/{request.userId}/sessions/{request.sessionId}"
        session_response = await adk_client.get(session_url)
        
        if session_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to get ADK session data")
        
        full_session_data = session_response.json()
        
        # 4. Process and store conversation data
        await process_and_store_conversation(request.sessionId, full_session_data, adk_data[0])
        
        # 5. Prepare response for frontend
        assistant_content = ""
        if adk_data and len(adk_data) > 0:
            response_content = adk_data[0].get("content", {})
            parts = response_content.get("parts", [])
            assistant_content = " ".join([part.get("text", "") for part in parts])
        
        # Clean text from infographics for display
        clean_content = clean_text_from_infographics(assistant_content)
        
        # Extract infographics
        infographics = extract_infographics_from_text(assistant_content)
        
        return {
            "success": True,
            "messageId": adk_data[0].get("id") if adk_data else None,
            "content": clean_content,
            "infographics": infographics,
            "timestamp": adk_data[0].get("timestamp") if adk_data else datetime.now().timestamp(),
            "tokens": adk_data[0].get("usageMetadata", {}).get("totalTokenCount") if adk_data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")

async def process_and_store_conversation(session_id: str, full_session_data: Dict[str, Any], latest_response: Dict[str, Any]):
    """Process ADK session data and store in MongoDB collections"""
    try:
        now = datetime.utcnow().isoformat()
        
        # 1. Parse conversation from ADK events
        messages = []
        events = full_session_data.get("events", [])
        
        for event in events:
            content_data = event.get("content", {})
            role = content_data.get("role", "unknown")
            parts = content_data.get("parts", [])
            text_content = " ".join([part.get("text", "") for part in parts])
            
            # Extract infographics from assistant messages
            infographics = []
            grounding_chunks = []
            
            if role == "model":  # Assistant message
                infographics = extract_infographics_from_text(text_content)
                grounding_chunks = extract_grounding_chunks(event.get("groundingMetadata", {}))
            
            message_doc = {
                "messageId": event.get("id"),
                "sessionId": session_id,
                "role": "user" if role == "user" else "assistant",
                "content": clean_text_from_infographics(text_content) if role == "model" else text_content,
                "rawContent": text_content,
                "timestamp": event.get("timestamp", datetime.now().timestamp()),
                "tokens": event.get("usageMetadata", {}).get("totalTokenCount") if role == "model" else None,
                "infographicsCount": len(infographics),
                "groundingChunksCount": len(grounding_chunks),
                "createdAt": now
            }
            
            messages.append(message_doc)
            
            # Store infographics separately
            if infographics:
                infographic_docs = []
                for infographic in infographics:
                    infographic_docs.append({
                        "infographicId": infographic["id"],
                        "sessionId": session_id,
                        "messageId": event.get("id"),
                        "contentType": infographic["contentType"],
                        "htmlCode": infographic["htmlCode"],
                        "rawCode": infographic["rawCode"],
                        "createdAt": now
                    })
                
                if infographic_docs:
                    infographics_collection.insert_many(infographic_docs)
            
            # Store grounding chunks separately
            if grounding_chunks:
                grounding_docs = []
                for chunk in grounding_chunks:
                    grounding_docs.append({
                        "chunkId": chunk["id"],
                        "sessionId": session_id,
                        "messageId": event.get("id"),
                        "title": chunk["title"],
                        "url": chunk["url"],
                        "snippet": chunk["snippet"],
                        "createdAt": now
                    })
                
                if grounding_docs:
                    grounding_chunks_collection.insert_many(grounding_docs)
        
        # 2. Store/Update conversation in MongoDB
        conversation_doc = {
            "sessionId": session_id,
            "messages": messages,
            "totalMessages": len(messages),
            "lastUpdated": now,
            "hasInfographics": any(msg["infographicsCount"] > 0 for msg in messages),
            "hasGroundingChunks": any(msg["groundingChunksCount"] > 0 for msg in messages)
        }
        
        # Upsert conversation
        conversations_collection.replace_one(
            {"sessionId": session_id},
            conversation_doc,
            upsert=True
        )
        
        # 3. Update session metadata
        sessions_collection.update_one(
            {"sessionId": session_id},
            {
                "$set": {
                    "messageCount": len(messages),
                    "hasInfographics": conversation_doc["hasInfographics"],
                    "lastActivity": now,
                    "adkSessionData": full_session_data
                }
            }
        )
        
    except Exception as e:
        print(f"Error processing conversation: {str(e)}")
        # Don't raise exception to avoid breaking the main flow

# ========================
# DATA RETRIEVAL ENDPOINTS
# ========================

@app.get("/conversations/{session_id}", response_model=ConversationResponse)
async def get_conversation(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get complete conversation for a session - User Authenticated"""
    try:
        # Verify session belongs to the authenticated user
        session = sessions_collection.find_one({
            "sessionId": session_id,
            "userId": current_user["_id"]
        })
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or not accessible")
        
        conversation = conversations_collection.find_one({"sessionId": session_id})
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        messages = [MessageResponse(**msg) for msg in conversation.get("messages", [])]
        
        return ConversationResponse(
            sessionId=session_id,
            messages=messages,
            totalMessages=len(messages),
            hasInfographics=conversation.get("hasInfographics", False)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation: {str(e)}")

@app.get("/sessions", response_model=List[SessionResponse])
async def get_user_sessions(current_user: dict = Depends(get_current_user)):
    """Get all sessions for the authenticated user"""
    try:
        sessions = list(sessions_collection.find({"userId": current_user["_id"]}).sort("createdAt", -1))
        
        session_responses = []
        for session in sessions:
            # Get message count from conversations
            conversation = conversations_collection.find_one({"sessionId": session["sessionId"]})
            message_count = len(conversation.get("messages", [])) if conversation else 0
            
            # Check for infographics
            has_infographics = infographics_collection.count_documents({"sessionId": session["sessionId"]}) > 0
            
            session_responses.append(SessionResponse(
                sessionId=session["sessionId"],
                userId=session["userId"],
                appName=session["appName"],
                status=session["status"],
                createdAt=session["createdAt"],
                lastActivity=session["lastActivity"],
                messageCount=message_count,
                hasInfographics=has_infographics,
                adkSessionData=session.get("adkSessionData")
            ))
        
        return session_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user sessions: {str(e)}")

@app.get("/sessions/{session_id}/infographics")
async def get_session_infographics(session_id: str):
    """Get all infographics for a session"""
    try:
        infographics = list(infographics_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        
        infographic_responses = []
        for infographic in infographics:
            infographic_responses.append(InfographicResponse(
                id=infographic["infographicId"],
                sessionId=infographic["sessionId"],
                messageId=infographic["messageId"],
                contentType=infographic["contentType"],
                htmlCode=infographic["htmlCode"],
                createdAt=infographic["createdAt"]
            ))
        
        return infographic_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get infographics: {str(e)}")

@app.get("/sessions/{session_id}/grounding")
async def get_session_grounding_chunks(session_id: str):
    """Get all grounding chunks for a session"""
    try:
        chunks = list(grounding_chunks_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        
        chunk_responses = []
        for chunk in chunks:
            chunk_responses.append(GroundingChunkResponse(
                id=chunk["chunkId"],
                sessionId=chunk["sessionId"],
                messageId=chunk["messageId"],
                title=chunk["title"],
                url=chunk["url"],
                snippet=chunk["snippet"],
                createdAt=chunk["createdAt"]
            ))
        
        return chunk_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get grounding chunks: {str(e)}")

@app.get("/sessions")
async def get_all_sessions(userId: Optional[str] = None):
    """Get all sessions, optionally filtered by user"""
    try:
        query = {"userId": userId} if userId else {}
        sessions = list(sessions_collection.find(query).sort("lastActivity", -1))
        
        session_responses = []
        for session in sessions:
            session_responses.append(SessionResponse(**serialize_doc(session)))
        
        return session_responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

# ========================
# ADMIN & UTILITY ENDPOINTS
# ========================

@app.get("/stats")
async def get_system_stats():
    """Get comprehensive system statistics"""
    try:
        return {
            "database": {
                "name": DB_NAME,
                "collections": {
                    "sessions": sessions_collection.estimated_document_count(),
                    "conversations": conversations_collection.estimated_document_count(),
                    "infographics": infographics_collection.estimated_document_count(),
                    "grounding_chunks": grounding_chunks_collection.estimated_document_count(),
                }
            },
            "adk": {
                "connected": await check_adk_health(),
                "url": ADK_BASE_URL
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all associated data"""
    try:
        # Delete from all collections
        sessions_result = sessions_collection.delete_one({"sessionId": session_id})
        conversations_collection.delete_one({"sessionId": session_id})
        infographics_collection.delete_many({"sessionId": session_id})
        grounding_chunks_collection.delete_many({"sessionId": session_id})
        
        if sessions_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"success": True, "message": f"Session {session_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

@app.get("/export/{session_id}")
async def export_complete_session(session_id: str):
    """Export complete session data including all related information"""
    try:
        # Get session
        session = sessions_collection.find_one({"sessionId": session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get conversation
        conversation = conversations_collection.find_one({"sessionId": session_id})
        
        # Get infographics
        infographics = list(infographics_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        
        # Get grounding chunks
        grounding_chunks = list(grounding_chunks_collection.find({"sessionId": session_id}).sort("createdAt", 1))
        
        return {
            "session": serialize_doc(session),
            "conversation": serialize_doc(conversation) if conversation else None,
            "infographics": serialize_docs(infographics),
            "groundingChunks": serialize_docs(grounding_chunks),
            "exportedAt": datetime.utcnow().isoformat(),
            "exportVersion": "2.0.0"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export session: {str(e)}")

# ========================
# STARTUP & CLEANUP
# ========================

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    print("🚀 AgentSwot Storage & Integration API starting...")
    print(f"📊 Database: {DB_NAME}")
    print(f"🔗 ADK URL: {ADK_BASE_URL}")
    
    # Test connections
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection established")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    
    adk_healthy = await check_adk_health()
    if adk_healthy:
        print("✅ ADK server connection established")
    else:
        print("⚠️ ADK server not available (will retry on requests)")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await adk_client.aclose()
    print("👋 AgentSwot Storage API shutdown complete")

if __name__ == "__main__":
    print("🚀 Starting AgentSwot Storage & Integration API Server...")
    print(f"📊 Database: {DB_NAME}")
    print(f"🔗 ADK URL: {ADK_BASE_URL}")
    print(f"🌐 Server will be available at: http://{STORAGE_SERVER_HOST}:{STORAGE_SERVER_PORT}")
    print(f"📚 API docs will be available at: http://{STORAGE_SERVER_HOST}:{STORAGE_SERVER_PORT}/docs")
    print(f"🌍 Environment: {ENVIRONMENT}")
    
    uvicorn.run(
        "storage_server:app",
        host=STORAGE_SERVER_HOST,
        port=STORAGE_SERVER_PORT,
        reload=True if ENVIRONMENT == "development" else False,
        log_level="info"
    )