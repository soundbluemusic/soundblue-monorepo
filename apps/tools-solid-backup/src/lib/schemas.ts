// ========================================
// Valibot Schemas - 런타임 타입 검증
// ========================================
// 외부 데이터(IndexedDB, API, URL params)의
// 타입 안전성을 런타임에 보장합니다.

import * as v from 'valibot';
import { getPreference, setPreference } from '../engine/storage';

// ========================================
// Tool Settings Schemas
// ========================================

/**
 * 메트로놈 설정 스키마
 */
export const MetronomeSettingsSchema = v.object({
  bpm: v.pipe(v.number(), v.minValue(20), v.maxValue(300)),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  beatsPerMeasure: v.pipe(v.number(), v.minValue(1), v.maxValue(16)),
  subdivisions: v.pipe(v.number(), v.minValue(1), v.maxValue(4)),
  accentFirst: v.boolean(),
  soundType: v.picklist(['click', 'beep', 'wood', 'electronic']),
  timerMinutes: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(120))),
  syncEnabled: v.optional(v.boolean()),
});

export type MetronomeSettingsInput = v.InferInput<typeof MetronomeSettingsSchema>;
export type MetronomeSettingsOutput = v.InferOutput<typeof MetronomeSettingsSchema>;

/**
 * 드럼머신 설정 스키마
 */
export const DrumMachineSettingsSchema = v.object({
  bpm: v.pipe(v.number(), v.minValue(20), v.maxValue(300)),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  swing: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  steps: v.pipe(v.number(), v.minValue(4), v.maxValue(64)),
  syncEnabled: v.optional(v.boolean()),
  pattern: v.optional(
    v.array(
      v.object({
        name: v.string(),
        steps: v.array(v.boolean()),
      }),
    ),
  ),
});

export type DrumMachineSettingsInput = v.InferInput<typeof DrumMachineSettingsSchema>;
export type DrumMachineSettingsOutput = v.InferOutput<typeof DrumMachineSettingsSchema>;

/**
 * QR 생성기 설정 스키마
 */
export const QRSettingsSchema = v.object({
  content: v.string(),
  size: v.pipe(v.number(), v.minValue(100), v.maxValue(1000)),
  errorCorrectionLevel: v.picklist(['L', 'M', 'Q', 'H']),
  foregroundColor: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/)),
  backgroundColor: v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/)),
});

export type QRSettingsInput = v.InferInput<typeof QRSettingsSchema>;
export type QRSettingsOutput = v.InferOutput<typeof QRSettingsSchema>;

// ========================================
// Project Data Schema
// ========================================

/**
 * 프로젝트 데이터 스키마 (IndexedDB 저장용)
 */
export const ProjectDataSchema = v.object({
  name: v.optional(v.string()),
  version: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  settings: v.optional(v.record(v.string(), v.unknown())),
  data: v.optional(v.record(v.string(), v.unknown())),
});

export type ProjectDataInput = v.InferInput<typeof ProjectDataSchema>;
export type ProjectDataOutput = v.InferOutput<typeof ProjectDataSchema>;

// ========================================
// URL Parameters Schema
// ========================================

/**
 * 도구 URL 파라미터 스키마
 */
export const ToolUrlParamsSchema = v.object({
  bpm: v.optional(
    v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(20), v.maxValue(300)),
  ),
  volume: v.optional(
    v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0), v.maxValue(100)),
  ),
});

export type ToolUrlParamsInput = v.InferInput<typeof ToolUrlParamsSchema>;
export type ToolUrlParamsOutput = v.InferOutput<typeof ToolUrlParamsSchema>;

// ========================================
// User Preferences Schema
// ========================================

/**
 * 사용자 환경설정 스키마
 */
export const UserPreferencesSchema = v.object({
  theme: v.picklist(['light', 'dark', 'system']),
  locale: v.picklist(['ko', 'en']),
  sidebarCollapsed: v.boolean(),
  volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
});

export type UserPreferencesInput = v.InferInput<typeof UserPreferencesSchema>;
export type UserPreferencesOutput = v.InferOutput<typeof UserPreferencesSchema>;

// ========================================
// Validation Helpers
// ========================================

/**
 * 스키마로 데이터 검증 및 파싱
 * @throws ValiError if validation fails
 */
export function parseSchema<T extends v.GenericSchema>(schema: T, data: unknown): v.InferOutput<T> {
  return v.parse(schema, data);
}

/**
 * 스키마로 데이터 안전하게 파싱 (에러시 undefined 반환)
 */
export function safeParseSchema<T extends v.GenericSchema>(
  schema: T,
  data: unknown,
): v.InferOutput<T> | undefined {
  const result = v.safeParse(schema, data);
  return result.success ? result.output : undefined;
}

/**
 * IndexedDB에서 안전하게 데이터 로드 (비동기)
 */
export async function loadFromStorage<T extends v.GenericSchema>(
  key: string,
  schema: T,
  fallback: v.InferOutput<T>,
): Promise<v.InferOutput<T>> {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = await getPreference(key);
    if (!stored) return fallback;

    const parsed: unknown = JSON.parse(stored);
    const result = v.safeParse(schema, parsed);
    return result.success ? result.output : fallback;
  } catch {
    return fallback;
  }
}

/**
 * IndexedDB에 안전하게 데이터 저장 (비동기)
 */
export async function saveToStorage<T extends v.GenericSchema>(
  key: string,
  schema: T,
  data: v.InferInput<T>,
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const validated = v.parse(schema, data);
    await setPreference(key, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Migrates data from localStorage to IndexedDB (one-time migration)
 */
export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        const existing = await getPreference(key);
        if (existing === null) {
          await setPreference(key, value);
        }
        localStorage.removeItem(key);
      }
    } catch {
      // Continue with next key
    }
  }
}
