export interface SessionResponse {
  id: string;
  appName: string;
  userId: string;
  state: Record<string, any>;
  events: any[];
  lastUpdateTime: number;
}

export interface MessagePart {
  text: string;
}

export interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

export interface RunRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: Message;
  streaming: boolean;
}

export interface UsageMetadata {
  candidatesTokenCount: number;
  candidatesTokensDetails: Array<{ modality: string; tokenCount: number }>;
  promptTokenCount: number;
  promptTokensDetails: Array<{ modality: string; tokenCount: number }>;
  totalTokenCount: number;
  trafficType: string;
}

export interface RunResponse {
  content: Message;
  groundingMetadata: Record<string, any>;
  usageMetadata: UsageMetadata;
  invocationId: string;
  author: string;
  actions: {
    stateDelta: Record<string, any>;
    artifactDelta: Record<string, any>;
    requestedAuthConfigs: Record<string, any>;
  };
  id: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  partCount?: number; // Optional: number of parts this message was composed from
  metadata?: {
    hasMultipleParts: boolean;
    originalParts?: MessagePart[];
  };
}

export interface UserSession {
  userId: string;
  sessionId: string;
  appName: string;
}
