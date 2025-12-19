import type { Component } from "solid-js";
import { useI18n } from "~/i18n";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: Component<HeaderProps> = (props) => {
  const { t } = useI18n();

  return (
    <header class="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border max-md:px-4">
      <div class="flex items-center gap-3">
        <button
          class="w-10 h-10 rounded-[--radius-sm] flex items-center justify-center text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
          onClick={props.onMenuClick}
          aria-label={t.settings}
          title={t.settings}
        >
          <MenuIcon />
        </button>
        <h1 class="text-xl font-bold text-text-primary tracking-tight">{t.title}</h1>
        <span class="text-sm text-text-muted max-md:hidden">{t.subtitle}</span>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-badge text-green-text rounded-[--radius-lg] text-xs font-medium max-md:p-2">
          <OfflineIcon />
          <span class="max-md:hidden">{t.offline}</span>
        </div>
      </div>
    </header>
  );
};

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const OfflineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);
