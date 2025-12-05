/**
 * OpenAI API Client for AI Page Generator
 * Handles communication with OpenAI API, API key management, and error handling
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY_STORAGE_KEY = 'openai_api_key';
const API_KEY_FORMAT = /^sk-[a-zA-Z0-9\-_]{20,}$/;

export interface OpenAIError {
  type: 'invalid_key' | 'rate_limit' | 'timeout' | 'network' | 'invalid_response' | 'unknown';
  message: string;
  retryable: boolean;
}

export interface GenerationResult {
  components: any[];
  tokensUsed: number;
  error?: OpenAIError;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo';
  messages: OpenAIMessage[];
  temperature: number;
  response_format?: {
    type: 'json_object';
  };
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Validates OpenAI API key format
 * @param apiKey - The API key to validate
 * @returns true if the key format is valid
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  return API_KEY_FORMAT.test(apiKey.trim());
}

/**
 * Stores OpenAI API key in localStorage
 * @param apiKey - The API key to store
 * @returns true if storage was successful
 */
export function storeApiKey(apiKey: string): boolean {
  try {
    if (!validateApiKeyFormat(apiKey)) {
      return false;
    }
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    return true;
  } catch (error) {
    console.error('Failed to store API key:', error);
    return false;
  }
}

/**
 * Retrieves OpenAI API key from localStorage
 * @returns The stored API key or null if not found
 */
export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return null;
  }
}

/**
 * Removes OpenAI API key from localStorage
 */
export function clearApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear API key:', error);
  }
}

/**
 * Checks if an API key is currently stored
 * @returns true if a valid API key is stored
 */
export function hasStoredApiKey(): boolean {
  const key = getStoredApiKey();
  return key !== null && validateApiKeyFormat(key);
}

/**
 * Parses OpenAI API error responses into user-friendly error objects
 * @param error - The error from the API call
 * @returns Structured error object with type and message
 */
function parseApiError(error: any): OpenAIError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      retryable: true,
    };
  }

  // Timeout errors (AbortController abort)
  if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      retryable: true,
    };
  }

  // HTTP error responses
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          type: 'invalid_key',
          message: 'Invalid API key. Please check your OpenAI API key and try again.',
          retryable: false,
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Rate limit exceeded. Please wait a moment and try again.',
          retryable: true,
        };
      case 500:
      case 502:
      case 503:
        return {
          type: 'network',
          message: 'OpenAI service is temporarily unavailable. Please try again later.',
          retryable: true,
        };
      default:
        return {
          type: 'unknown',
          message: `API error (${error.status}): ${error.message || 'Unknown error occurred'}`,
          retryable: false,
        };
    }
  }

  // Invalid response format
  if (error.message?.includes('JSON') || error.message?.includes('parse')) {
    return {
      type: 'invalid_response',
      message: 'Received invalid response from AI. Please try rephrasing your prompt.',
      retryable: true,
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred. Please try again.',
    retryable: false,
  };
}

/**
 * Gets user-friendly guidance for common error types
 * @param errorType - The type of error that occurred
 * @returns Helpful guidance text for the user
 */
export function getErrorGuidance(errorType: OpenAIError['type']): string {
  switch (errorType) {
    case 'invalid_key':
      return 'Make sure you\'re using a valid OpenAI API key starting with "sk-". You can get one from platform.openai.com/api-keys.';
    case 'rate_limit':
      return 'You\'ve made too many requests. Wait 60 seconds before trying again, or check your OpenAI account usage limits.';
    case 'timeout':
      return 'The request took too long. Try simplifying your prompt or check your internet connection.';
    case 'network':
      return 'Check your internet connection. If the problem persists, OpenAI\'s service may be experiencing issues.';
    case 'invalid_response':
      return 'The AI returned an unexpected format. Try rephrasing your prompt to be more specific about what you want.';
    default:
      return 'If this problem continues, try refreshing the page or checking the browser console for more details.';
  }
}

/**
 * Makes a request to the OpenAI API
 * @param request - The OpenAI request configuration
 * @param apiKey - The API key to use for authentication
 * @param timeoutMs - Request timeout in milliseconds (default: 30000)
 * @returns The API response or error
 */
export async function makeOpenAIRequest(
  request: OpenAIRequest,
  apiKey: string,
  timeoutMs: number = 30000
): Promise<{ response?: OpenAIResponse; error?: OpenAIError }> {
  // Validate API key format before making request
  if (!validateApiKeyFormat(apiKey)) {
    return {
      error: {
        type: 'invalid_key',
        message: 'Invalid API key format. Please check your OpenAI API key.',
        retryable: false,
      },
    };
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.error?.message || response.statusText,
      };
    }

    // Parse successful response
    const data: OpenAIResponse = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.usage) {
      throw {
        message: 'Invalid response structure from OpenAI API',
      };
    }

    return { response: data };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return { error: parseApiError(error) };
  }
}

/**
 * Estimates the number of tokens in a text string
 * Uses a simple approximation: ~4 characters per token
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Rough approximation: 1 token ≈ 4 characters
  // This is a simplified estimate; actual tokenization is more complex
  return Math.ceil(text.length / 4);
}

/**
 * Estimates the cost of an OpenAI API request in USD
 * Based on current OpenAI pricing (as of 2024)
 * @param model - The model being used
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @returns Estimated cost in USD
 */
export function estimateCost(
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gpt-4-turbo',
  promptTokens: number,
  completionTokens: number
): number {
  // Pricing per 1K tokens (as of 2024)
  const pricing = {
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  };

  const modelPricing = pricing[model];
  const promptCost = (promptTokens / 1000) * modelPricing.prompt;
  const completionCost = (completionTokens / 1000) * modelPricing.completion;
  
  return promptCost + completionCost;
}

/**
 * Formats a cost value as a USD string
 * @param cost - The cost in USD
 * @returns Formatted cost string (e.g., "$0.0012")
 */
export function formatCost(cost: number): string {
  if (cost < 0.0001) {
    return '<$0.0001';
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Gets the OpenAI pricing documentation URL
 * @returns URL to OpenAI pricing page
 */
export function getPricingUrl(): string {
  return 'https://openai.com/api/pricing/';
}

/**
 * Validates an API key by making a minimal test request
 * @param apiKey - The API key to validate
 * @returns true if the key is valid and works
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!validateApiKeyFormat(apiKey)) {
    return false;
  }

  const testRequest: OpenAIRequest = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'test' }
    ],
    temperature: 0.7,
  };

  const { error } = await makeOpenAIRequest(testRequest, apiKey, 10000);
  
  // If there's no error or the error is not about invalid key, the key is valid
  return !error || error.type !== 'invalid_key';
}
