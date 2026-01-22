import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
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

function Blog() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: '홈', url: 'https://soundbluemusic.com/ko' },
          { name: '블로그', url: 'https://soundbluemusic.com/ko/blog' },
        ]}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['blog.title']()}</h1>
        <p className="text-content-muted">{m['blog.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
