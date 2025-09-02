import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const demoQuery = searchParams.get('query');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const isSignUp = mode === 'signup';
  const isDemo = mode === 'demo';

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Simple validation - just check if name is provided
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    // For now, just navigate to dashboard
    // Later we'll integrate with real authentication
    if (isDemo && demoQuery) {
      // Navigate to analysis with the demo query
      navigate(`/analysis/new?demo=${encodeURIComponent(demoQuery)}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <LandingLayout>
      <Container maxWidth="sm">
        <Box sx={{ py: 8 }}>
          <Paper
            elevation={20}
            sx={{
              p: 6,
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              textAlign="center"
              sx={{
                mb: 1,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isDemo ? 'Try Demo' : isSignUp ? 'Get Started' : 'Welcome Back'}
            </Typography>
            
            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              {isDemo 
                ? 'Enter your name to try the demo'
                : isSignUp 
                  ? 'Create your account to start analyzing'
                  : 'Sign in to your account'
              }
            </Typography>

            {isDemo && demoQuery && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Demo Query:</strong> {demoQuery}
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {!isDemo && (
                  <>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required={isSignUp}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #6366f1, #3b82f6)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5855eb, #2563eb)',
                    }
                  }}
                >
                  {isDemo ? 'Start Demo' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </Box>
            </form>

            {!isDemo && (
              <>
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Button
                    variant="text"
                    onClick={() => navigate(`/auth?mode=${isSignUp ? 'login' : 'signup'}`)}
                    sx={{
                      textTransform: 'none',
                      color: '#6366f1',
                      '&:hover': { bgcolor: 'transparent', color: '#5855eb' }
                    }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Button>
                </Typography>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </LandingLayout>
  );
};

export default AuthPage;
