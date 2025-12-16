// @refresh reload
import { MetaProvider } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { KeyboardShortcutsProvider } from '@/components/providers/keyboard-shortcuts-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { OfflineIndicator } from '@/components/pwa';
import { LanguageProvider } from '@/i18n/context';
import './globals.css';

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <ThemeProvider>
            <LanguageProvider>
              <KeyboardShortcutsProvider>
                <Suspense fallback={<div class="min-h-screen bg-background" />}>
                  {props.children}
                </Suspense>
                <OfflineIndicator />
              </KeyboardShortcutsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
