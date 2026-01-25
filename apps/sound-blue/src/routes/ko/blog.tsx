import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { AudioLines, Gauge, GraduationCap, Mic, Music, Puzzle, Sliders, Star } from 'lucide-react';
import { NavigationLayout } from '~/components/layout';
import { blogCategories, getCategoryColor } from '~/data/blog-categories';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/blog')({
  head: () => ({
    meta: [
      { title: '블로그 | Sound Blue' },
      { name: 'description', content: 'Sound Blue의 블로그입니다.' },
      {
        name: 'keywords',
        content:
          '사운드블루 블로그, 음악 블로그, 음악 제작 팁, Sound Blue blog, music blog, artist news',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/blog' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/blog' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/blog' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/blog' },
    ],
  }),
  component: Blog,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Sliders,
  Gauge,
  AudioLines,
  Puzzle,
  Mic,
  Music,
  GraduationCap,
  Star,
};

function Blog() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: '홈', url: 'https://soundbluemusic.com/ko' },
          { name: '블로그', url: 'https://soundbluemusic.com/ko/blog' },
        ]}
      />
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-3xl font-bold">{m['blog.title']()}</h1>
        <p className="mb-8 text-content-muted">{m['blog.description']()}</p>

        {/* Categories */}
        <h2 className="mb-4 text-xl font-semibold">{m['blog.categories']()}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {blogCategories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <div
                key={category.id}
                className={`rounded-lg border p-4 transition-colors hover:bg-surface-hover ${getCategoryColor(category.color)}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {Icon && <Icon className="h-5 w-5" />}
                  <span className="font-medium">{category.name.ko}</span>
                </div>
                <p className="text-sm opacity-80">{category.description.ko}</p>
              </div>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 rounded-lg border border-dashed border-border-default p-8 text-center">
          <p className="text-content-muted">{m['blog.comingSoon']()}</p>
        </div>
      </div>
    </NavigationLayout>
  );
}
