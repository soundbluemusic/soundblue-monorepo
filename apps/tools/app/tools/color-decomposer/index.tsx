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
// Key constraint: mixing all components at their ratios must reproduce the target color exactly
function decomposeColor(
  targetHex: string,
  size: DecomposeSize,
  customRatios?: number[],
): ComponentColor[] {
  const target = hexToRgb(targetHex);
  const components: ComponentColor[] = [];

  // Use custom ratios or build default ratios array (sum = 100)
  const ratios =
    customRatios ||
    (() => {
      const baseRatio = Math.floor(100 / size);
      const arr: number[] = [];
      let remaining = 100;
      for (let i = 0; i < size; i++) {
        const ratio = i === size - 1 ? remaining : baseRatio;
        remaining -= ratio;
        arr.push(ratio);
      }
      return arr;
    })();
  const w = ratios.map((r) => r / 100); // weights

  // Calculate safe offset to prevent clamping
  // offset must not push any channel below 0 or above 255
  const maxOffset = Math.min(
    target.r,
    target.g,
    target.b,
    255 - target.r,
    255 - target.g,
    255 - target.b,
  );
  const baseOffset = Math.min(40, maxOffset);

  if (size === 2) {
    // c1: target + offset (brighter)
    const c1 = {
      r: target.r + baseOffset,
      g: target.g + baseOffset,
      b: target.b + baseOffset,
    };
    // c2 = (target - c1 × w0) / w1  (mathematically exact)
    const c2 = {
      r: Math.round((target.r - c1.r * w[0]) / w[1]),
      g: Math.round((target.g - c1.g * w[0]) / w[1]),
      b: Math.round((target.b - c1.b * w[0]) / w[1]),
    };
    components.push({ hex: rgbToHex(c1.r, c1.g, c1.b), ratio: ratios[0] });
    components.push({ hex: rgbToHex(c2.r, c2.g, c2.b), ratio: ratios[1] });
  } else if (size === 3) {
    // Each component offsets a different channel
    const c1 = { r: target.r + baseOffset, g: target.g, b: target.b };
    const c2 = { r: target.r, g: target.g + baseOffset, b: target.b };
    // c3 = (target - c1×w0 - c2×w1) / w2
    const c3 = {
      r: Math.round((target.r - c1.r * w[0] - c2.r * w[1]) / w[2]),
      g: Math.round((target.g - c1.g * w[0] - c2.g * w[1]) / w[2]),
      b: Math.round((target.b - c1.b * w[0] - c2.b * w[1]) / w[2]),
    };
    components.push({ hex: rgbToHex(c1.r, c1.g, c1.b), ratio: ratios[0] });
    components.push({ hex: rgbToHex(c2.r, c2.g, c2.b), ratio: ratios[1] });
    components.push({ hex: rgbToHex(c3.r, c3.g, c3.b), ratio: ratios[2] });
  } else if (size === 4) {
    const c1 = { r: target.r + baseOffset, g: target.g, b: target.b };
    const c2 = { r: target.r, g: target.g + baseOffset, b: target.b };
    const c3 = { r: target.r, g: target.g, b: target.b + baseOffset };
    // c4 = (target - c1×w0 - c2×w1 - c3×w2) / w3
    const c4 = {
      r: Math.round((target.r - c1.r * w[0] - c2.r * w[1] - c3.r * w[2]) / w[3]),
      g: Math.round((target.g - c1.g * w[0] - c2.g * w[1] - c3.g * w[2]) / w[3]),
      b: Math.round((target.b - c1.b * w[0] - c2.b * w[1] - c3.b * w[2]) / w[3]),
    };
    components.push({ hex: rgbToHex(c1.r, c1.g, c1.b), ratio: ratios[0] });
    components.push({ hex: rgbToHex(c2.r, c2.g, c2.b), ratio: ratios[1] });
    components.push({ hex: rgbToHex(c3.r, c3.g, c3.b), ratio: ratios[2] });
    components.push({ hex: rgbToHex(c4.r, c4.g, c4.b), ratio: ratios[3] });
  } else {
    // size === 5
    const halfOffset = Math.floor(baseOffset / 2);
    const c1 = { r: target.r + baseOffset, g: target.g, b: target.b };
    const c2 = { r: target.r, g: target.g + baseOffset, b: target.b };
    const c3 = { r: target.r, g: target.g, b: target.b + baseOffset };
    const c4 = { r: target.r + halfOffset, g: target.g + halfOffset, b: target.b };
    // c5 = (target - c1×w0 - c2×w1 - c3×w2 - c4×w3) / w4
    const c5 = {
      r: Math.round((target.r - c1.r * w[0] - c2.r * w[1] - c3.r * w[2] - c4.r * w[3]) / w[4]),
      g: Math.round((target.g - c1.g * w[0] - c2.g * w[1] - c3.g * w[2] - c4.g * w[3]) / w[4]),
      b: Math.round((target.b - c1.b * w[0] - c2.b * w[1] - c3.b * w[2] - c4.b * w[3]) / w[4]),
    };
    components.push({ hex: rgbToHex(c1.r, c1.g, c1.b), ratio: ratios[0] });
    components.push({ hex: rgbToHex(c2.r, c2.g, c2.b), ratio: ratios[1] });
    components.push({ hex: rgbToHex(c3.r, c3.g, c3.b), ratio: ratios[2] });
    components.push({ hex: rgbToHex(c4.r, c4.g, c4.b), ratio: ratios[3] });
    components.push({ hex: rgbToHex(c5.r, c5.g, c5.b), ratio: ratios[4] });
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
        className={`relative h-20 flex flex-col items-center justify-center ${textColor}`}
        style={{ backgroundColor: component.hex }}
      >
        {/* Color Picker - covers top area */}
        <label className="absolute inset-x-0 top-0 h-12 cursor-pointer">
          <input
            type="color"
            value={component.hex}
            onChange={(e) => onColorChange(index, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title={texts.colorN.replace('{n}', String(index + 1))}
          />
          <span className="text-xs font-medium opacity-70 block text-center mt-2">
            {texts.colorN.replace('{n}', String(index + 1))}
          </span>
        </label>
        {/* Copy Button - separate clickable area */}
        <button
          type="button"
          onClick={copyToClipboard}
          className="absolute bottom-2 text-sm font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-black/10 transition-colors"
        >
          {component.hex.toUpperCase()}
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-50" />}
        </button>
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
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
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

  // Copy color to clipboard
  const copyColor = useCallback(async (hex: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hex.toUpperCase());
      setCopiedColor(id);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch {
      // Clipboard API not available
    }
  }, []);

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

      const newRatios = currentComponents.map((comp, i) => {
        if (i === index) {
          return newRatio;
        }
        if (otherTotal === 0) {
          return Math.max(5, comp.ratio - Math.floor(diff / otherIndices.length));
        }
        const proportion = comp.ratio / otherTotal;
        const adjustment = Math.round(diff * proportion);
        return Math.max(5, comp.ratio - adjustment);
      });

      // Normalize to exactly 100%
      const total = newRatios.reduce((sum, r) => sum + r, 0);
      if (total !== 100) {
        const diff100 = 100 - total;
        const maxOtherIdx = otherIndices.reduce(
          (maxI, i) => (newRatios[i] > newRatios[maxI] ? i : maxI),
          otherIndices[0],
        );
        if (maxOtherIdx !== undefined) {
          newRatios[maxOtherIdx] += diff100;
        }
      }

      // Recalculate component colors with new ratios to maintain Preview = Target
      const newComponents = decomposeColor(settings.targetColor, settings.size, newRatios);
      handleSettingsChange({ components: newComponents });
    },
    [handleSettingsChange, settings.targetColor, settings.size, settings.components],
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
          className={`relative h-24 rounded-xl flex flex-col items-center justify-center ${targetTextColor}`}
          style={{ backgroundColor: settings.targetColor }}
        >
          {/* Color Picker - covers top area */}
          <label className="absolute inset-x-0 top-0 h-16 cursor-pointer">
            <input
              type="color"
              value={settings.targetColor}
              onChange={(e) => handleTargetColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={texts.targetColor}
            />
          </label>
          {/* Copy Button */}
          <button
            type="button"
            onClick={() => copyColor(settings.targetColor, 'target')}
            className="absolute bottom-3 text-lg font-bold flex items-center gap-2 px-3 py-1 rounded hover:bg-black/10 transition-colors"
          >
            {settings.targetColor.toUpperCase()}
            {copiedColor === 'target' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4 opacity-50" />
            )}
          </button>
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
          <button
            type="button"
            onClick={() => copyColor(mixedColor, 'preview')}
            className={`w-24 h-full rounded-r-xl flex items-center justify-center gap-1 hover:opacity-90 transition-opacity ${mixedTextColor}`}
            style={{ backgroundColor: mixedColor }}
          >
            <span className="text-xs font-bold">{mixedColor.toUpperCase()}</span>
            {copiedColor === 'preview' ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3 opacity-50" />
            )}
          </button>
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
