import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock router
const mockNavigate = vi.fn();
let mockPathname = '/';

vi.mock('@solidjs/router', () => ({
  useLocation: () => ({
    pathname: mockPathname,
  }),
  useNavigate: () => mockNavigate,
}));

// Mock translation files
vi.mock('../../../messages/en.json', () => ({
  default: {
    nav: { home: 'Home', about: 'About' },
    header: { langCode: 'EN' },
  },
}));

vi.mock('../../../messages/ko.json', () => ({
  default: {
    nav: { home: '홈', about: '소개' },
    header: { langCode: 'KO' },
  },
}));

import { I18nProvider, useLanguage } from './I18nProvider';

describe('I18nProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
  });

  it('should provide i18n context to children', () => {
    function TestChild() {
      const { language } = useLanguage();
      return <div data-testid="lang">{language()}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('lang')).toBeInTheDocument();
  });

  it('should detect English language from root path', () => {
    mockPathname = '/';

    function TestChild() {
      const { language } = useLanguage();
      return <div data-testid="lang">{language()}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('lang')).toHaveTextContent('en');
  });

  it('should detect Korean language from /ko path', () => {
    mockPathname = '/ko';

    function TestChild() {
      const { language } = useLanguage();
      return <div data-testid="lang">{language()}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('lang')).toHaveTextContent('ko');
  });

  it('should detect Korean language from /ko/ path', () => {
    mockPathname = '/ko/about';

    function TestChild() {
      const { language } = useLanguage();
      return <div data-testid="lang">{language()}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('lang')).toHaveTextContent('ko');
  });

  it('should return English translations for English path', () => {
    mockPathname = '/';

    function TestChild() {
      const { t } = useLanguage();
      return <div data-testid="translation">{t().nav.home}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('translation')).toHaveTextContent('Home');
  });

  it('should return Korean translations for Korean path', () => {
    mockPathname = '/ko/';

    function TestChild() {
      const { t } = useLanguage();
      return <div data-testid="translation">{t().nav.home}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('translation')).toHaveTextContent('홈');
  });

  it('should generate localized path for English', () => {
    mockPathname = '/';

    function TestChild() {
      const { localizedPath } = useLanguage();
      return <div data-testid="path">{localizedPath('/about')}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('path')).toHaveTextContent('/about/');
  });

  it('should generate localized path for Korean', () => {
    mockPathname = '/ko/';

    function TestChild() {
      const { localizedPath } = useLanguage();
      return <div data-testid="path">{localizedPath('/about')}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('path')).toHaveTextContent('/ko/about/');
  });

  it('should handle root path localization for Korean', () => {
    mockPathname = '/ko/';

    function TestChild() {
      const { localizedPath } = useLanguage();
      return <div data-testid="path">{localizedPath('/')}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('path')).toHaveTextContent('/ko/');
  });

  it('should navigate to Korean version when toggling from English', async () => {
    mockPathname = '/about';
    const user = userEvent.setup();

    function TestChild() {
      const { toggleLanguage } = useLanguage();
      return (
        <button type="button" onClick={toggleLanguage}>
          Toggle
        </button>
      );
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    await user.click(screen.getByText('Toggle'));
    expect(mockNavigate).toHaveBeenCalledWith('/ko/about/');
  });

  it('should navigate to English version when toggling from Korean', async () => {
    mockPathname = '/ko/about';
    const user = userEvent.setup();

    function TestChild() {
      const { toggleLanguage } = useLanguage();
      return (
        <button type="button" onClick={toggleLanguage}>
          Toggle
        </button>
      );
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    await user.click(screen.getByText('Toggle'));
    expect(mockNavigate).toHaveBeenCalledWith('/about/');
  });

  it('should set language directly', async () => {
    mockPathname = '/';
    const user = userEvent.setup();

    function TestChild() {
      const { setLanguage } = useLanguage();
      return (
        <button type="button" onClick={() => setLanguage('ko')}>
          Set Korean
        </button>
      );
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    await user.click(screen.getByText('Set Korean'));
    expect(mockNavigate).toHaveBeenCalledWith('/ko/');
  });

  it('should return basePath without language prefix', () => {
    mockPathname = '/ko/about/';

    function TestChild() {
      const { basePath } = useLanguage();
      return <div data-testid="basepath">{basePath()}</div>;
    }

    render(() => (
      <I18nProvider>
        <TestChild />
      </I18nProvider>
    ));

    expect(screen.getByTestId('basepath')).toHaveTextContent('/about');
  });

  it('should throw error when useLanguage is used outside provider', () => {
    function TestChild() {
      useLanguage();
      return <div>Test</div>;
    }

    expect(() => render(() => <TestChild />)).toThrow(
      'useLanguage must be used within an I18nProvider',
    );
  });
});
