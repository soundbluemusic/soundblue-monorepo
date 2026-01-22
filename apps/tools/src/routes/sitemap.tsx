import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/sitemap')({
  head: () => ({
    meta: [
      { title: 'Sitemap | Tools' },
      {
        name: 'description',
        content: 'Site navigation map for Tools - SoundBlueMusic',
      },
      {
        name: 'keywords',
        content: 'sitemap, navigation, site map, tools list',
      },
    ],
  }),
  component: SitemapPage,
});

function SitemapPage() {
  const { sidebarCollapsed } = useToolStore();

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Built With', path: '/built-with' },
    { name: 'Changelog', path: '/changelog' },
    { name: 'Benchmark', path: '/benchmark' },
  ];

  const tools = [
    { name: 'Metronome', path: '/metronome' },
    { name: 'Drum Machine', path: '/drum-machine' },
    { name: 'Tap Tempo', path: '/tap-tempo' },
    { name: 'Delay Calculator', path: '/delay-calculator' },
    { name: 'QR Generator', path: '/qr' },
    { name: 'Translator', path: '/translator' },
    { name: 'Spell Checker', path: '/spell-checker' },
    { name: 'English Spell Checker', path: '/english-spell-checker' },
    { name: 'Color Harmony', path: '/color-harmony' },
    { name: 'Color Palette', path: '/color-palette' },
    { name: 'Color Decomposer', path: '/color-decomposer' },
  ];

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Sitemap', url: 'https://tools.soundbluemusic.com/sitemap' },
        ]}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <Header />
        <ToolSidebar />
        <main
          className={`main-content-transition pt-[var(--header-height)] pb-4 max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
            sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
          } max-md:ml-0`}
        >
          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{m['sitemap_title']?.() || 'Sitemap'}</h1>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Pages</h2>
              <ul className="space-y-2">
                {pages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tools</h2>
              <ul className="space-y-2 grid md:grid-cols-2 gap-2">
                {tools.map((tool) => (
                  <li key={tool.path}>
                    <Link
                      to={tool.path}
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
        <BottomNavigation />
      </div>
    </>
  );
}
