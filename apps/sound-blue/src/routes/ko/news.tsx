import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/news')({
  head: () => ({
    meta: [
      { title: '뉴스 | Sound Blue' },
      { name: 'description', content: 'Sound Blue의 최신 뉴스와 업데이트입니다.' },
      {
        name: 'keywords',
        content:
          '사운드블루 뉴스, 음악 소식, 신곡 발표, Sound Blue news, music updates, new releases',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/news' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/news' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/news' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/news' },
    ],
  }),
  component: News,
});

function News() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: '홈', url: 'https://soundbluemusic.com/ko' },
          { name: '뉴스', url: 'https://soundbluemusic.com/ko/news' },
        ]}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['news.title']()}</h1>
        <p className="text-content-muted">{m['news.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
