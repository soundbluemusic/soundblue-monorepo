import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';

export const Route = createFileRoute('/ko/license')({
  head: () => ({
    meta: [
      { title: '라이선스 | Sound Blue' },
      { name: 'description', content: '음원 라이선스 정보입니다.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/license' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/license' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/license' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/license' },
    ],
  }),
  component: License,
});

function License() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{m['license_title']?.()}</h1>
        <h2>{m['license_soundRecording_title']?.()}</h2>
        <p>{m['license_soundRecording_description']?.()}</p>
        <h3>{m['license_soundRecording_permitted_title']?.()}</h3>
        <ul>
          {(getRawMessage('license_soundRecording_permitted_items') as string[])?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <h3>{m['license_soundRecording_prohibited_title']?.()}</h3>
        <ul>
          {(getRawMessage('license_soundRecording_prohibited_items') as string[])?.map(
            (item, i) => (
              <li key={i}>{item}</li>
            ),
          )}
        </ul>
      </div>
    </NavigationLayout>
  );
}
