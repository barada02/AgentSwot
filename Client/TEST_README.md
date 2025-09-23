# API & Storage Integration Test

This test file validates the integration between the ADK (Agent Development Kit) server and MongoDB storage server.

## Prerequisites

1. **Install tsx dependency** (if not already installed):
   ```bash
   npm install tsx --save-dev
   ```

2. **Start ADK Server**:
   ```bash
   cd agentsvertex
   pip install deprecated  # If missing
   adk api_server
   # OR
   adk web
   ```
   The ADK server should be running on `http://127.0.0.1:8000`

3. **Start Storage Server**:
   ```bash
   cd agentsvertex
   python storage_server.py
   ```
   The storage server should be running on `http://127.0.0.1:8001`

## Running the Test

From the Client directory, run:

```bash
npm run test:api
```

Or directly with tsx:
```bash
npx tsx src/test-api-storage.ts
```

## Test Flow

The test follows the standard workflow:

1. **Connection Tests**
   - Test ADK API connection (`GET /list-apps`)
   - Test Storage API connection (`GET /health`)

2. **Session Creation**
   - Create session with ADK server (`POST /apps/{app}/users/{user}/sessions/{session}`)
   - Create session in MongoDB storage (`POST /sessions`)

3. **Message Processing**
   - Send test message to ADK (`POST /run`)
   - Save message to storage (`POST /messages`)

4. **Storage Operations**
   - Retrieve storage statistics (`GET /stats`)

## Expected Output

The test will show:
- ✅ Green checkmarks for successful operations
- ❌ Red X marks for failed operations
- 🔵 Blue dots for steps in progress
- ⚠️ Yellow warnings for configuration issues

## Troubleshooting

### Common Issues

1. **ADK Connection Failed**
   - Ensure ADK server is running: `adk web`
   - Check if `deprecated` module is installed: `pip install deprecated`

2. **Storage Connection Failed**
   - Ensure storage server is running: `python storage_server.py`
   - Check MongoDB connection string in `storage_server.py`

3. **Session Creation Failed**
   - Verify `multi_tool_agent` app exists in ADK
   - Check database permissions in MongoDB

4. **CORS Errors**
   - These should not occur in this direct API test
   - If they do, check server configurations

## Test Configuration

The test uses these default settings:
- ADK Server: `http://127.0.0.1:8000`
- Storage Server: `http://127.0.0.1:8001`
- Test User ID: `test-user-{timestamp}`
- Test Session ID: `test-session-{timestamp}`
- App Name: `multi_tool_agent`

You can modify these in the `test-api-storage.ts` file if needed.