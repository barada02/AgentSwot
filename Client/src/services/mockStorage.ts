// Mock storage service for testing frontend integration
import type { ChatMessage, InfographicData } from '../types';

export class MockStorageService {
  private sessions = new Map<string, any>();
  private messages = new Map<string, ChatMessage[]>();
  private infographics = new Map<string, InfographicData[]>();

  async initialize(): Promise<void> {
    console.log('✅ Mock storage initialized');
    return Promise.resolve();
  }

  async createSession(sessionData: any): Promise<any> {
    const session = {
      ...sessionData,
      _id: `mock_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(sessionData.sessionId, session);
    console.log('✅ Mock session created:', session);
    return session;
  }

  async saveMessage(sessionId: string, message: ChatMessage): Promise<any> {
    const messages = this.messages.get(sessionId) || [];
    messages.push(message);
    this.messages.set(sessionId, messages);
    console.log('✅ Mock message saved:', message);
    return { _id: `msg_${Date.now()}`, ...message };
  }

  async getSession(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    console.log('📖 Mock session retrieved:', session);
    return session;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const messages = this.messages.get(sessionId) || [];
    console.log('📖 Mock messages retrieved:', messages);
    return messages;
  }

  async getAllSessions(): Promise<any[]> {
    const sessions = Array.from(this.sessions.values());
    console.log('📖 Mock all sessions retrieved:', sessions);
    return sessions;
  }
}

const mockStorageService = new MockStorageService();
export default mockStorageService;