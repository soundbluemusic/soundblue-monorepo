import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ params }) => [
  { title: 'Sound Recording | Sound Blue' },
  { name: 'description', content: 'Field recording library by Sound Blue.' },
  ...getSeoMeta('/sound-recording', params),
];

export default function SoundRecording() {
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
