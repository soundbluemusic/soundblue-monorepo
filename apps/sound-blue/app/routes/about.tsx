import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: 'About | Sound Blue' },
  {
    name: 'description',
    content: 'About Sound Blue and SoundBlueMusic. Learn more about the artist, music, and vision.',
  },
];

export default function About() {
  return (
    <NavigationLayout>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-content mb-6">{m['about.title']()}</h1>
        <p className="text-lg text-content-muted mb-8">{m['about.intro']()}</p>

        <section className="prose mb-8">
          <h2>{m['about.sections.artist.title']()}</h2>
          <p>{m['about.sections.artist.content']()}</p>
        </section>

        <section className="prose mb-8">
          <h2>{m['about.sections.label.title']()}</h2>
          <p>{m['about.sections.label.content']()}</p>
        </section>

        <section className="prose mb-8">
          <h2>{m['about.sections.music.title']()}</h2>
          <p>{m['about.sections.music.content']()}</p>
        </section>

        <section className="prose mb-8">
          <h2>{m['about.sections.vision.title']()}</h2>
          <p>{m['about.sections.vision.content']()}</p>
        </section>
      </div>
    </NavigationLayout>
  );
}
