import { toast } from 'react-toastify';
import DatabaseService from './database';
import { processMessageWithInfographics } from '../utils/messageUtils';
import DataValidator from '../utils/dataValidator';
import type { 
  ChatMessage, 
  InfographicData, 
  RunResponse
} from '../types';
import type {
  StoredSession,
  StoredMessage,
  StoredInfographic,
  SessionCreateData,
  SessionUpdateData,
  SessionStats,
  SearchFilters,
  PaginationOptions,
  PaginatedResult
} from '../types/storage';

class StorageService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.connect();
    } catch (error) {
      console.error('Failed to initialize storage service:', error);
      toast.error('Failed to connect to database');
      throw error;
    }
  }

  // Session Management
  async createSession(sessionData: SessionCreateData): Promise<StoredSession> {
    try {
      const collection = this.db.getCollection<StoredSession>('sessions');
      
      // Validate input data structure
      console.log('🔍 Validating session creation data...');
      const userSession = {
        userId: sessionData.userId,
        sessionId: sessionData.sessionId,
        appName: sessionData.appName
      };
      
      if (!DataValidator.validateUserSession(userSession)) {
        throw new Error('Invalid session data structure');
      }
      
      // Create validated session object
      const session = DataValidator.createStoredSession(userSession, sessionData.title);

      const result = await collection.insertOne(session as StoredSession);
      console.log('✅ Session created in database:', sessionData.sessionId);
      
      return { ...session, _id: result.insertedId } as StoredSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to save session');
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<StoredSession | null> {
    try {
      const collection = this.db.getCollection<StoredSession>('sessions');
      const session = await collection.findOne({ sessionId });
      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  async getUserSessions(
    userId: string, 
    filters?: SearchFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<StoredSession>> {
    try {
      const collection = this.db.getCollection<StoredSession>('sessions');
      
      // Build query
      const query: any = { userId };
      if (filters?.status) query.status = filters.status;
      if (filters?.hasInfographics !== undefined) query.hasInfographics = filters.hasInfographics;
      if (filters?.tags?.length) query.tags = { $in: filters.tags };
      if (filters?.dateFrom || filters?.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }
      if (filters?.searchText) {
        query.$or = [
          { title: { $regex: filters.searchText, $options: 'i' } },
          { 'metadata.firstUserMessage': { $regex: filters.searchText, $options: 'i' } }
        ];
      }

      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      // Sort
      const sortBy = pagination?.sortBy || 'lastActivity';
      const sortOrder = pagination?.sortOrder === 'asc' ? 1 : -1;
      const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

      // Execute queries
      const [sessions, total] = await Promise.all([
        collection.find(query).sort(sortOptions).skip(skip).limit(limit).toArray(),
        collection.countDocuments(query)
      ]);

      return {
        data: sessions as StoredSession[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: SessionUpdateData): Promise<void> {
    try {
      const collection = this.db.getCollection<StoredSession>('sessions');
      await collection.updateOne(
        { sessionId },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        }
      );
      console.log('✅ Session updated:', sessionId);
    } catch (error) {
      console.error('Failed to update session:', error);
      toast.error('Failed to update session');
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionsCollection = this.db.getCollection<StoredSession>('sessions');
      const messagesCollection = this.db.getCollection<StoredMessage>('messages');
      const infographicsCollection = this.db.getCollection<StoredInfographic>('infographics');

      // Delete in order: infographics, messages, session
      await Promise.all([
        infographicsCollection.deleteMany({ sessionId }),
        messagesCollection.deleteMany({ sessionId }),
        sessionsCollection.deleteOne({ sessionId })
      ]);

      console.log('✅ Session and related data deleted:', sessionId);
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
      throw error;
    }
  }

  // Message Management
  async saveMessage(message: ChatMessage, sessionId: string): Promise<void> {
    try {
      const collection = this.db.getCollection<StoredMessage>('messages');
      
      const storedMessage: StoredMessage = {
        sessionId,
        messageId: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        partCount: message.partCount,
        metadata: message.metadata,
      };

      await collection.insertOne(storedMessage);
      
      // Update session stats
      await this.updateSessionStats(sessionId);
      
      console.log('✅ Message saved:', message.id);
    } catch (error) {
      console.error('Failed to save message:', error);
      // Don't show toast for message saves to avoid spam
      throw error;
    }
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const collection = this.db.getCollection<StoredMessage>('messages');
      const messages = await collection
        .find({ sessionId })
        .sort({ timestamp: 1 })
        .toArray();

      return messages.map((msg) => ({
        id: (msg as StoredMessage).messageId,
        role: (msg as StoredMessage).role,
        content: (msg as StoredMessage).content,
        timestamp: (msg as StoredMessage).timestamp,
        partCount: (msg as StoredMessage).partCount,
        metadata: (msg as StoredMessage).metadata,
      }));
    } catch (error) {
      console.error('Failed to get session messages:', error);
      return [];
    }
  }

  // Infographic Management
  async saveInfographics(infographics: InfographicData[], sessionId: string, messageId: string): Promise<void> {
    if (!infographics.length) return;

    try {
      const collection = this.db.getCollection<StoredInfographic>('infographics');
      
      const storedInfographics: StoredInfographic[] = infographics.map(infographic => ({
        infographicId: infographic.id,
        sessionId,
        messageId,
        contentType: infographic.contentType,
        htmlCode: infographic.htmlCode,
        rawCode: infographic.rawCode,
        partIndex: infographic.partIndex,
        createdAt: new Date(),
        metadata: {
          size: infographic.htmlCode.length,
          hasInteractivity: infographic.htmlCode.includes('script') || infographic.htmlCode.includes('onclick'),
          exportCount: 0,
        },
      }));

      await collection.insertMany(storedInfographics);
      
      // Mark session as having infographics
      await this.updateSession(sessionId, { hasInfographics: true });
      
      console.log(`✅ ${infographics.length} infographic(s) saved for session:`, sessionId);
    } catch (error) {
      console.error('Failed to save infographics:', error);
      throw error;
    }
  }

  async getSessionInfographics(sessionId: string): Promise<InfographicData[]> {
    try {
      const collection = this.db.getCollection<StoredInfographic>('infographics');
      const infographics = await collection
        .find({ sessionId })
        .sort({ createdAt: 1 })
        .toArray();

      return infographics.map((infographic) => ({
        id: (infographic as StoredInfographic).infographicId,
        contentType: (infographic as StoredInfographic).contentType,
        htmlCode: (infographic as StoredInfographic).htmlCode,
        rawCode: (infographic as StoredInfographic).rawCode,
        partIndex: (infographic as StoredInfographic).partIndex,
      }));
    } catch (error) {
      console.error('Failed to get session infographics:', error);
      return [];
    }
  }

  // Utility Methods
  private async updateSessionStats(sessionId: string): Promise<void> {
    try {
      const messagesCollection = this.db.getCollection<StoredMessage>('messages');
      const sessionsCollection = this.db.getCollection<StoredSession>('sessions');

      const messageCount = await messagesCollection.countDocuments({ sessionId });
      
      await sessionsCollection.updateOne(
        { sessionId },
        { 
          $set: { 
            messageCount,
            lastActivity: new Date(),
            updatedAt: new Date()
          } 
        }
      );
    } catch (error) {
      console.error('Failed to update session stats:', error);
    }
  }

  async getUserStats(userId: string): Promise<SessionStats> {
    try {
      const sessionsCollection = this.db.getCollection<StoredSession>('sessions');
      const messagesCollection = this.db.getCollection<StoredMessage>('messages');
      const infographicsCollection = this.db.getCollection<StoredInfographic>('infographics');

      const [
        totalSessions,
        activeSessions,
        totalMessages,
        totalInfographics,
        recentSessions
      ] = await Promise.all([
        sessionsCollection.countDocuments({ userId }),
        sessionsCollection.countDocuments({ userId, status: 'active' }),
        messagesCollection.countDocuments({ 
          sessionId: { $in: await this.getUserSessionIds(userId) } 
        }),
        infographicsCollection.countDocuments({ 
          sessionId: { $in: await this.getUserSessionIds(userId) } 
        }),
        sessionsCollection
          .find({ userId })
          .sort({ lastActivity: -1 })
          .limit(5)
          .toArray()
      ]);

      return {
        totalSessions,
        activeSessions,
        totalMessages,
        totalInfographics,
        recentSessions,
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        totalMessages: 0,
        totalInfographics: 0,
        recentSessions: [],
      };
    }
  }

  private async getUserSessionIds(userId: string): Promise<string[]> {
    const collection = this.db.getCollection<StoredSession>('sessions');
    const sessions = await collection.find({ userId }, { projection: { sessionId: 1 } }).toArray();
    return sessions.map((s) => (s as StoredSession).sessionId);
  }

  // Integration Methods (called from existing hooks)
  async saveConversationData(
    userMessage: ChatMessage,
    agentResponses: RunResponse[],
    sessionId: string
  ): Promise<void> {
    try {
      // Save user message
      await this.saveMessage(userMessage, sessionId);

      // Process and save agent responses
      for (const response of agentResponses) {
        // Process message content and extract infographics
        const processedMessage = processMessageWithInfographics(response.content);
        
        const agentMessage: ChatMessage = {
          id: response.id,
          role: 'assistant',
          content: processedMessage.text,
          timestamp: response.timestamp,
          partCount: response.content.parts?.length || 1,
          metadata: {
            hasMultipleParts: (response.content.parts?.length || 1) > 1,
            originalParts: response.content.parts,
            hasInfographic: processedMessage.hasInfographics,
            infographics: processedMessage.infographics,
          },
        };

        // Save agent message
        await this.saveMessage(agentMessage, sessionId);

        // Save infographics if any
        if (processedMessage.hasInfographics) {
          await this.saveInfographics(processedMessage.infographics, sessionId, response.id);
        }
      }

      console.log('✅ Conversation data saved successfully');
    } catch (error) {
      console.error('Failed to save conversation data:', error);
      // Don't throw to avoid disrupting the chat flow
    }
  }
}

// Singleton instance
const storageService = new StorageService();

export default storageService;