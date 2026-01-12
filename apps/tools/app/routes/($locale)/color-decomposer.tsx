import { useEffect } from 'react';
import type { MetaFunction } from 'react-router';
import { MainLayout } from '~/components/layout';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'Color Decomposer - Tools' },
  {
    name: 'description',
    content:
      'Learn color mixing by decomposing colors into components. Adjust ratio sliders to see how colors blend together.',
  },
  ...getSeoMeta(location),
];

export default function ColorDecomposerPage() {
  const { openTool } = useToolStore();

  useEffect(() => {
    openTool('colorDecomposer');
  }, [openTool]);

  return <MainLayout />;
}
