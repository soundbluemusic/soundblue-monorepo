import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About | Tools - SoundBlue' },
      {
        name: 'description',
        content:
          'Interactive tools for creators by SoundBlue. Rhythm tools for musicians, writing tools for authors, and color tools for visual artists.',
      },
      {
        name: 'keywords',
        content:
          'soundblue tools, music tools, creative tools, musician tools, artist tools, metronome, drum machine, translator, color palette',
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'About', url: 'https://tools.soundbluemusic.com/about' },
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
            <h1 className="text-3xl font-bold mb-6">{m['about_title']?.() || 'About'}</h1>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {m['about_missionTitle']?.() || 'Who We Are'}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {m['about_missionText']?.() ||
                  'Tools is a collection of interactive tools created by SoundBlue, an indie musician and creator. We build tools that help with music, art, and creative work — everything a creator might need, all in one place.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {m['about_introTitle']?.() || 'Tools for Creators'}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                {m['about_introText']?.() ||
                  'Every tool here serves a purpose for creators. No sign-up required, no ads, completely free.'}
              </p>

              <div className="space-y-6">
                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">🎵 Rhythm — For Musicians</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Metronome for precise tempo practice, Drum Machine for rhythm experimentation,
                    Tap Tempo to detect BPM, and Delay Calculator for mixing.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">✍️ Language — For Authors & Lyricists</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Translator for vocabulary building and lyrics translation, Spell Checkers to
                    improve writing quality in Korean and English.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">🎨 Visual — For Visual Artists</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Color Harmony to learn and apply color theory, Color Palette to create schemes
                    for your artwork, Color Decomposer to improve color analysis skills.
                  </p>
                </div>

                <div className="border-l-4 border-[var(--color-accent)] pl-4">
                  <h3 className="font-semibold mb-2">🔧 Utility — For All Creators</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    QR Generator to easily share your work and portfolio with anyone.
                  </p>
                </div>
              </div>
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
