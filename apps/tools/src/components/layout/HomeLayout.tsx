import { A, useNavigate } from '@solidjs/router';
import { Globe, Moon, Search, Sun } from 'lucide-solid';
import { type Component, createSignal, For, Show } from 'solid-js';
import { useTheme } from '@/components/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { getLocalizedPath, useLanguage } from '@/i18n';
import { ALL_TOOLS, type ToolInfo } from '@/lib/toolCategories';
import { cn } from '@/lib/utils';
import { toolActions } from '@/stores/tool-store';

// ========================================
// HomeLayout Component - 런처 스타일 홈 레이아웃
// ========================================

export const HomeLayout: Component = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, toggleLanguage, locale, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal('');

  // Filter tools based on search query
  const filteredTools = () => {
    const query = searchQuery().toLowerCase().trim();
    if (!query) return ALL_TOOLS;

    return ALL_TOOLS.filter((tool) => {
      const nameMatch =
        tool.name.ko.toLowerCase().includes(query) ||
        tool.name.en.toLowerCase().includes(query);
      const descMatch =
        tool.description.ko.toLowerCase().includes(query) ||
        tool.description.en.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  };

  const handleToolClick = (tool: ToolInfo) => {
    toolActions.openTool(tool.id);
    navigate(getLocalizedPath(`/${tool.slug}`, locale()));
  };

  return (
    <div class="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header class="flex h-14 items-center justify-between border-b px-4">
        <A
          href={getLocalizedPath('/', locale())}
          class="text-lg font-semibold tracking-tight text-brand"
        >
          {t().brand}
        </A>

        <div class="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark')}
            aria-label={resolvedTheme() === 'dark' ? t().theme.light : t().theme.dark}
            class="text-muted-foreground hover:text-foreground"
          >
            <Sun class="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon class="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            class="gap-1.5 px-3 text-muted-foreground hover:text-foreground"
          >
            <Globe class="h-4 w-4" />
            <span class="text-xs font-semibold">{language() === 'ko' ? 'KO' : 'EN'}</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main class="flex-1 overflow-auto">
        <div class="mx-auto max-w-4xl px-4 py-8 md:py-12">
          {/* Search Section */}
          <div class="mb-8 md:mb-12">
            <div class="relative mx-auto max-w-md">
              <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale() === 'ko' ? '도구 검색...' : 'Search tools...'}
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class={cn(
                  'w-full rounded-2xl border bg-card py-3 pl-12 pr-4',
                  'text-base placeholder:text-muted-foreground',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
                )}
              />
            </div>
          </div>

          {/* Tools Grid */}
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
            <For each={filteredTools()}>
              {(tool) => (
                <button
                  type="button"
                  onClick={() => handleToolClick(tool)}
                  class={cn(
                    'group flex flex-col items-center gap-3 rounded-2xl p-4 md:p-6',
                    'bg-card border transition-all duration-200',
                    'hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1',
                    'active:scale-[0.98] active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  )}
                >
                  {/* Icon */}
                  <div
                    class={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl md:h-16 md:w-16',
                      'bg-primary/10 text-3xl md:text-4xl',
                      'transition-transform duration-200 group-hover:scale-110'
                    )}
                  >
                    {tool.icon}
                  </div>

                  {/* Name */}
                  <span class="text-sm font-medium text-foreground md:text-base">
                    {tool.name[locale()]}
                  </span>

                  {/* Description - hidden on mobile */}
                  <span class="hidden text-center text-xs text-muted-foreground md:block">
                    {tool.description[locale()]}
                  </span>
                </button>
              )}
            </For>
          </div>

          {/* Empty State */}
          <Show when={filteredTools().length === 0}>
            <div class="py-12 text-center">
              <p class="text-muted-foreground">
                {locale() === 'ko' ? '검색 결과가 없습니다' : 'No tools found'}
              </p>
            </div>
          </Show>
        </div>
      </main>

      {/* Footer */}
      <footer class="border-t px-4 py-3">
        <p class="text-center text-xs text-muted-foreground">
          Tools by{' '}
          <a
            href="https://soundbluemusic.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >
            SoundBlueMusic
          </a>
        </p>
      </footer>
    </div>
  );
};
