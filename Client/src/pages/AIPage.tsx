import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Assessment as InfographicIcon,
} from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';

const AIPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'infographic'>('chat');

  // For now, we'll show placeholders until the components are properly integrated
  const mockUserSession = {
    id: '1',
    name: 'New Analysis',
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  return (
    <DashboardLayout>
      <Box sx={{ height: 'calc(100vh - 120px)' }}>
        {/* View Toggle */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant={activeView === 'chat' ? 'contained' : 'outlined'}
            startIcon={<ChatIcon />}
            onClick={() => setActiveView('chat')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            AI Chat
          </Button>
          <Button
            variant={activeView === 'infographic' ? 'contained' : 'outlined'}
            startIcon={<InfographicIcon />}
            onClick={() => setActiveView('infographic')}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Infographic
          </Button>
        </Box>

        {/* Content Area */}
        <Paper 
          sx={{ 
            height: 'calc(100% - 60px)',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {activeView === 'chat' ? (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  AI Business Analysis Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Describe your business and get intelligent SWOT analysis
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Chat interface will be integrated here. For now, this is a placeholder.
                </Alert>
                <Typography variant="body1" color="text.secondary">
                  The ChatInterface component requires session management integration. 
                  We'll connect this properly with the backend in the next iteration.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Analysis Infographic
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual representation of your business analysis
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Infographic viewer will be displayed here. For now, this is a placeholder.
                </Alert>
                <Typography variant="body1" color="text.secondary">
                  The InfographicViewer component will show generated SWOT analysis charts and visualizations.
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default AIPage;
