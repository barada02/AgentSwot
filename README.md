# 🎯 AgentSwot - AI-Powered SWOT Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React 18+](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8+-blue.svg)](https://www.typescriptlang.org/)

> An intelligent business analysis platform that combines AI-powered agents with dynamic web interfaces to provide comprehensive SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for businesses and products.

## 🚀 Features

### ✨ Core Capabilities
- **AI-Powered SWOT Analysis**: Interactive chat with intelligent agents for comprehensive business analysis
- **Dynamic Infographic Generation**: Real-time HTML infographics embedded in AI responses
- **Real-time Market Intelligence**: Live data integration with Google Search for current market insights
- **Session Management**: Persistent conversations with MongoDB Atlas storage
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Modern Material-UI interface supporting desktop and mobile

### 🔬 Innovation Highlights
- **JSON-Embedded Infographics**: Revolutionary approach to embedding rich HTML content within conversational AI
- **Intelligent Content Detection**: Automatic parsing and rendering of dynamic infographic content
- **Secure Iframe Rendering**: Sandboxed execution of generated HTML/CSS/JavaScript content
- **Multi-turn Conversations**: Context-aware dialogue for refined business analysis

## 🏗️ Architecture

```mermaid
graph TB
    A[React Frontend :5173] --> B[Storage Server :8001]
    B --> C[ADK Server :8000]
    B --> D[MongoDB Atlas]
    C --> E[Google Gemini 2.0 Flash]
    C --> F[Google Search API]
    
    subgraph "Frontend Layer"
        A
    end
    
    subgraph "Backend Services"
        B
        C
    end
    
    subgraph "Data & AI Layer"
        D
        E
        F
    end
```

### 📊 Technology Stack

**Frontend**
- React 18+ with TypeScript
- Material-UI (MUI) design system  
- Vite for fast development
- Axios for API communication
- React Hook Form for form management

**Backend**
- FastAPI with Python 3.8+
- Google Agent Development Kit (ADK)
- MongoDB Atlas for data persistence
- JWT authentication with bcrypt
- CORS middleware for cross-origin requests

**AI & Search**
- Google Gemini 2.0 Flash model
- Google Search integration
- Multi-tool agent framework
- Real-time content processing

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- MongoDB Atlas account
- Google Cloud project with ADK enabled

### 1. Clone Repository
```bash
git clone https://github.com/barada02/AgentSwot.git
cd AgentSwot
```

### 2. Backend Setup
```bash
cd agentsvertex

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Frontend Setup
```bash
cd Client

# Install dependencies
npm install

# Setup environment variables  
cp .env.example .env
# Configure VITE_STORAGE_API_URL=http://127.0.0.1:8001
```

### 4. Start Services
```bash
# Terminal 1: Start ADK Server
cd agentsvertex
adk api_server

# Terminal 2: Start Storage Server  
cd agentsvertex
python storage_server.py

# Terminal 3: Start React Frontend
cd Client
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:5173
- **Storage API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_V2.md](./SETUP_V2.md) | Detailed setup instructions |
| [NEW_ARCHITECTURE_V2.md](./NEW_ARCHITECTURE_V2.md) | V2.0 architecture overview |
| [MONGODB_INTEGRATION.md](./MONGODB_INTEGRATION.md) | Database integration guide |
| [FEATURES.md](./FEATURES.md) | Complete feature documentation |
| [SECURITY_FIXES.md](./agentsvertex/SECURITY_FIXES.md) | Security implementation notes |
| [ENV_SETUP.md](./agentsvertex/ENV_SETUP.md) | Environment configuration guide |

## 🔧 Configuration

### Required Environment Variables

**Backend (agentsvertex/.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET_KEY=your_32_character_minimum_secret_key
DB_NAME=agentswot
ADK_BASE_URL=http://127.0.0.1:8000
```

**Frontend (Client/.env)**
```env
VITE_STORAGE_API_URL=http://127.0.0.1:8001
VITE_APP_ENV=development
```

## 🎯 Usage Examples

### Basic SWOT Analysis
```
User: "I want to launch a healthy fruit jar product"
Agent: "Tell me more about your target market and unique value proposition..."
Agent: [Generates comprehensive SWOT analysis with interactive infographic]
```

### Business Ideas Supported
- Mobile apps (fitness, finance, food delivery)
- Physical products (organic foods, consumer goods)
- Service platforms (cleaning, tutoring, consulting)
- E-commerce businesses
- SaaS applications

## 🛡️ Security Features

- **Environment-based Secrets**: No hardcoded credentials
- **JWT Authentication**: Secure user sessions  
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured cross-origin policies
- **Sandboxed Rendering**: Safe execution of generated content

## 🧪 Testing

```bash
# Backend API testing
cd agentsvertex
python test.py

# Frontend component testing  
cd Client
npm run test:api

# Health check
curl http://localhost:8001/health
```

## 📂 Project Structure

```
AgentSwot/
├── agentsvertex/                 # Backend Services
│   ├── multi_tool_agent/         # AI Agent Implementation
│   ├── storage_server.py         # Storage & Integration API
│   ├── requirements.txt          # Python Dependencies
│   └── .env.example             # Environment Template
├── Client/                       # React Frontend
│   ├── src/
│   │   ├── components/          # React Components
│   │   ├── hooks/               # Custom React Hooks  
│   │   ├── pages/               # Page Components
│   │   └── services/            # API Services
│   └── package.json            # Node Dependencies
├── *.bat                        # Windows Startup Scripts
└── *.md                         # Documentation Files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/barada02/AgentSwot/issues)
- **Documentation**: Check the `/docs` folder for detailed guides
- **Health Check**: Visit http://localhost:8001/health to verify system status

## 🏆 Acknowledgments

- Google Cloud ADK team for the Agent Development Kit
- MongoDB Atlas for database services
- Material-UI for the component library
- React and FastAPI communities for excellent documentation

---

**Built with ❤️ by the AgentSwot Team**