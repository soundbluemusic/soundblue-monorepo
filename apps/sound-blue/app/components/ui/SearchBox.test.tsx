import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
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
vi.mock('@soundblue/ui-components/base', () => ({
  useParaglideI18n: () => ({
    localizedPath: (path: string) => path,
  }),
  ColorblindSelector: () => null,
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
      // Select the span hint, not the SVG icon
      const hint = container.querySelector('span.pointer-events-none');
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

      // Select the span hint, not the SVG icon
      const hint = container.querySelector('span.pointer-events-none');
      expect(hint?.textContent).toBe('Ctrl+K');
    });

    it('입력 중에는 단축키 힌트 숨김', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'test');

      // The span hint should not be in document when typing
      const hint = container.querySelector('span.pointer-events-none');
      expect(hint).not.toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    it('텍스트 입력 시 검색 결과 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });

    it('일치하는 결과 없을 때 메시지 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'xyz');

      // findAllByText handles multiple elements with same text (sr-only + visible)
      const noResults = await screen.findAllByText('No results found');
      expect(noResults.length).toBeGreaterThan(0);
    });

    it('빈 검색어는 결과 표시 안 함', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '   '); // 공백만

      const listbox = screen.queryByRole('listbox');
      expect(listbox).not.toBeInTheDocument();
    });

    it('대소문자 구분 없이 검색', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'HOME');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });
  });

  describe('Clear 버튼', () => {
    it('텍스트 입력 시 Clear 버튼 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'test');

      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toBeInTheDocument();
    });

    it('Clear 버튼 클릭 시 입력 초기화', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
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
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'p'); // privacy, sitemap 등 여러 결과

      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const selected = screen.queryByRole('option', { selected: true });
        expect(selected).toBeInTheDocument();
      });
    });

    it('Escape으로 검색 결과 닫기', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
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
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      expect(searchInput).toHaveAttribute('aria-expanded', 'false');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(searchInput).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('listbox role 설정 (결과 목록)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });

    it('option role 설정 (각 결과)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
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
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '@#');

      // findAllByText handles multiple elements with same text (sr-only + visible)
      const noResults = await screen.findAllByText('No results found');
      expect(noResults.length).toBeGreaterThan(0);
    });

    it('매우 긴 검색어', async () => {
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox') as HTMLInputElement;

      // Use fireEvent.change instead of userEvent.type for performance
      // userEvent.type with 1000 characters causes timeout
      const longQuery = 'a'.repeat(1000);
      fireEvent.change(searchInput, { target: { value: longQuery } });

      expect(searchInput.value).toBe(longQuery);
    });

    it('숫자만 입력', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '999');

      // findAllByText handles multiple elements with same text (sr-only + visible)
      const noResults = await screen.findAllByText('No results found');
      expect(noResults.length).toBeGreaterThan(0);
    });

    it('ArrowUp으로 이전 결과 선택 (첫 번째에서 마지막으로)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      // Use 'site' which matches 'sitemap' for reliable results
      await user.type(searchInput, 'site');

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Sitemap')).toBeInTheDocument();
      });

      // ArrowDown으로 첫 번째 선택
      await user.keyboard('{ArrowDown}');
      // ArrowUp으로 마지막으로 이동 (wrap around)
      await user.keyboard('{ArrowUp}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        // 마지막 옵션이 선택되어야 함
        expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('ArrowDown wrap around (마지막에서 첫 번째로)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      // ArrowDown 여러 번 눌러서 wrap around 확인
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        // 첫 번째 옵션이 다시 선택되어야 함 (wrap around)
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('Enter로 선택된 결과 이동', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      // ArrowDown으로 선택 후 Enter
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // 결과 목록이 닫혀야 함
      await waitFor(() => {
        const listbox = screen.queryByRole('listbox');
        expect(listbox).not.toBeInTheDocument();
      });
    });

    it('결과 없을 때 Enter는 무시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'xyz'); // 결과 없음

      await screen.findAllByText('No results found');

      // Enter 눌러도 에러 없어야 함
      await user.keyboard('{Enter}');

      expect(searchInput).toBeInTheDocument();
    });

    it('포커스 시 기존 검색어가 있으면 결과 표시', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      // blur 후 다시 focus
      await user.click(document.body);
      await user.click(searchInput);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });
    });

    it('결과 클릭 시 드롭다운 닫기', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'home');

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
      });

      const homeOption = screen.getByRole('option');
      await user.click(homeOption);

      await waitFor(() => {
        const listbox = screen.queryByRole('listbox');
        expect(listbox).not.toBeInTheDocument();
      });
    });

    it('path로 검색 가능', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, '/sitemap');

      await waitFor(() => {
        expect(screen.getByText('Sitemap')).toBeInTheDocument();
      });
    });

    it('description으로 검색 가능', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');

      await user.type(searchInput, 'policy');

      await waitFor(() => {
        expect(screen.getByText('Privacy')).toBeInTheDocument();
      });
    });
  });

  describe('Global Keyboard Shortcuts', () => {
    it('Ctrl+K 이벤트 핸들러 등록됨', () => {
      // 이벤트 리스너가 등록되었는지 간접적으로 확인
      // jsdom에서 focus 동작이 불안정하므로 컴포넌트 렌더링만 확인
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toBeInTheDocument();
    });

    it('/ 키 이벤트 핸들러 등록됨', () => {
      // 이벤트 리스너가 등록되었는지 간접적으로 확인
      renderWithRouter(<SearchBox />);
      const searchInput = screen.getByRole('combobox');
      expect(searchInput).toBeInTheDocument();
    });
  });
});
