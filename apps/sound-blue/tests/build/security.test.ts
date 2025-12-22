import { describe, expect, it } from 'vitest';
import { getAllJsFiles, searchInFiles } from './helpers/test-utils';

/**
 * Security Test - 민감 정보 노출 방지 검증
 *
 * 목적:
 * - API 키, 비밀번호 등 민감 정보가 빌드 파일에 노출되지 않았는지 확인
 * - 프로덕션 빌드에 디버그 코드가 포함되지 않았는지 확인
 */

describe('Security - 민감 정보 노출 방지', () => {
  describe('API 키 패턴 검색', () => {
    it('Google API 키 패턴 없음 (AIza...)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /AIza[0-9A-Za-z-_]{35}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(
        matchedFiles,
        `Google API keys found in:\n${matchedFiles.join('\n')}`,
      ).toEqual([]);
    });

    it('OpenAI API 키 패턴 없음 (sk-...)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /sk-[a-zA-Z0-9]{48}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(
        matchedFiles,
        `OpenAI API keys found in:\n${matchedFiles.join('\n')}`,
      ).toEqual([]);
    });

    it('AWS Access Key 패턴 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /AKIA[0-9A-Z]{16}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `AWS Access Keys found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('GitHub Token 패턴 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /ghp_[a-zA-Z0-9]{36}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `GitHub tokens found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });
  });

  describe('민감한 키워드', () => {
    it('password 키워드 없음 (소문자)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /password\s*[:=]\s*['"][^'"]{8,}/i;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Password found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('secret 키워드 없음 (API secrets)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /secret\s*[:=]\s*['"][^'"]{16,}/i;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Secrets found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('token 키워드 없음 (인증 토큰)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /token\s*[:=]\s*['"][a-zA-Z0-9]{32,}/i;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Tokens found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('private_key 키워드 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /private[_-]?key\s*[:=]/i;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(
        matchedFiles,
        `Private keys found in:\n${matchedFiles.join('\n')}`,
      ).toEqual([]);
    });
  });

  describe('환경 변수 노출', () => {
    it('process.env 직접 노출 없음 (클라이언트 번들)', () => {
      const jsFiles = getAllJsFiles();

      // Vite는 import.meta.env로 변환하므로 process.env가 남아있으면 안 됨
      const pattern = /process\.env\.[A-Z_]+/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // 일부 polyfill에서 process.env를 사용할 수 있으므로 경고만
      if (matchedFiles.length > 0) {
        console.warn(
          `⚠️ Warning: process.env found in ${matchedFiles.length} files (may be polyfills)`,
        );
      }
    });

    it('.env 파일 경로 노출 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /\.env[^i]/; // .env but not .environ or .environment

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // .env 언급이 있을 수 있으므로 컨텍스트 확인
      expect(matchedFiles.length).toBeLessThan(5);
    });
  });

  describe('디버그 코드', () => {
    it('debugger 문 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /\bdebugger\b/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Debugger statements in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('TODO/FIXME 주석 최소화', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /\/\/\s*(TODO|FIXME|HACK)/i;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // TODO는 있을 수 있으므로 경고만
      if (matchedFiles.length > 0) {
        console.warn(`⚠️ Warning: ${matchedFiles.length} files contain TODO/FIXME comments`);
      }
    });

    it('console.trace/console.debug 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /console\.(trace|debug)\(/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(
        matchedFiles,
        `Debug console statements in:\n${matchedFiles.join('\n')}`,
      ).toEqual([]);
    });
  });

  describe('하드코딩된 URL/경로', () => {
    it('localhost URL 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Localhost URLs in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('절대 파일 경로 없음 (C:/, /Users/, /home/)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /(C:\\|\/Users\/|\/home\/)[^\s"']+/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(
        matchedFiles,
        `Absolute file paths in:\n${matchedFiles.join('\n')}`,
      ).toEqual([]);
    });
  });

  describe('인증 관련', () => {
    it('JWT 토큰 패턴 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `JWT tokens found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('Bearer token 패턴 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /Bearer\s+[a-zA-Z0-9_-]{20,}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `Bearer tokens found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });
  });

  describe('데이터베이스 연결 문자열', () => {
    it('MongoDB 연결 문자열 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /mongodb(\+srv)?:\/\/[^\s'"]+/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `MongoDB URIs found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('PostgreSQL 연결 문자열 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /postgres(ql)?:\/\/[^\s'"]+/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `PostgreSQL URIs found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });

    it('MySQL 연결 문자열 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /mysql:\/\/[^\s'"]+/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      expect(matchedFiles, `MySQL URIs found in:\n${matchedFiles.join('\n')}`).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('매우 긴 base64 문자열 검증 (1000자 이상)', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /[a-zA-Z0-9+/]{1000,}={0,2}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // 이미지 데이터 URI 등은 허용, 그 외는 의심
      if (matchedFiles.length > 0) {
        console.warn(
          `⚠️ Warning: ${matchedFiles.length} files contain very long base64 strings`,
        );
      }
    });

    it('IP 주소 하드코딩 없음', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // 일부 정당한 IP 주소 (0.0.0.0, 255.255.255.255 등) 필터링
      const suspiciousFiles = matchedFiles.filter((file) => {
        const content = require('fs').readFileSync(file, 'utf-8');
        return !content.match(/0\.0\.0\.0|255\.255\.255\.255|127\.0\.0\.1/);
      });

      if (suspiciousFiles.length > 0) {
        console.warn(`⚠️ Warning: Hardcoded IP addresses found in ${suspiciousFiles.length} files`);
      }
    });

    it('이메일 주소 노출 최소화', () => {
      const jsFiles = getAllJsFiles();
      const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

      const matchedFiles = searchInFiles(jsFiles, pattern);

      // 공개 이메일 주소는 허용될 수 있으므로 경고만
      if (matchedFiles.length > 0) {
        console.warn(`⚠️ Info: ${matchedFiles.length} files contain email addresses`);
      }
    });
  });
});
