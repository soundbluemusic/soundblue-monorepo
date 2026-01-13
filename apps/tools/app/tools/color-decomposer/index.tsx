import { useParaglideI18n } from '@soundblue/i18n';
import { Check, Copy, RefreshCw, Shuffle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { getToolGuide } from '~/lib/toolGuides';
import { colorDecomposerTexts, defaultColorDecomposerSettings } from './settings';
import type { ColorDecomposerProps, ComponentColor, DecomposeSize } from './types';

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

function mixColors(components: ComponentColor[]): string {
  let r = 0;
  let g = 0;
  let b = 0;

  for (const component of components) {
    const rgb = hexToRgb(component.hex);
    const weight = component.ratio / 100;
    r += rgb.r * weight;
    g += rgb.g * weight;
    b += rgb.b * weight;
  }

  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

// RGB to HSL conversion
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

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

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// HSL to RGB conversion
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
    const hue2rgb = (p: number, q: number, t: number) => {
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

// Auto-decompose target color into component colors
function decomposeColor(targetHex: string, size: DecomposeSize): ComponentColor[] {
  const targetRgb = hexToRgb(targetHex);
  const targetHsl = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

  // Handle extreme colors (near white or near black)
  // These colors cannot be meaningfully decomposed into different components
  const isExtreme = targetHsl.l >= 98 || targetHsl.l <= 2;

  if (isExtreme) {
    const baseRatio = Math.floor(100 / size);
    const components: ComponentColor[] = [];
    let remainingRatio = 100;

    for (let i = 0; i < size; i++) {
      const ratio = i === size - 1 ? remainingRatio : baseRatio;
      remainingRatio -= ratio;
      components.push({ hex: targetHex, ratio });
    }

    // Pad to 5 components
    while (components.length < 5) {
      components.push({ hex: '#808080', ratio: 0 });
    }

    return components;
  }

  const components: ComponentColor[] = [];
  const baseRatio = Math.floor(100 / size);
  let remainingRatio = 100;

  // Generate component colors based on size
  for (let i = 0; i < size; i++) {
    let componentHex: string;
    const ratio = i === size - 1 ? remainingRatio : baseRatio;
    remainingRatio -= ratio;

    if (size === 2) {
      // 2 colors: lighter and darker versions
      if (i === 0) {
        const lighterHsl = { ...targetHsl, l: Math.min(95, targetHsl.l + 30) };
        const rgb = hslToRgb(lighterHsl.h, lighterHsl.s, lighterHsl.l);
        componentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      } else {
        const darkerHsl = { ...targetHsl, l: Math.max(5, targetHsl.l - 30) };
        const rgb = hslToRgb(darkerHsl.h, darkerHsl.s, darkerHsl.l);
        componentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
      }
    } else if (size === 3) {
      // 3 colors: RGB-based decomposition
      if (i === 0) {
        componentHex = rgbToHex(
          Math.min(255, targetRgb.r + 80),
          targetRgb.g * 0.3,
          targetRgb.b * 0.3,
        );
      } else if (i === 1) {
        componentHex = rgbToHex(
          targetRgb.r * 0.3,
          Math.min(255, targetRgb.g + 80),
          targetRgb.b * 0.3,
        );
      } else {
        componentHex = rgbToHex(
          targetRgb.r * 0.3,
          targetRgb.g * 0.3,
          Math.min(255, targetRgb.b + 80),
        );
      }
    } else if (size === 4) {
      // 4 colors: CMYK-inspired
      const hueOffset = (i * 90) % 360;
      const newHue = (targetHsl.h + hueOffset) % 360;
      const rgb = hslToRgb(newHue, targetHsl.s, targetHsl.l);
      componentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    } else {
      // 5 colors: Spread across hue wheel
      const hueOffset = (i * 72) % 360;
      const newHue = (targetHsl.h + hueOffset) % 360;
      const satVariation = targetHsl.s * (0.7 + (i % 2) * 0.6);
      const rgb = hslToRgb(newHue, Math.min(100, satVariation), targetHsl.l);
      componentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    }

    components.push({ hex: componentHex, ratio });
  }

  // Pad to 5 components
  while (components.length < 5) {
    components.push({ hex: '#808080', ratio: 0 });
  }

  return components;
}

// ========================================
// Component Color Card
// ========================================

function ComponentColorCard({
  component,
  index,
  texts,
  onColorChange,
  onRatioChange,
}: {
  component: ComponentColor;
  index: number;
  texts: (typeof colorDecomposerTexts)['ko'] | (typeof colorDecomposerTexts)['en'];
  onColorChange: (index: number, hex: string) => void;
  onRatioChange: (index: number, ratio: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const rgb = hexToRgb(component.hex);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(component.hex.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available
    }
  }, [component.hex]);

  // Determine text color based on luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textColor = luminance > 0.5 ? 'text-gray-900' : 'text-white';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Color Preview with Picker */}
      <div
        className={`relative h-20 flex items-center justify-center ${textColor}`}
        style={{ backgroundColor: component.hex }}
      >
        <input
          type="color"
          value={component.hex}
          onChange={(e) => onColorChange(index, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title={texts.colorN.replace('{n}', String(index + 1))}
        />
        <div className="text-center pointer-events-none">
          <span className="text-xs font-medium opacity-70 block">
            {texts.colorN.replace('{n}', String(index + 1))}
          </span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="text-sm font-bold flex items-center gap-1"
          >
            {component.hex.toUpperCase()}
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-50" />}
          </button>
        </div>
      </div>

      {/* Ratio Slider */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{texts.ratio}</span>
          <span className="text-sm font-bold tabular-nums">{component.ratio}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="90"
          value={component.ratio}
          onChange={(e) => onRatioChange(index, Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
}

// ========================================
// Main Component
// ========================================

export function ColorDecomposer({
  settings: propSettings,
  onSettingsChange,
}: ColorDecomposerProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const texts = colorDecomposerTexts[currentLocale];
  const guide = getToolGuide('colorDecomposer', currentLocale);

  // Merge settings
  const [internalSettings, setInternalSettings] = useState(defaultColorDecomposerSettings);
  const settings = useMemo(
    () => ({ ...defaultColorDecomposerSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<typeof settings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // Calculate mixed color from components
  const mixedColor = useMemo(
    () => mixColors(settings.components.slice(0, settings.size)),
    [settings.components, settings.size],
  );

  const mixedRgb = useMemo(() => hexToRgb(mixedColor), [mixedColor]);

  // Handlers
  const handleSizeChange = useCallback(
    (size: DecomposeSize) => {
      // Auto-decompose with new size
      const newComponents = decomposeColor(settings.targetColor, size);
      handleSettingsChange({ size, components: newComponents });
    },
    [handleSettingsChange, settings.targetColor],
  );

  const handleTargetColorChange = useCallback(
    (hex: string) => {
      // Auto-decompose target color into components
      const newComponents = decomposeColor(hex, settings.size);
      handleSettingsChange({ targetColor: hex, components: newComponents });
    },
    [handleSettingsChange, settings.size],
  );

  const handleComponentColorChange = useCallback(
    (index: number, hex: string) => {
      const newComponents = [...settings.components];
      newComponents[index] = { ...newComponents[index], hex };
      handleSettingsChange({ components: newComponents });
    },
    [handleSettingsChange, settings.components],
  );

  const handleRatioChange = useCallback(
    (index: number, newRatio: number) => {
      const currentComponents = settings.components.slice(0, settings.size);
      const oldRatio = currentComponents[index].ratio;
      const diff = newRatio - oldRatio;

      // Distribute the difference among other components proportionally
      const otherIndices = currentComponents.map((_, i) => i).filter((i) => i !== index);

      const otherTotal = otherIndices.reduce((sum, i) => sum + currentComponents[i].ratio, 0);

      const newComponents = currentComponents.map((comp, i) => {
        if (i === index) {
          return { ...comp, ratio: newRatio };
        }
        if (otherTotal === 0) {
          // Distribute evenly if others are 0
          return {
            ...comp,
            ratio: Math.max(5, comp.ratio - Math.floor(diff / otherIndices.length)),
          };
        }
        // Proportional distribution
        const proportion = comp.ratio / otherTotal;
        const adjustment = Math.round(diff * proportion);
        return { ...comp, ratio: Math.max(5, comp.ratio - adjustment) };
      });

      // Normalize to exactly 100%
      const total = newComponents.reduce((sum, c) => sum + c.ratio, 0);
      if (total !== 100) {
        const diff100 = 100 - total;
        // Add the difference to the largest component (excluding the one being changed)
        const maxOtherIdx = otherIndices.reduce(
          (maxI, i) => (newComponents[i].ratio > newComponents[maxI].ratio ? i : maxI),
          otherIndices[0],
        );
        if (maxOtherIdx !== undefined) {
          newComponents[maxOtherIdx].ratio += diff100;
        }
      }

      // Pad components array back to 5 if needed
      while (newComponents.length < 5) {
        newComponents.push({ hex: '#808080', ratio: 0 });
      }

      handleSettingsChange({ components: newComponents });
    },
    [handleSettingsChange, settings.components, settings.size],
  );

  const handleReset = useCallback(() => {
    handleSettingsChange(defaultColorDecomposerSettings);
  }, [handleSettingsChange]);

  const handleRandomize = useCallback(() => {
    const newComponents = settings.components.slice(0, settings.size).map((comp) => ({
      ...comp,
      hex: generateRandomColor(),
    }));
    // Pad back to 5
    while (newComponents.length < 5) {
      newComponents.push({ hex: '#808080', ratio: 0 });
    }
    handleSettingsChange({ components: newComponents });
  }, [handleSettingsChange, settings.components, settings.size]);

  const sizes: DecomposeSize[] = [2, 3, 4, 5];
  const activeComponents = settings.components.slice(0, settings.size);

  // Determine text color for target color preview
  const targetRgb = hexToRgb(settings.targetColor);
  const targetLuminance = (0.299 * targetRgb.r + 0.587 * targetRgb.g + 0.114 * targetRgb.b) / 255;
  const targetTextColor = targetLuminance > 0.5 ? 'text-gray-900' : 'text-white';

  // Determine text color for mixed result
  const mixedLuminance = (0.299 * mixedRgb.r + 0.587 * mixedRgb.g + 0.114 * mixedRgb.b) / 255;
  const mixedTextColor = mixedLuminance > 0.5 ? 'text-gray-900' : 'text-white';

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* Target Color */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.targetColor}</h3>
        <div
          className={`relative h-24 rounded-xl flex items-center justify-center ${targetTextColor}`}
          style={{ backgroundColor: settings.targetColor }}
        >
          <input
            type="color"
            value={settings.targetColor}
            onChange={(e) => handleTargetColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title={texts.targetColor}
          />
          <span className="text-lg font-bold pointer-events-none">
            {settings.targetColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Size Selector */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label className="text-sm font-medium text-foreground block mb-2">
          {texts.componentCount}
        </label>
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

      {/* Mix Preview */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.preview}</h3>
        <div className="flex items-center gap-2 h-16">
          {/* Component colors strip */}
          <div className="flex-1 flex h-full rounded-l-xl overflow-hidden">
            {activeComponents.map((comp, idx) => (
              <div
                key={idx}
                className="h-full transition-all duration-200"
                style={{
                  backgroundColor: comp.hex,
                  width: `${comp.ratio}%`,
                }}
              />
            ))}
          </div>
          {/* Arrow */}
          <div className="text-muted-foreground text-xl px-2">→</div>
          {/* Mixed result */}
          <div
            className={`w-24 h-full rounded-r-xl flex items-center justify-center ${mixedTextColor}`}
            style={{ backgroundColor: mixedColor }}
          >
            <span className="text-xs font-bold">{mixedColor.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Component Colors */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-3">{texts.components}</h3>
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
          {activeComponents.map((component, idx) => (
            <ComponentColorCard
              key={idx}
              component={component}
              index={idx}
              texts={texts}
              onColorChange={handleComponentColorChange}
              onRatioChange={handleRatioChange}
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

export { type ColorDecomposerSettings, defaultColorDecomposerSettings } from './settings';
export type { ColorDecomposerProps } from './types';
