import type { Document, ObjectId } from 'mongodb';

// Extended types for storage
export interface StoredSession extends Document {
  _id?: ObjectId;
  sessionId: string;
  userId: string;
  appName: string;
  title?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  messageCount: number;
  hasInfographics: boolean;
  tags: string[];
  metadata: {
    totalTokens?: number;
    avgResponseTime?: number;
    firstUserMessage?: string;
  };
}

export interface StoredMessage extends Document {
  _id?: ObjectId;
  sessionId: string;
  messageId: string; // This will be the original ChatMessage.id
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  partCount?: number;
  metadata?: {
    hasMultipleParts: boolean;
    originalParts?: any[];
    hasInfographic?: boolean;
    infographics?: any[];
  };
  tokens?: number;
  responseTime?: number;
}

export interface StoredInfographic extends Document {
  _id?: ObjectId;
  infographicId: string; // This will be the original InfographicData.id
  sessionId: string;
  messageId: string;
  contentType: string;
  htmlCode: string;
  rawCode: string;
  partIndex: number;
  createdAt: Date;
  metadata: {
    size: number; // HTML size in bytes
    hasInteractivity: boolean;
    exportCount: number;
    lastViewed?: Date;
  };
}

export interface StoredUser extends Document {
  _id?: ObjectId;
  userId: string;
  name?: string;
  email?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme?: string;
    language?: string;
  };
  stats: {
    totalSessions: number;
    totalMessages: number;
    totalInfographics: number;
  };
}

// Helper types for operations
export interface SessionCreateData {
  sessionId: string;
  userId: string;
  appName: string;
  title?: string;
}

export interface SessionUpdateData {
  title?: string;
  status?: StoredSession['status'];
  tags?: string[];
  hasInfographics?: boolean;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  totalInfographics: number;
  recentSessions: StoredSession[];
}

export interface SearchFilters {
  userId?: string;
  status?: StoredSession['status'];
  hasInfographics?: boolean;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}