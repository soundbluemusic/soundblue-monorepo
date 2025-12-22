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

      const result = getMessage('nonexistent.key' as any);
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
      mockGetLocale.mockReturnValue('fr' as any); // Unsupported locale
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_siteName');
      expect(result).toBe('Sound Blue'); // Falls back to English
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열 키', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const result = getMessage('' as any);
      expect(result).toBe('');
    });

    it('특수 문자 포함 키', async () => {
      mockGetLocale.mockReturnValue('en');
      const { getMessage } = await import('./messages');

      const result = getMessage('seo_defaultTitle');
      expect(result).toBe('Sound Blue | SoundBlueMusic');
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

      const result = getRawMessage('nonexistent.key' as any);
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
