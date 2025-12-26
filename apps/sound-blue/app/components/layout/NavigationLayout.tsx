import { type ReactNode, useState } from 'react';
import { BottomNav, Sidebar } from '~/components/navigation';
import m from '~/lib/messages';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './NavigationLayout.module.scss';

interface NavigationLayoutProps {
  children: ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const mainClasses = [
    'main-content',
    'view-transition-content',
    styles.main,
    isSidebarOpen ? styles.mainOpen : styles.mainClosed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="app-layout">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className={styles.skipToContent}
        aria-label={m['accessibility.skipToContent']()}
      >
        {m['accessibility.skipToContent']()}
      </a>

      <Header
        onSidebarToggle={() => setSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <main id="main-content" className={mainClasses} aria-label={m['accessibility.mainContent']()}>
        {children}
        <Footer />
      </main>
      <BottomNav />
    </div>
  );
}
