import { useCallback, useMemo, useState } from 'react';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export interface UseWebShareReturn {
  /**
   * Whether the Web Share API is supported in the current browser
   */
  isSupported: boolean;
  /**
   * Whether a share operation is currently in progress
   */
  isSharing: boolean;
  /**
   * Share data using the native share dialog
   * Falls back to clipboard copy if Web Share API is not supported
   */
  share: (
    data: ShareData,
  ) => Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }>;
  /**
   * Copy text to clipboard (fallback method)
   */
  copyToClipboard: (text: string) => Promise<boolean>;
}

/**
 * Hook for using the Web Share API with clipboard fallback
 *
 * @example
 * ```tsx
 * const { isSupported, share } = useWebShare();
 *
 * const handleShare = async () => {
 *   const result = await share({
 *     title: 'Check this out!',
 *     text: 'Amazing content',
 *     url: window.location.href
 *   });
 *
 *   if (result.success) {
 *     console.log(`Shared via ${result.method}`);
 *   }
 * };
 * ```
 */
export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false);

  const isSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return 'share' in navigator && typeof navigator.share === 'function';
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const share = useCallback(
    async (
      data: ShareData,
    ): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'none' }> => {
      if (isSharing) {
        return { success: false, method: 'none' };
      }

      setIsSharing(true);

      try {
        // Try native Web Share API first
        if (isSupported && navigator.canShare?.(data)) {
          await navigator.share(data);
          return { success: true, method: 'native' };
        }

        // Fallback to clipboard
        const textToShare = data.url || data.text || data.title || '';
        if (textToShare) {
          const copied = await copyToClipboard(textToShare);
          if (copied) {
            return { success: true, method: 'clipboard' };
          }
        }

        return { success: false, method: 'none' };
      } catch (error) {
        // User cancelled share or error occurred
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled - not an error
          return { success: false, method: 'none' };
        }

        // Try clipboard fallback on error
        const textToShare = data.url || data.text || data.title || '';
        if (textToShare) {
          const copied = await copyToClipboard(textToShare);
          if (copied) {
            return { success: true, method: 'clipboard' };
          }
        }

        return { success: false, method: 'none' };
      } finally {
        setIsSharing(false);
      }
    },
    [isSupported, isSharing, copyToClipboard],
  );

  return {
    isSupported,
    isSharing,
    share,
    copyToClipboard,
  };
}
