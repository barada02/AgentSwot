import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import type { UserSession, ChatMessage, RunRequest } from '../types';

interface ChatInterfaceProps {
  userSession: UserSession;
  onBackToSession: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userSession, onBackToSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { loading, getSession, sendMessage } = useApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession(userSession);
        setSessionInfo(session);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };

    fetchSession();
  }, [userSession, getSession]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    // Add a temporary "thinking" message
    const thinkingMessage: ChatMessage = {
      id: 'thinking-' + Date.now(),
      role: 'assistant',
      content: '🤔 Analyzing your request... This may take up to 2-3 minutes for a comprehensive SWOT analysis.',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const runRequest: RunRequest = {
        app_name: userSession.appName,
        user_id: userSession.userId,
        session_id: userSession.sessionId,
        new_message: {
          role: 'user',
          parts: [{ text: currentMessage }],
        },
        streaming: false,
      };

      const responses = await sendMessage(runRequest);
      
      // Remove the thinking message and add the actual response
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      if (responses && responses.length > 0) {
        const agentMessage: ChatMessage = {
          id: responses[0].id,
          role: 'assistant',
          content: responses[0].content.parts[0]?.text || 'No response received',
          timestamp: responses[0].timestamp,
        };
        
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Remove the thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      let errorMessage = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'The analysis is taking longer than expected. Please try with a shorter, more specific request or try again later.';
      }
      
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const refreshSession = async () => {
    try {
      const session = await getSession(userSession);
      setSessionInfo(session);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ mt: 2, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1">
              SWOT Analysis Agent
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={refreshSession} disabled={loading}>
                <RefreshIcon />
              </IconButton>
              <Button variant="outlined" onClick={onBackToSession}>
                New Session
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`User: ${userSession.userId}`} color="primary" size="small" />
            <Chip label={`Session: ${userSession.sessionId}`} color="secondary" size="small" />
            <Chip label={`App: ${userSession.appName}`} color="default" size="small" />
            {sessionInfo && (
              <Chip 
                label={`Last Updated: ${new Date(sessionInfo.lastUpdateTime * 1000).toLocaleTimeString()}`} 
                color="default" 
                size="small" 
              />
            )}
          </Box>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Welcome!</strong> Ask me to analyze your business or product. 
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Examples:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • "I want to launch a product, it's a jar of healthy fruits"<br />
                • "Analyze my coffee shop business idea"<br />
                • "SWOT analysis for a mobile app for fitness tracking"
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                ⏱️ <em>Note: Comprehensive analysis may take 2-3 minutes</em>
              </Typography>
            </Alert>
          ) : null}

          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                mb: 2,
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  mx: 1,
                  bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main',
                }}
              >
                {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
              </Avatar>
              
              <Card
                sx={{
                  maxWidth: '70%',
                  bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
          
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Describe your business or product for SWOT analysis..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInterface;
