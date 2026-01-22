/**
 * @fileoverview Colorblind Mode Selector Component
 *
 * A dropdown selector for choosing colorblind accessibility modes.
 * Designed to be placed in app headers alongside theme toggles.
 *
 * @module @soundblue/ui-components/base/components/ColorblindSelector
 */

import { Eye, EyeOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLORBLIND_MODE_LABELS,
  COLORBLIND_MODES,
  type ColorblindMode,
  useColorblind,
} from '../providers/ColorblindProvider';
import { cn } from '../utils';

export interface ColorblindSelectorProps {
  /** Current locale for labels ('ko' or 'en') */
  locale?: 'ko' | 'en';
  /** Additional class names for the container */
  className?: string;
  /** Aria label for the button (overrides default) */
  ariaLabel?: string;
}

/**
 * Colorblind mode selector dropdown component.
 *
 * @example
 * ```tsx
 * // Basic usage (uses context)
 * <ColorblindSelector />
 *
 * // With locale
 * <ColorblindSelector locale="ko" />
 *
 * // With custom styling
 * <ColorblindSelector className="my-custom-class" />
 * ```
 */
export function ColorblindSelector({
  locale = 'en',
  className,
  ariaLabel,
}: ColorblindSelectorProps) {
  const { mode, setMode, isActive } = useColorblind();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (newMode: ColorblindMode) => {
      setMode(newMode);
      setIsOpen(false);
    },
    [setMode],
  );

  const defaultAriaLabel = locale === 'ko' ? '색맹 모드 선택' : 'Select colorblind mode';
  const currentLabel = COLORBLIND_MODE_LABELS[mode][locale];

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {/* Trigger Button - 44px minimum touch target */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel ?? defaultAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={currentLabel}
        className={cn(
          'flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-all duration-200',
          'hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)]',
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2',
          'cursor-pointer border-none bg-transparent',
          isActive && 'text-[var(--color-accent-primary)]',
        )}
      >
        {isActive ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5 opacity-60" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={defaultAriaLabel}
          className={cn(
            'absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl',
            'border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] shadow-lg',
          )}
        >
          {COLORBLIND_MODES.map((modeOption) => {
            const label = COLORBLIND_MODE_LABELS[modeOption][locale];
            const isSelected = mode === modeOption;

            return (
              <button
                key={modeOption}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(modeOption)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 min-h-[44px] text-sm transition-colors',
                  'hover:bg-[var(--color-interactive-hover)]',
                  'focus-visible:outline-none focus-visible:bg-[var(--color-interactive-hover)]',
                  isSelected
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-primary)] font-medium'
                    : 'text-[var(--color-text-primary)]',
                )}
              >
                {/* Selection indicator */}
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border-2 shrink-0',
                    isSelected
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]'
                      : 'border-[var(--color-text-tertiary)]',
                  )}
                >
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
