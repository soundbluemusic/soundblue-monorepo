'use client';

import { useParaglideI18n, useTheme } from '@soundblue/shared-react';
import { Code2, FileText, Globe, Info, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import m from '~/lib/messages';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { useToolStore } from '~/stores/tool-store';

// ========================================
// HomeLayout Component - 런처 스타일 홈 레이아웃
// ========================================

export function HomeLayout() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggleLanguage, localizedPath } = useParaglideI18n();
  const navigate = useNavigate();
  const { openTool } = useToolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Filter tools based on search query (memoized)
  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return ALL_TOOLS;

    return ALL_TOOLS.filter((tool) => {
      const nameMatch =
        tool.name.ko.toLowerCase().includes(query) || tool.name.en.toLowerCase().includes(query);
      const descMatch =
        tool.description.ko.toLowerCase().includes(query) ||
        tool.description.en.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [searchQuery]);

  const handleToolClick = (tool: ToolInfo) => {
    openTool(tool.id);
    navigate(localizedPath(`/${tool.slug}`));
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--background)">
      {/* Header */}
      <header className="relative z-30 flex h-14 items-center justify-between border-b border-(--border) px-4">
        <Link
          to={localizedPath('/')}
          className="text-lg font-semibold tracking-tight text-(--brand) no-underline"
        >
          {m['brand']?.()}
        </Link>

        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme === 'dark' ? m['theme_light']?.() : m['theme_dark']?.()}
            className="text-(--muted-foreground) hover:text-(--foreground)"
          >
            <Sun className="h-[1.125rem] w-[1.125rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.125rem] w-[1.125rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 text-(--muted-foreground) hover:text-(--foreground)"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{locale === 'ko' ? 'KO' : 'EN'}</span>
          </Button>

          {/* Menu Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={m['common_menu']?.()}
              aria-expanded={menuOpen}
              className="text-(--muted-foreground) hover:text-(--foreground)"
            >
              {menuOpen ? (
                <X className="h-[1.125rem] w-[1.125rem]" />
              ) : (
                <Menu className="h-[1.125rem] w-[1.125rem]" />
              )}
            </Button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-(--border) bg-(--card) p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                <Link
                  to={localizedPath('/built-with')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <Code2 className="h-4 w-4" />
                  <span>{m['navigation_builtWith']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/about')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <Info className="h-4 w-4" />
                  <span>{m['navigation_about']?.()}</span>
                </Link>
                <Link
                  to={localizedPath('/sitemap')}
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-(--muted-foreground) no-underline transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-(--foreground)"
                >
                  <FileText className="h-4 w-4" />
                  <span>{m['sidebar_sitemap']?.()}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Search Section */}
          <div className="mb-8 md:mb-12">
            <div className="relative mx-auto max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--muted-foreground)" />
              <input
                type="text"
                placeholder={locale === 'ko' ? '도구 검색...' : 'Search tools...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className="w-full rounded-3xl border border-(--border) bg-(--card) py-3 pl-12 pr-4 text-base transition-all duration-200 placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--ring) focus:ring-offset-2 focus:ring-offset-(--background)"
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool)}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-(--border) bg-(--card) p-4 cursor-pointer transition-all duration-200 md:p-6 hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] hover:shadow-lg hover:-translate-y-1 active:scale-98 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-3xl transition-transform duration-200 md:h-16 md:w-16 md:text-4xl group-hover:scale-110">
                  {tool.icon}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-(--foreground) md:text-base">
                  {tool.name[locale]}
                </span>

                {/* Description - hidden on mobile */}
                <span className="hidden text-center text-xs text-(--muted-foreground) md:block">
                  {tool.description[locale]}
                </span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredTools.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-(--muted-foreground)">
                {locale === 'ko' ? '검색 결과가 없습니다' : 'No tools found'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) px-4 py-3">
        <p className="text-center text-xs text-(--muted-foreground)">
          Tools by{' '}
          <a
            href="https://soundbluemusic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--primary) no-underline hover:underline"
          >
            SoundBlueMusic
          </a>
        </p>
      </footer>
    </div>
  );
}
