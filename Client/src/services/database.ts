import { MongoClient, Db, Collection } from 'mongodb';
import type { Document } from 'mongodb';
import EnvironmentChecker from '../utils/environmentChecker';

interface DatabaseConfig {
  uri: string;
  dbName: string;
  collections: {
    sessions: string;
    messages: string;
    infographics: string;
    users: string;
  };
}

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      uri: import.meta.env.VITE_MONGODB_URI || '',
      dbName: import.meta.env.VITE_DB_NAME || 'agentswot',
      collections: {
        sessions: import.meta.env.VITE_SESSIONS_COLLECTION || 'sessions',
        messages: import.meta.env.VITE_MESSAGES_COLLECTION || 'messages',
        infographics: import.meta.env.VITE_INFOGRAPHICS_COLLECTION || 'infographics',
        users: import.meta.env.VITE_USERS_COLLECTION || 'users',
      },
    };
  }

  async connect(): Promise<void> {
    // Log environment status for debugging
    EnvironmentChecker.logEnvironmentStatus();
    
    if (!this.config.uri) {
      throw new Error('MongoDB URI not configured. Please set VITE_MONGODB_URI in your .env file.');
    }

    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      this.client = new MongoClient(this.config.uri);
      await this.client.connect();
      this.db = this.client.db(this.config.dbName);
      console.log('✅ Connected to MongoDB Atlas');
      console.log(`📁 Using database: ${this.config.dbName}`);
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      
      // Provide helpful error context
      const diagnostic = EnvironmentChecker.getQuickDiagnostic();
      console.error('🔍 Quick diagnostic:', diagnostic);
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('📝 Disconnected from MongoDB');
    }
  }

  getCollection<T extends Document = Document>(collectionName: keyof DatabaseConfig['collections']): Collection<T> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection<T>(this.config.collections[collectionName]);
  }

  get isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  // Singleton pattern for database connection
  private static instance: DatabaseService | null = null;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
}

export default DatabaseService;