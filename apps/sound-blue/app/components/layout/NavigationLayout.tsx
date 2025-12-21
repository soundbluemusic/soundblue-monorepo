import { type ReactNode, useState } from 'react';
import { BottomNav, Sidebar } from '~/components/navigation';
import { cn } from '~/lib/utils';
import { Footer } from './Footer';
import { Header } from './Header';
import m from '~/lib/messages';

interface NavigationLayoutProps {
  children: ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  

  return (
    <div className="app-layout">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
        aria-label={m['accessibility.skipToContent']()}
      >
        {m['accessibility.skipToContent']()}
      </a>

      <Header
        onSidebarToggle={() => setSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <main
        id="main-content"
        className={cn(
          'main-content view-transition-content transition-[margin-left] duration-150 ease-default max-md:ml-0',
          isSidebarOpen ? 'ml-(--sidebar-width)' : 'ml-0',
        )}
        aria-label={m['accessibility.mainContent']()}
      >
        {children}
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
