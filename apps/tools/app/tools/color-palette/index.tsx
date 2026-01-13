import { useParaglideI18n } from '@soundblue/i18n';
import { Check, Copy, RefreshCw, Shuffle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { getToolGuide } from '~/lib/toolGuides';
import { colorPaletteTexts, DEFAULT_COLORS, defaultColorPaletteSettings } from './settings';
import type { ColorInfo, ColorPaletteProps, PaletteSize } from './types';

// ========================================
// Color Utility Functions
// ========================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function hexToColorInfo(hex: string): ColorInfo {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex: hex.toUpperCase(), rgb, hsl };
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
  index,
  texts,
  onColorChange,
}: {
  color: ColorInfo;
  index: number;
  texts: (typeof colorPaletteTexts)['ko'] | (typeof colorPaletteTexts)['en'];
  onColorChange: (index: number, hex: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const hslString = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;

  // Determine text color based on luminance
  const luminance = (0.299 * color.rgb.r + 0.587 * color.rgb.g + 0.114 * color.rgb.b) / 255;
  const textColor = luminance > 0.5 ? 'text-gray-900' : 'text-white';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Color Preview with Picker */}
      <div
        className={`relative h-28 sm:h-36 flex items-center justify-center ${textColor}`}
        style={{ backgroundColor: color.hex }}
      >
        <input
          type="color"
          value={color.hex}
          onChange={(e) => onColorChange(index, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title={texts.colorN.replace('{n}', String(index + 1))}
        />
        <div className="text-center pointer-events-none">
          <span className="text-xs font-medium opacity-70 block mb-1">
            {texts.colorN.replace('{n}', String(index + 1))}
          </span>
          <span className="text-lg font-bold">{color.hex}</span>
        </div>
      </div>

      {/* Color Values */}
      <div className="p-3 space-y-1.5">
        {/* HEX */}
        <button
          type="button"
          onClick={() => copyToClipboard(color.hex, 'hex')}
          className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.hex}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.hex}
            {copied === 'hex' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-30 group-hover:opacity-60" />
            )}
          </span>
        </button>

        {/* RGB */}
        <button
          type="button"
          onClick={() => copyToClipboard(rgbString, 'rgb')}
          className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.rgb}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
            {copied === 'rgb' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-30 group-hover:opacity-60" />
            )}
          </span>
        </button>

        {/* HSL */}
        <button
          type="button"
          onClick={() => copyToClipboard(hslString, 'hsl')}
          className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-muted transition-colors text-left group"
        >
          <span className="text-xs font-medium text-muted-foreground">{texts.hsl}</span>
          <span className="flex items-center gap-1.5 text-sm font-mono">
            {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
            {copied === 'hsl' ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-30 group-hover:opacity-60" />
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

export function ColorPalette({ settings: propSettings, onSettingsChange }: ColorPaletteProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const texts = colorPaletteTexts[currentLocale];
  const guide = getToolGuide('colorPalette', currentLocale);

  // Merge settings
  const [internalSettings, setInternalSettings] = useState(defaultColorPaletteSettings);
  const settings = useMemo(
    () => ({ ...defaultColorPaletteSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<typeof settings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // Convert colors to ColorInfo
  const colorInfos = useMemo(
    () => settings.colors.slice(0, settings.size).map((hex) => hexToColorInfo(hex)),
    [settings.colors, settings.size],
  );

  // Handlers
  const handleSizeChange = useCallback(
    (size: PaletteSize) => {
      const currentColors = settings.colors;
      let newColors: string[];

      if (size > currentColors.length) {
        // Add more colors from defaults
        newColors = [...currentColors, ...DEFAULT_COLORS.slice(currentColors.length, size)];
      } else {
        newColors = currentColors.slice(0, size);
      }

      handleSettingsChange({ size, colors: newColors });
    },
    [handleSettingsChange, settings.colors],
  );

  const handleColorChange = useCallback(
    (index: number, hex: string) => {
      const newColors = [...settings.colors];
      newColors[index] = hex;
      handleSettingsChange({ colors: newColors });
    },
    [handleSettingsChange, settings.colors],
  );

  const handleReset = useCallback(() => {
    handleSettingsChange(defaultColorPaletteSettings);
  }, [handleSettingsChange]);

  const handleRandomize = useCallback(() => {
    const newColors = Array.from({ length: settings.size }, () => generateRandomColor());
    handleSettingsChange({ colors: newColors });
  }, [handleSettingsChange, settings.size]);

  const sizes: PaletteSize[] = [2, 3, 4, 5];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* Controls Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Size Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{texts.paletteSize}</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeChange(size)}
                className={`w-12 h-10 text-sm font-medium rounded-lg transition-colors ${
                  settings.size === size
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Combined Palette Preview */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.preview}</h3>
        <div className="flex h-24 sm:h-32 rounded-xl overflow-hidden shadow-inner">
          {colorInfos.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 transition-all duration-200"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Color Cards */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.palette}</h3>
        <div
          className={`grid gap-4 ${
            settings.size === 2
              ? 'grid-cols-2'
              : settings.size === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : settings.size === 4
                  ? 'grid-cols-2 sm:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
          }`}
        >
          {colorInfos.map((color, idx) => (
            <ColorCard
              key={idx}
              color={color}
              index={idx}
              texts={texts}
              onColorChange={handleColorChange}
            />
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

export { type ColorPaletteSettings, defaultColorPaletteSettings } from './settings';
export type { ColorPaletteProps } from './types';
