import LZString from 'lz-string';

// ========================================
// URL Sharing Utilities for Translator
// LZString 압축을 사용한 URL 공유 기능
// ========================================

export interface SharedTranslation {
  text: string;
  direction: 'ko-en' | 'en-ko';
}

// URL 길이 제한 (안전한 범위)
const MAX_COMPRESSED_LENGTH = 1800;

/**
 * 번역 데이터를 URL-safe 문자열로 압축
 * @returns 압축된 문자열 또는 너무 길면 null
 */
export function compressForUrl(data: SharedTranslation): string | null {
  try {
    const json = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(json);

    if (compressed.length > MAX_COMPRESSED_LENGTH) {
      return null;
    }

    return compressed;
  } catch {
    return null;
  }
}

/** Type guard for SharedTranslation */
function isSharedTranslation(obj: unknown): obj is SharedTranslation {
  if (typeof obj !== 'object' || obj === null) return false;
  const data = obj as Record<string, unknown>;
  return (
    typeof data['text'] === 'string' &&
    (data['direction'] === 'ko-en' || data['direction'] === 'en-ko')
  );
}

/**
 * URL에서 압축된 데이터를 복원
 */
export function decompressFromUrl(compressed: string): SharedTranslation | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const parsed: unknown = JSON.parse(json);

    if (!isSharedTranslation(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export interface ShareUrlResult {
  url: string | null;
  error?: 'TEXT_TOO_LONG' | 'COMPRESSION_FAILED';
}

/**
 * 공유 URL 생성
 * @param baseUrl - 기본 URL (예: https://tools.soundbluemusic.com/translator)
 * @param data - 공유할 번역 데이터
 */
export function createShareUrl(baseUrl: string, data: SharedTranslation): ShareUrlResult {
  if (!data.text.trim()) {
    return { url: null, error: 'COMPRESSION_FAILED' };
  }

  const compressed = compressForUrl(data);

  if (!compressed) {
    return {
      url: null,
      error: 'TEXT_TOO_LONG',
    };
  }

  // URL 생성
  const url = new URL(baseUrl);
  url.searchParams.set('s', compressed);

  return { url: url.toString() };
}

/**
 * URL에서 공유된 번역 데이터 파싱
 */
export function parseShareUrl(urlString: string): SharedTranslation | null {
  try {
    const url = new URL(urlString);
    const compressed = url.searchParams.get('s');

    if (!compressed) return null;

    return decompressFromUrl(compressed);
  } catch {
    return null;
  }
}

/**
 * 현재 브라우저 URL에서 공유 데이터 추출
 * (클라이언트 사이드에서만 사용)
 */
export function getSharedDataFromCurrentUrl(): SharedTranslation | null {
  if (typeof window === 'undefined') return null;

  const compressed = new URLSearchParams(window.location.search).get('s');
  if (!compressed) return null;

  return decompressFromUrl(compressed);
}

/**
 * 텍스트가 URL 공유 가능한 길이인지 확인
 * (압축 없이 빠르게 추정)
 */
export function canShareText(text: string): boolean {
  // 한글은 압축 후에도 약 1.5~2배 정도로 인코딩됨
  // 대략적인 추정: 원본 500자 이하면 안전
  return text.length <= 500;
}

/**
 * 텍스트 길이 경고 레벨
 */
export function getTextLengthWarning(
  text: string
): 'safe' | 'warning' | 'danger' {
  const len = text.length;
  if (len <= 300) return 'safe';
  if (len <= 500) return 'warning';
  return 'danger';
}
