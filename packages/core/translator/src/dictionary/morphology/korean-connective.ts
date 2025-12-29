// ========================================
// Connective Endings Dictionary - 연결어미 사전
// 절을 연결하는 어미들 (reason, simultaneous, conditional, etc.)
// ========================================

/**
 * 연결어미 정보
 */
export interface ConnectiveEndingInfo {
  /** 연결 유형 */
  type:
    | 'reason' // 이유/원인 (because, so)
    | 'simultaneous' // 동시 행위 (while)
    | 'conditional' // 조건 (if)
    | 'sequential' // 순서/나열 (and, then)
    | 'concessive' // 양보 (even though, although)
    | 'purpose' // 목적 (in order to)
    | 'contrast' // 대조 (but)
    | 'manner' // 방법/상태 (by doing)
    | 'result'; // 결과 (so that)
  /** 영어 연결사 */
  en: string;
  /** 연결사 위치: before = 영어가 앞에, after = 영어가 뒤에 */
  position: 'before' | 'after';
  /** 동사 시제 변환 (옵션) */
  verbForm?: 'base' | 'past' | 'gerund';
}

/**
 * 연결어미 사전
 * 긴 어미부터 매칭해야 하므로 객체 순서 중요
 */
export const connectiveEndings: Record<string, ConnectiveEndingInfo> = {
  // === 이유/원인 (Reason/Cause) ===
  // -아서/-어서/-해서: because, so (선행절이 원인)
  아서: { type: 'reason', en: 'so', position: 'after', verbForm: 'base' },
  어서: { type: 'reason', en: 'so', position: 'after', verbForm: 'base' },
  해서: { type: 'reason', en: 'so', position: 'after', verbForm: 'base' },
  서: { type: 'reason', en: 'so', position: 'after', verbForm: 'base' },

  // -니까/-으니까: because, since (강조적 이유)
  으니까: { type: 'reason', en: 'because', position: 'before', verbForm: 'base' },
  니까: { type: 'reason', en: 'because', position: 'before', verbForm: 'base' },
  으니: { type: 'reason', en: 'since', position: 'before', verbForm: 'base' },
  니: { type: 'reason', en: 'since', position: 'before', verbForm: 'base' },

  // === 동시/진행 (Simultaneous) ===
  // -으며/-며: while (동시 진행)
  으며: { type: 'simultaneous', en: 'while', position: 'before', verbForm: 'gerund' },
  며: { type: 'simultaneous', en: 'while', position: 'before', verbForm: 'gerund' },

  // -으면서/-면서: while (동시 진행, 더 강조)
  으면서: { type: 'simultaneous', en: 'while', position: 'before', verbForm: 'gerund' },
  면서: { type: 'simultaneous', en: 'while', position: 'before', verbForm: 'gerund' },

  // === 조건 (Conditional) ===
  // -으면/-면: if (조건)
  으면: { type: 'conditional', en: 'if', position: 'before', verbForm: 'base' },
  면: { type: 'conditional', en: 'if', position: 'before', verbForm: 'base' },

  // -다면: if (가정, 더 비현실적)
  다면: { type: 'conditional', en: 'if', position: 'before', verbForm: 'base' },
  라면: { type: 'conditional', en: 'if', position: 'before', verbForm: 'base' },

  // === 순서/나열 (Sequential/Additive) ===
  // -고: and, and then (나열, 순차)
  고: { type: 'sequential', en: 'and', position: 'after', verbForm: 'base' },

  // === 양보 (Concessive) ===
  // -아도/-어도/-해도: even if, even though
  아도: { type: 'concessive', en: 'even if', position: 'before', verbForm: 'base' },
  어도: { type: 'concessive', en: 'even if', position: 'before', verbForm: 'base' },
  해도: { type: 'concessive', en: 'even if', position: 'before', verbForm: 'base' },
  도: { type: 'concessive', en: 'even if', position: 'before', verbForm: 'base' },

  // -지만: but, although
  지만: { type: 'concessive', en: 'but', position: 'after', verbForm: 'base' },

  // -는데: but, although (배경 제시 + 대조)
  는데: { type: 'contrast', en: 'but', position: 'after', verbForm: 'base' },
  은데: { type: 'contrast', en: 'but', position: 'after', verbForm: 'base' },
  ㄴ데: { type: 'contrast', en: 'but', position: 'after', verbForm: 'base' },

  // === 목적 (Purpose) ===
  // -으려고/-려고: in order to, to
  으려고: { type: 'purpose', en: 'to', position: 'before', verbForm: 'base' },
  려고: { type: 'purpose', en: 'to', position: 'before', verbForm: 'base' },

  // -러/-으러: to (이동 목적)
  으러: { type: 'purpose', en: 'to', position: 'before', verbForm: 'base' },
  러: { type: 'purpose', en: 'to', position: 'before', verbForm: 'base' },

  // -게: so that, to make (결과/목적)
  게: { type: 'result', en: 'to', position: 'before', verbForm: 'base' },
  도록: { type: 'result', en: 'so that', position: 'before', verbForm: 'base' },

  // NOTE: -ㄴ다/-는다 are TERMINAL endings, not connective endings
  // They should be handled by morpheme-analyzer as terminal endings (종결어미)
  // Removed from connective endings to prevent incorrect routing

  // -다가: while doing, then
  다가: { type: 'sequential', en: 'then', position: 'after', verbForm: 'base' },

  // === 방식/상태 (Manner) ===
  // -아/-어 (연결, 방법)
  아: { type: 'manner', en: 'and', position: 'after', verbForm: 'gerund' },
  어: { type: 'manner', en: 'and', position: 'after', verbForm: 'gerund' },
};

/**
 * 연결어미 목록 (길이순 정렬 - 긴 것부터 매칭)
 */
export const connectiveEndingList = Object.keys(connectiveEndings).sort(
  (a, b) => b.length - a.length,
);

/**
 * 연결어미 분석 제외 단어 목록
 * 연결어미처럼 보이지만 실제로는 명사인 경우
 */
const CONNECTIVE_ENDING_EXCLUSIONS = new Set([
  // 음식 (면으로 끝남)
  '라면',
  '냉면',
  '짜장면',
  '짬뽕면',
  '우동면',
  '쫄면',
  '칼국수면',
  '소면',
  '당면',
  // 기타 명사
  '이면',
  '저면',
  '전면',
  '후면',
  '측면',
  '단면',
  '표면',
  '지면',
  '화면',
  '장면',
  '국면',
]);

/**
 * 연결어미 추출
 * @param word 단어 (예: '먹으며', '고파서')
 * @returns 어간과 연결어미 정보, 없으면 null
 */
export function extractConnectiveEnding(
  word: string,
): { stem: string; ending: string; info: ConnectiveEndingInfo } | null {
  // 제외 단어 체크
  if (CONNECTIVE_ENDING_EXCLUSIONS.has(word)) {
    return null;
  }

  for (const ending of connectiveEndingList) {
    if (word.endsWith(ending) && word.length > ending.length) {
      const stem = word.slice(0, -ending.length);
      // 어간이 비어있거나 너무 짧으면 건너뜀
      if (stem.length === 0) continue;

      const info = connectiveEndings[ending];
      if (!info) continue;

      return {
        stem,
        ending,
        info,
      };
    }
  }
  return null;
}

/**
 * 불규칙 활용 어간 복원 (연결어미용)
 * -아서/-어서 등과 결합할 때 변형된 어간을 원형으로 복원
 */
export function restoreStemFromConnective(stem: string, ending: string): string {
  // ㅂ불규칙: 고와 → 곱+아 (곱다)
  if (stem.endsWith('와') && (ending === '서' || ending === '아서')) {
    return `${stem.slice(0, -1)}곱`;
  }
  if (stem.endsWith('워') && (ending === '서' || ending === '어서')) {
    // 더워 → 덥+어 (덥다), 추워 → 춥+어 (춥다)
    return `${stem.slice(0, -1)}ㅂ`;
  }

  // ㄷ불규칙: 들어 → 듣+어 (듣다)
  if (stem.endsWith('들') && ending.startsWith('어')) {
    return `${stem.slice(0, -1)}듣`;
  }

  // ㅅ불규칙: 그어 → 긋+어 (긋다)
  if (stem.endsWith('어') && stem.length > 1) {
    const prevChar = stem[stem.length - 2];
    if (prevChar === '그' || prevChar === '나' || prevChar === '지') {
      return `${stem.slice(0, -1)}ㅅ`;
    }
  }

  // 르불규칙: 몰라 → 모르+아 (모르다)
  if (stem.endsWith('라') && ending === '서') {
    return `${stem.slice(0, -1)}르`;
  }
  if (stem.endsWith('러') && ending === '서') {
    return `${stem.slice(0, -1)}르`;
  }

  // 하다 활용: 해 → 하 (하다)
  if (stem.endsWith('해')) {
    return `${stem.slice(0, -1)}하`;
  }

  // 고파 → 고프 (고프다)
  if (stem.endsWith('파') && ending === '서') {
    return `${stem.slice(0, -1)}프`;
  }
  if (stem.endsWith('퍼') && ending === '서') {
    return `${stem.slice(0, -1)}프`;
  }

  return stem;
}
