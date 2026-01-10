/**
 * QR Generator Settings
 *
 * Local copy of settings to avoid loading the entire @soundblue/ui-components bundle.
 * Keep in sync with packages/ui/components/src/composite/tool/qr-generator/settings.ts
 */

export interface QRSettings {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export const defaultQRSettings: QRSettings = {
  text: 'https://tools.soundbluemusic.com',
  size: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrection: 'M',
};
