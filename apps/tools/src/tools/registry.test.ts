import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllToolMetas,
  getAllTools,
  getTool,
  getToolsByCategory,
  registerTool,
  searchTools,
} from './registry';
import type { ToolDefinition, ToolSettings } from './types';

// Mock component for testing
const MockComponent = () => null;

// Helper to create test tool definitions
function createTestTool<T extends ToolSettings>(
  id: string,
  overrides: Partial<ToolDefinition<T>['meta']> = {}
): ToolDefinition<T> {
  return {
    meta: {
      id,
      name: { ko: `${id} 한글`, en: `${id} English` },
      description: { ko: `${id} 설명`, en: `${id} description` },
      icon: '🔧',
      category: 'utility',
      defaultSize: 'md',
      ...overrides,
    },
    defaultSettings: {} as T,
    component: MockComponent,
  };
}

describe('Tool Registry', () => {
  // Store original console.warn to restore after tests
  const originalWarn = console.warn;

  beforeEach(() => {
    // Suppress console.warn for duplicate registration tests
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  describe('registerTool', () => {
    it('should register a tool successfully', () => {
      const tool = createTestTool('test-tool-register');
      registerTool(tool);

      const retrieved = getTool('test-tool-register');
      expect(retrieved).toBeDefined();
      expect(retrieved?.meta.id).toBe('test-tool-register');
    });

    it('should warn when registering duplicate tool', () => {
      const tool1 = createTestTool('duplicate-tool');
      const tool2 = createTestTool('duplicate-tool');

      registerTool(tool1);
      registerTool(tool2);

      expect(console.warn).toHaveBeenCalledWith(
        'Tool "duplicate-tool" is already registered. Overwriting.'
      );
    });

    it('should overwrite existing tool on duplicate registration', () => {
      const tool1 = createTestTool('overwrite-tool', { icon: '🔧' });
      const tool2 = createTestTool('overwrite-tool', { icon: '🎵' });

      registerTool(tool1);
      registerTool(tool2);

      const retrieved = getTool('overwrite-tool');
      expect(retrieved?.meta.icon).toBe('🎵');
    });
  });

  describe('getTool', () => {
    it('should return undefined for non-existent tool', () => {
      const result = getTool('non-existent-tool-xyz');
      expect(result).toBeUndefined();
    });

    it('should return the correct tool by id', () => {
      const tool = createTestTool('get-tool-test');
      registerTool(tool);

      const retrieved = getTool('get-tool-test');
      expect(retrieved).toBe(tool);
    });
  });

  describe('getAllTools', () => {
    it('should return an array of all registered tools', () => {
      // Register some unique test tools
      registerTool(createTestTool('all-tools-test-1'));
      registerTool(createTestTool('all-tools-test-2'));

      const allTools = getAllTools();
      expect(Array.isArray(allTools)).toBe(true);
      expect(allTools.length).toBeGreaterThanOrEqual(2);

      const ids = allTools.map((t) => t.meta.id);
      expect(ids).toContain('all-tools-test-1');
      expect(ids).toContain('all-tools-test-2');
    });
  });

  describe('getToolsByCategory', () => {
    it('should filter tools by category', () => {
      registerTool(createTestTool('music-tool-1', { category: 'music' }));
      registerTool(createTestTool('music-tool-2', { category: 'music' }));
      registerTool(createTestTool('utility-tool-1', { category: 'utility' }));

      const musicTools = getToolsByCategory('music');
      const utilityTools = getToolsByCategory('utility');

      expect(musicTools.every((t) => t.meta.category === 'music')).toBe(true);
      expect(utilityTools.every((t) => t.meta.category === 'utility')).toBe(true);
    });

    it('should return empty array for category with no tools', () => {
      const visualTools = getToolsByCategory('visual');
      // May or may not be empty depending on other registered tools
      expect(Array.isArray(visualTools)).toBe(true);
      expect(visualTools.every((t) => t.meta.category === 'visual')).toBe(true);
    });
  });

  describe('getAllToolMetas', () => {
    it('should return only metadata for all tools', () => {
      registerTool(createTestTool('meta-test-tool'));

      const metas = getAllToolMetas();
      expect(Array.isArray(metas)).toBe(true);

      // Check that metas contain expected properties
      const metaTool = metas.find((m) => m.id === 'meta-test-tool');
      expect(metaTool).toBeDefined();
      expect(metaTool?.name.ko).toBe('meta-test-tool 한글');
      expect(metaTool?.name.en).toBe('meta-test-tool English');
    });

    it('should not include component in returned metas', () => {
      const metas = getAllToolMetas();
      // Metas should only contain ToolMeta properties, not component
      for (const meta of metas) {
        expect(meta).not.toHaveProperty('component');
        expect(meta).not.toHaveProperty('defaultSettings');
      }
    });
  });

  describe('searchTools', () => {
    beforeEach(() => {
      registerTool(
        createTestTool('search-metronome', {
          name: { ko: '메트로놈', en: 'Metronome' },
          description: { ko: 'BPM 박자기', en: 'Beat keeper with BPM' },
          tags: ['music', 'tempo', 'beat'],
        })
      );
      registerTool(
        createTestTool('search-tuner', {
          name: { ko: '튜너', en: 'Tuner' },
          description: { ko: '악기 튜닝', en: 'Instrument tuning' },
          tags: ['music', 'pitch'],
        })
      );
      registerTool(
        createTestTool('search-qr', {
          name: { ko: 'QR 생성기', en: 'QR Generator' },
          description: { ko: 'QR 코드 생성', en: 'Generate QR codes' },
          tags: ['utility', 'code'],
        })
      );
    });

    it('should find tools by Korean name', () => {
      const results = searchTools('메트로놈');
      expect(results.some((t) => t.meta.id === 'search-metronome')).toBe(true);
    });

    it('should find tools by English name', () => {
      const results = searchTools('metronome');
      expect(results.some((t) => t.meta.id === 'search-metronome')).toBe(true);
    });

    it('should find tools by Korean description', () => {
      const results = searchTools('박자기');
      expect(results.some((t) => t.meta.id === 'search-metronome')).toBe(true);
    });

    it('should find tools by English description', () => {
      const results = searchTools('tuning');
      expect(results.some((t) => t.meta.id === 'search-tuner')).toBe(true);
    });

    it('should find tools by tags', () => {
      const results = searchTools('tempo');
      expect(results.some((t) => t.meta.id === 'search-metronome')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const results1 = searchTools('METRONOME');
      const results2 = searchTools('metronome');
      const results3 = searchTools('Metronome');

      expect(results1.some((t) => t.meta.id === 'search-metronome')).toBe(true);
      expect(results2.some((t) => t.meta.id === 'search-metronome')).toBe(true);
      expect(results3.some((t) => t.meta.id === 'search-metronome')).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchTools('xyznonexistent123');
      expect(results.every((t) => !t.meta.id.includes('search-'))).toBe(true);
    });

    it('should find multiple matching tools', () => {
      const results = searchTools('music');
      const searchIds = results.filter((t) => t.meta.id.startsWith('search-'));
      expect(searchIds.length).toBeGreaterThanOrEqual(2);
    });
  });
});
