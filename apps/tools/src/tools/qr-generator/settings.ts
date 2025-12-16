// QR Generator Settings - Separated for testing
// QR 생성기 설정 - 테스트를 위해 분리

export interface QRSettings {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

// Alias for backward compatibility
export type QRGeneratorSettings = QRSettings;

export const defaultQRSettings: QRSettings = {
  text: 'https://tools.soundbluemusic.com',
  size: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrection: 'M',
};

export const qrGeneratorMeta = {
  id: 'qr-generator',
  name: {
    ko: 'QR 생성기',
    en: 'QR Generator',
  },
  description: {
    ko: 'URL이나 텍스트를 QR 코드로 변환',
    en: 'Convert URL or text to QR code',
  },
  icon: '📱',
  category: 'productivity' as const,
  defaultSize: 'md' as const,
  minSize: { width: 200, height: 280 },
  tags: ['qr', 'code', 'url', 'share'],
};
