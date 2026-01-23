import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';

export const Route = createFileRoute('/ko/sound-recording')({
  head: () => ({
    meta: [
      { title: '음원 녹음 | Sound Blue' },
      { name: 'description', content: 'Sound Blue의 필드 레코딩 라이브러리입니다.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/sound-recording' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/sound-recording' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/sound-recording' },
      {
        rel: 'alternate',
        hrefLang: 'x-default',
        href: 'https://soundbluemusic.com/sound-recording',
      },
    ],
  }),
  component: SoundRecording,
});

function SoundRecording() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{m['soundRecording_title']?.()}</h1>
        <p className="text-lg">{m['soundRecording_intro']?.()}</p>
        <h2>{m['soundRecording_about_title']?.()}</h2>
        <p>{m['soundRecording_about_content']?.()}</p>
        <h2>{m['soundRecording_types_title']?.()}</h2>
        <ul>
          {(getRawMessage('soundRecording_types_items') as string[])?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <h2>{m['soundRecording_downloads_title']?.()}</h2>
        <p>{m['soundRecording_downloads_content']?.()}</p>
      </div>
    </NavigationLayout>
  );
}
