import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';

export const Route = createFileRoute('/ko/privacy')({
  head: () => ({
    meta: [
      { title: '개인정보처리방침 | Sound Blue' },
      { name: 'description', content: 'Sound Blue의 개인정보처리방침입니다.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/privacy' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/privacy' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/privacy' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/privacy' },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{m['privacy.title']()}</h1>
        <h2>{m['privacy.sections.collection.title']()}</h2>
        <p>{m['privacy.sections.collection.content']()}</p>
        <h2>{m['privacy.sections.cookies.title']()}</h2>
        <p>{m['privacy.sections.cookies.content']()}</p>
        <h2>{m['privacy.sections.thirdParty.title']()}</h2>
        <p>{m['privacy.sections.thirdParty.content']()}</p>
        <h2>{m['privacy.sections.contact.title']()}</h2>
        <p>{m['privacy.sections.contact.content']()}</p>
      </div>
    </NavigationLayout>
  );
}
