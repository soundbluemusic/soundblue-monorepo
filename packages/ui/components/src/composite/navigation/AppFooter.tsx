'use client';

import type React from 'react';
import { SERVICE_LINKS, SOCIAL_LINKS } from './serviceLinks';

// Current year - updated dynamically
const CURRENT_YEAR = new Date().getFullYear();

// Social icons
function YouTubeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.899-.746 2.13-1.109 3.79-1.058 1.192.056 2.241.25 3.158.546l.06-1.66h.003c.013-1.256-.34-2.254-1.047-2.97-.745-.755-1.836-1.15-3.243-1.172-1.207.015-2.2.353-2.865.955-.586.53-.936 1.279-1.012 2.159l-2.065-.143c.143-1.47.748-2.663 1.749-3.453 1.088-.858 2.56-1.29 4.377-1.29 1.94.026 3.479.584 4.575 1.66.964.945 1.48 2.257 1.534 3.878l-.004.026-.089 2.436c.815.456 1.473 1.062 1.96 1.812.667 1.027.953 2.251.853 3.64-.146 2.03-1.153 3.79-2.838 4.953-1.531 1.057-3.512 1.565-5.89 1.508zm.097-7.27c-.61-.023-1.08.132-1.36.448-.252.283-.263.616-.258.753.016.46.218.753.62 1.013.454.295 1.105.46 1.78.422.997-.054 1.69-.404 2.12-1.07.34-.527.562-1.29.653-2.266-.741-.18-1.573-.305-2.544-.35l-1.011.05z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, () => React.ReactElement> = {
  youtube: YouTubeIcon,
  x: XIcon,
  threads: ThreadsIcon,
  instagram: InstagramIcon,
};

const LABELS = {
  ko: {
    services: '서비스',
    social: '소셜',
    copyright: '모든 권리 보유',
  },
  en: {
    services: 'Services',
    social: 'Social',
    copyright: 'All rights reserved',
  },
};

export interface AppFooterProps {
  /** Current app identifier to highlight */
  currentApp: string;
  /** Current locale */
  locale: 'ko' | 'en';
  /** Optional legal links to display */
  legalLinks?: Array<{
    label: string;
    href: string;
  }>;
  /** Brand name for copyright */
  brandName?: string;
  /** Optional className for additional styling */
  className?: string;
}

export function AppFooter({
  currentApp,
  locale,
  legalLinks,
  brandName = 'SoundBlueMusic',
  className = '',
}: AppFooterProps) {
  const labels = LABELS[locale];

  return (
    <footer
      className={`border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-4 py-6 ${className}`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Legal Links */}
        {legalLinks && legalLinks.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-4" aria-label="Legal">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--color-interactive-hover)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Services Section */}
        <div className="mb-4">
          <p className="text-xs text-[var(--color-text-tertiary)] text-center mb-2 uppercase tracking-wider">
            {labels.services}
          </p>
          <nav className="flex flex-wrap justify-center gap-x-1 gap-y-1" aria-label="Services">
            {SERVICE_LINKS.map((service) => {
              const isCurrent = service.id === currentApp;
              return (
                <a
                  key={service.id}
                  href={service.url}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    isCurrent
                      ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-light)] font-medium'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-hover)]'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {service.label[locale]}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Social Section */}
        <div className="mb-4">
          <p className="text-xs text-[var(--color-text-tertiary)] text-center mb-2 uppercase tracking-wider">
            {labels.social}
          </p>
          <nav className="flex flex-wrap justify-center gap-2" aria-label="Social">
            {SOCIAL_LINKS.map((social) => {
              const IconComponent = SOCIAL_ICONS[social.id];
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 rounded-lg transition-colors duration-150 hover:bg-[var(--color-interactive-hover)]"
                  title={social.name}
                >
                  {IconComponent && <IconComponent />}
                  <span className="max-sm:hidden">{social.name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Copyright */}
        <p
          className="text-xs text-[var(--color-text-tertiary)] text-center"
          suppressHydrationWarning
        >
          &copy; {CURRENT_YEAR} {brandName}. {labels.copyright}.
        </p>
      </div>
    </footer>
  );
}
