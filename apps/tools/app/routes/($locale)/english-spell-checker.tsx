import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'English Spell Checker - Tools' },
  {
    name: 'description',
    content:
      'English spell checker - Check spelling with suggestions. Free browser-based offline utility powered by Hunspell.',
  },
  ...getSeoMeta(location),
];

export default function EnglishSpellCheckerPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('englishSpellChecker');
  }, [openTool]);

  return <MainLayout />;
}
