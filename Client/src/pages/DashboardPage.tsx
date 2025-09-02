import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';

interface AnalysisSession {
  id: string;
  title: string;
  query: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  preview?: string;
  type: 'swot' | 'market' | 'competitor' | 'strategy';
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recent sessions
    setTimeout(() => {
      setSessions([
        {
          id: '1',
          title: 'Tesla Inc. SWOT Analysis',
          query: 'Perform a comprehensive SWOT analysis for Tesla Inc.',
          createdAt: '2024-01-15T10:30:00Z',
          status: 'completed',
          preview: 'Strengths: Market leadership in EVs, innovative technology...',
          type: 'swot'
        },
        {
          id: '2',
          title: 'E-commerce Market Analysis',
          query: 'Analyze the current e-commerce market trends and opportunities',
          createdAt: '2024-01-14T15:45:00Z',
          status: 'completed',
          preview: 'The e-commerce market is experiencing rapid growth...',
          type: 'market'
        },
        {
          id: '3',
          title: 'Competitor Analysis - Tech Startups',
          query: 'Compare top 5 AI startups in the market',
          createdAt: '2024-01-13T09:15:00Z',
          status: 'processing',
          type: 'competitor'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      swot: '#6366f1',
      market: '#10b981',
      competitor: '#f59e0b',
      strategy: '#ef4444'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'success',
      processing: 'warning',
      failed: 'error'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = [
    { label: 'Total Analyses', value: '127', icon: AssessmentIcon, color: '#6366f1' },
    { label: 'This Month', value: '23', icon: TrendingUpIcon, color: '#10b981' },
    { label: 'Avg. Time', value: '2.3m', icon: SpeedIcon, color: '#f59e0b' },
    { label: 'Success Rate', value: '98%', icon: HistoryIcon, color: '#ef4444' },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's what's happening with your analyses.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/analysis/new')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5855eb, #2563eb)',
              }
            }}
          >
            New Analysis
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  p: 2,
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color }}>
                      <stat.icon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Analyses */}
        <Card
          sx={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent Analyses
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={100} />
                ))}
              </Box>
            ) : sessions.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  bgcolor: 'rgba(59, 130, 246, 0.1)', 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#3b82f6' }
                }}
              >
                <Typography variant="body1">
                  No analyses yet. <Button 
                    variant="text" 
                    onClick={() => navigate('/analysis/new')}
                    sx={{ textTransform: 'none', ml: 1 }}
                  >
                    Create your first analysis
                  </Button>
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    sx={{
                      p: 2,
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        borderColor: '#6366f1',
                      }
                    }}
                    onClick={() => navigate(`/analysis/${session.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                            {session.title}
                          </Typography>
                          <Chip
                            label={session.type.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: `${getTypeColor(session.type)}15`,
                              color: getTypeColor(session.type),
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}
                          />
                          <Chip
                            label={session.status}
                            size="small"
                            color={getStatusColor(session.status) as any}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Query:</strong> {session.query}
                        </Typography>
                        
                        {session.preview && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {session.preview.length > 100 
                              ? `${session.preview.substring(0, 100)}...` 
                              : session.preview
                            }
                          </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(session.createdAt)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <Tooltip title="View Analysis">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/analysis/${session.id}`);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle download
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle share
                            }}
                          >
                            <ShareIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
