# Chapter 4: Implementation

## 4.1 Development Environment & Setup

### 4.1.1 Project Structure

The AgentSwot project follows a modular architecture with clear separation between backend AI services and frontend user interface:

```
AgentSwot/
├── agentsvertex/                    # Backend AI Agent
│   ├── vagent/                      # Virtual Environment
│   ├── multi_tool_agent/            # Main Agent Module
│   │   ├── __init__.py
│   │   ├── agent.py                 # Core Agent Implementation
│   │   ├── prompts.py               # AI Prompt Templates
│   │   └── __pycache__/
│   ├── requirements.txt             # Python Dependencies
│   ├── test.py                      # Testing Scripts
│   └── helper.md                    # Setup Instructions
├── Client/                          # Frontend React Application
│   ├── src/
│   │   ├── components/              # React Components
│   │   ├── pages/                   # Page Components
│   │   ├── hooks/                   # Custom React Hooks
│   │   ├── utils/                   # Utility Functions
│   │   ├── types/                   # TypeScript Definitions
│   │   └── api/                     # API Integration
│   ├── package.json                 # Node.js Dependencies
│   └── vite.config.ts               # Build Configuration
└── ProjectReport/                   # Documentation
```

### 4.1.2 Backend Environment Setup

**Virtual Environment Creation:**
```bash
# Navigate to backend directory
cd agentsvertex

# Create virtual environment
python -m venv vagent

# Activate virtual environment (Windows)
vagent\Scripts\activate

# Install dependencies
pip install google-adk
```

**Environment Configuration:**
```python
# .env file configuration
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path_to_credentials.json
API_BASE_URL=http://127.0.0.1:8000
```

**Google ADK Setup:**
The project utilizes Google's Agent Development Kit for AI orchestration:
```python
from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search
from dotenv import load_dotenv

load_dotenv()
```

### 4.1.3 Frontend Environment Setup

**Node.js Environment:**
```bash
# Navigate to frontend directory
cd Client

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

**Key Dependencies:**
```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@mui/material": "^7.3.1",
    "react": "^19.1.1",
    "typescript": "~5.8.3",
    "axios": "^1.11.0",
    "react-router-dom": "^7.8.2"
  }
}
```

## 4.2 Module-wise Implementation & Code Overview

### 4.2.1 Backend Implementation

**Core Agent Module (agent.py):**
```python
from random import random
from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search
import os
import uuid
from multi_tool_agent import prompts
from dotenv import load_dotenv

load_dotenv()

# Core Agent Configuration
root_agent = Agent(
    model="gemini-2.0-flash-001",
    name="multi_tool_agent",
    instruction=prompts.root_agent_instruction_v3,
    tools=[google_search]
)
```

**Prompt Engineering (prompts.py):**
The system uses sophisticated prompt engineering to generate SWOT analysis with embedded infographics:

```python
root_agent_instruction_v3 = """
Greet the user politely and introduce yourself as the SWOT Analysis Assistant.
Ask the user to describe the business, product, or service they want to launch 
so you can perform a SWOT analysis.

Once you receive the details, use the Google Search Tool to visit multiple 
relevant websites and gather information to identify strengths, weaknesses, 
opportunities, and threats.

After gathering information and discussing with the user, generate a SWOT 
analysis infographic as a clean, professional HTML/CSS/JS code snippet.

Respond only with a JSON object in the following format:
{
  "contenttype": "infographic",
  "code": "<!DOCTYPE html>..."
}

The HTML/CSS/JS should:
- Be clean with no markdown syntax
- Present the SWOT analysis in a visually appealing, modern layout
- Use clear sectioning for Strengths, Weaknesses, Opportunities, and Threats
- Be fully self-contained (no external dependencies)
- Include basic interactivity if appropriate
"""
```

**API Endpoints:**
The system exposes RESTful endpoints for client interaction:

1. **GET /list-apps** - Health check and available applications
2. **POST /apps/{app_name}/users/{user_id}/sessions/{session_id}** - Session creation
3. **GET /apps/{app_name}/users/{user_id}/sessions/{session_id}** - Session retrieval
4. **POST /run** - Message processing and SWOT analysis

### 4.2.2 Frontend Implementation

**Main Application Component (App.tsx):**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AIPage from './pages/AIPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai" element={<AIPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

**Chat Interface Component (ChatInterface.tsx):**
This component handles user interactions and message processing:

```typescript
// Key features implemented:
- Session management and initialization
- Real-time message exchange with backend
- Infographic detection and rendering
- Message metadata tracking
- Error handling and loading states

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicData | null>(null);
  
  const { loading, createSession, sendMessage } = useApi();
  
  // Session initialization logic
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await createSession(userSession);
        setSessionCreated(true);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    initializeSession();
  }, [userSession]);
  
  // Message sending and processing
  const handleSendMessage = async () => {
    // Implementation for sending messages and processing responses
  };
};
```

**Infographic Processing (messageUtils.ts):**
Advanced message processing for dynamic content handling:

```typescript
// Infographic detection using regex patterns
export const containsInfographicJSON = (text: string): boolean => {
  const jsonPattern = /```json\s*\n?\s*\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\}\s*\n?\s*```/gi;
  return jsonPattern.test(text);
};

// JSON extraction and parsing
export const extractInfographicJSON = (text: string): string[] => {
  const jsonPattern = /```json\s*\n?\s*(\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\})\s*\n?\s*```/gi;
  const matches: string[] = [];
  let match;
  
  while ((match = jsonPattern.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// HTML cleaning and sanitization
export const cleanHTMLCode = (htmlCode: string): string => {
  return htmlCode
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .trim();
};
```

**Infographic Viewer Component (InfographicViewer.tsx):**
Secure rendering of dynamic HTML content:

```typescript
const InfographicViewer: React.FC<InfographicViewerProps> = ({
  infographic, open, onClose
}) => {
  // Safe iframe rendering with sandboxing
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Box sx={{ height: '70vh', width: '100%' }}>
          <iframe
            srcDoc={infographic?.htmlCode}
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`Infographic ${infographic?.id}`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOpenInNewTab}>Open in New Tab</Button>
        <Button onClick={handleDownload}>Download HTML</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 4.2.3 API Integration

**Custom Hook for API Communication (useApi.ts):**
```typescript
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (userSession: UserSession) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/apps/${userSession.appName}/users/${userSession.userId}/sessions/${userSession.sessionId}`
      );
      return response.data;
    } catch (err) {
      setError('Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (request: RunRequest) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/run`, request);
      return response.data;
    } catch (err) {
      setError('Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createSession, sendMessage };
};
```

## 4.3 Testing & Validation

### 4.3.1 Backend Testing

**Unit Testing:**
```python
# test.py - Backend testing implementation
import unittest
from multi_tool_agent.agent import root_agent

class TestAgentFunctionality(unittest.TestCase):
    def test_agent_initialization(self):
        """Test if agent initializes correctly"""
        self.assertIsNotNone(root_agent)
        self.assertEqual(root_agent.name, "multi_tool_agent")
    
    def test_prompt_validation(self):
        """Test prompt template validation"""
        from multi_tool_agent.prompts import root_agent_instruction_v3
        self.assertIn("SWOT", root_agent_instruction_v3)
        self.assertIn("infographic", root_agent_instruction_v3)

if __name__ == '__main__':
    unittest.main()
```

**API Endpoint Testing:**
```bash
# Manual testing using curl or Postman

# 1. Test health check
GET http://127.0.0.1:8000/list-apps

# 2. Test session creation
POST http://127.0.0.1:8000/apps/multi_tool_agent/users/testuser/sessions/test123

# 3. Test SWOT analysis
POST http://127.0.0.1:8000/run
{
  "app_name": "multi_tool_agent",
  "user_id": "testuser",
  "session_id": "test123",
  "new_message": {
    "role": "user",
    "parts": [{"text": "I want to launch a healthy fruit jar product"}]
  },
  "streaming": false
}
```

### 4.3.2 Frontend Testing

**Component Testing Approach:**
```typescript
// Testing strategy for React components
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '../components/ChatInterface';

describe('ChatInterface Component', () => {
  test('renders chat input field', () => {
    render(<ChatInterface userSession={mockSession} />);
    const inputElement = screen.getByPlaceholderText(/describe your business/i);
    expect(inputElement).toBeInTheDocument();
  });

  test('handles message sending', () => {
    render(<ChatInterface userSession={mockSession} />);
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);
    // Assert expected behavior
  });
});
```

**Infographic Processing Testing:**
```typescript
// Testing message utilities
import { containsInfographicJSON, extractInfographicJSON } from '../utils/messageUtils';

describe('Message Utils', () => {
  test('detects infographic JSON correctly', () => {
    const testMessage = '```json\n{"contenttype": "infographic", "code": "<html></html>"}\n```';
    expect(containsInfographicJSON(testMessage)).toBe(true);
  });

  test('extracts infographic content', () => {
    const testMessage = '```json\n{"contenttype": "infographic", "code": "<html></html>"}\n```';
    const extracted = extractInfographicJSON(testMessage);
    expect(extracted).toHaveLength(1);
  });
});
```

### 4.3.3 Integration Testing

**End-to-End Testing Scenarios:**

1. **Complete SWOT Analysis Workflow:**
   - User creates session
   - Submits business description
   - Agent performs web search
   - Generates SWOT analysis with infographic
   - Frontend displays results correctly

2. **Infographic Rendering Validation:**
   - JSON detection accuracy
   - HTML content sanitization
   - Iframe security sandbox
   - Export functionality

3. **Error Handling Testing:**
   - Network connectivity issues
   - Invalid session handling
   - Malformed response processing
   - Rate limiting scenarios

**Performance Testing:**
```bash
# Load testing with multiple concurrent sessions
# Response time validation (< 3 seconds for analysis)
# Memory usage monitoring
# Browser compatibility testing
```

### 4.3.4 Security Validation

**Content Security Testing:**
- XSS prevention in dynamic HTML rendering
- Iframe sandbox security validation
- Input sanitization verification
- API authentication testing

**Data Privacy Testing:**
- Session data isolation
- Secure credential management
- HTTPS enforcement
- Error message sanitization

This implementation approach ensures a robust, scalable, and secure platform that effectively combines AI-powered analysis capabilities with innovative visualization features, while maintaining high code quality and comprehensive testing coverage.
