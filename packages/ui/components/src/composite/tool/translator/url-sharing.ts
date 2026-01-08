/**
 * URL 공유 기능 (v2)
 */

import type { TranslationDirection } from './settings';

const MAX_URL_LENGTH = 2048;
const WARNING_URL_LENGTH = 1800;

interface ShareData {
  text: string;
  direction: TranslationDirection;
}

interface CreateShareUrlResult {
  url?: string;
  error?: string;
}

/**
 * 공유 URL 생성
 */
export function createShareUrl(baseUrl: string, data: ShareData): CreateShareUrlResult {
  try {
    // Base64 인코딩
    const payload = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(payload)));

    const url = `${baseUrl}?s=${encoded}`;

    if (url.length > MAX_URL_LENGTH) {
      return { error: 'Text too long for URL sharing' };
    }

    return { url };
  } catch {
    return { error: 'Failed to create share URL' };
  }
}

/**
 * URL에서 공유 데이터 추출
 */
export function getSharedDataFromCurrentUrl(): ShareData | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');

  if (!encoded) return null;

  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(decoded);

    if (
      typeof data.text === 'string' &&
      (data.direction === 'ko-en' || data.direction === 'en-ko')
    ) {
      return data as ShareData;
    }
  } catch {
    // Invalid share data
  }

  return null;
}

/**
 * 텍스트 길이 경고 레벨
 */
export function getTextLengthWarning(text: string): 'safe' | 'warning' | 'danger' {
  try {
    const payload = JSON.stringify({ text, direction: 'ko-en' });
    const encoded = btoa(unescape(encodeURIComponent(payload)));
    const estimatedLength = encoded.length + 50; // URL 기본 길이 추가

    if (estimatedLength > MAX_URL_LENGTH) return 'danger';
    if (estimatedLength > WARNING_URL_LENGTH) return 'warning';
    return 'safe';
  } catch {
    return 'danger';
  }
}
