import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router';
import { SearchBox } from './SearchBox';

// Mock messages
vi.mock('~/lib/messages', () => ({
  default: {
    'search.placeholder': () => 'Search...',
    'search.label': () => 'Search site',
    'search.clear': () => 'Clear search',
    'search.noResults': () => 'No results found',
    search_pages_home_title: () => 'Home',
    search_pages_home_desc: () => 'Main page',
    search_pages_sitemap_title: () => 'Sitemap',
    search_pages_sitemap_desc: () => 'Site structure',
    search_pages_privacy_title: () => 'Privacy',
    search_pages_privacy_desc: () => 'Privacy policy',
    search_pages_terms_title: () => 'Terms',
    search_pages_terms_desc: () => 'Terms of service',
    search_pages_license_title: () => 'License',
    search_pages_license_desc: () => 'License information',
    search_pages_soundRecording_title: () => 'Sound Recording',
    search_pages_soundRecording_desc: () => 'Sound recording info',
  },
}));

// Mock useParaglideI18n
vi.mock('@soundblue/shared-react', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
  }),
}));

describe('SearchBox', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('렌더링', () => {
    it('검색 입력창 렌더링', () => {
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'search');
    });

    it('placeholder 표시', () => {
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('검색 아이콘 렌더링', () => {
      const { container } = renderWithRouter(<SearchBox />);
      const searchIcon = container.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('키보드 단축키 힌트', () => {
    it('Mac에서 ⌘K 표시', () => {
      // Mock Mac user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });

      const { container } = renderWithRouter(<SearchBox />);
      const hint = container.querySelector('.pointer-events-none');
      expect(hint?.textContent).toBe('⌘K');
    });

    it('Windows에서 Ctrl+K 표시', () => {
      // Mock Windows user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true,
      });

      const { container, rerender } = renderWithRouter(<SearchBox />);
      rerender(
        <BrowserRouter>
          <SearchBox />
        </BrowserRouter>,
      );

      const hint = container.querySelector('.pointer-events-none');
      expect(hint?.textContent).toBe('Ctrl+K');
    });

    it('입력 중에는 단축키 힌트 숨김', async () => {
      const { container, user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'test');

      const hint = container.querySelector('.pointer-events-none');
      expect(hint).not.toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('텍스트 입력 시 검색 결과 표시', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });

    it('일치하는 결과 없을 때 메시지 표시', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('빈 검색어는 결과 표시 안 함', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '   '); // 공백만

      const listbox = screen.queryByRole('listbox');
      expect(listbox).not.toBeInTheDocument();
    });

    it('대소문자 구분 없이 검색', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'HOME');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });
  });

  describe('Clear 버튼', () => {
    it('텍스트 입력 시 Clear 버튼 표시', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'test');

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('Clear 버튼 클릭 시 입력 초기화', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox') as HTMLInputElement;

      await user.type(searchInput, 'test');
      expect(searchInput.value).toBe('test');

      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(searchInput.value).toBe('');
    });

    it('빈 입력창일 때 Clear 버튼 숨김', () => {
      renderWithRouter(<SearchBox />);
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('키보드 네비게이션', () => {
    it('ArrowDown으로 다음 결과 선택', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'p'); // privacy, sitemap 등 여러 결과

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const selected = screen.queryByRole('option', { selected: true });
        expect(selected).toBeInTheDocument();
      });
    });

    it('Escape으로 검색 결과 닫기', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        const listbox = screen.queryByRole('listbox');
        expect(listbox).not.toBeInTheDocument();
      });
    });
  });

  describe('접근성', () => {
    it('combobox role 설정', () => {
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toBeInTheDocument();
    });

    it('aria-label 설정', () => {
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByLabelText('Search site');
      expect(searchInput).toBeInTheDocument();
    });

    it('aria-expanded 설정', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      expect(searchInput).toHaveAttribute('aria-expanded', 'false');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(searchInput).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('listbox role 설정 (결과 목록)', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });

    it('option role 설정 (각 결과)', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('특수 문자 검색', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '/@#$%');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('매우 긴 검색어', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox') as HTMLInputElement;

      const longQuery = 'a'.repeat(1000);
      await user.type(searchInput, longQuery);

      expect(searchInput.value).toBe(longQuery);
    });

    it('숫자만 입력', async () => {
      const { user } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '12345');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });
  });
});
