import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';
import { generateSeoMeta } from '~/lib/seo';

export const Route = createFileRoute('/sound-recording')({
  head: () => ({
    meta: [
      { title: 'Sound Recording | Sound Blue' },
      { name: 'description', content: 'Field recording library by Sound Blue.' },
      ...generateSeoMeta('/sound-recording'),
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
