/**
 * Color Decomposer Utility Functions
 * Separated to avoid circular dependencies with settings.ts
 */

import type { ComponentColor, DecomposeSize } from './types';

// ========================================
// Color Conversion Functions
// ========================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
}

export function mixColors(components: ComponentColor[]): string {
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

export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

// RGB to HSL conversion
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
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

// ========================================
// Color Decomposition
// ========================================

/**
 * Auto-decompose target color into component colors
 * Key constraint: mixing all components at their ratios must reproduce the target color exactly
 */
export function decomposeColor(
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
// Recalculate Unlocked Colors
// ========================================

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Recalculate unlocked component colors to match the target color
 * Given locked colors (fixed), calculate what unlocked colors should be
 *
 * Key improvement: Unlocked colors work TOGETHER to achieve the target.
 * When one color hits RGB limits (0-255), others compensate.
 *
 * Formula: target = Σ(locked × ratio) + Σ(unlocked × ratio)
 * So: Σ(unlocked × ratio) = target - Σ(locked × ratio)
 */
export function recalculateUnlockedColors(
  targetHex: string,
  components: ComponentColor[],
  size: DecomposeSize,
): ComponentColor[] {
  const target = hexToRgb(targetHex);
  const activeComponents = components.slice(0, size);

  // Find locked and unlocked indices
  const lockedIndices: number[] = [];
  const unlockedIndices: number[] = [];

  activeComponents.forEach((comp, idx) => {
    if (comp.locked) {
      lockedIndices.push(idx);
    } else {
      unlockedIndices.push(idx);
    }
  });

  // If all locked or none unlocked, cannot recalculate
  if (unlockedIndices.length === 0) {
    return components;
  }

  // Calculate contribution from locked colors
  let lockedR = 0;
  let lockedG = 0;
  let lockedB = 0;

  for (const idx of lockedIndices) {
    const rgb = hexToRgb(activeComponents[idx].hex);
    const weight = activeComponents[idx].ratio / 100;
    lockedR += rgb.r * weight;
    lockedG += rgb.g * weight;
    lockedB += rgb.b * weight;
  }

  // Remaining color that unlocked components must produce together
  const remaining: RGB = {
    r: target.r - lockedR,
    g: target.g - lockedG,
    b: target.b - lockedB,
  };

  // Create new components array
  const newComponents = [...components];

  // Get unlocked components info
  const unlockedInfo = unlockedIndices.map((idx) => ({
    idx,
    ratio: activeComponents[idx].ratio,
  }));

  // Distribute remaining color cooperatively among unlocked components
  const calculatedColors = distributeColorCooperatively(remaining, unlockedInfo);

  // Apply calculated colors
  for (let i = 0; i < unlockedIndices.length; i++) {
    const idx = unlockedIndices[i];
    const rgb = calculatedColors[i];
    newComponents[idx] = {
      ...newComponents[idx],
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
  }

  return newComponents;
}

/**
 * Distribute remaining color among unlocked components cooperatively
 * When one component hits RGB limits, redistribute overflow to others
 */
function distributeColorCooperatively(
  remaining: RGB,
  unlockedInfo: { idx: number; ratio: number }[],
): RGB[] {
  const totalRatio = unlockedInfo.reduce((sum, info) => sum + info.ratio, 0);

  if (totalRatio === 0) {
    return unlockedInfo.map(() => ({ r: 128, g: 128, b: 128 }));
  }

  // Initialize result with target values (before clamping)
  const results: RGB[] = unlockedInfo.map((info) => {
    const weight = info.ratio / 100;
    const proportion = info.ratio / totalRatio;
    // Each component contributes: (remaining × proportion) when mixed at its ratio
    // So the color value is: (remaining × proportion) / weight
    return {
      r: (remaining.r * proportion) / weight,
      g: (remaining.g * proportion) / weight,
      b: (remaining.b * proportion) / weight,
    };
  });

  // Iteratively redistribute overflow until stable
  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    let hasOverflow = false;
    const overflow: RGB = { r: 0, g: 0, b: 0 };
    const availableIndices: number[] = [];

    // Check each component for overflow and accumulate
    for (let i = 0; i < results.length; i++) {
      const rgb = results[i];
      const weight = unlockedInfo[i].ratio / 100;
      let componentHasOverflow = false;

      // Check and clamp each channel
      for (const channel of ['r', 'g', 'b'] as const) {
        const val = rgb[channel];
        if (val < 0) {
          // Overflow: need more from others (negative contribution needed)
          overflow[channel] += val * weight; // val is negative, so this subtracts
          rgb[channel] = 0;
          componentHasOverflow = true;
          hasOverflow = true;
        } else if (val > 255) {
          // Overflow: this component contributes too much
          overflow[channel] += (val - 255) * weight;
          rgb[channel] = 255;
          componentHasOverflow = true;
          hasOverflow = true;
        }
      }

      // Track components that can still absorb overflow
      if (!componentHasOverflow) {
        availableIndices.push(i);
      }
    }

    if (!hasOverflow || availableIndices.length === 0) {
      break;
    }

    // Redistribute overflow to available components
    const availableTotalRatio = availableIndices.reduce((sum, i) => sum + unlockedInfo[i].ratio, 0);

    if (availableTotalRatio === 0) {
      break;
    }

    for (const i of availableIndices) {
      const weight = unlockedInfo[i].ratio / 100;
      const proportion = unlockedInfo[i].ratio / availableTotalRatio;

      // Add overflow share to this component
      results[i].r += (overflow.r * proportion) / weight;
      results[i].g += (overflow.g * proportion) / weight;
      results[i].b += (overflow.b * proportion) / weight;
    }
  }

  // Final clamp and round
  return results.map((rgb) => ({
    r: Math.max(0, Math.min(255, Math.round(rgb.r))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b))),
  }));
}
