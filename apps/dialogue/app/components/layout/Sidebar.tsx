import { getLocaleFromPath, getLocalizedPath } from '@soundblue/i18n';
import { useTheme } from '@soundblue/ui-components/base';
import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import m from '~/lib/messages';
import { useChatStore, useUIStore } from '~/stores';
import { ConversationList } from './ConversationList';

// ========================================
// Sidebar Component - 메인 사이드바
// ========================================

interface SidebarProps {
  onNewChat: () => void;
  onLoadConversation?: () => void;
}

export function Sidebar({ onNewChat, onLoadConversation }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname) as 'en' | 'ko';
  const { resolvedTheme, toggleTheme } = useTheme();

  const { ghostMode, toggleGhostMode } = useChatStore();

  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  const [moreExpanded, setMoreExpanded] = useState(false);

  const languages: { code: 'en' | 'ko'; label: string; flag: string }[] = [
    { code: 'en', label: m['app.english'](), flag: 'EN' },
    { code: 'ko', label: m['app.korean'](), flag: 'KO' },
  ];

  const handleLanguageChange = useCallback(
    (newLocale: 'en' | 'ko') => {
      const currentPath = location.pathname.replace(/^\/(ko|en)/, '') || '/';
      const newPath = getLocalizedPath(currentPath, newLocale);
      navigate(newPath);
    },
    [location.pathname, navigate],
  );

  const getAboutUrl = () => getLocalizedPath('/about', locale);

  return (
    <aside
      className={[
        'flex flex-col h-full border-r border-(--color-border-primary) bg-(--color-bg-secondary) transition-[width] duration-300',
        sidebarCollapsed ? 'w-14' : 'w-52',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div
        className={[
          'flex items-center border-b border-(--color-border-primary) p-4',
          sidebarCollapsed ? 'justify-center' : 'justify-between',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!sidebarCollapsed && (
          <h2 className="text-sm font-semibold text-(--color-text-primary)">
            {m['app.history']()}
          </h2>
        )}
        <button
          type="button"
          onClick={toggleSidebarCollapse}
          className="p-1.5 rounded-lg bg-none border-none cursor-pointer text-(--color-text-tertiary) transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
          aria-label={sidebarCollapsed ? m['app.expandSidebar']() : m['app.collapseSidebar']()}
        >
          {sidebarCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {/* New Chat Button */}
        <button
          type="button"
          onClick={onNewChat}
          className={[
            'min-h-[44px] flex items-center gap-4 w-full py-2 px-4 bg-(--color-accent-primary) text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-(--color-accent-secondary) active:scale-[0.98] focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
            sidebarCollapsed && 'justify-center',
          ]
            .filter(Boolean)
            .join(' ')}
          title={sidebarCollapsed ? m['app.newChat']() : undefined}
        >
          <PlusIcon />
          {!sidebarCollapsed && <span>{m['app.newChat']()}</span>}
        </button>

        {/* Ghost Mode Toggle */}
        <button
          type="button"
          onClick={toggleGhostMode}
          className={[
            'min-h-[44px] flex items-center gap-4 w-full py-2 px-4 border-none rounded-lg text-sm cursor-pointer transition-colors duration-150 focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
            sidebarCollapsed && 'justify-center',
            ghostMode
              ? 'bg-(--color-ghost-light) text-(--color-ghost)'
              : 'bg-(--color-bg-tertiary) text-(--color-text-tertiary) hover:bg-(--color-bg-hover)',
          ]
            .filter(Boolean)
            .join(' ')}
          title={sidebarCollapsed ? m['app.ghostMode']() : undefined}
        >
          <GhostIcon />
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="font-medium">{m['app.ghostMode']()}</div>
                {ghostMode && <div className="text-xs opacity-70">{m['app.ghostModeDesc']()}</div>}
              </div>
              {ghostMode && <CheckIcon />}
            </>
          )}
        </button>

        {/* Conversation History */}
        {!sidebarCollapsed && (
          <div className="mt-4">
            <ConversationList onLoadConversation={onLoadConversation} />
          </div>
        )}

        {/* Collapsed: Ghost Mode indicator */}
        {sidebarCollapsed && ghostMode && (
          <div className="w-full flex justify-center">
            <div className="w-2 h-2 rounded-full bg-(--color-ghost) animate-pulse" />
          </div>
        )}
      </div>

      {/* More Section */}
      <div className="border-t border-(--color-border-primary)">
        {/* More Header (clickable) */}
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setMoreExpanded(!moreExpanded)}
            className="w-full flex items-center justify-between py-2 px-4 text-xs font-semibold text-(--color-text-tertiary) uppercase tracking-wider bg-none border-none cursor-pointer transition-colors duration-150 hover:text-(--color-text-secondary)"
          >
            <span>─── {m['app.more']()} ───</span>
            <ChevronIcon expanded={moreExpanded} />
          </button>
        )}

        {/* Expanded More Content */}
        {moreExpanded && !sidebarCollapsed && (
          <div className="px-2 pb-2 flex flex-col gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-4 py-2 px-4 rounded-lg text-sm bg-(--color-bg-tertiary) border-none cursor-pointer no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
            >
              <span className="text-(--color-accent-primary)">
                {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </span>
              <span className="flex-1 text-left text-(--color-text-primary)">
                {resolvedTheme === 'dark' ? m['app.darkMode']() : m['app.lightMode']()}
              </span>
            </button>

            {/* Language Options */}
            <div className="flex flex-col gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={[
                    'flex w-full items-center gap-4 py-2 px-4 rounded-lg text-sm bg-none border-none cursor-pointer no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
                    locale === lang.code &&
                      'bg-(--color-accent-light) text-(--color-accent-primary)',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span
                    className={[
                      'text-xs font-semibold w-7 h-5 flex items-center justify-center rounded',
                      locale === lang.code
                        ? 'bg-(--color-accent-primary) text-white'
                        : 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {lang.flag}
                  </span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {locale === lang.code && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed: Theme toggle */}
        {sidebarCollapsed && (
          <div className="p-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex justify-center p-2 rounded-lg bg-none border-none cursor-pointer text-(--color-text-tertiary) transition-colors duration-150 hover:bg-(--color-bg-hover) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2"
              title={resolvedTheme === 'dark' ? m['app.lightMode']() : m['app.darkMode']()}
            >
              {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-2 border-t border-(--color-border-primary)">
          <Link
            to={getLocalizedPath('/sitemap', locale)}
            className={[
              'flex w-full items-center gap-4 py-2 px-4 rounded-lg text-sm bg-none border-none cursor-pointer text-(--color-text-secondary) no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
              sidebarCollapsed && 'justify-center',
            ]
              .filter(Boolean)
              .join(' ')}
            title={sidebarCollapsed ? m['app.sitemap']?.() : undefined}
          >
            <SitemapIcon />
            {!sidebarCollapsed && <span>{m['app.sitemap']?.()}</span>}
          </Link>
          <Link
            to={getAboutUrl()}
            className={[
              'flex w-full items-center gap-4 py-2 px-4 rounded-lg text-sm bg-none border-none cursor-pointer text-(--color-text-secondary) no-underline transition-colors duration-150 hover:bg-(--color-bg-hover) hover:text-(--color-accent-primary) focus:outline-2 focus:outline-(--color-border-focus) focus:outline-offset-2',
              sidebarCollapsed && 'justify-center',
            ]
              .filter(Boolean)
              .join(' ')}
            title={sidebarCollapsed ? m['app.about']() : undefined}
          >
            <InfoIcon />
            {!sidebarCollapsed && <span>{m['app.about']()}</span>}
          </Link>

          {/* Offline Badge */}
          <div
            className={[
              'flex items-center gap-2 mt-2 py-2 px-4 bg-(--color-success-light) text-(--color-success) rounded-lg text-xs font-medium',
              sidebarCollapsed && 'justify-center p-2',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <OfflineIcon />
            {!sidebarCollapsed && <span>{m['app.offline']()}</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}

// Icons
function PanelLeftOpenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

function PanelLeftCloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function GhostIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2C7.03 2 3 6.03 3 11v9.5c0 .83 1.01 1.25 1.6.66l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.39.39 1.02.39 1.41 0l1.4-1.4 1.4 1.4c.59.59 1.6.17 1.6-.66V11c0-4.97-4.03-9-9-9zm-3 9c-.83 0-1.5-.67-1.5-1.5S8.17 8 9 8s1.5.67 1.5 1.5S9.83 11 9 11zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 8 15 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="14"
      height="14"
      className={['transition-transform duration-300', expanded && 'rotate-180']
        .filter(Boolean)
        .join(' ')}
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function SitemapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8zm0 4h8v2H8z" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}
