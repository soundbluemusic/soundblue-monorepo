import { createSignal, type JSX, type ParentComponent } from 'solid-js';
import { useLanguage } from '~/components/providers';
import { cn } from '~/lib/utils';
import { Footer } from './Footer';
import { Header } from './Header';
import { BottomNav, Sidebar } from './navigation';

export const NavigationLayout: ParentComponent = (props): JSX.Element => {
  const [isSidebarOpen, setSidebarOpen] = createSignal(true);
  const { t } = useLanguage();

  return (
    <div class="app-layout">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" class="skip-to-content" aria-label={t().accessibility.skipToContent}>
        {t().accessibility.skipToContent}
      </a>

      <Header
        onSidebarToggle={() => setSidebarOpen(!isSidebarOpen())}
        isSidebarOpen={isSidebarOpen()}
      />
      <Sidebar isOpen={isSidebarOpen()} />
      <main
        id="main-content"
        class={cn(
          'main-content view-transition-content transition-[margin-left] duration-150 ease-default max-md:ml-0',
          isSidebarOpen() ? 'ml-(--sidebar-width)' : 'ml-0',
        )}
        aria-label={t().accessibility.mainContent}
      >
        {props.children}
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
};
