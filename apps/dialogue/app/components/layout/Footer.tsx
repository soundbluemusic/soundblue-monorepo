/**
 * @fileoverview Footer component for Dialogue app
 *
 * Uses shared AppFooter with cross-app navigation and social links.
 */

import { getLocaleFromPath } from '@soundblue/i18n';
import { AppFooter } from '@soundblue/ui-components/composite';
import { useLocation } from 'react-router';
import m from '~/lib/messages';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';

  return (
    <div className={className}>
      {/* App-specific tagline */}
      <div className="border-t border-[var(--color-border-primary)] py-2 px-4 text-center bg-[var(--color-bg-secondary)]">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          <span>{m['app.title']()}</span>
          <span className="mx-2">·</span>
          <span>{m['app.footerDescription']()}</span>
        </p>
      </div>

      {/* AppFooter with services and social links */}
      <AppFooter currentApp="dialogue" locale={locale} brandName="SoundBlueMusic" />
    </div>
  );
}
