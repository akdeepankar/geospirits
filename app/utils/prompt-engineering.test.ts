/**
 * Tests for Prompt Engineering Module
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  buildSystemPrompt,
  enhanceUserPrompt,
  sanitizeHtmlContent,
  validateComponent,
  parseAIResponse,
  validatePrompt,
  GenerationConfig,
} from './prompt-engineering';
import { PageComponent, ComponentType } from '../types/pageBuilder';

describe('Prompt Engineering Module', () => {
  describe('buildSystemPrompt', () => {
    it('should return a non-empty system prompt', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(100);
    });

    it('should include all component types', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('heading');
      expect(prompt).toContain('text');
      expect(prompt).toContain('paragraph');
      expect(prompt).toContain('image');
      expect(prompt).toContain('gallery');
      expect(prompt).toContain('button');
      expect(prompt).toContain('divider');
      expect(prompt).toContain('html');
    });

    it('should include JSON structure instructions', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('components');
    });

    it('should include styling properties', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('textAlign');
      expect(prompt).toContain('fontSize');
      expect(prompt).toContain('color');
    });
  });

  describe('enhanceUserPrompt', () => {
    it('should include the user prompt', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };
      const enhanced = enhanceUserPrompt('Create a landing page', config);
      expect(enhanced).toContain('Create a landing page');
    });

    it('should include tone guidance', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('professional');
    });

    it('should include theme preference for dark theme', () => {
      const config: GenerationConfig = {
        tone: 'casual',
        preferredComponents: [],
        themePreference: 'dark',
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('dark');
      expect(enhanced).toContain('light text');
    });

    it('should include theme preference for light theme', () => {
      const config: GenerationConfig = {
        tone: 'casual',
        preferredComponents: [],
        themePreference: 'light',
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('light');
      expect(enhanced).toContain('dark text');
    });

    it('should include preferred components', () => {
      const config: GenerationConfig = {
        tone: 'creative',
        preferredComponents: ['heading', 'image', 'button'],
        themePreference: 'auto',
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('heading');
      expect(enhanced).toContain('image');
      expect(enhanced).toContain('button');
    });

    it('should include max components limit', () => {
      const config: GenerationConfig = {
        tone: 'minimal',
        preferredComponents: [],
        themePreference: 'auto',
        maxComponents: 5,
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('5');
      expect(enhanced).toContain('Maximum');
    });

    it('should mention existing components', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };
      const existing: PageComponent[] = [
        { id: '1', type: 'heading', content: 'Test' },
        { id: '2', type: 'paragraph', content: 'Test paragraph' },
      ];
      const enhanced = enhanceUserPrompt('Test prompt', config, existing);
      expect(enhanced).toContain('2 component');
    });

    it('should handle includeImages false', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        includeImages: false,
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('Avoid');
      expect(enhanced).toContain('image');
    });

    it('should handle includeButtons false', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        includeButtons: false,
      };
      const enhanced = enhanceUserPrompt('Test prompt', config);
      expect(enhanced).toContain('Avoid');
      expect(enhanced).toContain('button');
    });
  });

  describe('sanitizeHtmlContent', () => {
    it('should remove script tags', () => {
      const html = '<div>Hello</div><script>alert("xss")</script>';
      const sanitized = sanitizeHtmlContent(html);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<div>Hello</div>');
    });

    it('should remove onclick handlers', () => {
      const html = '<button onclick="alert(\'xss\')">Click</button>';
      const sanitized = sanitizeHtmlContent(html);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('<button');
      expect(sanitized).toContain('Click');
    });

    it('should remove onerror handlers', () => {
      const html = '<img src="x" onerror="alert(\'xss\')">';
      const sanitized = sanitizeHtmlContent(html);
      expect(sanitized).not.toContain('onerror');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = sanitizeHtmlContent(html);
      expect(sanitized).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const html = '<div class="container"><h1>Title</h1><p>Content</p></div>';
      const sanitized = sanitizeHtmlContent(html);
      expect(sanitized).toBe(html);
    });
  });

  describe('validateComponent', () => {
    it('should validate a valid heading component', () => {
      const component = {
        type: 'heading',
        content: 'Test Heading',
        style: {
          textAlign: 'center' as const,
          fontSize: '32px',
          color: '#333333',
        },
      };
      expect(validateComponent(component)).toBe(true);
    });

    it('should validate a valid button component with action', () => {
      const component = {
        type: 'button',
        content: 'Click Me',
        action: {
          type: 'link',
          value: 'https://example.com',
        },
      };
      expect(validateComponent(component)).toBe(true);
    });

    it('should validate a valid gallery component', () => {
      const component = {
        type: 'gallery',
        content: '',
        images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
        style: {
          galleryColumns: 3,
          galleryGap: '16px',
        },
      };
      expect(validateComponent(component)).toBe(true);
    });

    it('should reject component without type', () => {
      const component = {
        content: 'Test',
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component with invalid type', () => {
      const component = {
        type: 'invalid',
        content: 'Test',
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component without content', () => {
      const component = {
        type: 'heading',
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component with non-string content', () => {
      const component = {
        type: 'heading',
        content: 123,
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component with invalid textAlign', () => {
      const component = {
        type: 'heading',
        content: 'Test',
        style: {
          textAlign: 'invalid',
        },
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component with invalid action type', () => {
      const component = {
        type: 'button',
        content: 'Click',
        action: {
          type: 'invalid',
        },
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject component with non-array images', () => {
      const component = {
        type: 'gallery',
        content: '',
        images: 'not-an-array',
      };
      expect(validateComponent(component)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(validateComponent(null)).toBe(false);
      expect(validateComponent(undefined)).toBe(false);
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid AI response with single component', () => {
      const response = JSON.stringify({
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
        ],
      });

      const components = parseAIResponse(response);
      expect(components).toHaveLength(1);
      expect(components[0].type).toBe('heading');
      expect(components[0].content).toBe('Welcome');
      expect(components[0].id).toBeTruthy();
      expect(components[0].style?.textAlign).toBe('center');
    });

    it('should parse multiple components', () => {
      const response = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title' },
          { type: 'paragraph', content: 'Description' },
          { type: 'button', content: 'Click Me', action: { type: 'link', value: 'https://example.com' } },
        ],
      });

      const components = parseAIResponse(response);
      expect(components).toHaveLength(3);
      expect(components[0].type).toBe('heading');
      expect(components[1].type).toBe('paragraph');
      expect(components[2].type).toBe('button');
    });

    it('should apply default styles to components', () => {
      const response = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title' },
        ],
      });

      const components = parseAIResponse(response);
      expect(components[0].style).toBeDefined();
      expect(components[0].style?.fontSize).toBe('32px'); // Default for heading
      expect(components[0].style?.color).toBe('#000000');
      expect(components[0].style?.padding).toBe('8px');
    });

    it('should sanitize HTML content', () => {
      const response = JSON.stringify({
        components: [
          {
            type: 'html',
            content: '<div>Safe</div><script>alert("xss")</script>',
          },
        ],
      });

      const components = parseAIResponse(response);
      expect(components[0].content).toContain('<div>Safe</div>');
      expect(components[0].content).not.toContain('<script>');
    });

    it('should filter out invalid components', () => {
      const response = JSON.stringify({
        components: [
          { type: 'heading', content: 'Valid' },
          { type: 'invalid', content: 'Invalid' },
          { type: 'paragraph', content: 'Also Valid' },
        ],
      });

      const components = parseAIResponse(response);
      expect(components).toHaveLength(2);
      expect(components[0].type).toBe('heading');
      expect(components[1].type).toBe('paragraph');
    });

    it('should handle gallery components with images', () => {
      const response = JSON.stringify({
        components: [
          {
            type: 'gallery',
            content: '',
            images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
            style: {
              galleryColumns: 4,
              galleryGap: '20px',
            },
          },
        ],
      });

      const components = parseAIResponse(response);
      expect(components).toHaveLength(1);
      expect(components[0].images).toHaveLength(2);
      expect(components[0].style?.galleryColumns).toBe(4);
      expect(components[0].style?.galleryGap).toBe('20px');
    });

    it('should apply default gallery settings if not provided', () => {
      const response = JSON.stringify({
        components: [
          {
            type: 'gallery',
            content: '',
            images: ['https://example.com/1.jpg'],
          },
        ],
      });

      const components = parseAIResponse(response);
      expect(components[0].style?.galleryColumns).toBe(3);
      expect(components[0].style?.galleryGap).toBe('16px');
    });

    it('should return empty array for invalid JSON', () => {
      const response = 'not valid json';
      const components = parseAIResponse(response);
      expect(components).toEqual([]);
    });

    it('should return empty array for missing components array', () => {
      const response = JSON.stringify({ data: 'no components' });
      const components = parseAIResponse(response);
      expect(components).toEqual([]);
    });

    it('should generate unique IDs for each component', () => {
      const response = JSON.stringify({
        components: [
          { type: 'heading', content: 'Title 1' },
          { type: 'heading', content: 'Title 2' },
          { type: 'heading', content: 'Title 3' },
        ],
      });

      const components = parseAIResponse(response);
      const ids = components.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should preserve button actions', () => {
      const response = JSON.stringify({
        components: [
          {
            type: 'button',
            content: 'Click Me',
            action: {
              type: 'confetti',
            },
          },
        ],
      });

      const components = parseAIResponse(response);
      expect(components[0].action).toBeDefined();
      expect(components[0].action?.type).toBe('confetti');
    });
  });
});

// Feature: ai-page-generator, Property 2: Component schema validity and styling
// **Validates: Requirements 3.3, 4.1, 4.2, 4.3, 4.4, 4.5**
describe('Property-Based Tests', () => {
  describe('Property 2: Component schema validity and styling', () => {
    // Arbitrary generator for valid component types
    const arbitraryComponentType = (): fc.Arbitrary<ComponentType> => {
      return fc.constantFrom(
        'text', 'paragraph', 'heading', 'html', 'image', 'button', 'divider', 'emoji', 'gallery'
      );
    };

    // Arbitrary generator for text alignment
    const arbitraryTextAlign = (): fc.Arbitrary<'left' | 'center' | 'right'> => {
      return fc.constantFrom('left', 'center', 'right');
    };

    // Arbitrary generator for button action types
    const arbitraryActionType = (): fc.Arbitrary<'none' | 'link' | 'confetti' | 'alert' | 'spookyEmojis' | 'singleEmoji'> => {
      return fc.constantFrom('none', 'link', 'confetti', 'alert', 'spookyEmojis', 'singleEmoji');
    };

    // Arbitrary generator for component style
    const arbitraryComponentStyle = () => {
      return fc.record({
        textAlign: fc.option(arbitraryTextAlign(), { nil: undefined }),
        fontSize: fc.option(fc.oneof(
          fc.constant('16px'),
          fc.constant('24px'),
          fc.constant('32px'),
          fc.constant('48px'),
          fc.constant('1rem'),
          fc.constant('2rem')
        ), { nil: undefined }),
        color: fc.option(fc.constantFrom(
          '#000000',
          '#333333',
          '#ffffff',
          '#ff0000',
          '#00ff00',
          '#0000ff'
        ), { nil: undefined }),
        backgroundColor: fc.option(fc.constantFrom(
          'transparent',
          '#ffffff',
          '#000000',
          '#f0f0f0'
        ), { nil: undefined }),
        padding: fc.option(fc.oneof(
          fc.constant('8px'),
          fc.constant('16px'),
          fc.constant('24px')
        ), { nil: undefined }),
        margin: fc.option(fc.constant('8px 0'), { nil: undefined }),
        width: fc.option(fc.oneof(
          fc.constant('100%'),
          fc.constant('50%'),
          fc.constant('300px')
        ), { nil: undefined }),
        borderRadius: fc.option(fc.oneof(
          fc.constant('0px'),
          fc.constant('8px'),
          fc.constant('16px')
        ), { nil: undefined }),
        galleryColumns: fc.option(fc.integer({ min: 1, max: 6 }), { nil: undefined }),
        galleryGap: fc.option(fc.oneof(
          fc.constant('8px'),
          fc.constant('16px'),
          fc.constant('24px')
        ), { nil: undefined }),
      });
    };

    // Arbitrary generator for button action
    const arbitraryButtonAction = () => {
      return fc.record({
        type: arbitraryActionType(),
        value: fc.option(fc.oneof(
          fc.webUrl(),
          fc.string({ minLength: 1, maxLength: 100 })
        ), { nil: undefined }),
        emoji: fc.option(fc.constantFrom('🎉', '❤️', '👍', '🔥', '✨'), { nil: undefined }),
      });
    };

    // Arbitrary generator for a raw component (before parsing)
    const arbitraryRawComponent = (): fc.Arbitrary<any> => {
      return arbitraryComponentType().chain((type) => {
        // Build component based on type
        if (type === 'button') {
          return fc.record({
            type: fc.constant(type),
            content: fc.string({ maxLength: 500 }),
            style: fc.option(arbitraryComponentStyle(), { nil: undefined }),
            action: fc.option(arbitraryButtonAction(), { nil: undefined }),
          });
        } else if (type === 'gallery') {
          return fc.record({
            type: fc.constant(type),
            content: fc.string({ maxLength: 500 }),
            style: fc.option(arbitraryComponentStyle(), { nil: undefined }),
            images: fc.option(fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }), { nil: undefined }),
          });
        } else {
          return fc.record({
            type: fc.constant(type),
            content: fc.string({ maxLength: 500 }),
            style: fc.option(arbitraryComponentStyle(), { nil: undefined }),
          });
        }
      });
    };

    // Arbitrary generator for AI response JSON
    const arbitraryAIResponse = () => {
      return fc.array(arbitraryRawComponent(), { minLength: 1, maxLength: 10 }).map(components => {
        return JSON.stringify({ components });
      });
    };

    it('should ensure all parsed components conform to PageComponent schema', () => {
      fc.assert(
        fc.property(arbitraryAIResponse(), (aiResponse) => {
          const components = parseAIResponse(aiResponse);

          // All returned components must be valid
          for (const component of components) {
            // Must have required fields
            expect(component).toHaveProperty('id');
            expect(component).toHaveProperty('type');
            expect(component).toHaveProperty('content');
            
            // ID must be a non-empty string
            expect(typeof component.id).toBe('string');
            expect(component.id.length).toBeGreaterThan(0);
            
            // Type must be valid ComponentType
            const validTypes: ComponentType[] = ['text', 'paragraph', 'heading', 'html', 'image', 'button', 'divider', 'emoji', 'gallery'];
            expect(validTypes).toContain(component.type);
            
            // Content must be a string
            expect(typeof component.content).toBe('string');
            
            // Validate component using the validation function
            expect(validateComponent(component)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure all components include appropriate default styles for their type', () => {
      fc.assert(
        fc.property(arbitraryAIResponse(), (aiResponse) => {
          const components = parseAIResponse(aiResponse);

          for (const component of components) {
            // All components must have a style object
            expect(component.style).toBeDefined();
            expect(typeof component.style).toBe('object');
            
            // Check for required style properties
            expect(component.style).toHaveProperty('textAlign');
            expect(component.style).toHaveProperty('fontSize');
            expect(component.style).toHaveProperty('color');
            expect(component.style).toHaveProperty('backgroundColor');
            expect(component.style).toHaveProperty('padding');
            expect(component.style).toHaveProperty('width');
            expect(component.style).toHaveProperty('borderRadius');
            
            // Validate textAlign values
            if (component.style?.textAlign) {
              expect(['left', 'center', 'right']).toContain(component.style.textAlign);
            }
            
            // Validate fontSize is a string
            expect(typeof component.style?.fontSize).toBe('string');
            
            // Validate color is a string
            expect(typeof component.style?.color).toBe('string');
            
            // Validate backgroundColor is a string
            expect(typeof component.style?.backgroundColor).toBe('string');
            
            // Type-specific style validation
            // Font size must be a non-empty string
            expect(component.style?.fontSize).toBeTruthy();
            expect(component.style?.fontSize?.length).toBeGreaterThan(0);
            
            if (component.type === 'gallery') {
              // Gallery components must have gallery-specific styles
              expect(component.style).toHaveProperty('galleryColumns');
              expect(component.style).toHaveProperty('galleryGap');
              expect(typeof component.style?.galleryColumns).toBe('number');
              expect(typeof component.style?.galleryGap).toBe('string');
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure button components have valid action structures', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constant('button' as ComponentType),
              content: fc.string({ minLength: 1, maxLength: 100 }),
              action: fc.option(arbitraryButtonAction(), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ).map(components => JSON.stringify({ components })),
          (aiResponse) => {
            const components = parseAIResponse(aiResponse);

            for (const component of components) {
              if (component.type === 'button' && component.action) {
                // Action must have a type field
                expect(component.action).toHaveProperty('type');
                
                // Action type must be valid
                const validActionTypes = ['none', 'link', 'confetti', 'alert', 'spookyEmojis', 'singleEmoji'];
                expect(validActionTypes).toContain(component.action.type);
                
                // If action type is link, value should be present
                if (component.action.type === 'link' && component.action.value) {
                  expect(typeof component.action.value).toBe('string');
                }
                
                // If action type is singleEmoji, emoji should be present
                if (component.action.type === 'singleEmoji' && component.action.emoji) {
                  expect(typeof component.action.emoji).toBe('string');
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure gallery components have valid image arrays', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constant('gallery' as ComponentType),
              content: fc.constant(''),
              images: fc.option(fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }), { nil: undefined }),
            }),
            { minLength: 1, maxLength: 5 }
          ).map(components => JSON.stringify({ components })),
          (aiResponse) => {
            const components = parseAIResponse(aiResponse);

            for (const component of components) {
              if (component.type === 'gallery' && component.images) {
                // Images must be an array
                expect(Array.isArray(component.images)).toBe(true);
                
                // All images must be strings
                for (const img of component.images) {
                  expect(typeof img).toBe('string');
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure HTML content is sanitized', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constant('html' as ComponentType),
              content: fc.oneof(
                fc.constant('<div>Safe content</div>'),
                fc.constant('<script>alert("xss")</script><div>Content</div>'),
                fc.constant('<button onclick="alert(\'xss\')">Click</button>'),
                fc.constant('<img src="x" onerror="alert(\'xss\')">'),
                fc.constant('<a href="javascript:alert(\'xss\')">Link</a>')
              ),
            }),
            { minLength: 1, maxLength: 5 }
          ).map(components => JSON.stringify({ components })),
          (aiResponse) => {
            const components = parseAIResponse(aiResponse);

            for (const component of components) {
              if (component.type === 'html') {
                // Content must not contain script tags
                expect(component.content).not.toContain('<script>');
                
                // Content must not contain event handlers
                expect(component.content).not.toMatch(/on\w+\s*=/i);
                
                // Content must not contain javascript: URLs
                expect(component.content).not.toContain('javascript:');
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate unique IDs for all components', () => {
      fc.assert(
        fc.property(arbitraryAIResponse(), (aiResponse) => {
          const components = parseAIResponse(aiResponse);

          if (components.length > 1) {
            const ids = components.map(c => c.id);
            const uniqueIds = new Set(ids);
            
            // All IDs must be unique
            expect(uniqueIds.size).toBe(components.length);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should apply appropriate default styles when styles are not provided', () => {
      fc.assert(
        fc.property(
          fc.array(
            arbitraryComponentType().chain(type => 
              fc.record({
                type: fc.constant(type),
                content: fc.string({ maxLength: 100 }),
                // No style provided
              })
            ),
            { minLength: 1, maxLength: 5 }
          ).map(components => JSON.stringify({ components })),
          (aiResponse) => {
            const components = parseAIResponse(aiResponse);

            for (const component of components) {
              // Should have default styles applied
              expect(component.style).toBeDefined();
              
              // Check type-specific defaults
              if (component.type === 'heading') {
                expect(component.style?.fontSize).toBe('32px');
              } else if (component.type === 'text' || component.type === 'paragraph' || component.type === 'button') {
                expect(component.style?.fontSize).toBe('16px');
              }
              
              // Check common defaults
              expect(component.style?.textAlign).toBe('left');
              expect(component.style?.color).toBe('#000000');
              expect(component.style?.backgroundColor).toBe('transparent');
              expect(component.style?.padding).toBe('8px');
              expect(component.style?.width).toBe('100%');
              expect(component.style?.borderRadius).toBe('0px');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve custom styles when provided', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              type: fc.constantFrom('text' as ComponentType, 'paragraph' as ComponentType),
              content: fc.string({ maxLength: 100 }),
              style: fc.record({
                fontSize: fc.constant('48px'),
                color: fc.constant('#ff0000'),
                textAlign: fc.constant('center' as const),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ).map(components => JSON.stringify({ components })),
          (aiResponse) => {
            const components = parseAIResponse(aiResponse);

            for (const component of components) {
              // Custom styles should be preserved
              expect(component.style?.fontSize).toBe('48px');
              expect(component.style?.color).toBe('#ff0000');
              expect(component.style?.textAlign).toBe('center');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: ai-page-generator, Property 3: Empty prompt rejection
  // **Validates: Requirements 2.3**
  describe('Property 3: Empty prompt rejection', () => {
    it('should reject any whitespace-only or empty string prompt', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => {
            // Generate strings that are empty or contain only whitespace
            return s.trim().length === 0;
          }),
          (emptyPrompt) => {
            // Empty or whitespace-only prompts should be rejected
            const result = validatePrompt(emptyPrompt);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept any non-empty prompt after trimming', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => {
            // Generate strings that have at least one non-whitespace character
            return s.trim().length > 0;
          }),
          (validPrompt) => {
            // Non-empty prompts should be accepted
            const result = validatePrompt(validPrompt);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null and undefined inputs', () => {
      expect(validatePrompt(null as any)).toBe(false);
      expect(validatePrompt(undefined as any)).toBe(false);
    });

    it('should reject non-string inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.boolean(),
            fc.object(),
            fc.array(fc.anything())
          ),
          (nonStringInput) => {
            const result = validatePrompt(nonStringInput as any);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle various whitespace characters consistently', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0', '\u2000', '\u2001', '\u2002', '\u2003'),
            { minLength: 1, maxLength: 20 }
          ),
          (whitespaceChars) => {
            const whitespaceString = whitespaceChars.join('');
            const result = validatePrompt(whitespaceString);
            // All whitespace strings should be rejected
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept prompts with leading/trailing whitespace if they contain content', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string().filter(s => /^\s*$/.test(s)), // leading whitespace
            fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // actual content
            fc.string().filter(s => /^\s*$/.test(s))  // trailing whitespace
          ),
          ([leading, content, trailing]) => {
            const promptWithWhitespace = leading + content + trailing;
            const result = validatePrompt(promptWithWhitespace);
            // Should accept because there's actual content after trimming
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
