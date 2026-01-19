import type { MetaFunction } from 'react-router';
import { BottomNavigation } from '~/components/home/BottomNavigation';
import { Footer } from '~/components/layout/Footer';
import { Header } from '~/components/layout/Header';
import { ToolSidebar } from '~/components/sidebar/ToolSidebar';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';
import { useToolStore } from '~/stores/tool-store';

export const meta: MetaFunction = ({ location }) => [
  { title: 'About | Tools' },
  {
    name: 'description',
    content: 'We believe powerful tools should be accessible to everyone.',
  },
  ...getSeoMeta(location),
];

export default function About() {
  const { sidebarCollapsed } = useToolStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <ToolSidebar />

      <main
        className={`flex min-h-screen flex-col items-center justify-center p-6 pt-[var(--header-height)] pb-4 transition-[margin-left] duration-150 ease-[var(--ease-default)] max-md:pt-[52px] max-md:pb-[calc(var(--bottom-nav-height)+16px)] ${
          sidebarCollapsed ? 'ml-0' : 'ml-[var(--sidebar-width)]'
        } max-md:ml-0`}
      >
        <div className="max-w-md text-center">
          <blockquote className="mb-12 text-2xl font-light leading-relaxed tracking-tight text-foreground sm:text-3xl">
            {`"${m['about_missionText']?.()}"`}
          </blockquote>
          <div className="mx-auto mb-12 h-px w-16 bg-border" />
          <p className="text-base text-muted-foreground sm:text-lg">{m['about_intro']?.()}</p>
        </div>

        <div className="hidden md:block w-full mt-auto">
          <Footer />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
