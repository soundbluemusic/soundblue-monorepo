/**
 * Color Decomposer Utility Functions
 * Separated to avoid circular dependencies with settings.ts
 */

import {
  colorDistance,
  generateRandomColor,
  hexToRgb,
  hslToRgb,
  type RGB,
  rgbToHex,
  rgbToHsl,
} from '~/lib/color-converters';
import type { ComponentColor, DecomposeSize } from './types';

// Re-export for backward compatibility
export { colorDistance, generateRandomColor, hexToRgb, hslToRgb, rgbToHex, rgbToHsl, type RGB };

/**
 * Mix colors with ratio and opacity.
 * Formula: Mixed RGB = Σ(Component RGB × ratio × opacity)
 * Opacity affects how much each color contributes to the final mix.
 */
export function mixColors(components: ComponentColor[]): string {
  let r = 0;
  let g = 0;
  let b = 0;

  for (const component of components) {
    const rgb = hexToRgb(component.hex);
    const ratioWeight = component.ratio / 100;
    const opacityWeight = (component.opacity ?? 100) / 100;
    const weight = ratioWeight * opacityWeight;
    r += rgb.r * weight;
    g += rgb.g * weight;
    b += rgb.b * weight;
  }

  // Calculate total effective weight for normalization
  const totalWeight = components.reduce((sum, comp) => {
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    return sum + ratioWeight * opacityWeight;
  }, 0);

  // Normalize if total weight is not 1 (due to opacity < 100%)
  if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.001) {
    r /= totalWeight;
    g /= totalWeight;
    b /= totalWeight;
  }

  return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

// ========================================
// Color Decomposition - Extreme Contrast Mode
// ========================================

/**
 * Find extreme colors that create surprising visual contrast.
 *
 * This version uses a direct mathematical approach:
 * 1. Place one color "beyond" the target on one axis
 * 2. Calculate the complementary color(s) needed to reach target
 *
 * For example, for purple (#8B5CF6):
 * - Color1: Saturated blue (#0000FF)
 * - Color2: Saturated red (#FF0000)
 * - Color3: The balancing color calculated from the equation
 */
function findExtremeDecomposition(
  target: { r: number; g: number; b: number },
  size: number,
): { colors: { r: number; g: number; b: number }[]; ratios: number[]; opacities: number[] } | null {
  const { r, g, b } = target;

  // Approach: For 3 colors, use 2 extreme primaries and calculate the 3rd
  // such that weighted average gives target exactly

  if (size === 2) {
    // Two colors: Use target's saturated version + complement

    // Pick two colors that bracket the target
    // One should be "more" than target, one should be "less"
    const sorted = [
      { val: r, ch: 'r' },
      { val: g, ch: 'g' },
      { val: b, ch: 'b' },
    ].sort((a, b) => b.val - a.val);

    const maxCh = sorted[0].ch;
    const minCh = sorted[2].ch;

    // Color1: Saturate the max channel
    const color1 = {
      r: maxCh === 'r' ? 255 : minCh === 'r' ? 0 : r,
      g: maxCh === 'g' ? 255 : minCh === 'g' ? 0 : g,
      b: maxCh === 'b' ? 255 : minCh === 'b' ? 0 : b,
    };

    // Color2: Opposite - saturate the min channel
    const color2 = {
      r: minCh === 'r' ? 255 : maxCh === 'r' ? 0 : 255 - r,
      g: minCh === 'g' ? 255 : maxCh === 'g' ? 0 : 255 - g,
      b: minCh === 'b' ? 255 : maxCh === 'b' ? 0 : 255 - b,
    };

    // Solve for ratio: t = α × c1 + (1-α) × c2
    const result = solveWithOpacity(target, [color1, color2]);
    if (result && result.ratios.every((r) => r >= 5)) {
      return { colors: [color1, color2], ratios: result.ratios, opacities: result.opacities };
    }

    // Try with white/black
    const avg = (r + g + b) / 3;
    const color1b = avg > 128 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
    const color2b = {
      r: (target.r * 2 - color1b.r + 256) % 256,
      g: (target.g * 2 - color1b.g + 256) % 256,
      b: (target.b * 2 - color1b.b + 256) % 256,
    };
    const result2 = solveWithOpacity(target, [color1b, color2b]);
    if (result2 && result2.ratios.every((r) => r >= 5)) {
      return { colors: [color1b, color2b], ratios: result2.ratios, opacities: result2.opacities };
    }
  }

  if (size === 3) {
    // Strategy: Use 2 fixed extreme colors, calculate the 3rd to hit target exactly
    // Color1 + Color2 = known, Color3 = calculated

    // Extreme pair options - ordered by visual contrast
    const extremePairs = [
      [
        { r: 255, g: 0, b: 255 },
        { r: 0, g: 255, b: 255 },
      ], // Magenta + Cyan (great for blues/purples)
      [
        { r: 255, g: 255, b: 0 },
        { r: 255, g: 0, b: 0 },
      ], // Yellow + Red (great for oranges/warm colors)
      [
        { r: 255, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
      ], // Yellow + Blue (classic complement)
      [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 255 },
      ], // Red + Cyan
      [
        { r: 0, g: 255, b: 0 },
        { r: 255, g: 0, b: 255 },
      ], // Green + Magenta
      [
        { r: 0, g: 255, b: 255 },
        { r: 255, g: 255, b: 0 },
      ], // Cyan + Yellow (great for greens/turquoise)
      [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
      ], // Red + Green
      [
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
      ], // Green + Blue
      [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 255 },
      ], // Red + Blue
      [
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 0, b: 0 },
      ], // White + Black (for grays and pastels)
    ];

    // Try each pair and calculate the 3rd color
    for (const [c1, c2] of extremePairs) {
      // Use equal ratios for c1 and c2, then calculate c3
      // target = r1 × c1 + r2 × c2 + r3 × c3, where r1 + r2 + r3 = 1
      // Let's try r1 = r2 = 0.3, r3 = 0.4
      // c3 = (target - 0.3×c1 - 0.3×c2) / 0.4

      for (const [r1, r2, r3] of [
        [0.3, 0.3, 0.4],
        [0.25, 0.25, 0.5],
        [0.2, 0.2, 0.6],
        [0.33, 0.34, 0.33],
        [0.4, 0.3, 0.3],
        [0.35, 0.35, 0.3],
        [0.15, 0.35, 0.5],
        [0.35, 0.15, 0.5],
        [0.4, 0.4, 0.2],
        [0.1, 0.4, 0.5],
        [0.4, 0.1, 0.5],
      ]) {
        const c3 = {
          r: Math.round((target.r - r1 * c1.r - r2 * c2.r) / r3),
          g: Math.round((target.g - r1 * c1.g - r2 * c2.g) / r3),
          b: Math.round((target.b - r1 * c1.b - r2 * c2.b) / r3),
        };

        // Check if c3 is valid (within 0-255)
        if (c3.r >= 0 && c3.r <= 255 && c3.g >= 0 && c3.g <= 255 && c3.b >= 0 && c3.b <= 255) {
          // Verify the mix
          const mixR = r1 * c1.r + r2 * c2.r + r3 * c3.r;
          const mixG = r1 * c1.g + r2 * c2.g + r3 * c3.g;
          const mixB = r1 * c1.b + r2 * c2.b + r3 * c3.b;
          const error = Math.sqrt(
            (target.r - mixR) ** 2 + (target.g - mixG) ** 2 + (target.b - mixB) ** 2,
          );

          if (error < 5) {
            // Check that c3 is visually different from c1 and c2
            const dist1 = colorDistance(c3, c1);
            const dist2 = colorDistance(c3, c2);

            if (dist1 > 100 && dist2 > 100) {
              return {
                colors: [c1, c2, c3],
                ratios: [Math.round(r1 * 100), Math.round(r2 * 100), Math.round(r3 * 100)],
                opacities: [100, 100, 100],
              };
            }
          }
        }
      }
    }

    // If no good pair found, try triads with solver
    const triads = [
      [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
      ],
      [
        { r: 255, g: 255, b: 0 },
        { r: 255, g: 0, b: 255 },
        { r: 0, g: 255, b: 255 },
      ],
    ];

    for (const triad of triads) {
      const result = solveWithOpacity(target, triad);
      if (result && result.ratios.every((r) => r >= 3)) {
        return { colors: triad, ratios: result.ratios, opacities: result.opacities };
      }
    }
  }

  if (size >= 4) {
    // 4+ colors: Use RGB + calculate 4th
    const c1 = { r: 255, g: 0, b: 0 };
    const c2 = { r: 0, g: 255, b: 0 };
    const c3 = { r: 0, g: 0, b: 255 };

    // Calculate c4 to balance to target with equal ratios
    const ratio = 0.25;
    const c4 = {
      r: Math.round((target.r - ratio * c1.r - ratio * c2.r - ratio * c3.r) / ratio),
      g: Math.round((target.g - ratio * c1.g - ratio * c2.g - ratio * c3.g) / ratio),
      b: Math.round((target.b - ratio * c1.b - ratio * c2.b - ratio * c3.b) / ratio),
    };

    if (c4.r >= 0 && c4.r <= 255 && c4.g >= 0 && c4.g <= 255 && c4.b >= 0 && c4.b <= 255) {
      const colors = [c1, c2, c3, c4];
      if (size >= 5) {
        colors.push({ r: 255, g: 255, b: 0 }); // Add yellow for 5th
        // Recalculate ratios
        const result = solveWithOpacity(target, colors);
        if (result) {
          return { colors, ratios: result.ratios, opacities: result.opacities };
        }
      }
      return {
        colors: colors.slice(0, size),
        ratios: Array(size).fill(Math.round(100 / size)),
        opacities: Array(size).fill(100),
      };
    }
  }

  return null;
}

/**
 * Solve for ratios that produce the target from given colors using
 * non-negative least squares (NNLS).
 *
 * For n=2: Direct closed-form solution
 * For n=3: Barycentric coordinates if inside triangle
 * For n>3: Iterative projection
 */
function solveWithOpacity(
  target: { r: number; g: number; b: number },
  colors: { r: number; g: number; b: number }[],
): { ratios: number[]; opacities: number[] } | null {
  const n = colors.length;
  const t = [target.r, target.g, target.b];

  if (n === 2) {
    // For 2 colors: target = α × c1 + (1-α) × c2
    // Solve for α using least squares
    const c1 = [colors[0].r, colors[0].g, colors[0].b];
    const c2 = [colors[1].r, colors[1].g, colors[1].b];

    // α = ((t - c2) · (c1 - c2)) / |c1 - c2|²
    let num = 0,
      den = 0;
    for (let i = 0; i < 3; i++) {
      num += (t[i] - c2[i]) * (c1[i] - c2[i]);
      den += (c1[i] - c2[i]) * (c1[i] - c2[i]);
    }

    if (den < 0.001) return null; // Colors too similar

    let alpha = num / den;
    alpha = Math.max(0, Math.min(1, alpha)); // Clamp to [0, 1]

    const ratio1 = Math.round(alpha * 100);
    const ratio2 = 100 - ratio1;

    if (ratio1 < 5 || ratio2 < 5) return null; // Need meaningful contribution from both

    // Verify solution
    const mixR = colors[0].r * (ratio1 / 100) + colors[1].r * (ratio2 / 100);
    const mixG = colors[0].g * (ratio1 / 100) + colors[1].g * (ratio2 / 100);
    const mixB = colors[0].b * (ratio1 / 100) + colors[1].b * (ratio2 / 100);
    const error = Math.sqrt((t[0] - mixR) ** 2 + (t[1] - mixG) ** 2 + (t[2] - mixB) ** 2);

    if (error < 15) {
      return { ratios: [ratio1, ratio2], opacities: [100, 100] };
    }
    return null;
  }

  if (n === 3) {
    // For 3 colors: Use barycentric coordinates
    // target = α × c1 + β × c2 + γ × c3, where α + β + γ = 1

    const c = colors.map((col) => [col.r, col.g, col.b]);

    // Set up system of equations using least squares
    // [c1-c3, c2-c3] × [α, β]ᵀ = t - c3
    const A = [
      [c[0][0] - c[2][0], c[1][0] - c[2][0]],
      [c[0][1] - c[2][1], c[1][1] - c[2][1]],
      [c[0][2] - c[2][2], c[1][2] - c[2][2]],
    ];
    const b = [t[0] - c[2][0], t[1] - c[2][1], t[2] - c[2][2]];

    // Solve using normal equations: AᵀA × x = Aᵀb
    const ATA = [
      [
        A[0][0] * A[0][0] + A[1][0] * A[1][0] + A[2][0] * A[2][0],
        A[0][0] * A[0][1] + A[1][0] * A[1][1] + A[2][0] * A[2][1],
      ],
      [
        A[0][1] * A[0][0] + A[1][1] * A[1][0] + A[2][1] * A[2][0],
        A[0][1] * A[0][1] + A[1][1] * A[1][1] + A[2][1] * A[2][1],
      ],
    ];
    const ATb = [
      A[0][0] * b[0] + A[1][0] * b[1] + A[2][0] * b[2],
      A[0][1] * b[0] + A[1][1] * b[1] + A[2][1] * b[2],
    ];

    // 2x2 matrix inverse
    const det = ATA[0][0] * ATA[1][1] - ATA[0][1] * ATA[1][0];
    if (Math.abs(det) < 0.001) return null; // Singular matrix

    let alpha = (ATA[1][1] * ATb[0] - ATA[0][1] * ATb[1]) / det;
    let beta = (-ATA[1][0] * ATb[0] + ATA[0][0] * ATb[1]) / det;
    let gamma = 1 - alpha - beta;

    // Clamp to simplex
    alpha = Math.max(0, Math.min(1, alpha));
    beta = Math.max(0, Math.min(1, beta));
    gamma = Math.max(0, Math.min(1, gamma));

    // Renormalize
    const sum = alpha + beta + gamma;
    alpha /= sum;
    beta /= sum;
    gamma /= sum;

    const ratios = [Math.round(alpha * 100), Math.round(beta * 100), Math.round(gamma * 100)];
    const rSum = ratios.reduce((a, b) => a + b, 0);
    if (rSum !== 100) {
      const maxIdx = ratios.indexOf(Math.max(...ratios));
      ratios[maxIdx] += 100 - rSum;
    }

    // Verify solution
    const mixR = colors.reduce((s, c, i) => s + c.r * (ratios[i] / 100), 0);
    const mixG = colors.reduce((s, c, i) => s + c.g * (ratios[i] / 100), 0);
    const mixB = colors.reduce((s, c, i) => s + c.b * (ratios[i] / 100), 0);
    const error = Math.sqrt((t[0] - mixR) ** 2 + (t[1] - mixG) ** 2 + (t[2] - mixB) ** 2);

    if (error < 15) {
      return { ratios, opacities: Array(n).fill(100) };
    }
    return null;
  }

  // For n > 3: Iterative approach
  const weights = Array(n).fill(1 / n);

  for (let iter = 0; iter < 1000; iter++) {
    const wSum = weights.reduce((a, b) => a + b, 0);
    let mixR = 0,
      mixG = 0,
      mixB = 0;
    for (let i = 0; i < n; i++) {
      const w = weights[i] / wSum;
      mixR += colors[i].r * w;
      mixG += colors[i].g * w;
      mixB += colors[i].b * w;
    }

    const errR = target.r - mixR;
    const errG = target.g - mixG;
    const errB = target.b - mixB;
    const error = Math.sqrt(errR ** 2 + errG ** 2 + errB ** 2);

    if (error < 10) {
      const ratios = weights.map((w) => Math.round((w / wSum) * 100));
      const rSum = ratios.reduce((a, b) => a + b, 0);
      if (rSum !== 100) {
        const maxIdx = ratios.indexOf(Math.max(...ratios));
        ratios[maxIdx] += 100 - rSum;
      }
      return { ratios, opacities: Array(n).fill(100) };
    }

    // Multiplicative update (like for NMF)
    for (let i = 0; i < n; i++) {
      const colorDotTarget =
        colors[i].r * target.r + colors[i].g * target.g + colors[i].b * target.b;
      const colorDotMix = colors[i].r * mixR + colors[i].g * mixG + colors[i].b * mixB;
      if (colorDotMix > 0.001) {
        weights[i] *= colorDotTarget / colorDotMix;
      }
      weights[i] = Math.max(0.001, weights[i]);
    }
  }

  return null;
}

/**
 * Solve for ratios that produce the target color from given base colors.
 * Uses closed-form solution when possible (RGB primary case).
 *
 * target = Σ(color[i] × ratio[i]) where Σ(ratio[i]) = 1
 */
function solveRatiosForTarget(
  target: { r: number; g: number; b: number },
  colors: { r: number; g: number; b: number }[],
): number[] | null {
  const n = colors.length;

  // Special case: RGB primaries - use direct mathematical solution
  // The mixing formula is: result[channel] = Σ(color[i][channel] × ratio[i])
  // For RGB primaries, each color only contributes to one channel:
  // R contributes to R channel: target.r = 255 × ratioR
  // G contributes to G channel: target.g = 255 × ratioG
  // B contributes to B channel: target.b = 255 × ratioB
  // So: ratioR = target.r/255, ratioG = target.g/255, ratioB = target.b/255
  // But we need ratios to sum to 1, so we normalize.
  if (n === 3) {
    const isRGB =
      colors.some((c) => c.r === 255 && c.g === 0 && c.b === 0) &&
      colors.some((c) => c.r === 0 && c.g === 255 && c.b === 0) &&
      colors.some((c) => c.r === 0 && c.g === 0 && c.b === 255);

    if (isRGB) {
      // For the weighted average formula:
      // result = Σ(color[i] × ratio[i]) where Σ(ratio[i]) = 1
      // We need: target.r = 255 × r_ratio, target.g = 255 × g_ratio, target.b = 255 × b_ratio
      // And: r_ratio + g_ratio + b_ratio = 1
      // This is only possible if target.r/255 + target.g/255 + target.b/255 = 1
      // i.e., target.r + target.g + target.b = 255

      // For general targets, we need a different approach
      // The mix formula normalizes, so we solve:
      // target = Σ(color[i] × ratio[i]) / Σ(ratio[i]) = Σ(color[i] × ratio[i])
      // (since Σ(ratio[i]) = 1)

      // Direct solution for RGB:
      // R(255,0,0), G(0,255,0), B(0,0,255)
      // target.r = 255 × rR, target.g = 255 × rG, target.b = 255 × rB
      // where rR + rG + rB = 1
      // This requires target.r + target.g + target.b = 255

      const channelSum = target.r + target.g + target.b;

      // For any target, we calculate the ideal ratio and check if it's achievable
      // Since the formula is a weighted average, the result must be within the convex hull
      // of the input colors. For RGB primaries, any color can be achieved!

      // Correct formula: For RGB primaries with weighted average,
      // the result is simply the weighted combination.
      // If target = (r, g, b), and we mix R, G, B with ratios (a, b, c) where a+b+c=1:
      // result = (255a, 255b, 255c)
      // So: a = r/255, b = g/255, c = b/255
      // But this only works if r + g + b = 255

      // For other cases, we need to accept that pure RGB can only make colors
      // where R+G+B = 255 (when using equal opacity and ratio sum = 1)

      // Actually, let's reconsider: The mixing formula IS weighted average
      // So if we have colors C1, C2, C3 with ratios r1, r2, r3 (sum=1):
      // Result = r1*C1 + r2*C2 + r3*C3
      // For RGB primaries: Result = (255*r1, 255*r2, 255*r3)
      // To get target (R, G, B): r1 = R/255, r2 = G/255, r3 = B/255
      // Sum = (R+G+B)/255 - this must equal 1, so R+G+B must = 255

      // For targets where R+G+B ≠ 255, we cannot use pure RGB primaries.
      // But we can use a different approach: use opacity to scale!

      // For now, only return if the constraint is met or close
      const tolerance = 0.2; // Allow 20% deviation, will be compensated by opacity or fallback
      const normalizedSum = channelSum / 255;

      if (normalizedSum > 0 && Math.abs(normalizedSum - 1) < tolerance) {
        // Scale to make sum = 1
        const scale = 1 / normalizedSum;
        const rawRatios = [
          (target.r / 255) * scale,
          (target.g / 255) * scale,
          (target.b / 255) * scale,
        ];

        const orderedRatios = colors.map((c) => {
          if (c.r === 255) return rawRatios[0];
          if (c.g === 255) return rawRatios[1];
          return rawRatios[2];
        });

        const percentRatios = orderedRatios.map((r) => Math.round(r * 100));
        const pSum = percentRatios.reduce((a, b) => a + b, 0);
        if (pSum !== 100) {
          const maxIdx = percentRatios.indexOf(Math.max(...percentRatios));
          percentRatios[maxIdx] += 100 - pSum;
        }

        if (percentRatios.every((r) => r >= 0)) {
          return percentRatios;
        }
      }

      return null; // RGB primaries can't achieve this target
    }
  }

  // General case: iterative solver
  const ratios = new Array(n).fill(1 / n);
  const lr = 0.0005;

  for (let iter = 0; iter < 500; iter++) {
    let mixR = 0,
      mixG = 0,
      mixB = 0;
    for (let i = 0; i < n; i++) {
      mixR += colors[i].r * ratios[i];
      mixG += colors[i].g * ratios[i];
      mixB += colors[i].b * ratios[i];
    }

    const errR = target.r - mixR;
    const errG = target.g - mixG;
    const errB = target.b - mixB;
    const error = Math.sqrt(errR ** 2 + errG ** 2 + errB ** 2);

    if (error < 3) {
      const percentRatios = ratios.map((r) => Math.round(r * 100));
      const sum = percentRatios.reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        const maxIdx = percentRatios.indexOf(Math.max(...percentRatios));
        percentRatios[maxIdx] += 100 - sum;
      }
      if (percentRatios.every((r) => r >= 0)) {
        return percentRatios;
      }
    }

    for (let i = 0; i < n; i++) {
      const grad = -(errR * colors[i].r + errG * colors[i].g + errB * colors[i].b);
      ratios[i] -= lr * grad;
      ratios[i] = Math.max(0, ratios[i]);
    }

    const sum = ratios.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      for (let i = 0; i < n; i++) {
        ratios[i] /= sum;
      }
    }
  }

  return null;
}

/**
 * Auto-decompose target color into component colors.
 * NEW: Uses extreme contrast colors for surprising/educational results.
 *
 * Key constraint: mixing all components at their ratios must reproduce the target color exactly.
 */
export function decomposeColor(
  targetHex: string,
  size: DecomposeSize,
  customRatios?: number[],
): ComponentColor[] {
  const target = hexToRgb(targetHex);
  const components: ComponentColor[] = [];

  // Try to find extreme decomposition first
  const extreme = findExtremeDecomposition(target, size);

  if (extreme) {
    // Use extreme colors with calculated ratios and opacities
    for (let i = 0; i < size; i++) {
      const color = extreme.colors[i];
      components.push({
        hex: rgbToHex(color.r, color.g, color.b),
        ratio: extreme.ratios[i],
        opacity: extreme.opacities[i],
      });
    }
  } else {
    // Fallback: Use complementary approach with maximum spread
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
    const w = ratios.map((r) => r / 100);

    // Use HSL to create spread colors
    const targetHsl = rgbToHsl(target.r, target.g, target.b);
    const hueStep = 360 / size;

    for (let i = 0; i < size - 1; i++) {
      // Spread hues around the wheel
      const newHue = (targetHsl.h + hueStep * i + 60) % 360;
      // Vary saturation and lightness for more contrast
      const newSat = Math.min(100, targetHsl.s + 30);
      const newLight =
        i % 2 === 0 ? Math.min(80, targetHsl.l + 20) : Math.max(20, targetHsl.l - 20);
      const rgb = hslToRgb(newHue, newSat, newLight);
      components.push({
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        ratio: ratios[i],
        opacity: 100,
      });
    }

    // Calculate last color to make exact target
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    for (let i = 0; i < size - 1; i++) {
      const rgb = hexToRgb(components[i].hex);
      sumR += rgb.r * w[i];
      sumG += rgb.g * w[i];
      sumB += rgb.b * w[i];
    }
    const lastColor = {
      r: Math.round((target.r - sumR) / w[size - 1]),
      g: Math.round((target.g - sumG) / w[size - 1]),
      b: Math.round((target.b - sumB) / w[size - 1]),
    };
    // Clamp
    lastColor.r = Math.max(0, Math.min(255, lastColor.r));
    lastColor.g = Math.max(0, Math.min(255, lastColor.g));
    lastColor.b = Math.max(0, Math.min(255, lastColor.b));

    components.push({
      hex: rgbToHex(lastColor.r, lastColor.g, lastColor.b),
      ratio: ratios[size - 1],
      opacity: 100,
    });
  }

  // Pad to 5 components
  while (components.length < 5) {
    components.push({ hex: '#808080', ratio: 0, opacity: 100 });
  }

  return components;
}

// ========================================
// Recalculate Unlocked Colors
// ========================================

/**
 * Check if a color is an extreme (black or white)
 */
function isExtremeColor(hex: string): 'black' | 'white' | null {
  const rgb = hexToRgb(hex);
  const brightness = (rgb.r + rgb.g + rgb.b) / 3;
  if (brightness <= 5) return 'black';
  if (brightness >= 250) return 'white';
  return null;
}

/**
 * Calculate optimal opacity for an extreme color to achieve target exactly.
 *
 * Mathematical derivation:
 * For mixed color formula: target = Σ(color[i] × weight[i]) / totalWeight
 * where weight[i] = ratio[i] × opacity[i]
 *
 * With one extreme color locked and others needing values in 0-255:
 * - Black (0,0,0): contributes nothing to RGB, only affects weight
 * - White (255,255,255): contributes max to all channels
 *
 * The key insight: when we have black locked, the unlocked colors need to produce
 * the target SCALED UP because black dilutes everything.
 *
 * For black with opacity B and unlocked colors at 100% opacity:
 * target = (0 × B × blackRatio + unlocked × 100 × unlockedRatio) / (B × blackRatio + 100 × unlockedRatio)
 *
 * Solving for unlocked:
 * unlocked = target × (B × blackRatio + 100 × unlockedRatio) / (100 × unlockedRatio)
 *
 * For unlocked ≤ 255:
 * target × (B × blackRatio + 100 × unlockedRatio) / (100 × unlockedRatio) ≤ 255
 * target × B × blackRatio + target × 100 × unlockedRatio ≤ 255 × 100 × unlockedRatio
 * target × B × blackRatio ≤ 100 × unlockedRatio × (255 - target)
 * B ≤ 100 × unlockedRatio × (255 - target) / (target × blackRatio)
 *
 * @param extremeType - 'black' or 'white'
 * @param target - Target RGB values
 * @param ratio - The ratio (0-100) of this component
 * @param otherRatioSum - Sum of ratios of other (unlocked) components
 * @returns Optimal opacity (1-100)
 */
function calculateOptimalExtremeOpacity(
  extremeType: 'black' | 'white',
  target: { r: number; g: number; b: number },
  ratio: number,
  otherRatioSum: number,
): number {
  if (extremeType === 'black') {
    const maxChannel = Math.max(target.r, target.g, target.b);
    if (maxChannel === 0) {
      // Target is pure black - black can be high opacity
      return 80;
    }
    if (maxChannel >= 255) {
      // Target is max brightness - black needs minimal opacity
      return 1;
    }

    // Calculate exact opacity to make unlocked = 255 (just at the edge)
    // B = 100 × otherRatioSum × (255 - maxChannel) / (maxChannel × ratio)
    const exactOpacity = (100 * otherRatioSum * (255 - maxChannel)) / (maxChannel * ratio);

    // Clamp to 1-80% (never 0 to maintain presence, cap at 80 to avoid overwhelming)
    return Math.max(1, Math.min(80, Math.round(exactOpacity)));
  }

  // White (255, 255, 255)
  // White contributes 255 to all channels. To achieve target T:
  // target = (255 × W × whiteRatio + unlocked × 100 × unlockedRatio) / (W × whiteRatio + 100 × unlockedRatio)
  //
  // For dark targets, we need unlocked to be 0 or near 0:
  // target × (W × whiteRatio + 100 × unlockedRatio) = 255 × W × whiteRatio + 0
  // target × W × whiteRatio + target × 100 × unlockedRatio = 255 × W × whiteRatio
  // target × 100 × unlockedRatio = W × whiteRatio × (255 - target)
  // W = target × 100 × unlockedRatio / (whiteRatio × (255 - target))

  const minChannel = Math.min(target.r, target.g, target.b);
  if (minChannel >= 255) {
    // Target is pure white - white can be high opacity
    return 80;
  }
  if (minChannel === 0) {
    // Target has 0 in some channel - white needs minimal opacity
    return 1;
  }

  // Calculate exact opacity to make unlocked = 0 for the darkest channel
  const exactOpacity = (minChannel * 100 * otherRatioSum) / (ratio * (255 - minChannel));

  return Math.max(1, Math.min(80, Math.round(exactOpacity)));
}

/**
 * Recalculate unlocked component colors to match the target color EXACTLY.
 *
 * KEY FEATURE: Uses opacity as an adjustable variable when not locked.
 * For extreme colors (black/white), automatically adjusts opacity to make
 * target color achievable mathematically.
 *
 * Mathematical approach:
 * 1. Detect extreme colors with unlocked opacity
 * 2. Calculate optimal opacity for extreme colors
 * 3. Solve for remaining unlocked colors
 *
 * Formula: target = Σ(color[i] × ratio[i] × opacity[i]) / Σ(ratio[i] × opacity[i])
 */
export function recalculateUnlockedColors(
  targetHex: string,
  components: ComponentColor[],
  size: DecomposeSize,
): ComponentColor[] {
  const target = hexToRgb(targetHex);
  const activeComponents = components.slice(0, size);
  const newComponents = [...components];

  // Calculate sum of unlocked hex ratios for opacity calculation
  const unlockedRatioSum = activeComponents
    .filter((comp) => !comp.lockedHex)
    .reduce((sum, comp) => sum + comp.ratio, 0);

  // Phase 1: Identify and adjust extreme colors with unlocked opacity
  for (let idx = 0; idx < activeComponents.length; idx++) {
    const comp = activeComponents[idx];
    if (!comp.lockedHex) continue; // Only process locked hex colors

    const extremeType = isExtremeColor(comp.hex);
    if (!extremeType) continue; // Not an extreme color

    // If opacity is not locked, we can adjust it
    if (!comp.lockedOpacity) {
      const optimalOpacity = calculateOptimalExtremeOpacity(
        extremeType,
        target,
        comp.ratio,
        unlockedRatioSum,
      );
      newComponents[idx] = {
        ...newComponents[idx],
        opacity: optimalOpacity,
      };
    }
  }

  // Phase 2: Recalculate unlocked hex colors with updated opacities
  const updatedActiveComponents = newComponents.slice(0, size);

  // Find indices where hex is locked vs unlocked
  const lockedHexIndices: number[] = [];
  const unlockedHexIndices: number[] = [];

  updatedActiveComponents.forEach((comp, idx) => {
    if (comp.lockedHex) {
      lockedHexIndices.push(idx);
    } else {
      unlockedHexIndices.push(idx);
    }
  });

  // If no unlocked hex, cannot recalculate colors
  if (unlockedHexIndices.length === 0) {
    return newComponents;
  }

  // Calculate total effective weight for normalization
  const totalWeight = updatedActiveComponents.reduce((sum, comp) => {
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    return sum + ratioWeight * opacityWeight;
  }, 0);

  if (totalWeight === 0) {
    return newComponents;
  }

  // Calculate contribution from locked hex colors (normalized)
  const lockedContribution: RGB = { r: 0, g: 0, b: 0 };
  for (const idx of lockedHexIndices) {
    const comp = updatedActiveComponents[idx];
    const rgb = hexToRgb(comp.hex);
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    const weight = (ratioWeight * opacityWeight) / totalWeight;
    lockedContribution.r += rgb.r * weight;
    lockedContribution.g += rgb.g * weight;
    lockedContribution.b += rgb.b * weight;
  }

  // Remaining that unlocked hex must produce: target - locked contribution
  const remaining: RGB = {
    r: target.r - lockedContribution.r,
    g: target.g - lockedContribution.g,
    b: target.b - lockedContribution.b,
  };

  // Get unlocked effective weights (ratio × opacity, normalized)
  const unlockedWeights = unlockedHexIndices.map((idx) => {
    const comp = updatedActiveComponents[idx];
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    return (ratioWeight * opacityWeight) / totalWeight;
  });
  const totalUnlockedWeight = unlockedWeights.reduce((sum, w) => sum + w, 0);

  if (totalUnlockedWeight === 0) {
    return newComponents;
  }

  // Phase 3: Check if solution is achievable, if not adjust unlocked opacities
  const requiredPerWeight: RGB = {
    r: remaining.r / totalUnlockedWeight,
    g: remaining.g / totalUnlockedWeight,
    b: remaining.b / totalUnlockedWeight,
  };

  // If required values are out of range, we need to adjust opacities
  const maxRequired = Math.max(requiredPerWeight.r, requiredPerWeight.g, requiredPerWeight.b);
  const minRequired = Math.min(requiredPerWeight.r, requiredPerWeight.g, requiredPerWeight.b);

  if (maxRequired > 255 || minRequired < 0) {
    // Need more contribution from unlocked colors - increase their opacity
    // Or add complementary extreme color if available
    for (let i = 0; i < unlockedHexIndices.length; i++) {
      const idx = unlockedHexIndices[i];
      const comp = updatedActiveComponents[idx];

      // If opacity is not locked, we can adjust it
      if (!comp.lockedOpacity) {
        // Increase opacity to allow more contribution
        const currentOpacity = comp.opacity ?? 100;
        const neededMultiplier = maxRequired > 255 ? maxRequired / 255 : 1;
        const newOpacity = Math.min(100, Math.round(currentOpacity * neededMultiplier));
        newComponents[idx] = {
          ...newComponents[idx],
          opacity: newOpacity,
        };
      }
    }

    // Recalculate with adjusted opacities
    return recalculateUnlockedColorsInner(targetHex, newComponents, size);
  }

  // Find exact solution where all unlocked colors are within 0-255
  const calculatedColors = findExactSolutionWithWeights(remaining, unlockedWeights);

  // Apply calculated colors to unlocked hex components
  for (let i = 0; i < unlockedHexIndices.length; i++) {
    const idx = unlockedHexIndices[i];
    const rgb = calculatedColors[i];
    newComponents[idx] = {
      ...newComponents[idx],
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
  }

  return newComponents;
}

/**
 * Inner recalculation after opacity adjustments (prevents infinite recursion)
 */
function recalculateUnlockedColorsInner(
  targetHex: string,
  components: ComponentColor[],
  size: DecomposeSize,
): ComponentColor[] {
  const target = hexToRgb(targetHex);
  const activeComponents = components.slice(0, size);
  const newComponents = [...components];

  const lockedHexIndices: number[] = [];
  const unlockedHexIndices: number[] = [];

  activeComponents.forEach((comp, idx) => {
    if (comp.lockedHex) {
      lockedHexIndices.push(idx);
    } else {
      unlockedHexIndices.push(idx);
    }
  });

  if (unlockedHexIndices.length === 0) {
    return newComponents;
  }

  const totalWeight = activeComponents.reduce((sum, comp) => {
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    return sum + ratioWeight * opacityWeight;
  }, 0);

  if (totalWeight === 0) {
    return newComponents;
  }

  const lockedContribution: RGB = { r: 0, g: 0, b: 0 };
  for (const idx of lockedHexIndices) {
    const comp = activeComponents[idx];
    const rgb = hexToRgb(comp.hex);
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    const weight = (ratioWeight * opacityWeight) / totalWeight;
    lockedContribution.r += rgb.r * weight;
    lockedContribution.g += rgb.g * weight;
    lockedContribution.b += rgb.b * weight;
  }

  const remaining: RGB = {
    r: target.r - lockedContribution.r,
    g: target.g - lockedContribution.g,
    b: target.b - lockedContribution.b,
  };

  const unlockedWeights = unlockedHexIndices.map((idx) => {
    const comp = activeComponents[idx];
    const ratioWeight = comp.ratio / 100;
    const opacityWeight = (comp.opacity ?? 100) / 100;
    return (ratioWeight * opacityWeight) / totalWeight;
  });
  const totalUnlockedWeight = unlockedWeights.reduce((sum, w) => sum + w, 0);

  if (totalUnlockedWeight === 0) {
    return newComponents;
  }

  const calculatedColors = findExactSolutionWithWeights(remaining, unlockedWeights);

  for (let i = 0; i < unlockedHexIndices.length; i++) {
    const idx = unlockedHexIndices[i];
    const rgb = calculatedColors[i];
    newComponents[idx] = {
      ...newComponents[idx],
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    };
  }

  return newComponents;
}

/**
 * Find exact RGB values for unlocked colors that sum to remaining.
 *
 * Strategy: Start with uniform distribution, then adjust to stay in 0-255.
 * With N unlocked colors, we have N degrees of freedom per channel.
 *
 * @param remaining - The RGB values that unlocked colors must produce together
 * @param weights - Normalized weights (ratio × opacity / totalWeight) for each unlocked color
 */
function findExactSolutionWithWeights(remaining: RGB, weights: number[]): RGB[] {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // For each channel, find valid color values
  const rValues = solveChannelWithWeights(remaining.r, weights, totalWeight);
  const gValues = solveChannelWithWeights(remaining.g, weights, totalWeight);
  const bValues = solveChannelWithWeights(remaining.b, weights, totalWeight);

  return weights.map((_, i) => ({
    r: Math.round(rValues[i]),
    g: Math.round(gValues[i]),
    b: Math.round(bValues[i]),
  }));
}

/**
 * Solve for one channel: find values v[i] such that Σ(v[i] × weight[i]) = target
 * and all v[i] are in [0, 255].
 *
 * @param target - The target value for this channel
 * @param weights - Normalized weights for each color
 * @param totalWeight - Sum of all weights
 */
function solveChannelWithWeights(target: number, weights: number[], totalWeight: number): number[] {
  const n = weights.length;

  // Initial: uniform distribution (all same value)
  // If all colors have same value V: Σ(V × w[i]) = V × totalWeight = target
  // So V = target / totalWeight
  const uniformValue = totalWeight > 0 ? target / totalWeight : 0;

  // If uniform value is in range, we're done
  if (uniformValue >= 0 && uniformValue <= 255) {
    return new Array(n).fill(uniformValue);
  }

  // Need to redistribute: some colors at boundary, others compensate
  const values = new Array(n).fill(uniformValue);
  const fixed = new Array(n).fill(false); // true = clamped to boundary

  // Iteratively fix out-of-range values and redistribute
  for (let iter = 0; iter < n; iter++) {
    let overflow = 0;
    let unfixedWeightSum = 0;

    // Clamp and calculate overflow
    for (let i = 0; i < n; i++) {
      if (fixed[i]) continue;

      if (values[i] < 0) {
        overflow += values[i] * weights[i]; // negative
        values[i] = 0;
        fixed[i] = true;
      } else if (values[i] > 255) {
        overflow += (values[i] - 255) * weights[i]; // positive
        values[i] = 255;
        fixed[i] = true;
      } else {
        unfixedWeightSum += weights[i];
      }
    }

    // No overflow or no unfixed colors - done
    if (Math.abs(overflow) < 0.0001 || unfixedWeightSum < 0.0001) {
      break;
    }

    // Redistribute overflow to unfixed colors
    for (let i = 0; i < n; i++) {
      if (fixed[i]) continue;
      // Each unfixed color absorbs: overflow × (its_weight / unfixed_total) / its_weight
      // = overflow / unfixed_total
      values[i] += overflow / unfixedWeightSum;
    }
  }

  // Final clamp (safety)
  return values.map((v) => Math.max(0, Math.min(255, v)));
}
