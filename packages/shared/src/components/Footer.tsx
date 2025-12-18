/**
 * @fileoverview Shared Footer component
 *
 * A configurable footer component for SoundBlue apps.
 *
 * @module @soundblue/shared/components/Footer
 */

import type { Component, JSX } from 'solid-js';
import { For, Show } from 'solid-js';

/**
 * Footer link configuration.
 */
export interface FooterLink {
  /** Link URL or path */
  href: string;
  /** Link label text */
  label: string;
  /** Whether link is external (opens in new tab) */
  external?: boolean;
}

/**
 * Props for the Footer component.
 */
export interface FooterProps {
  /** App name displayed in "by" text (e.g., "Tools", "Dialogue") */
  appName?: string;
  /** Brand name (default: "SoundBlueMusic") */
  brandName?: string;
  /** Brand URL (default: "https://soundbluemusic.com") */
  brandUrl?: string;
  /** Navigation links to display */
  links?: FooterLink[];
  /** Tagline text */
  tagline?: string;
  /** Copyright holder name */
  copyrightHolder?: string;
  /** Show copyright year */
  showCopyright?: boolean;
  /** Additional CSS classes */
  class?: string;
  /** Custom children to render */
  children?: JSX.Element;
}

/**
 * Shared Footer component.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <Footer appName="Tools" />
 *
 * // With links
 * <Footer
 *   appName="Sound Blue"
 *   links={[
 *     { href: '/privacy', label: 'Privacy' },
 *     { href: '/terms', label: 'Terms' },
 *   ]}
 *   showCopyright
 *   copyrightHolder="SoundBlueMusic"
 * />
 * ```
 */
export const Footer: Component<FooterProps> = (props) => {
  const brandName = () => props.brandName ?? 'SoundBlueMusic';
  const brandUrl = () => props.brandUrl ?? 'https://soundbluemusic.com';
  const currentYear = new Date().getFullYear();

  return (
    <footer
      class={`border-t bg-(--color-bg-secondary,var(--background)) px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${props.class ?? ''}`}
    >
      {/* Navigation links */}
      <Show when={props.links && props.links.length > 0}>
        <nav
          class="flex flex-wrap gap-1 justify-center items-center mb-2"
          aria-label="Footer navigation"
        >
          <For each={props.links}>
            {(link) => (
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                class="inline-flex items-center justify-center text-(--color-text-muted,var(--muted-foreground)) no-underline text-sm py-2 px-3 rounded-lg cursor-pointer transition-all duration-150 hover:text-(--color-text,var(--foreground)) hover:bg-black/5 dark:hover:bg-white/10"
              >
                {link.label}
              </a>
            )}
          </For>
        </nav>
      </Show>

      {/* Tagline */}
      <Show when={props.tagline}>
        <p class="text-center text-xs text-(--color-text-muted,var(--muted-foreground)) mb-1">
          {props.tagline}
        </p>
      </Show>

      {/* Children (custom content) */}
      <Show when={props.children}>{props.children}</Show>

      {/* App name and brand */}
      <Show when={props.appName}>
        <p class="text-center text-xs text-(--color-text-muted,var(--muted-foreground))">
          {props.appName} by{' '}
          <a
            href={brandUrl()}
            target="_blank"
            rel="noopener noreferrer"
            class="text-(--color-accent,var(--primary)) transition-all duration-200 hover:underline hover:opacity-80"
          >
            {brandName()}
          </a>
        </p>
      </Show>

      {/* Copyright */}
      <Show when={props.showCopyright}>
        <p class="text-center text-xs text-[var(--color-text-subtle,var(--muted-foreground))] mt-1">
          © {currentYear} {props.copyrightHolder ?? brandName()}. All rights reserved.
        </p>
      </Show>
    </footer>
  );
};
