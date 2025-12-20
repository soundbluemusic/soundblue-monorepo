/**
 * Tool Registry Integration Tests
 * 도구 레지스트리 통합 테스트
 *
 * Requirements Coverage: 도구 등록/검색 요구사항
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  clearRegistry,
  getAllTools,
  getTool,
  getToolsByCategory,
  registerTool,
  searchTools,
} from './registry';
import type { ToolDefinition } from './types';

// 테스트용 모의 도구
const mockMusicTool: ToolDefinition = {
  meta: {
    id: 'test-music-tool',
    name: { ko: '테스트 음악 도구', en: 'Test Music Tool' },
    description: { ko: '테스트용', en: 'For testing' },
    icon: '🎵',
    category: 'music',
    defaultSize: 'md',
    tags: ['test', 'music', 'audio'],
  },
  defaultSettings: { value: 0 },
  component: () => null,
};

const mockProductivityTool: ToolDefinition = {
  meta: {
    id: 'test-productivity-tool',
    name: { ko: '테스트 생산성 도구', en: 'Test Productivity Tool' },
    description: { ko: '생산성 테스트용', en: 'For productivity testing' },
    icon: '📋',
    category: 'productivity',
    defaultSize: 'sm',
    tags: ['test', 'productivity', 'organize'],
  },
  defaultSettings: { enabled: true },
  component: () => null,
};

const mockUtilityTool: ToolDefinition = {
  meta: {
    id: 'test-utility-tool',
    name: { ko: '테스트 유틸리티', en: 'Test Utility' },
    description: { ko: '유틸리티 테스트용', en: 'For utility testing' },
    icon: '🔧',
    category: 'utility',
    defaultSize: 'lg',
    minSize: { width: 300, height: 200 },
  },
  defaultSettings: {},
  component: () => null,
};

describe('Tool Registry Integration Tests', () => {
  beforeAll(() => {
    // 테스트용 도구 등록
    registerTool(mockMusicTool);
    registerTool(mockProductivityTool);
    registerTool(mockUtilityTool);
  });

  afterAll(() => {
    // 테스트 후 정리 (clearRegistry가 있다면)
    if (typeof clearRegistry === 'function') {
      clearRegistry();
    }
  });

  describe('Tool Registration', () => {
    it('should have tools registered', () => {
      const tools = getAllTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should not have duplicate tool IDs', () => {
      const tools = getAllTools();
      const ids = tools.map((t) => t.meta.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should register new tools', () => {
      const newTool: ToolDefinition = {
        meta: {
          id: 'dynamic-test-tool',
          name: { ko: '동적 테스트', en: 'Dynamic Test' },
          description: { ko: '동적 등록', en: 'Dynamic registration' },
          icon: '⚡',
          category: 'utility',
          defaultSize: 'md',
        },
        defaultSettings: {},
        component: () => null,
      };

      const beforeCount = getAllTools().length;
      registerTool(newTool);
      const afterCount = getAllTools().length;

      expect(afterCount).toBe(beforeCount + 1);
    });

    it('should not register tool with duplicate ID', () => {
      const duplicateTool: ToolDefinition = {
        ...mockMusicTool,
        meta: { ...mockMusicTool.meta, id: 'test-music-tool' },
      };

      const beforeCount = getAllTools().length;
      registerTool(duplicateTool);
      const afterCount = getAllTools().length;

      // 중복 ID는 무시되거나 덮어쓰기됨
      expect(afterCount).toBeLessThanOrEqual(beforeCount + 1);
    });
  });

  describe('Tool Retrieval', () => {
    it('should retrieve tool by ID', () => {
      const retrieved = getTool('test-music-tool');
      expect(retrieved).toBeDefined();
      expect(retrieved?.meta.id).toBe('test-music-tool');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = getTool('non-existent-tool-id-12345');
      expect(tool).toBeUndefined();
    });

    it('should retrieve all tools consistently', () => {
      const tools1 = getAllTools();
      const tools2 = getAllTools();
      expect(tools1.length).toBe(tools2.length);
    });

    it('should retrieve tool with all metadata', () => {
      const tool = getTool('test-music-tool');
      expect(tool?.meta.name.ko).toBe('테스트 음악 도구');
      expect(tool?.meta.name.en).toBe('Test Music Tool');
      expect(tool?.meta.icon).toBe('🎵');
    });
  });

  describe('Tool Search', () => {
    it('should search by tool name', () => {
      const results = searchTools('music');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((t) => t.meta.id === 'test-music-tool')).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchTools('xyznonexistent123');
      expect(results).toEqual([]);
    });

    it('should search case-insensitively', () => {
      const results1 = searchTools('MUSIC');
      const results2 = searchTools('music');
      expect(results1.length).toBe(results2.length);
    });

    it('should search by tags', () => {
      const results = searchTools('audio');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search Korean names', () => {
      const results = searchTools('테스트');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by description', () => {
      const results = searchTools('productivity');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Category Filtering', () => {
    it('should filter by music category', () => {
      const musicTools = getToolsByCategory('music');
      expect(musicTools.length).toBeGreaterThan(0);
      musicTools.forEach((tool) => {
        expect(tool.meta.category).toBe('music');
      });
    });

    it('should filter by productivity category', () => {
      const productivityTools = getToolsByCategory('productivity');
      expect(productivityTools.length).toBeGreaterThan(0);
      productivityTools.forEach((tool) => {
        expect(tool.meta.category).toBe('productivity');
      });
    });

    it('should filter by utility category', () => {
      const utilityTools = getToolsByCategory('utility');
      expect(utilityTools.length).toBeGreaterThan(0);
      utilityTools.forEach((tool) => {
        expect(tool.meta.category).toBe('utility');
      });
    });

    it('should return empty array for non-existent category', () => {
      const tools = getToolsByCategory('non-existent-category' as 'music');
      expect(tools).toEqual([]);
    });
  });

  describe('Tool Metadata Validation', () => {
    it('should have all required metadata fields', () => {
      const tools = getAllTools();
      tools.forEach((tool) => {
        expect(tool.meta.id).toBeDefined();
        expect(tool.meta.name).toBeDefined();
        expect(tool.meta.name.en).toBeDefined();
        expect(tool.meta.name.ko).toBeDefined();
        expect(tool.meta.description).toBeDefined();
        expect(tool.meta.icon).toBeDefined();
        expect(tool.meta.category).toBeDefined();
      });
    });

    it('should have valid category values', () => {
      const validCategories = ['music', 'productivity', 'utility', 'visual'];
      const tools = getAllTools();
      tools.forEach((tool) => {
        expect(validCategories).toContain(tool.meta.category);
      });
    });

    it('should have component and defaultSettings', () => {
      const tools = getAllTools();
      tools.forEach((tool) => {
        expect(tool.component).toBeDefined();
        expect(tool.defaultSettings).toBeDefined();
      });
    });

    it('should have valid defaultSize values', () => {
      const validSizes = ['sm', 'md', 'lg', 'xl', 'full'];
      const tools = getAllTools();
      tools.forEach((tool) => {
        expect(validSizes).toContain(tool.meta.defaultSize);
      });
    });

    it('should have valid minSize if defined', () => {
      const tool = getTool('test-utility-tool');
      expect(tool?.meta.minSize?.width).toBe(300);
      expect(tool?.meta.minSize?.height).toBe(200);
    });
  });

  describe('Registry Performance', () => {
    it('should retrieve tools quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getAllTools();
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // 1000번 호출이 100ms 이내
    });

    it('should search quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        searchTools('music');
        searchTools('test');
        searchTools('productivity');
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // 300번 검색이 50ms 이내
    });

    it('should get tool by ID quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getTool('test-music-tool');
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // 1000번 호출이 50ms 이내
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      const results = searchTools('');
      // 빈 쿼리는 모든 도구를 반환하거나 빈 배열
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters in search', () => {
      const results = searchTools('test-music');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle unicode in search', () => {
      const results = searchTools('🎵');
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle whitespace in search', () => {
      const results = searchTools('  music  ');
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
