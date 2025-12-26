import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './BottomSheet.module.scss';

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

  const backdropClasses = [styles.backdrop, isOpen ? styles.backdropVisible : styles.backdropHidden]
    .filter(Boolean)
    .join(' ');

  const sheetClasses = [styles.sheet, isOpen ? styles.sheetOpen : styles.sheetClosed]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={backdropClasses}
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
        className={sheetClasses}
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
        <div className={styles.dragHandle}>
          <div className={styles.handleBar} />
        </div>

        {/* Title */}
        {title && (
          <div className={styles.titleWrapper}>
            <h2 className={styles.title}>{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </div>
    </>,
    document.body,
  );
}

export default BottomSheet;
