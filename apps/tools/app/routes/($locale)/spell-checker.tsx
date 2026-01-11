import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

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
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('spellChecker');
  }, [openTool]);

  return <MainLayout />;
}
