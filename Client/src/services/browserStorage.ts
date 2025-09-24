/**
 * Browser-compatible storage service for AgentSwot
 * Uses localStorage for immediate functionality and provides API for backend integration
 */

import type { ChatMessage, InfographicData, UserSession } from '../types';

// Storage interfaces
export interface StoredSession {
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
  sessionId: string;
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  infographics?: InfographicData[];
  tokens?: number;
}

export class BrowserStorageService {
  private readonly SESSION_KEY = 'agentswot_sessions';
  private readonly MESSAGES_KEY = 'agentswot_messages';
  private readonly INFOGRAPHICS_KEY = 'agentswot_infographics';

  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Check if localStorage is available
      if (typeof window !== 'undefined' && window.localStorage) {
        this.isInitialized = true;
        console.log('✅ Browser storage service initialized');
      } else {
        throw new Error('localStorage not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
      throw error;
    }
  }

  // Session management
  async createSession(sessionData: UserSession): Promise<StoredSession> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    const session: StoredSession = {
      sessionId: sessionData.sessionId,
      userId: sessionData.userId,
      appName: sessionData.appName,
      title: `Analysis ${new Date().toLocaleDateString()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      hasInfographics: false,
      tags: [],
      metadata: {}
    };

    const sessions = this.getAllSessionsSync();
    sessions[sessionData.sessionId] = session;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions));

    console.log('✅ Session created:', session);
    return session;
  }

  async getSession(sessionId: string): Promise<StoredSession | null> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    const sessions = this.getAllSessionsSync();
    return sessions[sessionId] || null;
  }

  async getAllSessions(): Promise<StoredSession[]> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    const sessions = this.getAllSessionsSync();
    return Object.values(sessions).sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  private getAllSessionsSync(): Record<string, StoredSession> {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading sessions:', error);
      return {};
    }
  }

  // Message management
  async saveMessage(sessionId: string, message: ChatMessage, infographics?: InfographicData[]): Promise<StoredMessage> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    const storedMessage: StoredMessage = {
      sessionId,
      messageId: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      infographics,
    };

    // Save message
    const messages = this.getAllMessagesSync();
    if (!messages[sessionId]) {
      messages[sessionId] = [];
    }
    messages[sessionId].push(storedMessage);
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));

    // Update session
    await this.updateSessionStats(sessionId, !!(infographics && infographics.length > 0));

    console.log('✅ Message saved:', storedMessage);
    return storedMessage;
  }

  async getSessionMessages(sessionId: string): Promise<StoredMessage[]> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    const messages = this.getAllMessagesSync();
    return messages[sessionId] || [];
  }

  private getAllMessagesSync(): Record<string, StoredMessage[]> {
    try {
      const stored = localStorage.getItem(this.MESSAGES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading messages:', error);
      return {};
    }
  }

  private async updateSessionStats(sessionId: string, hasNewInfographics: boolean): Promise<void> {
    const sessions = this.getAllSessionsSync();
    const session = sessions[sessionId];
    
    if (session) {
      session.messageCount += 1;
      session.lastActivity = new Date().toISOString();
      session.updatedAt = new Date().toISOString();
      
      if (hasNewInfographics) {
        session.hasInfographics = true;
      }

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions));
    }
  }

  // Utility methods
  async exportSession(sessionId: string): Promise<any> {
    const session = await this.getSession(sessionId);
    const messages = await this.getSessionMessages(sessionId);

    return {
      session,
      messages,
      exportedAt: new Date().toISOString(),
    };
  }

  async clearAllData(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Storage not initialized');
    }

    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.MESSAGES_KEY);
    localStorage.removeItem(this.INFOGRAPHICS_KEY);
    
    console.log('✅ All storage data cleared');
  }

  getStorageStats(): any {
    const sessions = this.getAllSessionsSync();
    const messages = this.getAllMessagesSync();

    return {
      totalSessions: Object.keys(sessions).length,
      totalMessages: Object.values(messages).reduce((total, sessionMessages) => total + sessionMessages.length, 0),
      storageUsed: this.calculateStorageSize(),
      lastActivity: sessions ? Math.max(...Object.values(sessions).map(s => new Date(s.lastActivity).getTime())) : 0,
    };
  }

  private calculateStorageSize(): string {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('agentswot_')) {
        totalSize += localStorage[key].length;
      }
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }
}

// Export singleton instance
const browserStorageService = new BrowserStorageService();
export default browserStorageService;