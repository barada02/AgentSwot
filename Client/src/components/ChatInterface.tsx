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
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { useApi } from '../hooks/useApi';
import { countTextParts, debugMessageParts, processMessageWithInfographics } from '../utils/messageUtils';
import InfographicViewer from './InfographicViewer';
import type { UserSession, ChatMessage, RunRequest, InfographicData } from '../types';

interface ChatInterfaceProps {
  userSession: UserSession;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userSession }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicData | null>(null);
  const [infographicViewerOpen, setInfographicViewerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { loading, sendMessage } = useApi();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        const response = responses[0];
        
        // Process message with infographic detection
        const processedMessage = processMessageWithInfographics(response.content);
        const partCount = countTextParts(response.content);
        
        // Debug logging for multi-part messages and infographics
        if (partCount > 1) {
          debugMessageParts(response.content, `Agent Response (${partCount} parts)`);
        }
        
        if (processedMessage.hasInfographics) {
          console.log(`🎨 Found ${processedMessage.infographics.length} infographic(s) in response:`, processedMessage.infographics);
        }
        
        const agentMessage: ChatMessage = {
          id: response.id,
          role: 'assistant',
          content: processedMessage.text,
          timestamp: response.timestamp,
          partCount: partCount,
          metadata: {
            hasMultipleParts: partCount > 1,
            originalParts: response.content.parts,
            hasInfographic: processedMessage.hasInfographics,
            infographics: processedMessage.infographics,
          },
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

  const handleViewInfographic = (infographic: InfographicData) => {
    setSelectedInfographic(infographic);
    setInfographicViewerOpen(true);
  };

  const handleCloseInfographicViewer = () => {
    setInfographicViewerOpen(false);
    setSelectedInfographic(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Messages Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
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
                  {message.metadata?.hasInfographic && (
                    <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                      <Typography variant="caption">
                        📊 This message contains {message.metadata.infographics?.length} infographic(s)
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {message.metadata.infographics?.map((infographic, index) => (
                          <Button
                            key={infographic.id}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mb: 0.5, fontSize: '0.7rem', py: 0.25 }}
                            onClick={() => {
                              console.log('View infographic:', infographic.id);
                              handleViewInfographic(infographic);
                            }}
                          >
                            View Infographic {index + 1}
                          </Button>
                        ))}
                      </Box>
                    </Alert>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {message.metadata?.hasMultipleParts && (
                        <Chip
                          label={`${message.partCount} parts`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            height: 16, 
                            fontSize: '0.6rem',
                            opacity: 0.7,
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                      {message.metadata?.hasInfographic && (
                        <Chip
                          label="📊 Infographic"
                          size="small"
                          color="secondary"
                          variant="filled"
                          sx={{ 
                            height: 16, 
                            fontSize: '0.6rem',
                            '& .MuiChip-label': { px: 0.5 }
                          }}
                        />
                      )}
                    </Box>
                  </Box>
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

      {/* Infographic Viewer Dialog */}
      <InfographicViewer
        infographic={selectedInfographic}
        open={infographicViewerOpen}
        onClose={handleCloseInfographicViewer}
      />
    </Box>
  );
};

export default ChatInterface;
