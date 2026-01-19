/**
 * @fileoverview Footer component for Tools app
 *
 * A simple footer component.
 */

// Build time year to prevent hydration mismatch
const BUILD_YEAR = 2025;

interface FooterProps {
  appName?: string;
  brandName?: string;
  brandUrl?: string;
  tagline?: string;
  className?: string;
}

export function Footer({
  appName = 'Tools',
  brandName = 'SoundBlueMusic',
  brandUrl = 'https://soundbluemusic.com',
  tagline,
  className = '',
}: FooterProps) {
  const footerClass = className
    ? `border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className}`
    : 'border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]';

  return (
    <footer className={footerClass}>
      {/* Tagline */}
      {tagline && <p className="text-center text-xs text-muted-foreground mb-1">{tagline}</p>}

      {/* App name and brand */}
      <p className="text-center text-xs text-muted-foreground mb-1">
        {`${appName} by `}
        <a
          href={brandUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary no-underline transition-all duration-200 hover:underline hover:opacity-80"
        >
          {brandName}
        </a>
      </p>

      {/* Copyright */}
      <p className="text-center text-[0.6875rem] text-muted-foreground/70">
        &copy; {BUILD_YEAR} {brandName}. All rights reserved.
      </p>
    </footer>
  );
}
