import React, { useState } from 'react';
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
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Psychology as AIIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BaseLayout from './BaseLayout';
import SessionHistorySection from '../components/SessionHistorySection';
import logoImage from '../assets/logo.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onSessionSelect?: (sessionId: string) => void;
  selectedSessionId?: string;
  showSessionHistory?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  onSessionSelect,
  selectedSessionId,
  showSessionHistory = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'AI', icon: <AIIcon />, path: '/ai' },
  ];

  return (
    <BaseLayout>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Enhanced Sidebar */}
        <Box
          sx={{
            width: showSessionHistory ? 320 : 80,
            bgcolor: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease-in-out',
          }}
        >
          {/* Logo and Navigation */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: showSessionHistory ? 'row' : 'column',
            alignItems: 'center',
            p: 2,
            gap: showSessionHistory ? 2 : 0,
          }}>
            {/* Logo */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: showSessionHistory ? 0 : 4,
                flexShrink: 0,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <img 
                src={logoImage} 
                alt="AgentSwot Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  padding: '4px'
                }}
              />
            </Box>

            {/* Navigation Icons */}
            {showSessionHistory && (
              <List sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexGrow: 1 }}>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItem
                      key={item.text}
                      onClick={() => navigate(item.path)}
                      sx={{
                        width: 'auto',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: isActive ? '#6366f1' : 'transparent',
                        color: isActive ? 'white' : '#6b7280',
                        px: 2,
                        py: 1,
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
                          mr: 1,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        sx={{
                          '& .MuiTypography-root': {
                            fontSize: '0.9rem',
                            fontWeight: isActive ? 600 : 500,
                          }
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>

          {/* Compact Navigation (when history not shown) */}
          {!showSessionHistory && (
            <List sx={{ px: 1 }}>
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
          )}

          {/* Session History Section */}
          {showSessionHistory && onSessionSelect && (
            <>
              <Divider sx={{ mx: 2 }} />
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <SessionHistorySection 
                  onSessionSelect={onSessionSelect}
                  selectedSessionId={selectedSessionId}
                />
              </Box>
            </>
          )}

          {/* User Avatar at Bottom */}
          <Box sx={{ p: 2, mt: 'auto' }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0, width: '100%', borderRadius: 2 }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#6366f1',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  mx: showSessionHistory ? 0 : 'auto',
                }}
              >
                {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <MenuItem>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={user?.name || 'User'} />
              </MenuItem>
              <MenuItem>
                <ListItemText 
                  primary={user?.email || 'No email'} 
                  sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
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
