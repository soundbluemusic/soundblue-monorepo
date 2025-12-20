import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout/MainLayout';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = () => [
  { title: 'Translator - Tools' },
  {
    name: 'description',
    content: 'Korean ↔ English dictionary-based translator - Free browser-based utility.',
  },
];

export default function TranslatorPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('translator');
  }, [openTool]);

  return <MainLayout />;
}
