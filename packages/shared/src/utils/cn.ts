import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx.
 * Combines the power of clsx for conditional classes and tailwind-merge
 * for proper Tailwind class deduplication.
 *
 * @param inputs - Class values to merge (strings, arrays, objects)
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4'); // 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500');
 * cn({ 'bg-white': isLight, 'bg-black': isDark });
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
