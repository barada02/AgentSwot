import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  Chip,
  IconButton,
  Fade,
  Grow,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Send as SendIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AutoGraph as AutoGraphIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [demoInput, setDemoInput] = useState('');

  const features = [
    {
      icon: <AutoGraphIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI agents provide comprehensive SWOT analysis tailored to your business'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#3b82f6' }} />,
      title: 'Interactive Infographics',
      description: 'Dynamic visual representations that bring your analysis to life'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#10b981' }} />,
      title: 'Real-time Results',
      description: 'Get instant insights and recommendations as you chat with our agents'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: 'Secure & Private',
      description: 'Your business data is protected with enterprise-grade security'
    },
  ];

  const handleDemoSubmit = () => {
    if (demoInput.trim()) {
      // Navigate to auth with demo parameter
      navigate(`/auth?mode=demo&query=${encodeURIComponent(demoInput)}`);
    }
  };

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <LandingLayout>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  background: 'linear-gradient(45deg, #1e293b, #475569)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                AI-Powered Business Analysis
              </Typography>
              
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 6, maxWidth: 600, mx: 'auto', fontWeight: 300 }}
              >
                Transform your business ideas into strategic insights with intelligent SWOT analysis and interactive infographics
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5855eb, #2563eb)',
                    }
                  }}
                >
                  Get Started Free
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#5855eb',
                      bgcolor: '#6366f1',
                      color: 'white',
                    }
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
            </Box>
          </Fade>
          
          {/* Interactive Demo Widget */}
          <Grow in timeout={1500}>
            <Paper
              elevation={20}
              sx={{
                p: 4,
                maxWidth: 600,
                mx: 'auto',
                borderRadius: 4,
                background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, color: '#1e293b' }}>
                🚀 Try it now - Ask for a SWOT analysis
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="e.g., Analyze my coffee shop business idea"
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDemoSubmit()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.8)',
                    }
                  }}
                />
                <IconButton
                  onClick={handleDemoSubmit}
                  disabled={!demoInput.trim()}
                  sx={{
                    bgcolor: '#6366f1',
                    color: 'white',
                    '&:hover': { bgcolor: '#5855eb' },
                    '&:disabled': { bgcolor: 'grey.300' }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Coffee shop', 'Tech startup', 'E-commerce', 'Mobile app'].map((example) => (
                  <Chip
                    key={example}
                    label={example}
                    onClick={() => setDemoInput(`Analyze my ${example.toLowerCase()} business idea`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#6366f1', color: 'white' }
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Grow>
        </Box>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{ mb: 8, fontWeight: 'bold', color: '#1e293b' }}
          >
            Why Choose Agent SWOT?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Grow in timeout={1000 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: 3,
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ mb: 3 }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{ mb: 3, fontWeight: 'bold', color: '#1e293b' }}
          >
            Ready to Transform Your Business?
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 500, mx: 'auto' }}
          >
            Join thousands of entrepreneurs who trust Agent SWOT for their strategic planning
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 3,
              fontSize: '1.2rem',
              textTransform: 'none',
              background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5855eb, #2563eb)',
              }
            }}
          >
            Start Your Free Analysis
          </Button>
        </Box>
      </Container>
    </LandingLayout>
  );
};

export default LandingPage;
