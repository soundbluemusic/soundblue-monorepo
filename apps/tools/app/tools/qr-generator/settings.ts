// QR Generator Settings

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
