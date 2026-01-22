import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '~/components/layout';

export const Route = createFileRoute('/color-harmony')({
  head: () => ({
    meta: [
      { title: 'Color Harmony - Tools' },
      {
        name: 'description',
        content: 'Color wheel and harmony generator for creating beautiful color combinations',
      },
      {
        name: 'keywords',
        content:
          'color harmony, color wheel, complementary colors, analogous colors, triadic colors, color scheme',
      },
    ],
  }),
  component: ColorHarmonyPage,
});

function ColorHarmonyPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          {
            name: 'Color Harmony',
            url: 'https://tools.soundbluemusic.com/color-harmony',
          },
        ]}
      />
      <MainLayout defaultTool="colorHarmony" />
    </>
  );
}
