import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/color-palette')({
  head: () => ({
    meta: [
      { title: 'Color Palette - Tools' },
      {
        name: 'description',
        content: 'Create and manage custom color palettes for your projects',
      },
      {
        name: 'keywords',
        content: 'color palette, palette generator, color scheme, design colors, brand colors',
      },
    ],
  }),
  component: ColorPalettePage,
});

function ColorPalettePage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Color Palette',
            url: 'https://tools.soundbluemusic.com/color-palette',
          },
        ]}
      />
      <MainLayout defaultTool="colorPalette" />
    </>
  );
}
