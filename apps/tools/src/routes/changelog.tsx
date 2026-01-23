import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [
      { title: 'Changelog | Tools' },
      {
        name: 'description',
        content: 'Updates and changes to the tools',
      },
      {
        name: 'keywords',
        content: 'changelog, updates, release notes, version history',
      },
    ],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Changelog', url: 'https://tools.soundbluemusic.com/changelog' },
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
            <h1 className="text-3xl font-bold mb-6">{m['changelog_title']?.() || 'Changelog'}</h1>

            <p className="text-[var(--color-text-secondary)] mb-8">
              {m['changelog_intro']?.() ||
                'Track all updates, improvements, and new features added to our tools.'}
            </p>

            <div className="space-y-6">
              <ChangelogEntry
                version="1.0.0"
                date="2026-01-22"
                changes={[
                  'Initial release',
                  'Added Metronome, Drum Machine, QR Generator',
                  'Added Translator with Korean-English support',
                  'Added Color tools (Harmony, Palette, Decomposer)',
                ]}
              />
            </div>
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

function ChangelogEntry({
  version,
  date,
  changes,
}: {
  version: string;
  date: string;
  changes: string[];
}) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]">
      <div className="flex items-center gap-3 mb-3">
        <span className="font-semibold text-[var(--color-accent-primary)]">v{version}</span>
        <span className="text-sm text-[var(--color-text-tertiary)]">{date}</span>
      </div>
      <ul className="space-y-1">
        {changes.map((change, idx) => (
          <li
            key={idx}
            className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
          >
            <span className="text-[var(--color-text-tertiary)]">-</span>
            {change}
          </li>
        ))}
      </ul>
    </div>
  );
}
