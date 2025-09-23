import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Person,
  SmartToy,
  Image,
  Link as LinkIcon,
  OpenInNew,
} from '@mui/icons-material';
import { useStorageApi } from '../hooks/useStorageApi';
import InfographicViewer from './InfographicViewer';
import type { 
  StorageApiConversationResponse
} from '../hooks/useStorageApi';

interface SessionDetailViewProps {
  sessionId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {value === index && (
        <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SessionDetailView: React.FC<SessionDetailViewProps> = ({
  sessionId,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [conversation, setConversation] = useState<StorageApiConversationResponse | null>(null);
  const [infographics, setInfographics] = useState<any[]>([]);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfographic, setSelectedInfographic] = useState<any>(null);
  const [infographicViewerOpen, setInfographicViewerOpen] = useState(false);

  const { getConversation, getInfographics, getGroundingChunks } = useStorageApi();

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [conversationData, infographicsData, groundingData] = await Promise.all([
        getConversation(sessionId),
        getInfographics(sessionId),
        getGroundingChunks(sessionId),
      ]);

      setConversation(conversationData);
      setInfographics(infographicsData);
      setGroundingChunks(groundingData);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const openInfographic = (infographic: any) => {
    setSelectedInfographic(infographic);
    setInfographicViewerOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ height: '100%', p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height="80%" />
      </Box>
    );
  }

  if (!conversation) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        p: 3 
      }}>
        <SmartToy sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Session not found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The requested session could not be loaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Session Analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`${conversation.totalMessages} messages`}
            icon={<Person />}
            size="small"
          />
          <Chip
            label={`${infographics.length} infographics`}
            icon={<Image />}
            size="small"
            color={infographics.length > 0 ? 'success' : 'default'}
          />
          <Chip
            label={`${groundingChunks.length} references`}
            icon={<LinkIcon />}
            size="small"
            color={groundingChunks.length > 0 ? 'info' : 'default'}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="session detail tabs"
          sx={{ px: 3 }}
        >
          <Tab label="Conversation" id="session-tab-0" />
          <Tab label={`Infographics (${infographics.length})`} id="session-tab-1" />
          <Tab label={`References (${groundingChunks.length})`} id="session-tab-2" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Conversation Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: '100%' }}>
            {conversation.messages.map((message, index) => (
              <Card key={message.messageId} sx={{ mb: 2, border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: message.role === 'user' ? '#6366f1' : '#10b981',
                        width: 32,
                        height: 32,
                      }}
                    >
                      {message.role === 'user' ? <Person /> : <SmartToy />}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(message.timestamp)}
                        </Typography>
                        {message.tokens && (
                          <Chip 
                            label={`${message.tokens} tokens`} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                        {message.content}
                      </Typography>
                      
                      {(message.infographicsCount > 0 || message.groundingChunksCount > 0) && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {message.infographicsCount > 0 && (
                            <Chip
                              label={`${message.infographicsCount} infographic${message.infographicsCount > 1 ? 's' : ''}`}
                              icon={<Image />}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                          {message.groundingChunksCount > 0 && (
                            <Chip
                              label={`${message.groundingChunksCount} reference${message.groundingChunksCount > 1 ? 's' : ''}`}
                              icon={<LinkIcon />}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Infographics Tab */}
        <TabPanel value={tabValue} index={1}>
          {infographics.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {infographics.map((infographic, index) => (
                <Card key={infographic.id} sx={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Infographic {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => openInfographic(infographic)}
                      >
                        <OpenInNew />
                      </IconButton>
                    </Box>
                    
                    <Box
                      sx={{
                        height: 200,
                        border: '1px solid #e5e7eb',
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                      onClick={() => openInfographic(infographic)}
                    >
                      <iframe
                        srcDoc={infographic.htmlCode}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          border: 'none',
                          transform: 'scale(0.5)',
                          transformOrigin: 'top left',
                          pointerEvents: 'none',
                        }}
                        title={`Infographic preview ${index + 1}`}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {new Date(infographic.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Image sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No infographics found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This session didn't generate any visual content
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* References Tab */}
        <TabPanel value={tabValue} index={2}>
          {groundingChunks.length > 0 ? (
            <List>
              {groundingChunks.map((chunk, index) => (
                <ListItem key={chunk.id} sx={{ mb: 1, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinkIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {chunk.title}
                        </Typography>
                        {chunk.url && (
                          <IconButton
                            size="small"
                            onClick={() => window.open(chunk.url, '_blank')}
                          >
                            <OpenInNew sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {chunk.snippet}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {new Date(chunk.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LinkIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No references found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This session didn't include any external references
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>

      {/* Infographic Viewer Modal */}
      {selectedInfographic && (
        <InfographicViewer
          open={infographicViewerOpen}
          onClose={() => {
            setInfographicViewerOpen(false);
            setSelectedInfographic(null);
          }}
          infographic={{
            id: selectedInfographic.id,
            contentType: selectedInfographic.contentType,
            htmlCode: selectedInfographic.htmlCode,
            rawCode: selectedInfographic.htmlCode,
            partIndex: 0,
          }}
        />
      )}
    </Box>
  );
};

export default SessionDetailView;