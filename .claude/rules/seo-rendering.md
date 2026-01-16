# SEO 렌더링 규칙 (SEO Rendering Rules)

> **SPA 금지, SSR/SSG만 허용**
> **NO SPA, Only SSR/SSG Allowed**

## 핵심 원칙 (Core Principle)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚨 SPA 금지 - SEO 치명적 영향 🚨                             ║
║                    🚨 NO SPA - CRITICAL SEO IMPACT 🚨                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  SEO가 중요한 프로젝트에서 이 규칙은 **절대적**입니다.                            ║
║  This rule is **ABSOLUTE** for SEO-critical projects.                        ║
║                                                                              ║
║  ✅ 허용 (Allowed):                                                          ║
║  ├── SSG (Static Site Generation) - 빌드 시 HTML 생성                        ║
║  └── SSR (Server Side Rendering) - 요청 시 HTML 생성                         ║
║                                                                              ║
║  ❌ 금지 (Forbidden):                                                        ║
║  └── SPA (Single Page Application) - 클라이언트 JS로 렌더링                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## SPA가 SEO에 치명적인 이유

| 문제 | 설명 |
|------|------|
| 빈 초기 HTML | 크롤러가 콘텐츠를 인식하지 못함 |
| JS 렌더링 큐 | Google도 별도 큐를 거쳐 색인이 지연됨 (수일~수주) |
| 제한적 JS 지원 | Bing, Naver 등은 JS 렌더링 지원이 제한적/불가 |
| SNS 공유 실패 | 메타태그가 크롤링 시점에 없어 미리보기 실패 |

## 렌더링 모드 비교

| 모드 | HTML 생성 시점 | SEO | 성능 | 용도 |
|------|---------------|:---:|:---:|------|
| **SSG** | 빌드 시 | ✅ | 🚀 최고 | 정적 콘텐츠 |
| **SSR** | 요청 시 | ✅ | ⚡ 좋음 | 동적 콘텐츠 |
| **SPA** | 클라이언트 | ❌ | ⚠️ 가변 | **금지** |

## 검증 방법

### React Router v7

```typescript
// react-router.config.ts

// ✅ SSG 모드 (권장 - 정적 콘텐츠)
export default {
  ssr: false,  // SSR 비활성화
  async prerender() {
    return ['/page1', '/page2', '/page3'];  // 모든 라우트 명시
  },
};

// ✅ SSR 모드 (동적 콘텐츠 필요시)
export default {
  ssr: true,  // SSR 활성화
};

// ❌ SPA 모드 (금지!)
export default {
  ssr: false,
  // prerender 없음 = SPA = SEO 불가!
};
```

### 검증 체크리스트

- [ ] `react-router.config.ts` 확인
- [ ] SSG: `ssr: false` + `prerender()` 함수 존재
- [ ] SSR: `ssr: true` 설정
- [ ] SPA 아님: 위 둘 중 하나 반드시 적용

## 자동화된 검증

### /rendering-check 스킬

```bash
/rendering-check              # 전체 프로젝트 검사
/rendering-check apps/tools   # 특정 앱만 검사
```

이 스킬은:
1. `react-router.config.ts` 파일 검색
2. `prerender()` 함수 또는 `ssr: true` 존재 확인
3. SPA 모드 발견 시 경고 및 수정 안내

## 서브에이전트 규칙

모든 서브에이전트는 다음을 준수해야 합니다:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    서브에이전트 SEO 렌더링 규칙                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  1. 새 앱 생성 시:                                                            ║
║     • SSG 또는 SSR 모드만 설정                                                ║
║     • prerender() 또는 ssr: true 필수 포함                                    ║
║                                                                              ║
║  2. 라우트 추가 시:                                                           ║
║     • SSG 모드면 prerender() 배열에 추가 필수                                  ║
║                                                                              ║
║  3. 설정 변경 시:                                                             ║
║     • SPA 모드로 변경하는 수정 거부                                            ║
║     • prerender() 제거 거부 (SSR 전환 시에만 허용)                             ║
║                                                                              ║
║  4. 코드 리뷰 시:                                                             ║
║     • SPA 패턴 감지 시 경고                                                   ║
║     • 수정 방법 안내                                                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 적용 범위

이 규칙은 다음에 적용됩니다:

| 대상 | 적용 |
|------|:---:|
| soundblue-monorepo | ✅ |
| public-monorepo | ✅ |
| 모든 신규 레포지토리 | ✅ |
| 외부 프로젝트 | 권장 |

## 예외 사항

SPA가 허용되는 경우 (매우 제한적):

1. **관리자 대시보드** - 검색 엔진 노출 불필요
2. **내부 도구** - SEO 무관
3. **인증 후 전용 영역** - 크롤러 접근 불가

**주의**: 위 예외도 메인 페이지는 SSG/SSR 필수!

## 관련 문서

- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 개발 규칙
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - 아키텍처 상세
- [/rendering-check](../skills/rendering-check/SKILL.md) - 자동 검증 스킬
