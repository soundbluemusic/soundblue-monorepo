/**
 * React Dangerous Patterns Database
 *
 * 버그 발견 시 여기에 패턴을 추가하면 해당 버그가 다시는 발생하지 않습니다.
 * Add patterns here when bugs are discovered to prevent them from recurring.
 *
 * @example 새 패턴 추가 방법:
 * {
 *   id: 'unique-id',
 *   name: '패턴 이름',
 *   description: '무엇이 문제인지 설명',
 *   regex: /감지할 패턴/,
 *   severity: 'error' | 'warning',
 *   solution: '해결 방법',
 *   discoveredAt: '2026-01-27',
 *   relatedIssue: 'GitHub issue URL (optional)',
 * }
 */

export interface DangerousPattern {
  /** Unique identifier */
  id: string;
  /** Pattern name (shown in error message) */
  name: string;
  /** What this pattern detects */
  description: string;
  /** Regex to match dangerous code */
  regex: RegExp;
  /** Error = blocks CI, Warning = just reports */
  severity: 'error' | 'warning';
  /** How to fix this issue */
  solution: string;
  /** When this pattern was added */
  discoveredAt: string;
  /** Related GitHub issue or PR */
  relatedIssue?: string;
  /** Files to exclude from this check */
  excludeFiles?: RegExp;
}

/**
 * 위험 패턴 목록 (Dangerous Patterns Database)
 *
 * 새 버그 발견 시 여기에 추가하세요!
 */
export const DANGEROUS_PATTERNS: DangerousPattern[] = [
  // ============================================================
  // useEffect 무한 루프 패턴
  // ============================================================
  {
    id: 'url-sync-infinite-loop',
    name: 'URL Sync Infinite Loop',
    description:
      'useEffect with searchParams in dependency array calling setSearchParams - causes infinite loop',
    regex: /useEffect\([^}]*\[[^\]]*searchParams[^\]]*\][^}]*setSearchParams/s,
    severity: 'error',
    solution: `
1. URL 읽기 useEffect: 빈 의존성 배열 [] 사용 (마운트 시 한 번만)
2. URL 쓰기 useEffect: searchParams를 의존성에서 제거
3. isInitializedRef로 초기화 여부 체크
4. prevSettingsRef로 실제 변경 여부 비교

See: .claude/rules/react-patterns.md`,
    discoveredAt: '2026-01-27',
    relatedIssue: 'TranslatorLayout React error #185',
  },

  {
    id: 'bidirectional-state-sync',
    name: 'Bidirectional State Sync',
    description: 'Two useEffects that update each other state - potential infinite loop',
    regex: /useEffect\([^}]*setState([A-Z][a-z]+)[^}]*\},\s*\[[^\]]*\1/s,
    severity: 'warning',
    solution: `
1. 단방향 흐름으로 변경
2. 하나의 useEffect로 통합
3. ref로 변경 감지 추가

See: .claude/rules/react-patterns.md`,
    discoveredAt: '2026-01-27',
  },

  {
    id: 'state-in-own-dependency',
    name: 'State in Own Dependency',
    description: 'useEffect sets state that is also in its dependency array',
    regex: /useEffect\(\s*\(\)\s*=>\s*\{[^}]*set([A-Z][a-zA-Z]*)\([^}]*\},\s*\[[^\]]*\1[^\]]*\]\)/s,
    severity: 'warning',
    solution: `
1. 의존성 배열에서 해당 state 제거
2. 또는 조건부로 setState 호출
3. 또는 useReducer로 리팩토링

See: .claude/rules/react-patterns.md`,
    discoveredAt: '2026-01-27',
  },

  // ============================================================
  // Zustand 관련 패턴
  // ============================================================
  {
    id: 'zustand-selector-in-useeffect-dep',
    name: 'Zustand Store in useEffect Dependency',
    description:
      'Using entire Zustand store object in useEffect dependency causes unnecessary re-runs',
    regex: /useEffect\([^}]*\},\s*\[[^\]]*use[A-Z][a-zA-Z]*Store\(\)[^\]]*\]\)/s,
    severity: 'warning',
    solution: `
1. 필요한 값만 selector로 추출: const value = useStore(state => state.value)
2. 추출한 값만 의존성에 포함

Example:
❌ const store = useStore(); useEffect(() => {}, [store])
✅ const value = useStore(s => s.value); useEffect(() => {}, [value])`,
    discoveredAt: '2026-01-27',
  },

  // ============================================================
  // React Router / TanStack Router 패턴
  // ============================================================
  {
    id: 'navigate-in-useeffect-no-guard',
    name: 'Navigate in useEffect Without Guard',
    description: 'Calling navigate() in useEffect without condition can cause redirect loops',
    regex: /useEffect\(\s*\(\)\s*=>\s*\{\s*navigate\(/s,
    severity: 'warning',
    solution: `
1. 조건문 추가: if (shouldRedirect) navigate(...)
2. 또는 loader/redirect 사용 (TanStack Start)

Example:
❌ useEffect(() => { navigate('/login') }, [])
✅ useEffect(() => { if (!isAuth) navigate('/login') }, [isAuth])`,
    discoveredAt: '2026-01-27',
  },

  // ============================================================
  // 향후 추가할 패턴 템플릿
  // ============================================================
  // {
  //   id: 'new-pattern-id',
  //   name: 'New Pattern Name',
  //   description: 'What this pattern detects',
  //   regex: /pattern-to-match/,
  //   severity: 'error',
  //   solution: 'How to fix',
  //   discoveredAt: 'YYYY-MM-DD',
  //   relatedIssue: 'optional-github-url',
  // },
];

/**
 * 보호 패턴 (이 패턴이 있으면 위험 패턴 무시)
 */
export const PROTECTION_PATTERNS = [
  /isInitializedRef\.current/,
  /isUrlSyncInitializedRef\.current/,
  /prevSettingsRef\.current/,
  /prevValueRef\.current/,
  /eslint-disable.*react-hooks/,
  /\/\/ SAFE:/, // 명시적 안전 표시
];

/**
 * 패턴이 보호되어 있는지 확인
 */
export function hasProtection(content: string): boolean {
  return PROTECTION_PATTERNS.some((pattern) => pattern.test(content));
}
