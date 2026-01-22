/**
 * Unified Clipboard Utilities
 *
 * Provides consistent clipboard operations with proper error handling.
 */

/**
 * Copy text to clipboard with proper error handling
 *
 * @param text - Text to copy
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[clipboard] Copy failed:', error.message);
    } else {
      console.warn('[clipboard] Copy failed:', error);
    }

    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackError) {
      console.warn('[clipboard] Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Read text from clipboard
 *
 * @returns Promise<string | null> - Clipboard text or null if failed
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[clipboard] Read failed:', error.message);
    }
    return null;
  }
}
