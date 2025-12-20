import { createSignal, type JSX, onCleanup, onMount, type ParentProps, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

interface BottomSheetProps extends ParentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * BottomSheet - Modal sheet that slides up from the bottom.
 * Used for "More" menu in mobile navigation.
 *
 * ⚠️ CLIENT-ONLY COMPONENT - This component uses browser APIs (document, Portal).
 * Always import via BottomSheetClient from '~/components/ui' to ensure SSR safety.
 *
 * (⚠️ 클라이언트 전용 컴포넌트 - 브라우저 API 사용.
 * SSR 안전을 위해 항상 BottomSheetClient로 import하세요.)
 *
 * @see BottomSheet.client.tsx for SSR-safe export
 */
export function BottomSheet(props: BottomSheetProps): JSX.Element {
  const [isAnimating, setIsAnimating] = createSignal(false);

  // Handle escape key
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose();
    }
  };

  // Register keyboard listener
  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.overflow = '';
  });

  // Handle body scroll lock
  const updateBodyScroll = (open: boolean): void => {
    document.body.style.overflow = open ? 'hidden' : '';
  };

  // Track open state for body scroll
  const isVisible = (): boolean => props.isOpen || isAnimating();

  return (
    <Show when={isVisible()}>
      <Portal>
        {/* Backdrop */}
        <div
          class={`fixed inset-0 z-[400] bg-bg-overlay transition-opacity duration-200 ${
            props.isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={props.onClose}
          onTransitionEnd={() => {
            if (!props.isOpen) {
              setIsAnimating(false);
            }
            updateBodyScroll(props.isOpen);
          }}
          aria-hidden="true"
        />

        {/* Sheet */}
        <div
          class={`fixed bottom-0 left-0 right-0 z-[401] bg-surface-alt rounded-t-2xl shadow-xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)] ${
            props.isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={props.title}
          onTransitionStart={() => {
            if (props.isOpen) {
              setIsAnimating(true);
              updateBodyScroll(true);
            }
          }}
        >
          {/* Drag handle */}
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-line rounded-full" />
          </div>

          {/* Title */}
          <Show when={props.title}>
            <div class="px-4 pb-2">
              <h2 class="text-lg font-semibold text-content">{props.title}</h2>
            </div>
          </Show>

          {/* Content */}
          <div class="px-2 pb-4">{props.children}</div>
        </div>
      </Portal>
    </Show>
  );
}

export default BottomSheet;
