# Agent SWOT Analysis - React Client

This is the React frontend for the Agent SWOT Analysis system that integrates with the ADK (Agent Development Kit) FastAPI backend.

## Features

- **Session Management**: Create and manage user sessions with the agent
- **Real-time Chat**: Interactive chat interface for SWOT analysis  
- **API Integration**: Full integration with the ADK FastAPI endpoints
- **Material-UI**: Modern and responsive user interface
- **TypeScript**: Type-safe development

## API Endpoints Used

1. `GET /list-apps` - Check API connection and list available apps
2. `POST /apps/{app_name}/users/{user_id}/sessions/{session_id}` - Create new session
3. `GET /apps/{app_name}/users/{user_id}/sessions/{session_id}` - Get session info
4. `POST /run` - Send messages to the agent for SWOT analysis

## Usage

1. **Start Session**: Enter your user ID and generate or enter a session ID
2. **Chat with Agent**: Describe your business or product idea
3. **Get SWOT Analysis**: The agent will analyze and provide insights

## Example Queries

- "I want to launch a product, it's a jar of healthy fruits"
- "Analyze my coffee shop business idea"  
- "SWOT analysis for a mobile app for fitness tracking"

## Development

```bash
npm run dev
```

Make sure the ADK FastAPI server is running on `http://127.0.0.1:8000` before using the client.
