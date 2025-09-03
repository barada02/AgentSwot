import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AnalyticsIcon sx={{ fontSize: 50, color: '#3b82f6' }} />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI agents provide comprehensive SWOT analysis tailored to your business needs'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50, color: '#60a5fa' }} />,
      title: 'Strategic Insights',
      description: 'Get actionable insights and strategic recommendations for business growth'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 50, color: '#93c5fd' }} />,
      title: 'Fast Results',
      description: 'Receive detailed analysis in minutes, not hours or days'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 50, color: '#dbeafe' }} />,
      title: 'Secure Platform',
      description: 'Your business data is protected with enterprise-grade security'
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <LandingLayout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(147, 197, 253, 0.1) 0%, transparent 50%)
            `,
            zIndex: 1,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                fontWeight: 900,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #3b82f6 60%, #60a5fa 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              AgentSwot
            </Typography>
            
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.8rem', lg: '2.2rem' },
                fontWeight: 300,
                mb: 4,
                color: '#e2e8f0',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              AI-Powered SWOT Analysis Platform
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: '#cbd5e1',
                mb: 6,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Transform your business strategy with intelligent analysis. 
              Get comprehensive SWOT insights powered by advanced AI agents.
            </Typography>
            
            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth?mode=signup')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2563eb 30%, #1e40af 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get Started
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/auth?mode=login')}
                sx={{
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          py: { xs: 8, md: 12 },
          color: 'white',
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #3b82f6 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose AgentSwot?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '1.2rem',
                color: '#cbd5e1',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Powerful features designed to accelerate your business analysis
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
                      borderColor: 'rgba(59, 130, 246, 0.4)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: '#ffffff',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: { xs: 8, md: 10 },
          color: 'white',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              color: '#ffffff',
            }}
          >
            Ready to Transform Your Business Strategy?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              color: '#cbd5e1',
              mb: 5,
              lineHeight: 1.6,
            }}
          >
            Join thousands of businesses using AgentSwot for strategic analysis and planning.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auth?mode=signup')}
            sx={{
              px: 6,
              py: 2.5,
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #3b82f6 30%, #1d4ed8 90%)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563eb 30%, #1e40af 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Your Free Analysis
          </Button>
        </Container>
      </Box>
    </LandingLayout>
    </Box>
  );
};

export default LandingPage;