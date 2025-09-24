import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserSession } from '../types';

interface SessionContextType {
  // Current active session
  currentSession: UserSession | null;
  setCurrentSession: (session: UserSession | null) => void;
  
  // Session viewing state
  viewingSessionId: string | null;
  setViewingSessionId: (sessionId: string | null) => void;
  
  // UI state
  isViewingHistory: boolean;
  setIsViewingHistory: (viewing: boolean) => void;
  
  // Actions
  createNewSession: () => UserSession;
  clearCurrentSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  const createNewSession = useCallback((): UserSession => {
    if (!user) {
      throw new Error('Cannot create session without authenticated user');
    }
    
    const newSession: UserSession = {
      userId: user.id,
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      appName: 'multi_tool_agent',
    };
    
    setCurrentSession(newSession);
    setViewingSessionId(null);
    setIsViewingHistory(false);
    
    return newSession;
  }, [user]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setViewingSessionId(null);
    setIsViewingHistory(false);
  }, []);

  const handleSetViewingSessionId = useCallback((sessionId: string | null) => {
    setViewingSessionId(sessionId);
    setIsViewingHistory(!!sessionId);
  }, []);

  const value: SessionContextType = {
    currentSession,
    setCurrentSession,
    viewingSessionId,
    setViewingSessionId: handleSetViewingSessionId,
    isViewingHistory,
    setIsViewingHistory,
    createNewSession,
    clearCurrentSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};