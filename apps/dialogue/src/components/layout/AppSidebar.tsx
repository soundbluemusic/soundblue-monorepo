import { A, useNavigate, useLocation } from "@solidjs/router";
import { Component, Show, For, createSignal, onMount } from "solid-js";
import { useI18n, Locale } from "~/i18n";
import { useTheme } from "~/theme";
import { uiActions, uiStore } from "~/stores/ui-store";
import { chatStore, chatActions, Conversation } from "~/stores/chat-store";

// ========================================
// AppSidebar Component - 메인 사이드바
// ========================================

// Style constants
const HOVER_STYLES = "hover:bg-accent-light hover:text-accent";
const ACTIVE_STYLES = "active:scale-95";
const FOCUS_STYLES = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";
const MENU_ITEM_CLASS = `flex w-full items-center gap-3 rounded-[--radius-sm] px-3 py-2 text-sm transition-all duration-200 ${HOVER_STYLES} ${FOCUS_STYLES}`;

interface AppSidebarProps {
  onNewChat: () => void;
  onLoadConversation?: () => void;
}

export const AppSidebar: Component<AppSidebarProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const isCollapsed = () => uiStore.sidebarCollapsed;
  const [moreExpanded, setMoreExpanded] = createSignal(false);

  // SSG 호환: 클라이언트에서만 localStorage 로드
  onMount(() => {
    chatActions.hydrate();
  });

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "EN" },
    { code: "ko", label: "한국어", flag: "KO" },
    { code: "ja", label: "日本語", flag: "JA" },
  ];

  // Get current path without language prefix
  const getPathWithoutLocale = () => {
    const pathname = location.pathname;
    if (pathname.startsWith("/ko")) {
      return pathname.slice(3) || "/";
    }
    if (pathname.startsWith("/ja")) {
      return pathname.slice(3) || "/";
    }
    return pathname;
  };

  // Build path with new locale
  const buildLocalizedPath = (newLocale: Locale) => {
    const basePath = getPathWithoutLocale();
    if (newLocale === "en") {
      return basePath;
    }
    if (basePath === "/") {
      return `/${newLocale}`;
    }
    return `/${newLocale}${basePath}`;
  };

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
    const newPath = buildLocalizedPath(lang);
    navigate(newPath, { replace: true });
  };

  const getAboutUrl = () => (locale() === "en" ? "/about" : `/${locale()}/about`);

  const toggleCollapse = () => {
    uiActions.toggleSidebarCollapse();
  };

  const handleLoadConversation = (conv: Conversation) => {
    chatActions.loadConversation(conv.id);
    props.onLoadConversation?.();
  };

  const handleDeleteConversation = (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    chatActions.deleteConversation(id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <aside
      class="flex h-full flex-col border-r border-border bg-bg-secondary transition-all duration-200"
      classList={{
        "w-14": isCollapsed(),
        "w-52": !isCollapsed(),
      }}
    >
      {/* Header */}
      <div
        class="flex items-center border-b border-border px-3 py-3"
        classList={{
          "justify-center": isCollapsed(),
          "justify-between": !isCollapsed(),
        }}
      >
        <Show when={!isCollapsed()}>
          <h2 class="font-semibold text-sm text-text-primary">{t.history}</h2>
        </Show>
        <button
          type="button"
          onClick={toggleCollapse}
          class={`p-1.5 rounded-[--radius-sm] transition-all duration-200 text-text-secondary ${HOVER_STYLES} ${ACTIVE_STYLES} ${FOCUS_STYLES}`}
          aria-label={isCollapsed() ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Show when={isCollapsed()} fallback={<PanelLeftCloseIcon />}>
            <PanelLeftOpenIcon />
          </Show>
        </button>
      </div>

      {/* Main Content */}
      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={props.onNewChat}
          class="w-full flex items-center gap-3 px-3 py-2.5 bg-accent text-white rounded-[--radius-sm] text-sm font-medium transition-all duration-200 hover:bg-accent-hover active:scale-[0.98]"
          classList={{ "justify-center": isCollapsed() }}
          title={isCollapsed() ? t.newChat : undefined}
        >
          <PlusIcon />
          <Show when={!isCollapsed()}>
            <span>{t.newChat}</span>
          </Show>
        </button>

        {/* Ghost Mode Toggle */}
        <button
          type="button"
          onClick={() => chatActions.toggleGhostMode()}
          class="w-full flex items-center gap-3 px-3 py-2 rounded-[--radius-sm] text-sm transition-all duration-200"
          classList={{
            "justify-center": isCollapsed(),
            "bg-purple-500/20 text-purple-400": chatStore.ghostMode,
            "bg-bg-tertiary text-text-secondary hover:bg-accent-light hover:text-accent": !chatStore.ghostMode,
          }}
          title={isCollapsed() ? t.ghostMode : undefined}
        >
          <GhostIcon />
          <Show when={!isCollapsed()}>
            <div class="flex-1 text-left">
              <div class="font-medium">{t.ghostMode}</div>
              <Show when={chatStore.ghostMode}>
                <div class="text-xs opacity-70">{t.ghostModeDesc}</div>
              </Show>
            </div>
            <Show when={chatStore.ghostMode}>
              <CheckIcon />
            </Show>
          </Show>
        </button>

        {/* Conversation History - 클라이언트에서 hydration 후에만 표시 */}
        <Show when={!isCollapsed() && chatStore.isHydrated}>
          <div class="mt-4">
            <Show
              when={chatStore.conversations.length > 0}
              fallback={
                <div class="px-3 py-4 text-xs text-text-muted text-center">
                  {t.noHistory}
                </div>
              }
            >
              <div class="flex flex-col gap-1">
                <For each={chatStore.conversations}>
                  {(conv) => (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleLoadConversation(conv)}
                      onKeyDown={(e) => e.key === "Enter" && handleLoadConversation(conv)}
                      class={`${MENU_ITEM_CLASS} group cursor-pointer`}
                      classList={{
                        "bg-accent-light text-accent": chatStore.activeConversationId === conv.id,
                        "text-text-secondary": chatStore.activeConversationId !== conv.id,
                      }}
                    >
                      <ChatIcon />
                      <div class="flex-1 text-left overflow-hidden">
                        <div class="truncate text-sm">
                          {conv.title || t.untitled}
                        </div>
                        <div class="text-xs text-text-muted">
                          {formatDate(conv.updatedAt)}
                        </div>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            chatActions.deleteConversation(conv.id);
                          }
                        }}
                        class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                        title={t.deleteChat}
                      >
                        <TrashIcon />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>

        {/* Collapsed: Ghost Mode indicator */}
        <Show when={isCollapsed() && chatStore.ghostMode}>
          <div class="w-full flex justify-center">
            <div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>
        </Show>
      </div>

      {/* More Section */}
      <div class="border-t border-border">
        {/* More Header (clickable) */}
        <Show when={!isCollapsed()}>
          <button
            type="button"
            onClick={() => setMoreExpanded(!moreExpanded())}
            class="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
          >
            <span>─── {t.more} ───</span>
            <ChevronIcon expanded={moreExpanded()} />
          </button>
        </Show>

        {/* Expanded More Content */}
        <Show when={moreExpanded() && !isCollapsed()}>
          <div class="px-2 pb-2 space-y-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              class={`${MENU_ITEM_CLASS} bg-bg-tertiary`}
            >
              <span class="text-accent">
                <Show when={theme() === "dark"} fallback={<SunIcon />}>
                  <MoonIcon />
                </Show>
              </span>
              <span class="flex-1 text-left text-text-primary">
                {theme() === "dark" ? t.darkMode : t.lightMode}
              </span>
            </button>

            {/* Language Options */}
            <div class="flex flex-col gap-1">
              <For each={languages}>
                {(lang) => (
                  <button
                    type="button"
                    class={`${MENU_ITEM_CLASS}`}
                    classList={{
                      "bg-accent-light text-accent": locale() === lang.code,
                      "text-text-secondary": locale() !== lang.code,
                    }}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <span
                      class="text-xs font-semibold w-7 h-5 flex items-center justify-center rounded"
                      classList={{
                        "bg-accent text-white": locale() === lang.code,
                        "bg-bg-tertiary text-text-secondary": locale() !== lang.code,
                      }}
                    >
                      {lang.flag}
                    </span>
                    <span class="flex-1 text-left">{lang.label}</span>
                    <Show when={locale() === lang.code}>
                      <CheckIcon />
                    </Show>
                  </button>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Collapsed: Theme toggle */}
        <Show when={isCollapsed()}>
          <div class="p-2">
            <button
              type="button"
              onClick={toggleTheme}
              class="w-full flex justify-center p-2 rounded-[--radius-sm] text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
              title={theme() === "dark" ? t.lightMode : t.darkMode}
            >
              <Show when={theme() === "dark"} fallback={<SunIcon />}>
                <MoonIcon />
              </Show>
            </button>
          </div>
        </Show>

        {/* Footer */}
        <div class="p-2 border-t border-border">
          <A
            href={getAboutUrl()}
            class={`${MENU_ITEM_CLASS} text-text-secondary`}
            classList={{ "justify-center": isCollapsed() }}
            title={isCollapsed() ? t.about : undefined}
          >
            <InfoIcon />
            <Show when={!isCollapsed()}>
              <span>{t.about}</span>
            </Show>
          </A>

          {/* Offline Badge */}
          <div
            class="mt-2 flex items-center gap-2 px-3 py-2 bg-green-badge text-green-text rounded-[--radius-sm] text-xs font-medium"
            classList={{ "justify-center px-2": isCollapsed() }}
          >
            <OfflineIcon />
            <Show when={!isCollapsed()}>
              <span>{t.offline}</span>
            </Show>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Icons
const PanelLeftOpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="m14 9 3 3-3 3" />
  </svg>
);

const PanelLeftCloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const GhostIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2C7.03 2 3 6.03 3 11v9.5c0 .83 1.01 1.25 1.6.66l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.59.59 1.6.17 1.6-.66V11c0-4.97-4.03-9-9-9zm-3 9c-.83 0-1.5-.67-1.5-1.5S8.17 8 9 8s1.5.67 1.5 1.5S9.83 11 9 11zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 8 15 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const ChevronIcon: Component<{ expanded: boolean }> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    width="14"
    height="14"
    class="transition-transform duration-200"
    classList={{ "rotate-180": props.expanded }}
  >
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const OfflineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
