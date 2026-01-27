/**
 * Dictionary TanStack Query hooks
 *
 * SSR loader에서 받은 초기 데이터를 TanStack Query로 관리합니다.
 * - 첫 방문: SSR 데이터 즉시 표시
 * - 재방문: 캐시 데이터 사용 (staleTime 동안)
 * - 캐시 만료: 백그라운드에서 자동 갱신
 */

import { useQuery } from '@tanstack/react-query';
import { type AllDictionaryResponse, getAllDictionary } from '~/server/dictionary';

/** Dictionary query key */
export const dictionaryKeys = {
  all: ['dictionary'] as const,
  words: ['dictionary', 'words'] as const,
  sentences: ['dictionary', 'sentences'] as const,
};

/** Dictionary query options */
export const dictionaryQueryOptions = {
  queryKey: dictionaryKeys.all,
  queryFn: getAllDictionary,
  staleTime: 5 * 60 * 1000, // 5분간 fresh
  gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
  refetchOnWindowFocus: false, // 탭 전환 시 자동 refetch 비활성화
  refetchOnReconnect: false, // 네트워크 재연결 시 자동 refetch 비활성화
};

/**
 * Dictionary query hook with SSR initial data support
 *
 * @param initialData - SSR loader에서 받은 초기 데이터
 */
export function useDictionaryQuery(initialData?: AllDictionaryResponse | null) {
  return useQuery({
    ...dictionaryQueryOptions,
    initialData: initialData ?? undefined,
    // initialData가 있으면 즉시 fresh 상태로 시작
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
  });
}
