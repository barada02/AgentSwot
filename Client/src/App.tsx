import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SessionForm from './components/SessionForm';
import ChatInterface from './components/ChatInterface';
import type { UserSession } from './types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const handleSessionCreated = (session: UserSession) => {
    setUserSession(session);
  };

  const handleBackToSession = () => {
    setUserSession(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {!userSession ? (
          <SessionForm onSessionCreated={handleSessionCreated} />
        ) : (
          <ChatInterface 
            userSession={userSession} 
            onBackToSession={handleBackToSession}
          />
        )}
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
