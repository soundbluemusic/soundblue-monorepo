import { BreadcrumbStructuredData } from '@soundblue/seo';
import { createFileRoute } from '@tanstack/react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { useToolStore } from '~/stores/tool-store';

export const Route = createFileRoute('/built-with')({
  head: () => ({
    meta: [
      { title: 'Built With | Tools' },
      {
        name: 'description',
        content: 'Technologies and tools used to build this project',
      },
      {
        name: 'keywords',
        content: 'tech stack, react, typescript, tailwind, vite, web audio, tanstack',
      },
    ],
  }),
  component: BuiltWithPage,
});

function BuiltWithPage() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: 'Tools', url: 'https://tools.soundbluemusic.com' },
          { name: 'Built With', url: 'https://tools.soundbluemusic.com/built-with' },
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
            <h1 className="text-3xl font-bold mb-6">{m['builtWith_title']?.() || 'Built With'}</h1>

            <p className="text-[var(--color-text-secondary)] mb-8">
              {m['builtWith_intro']?.() ||
                'This project is built with modern web technologies for the best performance and developer experience.'}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <TechCard title="React 19" description="Fast reactive framework" />
              <TechCard title="TypeScript" description="Type-safe JavaScript" />
              <TechCard title="TanStack Router" description="File-based routing" />
              <TechCard title="Tailwind CSS v4" description="Utility-first styling" />
              <TechCard title="Vite" description="Fast build tool" />
              <TechCard title="Web Audio API" description="High-performance audio" />
              <TechCard title="Zustand" description="Simple state management" />
              <TechCard title="Cloudflare Pages" description="Static hosting" />
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

function TechCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]">
      <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{description}</p>
    </div>
  );
}
