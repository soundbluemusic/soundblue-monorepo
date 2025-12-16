/**
 * Client-only BottomSheet export using SolidStart's clientOnly HOC.
 * This ensures the component is never executed during SSR/prerendering.
 *
 * (SolidStart의 clientOnly HOC를 사용한 클라이언트 전용 BottomSheet.
 * SSR/프리렌더링 중에 컴포넌트가 실행되지 않도록 보장.)
 */
import { clientOnly } from '@solidjs/start';

/**
 * Client-only BottomSheet component.
 * Use this instead of importing BottomSheet directly to prevent SSR issues.
 *
 * @example
 * ```tsx
 * import { BottomSheetClient } from '~/components/ui';
 *
 * <BottomSheetClient isOpen={isOpen()} onClose={handleClose}>
 *   <div>Modal content</div>
 * </BottomSheetClient>
 * ```
 */
export const BottomSheetClient = clientOnly(() => import('./BottomSheet'));
