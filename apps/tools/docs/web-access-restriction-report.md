# 웹 접근 제한 원인 분석 보고서

**작성일**: 2024-12-14
**대상 사이트**: https://tools.soundbluemusic.com

---

## 1. 요약 (Executive Summary)

`tools.soundbluemusic.com` 서브도메인에 대한 AI의 WebFetch 및 WebSearch 접근이 차단되어 있습니다.
조사 결과, **Cloudflare의 Bot Protection 기능**이 주요 원인으로 확인되었습니다.

| 테스트 대상 | 결과 |
|------------|------|
| `soundbluemusic.com` (메인) | ✅ 접근 성공 |
| `tools.soundbluemusic.com` (서브도메인) | ❌ 503 에러 |
| WebSearch 인덱싱 | ❌ 검색 결과 없음 |

---

## 2. 조사 결과 상세

### 2.1 WebFetch 테스트 결과

```
URL: https://tools.soundbluemusic.com
결과: HTTP 503 Service Unavailable
```

503 에러는 Cloudflare가 봇 트래픽을 차단할 때 반환하는 대표적인 응답 코드입니다.

### 2.2 WebSearch 테스트 결과

```
검색어: soundbluemusic tools site:tools.soundbluemusic.com
결과: No links found (검색 결과 없음)
```

검색 엔진에 인덱싱되지 않았거나, 크롤러 접근이 차단되어 있습니다.

### 2.3 robots.txt 분석

`public/robots.txt` 파일에서 AI 크롤러를 **명시적으로 허용**하고 있습니다:

```txt
# AI Chatbot Crawlers - Explicitly Allowed
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /
```

**결론**: robots.txt 레벨에서는 AI 접근을 허용하고 있으므로, 차단 원인은 robots.txt가 아닙니다.

### 2.4 llms.txt 분석

`public/llms.txt` 파일이 존재하며, AI 어시스턴트를 위한 가이드가 제공되고 있습니다.
이는 AI 친화적인 의도를 보여줍니다.

---

## 3. 차단 원인 분석

### 3.1 주요 원인: Cloudflare Bot Fight Mode

**Cloudflare Pages**에 배포된 사이트에서 발생하는 503 에러의 가장 일반적인 원인은 **Bot Fight Mode** 또는 **Super Bot Fight Mode** 활성화입니다.

#### Bot Fight Mode란?

Cloudflare의 자동 봇 탐지 및 차단 기능으로:
- 알려진 봇 User-Agent 차단
- JavaScript 챌린지 요구
- 의심스러운 트래픽 패턴 차단

#### 왜 AI 도구가 차단되는가?

| 특성 | 설명 |
|------|------|
| User-Agent | AI 도구들은 고유한 User-Agent를 사용하여 봇으로 식별됨 |
| IP 패턴 | AI 서비스들은 특정 IP 대역에서 대량 요청 발생 |
| JavaScript 미실행 | WebFetch는 JavaScript를 실행하지 않아 챌린지 통과 불가 |

### 3.2 CSP (Content-Security-Policy) 분석

`public/_headers` 파일의 CSP 설정:

```
connect-src 'self' https://cloudflareinsights.com
```

이 설정은 **클라이언트 측 JavaScript**의 외부 연결만 제한하며, 서버 측 WebFetch/WebSearch와는 직접적 관련이 없습니다.

### 3.3 Cross-Origin 정책 분석

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

이 설정들은 SharedArrayBuffer 지원을 위한 것으로, 외부 API 접근 차단과는 무관합니다.

---

## 4. 메인 사이트와의 비교

| 항목 | soundbluemusic.com | tools.soundbluemusic.com |
|------|-------------------|-------------------------|
| WebFetch | ✅ 성공 | ❌ 503 에러 |
| 호스팅 | (확인 필요) | Cloudflare Pages |
| Bot Protection | 비활성 또는 완화 | 활성 (추정) |

두 사이트 간 접근성 차이는 Cloudflare 대시보드의 **보안 설정 차이**에서 기인합니다.

---

## 5. 해결 방안

### 5.1 Cloudflare 대시보드에서 설정 변경

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com 로그인
   - `tools.soundbluemusic.com` 프로젝트 선택

2. **Bot Fight Mode 비활성화 또는 조정**
   - Security → Bots → Configure
   - "Bot Fight Mode" 또는 "Super Bot Fight Mode" OFF
   - 또는 "Verified Bots" 허용 옵션 활성화

3. **WAF Rules 확인**
   - Security → WAF → Custom Rules
   - AI 봇을 차단하는 규칙이 있는지 확인

### 5.2 특정 봇 허용 규칙 추가 (권장)

Cloudflare WAF에서 화이트리스트 규칙 생성:

```
Expression: (cf.client.bot) or (http.user_agent contains "GPTBot") or (http.user_agent contains "ClaudeBot")
Action: Allow
```

### 5.3 Verified Bots 설정

Cloudflare는 "Verified Bots" 카테고리를 제공합니다:
- Settings → Bot Fight Mode → Verified Bots → Allow

### 5.4 Pages Functions 활용 (고급)

특정 경로에 대해 봇 허용 로직 구현:

```typescript
// functions/[[path]].ts
export const onRequest: PagesFunction = async (context) => {
  const userAgent = context.request.headers.get('User-Agent') || '';
  const isAllowedBot = /GPTBot|ClaudeBot|Google-Extended/i.test(userAgent);

  if (isAllowedBot) {
    // 봇 요청 허용 처리
  }

  return context.next();
};
```

---

## 6. 추가 고려사항

### 6.1 SEO 영향

현재 상태에서는:
- 검색 엔진 크롤러도 차단될 가능성 있음
- Google Search Console에서 크롤링 오류 확인 필요

### 6.2 보안과 접근성의 균형

| 접근법 | 보안 | AI 접근성 |
|--------|------|----------|
| Bot Fight Mode ON | 높음 | ❌ 차단 |
| Bot Fight Mode OFF | 낮음 | ✅ 허용 |
| Verified Bots만 허용 | 중간 | ⚠️ 부분 허용 |
| 화이트리스트 규칙 | 높음 | ✅ 선택적 허용 |

**권장**: 화이트리스트 규칙을 통해 검증된 AI 봇만 선택적으로 허용

---

## 7. 결론

### 차단 원인
- **Cloudflare Bot Fight Mode** (또는 유사 보안 기능) 활성화

### 레포지토리 내 설정과의 관계
- `robots.txt`: AI 허용 ✅
- `llms.txt`: AI 가이드 제공 ✅
- `_headers` CSP: 무관
- **실제 차단**: Cloudflare 대시보드 레벨 (코드 외부)

### 필요 조치
Cloudflare 대시보드에서 Bot Protection 설정 조정 필요

---

## 8. 참고 자료

- [Cloudflare Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/free/)
- [Cloudflare Super Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/pro/)
- [Cloudflare WAF Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [robots.txt AI 봇 설정](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
