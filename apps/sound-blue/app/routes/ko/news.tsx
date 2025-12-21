import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: '뉴스 | Sound Blue' },
  { name: 'description', content: 'Sound Blue의 최신 뉴스와 업데이트.' },
];

export default function NewsKo() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['news.title']()}</h1>
        <p className="text-content-muted">{m['news.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
