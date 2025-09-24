import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Chat,
  Image,
  Link as LinkIcon,
  MoreVert,
} from '@mui/icons-material';
import { useStorageApi } from '../hooks/useStorageApi';
import { useAuth } from '../contexts/AuthContext';
import type { StorageApiSessionResponse } from '../hooks/useStorageApi';

interface SessionHistorySectionProps {
  onSessionSelect: (sessionId: string) => void;
  selectedSessionId?: string;
}

const SessionHistorySection: React.FC<SessionHistorySectionProps> = ({
  onSessionSelect,
  selectedSessionId,
}) => {
  const [sessions, setSessions] = useState<StorageApiSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllSessions } = useStorageApi();
  const { user } = useAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionsData = await getAllSessions(); // Now uses authenticated user
      setSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getSessionTitle = (session: StorageApiSessionResponse) => {
    return `Analysis ${session.sessionId.slice(-6)}`;
  };

  if (loading) {
    return (
      <Box sx={{ px: 1, py: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, px: 1, fontWeight: 600, color: '#6b7280' }}>
          HISTORY
        </Typography>
        {[1, 2, 3].map((i) => (
          <Box key={i} sx={{ mb: 1, px: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ px: 1, py: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 2, px: 1, fontWeight: 600, color: '#6b7280' }}>
        HISTORY ({sessions.length})
      </Typography>
      
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          {sessions.map((session) => {
            const isSelected = session.sessionId === selectedSessionId;
            
            return (
              <ListItem
                key={session.sessionId}
                onClick={() => onSessionSelect(session.sessionId)}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderRadius: 2,
                  mb: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: isSelected ? '#6366f1' : 'transparent',
                  color: isSelected ? 'white' : '#374151',
                  px: 1.5,
                  py: 1.5,
                  border: '1px solid',
                  borderColor: isSelected ? '#6366f1' : '#e5e7eb',
                  '&:hover': {
                    backgroundColor: isSelected ? '#5855eb' : '#f9fafb',
                    borderColor: isSelected ? '#5855eb' : '#d1d5db',
                  },
                }}
              >
                {/* Session Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                  <Chat sx={{ fontSize: 14, mr: 1, opacity: 0.7 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      flex: 1,
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getSessionTitle(session)}
                  </Typography>
                  <Tooltip title="Session options">
                    <IconButton
                      size="small"
                      sx={{ 
                        color: 'inherit', 
                        opacity: 0.6,
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show session options menu
                      }}
                    >
                      <MoreVert sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Session Metadata */}
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.7,
                      fontSize: '0.7rem',
                      flex: 1,
                    }}
                  >
                    {formatDate(session.lastActivity)}
                  </Typography>
                  
                  {/* Content indicators */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip
                      label={session.messageCount}
                      size="small"
                      icon={<Chat sx={{ fontSize: 10 }} />}
                      sx={{
                        height: 16,
                        fontSize: '0.6rem',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                        color: isSelected ? 'white' : '#6b7280',
                        '& .MuiChip-icon': {
                          color: 'inherit',
                          fontSize: 10,
                        },
                      }}
                    />
                    
                    {session.hasInfographics && (
                      <Tooltip title="Has infographics">
                        <Image 
                          sx={{ 
                            fontSize: 12, 
                            opacity: 0.7,
                            color: isSelected ? 'white' : '#10b981'
                          }} 
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {sessions.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <Chat sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            No sessions yet
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Start a new analysis from Dashboard
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SessionHistorySection;