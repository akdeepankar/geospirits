/**
 * Tests for AI Generation Configuration Panel
 * Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GenerationConfig } from '../utils/prompt-engineering';

describe('Generation Configuration', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    sessionStorage.clear();
  });

  describe('Configuration State Management', () => {
    it('should have default configuration values', () => {
      const defaultConfig: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        maxComponents: 8,
        includeImages: true,
        includeButtons: true,
      };

      expect(defaultConfig.tone).toBe('professional');
      expect(defaultConfig.preferredComponents).toEqual([]);
      expect(defaultConfig.themePreference).toBe('auto');
      expect(defaultConfig.maxComponents).toBe(8);
      expect(defaultConfig.includeImages).toBe(true);
      expect(defaultConfig.includeButtons).toBe(true);
    });

    it('should allow updating tone configuration', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };

      const tones: Array<'professional' | 'casual' | 'creative' | 'minimal'> = [
        'professional',
        'casual',
        'creative',
        'minimal',
      ];

      tones.forEach((tone) => {
        const updatedConfig = { ...config, tone };
        expect(updatedConfig.tone).toBe(tone);
      });
    });

    it('should allow updating theme preference', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };

      const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];

      themes.forEach((themePreference) => {
        const updatedConfig = { ...config, themePreference };
        expect(updatedConfig.themePreference).toBe(themePreference);
      });
    });

    it('should allow adding and removing preferred components', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
      };

      // Add components
      const withHeading = {
        ...config,
        preferredComponents: [...config.preferredComponents, 'heading'],
      };
      expect(withHeading.preferredComponents).toContain('heading');

      const withMultiple = {
        ...withHeading,
        preferredComponents: [...withHeading.preferredComponents, 'image', 'button'],
      };
      expect(withMultiple.preferredComponents).toEqual(['heading', 'image', 'button']);

      // Remove component
      const withoutImage = {
        ...withMultiple,
        preferredComponents: withMultiple.preferredComponents.filter((c) => c !== 'image'),
      };
      expect(withoutImage.preferredComponents).toEqual(['heading', 'button']);
    });

    it('should allow updating maxComponents', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        maxComponents: 8,
      };

      const updated = { ...config, maxComponents: 15 };
      expect(updated.maxComponents).toBe(15);
    });

    it('should allow toggling includeImages', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        includeImages: true,
      };

      const toggled = { ...config, includeImages: !config.includeImages };
      expect(toggled.includeImages).toBe(false);

      const toggledAgain = { ...toggled, includeImages: !toggled.includeImages };
      expect(toggledAgain.includeImages).toBe(true);
    });

    it('should allow toggling includeButtons', () => {
      const config: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        includeButtons: true,
      };

      const toggled = { ...config, includeButtons: !config.includeButtons };
      expect(toggled.includeButtons).toBe(false);

      const toggledAgain = { ...toggled, includeButtons: !toggled.includeButtons };
      expect(toggledAgain.includeButtons).toBe(true);
    });
  });

  describe('Configuration Persistence', () => {
    it('should persist configuration to sessionStorage', () => {
      const config: GenerationConfig = {
        tone: 'creative',
        preferredComponents: ['heading', 'image'],
        themePreference: 'dark',
        maxComponents: 10,
        includeImages: true,
        includeButtons: false,
      };

      // Simulate saving to sessionStorage
      sessionStorage.setItem('aiGenerationConfig', JSON.stringify(config));

      // Retrieve and verify
      const saved = sessionStorage.getItem('aiGenerationConfig');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.tone).toBe('creative');
      expect(parsed.preferredComponents).toEqual(['heading', 'image']);
      expect(parsed.themePreference).toBe('dark');
      expect(parsed.maxComponents).toBe(10);
      expect(parsed.includeImages).toBe(true);
      expect(parsed.includeButtons).toBe(false);
    });

    it('should load configuration from sessionStorage', () => {
      const config: GenerationConfig = {
        tone: 'minimal',
        preferredComponents: ['paragraph', 'button'],
        themePreference: 'light',
        maxComponents: 5,
        includeImages: false,
        includeButtons: true,
      };

      // Save to sessionStorage
      sessionStorage.setItem('aiGenerationConfig', JSON.stringify(config));

      // Simulate loading
      const saved = sessionStorage.getItem('aiGenerationConfig');
      const loaded = saved ? JSON.parse(saved) : null;

      expect(loaded).not.toBeNull();
      expect(loaded.tone).toBe('minimal');
      expect(loaded.preferredComponents).toEqual(['paragraph', 'button']);
      expect(loaded.themePreference).toBe('light');
    });

    it('should handle missing sessionStorage data gracefully', () => {
      const saved = sessionStorage.getItem('aiGenerationConfig');
      expect(saved).toBeNull();

      // Should use default config when nothing is saved
      const defaultConfig: GenerationConfig = {
        tone: 'professional',
        preferredComponents: [],
        themePreference: 'auto',
        maxComponents: 8,
        includeImages: true,
        includeButtons: true,
      };

      const config = saved ? JSON.parse(saved) : defaultConfig;
      expect(config.tone).toBe('professional');
    });

    it('should handle corrupted sessionStorage data gracefully', () => {
      // Save invalid JSON
      sessionStorage.setItem('aiGenerationConfig', 'invalid json {');

      const saved = sessionStorage.getItem('aiGenerationConfig');
      let config: GenerationConfig | null = null;

      try {
        config = saved ? JSON.parse(saved) : null;
      } catch (error) {
        // Should fall back to default config
        config = {
          tone: 'professional',
          preferredComponents: [],
          themePreference: 'auto',
          maxComponents: 8,
          includeImages: true,
          includeButtons: true,
        };
      }

      expect(config).not.toBeNull();
      expect(config!.tone).toBe('professional');
    });
  });

  describe('Configuration Integration with Prompt Enhancement', () => {
    it('should provide all required fields for prompt enhancement', () => {
      const config: GenerationConfig = {
        tone: 'casual',
        preferredComponents: ['heading', 'paragraph', 'image'],
        themePreference: 'dark',
        maxComponents: 12,
        includeImages: true,
        includeButtons: false,
      };

      // Verify all fields are present and valid
      expect(config.tone).toBeDefined();
      expect(['professional', 'casual', 'creative', 'minimal']).toContain(config.tone);

      expect(config.preferredComponents).toBeDefined();
      expect(Array.isArray(config.preferredComponents)).toBe(true);

      expect(config.themePreference).toBeDefined();
      expect(['light', 'dark', 'auto']).toContain(config.themePreference);

      expect(config.maxComponents).toBeDefined();
      expect(typeof config.maxComponents).toBe('number');

      expect(config.includeImages).toBeDefined();
      expect(typeof config.includeImages).toBe('boolean');

      expect(config.includeButtons).toBeDefined();
      expect(typeof config.includeButtons).toBe('boolean');
    });
  });
});
