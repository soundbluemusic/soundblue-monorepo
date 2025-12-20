import { describe, expect, it } from 'vitest';
import { defaultQRSettings, qrGeneratorMeta } from './settings';

describe('QR Generator Tool', () => {
  describe('defaultQRSettings', () => {
    it('should have correct default text', () => {
      expect(defaultQRSettings.text).toBe('https://tools.soundbluemusic.com');
    });

    it('should have correct default size', () => {
      expect(defaultQRSettings.size).toBe(256);
    });

    it('should have correct default colors', () => {
      expect(defaultQRSettings.foregroundColor).toBe('#000000');
      expect(defaultQRSettings.backgroundColor).toBe('#ffffff');
    });

    it('should have correct default error correction level', () => {
      expect(defaultQRSettings.errorCorrection).toBe('M');
    });
  });

  describe('qrGeneratorMeta', () => {
    it('should have correct meta id', () => {
      expect(qrGeneratorMeta.id).toBe('qr-generator');
    });

    it('should have bilingual name', () => {
      expect(qrGeneratorMeta.name.ko).toBe('QR 생성기');
      expect(qrGeneratorMeta.name.en).toBe('QR Generator');
    });

    it('should have bilingual description', () => {
      expect(qrGeneratorMeta.description.ko).toBeDefined();
      expect(qrGeneratorMeta.description.en).toBeDefined();
    });

    it('should have correct icon', () => {
      expect(qrGeneratorMeta.icon).toBe('📱');
    });

    it('should be in productivity category', () => {
      expect(qrGeneratorMeta.category).toBe('productivity');
    });

    it('should have correct default size', () => {
      expect(qrGeneratorMeta.defaultSize).toBe('md');
    });

    it('should have minimum size constraints', () => {
      expect(qrGeneratorMeta.minSize).toEqual({ width: 200, height: 280 });
    });

    it('should have search tags', () => {
      expect(qrGeneratorMeta.tags).toContain('qr');
      expect(qrGeneratorMeta.tags).toContain('code');
      expect(qrGeneratorMeta.tags).toContain('url');
    });
  });

  describe('QR Settings types', () => {
    it('should allow valid error correction levels', () => {
      const validLevels: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
      validLevels.forEach((level) => {
        const settings = { ...defaultQRSettings, errorCorrection: level };
        expect(settings.errorCorrection).toBe(level);
      });
    });

    it('should allow custom text', () => {
      const settings = { ...defaultQRSettings, text: 'Custom URL' };
      expect(settings.text).toBe('Custom URL');
    });

    it('should allow custom size', () => {
      const settings = { ...defaultQRSettings, size: 512 };
      expect(settings.size).toBe(512);
    });
  });
});
