import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * BottomSheet - Modal sheet that slides up from the bottom.
 * Used for "More" menu in mobile navigation.
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }, [isOpen]);

  const isVisible = isOpen || isAnimating;

  if (!mounted || !isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[400] bg-bg-overlay transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        onTransitionEnd={() => {
          if (!isOpen) {
            setIsAnimating(false);
          }
        }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[401] bg-surface-alt rounded-t-2xl shadow-xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onTransitionStart={() => {
          if (isOpen) {
            setIsAnimating(true);
          }
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-line rounded-full" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 pb-2">
            <h2 className="text-lg font-semibold text-content">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="px-2 pb-4">{children}</div>
      </div>
    </>,
    document.body,
  );
}

export default BottomSheet;
