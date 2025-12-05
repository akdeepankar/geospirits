/**
 * Integration tests for AI component generation flow
 * Tests the complete flow from prompt input to component addition
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSystemPrompt, enhanceUserPrompt, parseAIResponse, validatePrompt } from '../utils/prompt-engineering';
import { makeOpenAIRequest, estimateTokens } from '../utils/openai-client';

describe('Component Generation Flow', () => {
  describe('Prompt Validation', () => {
    it('should reject empty prompts', () => {
      expect(validatePrompt('')).toBe(false);
      expect(validatePrompt('   ')).toBe(false);
      expect(validatePrompt('\n\t')).toBe(false);
    });

    it('should accept valid prompts', () => {
      expect(validatePrompt('Create a landing page')).toBe(true);
      expect(validatePrompt('  Build a portfolio  ')).toBe(true);
    });
  });

  describe('Prompt Enhancement', () => {
    it('should enhance user prompt with configuration', () => {
      const userPrompt = 'Create a landing page';
      const config = {
        tone: 'professional' as const,
        preferredComponents: [],
        themePreference: 'light' as const,
        maxComponents: 5,
        includeImages: true,
        includeButtons: true,
      };

      const enhanced = enhanceUserPrompt(userPrompt, config, []);
      
      expect(enhanced).toContain('Create a landing page');
      expect(enhanced).toContain('professional');
      expect(enhanced).toContain('Maximum components: 5');
    });

    it('should include existing component context', () => {
      const userPrompt = 'Add more content';
      const config = {
        tone: 'casual' as const,
        preferredComponents: [],
        themePreference: 'auto' as const,
      };
      const existingComponents = [
        { id: '1', type: 'heading' as const, content: 'Welcome' },
        { id: '2', type: 'paragraph' as const, content: 'About us' },
      ];

      const enhanced = enhanceUserPrompt(userPrompt, config, existingComponents);
      
      expect(enhanced).toContain('2 component(s)');
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens for prompts', () => {
      const shortPrompt = 'Hello';
      const longPrompt = 'Create a comprehensive landing page with hero section, features, testimonials, and call-to-action buttons';
      
      expect(estimateTokens(shortPrompt)).toBeGreaterThan(0);
      expect(estimateTokens(longPrompt)).toBeGreaterThan(estimateTokens(shortPrompt));
    });

    it('should handle empty strings', () => {
      expect(estimateTokens('')).toBe(0);
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid AI response into components', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'heading',
            content: 'Welcome',
            style: {
              textAlign: 'center',
              fontSize: '48px',
              color: '#333333',
            },
          },
          {
            type: 'paragraph',
            content: 'This is a test paragraph',
            style: {
              fontSize: '16px',
            },
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('heading');
      expect(components[0].content).toBe('Welcome');
      expect(components[0].id).toMatch(/^ai-heading-/);
      expect(components[1].type).toBe('paragraph');
    });

    it('should add default styles to components', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'text',
            content: 'Simple text',
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components).toHaveLength(1);
      expect(components[0].style).toBeDefined();
      expect(components[0].style?.textAlign).toBe('left');
      expect(components[0].style?.fontSize).toBe('16px');
      expect(components[0].style?.color).toBe('#000000');
    });

    it('should generate unique IDs for each component', () => {
      const mockResponse = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title 1' },
          { type: 'heading', content: 'Title 2' },
          { type: 'heading', content: 'Title 3' },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      const ids = components.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(3);
    });

    it('should handle gallery components with images', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'gallery',
            content: '',
            images: ['url1.jpg', 'url2.jpg', 'url3.jpg'],
            style: {
              galleryColumns: 3,
              galleryGap: '16px',
            },
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('gallery');
      expect(components[0].images).toHaveLength(3);
      expect(components[0].style?.galleryColumns).toBe(3);
    });

    it('should handle button components with actions', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'button',
            content: 'Click Me',
            action: {
              type: 'link',
              value: 'https://example.com',
            },
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('button');
      expect(components[0].action?.type).toBe('link');
      expect(components[0].action?.value).toBe('https://example.com');
    });

    it('should filter out invalid components', () => {
      const mockResponse = JSON.stringify({
        components: [
          { type: 'heading', content: 'Valid' },
          { type: 'invalid_type', content: 'Invalid' },
          { type: 'paragraph', content: 'Also valid' },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('heading');
      expect(components[1].type).toBe('paragraph');
    });

    it('should return empty array for invalid JSON', () => {
      const components = parseAIResponse('not valid json');
      expect(components).toHaveLength(0);
    });

    it('should return empty array for missing components array', () => {
      const mockResponse = JSON.stringify({ data: 'no components' });
      const components = parseAIResponse(mockResponse);
      expect(components).toHaveLength(0);
    });
  });

  describe('System Prompt', () => {
    it('should include all component types', () => {
      const systemPrompt = buildSystemPrompt();
      
      expect(systemPrompt).toContain('heading');
      expect(systemPrompt).toContain('text');
      expect(systemPrompt).toContain('paragraph');
      expect(systemPrompt).toContain('image');
      expect(systemPrompt).toContain('gallery');
      expect(systemPrompt).toContain('button');
      expect(systemPrompt).toContain('divider');
      expect(systemPrompt).toContain('html');
    });

    it('should specify JSON response format', () => {
      const systemPrompt = buildSystemPrompt();
      
      expect(systemPrompt).toContain('JSON');
      expect(systemPrompt).toContain('components');
    });

    it('should include styling guidelines', () => {
      const systemPrompt = buildSystemPrompt();
      
      expect(systemPrompt).toContain('style');
      expect(systemPrompt).toContain('textAlign');
      expect(systemPrompt).toContain('fontSize');
      expect(systemPrompt).toContain('color');
    });
  });

  describe('Component Addition with Tracking', () => {
    it('should track generated component IDs', () => {
      const mockResponse = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title' },
          { type: 'paragraph', content: 'Content' },
        ],
      });

      const components = parseAIResponse(mockResponse);
      const generatedIds = components.map(c => c.id);
      
      expect(generatedIds).toHaveLength(2);
      generatedIds.forEach(id => {
        expect(id).toMatch(/^ai-/);
      });
    });

    it('should preserve existing components when adding new ones', () => {
      const existingComponents = [
        { id: 'manual-1', type: 'heading' as const, content: 'Existing' },
      ];

      const mockResponse = JSON.stringify({
        components: [
          { type: 'paragraph', content: 'New content' },
        ],
      });

      const newComponents = parseAIResponse(mockResponse);
      const allComponents = [...existingComponents, ...newComponents];
      
      expect(allComponents).toHaveLength(2);
      expect(allComponents[0].id).toBe('manual-1');
      expect(allComponents[1].id).toMatch(/^ai-/);
    });
  });

  describe('Component Styling Defaults', () => {
    it('should apply appropriate font sizes for different component types', () => {
      const mockResponse = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title' },
          { type: 'text', content: 'Text' },
          { type: 'paragraph', content: 'Paragraph' },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components[0].style?.fontSize).toBe('32px'); // heading
      expect(components[1].style?.fontSize).toBe('16px'); // text
      expect(components[2].style?.fontSize).toBe('16px'); // paragraph
    });

    it('should preserve custom styles from AI response', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'heading',
            content: 'Custom',
            style: {
              fontSize: '64px',
              color: '#ff0000',
              textAlign: 'center',
            },
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      expect(components[0].style?.fontSize).toBe('64px');
      expect(components[0].style?.color).toBe('#ff0000');
      expect(components[0].style?.textAlign).toBe('center');
    });

    it('should merge custom styles with defaults', () => {
      const mockResponse = JSON.stringify({
        components: [
          {
            type: 'paragraph',
            content: 'Text',
            style: {
              color: '#blue',
            },
          },
        ],
      });

      const components = parseAIResponse(mockResponse);
      
      // Custom style preserved
      expect(components[0].style?.color).toBe('#blue');
      // Defaults applied
      expect(components[0].style?.textAlign).toBe('left');
      expect(components[0].style?.fontSize).toBe('16px');
      expect(components[0].style?.padding).toBe('8px');
    });
  });
});
