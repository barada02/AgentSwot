# MongoDB Storage Integration Setup

This document explains how to set up MongoDB Atlas storage for the AgentSwot frontend client.

## 🗄️ Database Architecture

The frontend now includes comprehensive MongoDB storage capabilities using **Alternative 2** approach - frontend-side storage that works alongside the existing ADK backend without requiring any backend modifications.

### Collections Structure

```javascript
// Sessions Collection
sessions: {
  _id: ObjectId,
  sessionId: String (unique),
  userId: String,
  appName: String,
  title: String,
  status: String, // 'active' | 'completed' | 'archived'
  createdAt: Date,
  updatedAt: Date,
  lastActivity: Date,
  messageCount: Number,
  hasInfographics: Boolean,
  tags: [String],
  metadata: {
    totalTokens: Number,
    avgResponseTime: Number,
    firstUserMessage: String
  }
}

// Messages Collection
messages: {
  _id: ObjectId,
  sessionId: String,
  messageId: String,
  role: String, // 'user' | 'assistant'
  content: String,
  timestamp: Date,
  partCount: Number,
  metadata: {
    hasMultipleParts: Boolean,
    hasInfographic: Boolean,
    infographics: Array
  }
}

// Infographics Collection
infographics: {
  _id: ObjectId,
  infographicId: String,
  sessionId: String,
  messageId: String,
  contentType: String,
  htmlCode: String,
  rawCode: String,
  partIndex: Number,
  createdAt: Date,
  metadata: {
    size: Number,
    hasInteractivity: Boolean,
    exportCount: Number
  }
}
```

## 🚀 Setup Instructions

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Sandbox is free)

2. **Create Database User**
   - Go to Database Access
   - Add new database user
   - Set username/password
   - Grant "Read and write to any database" permission

3. **Configure Network Access**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere)
   - Or add your specific IP for security

4. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password

### Step 2: Environment Configuration

Update your `.env` file with your MongoDB Atlas connection string:

```env
# MongoDB Atlas Configuration
VITE_MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/agentswot?retryWrites=true&w=majority

# Database Configuration
VITE_DB_NAME=agentswot

# Collections (optional - defaults provided)
VITE_SESSIONS_COLLECTION=sessions
VITE_MESSAGES_COLLECTION=messages
VITE_INFOGRAPHICS_COLLECTION=infographics
VITE_USERS_COLLECTION=users

# API Configuration (existing)
VITE_API_BASE_URL=http://127.0.0.1:8000

# Environment
VITE_APP_ENV=development
```

### Step 3: Install Dependencies

```bash
cd Client
npm install
# mongodb package is already added to package.json
```

### Step 4: Test Connection

The storage service will automatically initialize when the app starts. Check the browser console for:
- `✅ Connected to MongoDB Atlas`
- `✅ Storage service initialized`

## 📁 File Structure

```
src/
├── services/
│   ├── database.ts          # MongoDB connection service
│   └── storage.ts           # Main storage operations
├── hooks/
│   └── useStorage.ts        # React hook for storage operations
├── types/
│   └── storage.ts           # TypeScript types for storage
└── components/
    └── ...                  # Existing components (will be enhanced)
```

## 🔧 Usage Examples

### Using the Storage Hook

```typescript
import { useStorage } from '../hooks/useStorage';

const MyComponent = () => {
  const {
    isInitialized,
    isLoading,
    error,
    createSession,
    saveConversationData,
    getUserSessions,
    restoreSession
  } = useStorage();

  // Check if storage is ready
  if (!isInitialized) {
    return <div>Initializing storage...</div>;
  }

  // Create new session
  const handleCreateSession = async () => {
    const session = await createSession({
      sessionId: 'session-123',
      userId: 'user-456',
      appName: 'multi_tool_agent',
      title: 'New SWOT Analysis'
    });
  };

  // Save conversation data
  const handleSaveConversation = async (userMessage, agentResponses, sessionId) => {
    const success = await saveConversationData(userMessage, agentResponses, sessionId);
  };

  // Get user's sessions
  const handleGetSessions = async () => {
    const result = await getUserSessions('user-456', {}, { page: 1, limit: 10 });
  };

  // Restore existing session
  const handleRestoreSession = async (sessionId) => {
    const { messages, infographics, session } = await restoreSession(sessionId);
  };
};
```

### Direct Storage Service Usage

```typescript
import storageService from '../services/storage';

// Initialize (usually done automatically)
await storageService.initialize();

// Save session
const session = await storageService.createSession({
  sessionId: 'session-123',
  userId: 'user-456',
  appName: 'multi_tool_agent'
});

// Get session history
const messages = await storageService.getSessionMessages('session-123');
const infographics = await storageService.getSessionInfographics('session-123');

// Update session
await storageService.updateSession('session-123', {
  title: 'Coffee Shop SWOT Analysis',
  tags: ['coffee', 'retail', 'startup']
});
```

## 🔄 Integration with Existing Code

The storage system is designed to work seamlessly with existing components:

### ChatInterface Integration

The `ChatInterface` component will be enhanced to:
- Automatically save conversations to MongoDB
- Restore chat history when opening existing sessions
- Store infographics as they're generated

### Dashboard Integration

The `DashboardPage` will be enhanced to:
- Display session history from MongoDB
- Show analytics and statistics
- Provide session management features

### Enhanced Features Coming

1. **Session History Browser** - Browse and search past sessions
2. **Infographic Gallery** - View all generated infographics
3. **Export Capabilities** - Export sessions and infographics
4. **Analytics Dashboard** - Usage statistics and insights
5. **Session Management** - Rename, tag, and organize sessions

## 🔒 Security Considerations

1. **Environment Variables**: Never commit real MongoDB credentials to Git
2. **Network Security**: Consider IP whitelisting for production
3. **Data Validation**: All data is validated before storage
4. **Error Handling**: Graceful degradation if storage fails

## 🚨 Error Handling

The storage system includes comprehensive error handling:
- Connection failures don't break the app
- Storage failures are logged but don't interrupt chat flow
- Automatic retry mechanisms for transient failures
- User-friendly error messages

## 📊 Monitoring

Monitor your MongoDB Atlas cluster:
- Database size and document count
- Connection metrics
- Query performance
- Error rates

## 🔄 Next Steps

After setup, the storage system will:
1. Automatically store all new conversations
2. Enable session restoration
3. Provide analytics data
4. Support advanced features like search and export

The frontend will be enhanced with new components to take full advantage of the stored data!