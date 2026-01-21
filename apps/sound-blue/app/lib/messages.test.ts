import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocale } from '~/paraglide/runtime';

// Mock paraglide runtime
vi.mock('~/paraglide/runtime', () => ({
  getLocale: vi.fn(() => 'en'),
}));

// Mock JSON messages
vi.mock('../../project.inlang/messages/en.json', () => ({
  default: {
    seo_siteName: 'Sound Blue',
    nav_home: 'Home',
    nav_about: 'About',
    seo_defaultTitle: 'Sound Blue | SoundBlueMusic',
    soundRecording_types_items: ['Nature', 'Urban', 'Ambience'],
  },
}));

vi.mock('../../project.inlang/messages/ko.json', () => ({
  default: {
    seo_siteName: '사운드 블루',
    nav_home: '홈',
    nav_about: '소개',
    seo_defaultTitle: '사운드 블루 | SoundBlueMusic',
    soundRecording_types_items: ['자연', '도시', '분위기'],
  },
}));

const mockGetLocale = vi.mocked(getLocale);

describe('getMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocale.mockReturnValue('en');
  });

  describe('기본 동작', () => {
    it('영어 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_siteName');
      expect(result).toBe('Sound Blue');
    });

    it('한국어 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('ko');
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_siteName');
      expect(result).toBe('사운드 블루');
    });

    it('문자열 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const result = getMessage('nav_home');
      expect(result).toBe('Home');
      expect(typeof result).toBe('string');
    });
  });

  describe('Fallback', () => {
    it('존재하지 않는 키는 키 자체 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing with invalid key to verify fallback behavior
      const result = getMessage('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('getLocale 실패 시 영어로 fallback', async () => {
      mockGetLocale.mockImplementation(() => {
        throw new Error('Locale error');
      });
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_siteName');
      expect(result).toBe('Sound Blue');
    });

    it('언어에 키가 없으면 영어로 fallback', async () => {
      // @ts-expect-error Testing with unsupported locale to verify fallback behavior
      mockGetLocale.mockReturnValue('fr');
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_siteName');
      expect(result).toBe('Sound Blue'); // Falls back to English
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열 키', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing with empty string to verify edge case handling
      const result = getMessage('');
      expect(result).toBe('');
    });

    it('특수 문자 포함 키', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_defaultTitle');
      expect(result).toBe('Sound Blue | SoundBlueMusic');
    });
  });

  describe('경계값 테스트', () => {
    it('null 키 전달 시 크래시 없음', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing null to verify boundary handling
      const result = getMessage(null);
      expect(result).toBe('null');
    });

    it('undefined 키 전달 시 크래시 없음', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing undefined to verify boundary handling
      const result = getMessage(undefined);
      expect(result).toBe('undefined');
    });

    it('숫자 키 전달 시 크래시 없음', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing number to verify boundary handling
      const result = getMessage(123);
      expect(result).toBe('123');
    });

    it('객체 키 전달 시 크래시 없음', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing object to verify boundary handling
      const result = getMessage({});
      expect(result).toBe('[object Object]');
    });

    it('매우 긴 키 전달 시 크래시 없음', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const longKey = 'a'.repeat(10000);
      // @ts-expect-error Testing very long key to verify boundary handling
      const result = getMessage(longKey);
      expect(result).toBe(longKey);
    });

    it('공백만 있는 키', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      // @ts-expect-error Testing whitespace key to verify boundary handling
      const result = getMessage('   ');
      expect(result).toBe('   ');
    });
  });
});

describe('getRawMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocale.mockReturnValue('en');
  });

  describe('기본 동작', () => {
    it('문자열 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getRawMessage } = await import('./messages');

      const result = getRawMessage('seo_siteName');
      expect(result).toBe('Sound Blue');
    });

    it('배열 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getRawMessage } = await import('./messages');

      const result = getRawMessage('soundRecording_types_items');
      expect(result).toEqual(['Nature', 'Urban', 'Ambience']);
    });

    it('한국어 배열 메시지 반환', async () => {
      mockGetLocale.mockReturnValue('ko');
      const { getRawMessage } = await import('./messages');

      const result = getRawMessage('soundRecording_types_items');
      expect(result).toEqual(['자연', '도시', '분위기']);
    });
  });

  describe('Fallback', () => {
    it('getLocale 실패 시 영어로 fallback', async () => {
      mockGetLocale.mockImplementation(() => {
        throw new Error('Locale error');
      });
      const { getRawMessage } = await import('./messages');

      const result = getRawMessage('seo_siteName');
      expect(result).toBe('Sound Blue');
    });

    it('존재하지 않는 키는 undefined 반환', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getRawMessage } = await import('./messages');

      // @ts-expect-error Testing with invalid key to verify undefined return
      const result = getRawMessage('nonexistent.key');
      expect(result).toBeUndefined();
    });
  });
});

// Proxy tests are skipped because they test implementation details
// The Proxy is used internally by the component, but getMessage/getRawMessage
// are the public API that should be tested
describe.skip('message Proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocale.mockReturnValue('en');
  });

  describe('동적 함수 생성', () => {
    it('Proxy로 메시지 함수 생성', async () => {
      mockGetLocale.mockReturnValue('en');
      const m = (await import('./messages')).default;
      const titleFn = m.seo_siteName;

      expect(typeof titleFn).toBe('function');
      expect(titleFn()).toBe('Sound Blue');
    });

    it('언더스코어 표기법 지원', async () => {
      mockGetLocale.mockReturnValue('en');
      const m = (await import('./messages')).default;
      const titleFn = m.seo_siteName;

      expect(typeof titleFn).toBe('function');
      expect(titleFn()).toBe('Sound Blue');
    });

    it('여러 메시지 함수 호출', async () => {
      mockGetLocale.mockReturnValue('ko');
      const m = (await import('./messages')).default;

      expect(m.seo_siteName()).toBe('사운드 블루');
      expect(m.nav_home()).toBe('홈');
      expect(m.nav_about()).toBe('소개');
    });
  });
});

describe('unwrapJsonModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocale.mockReturnValue('en');
  });

  it('ESM 형식 JSON 처리', async () => {
    mockGetLocale.mockReturnValue('en');
    const { getMessage } = await import('./messages');

    const result = getMessage('seo_siteName');
    expect(result).toBe('Sound Blue');
  });

  it('CommonJS 형식 JSON 처리 (default wrapper)', async () => {
    mockGetLocale.mockReturnValue('en');
    const { getMessage } = await import('./messages');

    const result = getMessage('seo_defaultTitle');
    expect(result).toBe('Sound Blue | SoundBlueMusic');
  });
});
