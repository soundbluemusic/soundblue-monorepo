/**
 * @fileoverview Auto Animate Hook
 *
 * Wrapper around @formkit/auto-animate for React.
 * Provides automatic list animations for add/remove/reorder.
 */

import autoAnimate, { type AutoAnimateOptions } from '@formkit/auto-animate';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook that applies auto-animate to a parent element.
 * Children will automatically animate when added, removed, or reordered.
 *
 * @example
 * ```tsx
 * function MyList({ items }) {
 *   const [parent] = useAutoAnimate();
 *   return (
 *     <ul ref={parent}>
 *       {items.map(item => <li key={item.id}>{item.name}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useAutoAnimate<T extends HTMLElement = HTMLElement>(
  options?: Partial<AutoAnimateOptions>,
): [React.RefCallback<T>, (enabled: boolean) => void] {
  const [element, setElement] = useState<T | null>(null);
  const [enabled, setEnabled] = useState(true);
  const controllerRef = useRef<ReturnType<typeof autoAnimate> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.disable();
        controllerRef.current = null;
      }
    };
  }, []);

  // Apply/update auto-animate when element or options change
  useEffect(() => {
    if (!element) return;

    // Disable previous controller if exists
    if (controllerRef.current) {
      controllerRef.current.disable();
    }

    // Create new controller
    controllerRef.current = autoAnimate(element, options);

    // Apply enabled state
    if (enabled) {
      controllerRef.current.enable();
    } else {
      controllerRef.current.disable();
    }
  }, [element, options, enabled]);

  // Ref callback to set the element
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  // Toggle function to enable/disable animations
  const toggle = useCallback((value: boolean) => {
    setEnabled(value);
    if (controllerRef.current) {
      if (value) {
        controllerRef.current.enable();
      } else {
        controllerRef.current.disable();
      }
    }
  }, []);

  return [ref, toggle];
}

/**
 * Preset animation options
 */
export const autoAnimatePresets = {
  /** Fast animations (150ms) */
  fast: { duration: 150 } satisfies Partial<AutoAnimateOptions>,

  /** Default animations (250ms) */
  default: { duration: 250 } satisfies Partial<AutoAnimateOptions>,

  /** Slow animations (400ms) */
  slow: { duration: 400 } satisfies Partial<AutoAnimateOptions>,

  /** Spring-like easing */
  spring: {
    duration: 300,
    easing: 'ease-out',
  } satisfies Partial<AutoAnimateOptions>,

  /** Subtle animations for lists */
  subtle: {
    duration: 200,
    easing: 'ease-in-out',
  } satisfies Partial<AutoAnimateOptions>,
} as const;

export type { AutoAnimateOptions };
