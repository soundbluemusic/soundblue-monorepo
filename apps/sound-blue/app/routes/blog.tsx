import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: 'Blog | Sound Blue' },
  { name: 'description', content: "Sound Blue's blog." },
];

export default function Blog() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['blog.title']()}</h1>
        <p className="text-content-muted">{m['blog.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
