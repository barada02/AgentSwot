import type { MessagePart, Message } from '../types';

/**
 * Extracts and concatenates all text content from message parts
 * @param parts - Array of message parts
 * @returns Concatenated text from all parts
 */
export const extractTextFromParts = (parts: MessagePart[]): string => {
  if (!parts || parts.length === 0) {
    return 'No response received';
  }
  
  const textParts = parts
    .map(part => part.text || '')
    .filter(text => text.trim().length > 0);
  
  if (textParts.length === 0) {
    return 'No text content received';
  }
  
  // If there's only one part, return it directly
  if (textParts.length === 1) {
    return textParts[0];
  }
  
  // For multiple parts, join with double line breaks for better readability
  return textParts.join('\n\n');
};

/**
 * Extracts text content from a complete message
 * @param message - Message object containing parts
 * @returns Concatenated text from all parts
 */
export const extractTextFromMessage = (message: Message): string => {
  return extractTextFromParts(message.parts);
};

/**
 * Counts the number of text parts in a message
 * @param message - Message object containing parts
 * @returns Number of text parts
 */
export const countTextParts = (message: Message): number => {
  return message.parts?.length || 0;
};

/**
 * Debug function to log message parts information
 * @param message - Message object containing parts
 * @param label - Optional label for the log
 */
export const debugMessageParts = (message: Message, label = 'Message'): void => {
  console.log(`${label} - Total parts: ${countTextParts(message)}`);
  message.parts?.forEach((part, index) => {
    console.log(`  Part ${index + 1}:`, part.text?.substring(0, 100) + (part.text?.length > 100 ? '...' : ''));
  });
};
