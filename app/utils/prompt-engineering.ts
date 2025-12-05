/**
 * Prompt Engineering Module for AI Page Generator
 * Handles system prompt generation, user prompt enhancement, and response parsing
 */

import { PageComponent, ComponentType } from '../types/pageBuilder';

export interface GenerationConfig {
  tone: 'professional' | 'casual' | 'creative' | 'minimal';
  preferredComponents: ComponentType[];
  themePreference: 'light' | 'dark' | 'auto';
  maxComponents?: number;
  includeImages?: boolean;
  includeButtons?: boolean;
}

/**
 * Validates that a user prompt is not empty or whitespace-only
 * @param prompt - The user prompt to validate
 * @returns true if the prompt is valid (non-empty after trimming)
 */
export function validatePrompt(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') {
    return false;
  }
  return prompt.trim().length > 0;
}

/**
 * Builds the system prompt that instructs the AI on how to generate components
 * @returns The complete system prompt
 */
export function buildSystemPrompt(): string {
  return `You are a web page component generator. Generate components for a page builder system.

Available component types:
- heading: Large title text (use for main titles and section headers)
- text: Inline text (use for short text snippets)
- paragraph: Block of text (use for longer content, descriptions, body text)
- image: Single image with URL (use for photos, illustrations, graphics)
- gallery: Grid of multiple images (use for photo collections, portfolios)
- button: Interactive button with actions (use for CTAs, links, interactions)
- divider: Horizontal line separator (use to separate sections)
- html: Custom HTML content (use sparingly for special formatting)

For each component, provide:
- type: Component type from the list above
- content: The main content (text for text/heading/paragraph, URL for image, button label for button, HTML for html, empty string for divider)
- style: Styling properties object with these optional fields:
  - textAlign: 'left' | 'center' | 'right'
  - fontSize: CSS size string (e.g., '16px', '2rem', '24px')
  - color: CSS color (hex, rgb, or named color)
  - backgroundColor: CSS color or 'transparent'
  - padding: CSS padding (e.g., '8px', '16px 24px')
  - width: CSS width (e.g., '100%', '50%', '300px')
  - borderRadius: CSS border radius (e.g., '0px', '8px', '50%')
  - galleryColumns: number (for gallery only, default 3)
  - galleryGap: CSS gap (for gallery only, e.g., '16px')
- action: For buttons only, object with:
  - type: 'none' | 'link' | 'confetti' | 'alert' | 'spookyEmojis' | 'singleEmoji'
  - value: URL for 'link', message for 'alert'
  - emoji: emoji character for 'singleEmoji'
- images: For galleries only, array of image URLs (strings)

Return ONLY a valid JSON object with this exact structure:
{
  "components": [
    {
      "type": "heading",
      "content": "Welcome",
      "style": {
        "textAlign": "center",
        "fontSize": "48px",
        "color": "#333333"
      }
    }
  ]
}

Important guidelines:
- Generate 3-8 components per request unless specified otherwise
- Use appropriate component types for the content
- Include realistic, descriptive content
- Apply appropriate styling for visual appeal
- For images, use placeholder URLs like "https://via.placeholder.com/600x400" or suggest descriptive URLs
- For galleries, include 3-6 images
- Make buttons actionable with appropriate action types
- Ensure all JSON is valid and properly formatted
- Do not include any text outside the JSON object`;
}

/**
 * Enhances the user prompt with context and configuration
 * @param userPrompt - The user's natural language description
 * @param config - Generation configuration options
 * @param existingComponents - Currently existing components on the page
 * @returns Enhanced prompt with context
 */
export function enhanceUserPrompt(
  userPrompt: string,
  config: GenerationConfig,
  existingComponents: PageComponent[] = []
): string {
  const parts: string[] = [];

  // Add the user's main request
  parts.push(`User request: ${userPrompt}`);

  // Add tone guidance
  const toneGuidance: Record<GenerationConfig['tone'], string> = {
    professional: 'Use professional, business-appropriate language and formal tone.',
    casual: 'Use friendly, conversational language and relaxed tone.',
    creative: 'Use imaginative, expressive language with creative flair.',
    minimal: 'Use concise, minimal language with clean, simple design.',
  };
  parts.push(`Tone: ${toneGuidance[config.tone]}`);

  // Add theme preference
  if (config.themePreference !== 'auto') {
    const themeGuidance = config.themePreference === 'dark'
      ? 'Use light text colors on dark backgrounds (e.g., #ffffff text, #1a1a1a backgrounds).'
      : 'Use dark text colors on light backgrounds (e.g., #333333 text, #ffffff backgrounds).';
    parts.push(`Theme: ${themeGuidance}`);
  }

  // Add component preferences
  if (config.preferredComponents && config.preferredComponents.length > 0) {
    parts.push(`Preferred components: ${config.preferredComponents.join(', ')}`);
  }

  // Add component limits
  if (config.maxComponents) {
    parts.push(`Maximum components: ${config.maxComponents}`);
  }

  // Add image/button preferences
  if (config.includeImages === false) {
    parts.push('Avoid using image and gallery components.');
  }
  if (config.includeButtons === false) {
    parts.push('Avoid using button components.');
  }

  // Add context about existing components
  if (existingComponents.length > 0) {
    parts.push(`Note: The page already has ${existingComponents.length} component(s). Generate components that complement the existing content.`);
  }

  return parts.join('\n\n');
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtmlContent(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Validates a component against the PageComponent schema
 * @param component - The component object to validate
 * @returns true if the component is valid
 */
export function validateComponent(component: any): component is PageComponent {
  // Check required fields
  if (!component || typeof component !== 'object') {
    return false;
  }

  if (!component.type || typeof component.type !== 'string') {
    return false;
  }

  // Validate component type
  const validTypes: ComponentType[] = ['text', 'paragraph', 'heading', 'html', 'image', 'button', 'divider', 'emoji', 'gallery'];
  if (!validTypes.includes(component.type as ComponentType)) {
    return false;
  }

  // Content must be a string
  if (component.content === undefined || typeof component.content !== 'string') {
    return false;
  }

  // Validate style if present
  if (component.style !== undefined) {
    if (typeof component.style !== 'object' || component.style === null) {
      return false;
    }

    // Validate style properties if they exist
    const style = component.style;
    if (style.textAlign !== undefined && !['left', 'center', 'right'].includes(style.textAlign)) {
      return false;
    }
    if (style.fontSize !== undefined && typeof style.fontSize !== 'string') {
      return false;
    }
    if (style.color !== undefined && typeof style.color !== 'string') {
      return false;
    }
    if (style.backgroundColor !== undefined && typeof style.backgroundColor !== 'string') {
      return false;
    }
    if (style.galleryColumns !== undefined && typeof style.galleryColumns !== 'number') {
      return false;
    }
  }

  // Validate action for buttons
  if (component.action !== undefined) {
    if (typeof component.action !== 'object' || component.action === null) {
      return false;
    }
    const validActionTypes = ['none', 'link', 'confetti', 'alert', 'spookyEmojis', 'singleEmoji'];
    if (!validActionTypes.includes(component.action.type)) {
      return false;
    }
  }

  // Validate images for gallery
  if (component.images !== undefined) {
    if (!Array.isArray(component.images)) {
      return false;
    }
    if (!component.images.every((img: any) => typeof img === 'string')) {
      return false;
    }
  }

  return true;
}

/**
 * Parses AI response JSON into PageComponent objects
 * @param responseContent - The JSON string from the AI response
 * @returns Array of valid PageComponent objects
 */
export function parseAIResponse(responseContent: string): PageComponent[] {
  try {
    // Parse JSON
    const parsed = JSON.parse(responseContent);

    // Check for components array
    if (!parsed.components || !Array.isArray(parsed.components)) {
      console.warn('AI response missing components array');
      return [];
    }

    // Validate and transform each component
    const validComponents: PageComponent[] = [];
    
    for (let i = 0; i < parsed.components.length; i++) {
      const comp = parsed.components[i];

      // Validate component structure
      if (!validateComponent(comp)) {
        console.warn(`Invalid component at index ${i}:`, comp);
        continue;
      }

      // Generate unique ID and apply default styles
      const existingStyle = comp.style || {};
      const componentWithId: PageComponent = {
        id: `ai-${comp.type}-${Date.now()}-${i}`,
        type: comp.type,
        content: comp.type === 'html' ? sanitizeHtmlContent(comp.content) : comp.content,
        style: {
          textAlign: existingStyle.textAlign || 'left',
          fontSize: existingStyle.fontSize || getDefaultFontSize(comp.type),
          color: existingStyle.color || '#000000',
          backgroundColor: existingStyle.backgroundColor || 'transparent',
          padding: existingStyle.padding || '8px',
          margin: existingStyle.margin || '8px 0',
          width: existingStyle.width || '100%',
          borderRadius: existingStyle.borderRadius || '0px',
          ...(comp.type === 'gallery' && {
            galleryColumns: existingStyle.galleryColumns || 3,
            galleryGap: existingStyle.galleryGap || '16px',
          }),
        },
        action: comp.action,
        images: comp.images,
      };

      validComponents.push(componentWithId);
    }

    return validComponents;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return [];
  }
}

/**
 * Gets default font size for a component type
 * @param type - The component type
 * @returns Default font size as CSS string
 */
function getDefaultFontSize(type: ComponentType): string {
  switch (type) {
    case 'heading':
      return '32px';
    case 'text':
      return '16px';
    case 'paragraph':
      return '16px';
    case 'button':
      return '16px';
    default:
      return '16px';
  }
}
