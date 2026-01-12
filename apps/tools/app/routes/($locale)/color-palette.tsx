import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Color Palette Generator - Tools' },
  {
    name: 'description',
    content:
      'Generate beautiful color palettes - complementary, analogous, triadic, and monochromatic schemes.',
  },
  ...getSeoMeta(location),
];

export default function ColorPalettePage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('colorPalette');
  }, [openTool]);

  return <MainLayout />;
}
