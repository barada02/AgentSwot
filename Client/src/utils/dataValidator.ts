import type { RunResponse, ChatMessage, InfographicData, UserSession } from '../types';
import type { StoredSession, StoredMessage, StoredInfographic } from '../types/storage';

/**
 * Data validation utilities to ensure schema compatibility
 * between ADK responses and our MongoDB storage models
 */

export class DataValidator {
  
  /**
   * Validates and logs the structure of ADK RunResponse
   */
  static validateRunResponse(response: RunResponse): boolean {
    try {
      console.log('🔍 Validating ADK RunResponse structure:');
      console.log('- ID:', response.id, typeof response.id);
      console.log('- Timestamp:', response.timestamp, typeof response.timestamp);
      console.log('- Author:', response.author, typeof response.author);
      console.log('- Content role:', response.content.role, typeof response.content.role);
      console.log('- Content parts count:', response.content.parts?.length || 0);
      console.log('- Usage metadata tokens:', response.usageMetadata?.totalTokenCount || 0);
      
      // Validate required fields
      const isValid = !!(
        response.id &&
        response.timestamp &&
        response.content &&
        response.content.parts &&
        Array.isArray(response.content.parts)
      );
      
      console.log('✅ RunResponse validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ RunResponse validation failed:', error);
      return false;
    }
  }

  /**
   * Validates ChatMessage structure
   */
  static validateChatMessage(message: ChatMessage): boolean {
    try {
      console.log('🔍 Validating ChatMessage structure:');
      console.log('- ID:', message.id, typeof message.id);
      console.log('- Role:', message.role, typeof message.role);
      console.log('- Content length:', message.content?.length || 0);
      console.log('- Timestamp:', message.timestamp, typeof message.timestamp);
      console.log('- Part count:', message.partCount);
      console.log('- Has metadata:', !!message.metadata);
      
      const isValid = !!(
        message.id &&
        message.role &&
        message.content &&
        message.timestamp &&
        (message.role === 'user' || message.role === 'assistant')
      );
      
      console.log('✅ ChatMessage validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ ChatMessage validation failed:', error);
      return false;
    }
  }

  /**
   * Validates UserSession structure
   */
  static validateUserSession(session: UserSession): boolean {
    try {
      console.log('🔍 Validating UserSession structure:');
      console.log('- User ID:', session.userId, typeof session.userId);
      console.log('- Session ID:', session.sessionId, typeof session.sessionId);
      console.log('- App Name:', session.appName, typeof session.appName);
      
      const isValid = !!(
        session.userId &&
        session.sessionId &&
        session.appName
      );
      
      console.log('✅ UserSession validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ UserSession validation failed:', error);
      return false;
    }
  }

  /**
   * Validates InfographicData structure
   */
  static validateInfographicData(infographic: InfographicData): boolean {
    try {
      console.log('🔍 Validating InfographicData structure:');
      console.log('- ID:', infographic.id, typeof infographic.id);
      console.log('- Content type:', infographic.contentType, typeof infographic.contentType);
      console.log('- HTML code length:', infographic.htmlCode?.length || 0);
      console.log('- Raw code length:', infographic.rawCode?.length || 0);
      console.log('- Part index:', infographic.partIndex, typeof infographic.partIndex);
      
      const isValid = !!(
        infographic.id &&
        infographic.contentType &&
        infographic.htmlCode &&
        infographic.rawCode &&
        typeof infographic.partIndex === 'number'
      );
      
      console.log('✅ InfographicData validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ InfographicData validation failed:', error);
      return false;
    }
  }

  /**
   * Creates a StoredSession from UserSession with validation
   */
  static createStoredSession(userSession: UserSession, title?: string): Omit<StoredSession, '_id'> {
    this.validateUserSession(userSession);
    
    const storedSession: Omit<StoredSession, '_id'> = {
      sessionId: userSession.sessionId,
      userId: userSession.userId,
      appName: userSession.appName,
      title: title || `New Analysis - ${new Date().toLocaleDateString()}`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      hasInfographics: false,
      tags: [],
      metadata: {
        totalTokens: 0,
        avgResponseTime: 0,
      },
    };
    
    console.log('✅ Created StoredSession:', storedSession);
    return storedSession;
  }

  /**
   * Creates a StoredMessage from ChatMessage with validation
   */
  static createStoredMessage(chatMessage: ChatMessage, sessionId: string): Omit<StoredMessage, '_id'> {
    this.validateChatMessage(chatMessage);
    
    const storedMessage: Omit<StoredMessage, '_id'> = {
      sessionId,
      messageId: chatMessage.id,
      role: chatMessage.role,
      content: chatMessage.content,
      timestamp: chatMessage.timestamp,
      partCount: chatMessage.partCount,
      metadata: chatMessage.metadata,
      tokens: chatMessage.metadata?.originalParts ? 
        this.estimateTokens(chatMessage.content) : undefined,
    };
    
    console.log('✅ Created StoredMessage:', {
      messageId: storedMessage.messageId,
      role: storedMessage.role,
      contentLength: storedMessage.content.length,
    });
    return storedMessage;
  }

  /**
   * Creates a StoredInfographic from InfographicData with validation
   */
  static createStoredInfographic(
    infographic: InfographicData, 
    sessionId: string, 
    messageId: string
  ): Omit<StoredInfographic, '_id'> {
    this.validateInfographicData(infographic);
    
    const storedInfographic: Omit<StoredInfographic, '_id'> = {
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
        hasInteractivity: this.detectInteractivity(infographic.htmlCode),
        exportCount: 0,
      },
    };
    
    console.log('✅ Created StoredInfographic:', {
      infographicId: storedInfographic.infographicId,
      size: storedInfographic.metadata.size,
      hasInteractivity: storedInfographic.metadata.hasInteractivity,
    });
    return storedInfographic;
  }

  /**
   * Estimates token count from text content
   */
  private static estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Detects if HTML contains interactive elements
   */
  private static detectInteractivity(htmlCode: string): boolean {
    const interactivePatterns = [
      /onclick/i,
      /onmouseover/i,
      /onhover/i,
      /<script/i,
      /addEventListener/i,
      /interactive/i,
      /<button/i,
      /<input/i,
      /cursor:\s*pointer/i,
    ];
    
    return interactivePatterns.some(pattern => pattern.test(htmlCode));
  }

  /**
   * Comprehensive validation of all data structures
   */
  static validateAllStructures(
    userSession: UserSession,
    chatMessage: ChatMessage,
    runResponse: RunResponse,
    infographics?: InfographicData[]
  ): boolean {
    console.log('🔍 Running comprehensive data structure validation...');
    
    let allValid = true;
    
    allValid = this.validateUserSession(userSession) && allValid;
    allValid = this.validateChatMessage(chatMessage) && allValid;
    allValid = this.validateRunResponse(runResponse) && allValid;
    
    if (infographics && infographics.length > 0) {
      infographics.forEach((infographic, index) => {
        console.log(`Validating infographic ${index + 1}/${infographics.length}:`);
        allValid = this.validateInfographicData(infographic) && allValid;
      });
    }
    
    console.log('🎯 Overall validation result:', allValid ? '✅ PASSED' : '❌ FAILED');
    return allValid;
  }
}

export default DataValidator;