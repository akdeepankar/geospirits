# Design Document

## Overview

The AI Page Generator feature extends the existing PageBuilder component with an intelligent generation mode powered by OpenAI's GPT models. Users can describe their desired page in natural language, and the system will automatically generate appropriate components with styling, content, and actions. This feature maintains full compatibility with existing PageBuilder functionality, allowing users to seamlessly switch between AI-assisted and manual editing modes.

The design follows a client-side architecture where the OpenAI API is called directly from the browser using a user-provided API key. This approach avoids server-side API key management and keeps costs transparent to users. Generated components conform to the existing PageComponent schema, ensuring compatibility with all current features including themes, animations, drag-and-drop, and publishing.

## Architecture

### Component Structure

The AI generation feature will be implemented as an extension to the existing PageBuilder component:

```
PageBuilder (existing)
├── AI Mode UI Layer (new)
│   ├── AI Mode Toggle
│   ├── Prompt Input Interface
│   ├── Configuration Panel
│   └── Generation Status Display
├── AI Service Layer (new)
│   ├── OpenAI API Client
│   ├── Prompt Engineering Module
│   ├── Response Parser
│   └── Component Validator
└── Existing PageBuilder Features
    ├── Component Management
    ├── Style Editor
    ├── Preview Mode
    └── Publishing
```

### Data Flow

1. **User Input**: User enters prompt in AI mode interface
2. **Prompt Enhancement**: System adds context about available components and styling options
3. **API Request**: Enhanced prompt sent to OpenAI API with structured output instructions
4. **Response Processing**: AI response parsed into PageComponent objects
5. **Validation**: Components validated against schema
6. **Integration**: Valid components added to existing page state
7. **User Refinement**: User can edit, regenerate, or manually adjust components

### Technology Stack

- **Frontend**: React 19.2.0 with TypeScript
- **AI Service**: OpenAI API (GPT-4 or GPT-3.5-turbo)
- **State Management**: React useState hooks (existing pattern)
- **Styling**: CSS Modules (existing pattern)
- **HTTP Client**: Native fetch API

## Components and Interfaces

### 1. AI Mode UI Components

#### AIModeTog gle Component
```typescript
interface AIModeToggleProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}
```

Displays a prominent button in the toolbar to activate/deactivate AI mode.

#### PromptInput Component
```typescript
interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  characterLimit: number;
}
```

Provides a textarea for prompt input with character count, example prompts, and submit button.

#### GenerationConfig Component
```typescript
interface GenerationConfigProps {
  tone: 'professional' | 'casual' | 'creative' | 'minimal';
  preferredComponents: ComponentType[];
  themePreference: 'light' | 'dark' | 'auto';
  onConfigChange: (config: GenerationConfig) => void;
}
```

Allows users to configure generation parameters.

#### GenerationStatus Component
```typescript
interface GenerationStatusProps {
  status: 'idle' | 'generating' | 'success' | 'error';
  message?: string;
  tokensUsed?: number;
  estimatedCost?: number;
}
```

Displays generation progress, results, and usage statistics.

### 2. AI Service Layer

#### OpenAI Client
```typescript
interface OpenAIClient {
  generateComponents(
    prompt: string,
    config: GenerationConfig,
    apiKey: string
  ): Promise<GenerationResult>;
  
  validateApiKey(apiKey: string): Promise<boolean>;
  
  estimateTokens(prompt: string): number;
}

interface GenerationResult {
  components: PageComponent[];
  tokensUsed: number;
  error?: string;
}
```

Handles all communication with OpenAI API.

#### Prompt Engineer
```typescript
interface PromptEngineer {
  buildSystemPrompt(): string;
  enhanceUserPrompt(
    userPrompt: string,
    config: GenerationConfig,
    existingComponents: PageComponent[]
  ): string;
}
```

Constructs optimized prompts for the AI model with context about available components and styling options.

#### Response Parser
```typescript
interface ResponseParser {
  parseAIResponse(response: string): PageComponent[];
  validateComponent(component: any): component is PageComponent;
  sanitizeContent(content: string): string;
}
```

Converts AI responses into valid PageComponent objects.

### 3. State Management

New state variables to add to PageBuilder:

```typescript
const [aiModeActive, setAiModeActive] = useState(false);
const [aiPrompt, setAiPrompt] = useState('');
const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
  tone: 'professional',
  preferredComponents: [],
  themePreference: 'auto',
});
const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
  status: 'idle',
});
const [openaiApiKey, setOpenaiApiKey] = useState('');
const [showApiKeyModal, setShowApiKeyModal] = useState(false);
const [sessionTokens, setSessionTokens] = useState(0);
```

## Data Models

### GenerationConfig
```typescript
interface GenerationConfig {
  tone: 'professional' | 'casual' | 'creative' | 'minimal';
  preferredComponents: ComponentType[];
  themePreference: 'light' | 'dark' | 'auto';
  maxComponents?: number;
  includeImages?: boolean;
  includeButtons?: boolean;
}
```

### GenerationStatus
```typescript
interface GenerationStatus {
  status: 'idle' | 'generating' | 'success' | 'error';
  message?: string;
  tokensUsed?: number;
  estimatedCost?: number;
  generatedComponentIds?: string[];
}
```

### OpenAIRequest
```typescript
interface OpenAIRequest {
  model: 'gpt-4' | 'gpt-3.5-turbo';
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature: number;
  response_format?: {
    type: 'json_object';
  };
}
```

### OpenAIResponse
```typescript
interface OpenAIResponse {
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
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Mode preservation
*For any* PageBuilder state including components, theme, and configuration, when toggling AI mode on and off multiple times, the entire page state should remain unchanged without data loss.
**Validates: Requirements 1.4, 1.5**

### Property 2: Component schema validity and styling
*For any* AI-generated component, the component must conform to the PageComponent type schema with all required fields present and correctly typed, and must include appropriate default styles for its component type (fontSize, color, alignment for text; URLs for images; actions for buttons; image arrays and layout properties for galleries).
**Validates: Requirements 3.3, 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 3: Empty prompt rejection
*For any* whitespace-only or empty string prompt, the system should prevent submission and display a validation message without making an API call.
**Validates: Requirements 2.3**

### Property 4: API error handling
*For any* OpenAI API error response (including timeouts, invalid keys, rate limits, and network errors), the system should display a user-friendly error message and maintain the current page state without corruption.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 5: Component compatibility
*For any* generated component, the component should be fully compatible with all existing PageBuilder features including drag-and-drop reordering, manual style editing through the style panel, light/dark theme switching, page animations, and the complete publish/save/render cycle.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 6: Regeneration preservation
*For any* page with both manually-added and AI-generated components, when regenerating AI content, only the AI-generated components should be replaced while manual components remain unchanged in content, position, and styling.
**Validates: Requirements 7.4**

### Property 7: API key validation
*For any* string input as an API key, if the string does not match the OpenAI API key format (sk-...), the system should reject it before attempting any API calls.
**Validates: Requirements 9.2**

### Property 8: Token tracking accuracy
*For any* sequence of prompt submissions, the system should accurately track and display estimated token counts before generation, actual tokens used after generation, and cumulative session token usage, with estimates within 20% of actual usage.
**Validates: Requirements 10.2, 10.3, 10.4**

## Error Handling

### API Errors

1. **Invalid API Key (401)**
   - Display: "Invalid API key. Please check your OpenAI API key and try again."
   - Action: Show API key configuration modal

2. **Rate Limit Exceeded (429)**
   - Display: "Rate limit exceeded. Please wait a moment and try again."
   - Action: Disable submit button for 60 seconds

3. **Timeout**
   - Display: "Request timed out. Please try again."
   - Action: Allow immediate retry

4. **Network Error**
   - Display: "Network error. Please check your connection and try again."
   - Action: Allow immediate retry

5. **Invalid Response Format**
   - Display: "Received invalid response from AI. Please try rephrasing your prompt."
   - Action: Log error details for debugging

### Validation Errors

1. **Empty Prompt**
   - Display: "Please enter a description of your desired page."
   - Action: Focus prompt input

2. **Invalid Component Schema**
   - Display: "Some generated components were invalid and have been skipped."
   - Action: Add valid components only, log invalid ones

3. **No Components Generated**
   - Display: "No components could be generated. Please try a more specific prompt."
   - Action: Keep prompt for editing

### User Guidance

- Provide example prompts in the UI
- Show tooltip hints for configuration options
- Display real-time character count
- Show estimated cost before generation
- Provide "Learn More" links to OpenAI documentation

## Testing Strategy

### Unit Tests

The testing approach will use Vitest (already configured in the project) for unit tests and fast-check for property-based tests.

**Unit Test Coverage:**

1. **Prompt Engineering Tests**
   - Test system prompt generation includes all component types
   - Test user prompt enhancement adds appropriate context
   - Test prompt sanitization removes potentially harmful content

2. **Response Parsing Tests**
   - Test parsing valid JSON responses into PageComponent objects
   - Test handling malformed JSON responses
   - Test content sanitization for XSS prevention

3. **Component Validation Tests**
   - Test validation accepts valid PageComponent objects
   - Test validation rejects objects missing required fields
   - Test validation rejects objects with incorrect types

4. **API Key Validation Tests**
   - Test valid API key format (sk-...) is accepted
   - Test invalid formats are rejected
   - Test empty strings are rejected

5. **Token Estimation Tests**
   - Test token estimation for various prompt lengths
   - Test estimation accuracy against known examples

### Property-Based Tests

Property-based tests will use fast-check (already in package.json) to verify universal properties across many randomly generated inputs. Each test should run a minimum of 100 iterations.

**Property Test Coverage:**

1. **Mode Toggle Preservation (Property 1)**
   - Generate random PageComponent arrays
   - Toggle AI mode on and off
   - Verify components array remains identical

2. **Component Schema Validity (Property 2)**
   - Generate random AI responses
   - Parse into components
   - Verify all components match PageComponent schema

3. **Empty Prompt Rejection (Property 3)**
   - Generate random whitespace-only strings
   - Attempt submission
   - Verify no API calls made and error displayed

4. **API Error Handling (Property 4)**
   - Generate random API error responses
   - Process errors
   - Verify page state remains valid and error messages displayed

5. **Component Compatibility (Property 5)**
   - Generate random valid components
   - Test drag-and-drop, style editing, theme switching
   - Verify all operations work correctly

6. **Regeneration Preservation (Property 6)**
   - Generate random mix of manual and AI components
   - Regenerate AI components
   - Verify manual components unchanged

7. **API Key Validation (Property 7)**
   - Generate random strings
   - Validate as API keys
   - Verify only valid formats accepted

8. **Token Counting Accuracy (Property 8)**
   - Generate random prompts
   - Estimate tokens
   - Verify estimates within 20% of actual (using mock responses)

### Integration Tests

1. **End-to-End Generation Flow**
   - Enter prompt → Generate → Verify components added
   - Test with various prompt types and configurations

2. **Mode Switching**
   - Add components manually → Switch to AI mode → Generate → Switch back
   - Verify all components preserved and editable

3. **Error Recovery**
   - Trigger various errors → Verify recovery → Retry successfully

4. **Publishing Integration**
   - Generate components → Publish page → Verify page renders correctly

### Test Configuration

All property-based tests must:
- Be tagged with comments referencing the design document property
- Use the format: `// Feature: ai-page-generator, Property {number}: {property_text}`
- Run a minimum of 100 iterations
- Use fast-check library for generation

Example:
```typescript
// Feature: ai-page-generator, Property 1: Mode preservation
test('toggling AI mode preserves existing components', () => {
  fc.assert(
    fc.property(fc.array(arbitraryPageComponent()), (components) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

## Implementation Notes

### OpenAI API Integration

**Model Selection:**
- Primary: GPT-4-turbo (better quality, higher cost)
- Fallback: GPT-3.5-turbo (faster, lower cost)
- Allow user to select model in configuration

**System Prompt Structure:**
```
You are a web page component generator. Generate components for a page builder system.

Available component types:
- heading: Large title text
- text: Inline text
- paragraph: Block of text
- image: Single image with URL
- gallery: Grid of multiple images
- button: Interactive button with actions
- divider: Horizontal line separator
- html: Custom HTML content

For each component, provide:
- type: Component type from the list above
- content: The main content (text, URL, HTML)
- style: Styling properties (textAlign, fontSize, color, backgroundColor, padding, width, borderRadius)
- action: For buttons only (type: 'link' | 'confetti' | 'alert' | 'spookyEmojis' | 'singleEmoji', value, emoji)
- images: For galleries only (array of image URLs)

Return a JSON object with a "components" array.
```

**Request Configuration:**
```typescript
{
  model: 'gpt-4-turbo',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: enhancedUserPrompt }
  ],
  temperature: 0.7,
  response_format: { type: 'json_object' }
}
```

### Security Considerations

1. **API Key Storage**
   - Store in browser localStorage (encrypted if possible)
   - Never send to backend servers
   - Clear on logout or user request

2. **Content Sanitization**
   - Sanitize all AI-generated HTML content
   - Validate URLs before rendering images
   - Escape special characters in text content

3. **Rate Limiting**
   - Implement client-side rate limiting (max 10 requests per minute)
   - Track request timestamps
   - Display cooldown timer to users

4. **Cost Protection**
   - Show estimated cost before generation
   - Track cumulative session costs
   - Warn users when approaching high token counts

### User Experience

1. **Progressive Disclosure**
   - Start with simple prompt input
   - Show advanced configuration in collapsible panel
   - Provide contextual help and examples

2. **Feedback and Transparency**
   - Show loading states during generation
   - Display token usage and costs
   - Provide clear error messages with recovery actions

3. **Iteration Support**
   - Allow easy regeneration with same prompt
   - Support refinement prompts ("make it more colorful")
   - Enable selective component regeneration

4. **Seamless Integration**
   - AI mode feels like natural extension of PageBuilder
   - Generated components indistinguishable from manual ones
   - Smooth transitions between modes

### Performance Optimization

1. **Request Optimization**
   - Debounce prompt input
   - Cache API responses for identical prompts
   - Use streaming responses for faster perceived performance

2. **Component Rendering**
   - Batch component additions to minimize re-renders
   - Use React.memo for generated components
   - Optimize style calculations

3. **Token Efficiency**
   - Keep system prompts concise
   - Use efficient JSON schemas
   - Implement prompt compression for long inputs

## Future Enhancements

1. **Image Generation Integration**
   - Integrate DALL-E for custom image generation
   - Generate images based on component context

2. **Template Library**
   - Save successful prompts as templates
   - Share templates with community
   - Pre-built templates for common page types

3. **Iterative Refinement**
   - Multi-turn conversations with AI
   - Contextual follow-up prompts
   - Selective component editing via natural language

4. **Analytics and Learning**
   - Track successful prompt patterns
   - Suggest improvements to prompts
   - Learn from user edits to generated content

5. **Collaborative Features**
   - Share AI-generated pages
   - Remix and modify others' AI pages
   - Community prompt library
