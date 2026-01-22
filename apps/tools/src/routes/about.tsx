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
      { title: 'About | Tools' },
      {
        name: 'description',
        content: 'We believe powerful tools should be accessible to everyone.',
      },
      {
        name: 'keywords',
        content: 'about, soundblue tools, mission, free tools, music tools',
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
                {m['about_missionTitle']?.() || 'Our Mission'}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {m['about_missionText']?.() ||
                  'We believe powerful tools should be accessible to everyone. Our goal is to provide professional-grade music and creative tools that are free, easy to use, and work right in your browser.'}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {m['about_introTitle']?.() || 'What We Offer'}
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {m['about_introText']?.() ||
                  'From metronomes to drum machines, QR generators to translators - all our tools are designed with musicians and creators in mind. No sign-up required, no ads, completely free.'}
              </p>
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
