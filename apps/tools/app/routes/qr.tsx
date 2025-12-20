import type { MetaFunction } from 'react-router';
import { QRGenerator as QRGeneratorComponent } from '~/tools/qr-generator';

export const meta: MetaFunction = () => [
  { title: 'QR Generator | Tools' },
  { name: 'description', content: 'QR Code Generator - Free browser-based utility.' },
];

export default function QRGeneratorPage() {
  return (
    <div className="min-h-screen">
      <QRGeneratorComponent />
    </div>
  );
}
