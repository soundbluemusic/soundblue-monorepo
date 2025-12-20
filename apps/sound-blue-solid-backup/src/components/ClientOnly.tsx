import { createSignal, type JSX, onMount, type ParentProps, Show } from 'solid-js';

/**
 * ClientOnly wrapper component - renders children only on the client side.
 * Use this to wrap components that access browser APIs (document, window, etc.)
 * during their initial render phase.
 *
 * (클라이언트 전용 래퍼 컴포넌트 - 자식을 클라이언트에서만 렌더링.
 * 초기 렌더링 시 브라우저 API(document, window 등)에 접근하는
 * 컴포넌트를 래핑할 때 사용.)
 *
 * @example
 * ```tsx
 * <ClientOnly>
 *   <BottomSheet isOpen={isOpen()} onClose={handleClose} />
 * </ClientOnly>
 * ```
 *
 * @example With fallback
 * ```tsx
 * <ClientOnly fallback={<div>Loading...</div>}>
 *   <InteractiveComponent />
 * </ClientOnly>
 * ```
 */

interface ClientOnlyProps extends ParentProps {
  /** Optional fallback to show during SSR/prerendering (SSR 중 표시할 대체 컨텐츠) */
  fallback?: JSX.Element;
}

export function ClientOnly(props: ClientOnlyProps): JSX.Element {
  const [isMounted, setIsMounted] = createSignal(false);

  // onMount only runs on the client after hydration
  // (onMount는 hydration 후 클라이언트에서만 실행됨)
  onMount(() => {
    setIsMounted(true);
  });

  return (
    <Show when={isMounted()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
}

export default ClientOnly;
