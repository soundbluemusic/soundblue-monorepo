import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Korean Spell Checker - Tools' },
  {
    name: 'description',
    content:
      'Korean spell checker - Check spelling, spacing, and grammar. Free browser-based utility.',
  },
  ...getSeoMeta(location),
];

export default function SpellCheckerPage() {
  return <MainLayout defaultTool="spellChecker" />;
}
