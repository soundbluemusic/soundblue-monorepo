import type { MetaFunction } from 'react-router';
import { Translator as TranslatorComponent } from '~/tools/translator';

export const meta: MetaFunction = () => [
  { title: 'Translator | Tools' },
  {
    name: 'description',
    content: 'Korean ↔ English dictionary-based translator - Free browser-based utility.',
  },
];

export default function TranslatorPage() {
  return (
    <div className="min-h-screen">
      <TranslatorComponent />
    </div>
  );
}
