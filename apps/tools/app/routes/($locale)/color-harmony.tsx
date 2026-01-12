import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Color Harmony - Tools' },
  {
    name: 'description',
    content:
      'Generate harmonious color schemes based on color wheel theory - complementary, analogous, triadic, and monochromatic.',
  },
  ...getSeoMeta(location),
];

export default function ColorHarmonyPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('colorHarmony');
  }, [openTool]);

  return <MainLayout />;
}
