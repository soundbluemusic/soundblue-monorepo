import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { LazyMainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Translator - Tools' },
  {
    name: 'description',
    content: 'Korean ↔ English algorithm-based translator - Free browser-based utility.',
  },
  ...getSeoMeta(location),
];

export default function TranslatorPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('translator');
  }, [openTool]);

  return <LazyMainLayout />;
}
