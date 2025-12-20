import type { Component } from 'solid-js';

// ========================================
// Tool Block Types & Interfaces
// ========================================

/**
 * 도구 카테고리
 */
export type ToolCategory =
  | 'music' // 음악 도구 (메트로놈, 튜너, 피아노롤 등)
  | 'utility' // 유틸리티 도구 (QR, 세계시계 등)
  | 'visual' // 비주얼 도구 (이미지, 비디오 등)
  | 'productivity'; // 생산성 도구

/**
 * 도구 크기 프리셋
 */
export type ToolSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * 도구 메타데이터
 */
export interface ToolMeta {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  description: {
    ko: string;
    en: string;
  };
  icon: string;
  category: ToolCategory;
  defaultSize: ToolSize;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  tags?: string[];
}

/**
 * Allowed primitive value types in tool settings.
 * This restricts settings to serializable, primitive-based values.
 */
export type ToolSettingPrimitive = string | number | boolean | null | undefined;

/**
 * Allowed value types in tool settings.
 * This restricts settings to serializable values using a recursive type.
 */
export type ToolSettingValue =
  | ToolSettingPrimitive
  | ToolSettingValue[]
  | { [key: string]: ToolSettingValue };

/**
 * Base constraint for tool settings.
 * Each tool should define its own specific settings interface
 * and use it with ToolDefinition<SpecificSettings>.
 *
 * Using `object` type to accept any object structure while ensuring
 * the settings is a proper object type (not primitives like string/number).
 * This allows tool-specific interfaces with nested objects without
 * requiring them to have compatible index signatures.
 */
export type ToolSettings = object;

/**
 * 워크스페이스 내 도구 인스턴스
 */
export interface ToolInstance {
  instanceId: string;
  toolId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: ToolSettings;
  isMinimized: boolean;
  zIndex: number;
}

/**
 * 워크스페이스 레이아웃
 */
export interface WorkspaceLayout {
  id: string;
  name: string;
  tools: ToolInstance[];
  createdAt: number;
  updatedAt: number;
}

/**
 * 도구 컴포넌트 Props
 */
export interface ToolProps<T extends ToolSettings = ToolSettings> {
  instanceId: string;
  settings: T;
  onSettingsChange: (settings: Partial<T>) => void;
  size: { width: number; height: number };
  isActive: boolean;
}

/**
 * 도구 정의 (SolidJS)
 */
export interface ToolDefinition<T extends ToolSettings = ToolSettings> {
  meta: ToolMeta;
  defaultSettings: T;
  component: Component<ToolProps<T>>;
  settingsPanel?: Component<{
    settings: T;
    onSettingsChange: (settings: Partial<T>) => void;
  }>;
}

/**
 * 크기 프리셋 값
 */
export const SIZE_PRESETS: Record<ToolSize, { width: number; height: number }> = {
  sm: { width: 200, height: 150 },
  md: { width: 320, height: 240 },
  lg: { width: 480, height: 360 },
  xl: { width: 640, height: 480 },
  full: { width: -1, height: -1 }, // -1 means fill available space
};
