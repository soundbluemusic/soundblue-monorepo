/**
 * Tools App - Color Converters Tests
 * Tests for color conversion utilities
 */
import { describe, expect, it } from 'vitest';
import {
  colorDistance,
  generateRandomColor,
  hexToColorInfo,
  hexToRgb,
  hslToRgb,
  isExtremeColor,
  rgbToHex,
  rgbToHsl,
} from '../color-converters';

describe('color-converters', () => {
  describe('hexToRgb', () => {
    it('should convert black', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert white', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert red', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert green', () => {
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert blue', () => {
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle hex without #', () => {
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle uppercase hex', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return black for invalid hex', () => {
      expect(hexToRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert arbitrary color', () => {
      expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert black', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should convert white', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('should convert red', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    it('should convert green', () => {
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    });

    it('should convert blue', () => {
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });

    it('should handle decimal values by rounding', () => {
      // Math.round: 127.6 → 128 (0x80), 127.4 → 127 (0x7f), 127.5 → 128 (0x80)
      expect(rgbToHex(127.6, 127.4, 127.5)).toBe('#807f80');
    });

    it('should pad single digit values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
    });
  });

  describe('rgbToHsl', () => {
    it('should convert black', () => {
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
    });

    it('should convert white', () => {
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
    });

    it('should convert pure red', () => {
      const hsl = rgbToHsl(255, 0, 0);
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert pure green', () => {
      const hsl = rgbToHsl(0, 255, 0);
      expect(hsl.h).toBe(120);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert pure blue', () => {
      const hsl = rgbToHsl(0, 0, 255);
      expect(hsl.h).toBe(240);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it('should convert gray', () => {
      const hsl = rgbToHsl(128, 128, 128);
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
      expect(hsl.l).toBe(50);
    });
  });

  describe('hslToRgb', () => {
    it('should convert black', () => {
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert white', () => {
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert pure red', () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert pure green', () => {
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert pure blue', () => {
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should convert gray (zero saturation)', () => {
      const rgb = hslToRgb(180, 0, 50);
      expect(rgb.r).toBeCloseTo(128, 0);
      expect(rgb.g).toBeCloseTo(128, 0);
      expect(rgb.b).toBeCloseTo(128, 0);
    });

    it('should handle yellow (h=60)', () => {
      expect(hslToRgb(60, 100, 50)).toEqual({ r: 255, g: 255, b: 0 });
    });

    it('should handle cyan (h=180)', () => {
      expect(hslToRgb(180, 100, 50)).toEqual({ r: 0, g: 255, b: 255 });
    });

    it('should handle magenta (h=300)', () => {
      expect(hslToRgb(300, 100, 50)).toEqual({ r: 255, g: 0, b: 255 });
    });
  });

  describe('hexToColorInfo', () => {
    it('should return complete color info', () => {
      const info = hexToColorInfo('#ff0000');

      expect(info.hex).toBe('#FF0000');
      expect(info.rgb).toEqual({ r: 255, g: 0, b: 0 });
      expect(info.hsl).toEqual({ h: 0, s: 100, l: 50 });
    });

    it('should uppercase hex in output', () => {
      const info = hexToColorInfo('#abc');
      expect(info.hex).toBe(info.hex.toUpperCase());
    });
  });

  describe('generateRandomColor', () => {
    it('should return valid hex color', () => {
      const color = generateRandomColor();

      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should generate different colors', () => {
      const colors = new Set();
      for (let i = 0; i < 100; i++) {
        colors.add(generateRandomColor());
      }
      // Most should be unique (statistically)
      expect(colors.size).toBeGreaterThan(90);
    });
  });

  describe('colorDistance', () => {
    it('should return 0 for same color', () => {
      const c = { r: 100, g: 100, b: 100 };
      expect(colorDistance(c, c)).toBe(0);
    });

    it('should calculate distance between black and white', () => {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      const distance = colorDistance(black, white);

      // sqrt(255^2 * 3) ≈ 441.67
      expect(distance).toBeCloseTo(441.67, 1);
    });

    it('should be symmetric', () => {
      const c1 = { r: 100, g: 50, b: 200 };
      const c2 = { r: 50, g: 100, b: 150 };

      expect(colorDistance(c1, c2)).toBe(colorDistance(c2, c1));
    });

    it('should return larger distance for more different colors', () => {
      const red = { r: 255, g: 0, b: 0 };
      const darkRed = { r: 200, g: 0, b: 0 };
      const blue = { r: 0, g: 0, b: 255 };

      expect(colorDistance(red, darkRed)).toBeLessThan(colorDistance(red, blue));
    });
  });

  describe('isExtremeColor', () => {
    it('should detect black', () => {
      expect(isExtremeColor('#000000')).toBe('black');
    });

    it('should detect near-black', () => {
      expect(isExtremeColor('#050505')).toBe('black');
    });

    it('should detect white', () => {
      expect(isExtremeColor('#ffffff')).toBe('white');
    });

    it('should detect near-white', () => {
      expect(isExtremeColor('#fafafa')).toBe('white');
    });

    it('should return null for mid-range colors', () => {
      expect(isExtremeColor('#808080')).toBe(null);
      expect(isExtremeColor('#ff0000')).toBe(null);
      expect(isExtremeColor('#3b82f6')).toBe(null);
    });
  });

  describe('roundtrip conversions', () => {
    it('should preserve color through hex -> rgb -> hex', () => {
      const original = '#3b82f6';
      const rgb = hexToRgb(original);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      expect(hex).toBe(original);
    });

    it('should approximately preserve color through rgb -> hsl -> rgb', () => {
      const original = { r: 100, g: 150, b: 200 };
      const hsl = rgbToHsl(original.r, original.g, original.b);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

      // Allow rounding differences (HSL conversion can have precision loss)
      expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(2);
    });
  });
});
