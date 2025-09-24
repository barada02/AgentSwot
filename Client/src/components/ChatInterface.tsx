import React, { useState, useEffect, useRef } from 'react';
import {
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
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { useStorageApi } from '../hooks/useStorageApi';
import InfographicViewer from './InfographicViewer';
import type { UserSession, InfographicData } from '../types';

interface ChatInterfaceProps {
  userSession: UserSession;
  sessionCreated?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  infographics?: InfographicData[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userSession, sessionCreated = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicData | null>(null);
  const [infographicViewerOpen, setInfographicViewerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { loading, sendMessage, getConversation } = useStorageApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing conversation when component mounts
  useEffect(() => {
    const loadConversation = async () => {
      if (!userSession.sessionId) return;
      
      try {
        const conversation = await getConversation(userSession.sessionId);
        
        // Convert storage API messages to ChatMessage format
        const convertedMessages: ChatMessage[] = conversation.messages.map(msg => ({
          id: msg.messageId,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          infographics: [], // Will be loaded separately if needed
        }));
        
        setMessages(convertedMessages);
        console.log('Loaded conversation:', convertedMessages);
      } catch (error) {
        console.log('No existing conversation found or failed to load:', error);
        // This is expected for new sessions
      }
    };

    if (sessionCreated) {
      loadConversation();
    }
  }, [userSession.sessionId, sessionCreated, getConversation]);

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
    setError(null);

    try {
      // Send message using Storage API
      const response = await sendMessage(
        userSession.sessionId,
        userSession.userId,
        currentMessage,
        userSession.appName
      );

      // Create assistant message from response
      const assistantMessage: ChatMessage = {
        id: response.messageId,
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
        infographics: response.infographics.map((inf, index) => ({
          id: inf.id,
          contentType: inf.contentType,
          htmlCode: inf.htmlCode,
          rawCode: inf.htmlCode,
          partIndex: index,
        })),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.infographics.length > 0) {
        console.log('Received infographics:', response.infographics);
      }
      
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(error.message || 'Failed to send message');
      
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const openInfographic = (infographic: InfographicData) => {
    setSelectedInfographic(infographic);
    setInfographicViewerOpen(true);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BotIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Start Your Business Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Describe your business idea and I'll help you create a comprehensive SWOT analysis
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <Card key={message.id} sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: message.role === 'user' ? '#6366f1' : '#10b981',
                    width: 40,
                    height: 40,
                  }}
                >
                  {message.role === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {message.content}
                  </Typography>
                  
                  {/* Infographics */}
                  {message.infographics && message.infographics.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Generated Infographics:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {message.infographics.map((infographic, index) => (
                          <Chip
                            key={infographic.id}
                            label={`View Infographic ${index + 1}`}
                            onClick={() => openInfographic(infographic)}
                            color="primary"
                            variant="outlined"
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your business idea for SWOT analysis..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: 120,
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>

      {/* Infographic Viewer */}
      {selectedInfographic && (
        <InfographicViewer
          open={infographicViewerOpen}
          onClose={() => {
            setInfographicViewerOpen(false);
            setSelectedInfographic(null);
          }}
          infographic={selectedInfographic}
        />
      )}
    </Box>
  );
};

export default ChatInterface;

