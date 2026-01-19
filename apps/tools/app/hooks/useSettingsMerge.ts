/**
 * Custom hook for merging tool settings with default values
 *
 * Provides a unified pattern for managing internal settings state
 * with external props and default values.
 */

import { useCallback, useMemo, useState } from 'react';

interface UseSettingsMergeOptions<T> {
  /** Default settings to use as fallback */
  defaults: T;
  /** External settings from props (optional) */
  propSettings?: Partial<T>;
  /** Callback when settings change (optional) */
  onSettingsChange?: (partial: Partial<T>) => void;
}

interface UseSettingsMergeReturn<T> {
  /** The merged settings object */
  settings: T;
  /** Function to update settings */
  updateSettings: (partial: Partial<T>) => void;
}

/**
 * Hook for managing tool settings with default values, prop overrides, and internal state
 *
 * @param options - Configuration options
 * @returns The merged settings and an update function
 *
 * @example
 * ```tsx
 * const { settings, updateSettings } = useSettingsMerge({
 *   defaults: defaultColorHarmonySettings,
 *   propSettings,
 *   onSettingsChange,
 * });
 *
 * // Use settings
 * const harmony = generateHarmony(settings.baseColor, settings.mode);
 *
 * // Update settings
 * updateSettings({ baseColor: '#FF0000' });
 * ```
 */
export function useSettingsMerge<T extends object>({
  defaults,
  propSettings,
  onSettingsChange,
}: UseSettingsMergeOptions<T>): UseSettingsMergeReturn<T> {
  const [internalSettings, setInternalSettings] = useState<Partial<T>>({});

  const settings = useMemo(
    () => ({ ...defaults, ...propSettings, ...internalSettings }),
    [defaults, propSettings, internalSettings],
  );

  const updateSettings = useCallback(
    (partial: Partial<T>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  return { settings, updateSettings };
}
