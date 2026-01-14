import { useParaglideI18n } from '@soundblue/i18n';
import {
  AlertTriangle,
  Check,
  Copy,
  Lock,
  Palette,
  RefreshCw,
  Shuffle,
  Unlock,
} from 'lucide-react';
import { memo, useCallback, useMemo, useState, useTransition } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { getToolGuide } from '~/lib/toolGuides';
import { colorDecomposerTexts, defaultColorDecomposerSettings } from './settings';
import type { ColorDecomposerProps, ComponentColor, DecomposeSize } from './types';
import {
  decomposeColor,
  generateRandomColor,
  hexToRgb,
  mixColors,
  recalculateUnlockedColors,
} from './utils';

// ========================================
// Checkerboard pattern for transparency visualization
// ========================================
const checkerboardStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
};

// ========================================
// Blend Preview Component (SVG Venn diagram with real intersections)
// ========================================

/**
 * Mix multiple colors with their opacities (subtractive mixing like paint)
 */
function blendColors(colors: { hex: string; opacity: number }[]): string {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0].hex;

  // Subtractive color mixing (like paint/ink)
  // Start with white and subtract
  let c = 1;
  let m = 1;
  let y = 1;

  for (const color of colors) {
    const rgb = hexToRgb(color.hex);
    const weight = (color.opacity ?? 100) / 100;

    // Convert RGB to CMY
    const colorC = 1 - rgb.r / 255;
    const colorM = 1 - rgb.g / 255;
    const colorY = 1 - rgb.b / 255;

    // Subtractive mixing: multiply CMY values
    c = c * (1 - weight * (1 - colorC));
    m = m * (1 - weight * (1 - colorM));
    y = y * (1 - weight * (1 - colorY));
  }

  // Convert back to RGB
  const r = Math.round((1 - c) * 255);
  const g = Math.round((1 - m) * 255);
  const b = Math.round((1 - y) * 255);

  return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Generate all possible subsets of indices (for intersection regions)
 * Sorted by size: smaller first (single circles), then pairs, then larger intersections
 * This ensures proper z-ordering: base circles first, then overlays on top
 */
function getSubsets(n: number): number[][] {
  const result: number[][] = [];
  for (let i = 1; i < 1 << n; i++) {
    const subset: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) subset.push(j);
    }
    result.push(subset);
  }
  // Sort by size: smaller first (base), larger last (on top)
  return result.sort((a, b) => a.length - b.length);
}

const BlendPreview = memo(function BlendPreview({
  components,
  onCopy,
  copiedColor,
}: {
  components: ComponentColor[];
  mixedColor: string;
  mixedTextColor: string;
  onCopy: (hex: string, id: string) => void;
  copiedColor: string | null;
}) {
  const count = components.length;
  const uniqueId = useMemo(() => Math.random().toString(36).slice(2, 9), []);

  // SVG viewBox dimensions
  const width = 300;
  const height = 220;
  const centerX = width / 2;
  const centerY = height / 2;
  const circleRadius = 55;
  const spreadRadius = 45; // Distance from center to circle centers

  // Calculate circle centers
  const circles = useMemo(() => {
    return components.map((comp, idx) => {
      const angle = (360 / count) * idx - 90; // Start from top
      const rad = (angle * Math.PI) / 180;
      return {
        cx: centerX + spreadRadius * Math.cos(rad),
        cy: centerY + spreadRadius * Math.sin(rad),
        r: circleRadius,
        color: comp.hex,
        opacity: (comp.opacity ?? 100) / 100,
      };
    });
  }, [components, count, centerX, centerY, spreadRadius, circleRadius]);

  // Generate all intersection regions with their colors
  const regions = useMemo(() => {
    const subsets = getSubsets(count);
    return subsets.map((indices) => {
      const colorsInRegion = indices.map((i) => ({
        hex: components[i].hex,
        opacity: components[i].opacity ?? 100,
      }));
      const blendedColor = blendColors(colorsInRegion);
      return {
        indices,
        color: blendedColor,
        key: indices.join('-'),
      };
    });
  }, [components, count]);

  // Center blend color (all colors)
  const centerBlend = useMemo(() => {
    return blendColors(components.map((c) => ({ hex: c.hex, opacity: c.opacity ?? 100 })));
  }, [components]);

  const centerRgb = hexToRgb(centerBlend);
  const centerLuminance = (0.299 * centerRgb.r + 0.587 * centerRgb.g + 0.114 * centerRgb.b) / 255;
  const centerTextColor = centerLuminance > 0.5 ? '#111' : '#fff';

  return (
    <div className="relative w-full h-56 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ maxHeight: '100%' }}
      >
        <defs>
          {/* Define clip paths for each circle */}
          {circles.map((circle, idx) => (
            <clipPath key={`clip-${idx}`} id={`circle-${uniqueId}-${idx}`}>
              <circle cx={circle.cx} cy={circle.cy} r={circle.r} />
            </clipPath>
          ))}
        </defs>

        {/* Render each region from largest intersection to smallest */}
        {regions.map(({ indices, color, key }) => {
          if (indices.length === 1) {
            // Single circle - just draw it
            const idx = indices[0];
            const circle = circles[idx];
            return (
              <circle
                key={key}
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                fill={circle.color}
                opacity={circle.opacity}
              />
            );
          }

          // For intersections, use nested clip paths
          // Draw a large rect clipped by all circles in the intersection
          const firstIdx = indices[0];
          const firstCircle = circles[firstIdx];

          // Create nested group with clip paths
          let element = (
            <circle cx={firstCircle.cx} cy={firstCircle.cy} r={firstCircle.r * 2} fill={color} />
          );

          // Apply each clip path
          for (let i = indices.length - 1; i >= 0; i--) {
            const clipIdx = indices[i];
            element = (
              <g key={`g-${i}`} clipPath={`url(#circle-${uniqueId}-${clipIdx})`}>
                {element}
              </g>
            );
          }

          return <g key={key}>{element}</g>;
        })}

        {/* Center label */}
        <g style={{ cursor: 'pointer' }} onClick={() => onCopy(centerBlend, 'blend')}>
          <circle cx={centerX} cy={centerY} r={24} fill={centerBlend} />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={centerTextColor}
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {copiedColor === 'blend' ? '✓' : centerBlend.toUpperCase()}
          </text>
        </g>
      </svg>
    </div>
  );
});

// ========================================
// Component Color Card (memoized for performance)
// ========================================

const ComponentColorCard = memo(function ComponentColorCard({
  component,
  index,
  texts,
  onColorChange,
  onRatioChange,
  onOpacityChange,
  onHexLockToggle,
  onRatioLockToggle,
  onOpacityLockToggle,
}: {
  component: ComponentColor;
  index: number;
  texts: (typeof colorDecomposerTexts)['ko'] | (typeof colorDecomposerTexts)['en'];
  onColorChange: (index: number, hex: string) => void;
  onRatioChange: (index: number, ratio: number) => void;
  onOpacityChange: (index: number, opacity: number) => void;
  onHexLockToggle: (index: number) => void;
  onRatioLockToggle: (index: number) => void;
  onOpacityLockToggle: (index: number) => void;
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

  const opacity = (component.opacity ?? 100) / 100;
  const isHexLocked = component.lockedHex ?? false;

  // Small lock button component for sliders
  const LockButton = ({ locked, onClick }: { locked: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-0.5 rounded transition-colors ${
        locked
          ? 'text-primary hover:text-primary/80'
          : 'text-muted-foreground/40 hover:text-muted-foreground'
      }`}
      title={locked ? texts.unlock : texts.lock}
    >
      {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
    </button>
  );

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden shadow-sm ${isHexLocked ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
    >
      {/* Color Preview with Picker - Checkerboard shows through at low opacity */}
      <div className="relative h-20" style={checkerboardStyle}>
        {/* Color overlay with actual opacity */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${textColor}`}
          style={{ backgroundColor: component.hex, opacity }}
        >
          {/* Hex Lock Button - top right (z-10 to appear above color picker label) */}
          <button
            type="button"
            onClick={() => onHexLockToggle(index)}
            className={`absolute top-2 right-2 z-10 p-1.5 rounded-md transition-colors ${
              isHexLocked
                ? 'bg-white/30 hover:bg-white/40'
                : 'bg-black/10 hover:bg-black/20 opacity-50 hover:opacity-100'
            }`}
            title={isHexLocked ? texts.unlock : texts.lock}
          >
            {isHexLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>
          {/* Color Picker - covers top area */}
          <label className="absolute inset-x-0 top-0 h-12 cursor-pointer group">
            <input
              type="color"
              value={component.hex}
              onChange={(e) => onColorChange(index, e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={texts.colorN.replace('{n}', String(index + 1))}
            />
            <span className="flex flex-col items-center mt-1.5">
              <span className="text-xs font-medium opacity-70 flex items-center gap-1">
                <Palette className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                {texts.colorN.replace('{n}', String(index + 1))}
                {isHexLocked && <span className="text-[10px] opacity-80">({texts.locked})</span>}
              </span>
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
      </div>

      {/* Sliders */}
      <div className="p-3 space-y-3">
        {/* Ratio Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground">{texts.ratio}</span>
              <LockButton
                locked={component.lockedRatio ?? false}
                onClick={() => onRatioLockToggle(index)}
              />
            </div>
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
        {/* Opacity Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground">{texts.opacity}</span>
              <LockButton
                locked={component.lockedOpacity ?? false}
                onClick={() => onOpacityLockToggle(index)}
              />
            </div>
            <span className="text-sm font-bold tabular-nums">{component.opacity ?? 100}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={component.opacity ?? 100}
            onChange={(e) => onOpacityChange(index, Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
          />
        </div>
      </div>
    </div>
  );
});

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
  const [isPending, startTransition] = useTransition();
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

  // Check if there's a color mismatch (target != mixed result)
  const hasColorMismatch = useMemo(() => {
    return mixedColor.toLowerCase() !== settings.targetColor.toLowerCase();
  }, [mixedColor, settings.targetColor]);

  // Check if any colors are locked (hex locked)
  const hasLockedColors = useMemo(() => {
    return settings.components.slice(0, settings.size).some((comp) => comp.lockedHex);
  }, [settings.components, settings.size]);

  // Show warning only when there's mismatch AND locked colors exist
  const showMismatchWarning = hasColorMismatch && hasLockedColors;

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
      // Update the changed color and mark hex as locked
      const newComponents = [...settings.components];
      newComponents[index] = { ...newComponents[index], hex, lockedHex: true };

      // Recalculate unlocked colors to match target
      const recalculatedComponents = recalculateUnlockedColors(
        settings.targetColor,
        newComponents,
        settings.size,
      );

      handleSettingsChange({ components: recalculatedComponents });
    },
    [handleSettingsChange, settings.components, settings.targetColor, settings.size],
  );

  // Individual lock toggles for hex, ratio, and opacity
  const handleHexLockToggle = useCallback(
    (index: number) => {
      const newComponents = [...settings.components];
      newComponents[index] = {
        ...newComponents[index],
        lockedHex: !newComponents[index].lockedHex,
      };

      // If unlocking, recalculate unlocked colors
      if (!newComponents[index].lockedHex) {
        const recalculatedComponents = recalculateUnlockedColors(
          settings.targetColor,
          newComponents,
          settings.size,
        );
        handleSettingsChange({ components: recalculatedComponents });
      } else {
        handleSettingsChange({ components: newComponents });
      }
    },
    [handleSettingsChange, settings.components, settings.targetColor, settings.size],
  );

  const handleRatioLockToggle = useCallback(
    (index: number) => {
      const newComponents = [...settings.components];
      newComponents[index] = {
        ...newComponents[index],
        lockedRatio: !newComponents[index].lockedRatio,
      };
      handleSettingsChange({ components: newComponents });
    },
    [handleSettingsChange, settings.components],
  );

  const handleOpacityLockToggle = useCallback(
    (index: number) => {
      const newComponents = [...settings.components];
      newComponents[index] = {
        ...newComponents[index],
        lockedOpacity: !newComponents[index].lockedOpacity,
      };
      handleSettingsChange({ components: newComponents });
    },
    [handleSettingsChange, settings.components],
  );

  // Ratio change with useTransition for smooth slider interaction
  const handleRatioChange = useCallback(
    (index: number, newRatio: number) => {
      startTransition(() => {
        const currentComponents = settings.components.slice(0, settings.size);
        const oldRatio = currentComponents[index].ratio;
        const diff = newRatio - oldRatio;

        // Find indices that are not ratio-locked (excluding current index)
        const unlockedIndices = currentComponents
          .map((comp, i) => ({ i, locked: comp.lockedRatio }))
          .filter(({ i, locked }) => i !== index && !locked)
          .map(({ i }) => i);

        // If all others are locked, can't redistribute
        if (unlockedIndices.length === 0) {
          return;
        }

        const unlockedTotal = unlockedIndices.reduce(
          (sum, i) => sum + currentComponents[i].ratio,
          0,
        );

        const newRatios = currentComponents.map((comp, i) => {
          if (i === index) {
            return newRatio;
          }
          if (comp.lockedRatio) {
            return comp.ratio; // Keep locked ratio unchanged
          }
          if (unlockedTotal === 0) {
            return Math.max(5, comp.ratio - Math.floor(diff / unlockedIndices.length));
          }
          const proportion = comp.ratio / unlockedTotal;
          const adjustment = Math.round(diff * proportion);
          return Math.max(5, comp.ratio - adjustment);
        });

        // Normalize to exactly 100%
        const total = newRatios.reduce((sum, r) => sum + r, 0);
        if (total !== 100 && unlockedIndices.length > 0) {
          const diff100 = 100 - total;
          const maxUnlockedIdx = unlockedIndices.reduce(
            (maxI, i) => (newRatios[i] > newRatios[maxI] ? i : maxI),
            unlockedIndices[0],
          );
          if (maxUnlockedIdx !== undefined) {
            newRatios[maxUnlockedIdx] += diff100;
          }
        }

        // Update ratios and recalculate unlocked hex colors
        const newComponents = settings.components.map((comp, i) => {
          if (i < settings.size) {
            return { ...comp, ratio: newRatios[i] };
          }
          return comp;
        });

        // Always recalculate unlocked hex colors to maintain target
        const recalculatedComponents = recalculateUnlockedColors(
          settings.targetColor,
          newComponents,
          settings.size,
        );
        handleSettingsChange({ components: recalculatedComponents });
      });
    },
    [handleSettingsChange, settings.targetColor, settings.size, settings.components],
  );

  // Opacity change with useTransition for smooth slider interaction
  const handleOpacityChange = useCallback(
    (index: number, newOpacity: number) => {
      startTransition(() => {
        // Update opacity
        const newComponents = settings.components.map((comp, i) => {
          if (i === index) {
            return { ...comp, opacity: newOpacity };
          }
          return comp;
        });

        // Always recalculate unlocked hex colors to maintain target
        const recalculatedComponents = recalculateUnlockedColors(
          settings.targetColor,
          newComponents,
          settings.size,
        );
        handleSettingsChange({ components: recalculatedComponents });
      });
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
      newComponents.push({ hex: '#808080', ratio: 0, opacity: 100 });
    }
    handleSettingsChange({ components: newComponents });
  }, [handleSettingsChange, settings.components, settings.size]);

  // Unlock all colors and recalculate to match target
  const handleUnlockAll = useCallback(() => {
    const newComponents = decomposeColor(settings.targetColor, settings.size);
    handleSettingsChange({ components: newComponents });
  }, [handleSettingsChange, settings.targetColor, settings.size]);

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
          <label className="absolute inset-x-0 top-0 h-16 cursor-pointer group">
            <input
              type="color"
              value={settings.targetColor}
              onChange={(e) => handleTargetColorChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={texts.targetColor}
            />
            {/* Click hint */}
            <span className="flex items-center justify-center gap-1 mt-3 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
              <Palette className="h-3 w-3" />
              {currentLocale === 'ko' ? '클릭하여 색상 선택' : 'Click to pick color'}
            </span>
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
      <div
        className={`rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
          showMismatchWarning ? 'border-red-500 dark:border-red-400' : 'border-border'
        }`}
      >
        {/* Header with mode toggle */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">{texts.preview}</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleSettingsChange({ previewMode: 'strip' })}
              className={`px-2 py-1 text-xs font-medium rounded-l-md transition-colors ${
                settings.previewMode === 'strip'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {texts.previewModeStrip}
            </button>
            <button
              type="button"
              onClick={() => handleSettingsChange({ previewMode: 'blend' })}
              className={`px-2 py-1 text-xs font-medium rounded-r-md transition-colors ${
                settings.previewMode === 'blend'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {texts.previewModeBlend}
            </button>
          </div>
        </div>

        {/* Preview content based on mode */}
        {settings.previewMode === 'strip' ? (
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
                    opacity: (comp.opacity ?? 100) / 100,
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
        ) : (
          <BlendPreview
            components={activeComponents}
            mixedColor={mixedColor}
            mixedTextColor={mixedTextColor}
            onCopy={copyColor}
            copiedColor={copiedColor}
          />
        )}

        {/* Mismatch Warning */}
        {showMismatchWarning && (
          <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-xs">{texts.mismatchWarning}</span>
            </div>
            <button
              type="button"
              onClick={handleUnlockAll}
              className="shrink-0 px-2 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
            >
              {texts.unlockAll}
            </button>
          </div>
        )}
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
              onOpacityChange={handleOpacityChange}
              onHexLockToggle={handleHexLockToggle}
              onRatioLockToggle={handleRatioLockToggle}
              onOpacityLockToggle={handleOpacityLockToggle}
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
