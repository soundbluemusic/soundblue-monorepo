// ========================================
// Tool Registry - 도구 등록 및 관리
// ========================================

import type { ToolDefinition, ToolMeta, ToolSettings } from './types';

// 등록된 도구들을 저장하는 Map
const toolRegistry = new Map<string, ToolDefinition>();

// Cached tools array (invalidated on register)
let cachedTools: ToolDefinition[] | null = null;

/**
 * 도구 등록
 *
 * Note: We use a double cast through `unknown` because ToolDefinition<T>
 * is not directly assignable to ToolDefinition<ToolSettings> due to
 * contravariance in the component's props type. This is safe because
 * the registry stores tools generically and consumers should use the
 * appropriate type when retrieving specific tools.
 */
export function registerTool<T extends ToolSettings>(definition: ToolDefinition<T>): void {
  // Silently overwrite if already registered (expected during HMR)
  toolRegistry.set(definition.meta.id, definition as unknown as ToolDefinition);
  cachedTools = null; // Invalidate cache
}

/**
 * 도구 가져오기
 */
export function getTool(id: string): ToolDefinition | undefined {
  return toolRegistry.get(id);
}

/**
 * 모든 도구 목록 가져오기 (cached)
 */
export function getAllTools(): ToolDefinition[] {
  if (cachedTools === null) {
    cachedTools = Array.from(toolRegistry.values());
  }
  return cachedTools;
}

/**
 * 카테고리별 도구 목록 가져오기
 */
export function getToolsByCategory(category: ToolMeta['category']): ToolDefinition[] {
  return getAllTools().filter((tool) => tool.meta.category === category);
}

/**
 * 도구 메타데이터만 가져오기
 */
export function getAllToolMetas(): ToolMeta[] {
  return getAllTools().map((tool) => tool.meta);
}

/**
 * 도구 검색
 */
export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllTools().filter((tool) => {
    const { name, description, tags } = tool.meta;
    return (
      name.ko.toLowerCase().includes(lowerQuery) ||
      name.en.toLowerCase().includes(lowerQuery) ||
      description.ko.toLowerCase().includes(lowerQuery) ||
      description.en.toLowerCase().includes(lowerQuery) ||
      tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * 레지스트리 초기화 (테스트용)
 */
export function clearRegistry(): void {
  toolRegistry.clear();
  cachedTools = null;
}
