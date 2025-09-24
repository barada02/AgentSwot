# Chapter 3 — System Design & Architecture

## 3.1 Software Requirements

### 3.1.1 Operating System
- **Primary OS**: Windows 10/11 (64-bit)
- **Alternative Support**: macOS 10.15+, Ubuntu 18.04+
- **Development Environment**: Cross-platform compatibility

### 3.1.2 Programming Languages & Frameworks

**Frontend Stack:**
- **Language**: TypeScript 5.0+ (JavaScript ES2022)
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite 4.0+ for fast development and optimized builds
- **UI Framework**: Material-UI (MUI) v5 for modern component library

**Backend Stack:**
- **Language**: Python 3.12+
- **API Framework**: FastAPI 0.104+ for high-performance REST APIs
- **AI Integration**: Google Agent Development Kit (ADK)
- **Authentication**: JWT with bcrypt for secure user management

### 3.1.3 Libraries & Dependencies

**Frontend Libraries:**
```
- React Router v6 (navigation and routing)
- html2canvas (DOM to image conversion)
- jsPDF (PDF generation from canvas)
- React Toastify (user notifications)
- Axios (HTTP client for API communication)
```

**Backend Libraries:**
```
- FastAPI (async web framework)
- Pydantic (data validation and serialization)
- PyMongo (MongoDB async driver)
- Passlib[bcrypt] (password hashing)
- Google Cloud AI Platform (Gemini integration)
```

### 3.1.4 Database & External Services
- **Primary Database**: MongoDB Atlas (cloud-native NoSQL)
- **AI Service**: Google Gemini 2.0 Flash (conversational AI)
- **Search API**: Google Custom Search API
- **Authentication**: JWT-based session management

```mermaid
flowchart TD
    A[AgentSwot Platform]
    A --> B[Frontend - React/TypeScript]
    A --> C[Storage Server - FastAPI/Python]
    A --> D[ADK Server - Google Agent Kit]
    A --> E[MongoDB Atlas - Database]
    
    B --> B1[Material-UI Components]
    B --> B2[PDF Generation - html2canvas/jsPDF]
    B --> B3[React Router - Navigation]
    
    C --> C1[FastAPI - REST APIs]
    C --> C2[JWT Authentication]
    C --> C3[PyMongo - DB Driver]
    
    D --> D1[Google Gemini 2.0 Flash]
    D --> D2[Google Search API]
    D --> D3[AI Agent Processing]
    
    E --> E1[User Collections]
    E --> E2[Session Collections]
    E --> E3[Message Collections]
```

## 3.2 Hardware Requirements

### 3.2.1 Minimum Requirements
- **CPU**: 4-core processor (Intel i5-8400 / AMD Ryzen 5 2600 equivalent)
- **RAM**: 8 GB DDR4
- **Storage**: 50 GB available disk space (SSD recommended)
- **Network**: Broadband internet connection (10 Mbps minimum)
- **Graphics**: Integrated graphics sufficient (for PDF rendering)

### 3.2.2 Recommended Requirements
- **CPU**: 8-core processor (Intel i7-10700K / AMD Ryzen 7 3700X or higher)
- **RAM**: 16 GB DDR4 (32 GB for heavy concurrent usage)
- **Storage**: 200 GB SSD with NVMe interface
- **Network**: High-speed internet (50+ Mbps for optimal AI response times)
- **Graphics**: Dedicated GPU with 4+ GB VRAM (for enhanced canvas rendering)

### 3.2.3 Development Environment
- **IDE**: Visual Studio Code with extensions (TypeScript, Python, MongoDB)
- **Browser**: Chrome 90+ or Firefox 88+ (for development and testing)
- **Package Managers**: npm 9+, pip 23+

```mermaid
flowchart TD
    subgraph DE["Development Environment"]
        A[VS Code IDE]
        A --> B[Extensions]
        B --> B1[TypeScript/React]
        B --> B2[Python/FastAPI]
        B --> B3[MongoDB Tools]
    end
    
    subgraph SR["System Resources"]
        C[8-Core CPU]
        C --> D[16GB RAM]
        D --> E[200GB SSD]
        E --> F[50+ Mbps Network]
    end
    
    subgraph RE["Runtime Environment"]
        G[Node.js 18+]
        G --> H[Python 3.12+]
        H --> I[MongoDB Atlas]
        I --> J[Google Cloud AI]
    end
    
    DE --> SR
    SR --> RE
```

## 3.3 System Architecture & Design

### 3.3.1 Architecture Overview

AgentSwot implements a modern three-tier microservices architecture with clear separation of concerns. The system follows a client-server model where a React-based frontend communicates with FastAPI backend services, which in turn integrate with Google's AI infrastructure and MongoDB cloud database. This architecture ensures scalability, maintainability, and efficient resource utilization while providing seamless real-time AI-powered business analysis capabilities.

```mermaid
graph TB
    subgraph "Client Layer (Port 5173)"
        A[React Frontend]
        A1[ChatInterface Component]
        A2[InfographicViewer Component]
        A3[PDF Generation Utils]
        A4[Authentication Context]
    end
    
    subgraph "API Gateway Layer (Port 8001)"
        B[FastAPI Storage Server]
        B1[Authentication Endpoints]
        B2[Session Management APIs]
        B3[Message Handling APIs]
        B4[MongoDB Integration]
    end
    
    subgraph "AI Processing Layer (Port 8000)"
        C[Google ADK Server]
        C1[Gemini 2.0 Flash Integration]
        C2[Conversational AI Engine]
        C3[Infographic Generation]
        C4[Google Search Integration]
    end
    
    subgraph "Data Layer"
        D[MongoDB Atlas]
        D1[(Users Collection)]
        D2[(Sessions Collection)]
        D3[(Messages Collection)]
        D4[(Infographics Collection)]
    end
    
    A --> B
    B --> C
    B --> D
    C --> E[Google Cloud AI Platform]
    C --> F[Google Custom Search API]
    
    A1 --> A2
    A2 --> A3
    B1 --> B2
    B2 --> B3
    B3 --> B4
    C1 --> C2
    C2 --> C3
    C3 --> C4
```

### 3.3.2 Use Case Diagram

```mermaid
graph TD
    User((User))
    Admin((System Admin))
    AIAgent((AI Agent))
    
    subgraph "User Management"
        UC1[Register Account]
        UC2[User Login]
        UC3[Manage Profile]
    end
    
    subgraph "Session Management"
        UC4[Create New Session]
        UC5[View Session History]
        UC6[Resume Session]
        UC7[Delete Session]
    end
    
    subgraph "AI Analysis"
        UC8[Submit Business Query]
        UC9[Receive AI Response]
        UC10[Generate SWOT Analysis]
        UC11[Create Infographics]
    end
    
    subgraph "Export & Sharing"
        UC12[View Infographics]
        UC13[Export to PDF]
        UC14[Download HTML]
        UC15[Open in New Tab]
    end
    
    subgraph "System Administration"
        UC16[Monitor System Health]
        UC17[Manage User Accounts]
        UC18[View Analytics]
        UC19[Configure AI Parameters]
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15
    
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    
    AIAgent --> UC10
    AIAgent --> UC11
    
    UC8 --> UC9
    UC9 --> UC10
    UC10 --> UC11
    UC11 --> UC12
```

### 3.3.3 Class Diagram

```mermaid
classDiagram
    class User {
        +string userId
        +string username
        +string email
        +string passwordHash
        +Date createdAt
        +Date lastLoginAt
        +boolean isActive
        +register()
        +login()
        +updateProfile()
        +changePassword()
    }
    
    class UserSession {
        +string sessionId
        +string userId
        +string appName
        +Date startTime
        +Date lastActivity
        +boolean isActive
        +Map~string, any~ metadata
        +createSession()
        +updateActivity()
        +endSession()
    }
    
    class ChatMessage {
        +string messageId
        +string sessionId
        +string userId
        +string role
        +string content
        +number timestamp
        +Array~InfographicData~ infographics
        +sendMessage()
        +addInfographic()
        +getMessageHistory()
    }
    
    class InfographicData {
        +string id
        +string contentType
        +string htmlCode
        +string rawCode
        +number partIndex
        +Date createdAt
        +generatePDF()
        +exportHTML()
        +openInNewTab()
    }
    
    class AIAgent {
        +string agentId
        +string model
        +Map~string, any~ configuration
        +processQuery()
        +generateSWOT()
        +createInfographic()
        +searchWeb()
    }
    
    class StorageServer {
        +FastAPI app
        +MongoClient database
        +JWTManager auth
        +authenticateUser()
        +createSession()
        +saveMessage()
        +getConversation()
    }
    
    class PDFGenerator {
        +html2canvas renderer
        +jsPDF creator
        +generatePDF()
        +captureElement()
        +optimizeLayout()
    }
    
    User ||--o{ UserSession : creates
    UserSession ||--o{ ChatMessage : contains
    ChatMessage ||--o{ InfographicData : includes
    AIAgent ||--|| ChatMessage : processes
    StorageServer ||--|| User : manages
    StorageServer ||--|| UserSession : handles
    StorageServer ||--|| ChatMessage : stores
    PDFGenerator ||--|| InfographicData : converts
```

### 3.3.4 Sequence Diagram - SWOT Analysis Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as React Frontend
    participant S as Storage Server
    participant A as ADK Server
    participant G as Google Gemini
    participant D as MongoDB
    
    U->>F: Submit business query
    F->>F: Validate input
    F->>S: POST /api/send-message
    S->>S: Authenticate JWT token
    S->>D: Save user message
    S->>A: Forward query to ADK
    A->>G: Process with Gemini 2.0 Flash
    G->>A: Return AI analysis + infographic HTML
    A->>S: Return structured response
    S->>D: Save AI response + infographics
    S->>F: Return message with infographics
    F->>F: Render chat message
    F->>F: Display infographic chips
    U->>F: Click "View Infographic"
    F->>F: Open InfographicViewer modal
    U->>F: Click "Download PDF"
    F->>F: Trigger PDF generation
    F->>F: Use html2canvas + jsPDF
    F->>U: Download PDF file
```

### 3.3.5 Activity Diagram - PDF Generation Process

```mermaid
graph TD
    A[User Clicks Download PDF] --> B[Initialize PDF Generator]
    B --> C[Create Temporary DOM Container]
    C --> D[Extract CSS Styles from Infographic]
    D --> E[Apply Styles to Container]
    E --> F[Insert HTML Content]
    F --> G[Wait for Content Rendering]
    G --> H[Capture with html2canvas]
    H --> I{Capture Successful?}
    
    I -->|No| J[Try Alternative Method]
    J --> K[Open in Popup Window]
    K --> L[Capture Popup Content]
    L --> M{Alternative Success?}
    
    M -->|No| N[Use Simple Fallback Method]
    N --> O[Basic Container Approach]
    O --> P[Continue to PDF Creation]
    
    I -->|Yes| P[Create jsPDF Instance]
    M -->|Yes| P
    
    P --> Q[Calculate Optimal Dimensions]
    Q --> R[Determine Orientation]
    R --> S[Add Image to PDF]
    S --> T[Add Metadata Footer]
    T --> U[Add Branding Elements]
    U --> V[Generate Filename with Timestamp]
    V --> W[Save PDF File]
    W --> X[Clean Up DOM Elements]
    X --> Y[Notify User of Success]
    
    style I fill:#e1f5fe
    style M fill:#e1f5fe
    style Y fill:#c8e6c9
```

### 3.3.6 Data Model & Database Schema

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : creates
    SESSIONS ||--o{ MESSAGES : contains
    MESSAGES ||--o{ INFOGRAPHICS : includes
    
    USERS {
        ObjectId _id PK
        string userId UK
        string username
        string email UK
        string passwordHash
        datetime createdAt
        datetime lastLoginAt
        boolean isActive
        object profile
    }
    
    SESSIONS {
        ObjectId _id PK
        string sessionId UK
        string userId FK
        string appName
        datetime startTime
        datetime lastActivity
        boolean isActive
        object metadata
        array messageIds
    }
    
    MESSAGES {
        ObjectId _id PK
        string messageId UK
        string sessionId FK
        string userId FK
        string role "user|assistant"
        string content
        number timestamp
        array infographicIds
        object metadata
    }
    
    INFOGRAPHICS {
        ObjectId _id PK
        string infographicId UK
        string messageId FK
        string contentType
        string htmlCode
        string rawCode
        number partIndex
        datetime createdAt
        object styling
    }
```

### 3.3.7 Component Architecture Diagram

```mermaid
flowchart TD
    subgraph FA["Frontend Architecture"]
        direction TB
        A[App.tsx - Root Component]
        A --> B[Router Configuration]
        A --> C[Theme Provider]
        A --> D[Auth Context]
        A --> E[Session Context]
        
        B --> F[Landing Page]
        B --> G[Auth Page]
        B --> H[Dashboard Page]
        B --> I[AI Page]
        
        I --> J[ChatInterface]
        J --> K[InfographicViewer]
        K --> L[PDF Generator Utils]
        
        M[Shared Components]
        M --> M1[ProtectedRoute]
        M --> M2[SessionForm]
        M --> M3[StorageTestComponent]
        
        N[Custom Hooks]
        N --> N1[useStorageApi]
        N --> N2[useSessionContext]
        N --> N3[useBrowserStorage]
        
        O[Services Layer]
        O --> O1[browserStorage.ts]
        O --> O2[storage.ts]
        O --> O3[database.ts]
    end
    
    subgraph BA["Backend Architecture"]
        direction TB
        P[Storage Server - FastAPI]
        P --> P1[Authentication Routes]
        P --> P2[Session Management]
        P --> P3[Message Handling]
        P --> P4[Database Integration]
        
        Q[ADK Server]
        Q --> Q1[Agent Processing]
        Q --> Q2[Gemini Integration]
        Q --> Q3[Search Integration]
        Q --> Q4[Response Formatting]
    end
    
    FA --> BA
    J -.->|API Calls| P
    P -.->|AI Processing| Q
```

### 3.3.8 Deployment Architecture

```mermaid
flowchart TD
    subgraph DEV["Development Environment"]
        direction TB
        A[Developer Machine]
        A --> A1[VS Code IDE]
        A --> A2[Node.js Runtime]
        A --> A3[Python Runtime]
        A --> A4[Local Testing]
    end
    
    subgraph BDP["Build & Deploy Pipeline"]
        direction TB
        B[Version Control - Git]
        B --> C[Build Process]
        C --> C1[Vite Build - Frontend]
        C --> C2[Python Package - Backend]
        C --> C3[Docker Containerization]
    end
    
    subgraph PROD["Production Environment"]
        direction TB
        D[Load Balancer]
        D --> E[Frontend Server - Nginx]
        D --> F[API Gateway]
        
        E --> E1[Static React Build]
        F --> F1[Storage Server Instances]
        F --> F2[ADK Server Instances]
        
        F1 --> G[MongoDB Atlas Cluster]
        F2 --> H[Google Cloud AI Platform]
        
        I[CDN - Content Delivery]
        I --> E1
        
        J[Monitoring & Logging]
        J --> J1[Application Metrics]
        J --> J2[Error Tracking]
        J --> J3[Performance Analytics]
    end
    
    DEV --> BDP
    BDP --> PROD
```

### 3.3.9 Data Relationships and Schema Design

The AgentSwot platform employs a MongoDB Atlas NoSQL database architecture designed to support scalable, flexible document storage while maintaining clear relational patterns between core entities. The database schema consists of four primary collections that work together to provide comprehensive user session management, conversation tracking, and infographic storage capabilities.

**Users Collection Schema:**
The Users collection serves as the foundational identity management system, storing essential user account information including authentication credentials, profile data, and account status tracking. Each user document contains a unique `userId` field generated using UUID4 for global uniqueness, ensuring secure user identification across distributed systems. The `passwordHash` field utilizes bcrypt encryption with salt rounds for secure credential storage, while the `email` field enforces uniqueness constraints to prevent duplicate accounts. Additional fields include `username` for display purposes, `createdAt` and `lastLoginAt` timestamps for account analytics, `isActive` boolean for account status management, and a flexible `profile` object containing user preferences and customizable metadata.

**Sessions Collection Relationships:**
The Sessions collection maintains a direct foreign key relationship with Users through the `userId` field, establishing a **1:N relationship** (One User : Many Sessions) where each user can create multiple analysis sessions while each session belongs to exactly one user. This relationship pattern allows:
- **Users (1) ← → Sessions (N)**: One user can initiate multiple SWOT analysis projects
- **Foreign Key**: `userId` in Sessions collection references `userId` in Users collection
- **Cardinality**: Minimum 0 sessions per user, maximum unlimited sessions per user

Each session document includes a unique `sessionId` for direct reference, `appName` for application context tracking, temporal fields (`startTime`, `lastActivity`, `endTime`) for session lifecycle management, and an `isActive` boolean for session state control. The `metadata` object provides extensible storage for business context information such as industry type, company size, and analysis goals, while the `messageIds` array maintains ordered references to associated conversation messages for efficient query optimization.

**Messages Collection Architecture:**
The Messages collection implements a dual foreign key structure with **two 1:N relationships**, referencing both Sessions (`sessionId`) and Users (`userId`) to enable flexible querying patterns for both user-centric and session-centric data retrieval:

- **Users (1) ← → Messages (N)**: One user can author many messages across all their sessions
- **Sessions (1) ← → Messages (N)**: One session contains many conversational messages  
- **Foreign Keys**: `userId` references Users collection, `sessionId` references Sessions collection
- **Cardinality**: Each message belongs to exactly one user and exactly one session

This **many-to-one-to-one relationship pattern** (Messages N:1 Sessions N:1 Users) creates a hierarchical data structure where messages are contained within sessions, which are owned by users. Each message document contains a unique `messageId`, role designation (`user` or `assistant`) for conversation flow management, message content, precise timestamp for chronological ordering, and an `infographicIds` array linking to associated visual content. This design supports efficient conversation reconstruction while maintaining referential integrity across user sessions and enabling advanced analytics on conversation patterns and user engagement metrics.

**Infographics Collection Integration:**
The Infographics collection establishes a **N:1 relationship** (Many Infographics : One Message) with Messages through the `messageId` foreign key, allowing multiple infographic elements to be associated with a single AI response while maintaining individual tracking and version control:

- **Messages (1) ← → Infographics (N)**: One message can generate multiple infographic variations
- **Foreign Key**: `messageId` in Infographics collection references `messageId` in Messages collection  
- **Cardinality**: Minimum 0 infographics per message, maximum unlimited infographics per message
- **Business Logic**: Supports iterative infographic generation and A/B testing of visual designs

Each infographic document includes a unique `infographicId`, `contentType` classification for rendering optimization, complete `htmlCode` and `rawCode` storage for multi-format support, `partIndex` for ordered display within message contexts, creation timestamps, and flexible `styling` objects for customization. This structure enables efficient PDF generation, HTML export, and future enhancement capabilities while preserving the complete infographic generation context.

**Complete Relationship Model Summary:**
The AgentSwot database implements a hierarchical relationship structure with clear cardinality constraints:

```
Users (1) ──1:N──→ Sessions (N) ──1:N──→ Messages (N) ──1:N──→ Infographics (N)
   │                                │
   └────────────1:N─────────────────┘
```

**Relationship Cardinality Table:**
| Parent Collection | Child Collection | Relationship | Cardinality | Foreign Key | Business Rule |
|-------------------|------------------|--------------|-------------|-------------|---------------|
| Users | Sessions | 1:N | 1 user : 0+ sessions | userId | Users can create multiple SWOT projects |
| Users | Messages | 1:N | 1 user : 0+ messages | userId | Users can participate in multiple conversations |
| Sessions | Messages | 1:N | 1 session : 2+ messages | sessionId | Sessions require conversational interaction |
| Messages | Infographics | 1:N | 1 message : 0+ infographics | messageId | Messages can generate multiple visualizations |

**Referential Integrity and Query Optimization:**
The database design implements logical referential integrity through application-level constraints and MongoDB indexing strategies. Compound indexes on `(userId, sessionId)` and `(sessionId, timestamp)` optimize common query patterns for session retrieval and conversation loading. The schema supports efficient cascade operations for session cleanup and user account management while maintaining data consistency across related collections. Foreign key relationships enable advanced analytics queries such as user engagement tracking, session duration analysis, and infographic generation patterns. The flexible document structure accommodates future feature expansion without requiring schema migrations, supporting rapid platform evolution and enhanced functionality development.

This comprehensive Chapter 3 provides detailed system design documentation with multiple Mermaid diagrams covering all aspects of your AgentSwot architecture, from high-level system overview to detailed component interactions and comprehensive data model relationships.
List OS, programming languages, frameworks, libraries, database, IDE, and any external APIs.

Example:
 OS:
 Language:
 Libraries: (if used)
 Database:
3.2 Hardware Requirements
State minimum and recommended hardware: CPU, RAM, storage, GPU (if required), and
network needs. Example: “Min: 4-core CPU, 8 GB RAM, 100 GB disk; Recommended: 8-core,
16 GB RAM, GPU with 4 GB VRAM.”
3.3 Design (Architecture, UML diagrams, Data Model)
 Provide a one-paragraph overview of the architecture (client-server, microservices,
layered).
 Include diagrams: a high-level System Architecture diagram, Use Case diagram, one
Class diagram and one Sequence or Activity diagram.
 Describe data model/schema: tables, key fields and relationships (ER diagram).