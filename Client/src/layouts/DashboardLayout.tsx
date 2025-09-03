import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import BaseLayout from './BaseLayout';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'AI', icon: <AIIcon />, path: '/ai' },
  ];

  const user = {
    name: 'John Doe',
  };

  return (
    <BaseLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Minimal Sidebar */}
        <Box
          sx={{
            width: 80,
            bgcolor: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
              mb: 4,
            }}
          >
            AS
          </Box>

          {/* Navigation Icons */}
          <List sx={{ width: '100%', px: 1 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    flexDirection: 'column',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: isActive ? '#6366f1' : 'transparent',
                    color: isActive ? 'white' : '#6b7280',
                    px: 1,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: isActive ? '#5855eb' : '#f3f4f6',
                      color: isActive ? 'white' : '#374151',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: 'inherit',
                      minWidth: 'auto',
                      mb: 0.5,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      textAlign: 'center',
                      '& .MuiTypography-root': {
                        fontSize: '0.7rem',
                        fontWeight: isActive ? 600 : 500,
                      }
                    }}
                  />
                </ListItem>
              );
            })}
          </List>

          {/* User Avatar at Bottom */}
          <Box sx={{ mt: 'auto' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#6366f1',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {user.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          {/* Top Bar */}
          <AppBar
            position="static"
            elevation={0}
            sx={{
              bgcolor: 'white',
              color: '#111827',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <Toolbar>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Content */}
          <Box sx={{ flex: 1, p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </BaseLayout>
  );
};

export default DashboardLayout;
