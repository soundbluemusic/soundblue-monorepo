/**
 * @fileoverview View Transition Navigate Hook
 *
 * Custom hook that wraps SolidJS router's useNavigate with View Transitions API.
 * Provides smooth page transitions using browser's native View Transitions.
 *
 * Features:
 * - Automatic fallback for unsupported browsers
 * - SSR-safe implementation
 * - Zero bundle size increase (uses native browser API)
 * - Error handling for transition failures
 * - Prevents duplicate transition conflicts
 * - Optimized for SolidJS synchronous DOM updates
 *
 * @example
 * const navigate = useViewTransitionNavigate();
 * navigate('/about'); // Navigates with smooth transition
 */

import { useNavigate } from '@solidjs/router';
import { isServer } from 'solid-js/web';

/**
 * ViewTransition type that represents the View Transitions API result.
 * Uses the native ViewTransition type if available, otherwise falls back to a compatible type.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ViewTransition
 */
type ViewTransitionInstance = ViewTransition;

/** Navigation options */
interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  replace?: boolean;
  /** Scroll to top after navigation */
  scroll?: boolean;
  /** State to pass to the new route */
  state?: unknown;
}

/** Return type for the hook */
type ViewTransitionNavigate = (path: string, options?: NavigateOptions) => void;

/** Store current transition to handle conflicts */
let currentTransition: ViewTransitionInstance | null = null;

/**
 * Check if View Transitions API is supported
 * @returns true if the browser supports the View Transitions API
 */
function isViewTransitionSupported(): boolean {
  if (isServer) return false;
  return 'startViewTransition' in document;
}

/**
 * Custom hook that provides navigation with View Transitions
 *
 * Wraps the standard useNavigate hook to add smooth page transitions
 * using the browser's native View Transitions API.
 *
 * SolidJS performs synchronous DOM updates, so no async waiting is needed.
 * This makes transitions instant and performant.
 *
 * @returns Navigation function with View Transition support
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const navigate = useViewTransitionNavigate();
 *
 *   return (
 *     <button onClick={() => navigate('/about')}>
 *       Go to About
 *     </button>
 *   );
 * }
 * ```
 */
export function useViewTransitionNavigate(): ViewTransitionNavigate {
  const navigate = useNavigate();

  return (path: string, options?: NavigateOptions): void => {
    // Fallback for unsupported browsers or SSR
    if (!isViewTransitionSupported()) {
      navigate(path, options);
      return;
    }

    // Skip any existing transition to prevent conflicts
    if (currentTransition) {
      currentTransition.skipTransition();
      currentTransition = null;
    }

    // Start view transition with navigation
    // SolidJS updates DOM synchronously - no async waiting needed
    try {
      currentTransition = document.startViewTransition(() => {
        navigate(path, options);
      });

      // Handle transition completion/errors silently
      currentTransition.finished
        .catch(() => {
          // Ignore errors (AbortError, InvalidStateError, etc.)
        })
        .finally(() => {
          currentTransition = null;
        });
    } catch {
      // Fallback if startViewTransition throws
      navigate(path, options);
      currentTransition = null;
    }
  };
}

export default useViewTransitionNavigate;
