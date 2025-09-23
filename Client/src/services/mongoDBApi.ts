/**
 * MongoDB API service for AgentSwot
 * Communicates with backend endpoints to store and retrieve data from MongoDB
 */

import axios from 'axios';
import type { ChatMessage, InfographicData, UserSession } from '../types';

const API_BASE_URL = import.meta.env.VITE_STORAGE_API_URL || 'http://127.0.0.1:8001';

// MongoDB storage interfaces
export interface StoredSession {
  _id?: string;
  sessionId: string;
  userId: string;
  appName: string;
  title?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  messageCount: number;
  hasInfographics: boolean;
  tags: string[];
  metadata: {
    totalTokens?: number;
    avgResponseTime?: number;
    firstUserMessage?: string;
  };
}

export interface StoredMessage {
  _id?: string;
  sessionId: string;
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  infographics?: InfographicData[];
  tokens?: number;
}

export interface StoredInfographic {
  _id?: string;
  sessionId: string;
  messageId: string;
  type: string;
  data: InfographicData;
  createdAt: string;
}

export class MongoDBApiService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Test connection to backend storage endpoints
      const response = await axios.get(`${API_BASE_URL}/storage/health`);
      this.isInitialized = true;
      console.log('✅ MongoDB API service initialized:', response.data);
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB API service:', error);
      throw new Error('Backend storage service not available');
    }
  }

  // Session management
  async createSession(sessionData: UserSession): Promise<StoredSession> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const session = {
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        appName: sessionData.appName,
        title: `Analysis ${new Date().toLocaleDateString()}`,
        status: 'active' as const,
        tags: [],
        metadata: {}
      };

      const response = await axios.post(`${API_BASE_URL}/storage/sessions`, session);
      console.log('✅ Session created in MongoDB:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<StoredSession | null> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/storage/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('❌ Failed to get session:', error);
      throw error;
    }
  }

  async getAllSessions(userId?: string): Promise<StoredSession[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const params = userId ? { userId } : {};
      const response = await axios.get(`${API_BASE_URL}/storage/sessions`, { params });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get all sessions:', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<StoredSession>): Promise<StoredSession> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.patch(`${API_BASE_URL}/storage/sessions/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update session:', error);
      throw error;
    }
  }

  // Message management
  async saveMessage(sessionId: string, message: ChatMessage, infographics?: InfographicData[]): Promise<StoredMessage> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const storedMessage = {
        sessionId,
        messageId: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        infographics,
      };

      const response = await axios.post(`${API_BASE_URL}/storage/messages`, storedMessage);
      console.log('✅ Message saved to MongoDB:', response.data);

      // Update session stats
      await this.updateSessionStats(sessionId, !!(infographics && infographics.length > 0));

      return response.data;
    } catch (error) {
      console.error('❌ Failed to save message:', error);
      throw error;
    }
  }

  async getSessionMessages(sessionId: string): Promise<StoredMessage[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/storage/messages/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get session messages:', error);
      throw error;
    }
  }

  // Infographic management
  async saveInfographics(sessionId: string, messageId: string, infographics: InfographicData[]): Promise<StoredInfographic[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const storedInfographics = infographics.map(data => ({
        sessionId,
        messageId,
        type: 'infographic',
        data,
      }));

      const response = await axios.post(`${API_BASE_URL}/storage/infographics`, { infographics: storedInfographics });
      console.log('✅ Infographics saved to MongoDB:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to save infographics:', error);
      throw error;
    }
  }

  async getSessionInfographics(sessionId: string): Promise<StoredInfographic[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/storage/infographics/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get session infographics:', error);
      throw error;
    }
  }

  // Utility methods
  private async updateSessionStats(sessionId: string, hasNewInfographics: boolean): Promise<void> {
    try {
      const updates: Partial<StoredSession> = {
        lastActivity: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (hasNewInfographics) {
        updates.hasInfographics = true;
      }

      await this.updateSession(sessionId, updates);
    } catch (error) {
      console.error('❌ Failed to update session stats:', error);
      // Don't throw here - session stats update is not critical
    }
  }

  async exportSession(sessionId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/storage/export/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to export session:', error);
      throw error;
    }
  }

  async getStorageStats(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/storage/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      throw error;
    }
  }

  // Search functionality
  async searchSessions(query: string, filters?: any): Promise<StoredSession[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/storage/search/sessions`, { query, filters });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to search sessions:', error);
      throw error;
    }
  }
}

// Export singleton instance
const mongoDBApiService = new MongoDBApiService();
export default mongoDBApiService;