/**
 * Enhanced useApi hook with automatic MongoDB storage integration
 * Handles both ADK interactions and automatic data storage
 */

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useMongoDBStorage } from './useMongoDBStorage';
import { processMessageWithInfographics } from '../utils/messageUtils';
import type { UserSession, ChatMessage, RunResponse } from '../types';

// Use proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000';

export const useApiWithStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // MongoDB storage hook
  const { 
    createSession: createStorageSession,
    saveMessage: saveMessageToStorage,
    saveInfographics,
    isInitialized: storageInitialized 
  } = useMongoDBStorage();

  // Create session (ADK + Storage)
  const createSession = async (userSession: UserSession) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔵 Creating session with ADK server...');
      
      // 1. Create session with ADK server using correct RESTful endpoint
      const adkResponse = await axios.post(`${API_BASE_URL}/apps/${userSession.appName}/users/${userSession.userId}/sessions/${userSession.sessionId}`);

      console.log('✅ ADK session created:', adkResponse.data);

      // 2. Automatically create session in MongoDB storage (parallel)
      if (storageInitialized) {
        try {
          console.log('🔵 Creating session in MongoDB storage...');
          const storageSession = await createStorageSession(userSession);
          console.log('✅ Storage session created:', storageSession);
        } catch (storageError) {
          console.warn('⚠️ Failed to create storage session (non-critical):', storageError);
          // Don't throw - storage failure shouldn't break the main flow
        }
      }

      return adkResponse.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      toast.error(`Session creation failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to ADK and auto-save to storage
  const sendMessage = async (userSession: UserSession, message: string): Promise<RunResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Create user message object
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };

      console.log('🔵 Sending message to ADK server...');

      // 2. Send to ADK server (existing flow)
      const adkResponse = await axios.post(`${API_BASE_URL}/run`, {
        user_id: userSession.userId,
        session_id: userSession.sessionId,
        app_name: userSession.appName,
        user_input: message,
      });

      console.log('✅ ADK response received:', adkResponse.data);

      // 3. Process ADK response
      const runResponse: RunResponse = adkResponse.data;
      
      // 4. Extract infographics from raw response content (before converting to ChatMessage)
      const processedMessage = processMessageWithInfographics(runResponse.content);
      const infographics = processedMessage.infographics;
      
      // 5. Create assistant message from processed response
      const assistantMessage: ChatMessage = {
        id: runResponse.id,
        role: 'assistant',
        content: processedMessage.text, // Use processed text (infographics removed)
        timestamp: runResponse.timestamp || Date.now(),
        metadata: {
          hasMultipleParts: runResponse.content?.parts?.length > 1,
          originalParts: runResponse.content?.parts,
          hasInfographic: infographics.length > 0,
          infographics: infographics
        }
      };

      // 6. Auto-save to MongoDB storage (parallel operations)
      if (storageInitialized) {
        try {
          console.log('🔵 Auto-saving messages to MongoDB storage...');
          
          // Save user message
          await saveMessageToStorage(userSession.sessionId, userMessage);
          console.log('✅ User message saved to storage');
          
          // Save assistant message with infographics
          await saveMessageToStorage(userSession.sessionId, assistantMessage, infographics);
          console.log('✅ Assistant message saved to storage');
          
          // Save infographics separately if any exist
          if (infographics && infographics.length > 0) {
            await saveInfographics(userSession.sessionId, assistantMessage.id, infographics);
            console.log('✅ Infographics saved to storage');
          }
        } catch (storageError) {
          console.warn('⚠️ Failed to save to storage (non-critical):', storageError);
          // Don't throw - storage failure shouldn't break the main chat flow
        }
      }

      toast.success('Response received and saved');
      return runResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      toast.error(`Message failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get session history (from ADK server)
  const getSessionHistory = async (userSession: UserSession) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/get_session_history/${userSession.sessionId}`,
        {
          params: {
            user_id: userSession.userId,
            app_name: userSession.appName,
          },
        }
      );

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get session history';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createSession,
    sendMessage,
    getSessionHistory,
    storageAvailable: storageInitialized,
  };
};