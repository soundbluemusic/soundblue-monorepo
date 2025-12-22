import { describe, expect, it, vi } from 'vitest';
import { getMessage, getRawMessage } from './messages';

// Mock paraglide runtime
vi.mock('~/paraglide/runtime', () => ({
  getLocale: vi.fn(() => 'en'),
}));

// Mock JSON messages
vi.mock('../../project.inlang/messages/en.json', () => ({
  default: {
    'header.title': 'Sound Blue',
    'header.langSwitch': 'Switch Language',
    'footer.copyright': '© 2024 Sound Blue',
    'search.placeholder': 'Search...',
    'menu.items': ['Home', 'About', 'Contact'],
  },
}));

vi.mock('../../project.inlang/messages/ko.json', () => ({
  default: {
    'header.title': '사운드 블루',
    'header.langSwitch': '언어 전환',
    'footer.copyright': '© 2024 사운드 블루',
    'search.placeholder': '검색...',
    'menu.items': ['홈', '소개', '연락'],
  },
}));

describe('getMessage', () => {
  describe('기본 동작', () => {
    it('영어 메시지 반환', () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getMessage('header.title');
      expect(result).toBe('Sound Blue');
    });

    it('한국어 메시지 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('ko');

      const result = getMessage('header.title');
      expect(result).toBe('사운드 블루');
    });

    it('문자열 메시지 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getMessage('search.placeholder');
      expect(result).toBe('Search...');
      expect(typeof result).toBe('string');
    });
  });

  describe('Fallback', () => {
    it('존재하지 않는 키는 키 자체 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getMessage('nonexistent.key' as any);
      expect(result).toBe('nonexistent.key');
    });

    it('getLocale 실패 시 영어로 fallback', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockImplementation(() => {
        throw new Error('Locale error');
      });

      const result = getMessage('header.title');
      expect(result).toBe('Sound Blue');
    });

    it('언어에 키가 없으면 영어로 fallback', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('fr'); // Unsupported locale

      const result = getMessage('header.title');
      expect(result).toBe('Sound Blue'); // Falls back to English
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열 키', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getMessage('' as any);
      expect(result).toBe('');
    });

    it('특수 문자 포함 키', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getMessage('search.placeholder');
      expect(result).toBe('Search...');
    });
  });
});

describe('getRawMessage', () => {
  describe('기본 동작', () => {
    it('문자열 메시지 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getRawMessage('header.title');
      expect(result).toBe('Sound Blue');
    });

    it('배열 메시지 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getRawMessage('menu.items');
      expect(result).toEqual(['Home', 'About', 'Contact']);
    });

    it('한국어 배열 메시지 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('ko');

      const result = getRawMessage('menu.items');
      expect(result).toEqual(['홈', '소개', '연락']);
    });
  });

  describe('Fallback', () => {
    it('getLocale 실패 시 영어로 fallback', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockImplementation(() => {
        throw new Error('Locale error');
      });

      const result = getRawMessage('header.title');
      expect(result).toBe('Sound Blue');
    });

    it('존재하지 않는 키는 undefined 반환', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const result = getRawMessage('nonexistent.key' as any);
      expect(result).toBeUndefined();
    });
  });
});

describe('message Proxy', () => {
  describe('동적 함수 생성', () => {
    it('Proxy로 메시지 함수 생성', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const m = (await import('./messages')).default;
      const titleFn = m['header.title'];

      expect(typeof titleFn).toBe('function');
      expect(titleFn()).toBe('Sound Blue');
    });

    it('언더스코어 표기법 지원', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('en');

      const m = (await import('./messages')).default;
      const titleFn = m.header_title;

      expect(typeof titleFn).toBe('function');
      expect(titleFn()).toBe('Sound Blue');
    });

    it('여러 메시지 함수 호출', async () => {
      const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
      getLocale.mockReturnValue('ko');

      const m = (await import('./messages')).default;

      expect(m['header.title']()).toBe('사운드 블루');
      expect(m['header.langSwitch']()).toBe('언어 전환');
      expect(m['footer.copyright']()).toBe('© 2024 사운드 블루');
    });
  });
});

describe('unwrapJsonModule', () => {
  it('ESM 형식 JSON 처리', () => {
    // Internal function, tested through getMessage
    const { getLocale } = vi.mocked(require('~/paraglide/runtime'));
    getLocale.mockReturnValue('en');

    const result = getMessage('header.title');
    expect(result).toBe('Sound Blue');
  });

  it('CommonJS 형식 JSON 처리 (default wrapper)', async () => {
    // getMessage should handle both formats
    const { getLocale } = vi.mocked(await import('~/paraglide/runtime'));
    getLocale.mockReturnValue('en');

    const result = getMessage('footer.copyright');
    expect(result).toBe('© 2024 Sound Blue');
  });
});
