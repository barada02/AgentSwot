import axios from 'axios';
import type { SessionResponse, RunRequest, RunResponse } from '../types';

// Use proxy in development, direct URL in production
const BASE_URL = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 120000, // 2 minutes timeout for agent processing
  withCredentials: false,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED') {
      console.error('Network Error: Possible CORS issue or server not running');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request Timeout: Agent is taking longer than expected to process the request');
    }
    
    throw error;
  }
);

export const apiService = {
  // Check if API is working - This endpoint is used for status checking
  listApps: async (): Promise<string[]> => {
    const response = await api.get('/list-apps');
    return response.data;
  },

  // Check API status using the list-apps endpoint
  checkApiStatus: async (): Promise<{ connected: boolean; apps: string[] }> => {
    try {
      const apps = await apiService.listApps();
      return { connected: true, apps };
    } catch (error) {
      return { connected: false, apps: [] };
    }
  },

  // Create a new session
  createSession: async (appName: string, userId: string, sessionId: string): Promise<SessionResponse> => {
    const response = await api.post(`/apps/${appName}/users/${userId}/sessions/${sessionId}`);
    return response.data;
  },

  // Get session information
  getSession: async (appName: string, userId: string, sessionId: string): Promise<SessionResponse> => {
    const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}`);
    return response.data;
  },

  // Send message to agent - with extended timeout for processing
  runAgent: async (request: RunRequest): Promise<RunResponse[]> => {
    const response = await api.post('/run', request, {
      timeout: 180000, // 3 minutes for agent processing
    });
    return response.data;
  },
};
