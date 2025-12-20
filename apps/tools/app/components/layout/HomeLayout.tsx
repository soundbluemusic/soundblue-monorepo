'use client';

import { useTheme } from '@soundblue/shared-react';
import { Code2, FileText, Globe, Info, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { useI18n } from '~/i18n';
import { ALL_TOOLS, type ToolInfo } from '~/lib/toolCategories';
import { cn } from '~/lib/utils';
import { useToolStore } from '~/stores/tool-store';

// ========================================
// HomeLayout Component - 런처 스타일 홈 레이아웃
// ========================================

export function HomeLayout() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggleLanguage, t, localizedPath } = useI18n();
  const navigate = useNavigate();
  const { openTool } = useToolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Filter tools based on search query
  const filteredTools = () => {
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
  };

  const handleToolClick = (tool: ToolInfo) => {
    openTool(tool.id);
    navigate(localizedPath(`/${tool.slug}`));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="relative z-30 flex h-14 items-center justify-between border-b px-4">
        <Link to={localizedPath('/')} className="text-lg font-semibold tracking-tight text-brand">
          {t.brand}
        </Link>

        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme === 'dark' ? t.theme.light : t.theme.dark}
            className="text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1.5 px-3 text-muted-foreground hover:text-foreground"
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
              aria-label={t.common.menu}
              aria-expanded={menuOpen}
              className="text-muted-foreground hover:text-foreground"
            >
              {menuOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Menu className="h-[18px] w-[18px]" />
              )}
            </Button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                className={cn(
                  'absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border bg-card p-1 shadow-lg',
                  'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
                )}
              >
                <Link
                  to={localizedPath('/built-with')}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                    'text-muted-foreground transition-colors',
                    'hover:bg-primary/10 hover:text-foreground',
                  )}
                >
                  <Code2 className="h-4 w-4" />
                  <span>{t.navigation.builtWith}</span>
                </Link>
                <Link
                  to={localizedPath('/about')}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                    'text-muted-foreground transition-colors',
                    'hover:bg-primary/10 hover:text-foreground',
                  )}
                >
                  <Info className="h-4 w-4" />
                  <span>{t.navigation.about}</span>
                </Link>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                    'text-muted-foreground transition-colors',
                    'hover:bg-primary/10 hover:text-foreground',
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>{t.sidebar.sitemap}</span>
                </a>
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
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale === 'ko' ? '도구 검색...' : 'Search tools...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className={cn(
                  'w-full rounded-2xl border bg-card py-3 pl-12 pr-4',
                  'text-base placeholder:text-muted-foreground',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                )}
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            {filteredTools().map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleToolClick(tool)}
                className={cn(
                  'group flex flex-col items-center gap-3 rounded-2xl p-4 md:p-6',
                  'bg-card border transition-all duration-200',
                  'hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1',
                  'active:scale-[0.98] active:translate-y-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl md:h-16 md:w-16',
                    'bg-primary/10 text-3xl md:text-4xl',
                    'transition-transform duration-200 group-hover:scale-110',
                  )}
                >
                  {tool.icon}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-foreground md:text-base">
                  {tool.name[locale]}
                </span>

                {/* Description - hidden on mobile */}
                <span className="hidden text-center text-xs text-muted-foreground md:block">
                  {tool.description[locale]}
                </span>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {filteredTools().length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {locale === 'ko' ? '검색 결과가 없습니다' : 'No tools found'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-3">
        <p className="text-center text-xs text-muted-foreground">
          Tools by{' '}
          <a
            href="https://soundbluemusic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            SoundBlueMusic
          </a>
        </p>
      </footer>
    </div>
  );
}
