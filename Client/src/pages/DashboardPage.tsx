import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useSessionContext } from '../context/SessionContext';
import { useStorageApi } from '../hooks/useStorageApi';
import { useAuth } from '../contexts/AuthContext';
import type { StorageApiSessionResponse } from '../hooks/useStorageApi';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(false);
  const [dashboardData, setDashboardData] = useState<{
    totalSessions: number;
    thisMonthSessions: number;
    avgResponseTime: string;
    recentSessions: StorageApiSessionResponse[];
    recentInfographic: { sessionId: string; title: string; createdAt: string } | null;
    dailyActivity: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { createNewSession, clearCurrentSession } = useSessionContext();
  const { createSession, getAllSessions } = useStorageApi();
  const { user } = useAuth();

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const sessions = await getAllSessions();
        
        // Calculate stats from real data
        const totalSessions = sessions.length;
        
        // Calculate this month's sessions
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthSessions = sessions.filter((session: StorageApiSessionResponse) => {
          const sessionDate = new Date(session.lastActivity);
          return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        }).length;
        
        // Calculate average response time (mock calculation based on message count)
        const avgResponseTime = sessions.length > 0 
          ? `${(sessions.reduce((acc: number, session: StorageApiSessionResponse) => acc + session.messageCount, 0) / sessions.length * 0.1).toFixed(1)}s`
          : '0s';
        
        // Get recent sessions (last 5)
        const recentSessions = sessions
          .sort((a: StorageApiSessionResponse, b: StorageApiSessionResponse) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
          .slice(0, 5);

        // Find most recent session with infographics
        const recentInfographic = sessions
          .filter((session: StorageApiSessionResponse) => session.hasInfographics)
          .sort((a: StorageApiSessionResponse, b: StorageApiSessionResponse) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
          .slice(0, 1)[0];

        // Calculate daily activity for last 7 days
        const dailyActivity = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          return sessions.filter((session: StorageApiSessionResponse) => {
            const sessionDate = new Date(session.lastActivity);
            return sessionDate >= date && sessionDate < nextDate;
          }).length;
        });

        setDashboardData({
          totalSessions,
          thisMonthSessions,
          avgResponseTime,
          recentSessions,
          recentInfographic: recentInfographic ? {
            sessionId: recentInfographic.sessionId,
            title: `Analysis ${recentInfographic.sessionId.slice(-8)}`,
            createdAt: recentInfographic.lastActivity
          } : null,
          dailyActivity,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to default data
        setDashboardData({
          totalSessions: 0,
          thisMonthSessions: 0,
          avgResponseTime: '0s',
          recentSessions: [],
          recentInfographic: null,
          dailyActivity: [0, 0, 0, 0, 0, 0, 0],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getAllSessions]);

  const handleNewAnalysis = async () => {
    setCreatingSession(true);
    
    try {
      // Clear any existing session
      clearCurrentSession();
      
      // Create new session
      const newSession = createNewSession();
      
      console.log('Creating new analysis session:', newSession);
      
      // Create session in backend
      await createSession(newSession);
      
      // Navigate to AI page
      navigate('/ai');
    } catch (error) {
      console.error('Failed to create session:', error);
      // Still navigate but let AI page handle session creation as fallback
      navigate('/ai');
    } finally {
      setCreatingSession(false);
    }
  };

  const stats = [
    { 
      title: 'Total Analyses', 
      value: loading ? '...' : (dashboardData?.totalSessions.toString() || '0'), 
      icon: <AssessmentIcon />, 
      color: '#3b82f6' 
    },
    { 
      title: 'This Month', 
      value: loading ? '...' : (dashboardData?.thisMonthSessions.toString() || '0'), 
      icon: <TrendingUpIcon />, 
      color: '#10b981' 
    },
    { 
      title: 'Avg. Response Time', 
      value: loading ? '...' : (dashboardData?.avgResponseTime || '0s'), 
      icon: <SpeedIcon />, 
      color: '#f59e0b' 
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        {/* Welcome Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to analyze your business with AI-powered insights?
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card 
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${stat.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Activity Chart */}
        {!loading && dashboardData && dashboardData.totalSessions > 0 && 
         dashboardData.dailyActivity.some(day => day > 0) && (
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Analysis Activity (Last 7 Days)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 80, mb: 1 }}>
                {dashboardData.dailyActivity.map((dayActivity, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  
                  const maxActivity = Math.max(1, Math.max(...dashboardData.dailyActivity));
                  const height = Math.max(8, (dayActivity / maxActivity) * 100);
                  
                  return (
                    <Box key={i} sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Box sx={{
                        width: '100%',
                        height: `${height}%`,
                        bgcolor: dayActivity > 0 ? '#6366f1' : '#e5e7eb',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          bgcolor: dayActivity > 0 ? '#5855eb' : '#d1d5db',
                          '&::after': {
                            content: `"${dayActivity}"`,
                            position: 'absolute',
                            top: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: '#374151',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }
                        }
                      }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Daily analysis count
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total: {dashboardData.dailyActivity.reduce((sum, day) => sum + day, 0)} in 7 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Start New Analysis
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Get AI-powered SWOT analysis for your business in minutes
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={creatingSession ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                onClick={handleNewAnalysis}
                disabled={creatingSession}
                sx={{
                  bgcolor: 'white',
                  color: '#6366f1',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f8fafc',
                  },
                  '&:disabled': {
                    bgcolor: '#f3f4f6',
                    color: '#9ca3af',
                  }
                }}
              >
                {creatingSession ? 'Creating Session...' : 'New Analysis'}
              </Button>
            </Paper>
          </Grid>

          {/* Recent Infographic */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Recent Infographic
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              ) : dashboardData?.recentInfographic ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{
                    height: 80,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '2rem'
                  }}>
                    📊
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dashboardData.recentInfographic.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(dashboardData.recentInfographic.createdAt).toLocaleDateString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/ai')}
                    sx={{ mt: 'auto', borderRadius: 2 }}
                  >
                    View Details
                  </Button>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    fontSize: '2rem', 
                    mb: 2, 
                    opacity: 0.3 
                  }}>
                    📊
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No infographics yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Start an analysis to generate visual insights
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: '1px solid #e5e7eb',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#111827' }}>
                Recent Activity
              </Typography>
              
              {loading ? (
                // Loading skeletons
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : dashboardData?.recentSessions.length === 0 ? (
                // No data state
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No recent analyses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start your first analysis to see activity here
                  </Typography>
                </>
              ) : (
                // Real recent sessions (show only first 3 for compact view)
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dashboardData?.recentSessions.slice(0, 3).map((session) => (
                    <Box key={session.sessionId} sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: '#f8fafc',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <Box sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#6366f1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}>
                        {session.sessionId.slice(-2).toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.8rem'
                        }}>
                          Analysis {session.sessionId.slice(-6)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {session.messageCount} msgs
                        </Typography>
                      </Box>
                      {session.hasInfographics && (
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#10b981'
                        }} />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
