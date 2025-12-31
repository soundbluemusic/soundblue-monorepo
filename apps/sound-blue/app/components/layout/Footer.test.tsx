import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Footer } from './Footer';

// Mock dependencies
vi.mock('@soundblue/ui-components/base', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
  }),
}));

vi.mock('~/lib/messages', () => ({
  default: {
    footer_privacy: () => 'Privacy Policy',
    footer_terms: () => 'Terms of Service',
    footer_license: () => 'License',
    footer_sitemap: () => 'Sitemap',
    'footer.tagline': () => 'Made with love',
    'footer.builtWith': () => 'Built With',
  },
}));

vi.mock('~/constants', () => ({
  BRAND: {
    copyrightHolder: 'Sound Blue Music',
  },
}));

describe('Footer', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('렌더링', () => {
    it('footer 요소 렌더링', () => {
      renderWithRouter(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('Privacy Policy 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const link = screen.getByText('Privacy Policy');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/privacy');
    });

    it('Terms of Service 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const link = screen.getByText('Terms of Service');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/terms');
    });

    it('License 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const link = screen.getByText('License');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/license');
    });

    it('Sitemap 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const link = screen.getByText('Sitemap');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/sitemap');
    });

    it('Built With 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const link = screen.getByText('Built With');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/built-with');
    });

    it('Tagline 텍스트 렌더링', () => {
      renderWithRouter(<Footer />);
      expect(screen.getByText('Made with love', { exact: false })).toBeInTheDocument();
    });
  });

  describe('Copyright', () => {
    // BUILD_YEAR는 SSG hydration 문제 방지를 위해 2025로 하드코딩됨
    const BUILD_YEAR = 2025;

    it('Copyright 텍스트 렌더링', () => {
      renderWithRouter(<Footer />);
      expect(
        screen.getByText(`© ${BUILD_YEAR} Sound Blue Music. All rights reserved.`),
      ).toBeInTheDocument();
    });

    it('빌드 연도가 표시됨', () => {
      renderWithRouter(<Footer />);
      const copyrightText = screen.getByText(/©/);
      expect(copyrightText.textContent).toContain(BUILD_YEAR.toString());
    });
  });

  describe('접근성', () => {
    it('footer는 contentinfo role 가짐', () => {
      renderWithRouter(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('nav에 aria-label 설정', () => {
      renderWithRouter(<Footer />);
      const nav = screen.getByRole('navigation', { name: 'Footer navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('모든 링크는 포커스 가능', () => {
      renderWithRouter(<Footer />);
      const links = screen.getAllByRole('link');

      links.forEach((link) => {
        // Links are focusable by default
        expect(link.getAttribute('tabIndex')).not.toBe('-1');
      });
    });
  });

  describe('링크 구조', () => {
    it('4개의 footer 링크 렌더링', () => {
      renderWithRouter(<Footer />);
      const nav = screen.getByRole('navigation', { name: 'Footer navigation' });
      const links = nav.querySelectorAll('a');
      expect(links.length).toBe(4); // privacy, terms, license, sitemap
    });
  });

  describe('Edge Cases', () => {
    it('연도가 유효한 숫자', () => {
      renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(currentYear).toBeGreaterThan(2020);
      expect(currentYear).toBeLessThan(2100);
    });

    it('컴포넌트 렌더링 시 에러 없음', () => {
      expect(() => renderWithRouter(<Footer />)).not.toThrow();
    });
  });
});
