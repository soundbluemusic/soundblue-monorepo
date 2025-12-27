import { useCallback, useState } from 'react';
import { useWebShare } from '../hooks/use-web-share';

export interface ShareButtonProps {
  /**
   * Title to share
   */
  title?: string;
  /**
   * Text/description to share
   */
  text?: string;
  /**
   * URL to share (defaults to current page URL)
   */
  url?: string;
  /**
   * Button label
   */
  label?: string;
  /**
   * Label shown after successful share
   */
  successLabel?: string;
  /**
   * Custom class name for the button
   */
  className?: string;
  /**
   * Custom icon component
   */
  icon?: React.ReactNode;
  /**
   * Success icon component
   */
  successIcon?: React.ReactNode;
  /**
   * Callback when share is successful
   */
  onSuccess?: (method: 'native' | 'clipboard') => void;
  /**
   * Callback when share fails
   */
  onError?: () => void;
}

/**
 * A share button component with Web Share API support and clipboard fallback
 *
 * @example
 * ```tsx
 * <ShareButton
 *   title="Check this out!"
 *   text="Amazing content"
 *   url={window.location.href}
 *   label="Share"
 *   successLabel="Copied!"
 * />
 * ```
 */
export function ShareButton({
  title,
  text,
  url,
  label = 'Share',
  successLabel = 'Shared!',
  className = '',
  icon,
  successIcon,
  onSuccess,
  onError,
}: ShareButtonProps) {
  const { share, isSharing } = useWebShare();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const result = await share({
      title,
      text,
      url: shareUrl,
    });

    if (result.success) {
      setShowSuccess(true);
      onSuccess?.(result.method as 'native' | 'clipboard');
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      onError?.();
    }
  }, [title, text, url, share, onSuccess, onError]);

  const defaultIcon = (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );

  const defaultSuccessIcon = (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isSharing}
      className={className}
      aria-label={showSuccess ? successLabel : label}
    >
      <span className="inline-flex items-center gap-1.5">
        {showSuccess ? successIcon || defaultSuccessIcon : icon || defaultIcon}
        <span>{showSuccess ? successLabel : label}</span>
      </span>
    </button>
  );
}
