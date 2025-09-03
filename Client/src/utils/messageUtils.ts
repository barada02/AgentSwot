import type { MessagePart, Message, InfographicData, InfographicContent } from '../types';

/**
 * Detects if a text contains JSON with infographic content
 * @param text - Text to check
 * @returns Boolean indicating if text contains infographic JSON
 */
export const containsInfographicJSON = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Look for JSON code blocks with contenttype: "infographic"
  const jsonPattern = /```json\s*\n?\s*\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\}\s*\n?\s*```/gi;
  return jsonPattern.test(text);
};

/**
 * Extracts infographic JSON from text
 * @param text - Text containing infographic JSON
 * @returns Array of extracted JSON strings
 */
export const extractInfographicJSON = (text: string): string[] => {
  if (!containsInfographicJSON(text)) return [];
  
  const jsonPattern = /```json\s*\n?\s*(\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\})\s*\n?\s*```/gi;
  const matches: string[] = [];
  let match;
  
  while ((match = jsonPattern.exec(text)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
};

/**
 * Parses infographic JSON and cleans the HTML code
 * @param jsonString - JSON string to parse
 * @returns Parsed and cleaned infographic data or null if invalid
 */
export const parseInfographicJSON = (jsonString: string): InfographicContent | null => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate structure
    if (!parsed.contenttype || !parsed.code) {
      console.warn('Invalid infographic JSON structure:', parsed);
      return null;
    }
    
    if (parsed.contenttype !== 'infographic') {
      console.warn('Not an infographic content type:', parsed.contenttype);
      return null;
    }
    
    return {
      contenttype: parsed.contenttype,
      code: parsed.code
    };
  } catch (error) {
    console.error('Failed to parse infographic JSON:', error);
    return null;
  }
};

/**
 * Cleans HTML code by removing markdown syntax and escape characters
 * @param htmlCode - Raw HTML code string
 * @returns Cleaned HTML code
 */
export const cleanHTMLCode = (htmlCode: string): string => {
  if (!htmlCode) return '';
  
  return htmlCode
    // Remove \n escape sequences
    .replace(/\\n/g, '\n')
    // Remove \t escape sequences  
    .replace(/\\t/g, '\t')
    // Remove \" escape sequences
    .replace(/\\"/g, '"')
    // Remove \\ escape sequences
    .replace(/\\\\/g, '\\')
    // Trim whitespace
    .trim();
};

/**
 * Processes a text part and extracts infographic data
 * @param text - Text part to process
 * @param partIndex - Index of the part
 * @returns Array of infographic data found in the text
 */
export const extractInfographicsFromText = (text: string, partIndex: number): InfographicData[] => {
  const infographics: InfographicData[] = [];
  
  if (!containsInfographicJSON(text)) {
    return infographics;
  }
  
  const jsonStrings = extractInfographicJSON(text);
  
  jsonStrings.forEach((jsonString, index) => {
    const parsed = parseInfographicJSON(jsonString);
    
    if (parsed) {
      const cleanedCode = cleanHTMLCode(parsed.code);
      
      infographics.push({
        id: `infographic-${partIndex}-${index}-${Date.now()}`,
        contentType: parsed.contenttype,
        htmlCode: cleanedCode,
        rawCode: parsed.code,
        partIndex: partIndex
      });
    }
  });
  
  return infographics;
};

/**
 * Removes infographic JSON blocks from text, leaving only regular text
 * @param text - Text containing infographic JSON
 * @returns Text with infographic JSON removed
 */
export const removeInfographicJSON = (text: string): string => {
  if (!containsInfographicJSON(text)) return text;
  
  const jsonPattern = /```json\s*\n?\s*\{[\s\S]*?"contenttype"\s*:\s*"infographic"[\s\S]*?\}\s*\n?\s*```/gi;
  return text.replace(jsonPattern, '').trim();
};

/**
 * Extracts and concatenates all text content from message parts, excluding infographic JSON
 * @param parts - Array of message parts
 * @returns Concatenated text from all parts with infographics removed
 */
export const extractTextFromParts = (parts: MessagePart[]): string => {
  if (!parts || parts.length === 0) {
    return 'No response received';
  }
  
  const textParts = parts
    .map(part => part.text || '')
    .map(text => removeInfographicJSON(text)) // Remove infographic JSON
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
 * Processes a complete message and extracts both text and infographic data
 * @param message - Message object containing parts
 * @returns Object containing cleaned text and infographic data
 */
export const processMessageWithInfographics = (message: Message): {
  text: string;
  infographics: InfographicData[];
  hasInfographics: boolean;
} => {
  const allInfographics: InfographicData[] = [];
  
  // Extract infographics from each part
  message.parts?.forEach((part, index) => {
    if (part.text) {
      const partInfographics = extractInfographicsFromText(part.text, index);
      allInfographics.push(...partInfographics);
    }
  });
  
  // Extract text with infographics removed
  const cleanText = extractTextFromParts(message.parts);
  
  return {
    text: cleanText,
    infographics: allInfographics,
    hasInfographics: allInfographics.length > 0
  };
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
