import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/color-decomposer')({
  head: () => ({
    meta: [
      { title: 'Color Decomposer - Tools' },
      {
        name: 'description',
        content: 'Decompose and analyze colors into RGB, HSL, and other color spaces',
      },
      {
        name: 'keywords',
        content:
          'color decomposer, color analyzer, rgb, hsl, hex, color converter, color breakdown',
      },
    ],
  }),
  component: ColorDecomposerPage,
});

function ColorDecomposerPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Color Decomposer',
            url: 'https://tools.soundbluemusic.com/color-decomposer',
          },
        ]}
      />
      <MainLayout defaultTool="colorDecomposer" />
    </>
  );
}
