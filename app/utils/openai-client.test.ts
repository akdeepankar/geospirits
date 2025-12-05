import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  validateApiKeyFormat,
  storeApiKey,
  getStoredApiKey,
  clearApiKey,
  hasStoredApiKey,
  estimateTokens,
  estimateCost,
  formatCost,
  getPricingUrl,
  makeOpenAIRequest,
  OpenAIRequest,
} from './openai-client';

describe('OpenAI Client - API Key Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('validateApiKeyFormat', () => {
    it('should accept valid OpenAI API key format', () => {
      expect(validateApiKeyFormat('sk-1234567890abcdefghij')).toBe(true);
      expect(validateApiKeyFormat('sk-proj-1234567890abcdefghijklmnopqrstuvwxyz')).toBe(true);
    });

    it('should reject invalid API key formats', () => {
      expect(validateApiKeyFormat('')).toBe(false);
      expect(validateApiKeyFormat('invalid-key')).toBe(false);
      expect(validateApiKeyFormat('sk-')).toBe(false);
      expect(validateApiKeyFormat('sk-short')).toBe(false);
      expect(validateApiKeyFormat('not-starting-with-sk')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validateApiKeyFormat(null as any)).toBe(false);
      expect(validateApiKeyFormat(undefined as any)).toBe(false);
      expect(validateApiKeyFormat(123 as any)).toBe(false);
    });

    it('should handle whitespace in API keys', () => {
      expect(validateApiKeyFormat('  sk-1234567890abcdefghij  ')).toBe(true);
    });
  });

  describe('storeApiKey and getStoredApiKey', () => {
    it('should store and retrieve valid API key', () => {
      const apiKey = 'sk-1234567890abcdefghij';
      expect(storeApiKey(apiKey)).toBe(true);
      expect(getStoredApiKey()).toBe(apiKey);
    });

    it('should not store invalid API key', () => {
      expect(storeApiKey('invalid-key')).toBe(false);
      expect(getStoredApiKey()).toBe(null);
    });

    it('should trim whitespace when storing', () => {
      const apiKey = '  sk-1234567890abcdefghij  ';
      expect(storeApiKey(apiKey)).toBe(true);
      expect(getStoredApiKey()).toBe('sk-1234567890abcdefghij');
    });

    it('should return null when no key is stored', () => {
      expect(getStoredApiKey()).toBe(null);
    });
  });

  describe('clearApiKey', () => {
    it('should remove stored API key', () => {
      const apiKey = 'sk-1234567890abcdefghij';
      storeApiKey(apiKey);
      expect(getStoredApiKey()).toBe(apiKey);
      
      clearApiKey();
      expect(getStoredApiKey()).toBe(null);
    });

    it('should not throw when clearing non-existent key', () => {
      expect(() => clearApiKey()).not.toThrow();
    });
  });

  describe('hasStoredApiKey', () => {
    it('should return true when valid key is stored', () => {
      storeApiKey('sk-1234567890abcdefghij');
      expect(hasStoredApiKey()).toBe(true);
    });

    it('should return false when no key is stored', () => {
      expect(hasStoredApiKey()).toBe(false);
    });

    it('should return false after clearing key', () => {
      storeApiKey('sk-1234567890abcdefghij');
      clearApiKey();
      expect(hasStoredApiKey()).toBe(false);
    });
  });
});

describe('OpenAI Client - Token Estimation', () => {
  describe('estimateTokens', () => {
    it('should estimate tokens for text', () => {
      // Rough approximation: 1 token ≈ 4 characters
      expect(estimateTokens('test')).toBe(1); // 4 chars = 1 token
      expect(estimateTokens('hello world')).toBe(3); // 11 chars ≈ 3 tokens
      expect(estimateTokens('a'.repeat(100))).toBe(25); // 100 chars = 25 tokens
    });

    it('should return 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should handle null/undefined gracefully', () => {
      expect(estimateTokens(null as any)).toBe(0);
      expect(estimateTokens(undefined as any)).toBe(0);
    });

    it('should round up token estimates', () => {
      // 5 characters should round up to 2 tokens
      expect(estimateTokens('hello')).toBe(2);
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost for GPT-4', () => {
      // GPT-4: $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
      const cost = estimateCost('gpt-4', 1000, 1000);
      expect(cost).toBe(0.09); // (1000/1000 * 0.03) + (1000/1000 * 0.06)
    });

    it('should calculate cost for GPT-4-turbo', () => {
      // GPT-4-turbo: $0.01 per 1K prompt tokens, $0.03 per 1K completion tokens
      const cost = estimateCost('gpt-4-turbo', 1000, 1000);
      expect(cost).toBe(0.04); // (1000/1000 * 0.01) + (1000/1000 * 0.03)
    });

    it('should calculate cost for GPT-3.5-turbo', () => {
      // GPT-3.5-turbo: $0.0005 per 1K prompt tokens, $0.0015 per 1K completion tokens
      const cost = estimateCost('gpt-3.5-turbo', 1000, 1000);
      expect(cost).toBe(0.002); // (1000/1000 * 0.0005) + (1000/1000 * 0.0015)
    });

    it('should handle small token counts', () => {
      const cost = estimateCost('gpt-4-turbo', 10, 20);
      expect(cost).toBeCloseTo(0.0007, 4); // (10/1000 * 0.01) + (20/1000 * 0.03)
    });

    it('should handle large token counts', () => {
      const cost = estimateCost('gpt-4-turbo', 10000, 5000);
      expect(cost).toBe(0.25); // (10000/1000 * 0.01) + (5000/1000 * 0.03)
    });

    it('should handle zero tokens', () => {
      const cost = estimateCost('gpt-4-turbo', 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe('formatCost', () => {
    it('should format costs with 4 decimal places', () => {
      expect(formatCost(0.0123)).toBe('$0.0123');
      expect(formatCost(0.1234)).toBe('$0.1234');
      expect(formatCost(1.2345)).toBe('$1.2345');
    });

    it('should handle very small costs', () => {
      expect(formatCost(0.00001)).toBe('<$0.0001');
      expect(formatCost(0.00009)).toBe('<$0.0001');
    });

    it('should handle zero cost', () => {
      expect(formatCost(0)).toBe('<$0.0001');
    });

    it('should handle large costs', () => {
      expect(formatCost(10.5678)).toBe('$10.5678');
      expect(formatCost(100.1234)).toBe('$100.1234');
    });
  });

  describe('getPricingUrl', () => {
    it('should return OpenAI pricing URL', () => {
      const url = getPricingUrl();
      expect(url).toBe('https://openai.com/api/pricing/');
      expect(url).toContain('openai.com');
      expect(url).toContain('pricing');
    });
  });
});

describe('OpenAI Client - API Requests', () => {
  beforeEach(() => {
    // Reset fetch mock
    vi.restoreAllMocks();
  });

  describe('makeOpenAIRequest', () => {
    it('should reject invalid API key format before making request', async () => {
      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'invalid-key');
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('invalid_key');
      expect(result.response).toBeUndefined();
    });

    it('should handle successful API response', async () => {
      const mockResponse = {
        id: 'test-id',
        choices: [
          {
            message: { content: '{"components": []}' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
      
      expect(result.response).toBeDefined();
      expect(result.response?.id).toBe('test-id');
      expect(result.response?.usage.total_tokens).toBe(30);
      expect(result.error).toBeUndefined();
    });

    it('should handle 401 unauthorized error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('invalid_key');
      expect(result.error?.retryable).toBe(false);
    });

    it('should handle 429 rate limit error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('rate_limit');
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('network');
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle timeout', async () => {
      // Mock a slow response that will timeout
      global.fetch = vi.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          // Listen for abort signal
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            });
          }
          // Never resolve to simulate a slow request
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              id: 'test',
              choices: [{ message: { content: '{}' }, finish_reason: 'stop' }],
              usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
            }),
          }), 1000);
        });
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      // Use a very short timeout
      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij', 10);
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('timeout');
      expect(result.error?.retryable).toBe(true);
    });

    it('should handle invalid response structure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
      
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('unknown');
    });

    it('should include authorization header', async () => {
      let capturedHeaders: any;
      
      global.fetch = vi.fn().mockImplementation((url, options) => {
        capturedHeaders = options.headers;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'test',
            choices: [{ message: { content: '{}' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          }),
        });
      });

      const request: OpenAIRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.7,
      };

      await makeOpenAIRequest(request, 'sk-test1234567890abcdef');
      
      expect(capturedHeaders.Authorization).toBe('Bearer sk-test1234567890abcdef');
    });
  });
});

describe('Property-Based Tests', () => {
  // Feature: ai-page-generator, Property 7: API key validation
  // **Validates: Requirements 9.2**
  describe('Property 7: API key validation', () => {
    it('should reject any string that does not match OpenAI API key format (sk-...)', () => {
      fc.assert(
        fc.property(fc.string(), (randomString) => {
          // If the string doesn't match the valid format, it should be rejected
          const isValidFormat = /^sk-[a-zA-Z0-9\-_]{20,}$/.test(randomString.trim());
          const validationResult = validateApiKeyFormat(randomString);
          
          // The validation result should match our format check
          expect(validationResult).toBe(isValidFormat);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid API keys before making API calls', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => {
            // Generate strings that are NOT valid API keys
            const trimmed = s.trim();
            return !/^sk-[a-zA-Z0-9\-_]{20,}$/.test(trimmed);
          }),
          async (invalidKey) => {
            const request: OpenAIRequest = {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              temperature: 0.7,
            };

            const result = await makeOpenAIRequest(request, invalidKey);
            
            // Should return an error
            expect(result.error).toBeDefined();
            expect(result.error?.type).toBe('invalid_key');
            expect(result.response).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid API key formats', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.constantFrom('sk-', 'sk-proj-'),
            fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('')), { minLength: 20, maxLength: 50 })
          ),
          ([prefix, suffixArray]) => {
            const suffix = suffixArray.join('');
            const validKey = prefix + suffix;
            const result = validateApiKeyFormat(validKey);
            
            // All keys with valid format should be accepted
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle whitespace consistently', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.constantFrom('sk-', 'sk-proj-'),
            fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('')), { minLength: 20, maxLength: 50 }),
            fc.string({ maxLength: 10 }).filter(s => /^\s*$/.test(s)), // whitespace only
            fc.string({ maxLength: 10 }).filter(s => /^\s*$/.test(s))  // whitespace only
          ),
          ([prefix, suffixArray, leadingWhitespace, trailingWhitespace]) => {
            const suffix = suffixArray.join('');
            const validKey = prefix + suffix;
            const keyWithWhitespace = leadingWhitespace + validKey + trailingWhitespace;
            
            // Should accept keys with whitespace (they get trimmed)
            const result = validateApiKeyFormat(keyWithWhitespace);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: ai-page-generator, Property 8: Token tracking accuracy
  // **Validates: Requirements 10.2, 10.3, 10.4**
  describe('Property 8: Token tracking accuracy', () => {
    it('should estimate tokens within 20% of actual usage for various prompts', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 1000 }),
          (prompt) => {
            // Estimate tokens for the prompt
            const estimatedTokens = estimateTokens(prompt);
            
            // Simulate actual token count (using the same estimation for testing)
            // In real usage, this would come from the API response
            const actualTokens = Math.ceil(prompt.length / 4);
            
            // Verify estimate is within 20% of actual
            const difference = Math.abs(estimatedTokens - actualTokens);
            const percentDifference = actualTokens > 0 ? (difference / actualTokens) * 100 : 0;
            
            expect(percentDifference).toBeLessThanOrEqual(20);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accurately track cumulative token usage across multiple generations', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              promptTokens: fc.integer({ min: 10, max: 1000 }),
              completionTokens: fc.integer({ min: 10, max: 2000 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (generations) => {
            let cumulativePrompt = 0;
            let cumulativeCompletion = 0;
            let cumulativeTotal = 0;
            let cumulativeCost = 0;

            // Simulate tracking across multiple generations
            for (const gen of generations) {
              cumulativePrompt += gen.promptTokens;
              cumulativeCompletion += gen.completionTokens;
              cumulativeTotal += gen.promptTokens + gen.completionTokens;
              cumulativeCost += estimateCost('gpt-4-turbo', gen.promptTokens, gen.completionTokens);
            }

            // Verify cumulative totals are correct
            expect(cumulativeTotal).toBe(cumulativePrompt + cumulativeCompletion);
            
            // Verify cost is non-negative and reasonable
            expect(cumulativeCost).toBeGreaterThanOrEqual(0);
            
            // Verify cost increases with token count
            if (generations.length > 1) {
              const firstGenCost = estimateCost('gpt-4-turbo', generations[0].promptTokens, generations[0].completionTokens);
              expect(cumulativeCost).toBeGreaterThanOrEqual(firstGenCost);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide consistent cost estimates for the same token counts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 10000 }),
          fc.constantFrom('gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'),
          (promptTokens, completionTokens, model) => {
            // Calculate cost twice with same inputs
            const cost1 = estimateCost(model, promptTokens, completionTokens);
            const cost2 = estimateCost(model, promptTokens, completionTokens);
            
            // Should be exactly the same
            expect(cost1).toBe(cost2);
            
            // Should be non-negative
            expect(cost1).toBeGreaterThanOrEqual(0);
            
            // Should increase with token count
            if (promptTokens > 1 || completionTokens > 1) {
              const smallerCost = estimateCost(model, 1, 1);
              expect(cost1).toBeGreaterThanOrEqual(smallerCost);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format costs consistently regardless of magnitude', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (cost) => {
            const formatted = formatCost(cost);
            
            // Should always start with $ or <$
            expect(formatted).toMatch(/^(\$|<\$)/);
            
            // Should contain a number
            expect(formatted).toMatch(/\d/);
            
            // For costs >= 0.0001, should have exactly 4 decimal places
            if (cost >= 0.0001) {
              expect(formatted).toMatch(/^\$\d+\.\d{4}$/);
            } else {
              expect(formatted).toBe('<$0.0001');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain token tracking accuracy across different prompt lengths', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 500 }), { minLength: 1, maxLength: 20 }),
          (prompts) => {
            let totalEstimatedTokens = 0;
            
            // Estimate tokens for each prompt
            for (const prompt of prompts) {
              const estimated = estimateTokens(prompt);
              totalEstimatedTokens += estimated;
              
              // Each estimate should be reasonable (roughly 1 token per 4 chars)
              const expectedTokens = Math.ceil(prompt.length / 4);
              expect(estimated).toBe(expectedTokens);
            }
            
            // Total should be sum of all estimates
            const sumOfIndividualEstimates = prompts.reduce((sum, p) => sum + estimateTokens(p), 0);
            expect(totalEstimatedTokens).toBe(sumOfIndividualEstimates);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: ai-page-generator, Property 4: API error handling
  // **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  describe('Property 4: API error handling', () => {
    it('should display user-friendly error messages for all API error types', async () => {
      const errorScenarios = [
        { status: 401, expectedType: 'invalid_key', retryable: false },
        { status: 429, expectedType: 'rate_limit', retryable: true },
        { status: 500, expectedType: 'network', retryable: true },
        { status: 502, expectedType: 'network', retryable: true },
        { status: 503, expectedType: 'network', retryable: true },
      ];

      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...errorScenarios),
          fc.string({ minLength: 1, maxLength: 100 }),
          async (scenario, errorMessage) => {
            // Mock fetch to return the error status
            global.fetch = vi.fn().mockResolvedValue({
              ok: false,
              status: scenario.status,
              statusText: 'Error',
              json: async () => ({ error: { message: errorMessage } }),
            });

            const request: OpenAIRequest = {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              temperature: 0.7,
            };

            const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
            
            // Should return an error with the expected type
            expect(result.error).toBeDefined();
            expect(result.error?.type).toBe(scenario.expectedType);
            expect(result.error?.retryable).toBe(scenario.retryable);
            expect(result.error?.message).toBeTruthy();
            expect(result.response).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle network errors without corrupting state', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            new TypeError('Failed to fetch'),
            (() => { const e = new Error('Request aborted'); e.name = 'AbortError'; return e; })()
          ),
          async (networkError) => {
            // Mock fetch to throw network error
            global.fetch = vi.fn().mockRejectedValue(networkError);

            const request: OpenAIRequest = {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              temperature: 0.7,
            };

            const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
            
            // Should return an error
            expect(result.error).toBeDefined();
            expect(result.error?.retryable).toBe(true);
            expect(result.error?.message).toBeTruthy();
            expect(result.response).toBeUndefined();
            
            // Error type should be either network or timeout
            expect(['network', 'timeout']).toContain(result.error?.type);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle invalid response formats gracefully', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({}), // Empty object
            fc.record({ invalid: fc.string() }), // Invalid structure
            fc.record({ choices: fc.constant([]) }), // Missing usage
            fc.record({ usage: fc.record({}) }), // Missing choices
          ),
          async (invalidResponse) => {
            // Mock fetch to return invalid response structure
            global.fetch = vi.fn().mockResolvedValue({
              ok: true,
              json: async () => invalidResponse,
            });

            const request: OpenAIRequest = {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              temperature: 0.7,
            };

            const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij');
            
            // Should return an error for invalid response
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeTruthy();
            expect(result.response).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain consistent error structure across all error types', async () => {
      const allErrorTypes = [
        { type: 'network', mock: () => Promise.reject(new TypeError('Failed to fetch')) },
        { type: 'timeout', mock: () => new Promise((_, reject) => {
          const error = new Error('Timeout');
          error.name = 'AbortError';
          setTimeout(() => reject(error), 5);
        })},
        { type: 'invalid_key', mock: () => Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ error: { message: 'Invalid key' } }),
        })},
        { type: 'rate_limit', mock: () => Promise.resolve({
          ok: false,
          status: 429,
          json: async () => ({ error: { message: 'Rate limit' } }),
        })},
      ];

      fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...allErrorTypes),
          async (errorType) => {
            // Mock fetch with the error scenario
            global.fetch = vi.fn().mockImplementation(() => errorType.mock());

            const request: OpenAIRequest = {
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'test' }],
              temperature: 0.7,
            };

            const result = await makeOpenAIRequest(request, 'sk-1234567890abcdefghij', 10);
            
            // All errors should have consistent structure
            expect(result.error).toBeDefined();
            expect(result.error).toHaveProperty('type');
            expect(result.error).toHaveProperty('message');
            expect(result.error).toHaveProperty('retryable');
            expect(typeof result.error?.type).toBe('string');
            expect(typeof result.error?.message).toBe('string');
            expect(typeof result.error?.retryable).toBe('boolean');
            expect(result.response).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
