import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { generateSeoMeta } from '~/lib/seo';

export const Route = createFileRoute('/blog')({
  head: () => ({
    meta: [
      { title: 'Blog | Sound Blue' },
      { name: 'description', content: "Sound Blue's blog." },
      {
        name: 'keywords',
        content:
          'Sound Blue blog, music blog, artist news, music production tips, indie music insights, 사운드블루 블로그, 음악 블로그, 음악 제작 팁',
      },
      ...generateSeoMeta('/blog'),
    ],
  }),
  component: Blog,
});

function Blog() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://soundbluemusic.com' },
          { name: 'Blog', url: 'https://soundbluemusic.com/blog' },
        ]}
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{m['blog.title']()}</h1>
        <p className="text-content-muted">{m['blog.comingSoon']()}</p>
      </div>
    </NavigationLayout>
  );
}
