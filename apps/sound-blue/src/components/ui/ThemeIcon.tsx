import type { JSX } from 'solid-js';
import type { Theme } from '~/components/providers';

interface ThemeIconProps {
  theme: Theme;
  class?: string;
  size?: number;
}

export function ThemeIcon(props: ThemeIconProps): JSX.Element {
  const size = () => props.size ?? 18;

  return (
    <>
      {props.theme === 'dark' ? (
        <svg
          class={props.class ?? 'theme-icon'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width={size()}
          height={size()}
        >
          <path
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          />
        </svg>
      ) : (
        <svg
          class={props.class ?? 'theme-icon'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          width={size()}
          height={size()}
        >
          <circle cx="12" cy="12" r="5" stroke-width="2" />
          <path
            stroke-width="2"
            stroke-linecap="round"
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          />
        </svg>
      )}
    </>
  );
}
