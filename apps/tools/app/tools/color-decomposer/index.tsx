import { useParaglideI18n } from '@soundblue/i18n';
import { Check, Copy, RefreshCw, Shuffle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { getToolGuide } from '~/lib/toolGuides';
import { colorDecomposerTexts, defaultColorDecomposerSettings } from './settings';
import type { ColorDecomposerProps, ComponentColor, DecomposeSize } from './types';
import { decomposeColor, generateRandomColor, hexToRgb, mixColors } from './utils';

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
