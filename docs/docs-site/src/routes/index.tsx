import { createFileRoute, Link, useRouterState } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { getLocaleFromPath, getContent } from '~/content';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'SoundBlue Projects' },
      { name: 'description', content: 'Music and creative projects by Sound Blue' },
    ],
  }),
  component: Home,
});

const projects = [
  {
    id: 'sound-blue',
    icon: '🎵',
    url: 'https://soundbluemusic.com',
    en: { title: 'Sound Blue', description: 'Official website of indie artist Sound Blue' },
    ko: { title: 'Sound Blue', description: '인디 아티스트 Sound Blue의 공식 웹사이트' },
    ja: { title: 'Sound Blue', description: 'インディーアーティストSound Blueの公式サイト' },
  },
  {
    id: 'tools',
    icon: '🎛️',
    url: 'https://tools.soundbluemusic.com',
    en: { title: 'Tools', description: 'Free web tools for musicians and creators' },
    ko: { title: 'Tools', description: '뮤지션과 크리에이터를 위한 무료 웹 도구' },
    ja: { title: 'Tools', description: 'ミュージシャンとクリエイターのための無料ウェブツール' },
  },
  {
    id: 'dialogue',
    icon: '💬',
    url: 'https://dialogue.soundbluemusic.com',
    en: { title: 'Dialogue', description: 'Q&A tool that works 100% offline' },
    ko: { title: 'Dialogue', description: '100% 오프라인 작동 Q&A 도구' },
    ja: { title: 'Dialogue', description: '100%オフラインで動作するQ&Aツール' },
  },
];

function Home() {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <Layout>
      <div className="prose">
        {/* Hero */}
        <div className="mb-8 pb-8 border-b border-[var(--color-border)]">
          <h1 className="text-4xl font-bold mb-4">{t.home.title}</h1>
          <p className="text-xl text-[var(--color-text-secondary)] mb-6">{t.home.tagline}</p>
          <Link
            to={`${localePrefix}/sound-blue` as '/sound-blue'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-brand)] text-white rounded-lg hover:bg-[var(--color-brand-dark)] transition-colors no-underline"
          >
            {t.home.exploreBtn}
            <span>→</span>
          </Link>
        </div>

        {/* Projects */}
        <h2>{t.home.projectsTitle}</h2>
        <div className="grid gap-4 not-prose">
          {projects.map((project) => {
            const content = project[locale];
            return (
              <Link
                key={project.id}
                to={`${localePrefix}/${project.id}` as '/sound-blue'}
                className="flex items-start gap-4 p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors no-underline"
              >
                <span className="text-3xl">{project.icon}</span>
                <div>
                  <h3 className="font-semibold text-[var(--color-text-primary)]">{content.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">{content.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <hr />

        {/* About */}
        <h2>{t.home.aboutTitle}</h2>
        {t.home.aboutText.map((text, i) => (
          <p key={i}><strong>{text.split(' — ')[0]}</strong>{text.includes(' — ') ? ` — ${text.split(' — ')[1]}` : ''}</p>
        ))}
        <ul>
          <li><strong>Free</strong> — No sign-up, no ads</li>
          <li><strong>Open source</strong> — Code on GitHub</li>
          <li><strong>Multilingual</strong> — EN / KO / JA</li>
        </ul>

        <hr />

        {/* Links */}
        <h2>{t.home.linksTitle}</h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Website</td>
              <td><a href="https://soundbluemusic.com">soundbluemusic.com</a></td>
            </tr>
            <tr>
              <td>YouTube</td>
              <td><a href="https://www.youtube.com/@SoundBlueMusic">@SoundBlueMusic</a></td>
            </tr>
            <tr>
              <td>GitHub</td>
              <td><a href="https://github.com/soundbluemusic">soundbluemusic</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
