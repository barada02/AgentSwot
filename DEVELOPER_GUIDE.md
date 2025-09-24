# 👩‍💻 AgentSwot Developer Guide

> Complete development guide for contributing to and extending the AgentSwot platform

## 🎯 Overview

AgentSwot is built using modern development practices with a focus on:
- **Type Safety**: Full TypeScript coverage on frontend
- **API-First Design**: RESTful APIs with comprehensive documentation
- **Security**: JWT authentication and input validation
- **Scalability**: Microservices architecture with MongoDB Atlas
- **Developer Experience**: Hot reload, comprehensive logging, and debugging tools

## 🏗️ Architecture Deep Dive

### System Components

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend :5173]
        A1[Components]
        A2[Hooks]
        A3[Services]
        A4[Types]
    end
    
    subgraph "API Gateway"
        B[Storage Server :8001]
        B1[Authentication]
        B2[Session Management]
        B3[Data Processing]
        B4[ADK Integration]
    end
    
    subgraph "AI Layer"
        C[ADK Server :8000]
        C1[Multi-tool Agent]
        C2[Gemini 2.0 Flash]
        C3[Google Search]
    end
    
    subgraph "Data Layer"
        D[MongoDB Atlas]
        D1[Users Collection]
        D2[Sessions Collection]
        D3[Messages Collection]
        D4[Infographics Collection]
    end
    
    A --> B
    B --> C
    B --> D
    C --> C2
    C --> C3
```

### Data Flow

1. **User Interaction** → React frontend captures user input
2. **API Request** → Frontend sends request to Storage Server
3. **Authentication** → JWT token validation and user verification
4. **ADK Communication** → Storage Server communicates with ADK Server
5. **AI Processing** → Gemini 2.0 Flash processes the request with Google Search
6. **Response Processing** → Storage Server processes AI response and extracts infographics
7. **Data Storage** → All data stored in MongoDB Atlas collections
8. **Client Response** → Processed response sent back to frontend
9. **UI Update** → React components update with new data

## 🛠️ Development Environment Setup

### Prerequisites

**Required Software:**
- **Node.js**: 16.0.0 or higher
- **Python**: 3.8.0 or higher  
- **Git**: Latest version
- **VS Code**: Recommended IDE with extensions

**Recommended VS Code Extensions:**
```json
{
  "recommendations": [
    "ms-python.python",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-python.pylint",
    "ms-toolsai.jupyter"
  ]
}
```

### Local Development Setup

#### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/barada02/AgentSwot.git
cd AgentSwot

# Create development branch
git checkout -b feature/your-feature-name
```

#### 2. Backend Development Environment
```bash
cd agentsvertex

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# MacOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup pre-commit hooks (recommended)
pip install pre-commit
pre-commit install
```

#### 3. Frontend Development Environment  
```bash
cd Client

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Install recommended tools globally
npm install -g @typescript-eslint/cli
```

#### 4. Environment Configuration

**Backend (.env in agentsvertex/):**
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=agentswot_dev

# Authentication
JWT_SECRET_KEY=development_secret_key_32_chars_min

# ADK Configuration  
ADK_BASE_URL=http://127.0.0.1:8000

# Server Configuration
STORAGE_SERVER_HOST=0.0.0.0
STORAGE_SERVER_PORT=8001
ENVIRONMENT=development

# Development Options
DEBUG=true
LOG_LEVEL=debug
```

**Frontend (.env.local in Client/):**
```env
# API Configuration
VITE_STORAGE_API_URL=http://127.0.0.1:8001
VITE_APP_ENV=development

# Development Options
VITE_API_TIMEOUT=120000
VITE_DEBUG_MODE=true
```

### Development Workflow

#### Daily Development Routine

1. **Start Development Servers:**
```bash
# Terminal 1: Backend ADK
cd agentsvertex && adk api_server

# Terminal 2: Storage Server  
cd agentsvertex && python storage_server.py

# Terminal 3: Frontend
cd Client && npm run dev

# Terminal 4: Available for commands
```

2. **Verify System Health:**
```bash
curl http://localhost:8001/health
```

3. **Development URLs:**
- Frontend: http://localhost:5173
- Storage API: http://localhost:8001  
- API Docs: http://localhost:8001/docs
- Health Check: http://localhost:8001/health

## 📁 Project Structure Deep Dive

### Backend Structure (agentsvertex/)

```
agentsvertex/
├── storage_server.py           # Main FastAPI application
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── test.py                    # API testing script
├── venv/                      # Virtual environment (auto-generated)
├── __pycache__/              # Python cache (auto-generated)
└── multi_tool_agent/         # AI Agent implementation
    ├── __init__.py
    ├── agent.py              # Agent configuration
    ├── prompts.py            # AI prompts and instructions  
    └── __pycache__/         # Python cache (auto-generated)
```

### Frontend Structure (Client/)

```
Client/
├── public/
│   └── vite.svg              # Public assets
├── src/
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx        # Main chat component
│   │   ├── InfographicViewer.tsx    # Infographic renderer
│   │   ├── SessionForm.tsx          # Session management
│   │   ├── BrowserStorageTest.tsx   # Storage testing
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useStorageApi.ts         # Main API hook
│   │   ├── useMongoDBStorage.ts     # Database operations
│   │   ├── useBrowserStorage.ts     # Local storage
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── DashboardPage.tsx        # Main dashboard
│   │   ├── AuthPage.tsx            # Authentication
│   │   ├── LandingPage.tsx         # Landing page
│   │   └── ...
│   ├── services/            # API services
│   │   ├── storage.ts              # Storage abstraction
│   │   ├── database.ts             # Database operations
│   │   └── ...
│   ├── types/              # TypeScript definitions
│   │   ├── index.ts                # Main types
│   │   └── storage.ts              # Storage types
│   ├── utils/              # Utility functions
│   │   ├── messageUtils.ts         # Message processing
│   │   ├── dataValidator.ts        # Data validation
│   │   └── ...
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite type definitions
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── eslint.config.js        # ESLint configuration
└── .env.example            # Environment template
```

## 🔧 Development Tools & Scripts

### Backend Scripts

```bash
# Development server with auto-reload
python storage_server.py

# Run ADK server
adk api_server

# API testing
python test.py

# Database operations (custom script)
python -c "from storage_server import *; print('Connected to:', DB_NAME)"

# Generate requirements
pip freeze > requirements.txt
```

### Frontend Scripts  

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build  
npm run preview

# Linting
npm run lint

# Type checking
npx tsc --noEmit

# API testing
npm run test:api
```

### Debugging Tools

#### Backend Debugging

**FastAPI Debug Mode:**
```python
# In storage_server.py
if __name__ == "__main__":
    uvicorn.run(
        "storage_server:app",
        host=STORAGE_SERVER_HOST,
        port=STORAGE_SERVER_PORT,
        reload=True,  # Auto-reload on changes
        log_level="debug"  # Verbose logging
    )
```

**Database Debugging:**
```python
# Quick database inspection
from storage_server import client, DB_NAME
db = client[DB_NAME]
print("Collections:", db.list_collection_names())
print("User count:", db.users.count_documents({}))
```

#### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- View component hierarchy and state
- Profile component performance

**Network Debugging:**
```typescript
// In useStorageApi.ts
const axiosInstance = axios.create({
  timeout: API_TIMEOUT,
  interceptors: {
    request: (config) => {
      console.log('🚀 Request:', config);
      return config;
    },
    response: (response) => {
      console.log('✅ Response:', response);
      return response;
    }
  }
});
```

## 🧪 Testing Strategy

### Backend Testing

#### Unit Tests
```python
# test_api.py
import pytest
from fastapi.testclient import TestClient
from storage_server import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()

def test_auth_registration():
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    })
    assert response.status_code == 201
```

#### Integration Tests
```python
# Integration test example
def test_full_chat_flow():
    # 1. Register user
    # 2. Login
    # 3. Create session  
    # 4. Send message
    # 5. Verify response and storage
    pass
```

### Frontend Testing

#### Component Testing
```typescript
// ChatInterface.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from './ChatInterface';

test('sends message on button click', async () => {
  render(<ChatInterface userSession={mockSession} />);
  
  const input = screen.getByPlaceholderText('Type your message...');
  const button = screen.getByText('Send');
  
  fireEvent.change(input, { target: { value: 'Test message' } });
  fireEvent.click(button);
  
  expect(screen.getByText('Test message')).toBeInTheDocument();
});
```

#### API Testing
```typescript  
// api.test.ts
import { useStorageApi } from '../hooks/useStorageApi';

test('API authentication flow', async () => {
  const { login, createSession } = useStorageApi();
  
  const auth = await login('test@example.com', 'password');
  expect(auth.access_token).toBeDefined();
  
  const session = await createSession();
  expect(session.session_id).toBeDefined();
});
```

## 🔐 Security Best Practices

### Authentication & Authorization

#### JWT Implementation
```python
# Secure JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
    raise ValueError("JWT_SECRET_KEY must be at least 32 characters")

# Token generation with expiration
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")
```

#### Password Security
```python
# Password hashing
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
```

### Input Validation

#### Pydantic Models
```python
from pydantic import BaseModel, EmailStr, validator

class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
```

#### Frontend Validation
```typescript
// Input sanitization
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

// Form validation with Yup
import * as yup from 'yup';

const messageSchema = yup.object().shape({
  message: yup
    .string()
    .required('Message is required')
    .max(5000, 'Message too long')
    .matches(/^[^<>]*$/, 'Invalid characters detected')
});
```

### Content Security

#### Iframe Sandboxing
```typescript
// Secure infographic rendering
<iframe
  srcDoc={sanitizedHtml}
  sandbox="allow-scripts allow-same-origin allow-forms"
  style={{ width: '100%', height: '100%', border: 'none' }}
  title={`Infographic ${id}`}
  referrerPolicy="no-referrer"
  loading="lazy"
/>
```

## 🚀 Performance Optimization

### Backend Optimization

#### Database Indexing
```python
# MongoDB indexes for performance
def create_indexes():
    db = client[DB_NAME]
    
    # User queries
    db.users.create_index("email", unique=True)
    
    # Session queries
    db.sessions.create_index([("user_id", 1), ("created_at", -1)])
    
    # Message queries  
    db.messages.create_index([("session_id", 1), ("timestamp", 1)])
    
    # Infographic queries
    db.infographics.create_index("session_id")
```

#### Response Caching
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_user_sessions(user_id: str):
    return list(db.sessions.find({"user_id": user_id}))
```

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const InfographicViewer = lazy(() => import('./InfographicViewer'));

function App() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <InfographicViewer />
    </Suspense>
  );
}
```

#### API Optimization
```typescript
// Request debouncing
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await api.search(query);
  setSearchResults(results);
}, 300);
```

## 📊 Monitoring & Logging

### Backend Logging
```python
import logging
from datetime import datetime

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    return response
```

### Frontend Error Handling
```typescript
// Error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    // Send to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackComponent />;
    }
    return this.props.children;
  }
}
```

## 🤝 Contributing Guidelines

### Code Standards

#### Python Code Style
```python
# Follow PEP 8
# Use type hints
def create_session(user_id: str, app_name: str) -> dict:
    """Create a new session for the user."""
    pass

# Use descriptive variable names
session_creation_time = datetime.utcnow()

# Document functions
def process_message(message: str) -> dict:
    """
    Process user message and return AI response.
    
    Args:
        message: User input message
        
    Returns:
        Dictionary containing response data
        
    Raises:
        ValueError: If message is empty or invalid
    """
```

#### TypeScript Code Style
```typescript
// Use strict TypeScript
interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastUpdated: Date;
}

// Use descriptive function names
const processMessageWithInfographics = (
  message: Message
): ProcessedMessage => {
  // Implementation
};

// Document complex functions
/**
 * Extracts infographic data from AI response
 * @param response - Raw AI response
 * @returns Processed message with separated infographics
 */
const extractInfographics = (response: string): InfographicData[] => {
  // Implementation
};
```

### Git Workflow

#### Branch Naming
```bash
# Feature branches
feature/add-user-authentication
feature/improve-infographic-rendering

# Bug fixes
bugfix/fix-session-timeout
bugfix/resolve-login-error

# Hotfixes
hotfix/security-patch-jwt

# Documentation
docs/update-api-documentation
docs/add-setup-guide
```

#### Commit Messages
```bash
# Use conventional commits
feat: add user authentication with JWT
fix: resolve session timeout issues
docs: update API documentation
test: add integration tests for chat flow
refactor: improve infographic processing
perf: optimize database queries
```

### Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes & Test**
```bash
# Run tests
npm run test        # Frontend
python -m pytest   # Backend

# Check code quality
npm run lint        # Frontend  
pylint **/*.py      # Backend
```

3. **Commit & Push**
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

4. **Create Pull Request**
   - Use the PR template
   - Include screenshots for UI changes
   - Reference related issues
   - Request appropriate reviewers

### Code Review Checklist

**General:**
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No sensitive data exposed

**Backend:**
- [ ] API endpoints documented
- [ ] Input validation implemented
- [ ] Error handling included
- [ ] Database queries optimized

**Frontend:**
- [ ] Components are reusable
- [ ] TypeScript types defined
- [ ] Error boundaries implemented
- [ ] Accessibility considered

## 🐛 Troubleshooting Guide

### Common Development Issues

#### Backend Issues

**MongoDB Connection Error:**
```bash
# Check connection string
echo $MONGODB_URI

# Test connection
python -c "from pymongo import MongoClient; client = MongoClient('$MONGODB_URI'); print(client.admin.command('ping'))"
```

**ADK Server Not Running:**
```bash
# Check if ADK is installed
adk --version

# Start ADK server
cd agentsvertex && adk api_server

# Verify ADK health
curl http://localhost:8000/list-apps
```

**JWT Secret Issues:**
```bash
# Generate new JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Verify secret length
python -c "import os; print('JWT Secret length:', len(os.getenv('JWT_SECRET_KEY', '')))"
```

#### Frontend Issues

**API Connection Failed:**
```bash
# Check if Storage Server is running
curl http://localhost:8001/health

# Verify environment variables
grep VITE_STORAGE_API_URL Client/.env.local

# Test API directly
curl -X POST http://localhost:8001/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"password123","full_name":"Test User"}'
```

**Build Errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript compilation
npx tsc --noEmit

# Verify all imports
npm run lint
```

**Vite Server Issues:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Check port availability
lsof -i :5173  # macOS/Linux
netstat -an | findstr 5173  # Windows

# Restart with different port
npm run dev -- --port 3000
```

### Performance Issues

**Slow API Responses:**
```python
# Add response time logging
import time

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

**Memory Issues:**
```bash
# Monitor memory usage
# Backend
python -c "import psutil; print(f'Memory: {psutil.virtual_memory().percent}%')"

# Frontend bundle size
npm run build && ls -la dist/

# Analyze bundle
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/
```

### Database Issues

**Collection Not Found:**
```python
# Create collections manually
from storage_server import client, DB_NAME

db = client[DB_NAME]
collections = ['users', 'sessions', 'messages', 'infographics', 'grounding_chunks']

for collection in collections:
    if collection not in db.list_collection_names():
        db.create_collection(collection)
        print(f"Created collection: {collection}")
```

**Index Performance:**
```python
# Check existing indexes
for collection_name in db.list_collection_names():
    collection = db[collection_name]
    indexes = list(collection.list_indexes())
    print(f"{collection_name} indexes:", indexes)
```

## 📚 Resources & Documentation

### Internal Documentation
- [Setup Guide](./SETUP_V2.md) - Complete setup instructions
- [Architecture Overview](./NEW_ARCHITECTURE_V2.md) - System architecture
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Security Guide](./agentsvertex/SECURITY_FIXES.md) - Security implementation

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React 18 Documentation](https://react.dev/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [Material-UI Components](https://mui.com/)
- [Google ADK Documentation](https://ai.google.dev/agentic)

### Community Resources
- **Stack Overflow**: [fastapi], [react], [mongodb] tags
- **Discord**: React and Python developer communities
- **GitHub Discussions**: Project-specific discussions
- **Reddit**: r/webdev, r/Python, r/reactjs

---

**Happy Coding! 🚀**

*This guide is continuously updated. Please contribute improvements and report issues.*