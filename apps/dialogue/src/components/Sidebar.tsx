import { Component, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { useI18n, Locale } from "~/i18n";
import { useTheme } from "~/theme";

interface SidebarProps {
  isOpen: () => boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export const Sidebar: Component<SidebarProps> = (props) => {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "EN" },
    { code: "ko", label: "한국어", flag: "KO" },
  ];

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
    if (lang === "en") {
      navigate("/", { replace: true });
    } else {
      navigate(`/${lang}`, { replace: true });
    }
  };

  const getAboutUrl = () => {
    return locale() === "en" ? "/about" : `/${locale()}/about`;
  };

  return (
    <>
      <Show when={props.isOpen()}>
        <div
          class="fixed inset-0 bg-black/50 z-199 animate-fade-in"
          onClick={props.onClose}
        />
      </Show>

      <aside
        class="fixed top-0 left-0 w-70 h-full bg-bg-secondary border-r border-border z-200 flex flex-col transition-transform duration-300 ease-out max-md:w-full max-md:max-w-80"
        classList={{ "translate-x-0": props.isOpen(), "-translate-x-full": !props.isOpen() }}
      >
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-text-primary">{t.settings}</h2>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-[--radius-sm] text-text-secondary transition-all duration-200 hover:bg-accent-light hover:text-accent"
            onClick={props.onClose}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          {/* New Chat Button */}
          <button
            class="w-full flex items-center gap-3 px-4 py-3 bg-accent text-white rounded-[--radius-sm] text-sm font-medium transition-colors duration-200 hover:bg-accent-hover mb-6"
            onClick={() => { props.onNewChat(); props.onClose(); }}
          >
            <PlusIcon />
            <span>{t.newChat}</span>
          </button>

          {/* Theme Section */}
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">{t.theme}</h3>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 bg-bg-tertiary rounded-[--radius-sm] transition-colors duration-200 hover:bg-accent-light"
              onClick={toggleTheme}
            >
              <span class="text-accent flex items-center">
                <Show when={theme() === "dark"} fallback={<SunIcon />}>
                  <MoonIcon />
                </Show>
              </span>
              <span class="flex-1 text-left text-sm text-text-primary">
                {theme() === "dark" ? t.darkMode : t.lightMode}
              </span>
              <span class="flex items-center">
                <span
                  class="w-11 h-6 rounded-full relative transition-colors duration-200"
                  classList={{
                    "bg-accent": theme() === "light",
                    "bg-border": theme() === "dark"
                  }}
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200"
                    classList={{ "translate-x-5": theme() === "light" }}
                  />
                </span>
              </span>
            </button>
          </div>

          {/* Language Section */}
          <div class="mb-6">
            <h3 class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">{t.language}</h3>
            <div class="flex flex-col gap-1">
              {languages.map((lang) => (
                <button
                  class="w-full flex items-center gap-3 px-4 py-2.5 rounded-[--radius-sm] transition-colors duration-200"
                  classList={{
                    "bg-accent-light text-accent": locale() === lang.code,
                    "bg-transparent text-text-secondary hover:bg-accent-light hover:text-text-primary": locale() !== lang.code
                  }}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span
                    class="text-xs font-semibold w-7 h-5 flex items-center justify-center rounded"
                    classList={{
                      "bg-accent text-white": locale() === lang.code,
                      "bg-bg-tertiary": locale() !== lang.code
                    }}
                  >
                    {lang.flag}
                  </span>
                  <span class="flex-1 text-left text-sm">{lang.label}</span>
                  <Show when={locale() === lang.code}>
                    <CheckIcon />
                  </Show>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="p-4 pt-4 border-t border-border flex flex-col gap-3">
          <A
            href={getAboutUrl()}
            class="flex items-center gap-3 px-4 py-3 bg-bg-tertiary text-text-secondary no-underline rounded-[--radius-sm] text-sm transition-all duration-200 hover:bg-accent-light hover:text-accent [&:hover_svg]:text-accent [&_svg]:text-text-muted"
            onClick={props.onClose}
          >
            <InfoIcon />
            <span>{t.about}</span>
          </A>
          <div class="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-badge text-green-text rounded-[--radius-sm] text-[13px] font-medium">
            <OfflineIcon />
            <span>{t.offline}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const OfflineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);
