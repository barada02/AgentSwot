# Chapter 3 — Design & Requirements

## 3.1 Software Requirements

**OS:** Windows 10/11, macOS 10.15+, Linux Ubuntu 18.04+

**Language:** 
- Python 3.8+ (Backend AI agent development)
- TypeScript/JavaScript ES2020+ (Frontend development)
- HTML5/CSS3 (Dynamic infographic generation)

**Libraries:**
- **Backend:** google-adk, fastapi, uvicorn, python-dotenv, pydantic
- **Frontend:** React 18+, Material-UI 7.3+, axios 1.11+, react-router-dom 7.8+, uuid 11.1+
- **Development:** vite, typescript, eslint, prettier

**Database:** Session-based storage (no persistent database required for prototype)

**IDE:** Visual Studio Code with Python, React, and TypeScript extensions

**External APIs:**
- Google Gemini 2.0 Flash API (AI language model)
- Google Search API (real-time web search)
- Google Agent Development Kit (ADK) services

## 3.2 Hardware Requirements

**Minimum Requirements:**
4-core CPU (Intel i5/AMD Ryzen 5), 8 GB RAM, 100 GB SSD storage, integrated graphics, stable internet connection (10 Mbps)

**Recommended Requirements:** 
8-core CPU (Intel i7/AMD Ryzen 7), 16 GB RAM, 256 GB NVMe SSD, dedicated GPU with 4 GB VRAM (for development), high-speed internet (25+ Mbps)

**Network Requirements:**
Stable internet connectivity for Google Cloud API access, WebSocket support for real-time communication, CORS-enabled browser environment

## 3.3 Design (Architecture, UML diagrams, Data Model)

### Architecture Overview

AgentSwot follows a **microservices architecture** with clear separation between frontend React application, FastAPI backend service, and Google Cloud AI services. The system implements a client-server pattern where the React frontend communicates with the FastAPI backend through RESTful APIs, while the backend orchestrates AI agents using Google's ADK framework. This layered architecture ensures scalability, maintainability, and secure isolation between user interface, business logic, and AI processing components.

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Tier"
        A[React Frontend<br/>TypeScript + Material-UI]
        B[Chat Interface]
        C[Infographic Viewer]
        D[Session Manager]
    end
    
    subgraph "Application Tier"
        E[FastAPI Backend]
        F[Session Management]
        G[Message Processing]
        H[Content Parser]
    end
    
    subgraph "AI Services Tier"
        I[Google ADK Agent]
        J[Gemini 2.0 Flash]
        K[Google Search API]
        L[Prompt Engine]
    end
    
    subgraph "Infrastructure"
        M[Google Cloud Platform]
        N[HTTP/REST APIs]
        O[JSON Data Exchange]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> M
    J --> M
    K --> M
    L --> M
    
    E -.->|RESTful API| A
    I -.->|AI Processing| E
    M -.->|Cloud Services| I
```

### Use Case Diagram

```mermaid
graph LR
    subgraph "AgentSwot System"
        UC1[Create Session]
        UC2[Send Business Query]
        UC3[Generate SWOT Analysis]
        UC4[View Infographic]
        UC5[Export Results]
        UC6[Manage Session]
    end
    
    User((User<br/>Business Analyst))
    AI((AI Agent<br/>System))
    Search((Google Search<br/>API))
    
    User --> UC1
    User --> UC2
    User --> UC4
    User --> UC5
    User --> UC6
    
    UC2 --> UC3
    UC3 --> AI
    AI --> Search
    UC3 --> UC4
    
    UC1 -.-> UC2
    UC3 -.-> UC4
    UC4 -.-> UC5
```

### Class Diagram

```mermaid
classDiagram
    class ChatInterface {
        -messages: ChatMessage[]
        -inputMessage: string
        -selectedInfographic: InfographicData
        -sessionCreated: boolean
        +handleSendMessage()
        +handleViewInfographic()
        +scrollToBottom()
    }
    
    class UserSession {
        +userId: string
        +sessionId: string
        +appName: string
        +validate()
    }
    
    class ChatMessage {
        +id: string
        +role: string
        +content: string
        +timestamp: number
        +metadata: MessageMetadata
        +partCount: number
    }
    
    class InfographicData {
        +id: string
        +contentType: string
        +htmlCode: string
        +rawCode: string
        +partIndex: number
        +clean()
        +validate()
    }
    
    class Agent {
        +model: string
        +name: string
        +instruction: string
        +tools: Tool[]
        +process()
        +generateResponse()
    }
    
    class MessageUtils {
        +containsInfographicJSON(): boolean
        +extractInfographicJSON(): string[]
        +parseInfographicJSON(): InfographicContent
        +cleanHTMLCode(): string
    }
    
    class ApiService {
        +createSession(): Promise
        +sendMessage(): Promise
        +handleError()
        +validateResponse()
    }
    
    ChatInterface --> UserSession
    ChatInterface --> ChatMessage
    ChatInterface --> InfographicData
    ChatInterface --> ApiService
    ChatMessage --> MessageUtils
    InfographicData --> MessageUtils
    Agent --> MessageUtils
    ApiService --> Agent
```

### Sequence Diagram - SWOT Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as AI Agent
    participant G as Google Search
    
    U->>F: Enter business description
    F->>F: Validate input
    F->>B: POST /run {message}
    B->>A: Process user query
    A->>A: Analyze business context
    A->>G: Search market data
    G-->>A: Return search results
    A->>A: Generate SWOT analysis
    A->>A: Create HTML infographic
    A-->>B: JSON response with infographic
    B-->>F: Formatted response
    F->>F: Parse infographic JSON
    F->>F: Clean HTML content
    F-->>U: Display chat + infographic
    U->>F: Click view infographic
    F->>F: Open secure iframe viewer
    F-->>U: Full-screen infographic
```

### Data Model Schema

```mermaid
erDiagram
    USER_SESSION {
        string userId PK
        string sessionId PK
        string appName
        timestamp createTime
        timestamp lastUpdateTime
        json state
    }
    
    CHAT_MESSAGE {
        string id PK
        string sessionId FK
        string role
        text content
        timestamp timestamp
        int partCount
        boolean hasInfographic
    }
    
    MESSAGE_METADATA {
        string messageId PK, FK
        boolean hasMultipleParts
        json originalParts
        boolean hasInfographic
        int infographicCount
    }
    
    INFOGRAPHIC_DATA {
        string id PK
        string messageId FK
        string contentType
        text htmlCode
        text rawCode
        int partIndex
        timestamp createdAt
    }
    
    AI_RESPONSE {
        string id PK
        string sessionId FK
        text prompt
        text response
        json usageMetadata
        timestamp timestamp
        string invocationId
    }
    
    USER_SESSION ||--o{ CHAT_MESSAGE : contains
    CHAT_MESSAGE ||--o| MESSAGE_METADATA : has
    CHAT_MESSAGE ||--o{ INFOGRAPHIC_DATA : includes
    USER_SESSION ||--o{ AI_RESPONSE : generates
```

### Data Relationships

**Primary Entities:**
- **USER_SESSION**: Core session management with unique user-session combinations
- **CHAT_MESSAGE**: Individual messages with role-based classification (user/assistant)
- **INFOGRAPHIC_DATA**: Embedded visual content with secure HTML storage
- **AI_RESPONSE**: Complete AI interaction logs with metadata tracking

**Key Relationships:**
- One session contains multiple messages (1:N)
- One message can have one metadata record (1:1)
- One message can include multiple infographics (1:N)
- Session tracks all AI responses for audit trail (1:N)
