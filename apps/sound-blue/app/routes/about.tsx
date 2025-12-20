import type { MetaFunction } from 'react-router';
import { useI18n } from '~/i18n';

export const meta: MetaFunction = () => [
  { title: 'About | Sound Blue' },
  {
    name: 'description',
    content: 'About Sound Blue and SoundBlueMusic. Learn more about the artist, music, and vision.',
  },
];

export default function About() {
  const { t } = useI18n();

  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            {t.about.title}
          </h1>
          <p className="text-lg text-content-muted mb-8">{t.about.intro}</p>

          <section className="prose mb-8">
            <h2>{t.about.sections.artist.title}</h2>
            <p>{t.about.sections.artist.content}</p>
          </section>

          <section className="prose mb-8">
            <h2>{t.about.sections.label.title}</h2>
            <p>{t.about.sections.label.content}</p>
          </section>

          <section className="prose mb-8">
            <h2>{t.about.sections.music.title}</h2>
            <p>{t.about.sections.music.content}</p>
          </section>

          <section className="prose mb-8">
            <h2>{t.about.sections.vision.title}</h2>
            <p>{t.about.sections.vision.content}</p>
          </section>
        </div>
      </main>
    </div>
  );
}
