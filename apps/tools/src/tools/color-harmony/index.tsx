import { Check, Copy, RefreshCw, Shuffle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { useCurrentLocale } from '~/hooks';
import { copyToClipboard } from '~/lib/clipboard';
import { hexToColorInfo, hslToRgb, rgbToHex } from '~/lib/color-converters';
import { getToolGuide } from '~/lib/toolGuides';
import { colorHarmonyTexts, defaultColorHarmonySettings } from './settings';
import type { ColorHarmonyProps, ColorInfo, HarmonyMode } from './types';

function hslToColorInfo(h: number, s: number, l: number): ColorInfo {
  const rgb = hslToRgb(h, s, l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return { hex: hex.toUpperCase(), rgb, hsl: { h, s, l } };
}

// ========================================
// Harmony Generation Functions
// ========================================

function generateHarmony(baseColor: string, mode: HarmonyMode): ColorInfo[] {
  const base = hexToColorInfo(baseColor);
  const { h, s, l } = base.hsl;

  switch (mode) {
    case 'complementary':
      return [base, hslToColorInfo((h + 180) % 360, s, l)];

    case 'analogous':
      return [
        hslToColorInfo((h - 30 + 360) % 360, s, l),
        base,
        hslToColorInfo((h + 30) % 360, s, l),
      ];

    case 'triadic':
      return [base, hslToColorInfo((h + 120) % 360, s, l), hslToColorInfo((h + 240) % 360, s, l)];

    case 'monochromatic':
      return [
        hslToColorInfo(h, s, Math.max(10, l - 30)),
        hslToColorInfo(h, s, Math.max(20, l - 15)),
        base,
        hslToColorInfo(h, s, Math.min(80, l + 15)),
        hslToColorInfo(h, s, Math.min(90, l + 30)),
      ];

    default:
      return [base];
  }
}

function generateRandomColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 40) + 50; // 50-90%
  const l = Math.floor(Math.random() * 30) + 35; // 35-65%
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// ========================================
// Color Card Component
// ========================================

function ColorCard({
  color,
  texts,
}: {
  color: ColorInfo;
  texts: (typeof colorHarmonyTexts)['ko'] | (typeof colorHarmonyTexts)['en'];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback(async (text: string, type: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    }
  }, []);

  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const hslString = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

  // Determine text color based on luminance
  const luminance = (0.299 * color.rgb.r + 0.587 * color.rgb.g + 0.114 * color.rgb.b) / 255;
  const textColor = luminance > 0.5 ? 'text-gray-900' : 'text-white';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Color Preview */}
      <div
        className={`h-24 sm:h-32 flex items-center justify-center ${textColor}`}
        style={{ backgroundColor: color.hex }}
      >
        <span className="text-lg font-bold opacity-90">{color.hex}</span>
      </div>

      {/* Color Values */}
      <div className="p-3 space-y-2">
        {/* HEX */}
        <button
          type="button"
          onClick={() => handleCopy(color.hex, 'hex')}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.hex}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.hex}
            {copied === 'hex' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
            )}
          </span>
        </button>

        {/* RGB */}
        <button
          type="button"
          onClick={() => handleCopy(rgbString, 'rgb')}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.rgb}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
            {copied === 'rgb' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
            )}
          </span>
        </button>

        {/* HSL */}
        <button
          type="button"
          onClick={() => handleCopy(hslString, 'hsl')}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.hsl}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
            {copied === 'hsl' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

export function ColorHarmony({ settings: propSettings, onSettingsChange }: ColorHarmonyProps) {
  const currentLocale = useCurrentLocale();
  const texts = colorHarmonyTexts[currentLocale];
  const guide = getToolGuide('colorHarmony', currentLocale);

  // Merge settings
  const [internalSettings, setInternalSettings] = useState(defaultColorHarmonySettings);
  const settings = useMemo(
    () => ({ ...defaultColorHarmonySettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<typeof settings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // Generate harmony
  const harmony = useMemo(
    () => generateHarmony(settings.baseColor, settings.mode),
    [settings.baseColor, settings.mode],
  );

  // Handlers
  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSettingsChange({ baseColor: e.target.value });
    },
    [handleSettingsChange],
  );

  const handleModeChange = useCallback(
    (mode: HarmonyMode) => {
      handleSettingsChange({ mode });
    },
    [handleSettingsChange],
  );

  const handleReset = useCallback(() => {
    handleSettingsChange(defaultColorHarmonySettings);
  }, [handleSettingsChange]);

  const handleRandomize = useCallback(() => {
    handleSettingsChange({ baseColor: generateRandomColor() });
  }, [handleSettingsChange]);

  const modes: { value: HarmonyMode; label: string }[] = [
    { value: 'complementary', label: texts.complementary },
    { value: 'analogous', label: texts.analogous },
    { value: 'triadic', label: texts.triadic },
    { value: 'monochromatic', label: texts.monochromatic },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* Controls Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Base Color Picker */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="base-color-picker" className="text-sm font-medium text-foreground">
            {texts.baseColor}
          </label>
          <div className="flex items-center gap-2 flex-1">
            <input
              id="base-color-picker"
              type="color"
              value={settings.baseColor}
              onChange={handleColorChange}
              className="h-10 w-16 cursor-pointer rounded-lg border border-border bg-transparent"
            />
            <input
              type="text"
              value={settings.baseColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  handleSettingsChange({ baseColor: val });
                }
              }}
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm font-mono uppercase"
              maxLength={7}
              aria-label="Hex color code"
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">{texts.mode}</span>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => handleModeChange(m.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  settings.mode === m.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Harmony Display */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.palette}</h3>
        <div
          className={`grid gap-4 ${
            harmony.length <= 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : harmony.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          }`}
        >
          {harmony.map((color, idx) => (
            <ColorCard key={`${color.hex}-${idx}`} color={color} texts={texts} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={handleRandomize}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Shuffle className="h-4 w-4" />
          {texts.randomize}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          {texts.reset}
        </button>
      </div>

      {/* Tool Guide */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}

export { type ColorHarmonySettings, defaultColorHarmonySettings } from './settings';
export type { ColorHarmonyProps } from './types';
