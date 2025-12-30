import { type ClassValue, clsx } from 'clsx';

/**
 * Conditionally join CSS class names.
 *
 * @param inputs - Class values to merge (strings, arrays, objects)
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn('px-2 py-1', 'px-4'); // 'px-2 py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500');
 * cn({ 'bg-white': isLight, 'bg-black': isDark });
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
