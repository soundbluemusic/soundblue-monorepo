import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: 'Privacy Policy | Sound Blue' },
  { name: 'description', content: "Sound Blue's privacy policy." },
];

export default function Privacy() {
  
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
