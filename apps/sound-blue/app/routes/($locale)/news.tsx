import { BreadcrumbStructuredData } from '@soundblue/seo';
import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'News | Sound Blue' },
  { name: 'description', content: 'Latest news and updates from Sound Blue.' },
  {
    name: 'keywords',
    content:
      'Sound Blue news, music updates, new releases, artist announcements, 사운드블루 뉴스, 음악 소식, 신곡 발표',
  },
  ...getSeoMeta(location),
];

export default function News() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://soundbluemusic.com' },
          { name: 'News', url: 'https://soundbluemusic.com/news' },
        ]}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['news.title']()}</h1>
        <p className="text-content-muted">{m['news.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
