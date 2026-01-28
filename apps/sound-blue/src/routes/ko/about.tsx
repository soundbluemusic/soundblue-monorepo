import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { NavigationLayout } from '~/components/layout';
import m, { getRawMessage } from '~/lib/messages';

export const Route = createFileRoute('/ko/about')({
  head: () => ({
    meta: [
      { title: '소개 | Sound Blue' },
      {
        name: 'description',
        content:
          'Sound Blue와 SoundBlueMusic에 대해 알아보세요. 아티스트, 음악, 비전에 대한 소개입니다.',
      },
      {
        name: 'keywords',
        content:
          '사운드블루 소개, 인디 뮤지션, 음악가, 아티스트 소개, Sound Blue, SoundBlueMusic, Korean artist, music producer',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://soundbluemusic.com/ko/about' },
      { rel: 'alternate', hrefLang: 'ko', href: 'https://soundbluemusic.com/ko/about' },
      { rel: 'alternate', hrefLang: 'en', href: 'https://soundbluemusic.com/about' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://soundbluemusic.com/about' },
    ],
  }),
  component: About,
});

function About() {
  return (
    <NavigationLayout>
      <BreadcrumbStructuredData
        items={[
          { name: '홈', url: 'https://soundbluemusic.com/ko' },
          { name: '소개', url: 'https://soundbluemusic.com/ko/about' },
        ]}
      />
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

        <section className="prose mb-8">
          <h2>{m['about.sections.projects.title']()}</h2>
          <ul>
            {(getRawMessage('about_sections_projects_items') as string[] | undefined)?.map(
              (item, index) => (
                <li key={index}>{item}</li>
              ),
            )}
          </ul>
        </section>

        <section className="prose mb-8">
          <h2>{m['about.sections.connect.title']()}</h2>
          <ul>
            <li>
              <a
                href="https://youtube.com/@SoundBlueMusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {m['about.sections.connect.youtube']()}
              </a>
            </li>
            <li>
              <a
                href="https://github.com/soundbluemusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {m['about.sections.connect.github']()}
              </a>
            </li>
          </ul>
        </section>

        {/* Explore More - Internal Links */}
        <section className="mt-12 pt-8 border-t border-border-default">
          <h2 className="text-xl font-semibold text-content mb-4">
            {m['about.sections.explore.title']()}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/ko/music"
              className="group block rounded-lg border border-border-default p-4 transition-colors hover:border-accent-primary hover:bg-surface-hover"
            >
              <h3 className="font-medium text-content group-hover:text-accent-primary">
                {m['about.sections.explore.music']()}
              </h3>
              <p className="mt-1 text-sm text-content-muted">
                {m['about.sections.explore.music.desc']()}
              </p>
            </a>
            <a
              href="https://tools.soundbluemusic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-border-default p-4 transition-colors hover:border-accent-primary hover:bg-surface-hover"
            >
              <h3 className="font-medium text-content group-hover:text-accent-primary">
                {m['about.sections.explore.tools']()} ↗
              </h3>
              <p className="mt-1 text-sm text-content-muted">
                {m['about.sections.explore.tools.desc']()}
              </p>
            </a>
          </div>
        </section>
      </div>
    </NavigationLayout>
  );
}
