# 번역기 URL 공유 기능 구현 계획서

## 개요

번역기 도구에 URL을 통한 번역 결과 공유 기능을 추가합니다. 백엔드 없이 클라이언트 사이드에서 **LZString 압축 + URL 인코딩** 방식을 사용하여 구현합니다.

---

## 현재 상태 분석

### 코드 구조
| 파일 | 역할 |
|------|------|
| `src/tools/translator/index.tsx` | 번역기 메인 컴포넌트 |
| `src/routes/[tool].tsx` | 도구별 라우팅 (URL 파라미터 처리 필요) |
| `src/stores/tool-store.ts` | 도구 상태 관리 |

### 현재 TranslatorSettings
```typescript
interface TranslatorSettings {
  direction: 'ko-en' | 'en-ko';
  lastInput: string;
}
```

### URL 공유에 필요한 데이터
- `text`: 번역할 텍스트
- `dir`: 번역 방향 (`ko-en` | `en-ko`)

---

## 구현 방식

### 핵심 전략: LZString + Base64 URL Safe 인코딩

```
원본 텍스트
    ↓
LZString.compressToEncodedURIComponent()
    ↓
URL Query String (?t=압축된텍스트&d=ko-en)
```

### URL 형식
```
https://tools.soundbluemusic.com/translator?t={압축된텍스트}&d={방향}
https://tools.soundbluemusic.com/ko/translator?t={압축된텍스트}&d={방향}
```

### 왜 LZString인가?

| 방식 | 장점 | 단점 |
|------|------|------|
| **URL 인코딩만** | 단순함 | 한글 3배 증가 (한글 1자 → 9자) |
| **LZString** | 압축률 50-70%, URL-safe 출력 | 라이브러리 추가 필요 (2KB) |
| **Native CompressionStream** | 브라우저 내장 | 바이너리 출력으로 URL 부적합 |

---

## URL 길이 제한 및 대응

### 브라우저별 URL 길이 제한

| 환경 | 최대 길이 |
|------|-----------|
| Chrome/Edge | 2MB (실질적 제한 없음) |
| Safari | ~80,000자 |
| IE11 | 2,083자 |
| 일반 권장 | **2,000자 이하** |

### 안전한 텍스트 길이 (압축 후 2,000자 기준)

| 압축 전 (추정) | 압축 후 | 상태 |
|----------------|---------|------|
| ~500자 (한글) | ~1,000자 | 안전 |
| ~1,000자 (한글) | ~1,800자 | 경계 |
| 1,500자+ (한글) | 2,500자+ | 위험 |

### 길이 초과 시 UX 처리

```typescript
const MAX_SAFE_URL_LENGTH = 2000;

function canShareViaUrl(compressedText: string): boolean {
  const fullUrl = `${baseUrl}?t=${compressedText}&d=ko-en`;
  return fullUrl.length <= MAX_SAFE_URL_LENGTH;
}
```

**초과 시 안내:**
> "텍스트가 너무 길어 URL로 공유할 수 없습니다. 직접 복사해서 공유해주세요."

---

## 구현 단계

### Phase 1: 라이브러리 설치 및 유틸리티 생성

```bash
pnpm add lz-string
pnpm add -D @types/lz-string
```

**새 파일: `src/tools/translator/url-sharing.ts`**
```typescript
import LZString from 'lz-string';

export interface SharedTranslation {
  text: string;
  direction: 'ko-en' | 'en-ko';
}

const MAX_URL_LENGTH = 2000;

export function compressForUrl(data: SharedTranslation): string | null {
  const json = JSON.stringify(data);
  const compressed = LZString.compressToEncodedURIComponent(json);

  if (compressed.length > MAX_URL_LENGTH) {
    return null; // 너무 길면 null 반환
  }

  return compressed;
}

export function decompressFromUrl(compressed: string): SharedTranslation | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function createShareUrl(
  baseUrl: string,
  data: SharedTranslation
): { url: string | null; error?: string } {
  const compressed = compressForUrl(data);

  if (!compressed) {
    return {
      url: null,
      error: 'TEXT_TOO_LONG'
    };
  }

  return {
    url: `${baseUrl}?s=${compressed}`
  };
}

export function parseShareUrl(url: string): SharedTranslation | null {
  try {
    const urlObj = new URL(url);
    const compressed = urlObj.searchParams.get('s');
    if (!compressed) return null;
    return decompressFromUrl(compressed);
  } catch {
    return null;
  }
}
```

### Phase 2: 번역기 컴포넌트 수정

**수정 파일: `src/tools/translator/index.tsx`**

1. URL 파라미터 읽기 (onMount)
2. 공유 버튼 추가
3. 공유 모달/토스트 UI

```typescript
// 추가할 imports
import { Share2, Link, Check, X } from 'lucide-solid';
import { createShareUrl, parseShareUrl } from './url-sharing';

// 컴포넌트 내부에 추가
const [shareStatus, setShareStatus] = createSignal<'idle' | 'copied' | 'error'>('idle');

// URL에서 공유된 번역 로드
onMount(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('s');
    if (shared) {
      const data = decompressFromUrl(shared);
      if (data) {
        setInputText(data.text);
        props.onSettingsChange({ direction: data.direction });
      }
    }
  }
});

// 공유 URL 생성 함수
const shareTranslation = async () => {
  const text = inputText().trim();
  if (!text) return;

  const result = createShareUrl(window.location.origin + window.location.pathname, {
    text,
    direction: settings().direction,
  });

  if (result.error) {
    setShareStatus('error');
    setTimeout(() => setShareStatus('idle'), 3000);
    return;
  }

  try {
    await navigator.clipboard.writeText(result.url!);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  } catch {
    setShareStatus('error');
    setTimeout(() => setShareStatus('idle'), 3000);
  }
};
```

### Phase 3: UI 추가

```tsx
{/* 공유 버튼 - Footer 영역에 추가 */}
<button
  type="button"
  onClick={shareTranslation}
  disabled={!inputText().trim()}
  class="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs..."
>
  {shareStatus() === 'copied' ? (
    <>
      <Check class="h-3.5 w-3.5 text-green-500" />
      <span>복사됨!</span>
    </>
  ) : shareStatus() === 'error' ? (
    <>
      <X class="h-3.5 w-3.5 text-red-500" />
      <span>텍스트가 너무 깁니다</span>
    </>
  ) : (
    <>
      <Share2 class="h-3.5 w-3.5" />
      <span>공유</span>
    </>
  )}
</button>
```

### Phase 4: 라우팅 수정

**수정 파일: `src/routes/[tool].tsx`**

Query string을 유지하면서 도구 페이지 렌더링 (SolidStart는 기본적으로 지원)

---

## 파일 변경 목록

| 작업 | 파일 | 변경 내용 |
|------|------|-----------|
| 추가 | `package.json` | `lz-string` 의존성 추가 |
| 생성 | `src/tools/translator/url-sharing.ts` | 압축/해제 유틸리티 |
| 수정 | `src/tools/translator/index.tsx` | 공유 버튼, URL 파싱 로직 |
| 수정 | `src/i18n/translations/*.ts` | 공유 관련 번역 키 추가 |

---

## 테스트 케이스

### 단위 테스트 (`url-sharing.test.ts`)

```typescript
describe('URL Sharing', () => {
  it('짧은 텍스트 압축/해제', () => {
    const data = { text: '안녕하세요', direction: 'ko-en' };
    const compressed = compressForUrl(data);
    expect(compressed).not.toBeNull();
    expect(decompressFromUrl(compressed!)).toEqual(data);
  });

  it('긴 텍스트는 null 반환', () => {
    const longText = '가'.repeat(2000);
    const data = { text: longText, direction: 'ko-en' };
    expect(compressForUrl(data)).toBeNull();
  });

  it('잘못된 압축 데이터 처리', () => {
    expect(decompressFromUrl('invalid-data')).toBeNull();
  });
});
```

### E2E 테스트

1. 번역 입력 후 공유 버튼 클릭 → 클립보드에 URL 복사 확인
2. 공유 URL로 직접 접속 → 번역 텍스트와 방향 자동 설정 확인
3. 긴 텍스트 입력 후 공유 시도 → 에러 메시지 표시 확인

---

## 예상 압축 효율

| 원본 | 압축 전 (UTF-8) | 압축 후 | 압축률 |
|------|-----------------|---------|--------|
| "안녕하세요" | ~33 bytes | ~18 chars | 45% |
| 문장 (50자) | ~150 bytes | ~80 chars | 47% |
| 문단 (200자) | ~600 bytes | ~280 chars | 53% |

---

## 대안 고려

### 1. Web Share API (모바일)
```typescript
if (navigator.share) {
  await navigator.share({
    title: '번역 결과',
    url: shareUrl
  });
}
```

### 2. QR 코드 공유
기존 QR 생성기 도구와 연동하여 URL을 QR로 변환 가능

---

## 리스크 및 대응

| 리스크 | 확률 | 대응 |
|--------|------|------|
| URL이 SNS에서 잘림 | 중 | 길이 제한 엄격하게 적용 (1,500자) |
| 압축 라이브러리 호환성 | 하 | LZString은 IE10+, 모든 모던 브라우저 지원 |
| 악성 텍스트 주입 | 하 | 압축 데이터만 받으므로 XSS 위험 낮음 |

---

## 결론

| 항목 | 상세 |
|------|------|
| **권장 방식** | LZString 압축 + URL 인코딩 |
| **예상 작업량** | 4시간 |
| **새 의존성** | `lz-string` (2KB gzip) |
| **지원 범위** | 짧은~중간 길이 텍스트 (약 500자까지 안전) |
| **한계** | 긴 텍스트(1,000자+)는 URL 공유 불가 |

**2025년 기준 백엔드 없는 URL 공유의 최선의 방법입니다.**
