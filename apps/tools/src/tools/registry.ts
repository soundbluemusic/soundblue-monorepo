// ========================================
// Tool Registry - 도구 등록 및 관리
// ========================================

import type { ToolDefinition, ToolMeta, ToolSettings } from './types';

// 등록된 도구들을 저장하는 Map
const toolRegistry = new Map<string, ToolDefinition>();

// Cached tools array (invalidated on register)
let cachedTools: ToolDefinition[] | null = null;

/**
 * Validate tool definition structure at runtime
 */
function isValidToolDefinition(def: unknown): def is ToolDefinition {
  if (typeof def !== 'object' || def === null) return false;
  const d = def as Record<string, unknown>;
  if (typeof d.meta !== 'object' || d.meta === null) return false;
  const meta = d.meta as Record<string, unknown>;
  return (
    typeof meta.id === 'string' &&
    typeof meta.name === 'object' &&
    typeof meta.description === 'object' &&
    typeof d.component === 'function'
  );
}

/**
 * 도구 등록
 *
 * Note: We use a type assertion because ToolDefinition<T>
 * is not directly assignable to ToolDefinition<ToolSettings> due to
 * contravariance in the component's props type. Runtime validation
 * ensures the definition is valid before storing.
 */
export function registerTool<T extends ToolSettings>(definition: ToolDefinition<T>): void {
  // Runtime validation for type safety
  if (!isValidToolDefinition(definition)) {
    throw new Error(`Invalid tool definition: ${JSON.stringify(definition)}`);
  }
  // Silently overwrite if already registered (expected during HMR)
  toolRegistry.set(definition.meta.id, definition as ToolDefinition);
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
