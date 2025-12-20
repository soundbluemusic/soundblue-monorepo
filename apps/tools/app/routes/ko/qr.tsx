import type { MetaFunction } from 'react-router';
import { QRGenerator as QRGeneratorComponent } from '~/tools/qr-generator';

export const meta: MetaFunction = () => [
  { title: 'QR 생성기 | Tools' },
  { name: 'description', content: 'QR 코드 생성기 - 무료 브라우저 기반 유틸리티.' },
];

export default function QRGeneratorKo() {
  return (
    <div className="min-h-screen">
      <QRGeneratorComponent />
    </div>
  );
}
