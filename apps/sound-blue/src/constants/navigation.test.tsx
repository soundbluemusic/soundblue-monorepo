import { describe, expect, it } from 'vitest';
import {
  EXTERNAL_NAV_ITEMS,
  type ExternalNavItem,
  isNavActive,
  NAV_ITEMS,
  type NavItem,
  PRIMARY_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
} from './navigation';

describe('Navigation Constants', () => {
  describe('NAV_ITEMS', () => {
    it('NAV_ITEMS가 배열', () => {
      expect(Array.isArray(NAV_ITEMS)).toBe(true);
    });

    it('NAV_ITEMS에 항목이 있음', () => {
      expect(NAV_ITEMS.length).toBeGreaterThan(0);
    });

    it('모든 항목이 올바른 구조', () => {
      NAV_ITEMS.forEach((item: NavItem) => {
        expect(item).toHaveProperty('path');
        expect(item).toHaveProperty('labelKey');
        expect(item).toHaveProperty('icon');
        expect(typeof item.path).toBe('string');
        expect(typeof item.labelKey).toBe('string');
        expect(typeof item.icon).toBe('function');
      });
    });

    it('홈 경로가 포함됨', () => {
      const homeItem = NAV_ITEMS.find((item) => item.path === '/');
      expect(homeItem).toBeDefined();
      expect(homeItem?.labelKey).toBe('home');
    });

    it('about 경로가 포함됨', () => {
      const aboutItem = NAV_ITEMS.find((item) => item.path === '/about');
      expect(aboutItem).toBeDefined();
      expect(aboutItem?.labelKey).toBe('about');
    });

    it('중복된 경로가 없음', () => {
      const paths = NAV_ITEMS.map((item) => item.path);
      const uniquePaths = new Set(paths);
      expect(paths.length).toBe(uniquePaths.size);
    });
  });

  describe('PRIMARY_NAV_ITEMS', () => {
    it('PRIMARY_NAV_ITEMS가 배열', () => {
      expect(Array.isArray(PRIMARY_NAV_ITEMS)).toBe(true);
    });

    it('PRIMARY_NAV_ITEMS가 4개 이하', () => {
      expect(PRIMARY_NAV_ITEMS.length).toBeLessThanOrEqual(4);
    });

    it('모든 항목이 NAV_ITEMS에 포함됨', () => {
      PRIMARY_NAV_ITEMS.forEach((item) => {
        expect(NAV_ITEMS).toContainEqual(item);
      });
    });

    it('홈이 PRIMARY_NAV_ITEMS에 포함됨', () => {
      const hasHome = PRIMARY_NAV_ITEMS.some((item) => item.labelKey === 'home');
      expect(hasHome).toBe(true);
    });
  });

  describe('SECONDARY_NAV_ITEMS', () => {
    it('SECONDARY_NAV_ITEMS가 배열', () => {
      expect(Array.isArray(SECONDARY_NAV_ITEMS)).toBe(true);
    });

    it('모든 항목이 NAV_ITEMS에 포함됨', () => {
      SECONDARY_NAV_ITEMS.forEach((item) => {
        expect(NAV_ITEMS).toContainEqual(item);
      });
    });

    it('PRIMARY와 SECONDARY가 겹치지 않음', () => {
      const primaryPaths = PRIMARY_NAV_ITEMS.map((item) => item.path);
      const secondaryPaths = SECONDARY_NAV_ITEMS.map((item) => item.path);
      const intersection = primaryPaths.filter((path) => secondaryPaths.includes(path));
      expect(intersection.length).toBe(0);
    });

    it('PRIMARY + SECONDARY = NAV_ITEMS', () => {
      const totalLength = PRIMARY_NAV_ITEMS.length + SECONDARY_NAV_ITEMS.length;
      expect(totalLength).toBe(NAV_ITEMS.length);
    });
  });

  describe('EXTERNAL_NAV_ITEMS', () => {
    it('EXTERNAL_NAV_ITEMS가 배열', () => {
      expect(Array.isArray(EXTERNAL_NAV_ITEMS)).toBe(true);
    });

    it('모든 항목이 올바른 구조', () => {
      EXTERNAL_NAV_ITEMS.forEach((item: ExternalNavItem) => {
        expect(item).toHaveProperty('url');
        expect(item).toHaveProperty('labelKey');
        expect(item).toHaveProperty('icon');
        expect(typeof item.url).toBe('string');
        expect(typeof item.labelKey).toBe('string');
        expect(typeof item.icon).toBe('function');
      });
    });

    it('모든 URL이 https로 시작', () => {
      EXTERNAL_NAV_ITEMS.forEach((item) => {
        expect(item.url).toMatch(/^https:\/\//);
      });
    });

    it('tools 링크가 포함됨', () => {
      const toolsItem = EXTERNAL_NAV_ITEMS.find((item) => item.labelKey === 'tools');
      expect(toolsItem).toBeDefined();
      expect(toolsItem?.url).toBe('https://tools.soundbluemusic.com');
    });
  });

  describe('isNavActive 함수', () => {
    const mockLocalizedPath = (path: string) => path;

    it('홈 경로 - 정확히 일치', () => {
      expect(isNavActive('/', '/', mockLocalizedPath)).toBe(true);
    });

    it('홈 경로 - /ko', () => {
      expect(isNavActive('/', '/ko', mockLocalizedPath)).toBe(true);
    });

    it('홈 경로 - /ko/', () => {
      expect(isNavActive('/', '/ko/', mockLocalizedPath)).toBe(true);
    });

    it('홈 경로 - 다른 경로는 false', () => {
      expect(isNavActive('/', '/about', mockLocalizedPath)).toBe(false);
    });

    it('일반 경로 - 정확히 일치', () => {
      expect(isNavActive('/about', '/about', mockLocalizedPath)).toBe(true);
    });

    it('일반 경로 - 하위 경로', () => {
      expect(isNavActive('/about', '/about/team', mockLocalizedPath)).toBe(true);
    });

    it('일반 경로 - 다른 경로는 false', () => {
      expect(isNavActive('/about', '/blog', mockLocalizedPath)).toBe(false);
    });

    it('localizedPath 함수 사용', () => {
      const koLocalizedPath = (path: string) => `/ko${path}`;
      expect(isNavActive('/about', '/ko/about', koLocalizedPath)).toBe(true);
    });

    it('localizedPath로 하위 경로도 활성화', () => {
      const koLocalizedPath = (path: string) => `/ko${path}`;
      expect(isNavActive('/about', '/ko/about/team', koLocalizedPath)).toBe(true);
    });
  });

  describe('아이콘 렌더링', () => {
    it('모든 NAV_ITEMS 아이콘이 렌더링 가능', () => {
      NAV_ITEMS.forEach((item) => {
        expect(() => item.icon()).not.toThrow();
      });
    });

    it('모든 EXTERNAL_NAV_ITEMS 아이콘이 렌더링 가능', () => {
      EXTERNAL_NAV_ITEMS.forEach((item) => {
        expect(() => item.icon()).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    it('빈 경로도 처리', () => {
      expect(() => isNavActive('', '', mockLocalizedPath)).not.toThrow();
    });

    it('슬래시로 끝나는 경로도 하위 경로로 인식', () => {
      const mockLocalizedPath = (path: string) => path;
      expect(isNavActive('/about', '/about/', mockLocalizedPath)).toBe(true);
    });
  });
});

const mockLocalizedPath = (path: string) => path;
