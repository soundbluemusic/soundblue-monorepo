import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Translator - Tools' },
  {
    name: 'description',
    content: 'Korean ↔ English algorithm-based translator - Free browser-based utility.',
  },
  ...getSeoMeta(location),
];

export default function TranslatorPage() {
  return <MainLayout defaultTool="translator" />;
}
