/**
 * @fileoverview useRecentItems hook for tracking recently used items
 *
 * Provides a way to track and retrieve recently accessed items.
 * Persists to localStorage.
 *
 * @module @soundblue/shared-react/hooks/useRecentItems
 *
 * @example
 * ```tsx
 * const { recentItems, addItem, removeItem, clearAll } = useRecentItems<Tool>('recent-tools');
 *
 * // Track when user opens a tool
 * const handleOpenTool = (tool: Tool) => {
 *   addItem(tool);
 *   navigateTo(tool.path);
 * };
 *
 * // Display recent tools
 * <RecentToolsList items={recentItems} />
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

export interface RecentItem<T> {
  item: T;
  lastAccessed: number;
}

export interface UseRecentItemsOptions {
  /** Maximum number of items to keep */
  maxItems?: number;
  /** Function to get unique ID from item */
  getItemId: (item: unknown) => string;
}

export interface UseRecentItemsReturn<T> {
  /** List of recent items (most recent first) */
  recentItems: T[];
  /** Add or update an item in recent list */
  addItem: (item: T) => void;
  /** Remove an item from recent list */
  removeItem: (itemId: string) => void;
  /** Clear all recent items */
  clearAll: () => void;
  /** Check if item is in recent list */
  isRecent: (itemId: string) => boolean;
}

const DEFAULT_MAX_ITEMS = 10;

export function useRecentItems<T>(
  storageKey: string,
  options: UseRecentItemsOptions,
): UseRecentItemsReturn<T> {
  const { maxItems = DEFAULT_MAX_ITEMS, getItemId } = options;

  const [items, setItems] = useState<RecentItem<T>[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentItem<T>[];
        setItems(parsed);
      }
    } catch {
      // Invalid stored data
    }
  }, [storageKey]);

  // Save to localStorage when items change
  const saveToStorage = useCallback(
    (newItems: RecentItem<T>[]) => {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newItems));
      } catch {
        // Storage full or unavailable
      }
    },
    [storageKey],
  );

  const addItem = useCallback(
    (item: T) => {
      setItems((prev) => {
        const itemId = getItemId(item);
        // Remove existing if present
        const filtered = prev.filter((i) => getItemId(i.item) !== itemId);
        // Add to front with new timestamp
        const newItems = [{ item, lastAccessed: Date.now() }, ...filtered].slice(0, maxItems);
        saveToStorage(newItems);
        return newItems;
      });
    },
    [getItemId, maxItems, saveToStorage],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems((prev) => {
        const newItems = prev.filter((i) => getItemId(i.item) !== itemId);
        saveToStorage(newItems);
        return newItems;
      });
    },
    [getItemId, saveToStorage],
  );

  const clearAll = useCallback(() => {
    setItems([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const isRecent = useCallback(
    (itemId: string) => {
      return items.some((i) => getItemId(i.item) === itemId);
    },
    [items, getItemId],
  );

  const recentItems = items.map((i) => i.item);

  return {
    recentItems,
    addItem,
    removeItem,
    clearAll,
    isRecent,
  };
}
