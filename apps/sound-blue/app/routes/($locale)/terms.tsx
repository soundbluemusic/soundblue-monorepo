import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ params }) => [
  { title: 'Terms of Service | Sound Blue' },
  {
    name: 'description',
    content: 'Terms and conditions for using Sound Blue website and services.',
  },
  ...getSeoMeta('/terms', params),
];

export default function Terms() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6 prose">
        <h1>{m['terms.title']()}</h1>
        <h2>{m['terms.sections.use.title']()}</h2>
        <p>{m['terms.sections.use.content']()}</p>
        <h2>{m['terms.sections.copyright.title']()}</h2>
        <p>{m['terms.sections.copyright.content']()}</p>
        <h2>{m['terms.sections.disclaimer.title']()}</h2>
        <p>{m['terms.sections.disclaimer.content']()}</p>
        <h2>{m['terms.sections.changes.title']()}</h2>
        <p>{m['terms.sections.changes.content']()}</p>
      </div>
    </NavigationLayout>
  );
}
