import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: 'License | Sound Blue' },
  { name: 'description', content: 'Sound recording license information.' },
  ...getSeoMeta(location),
];

export default function License() {
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
