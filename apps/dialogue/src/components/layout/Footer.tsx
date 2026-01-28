/**
 * @fileoverview Footer component for Dialogue app
 *
 * Uses a minimal footer to maximize chat area space.
 */

import m from '~/lib/messages';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <div className={`${className} shrink-0`}>
      {/* App-specific tagline - Optimized for minimal height */}
      <div className="border-t border-[var(--color-border-primary)] py-2 px-4 text-center bg-[var(--color-bg-secondary)]">
        <p className="text-[11px] text-[var(--color-text-tertiary)]">
          <span>{m['app.title']()}</span>
          <span className="mx-2">·</span>
          <span>{m['app.footerDescription']()}</span>
        </p>
      </div>
    </div>
  );
}
