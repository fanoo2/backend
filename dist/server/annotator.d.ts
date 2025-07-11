/**
 * Simple annotation function as requested - calls OpenAI and returns string array
 * @param text The input text to analyze
 * @returns Array of annotation strings
 */
export declare function annotate(text: string): Promise<string[]>;
/**
 * Advanced annotation function with structured analysis
 * @param text The input text to analyze
 * @returns Array of annotation strings describing the text analysis
 */
export declare function annotateTextWithAI(text: string): Promise<string[]>;
/**
 * Fallback annotation function for when OpenAI is unavailable
 * This provides basic text analysis as a backup
 */
export declare function generateBasicAnnotations(text: string): string[];
