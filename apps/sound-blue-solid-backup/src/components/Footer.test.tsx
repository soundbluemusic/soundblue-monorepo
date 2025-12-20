import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

// Mock providers
vi.mock('~/components/providers', () => ({
  useLanguage: () => ({
    t: () => ({
      footer: {
        privacy: 'Privacy',
        terms: 'Terms',
        license: 'License',
        sitemap: 'Sitemap',
        tagline: 'Making music with',
        builtWith: 'these tools',
      },
    }),
    localizedPath: (path: string) => path,
  }),
}));

// Mock router
vi.mock('@solidjs/router', () => ({
  A: (props: { href: string; children: unknown; class?: string }) => {
    const { href, class: className, children } = props;
    return (
      <a href={href} class={className}>
        {children as string}
      </a>
    );
  },
}));

// Mock constants
vi.mock('~/constants', () => ({
  BRAND: {
    copyrightHolder: 'SoundBlueMusic',
  },
}));

import { Footer } from './Footer';

describe('Footer', () => {
  it('should render footer element', () => {
    render(() => <Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render all navigation links', () => {
    render(() => <Footer />);
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
    expect(screen.getByText('License')).toBeInTheDocument();
    expect(screen.getByText('Sitemap')).toBeInTheDocument();
  });

  it('should have correct href for navigation links', () => {
    render(() => <Footer />);
    expect(screen.getByText('Privacy').closest('a')).toHaveAttribute('href', '/privacy');
    expect(screen.getByText('Terms').closest('a')).toHaveAttribute('href', '/terms');
    expect(screen.getByText('License').closest('a')).toHaveAttribute('href', '/license');
    expect(screen.getByText('Sitemap').closest('a')).toHaveAttribute('href', '/sitemap');
  });

  it('should render built-with link', () => {
    render(() => <Footer />);
    const builtWithLink = screen.getByText('these tools');
    expect(builtWithLink).toBeInTheDocument();
    expect(builtWithLink.closest('a')).toHaveAttribute('href', '/built-with');
  });

  it('should render copyright notice with current year', () => {
    render(() => <Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });

  it('should render copyright holder name', () => {
    render(() => <Footer />);
    expect(screen.getByText(/SoundBlueMusic/)).toBeInTheDocument();
  });

  it('should have footer navigation with aria-label', () => {
    render(() => <Footer />);
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toBeInTheDocument();
  });

  it('should render tagline text', () => {
    render(() => <Footer />);
    expect(screen.getByText(/Making music with/)).toBeInTheDocument();
  });
});
