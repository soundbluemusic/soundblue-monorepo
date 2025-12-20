import type { MetaFunction } from 'react-router';
import { Translator as TranslatorComponent } from '~/tools/translator';

export const meta: MetaFunction = () => [
  { title: '번역기 | Tools' },
  { name: 'description', content: '한국어 ↔ 영어 사전 기반 번역기 - 무료 브라우저 기반 유틸리티.' },
];

export default function TranslatorKo() {
  return (
    <div className="min-h-screen">
      <TranslatorComponent />
    </div>
  );
}
