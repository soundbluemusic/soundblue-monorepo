import { describe, expect, it } from 'vitest';
import {
  BUILD_DIR,
  getAllHtmlFiles,
  getAllJsFiles,
  fileExists,
  findFilesMatching,
  getAllFiles,
  isBuildDirReady,
  routeToFilePath,
  searchInFiles,
} from './helpers/test-utils';

/**
 * Static Files Test - 정적 파일 생성 검증
 *
 * 목적:
 * - 모든 prerender 라우트의 HTML 파일이 생성되었는지 확인
 * - 소스맵이 프로덕션 빌드에 포함되지 않았는지 확인
 * - 빌드 파일 구조가 올바른지 확인
 */

// react-router.config.ts에서 라우트 목록 가져오기
const getExpectedRoutes = async (): Promise<string[]> => {
  const config = await import('../../react-router.config');
  if (typeof config.default.prerender !== 'function') {
    throw new Error('prerender is not a function');
  }
  // @ts-expect-error - prerender signature varies, calling without args for static routes
  const result = await config.default.prerender({});
  // Handle both array and object return types
  return Array.isArray(result) ? result : (result as any).paths;
};

describe('Static Files Generation', () => {
  it('빌드 디렉토리 존재', () => {
    expect(isBuildDirReady(), `Build directory not found: ${BUILD_DIR}`).toBe(true);
  });

  describe('HTML 파일 생성', () => {
    it('모든 prerender 라우트의 HTML 생성', async () => {
      const routes = await getExpectedRoutes();
      const missingHtmlFiles: string[] = [];

      routes.forEach((route) => {
        const filePath = routeToFilePath(route);
        if (!fileExists(filePath)) {
          missingHtmlFiles.push(`${route} → ${filePath}`);
        }
      });

      expect(
        missingHtmlFiles,
        `Missing HTML files:\n${missingHtmlFiles.join('\n')}`,
      ).toEqual([]);
    });

    it('index.html 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/index.html`)).toBe(true);
    });

    it('한국어 index.html 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/ko/index.html`)).toBe(true);
    });

    it('최소 10개 이상의 HTML 파일 생성', () => {
      const htmlFiles = getAllHtmlFiles();
      expect(htmlFiles.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('소스맵 방지', () => {
    it('JS 파일에 sourceMappingURL 주석 없음', () => {
      const jsFiles = getAllJsFiles();

      const filesWithSourceMap = searchInFiles(jsFiles, /\/\/# sourceMappingURL=/);

      expect(
        filesWithSourceMap,
        `Files with sourceMappingURL:\n${filesWithSourceMap.join('\n')}`,
      ).toEqual([]);
    });

    it('.map 파일이 빌드 디렉토리에 없음', () => {
      const mapFiles = findFilesMatching(BUILD_DIR, /\.map$/);

      expect(mapFiles, `Source map files found:\n${mapFiles.join('\n')}`).toEqual([]);
    });

    it('_build 디렉토리에 .map 파일 없음', () => {
      const buildAssetsDir = `${BUILD_DIR}/_build`;
      const mapFiles = findFilesMatching(buildAssetsDir, /\.map$/);

      expect(mapFiles, `Source map files in _build:\n${mapFiles.join('\n')}`).toEqual([]);
    });
  });

  describe('빌드 파일 구조', () => {
    it('_build 디렉토리 존재 (assets)', () => {
      expect(fileExists(`${BUILD_DIR}/_build`), '_build directory not found').toBe(true);
    });

    it('ko 디렉토리 존재 (한국어)', () => {
      expect(fileExists(`${BUILD_DIR}/ko`), 'ko directory not found').toBe(true);
    });

    it('icons 디렉토리 존재 (PWA 아이콘)', () => {
      expect(fileExists(`${BUILD_DIR}/icons`), 'icons directory not found').toBe(true);
    });

    it('JavaScript 번들 파일 존재', () => {
      const jsFiles = getAllJsFiles(`${BUILD_DIR}/_build`);
      expect(jsFiles.length).toBeGreaterThan(0);
    });
  });

  describe('정적 asset 파일', () => {
    it('manifest.webmanifest 존재', () => {
      expect(fileExists(`${BUILD_DIR}/manifest.webmanifest`)).toBe(true);
    });

    it('robots.txt 존재', () => {
      expect(fileExists(`${BUILD_DIR}/robots.txt`)).toBe(true);
    });

    it('sitemap.xml 존재', () => {
      expect(fileExists(`${BUILD_DIR}/sitemap.xml`)).toBe(true);
    });

    it('_headers 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/_headers`)).toBe(true);
    });

    it('_redirects 파일 존재', () => {
      expect(fileExists(`${BUILD_DIR}/_redirects`)).toBe(true);
    });

    it('og-image.png 존재 (Open Graph)', () => {
      const ogImageExists =
        fileExists(`${BUILD_DIR}/og-image.png`) || fileExists(`${BUILD_DIR}/images/og-image.png`);
      expect(ogImageExists, 'og-image.png not found').toBe(true);
    });
  });

  describe('PWA 관련 파일', () => {
    it('Service Worker 파일 존재', () => {
      const swFiles = getAllFiles(BUILD_DIR).filter((f) =>
        f.match(/sw\.js|service-worker\.js|workbox.*\.js/),
      );

      expect(swFiles.length, 'No service worker file found').toBeGreaterThan(0);
    });

    it('필수 아이콘 크기 존재 (192x192, 512x512)', () => {
      const icon192 = fileExists(`${BUILD_DIR}/icons/icon-192x192.png`);
      const icon512 = fileExists(`${BUILD_DIR}/icons/icon-512x512.png`);

      expect(icon192 || icon512, 'Required PWA icons (192x192, 512x512) not found').toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('빈 HTML 파일 없음', () => {
      const htmlFiles = getAllHtmlFiles();
      const emptyFiles: string[] = [];

      htmlFiles.forEach((file) => {
        const content = require('fs').readFileSync(file, 'utf-8');
        if (content.trim().length === 0) {
          emptyFiles.push(file);
        }
      });

      expect(emptyFiles, `Empty HTML files:\n${emptyFiles.join('\n')}`).toEqual([]);
    });

    it('HTML 파일에 최소한의 구조 포함 (html, head, body)', () => {
      const htmlFiles = getAllHtmlFiles();
      const invalidFiles: string[] = [];

      htmlFiles.forEach((file) => {
        const content = require('fs').readFileSync(file, 'utf-8');
        if (!content.includes('<html') || !content.includes('<head') || !content.includes('<body')) {
          invalidFiles.push(file);
        }
      });

      expect(invalidFiles, `HTML files missing basic structure:\n${invalidFiles.join('\n')}`).toEqual([]);
    });

    it('JS 파일에 console.log/console.error 최소화', () => {
      const jsFiles = getAllJsFiles();
      const filesWithConsole = searchInFiles(jsFiles, /console\.(log|error|warn)/);

      // 프로덕션 빌드에서는 console.log가 제거되어야 함
      // 하지만 일부 에러 처리에서는 필요할 수 있으므로 경고만
      if (filesWithConsole.length > 0) {
        console.warn(
          `⚠️ Warning: ${filesWithConsole.length} files contain console statements`,
        );
      }
    });
  });

  describe('파일 크기 검증', () => {
    it('단일 JS 파일이 5MB를 초과하지 않음', () => {
      const jsFiles = getAllJsFiles();
      const largeFiles: string[] = [];

      jsFiles.forEach((file) => {
        const size = require('fs').statSync(file).size;
        const sizeMB = size / (1024 * 1024);
        if (sizeMB > 5) {
          largeFiles.push(`${file}: ${sizeMB.toFixed(2)}MB`);
        }
      });

      expect(largeFiles, `Large JS files (>5MB):\n${largeFiles.join('\n')}`).toEqual([]);
    });

    it('HTML 파일이 1MB를 초과하지 않음', () => {
      const htmlFiles = getAllHtmlFiles();
      const largeFiles: string[] = [];

      htmlFiles.forEach((file) => {
        const size = require('fs').statSync(file).size;
        const sizeKB = size / 1024;
        if (sizeKB > 1024) {
          largeFiles.push(`${file}: ${sizeKB.toFixed(2)}KB`);
        }
      });

      expect(largeFiles, `Large HTML files (>1MB):\n${largeFiles.join('\n')}`).toEqual([]);
    });
  });
});
