# 에이전트 검증 규칙 (Agent Verification Rules)

> **"없음/미사용" 결론은 코드 검증 후에만 가능**
> **"Not found/Not used" conclusions require code verification**

---

## 핵심 원칙 (CRITICAL)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║            ⚠️ 에이전트 검증 필수 - 추측 금지 ⚠️                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ❌ 절대 금지 (NEVER):                                                        ║
║  • 일부 파일만 확인 후 "없음" 결론                                              ║
║  • 파일 검색 없이 "미사용" 단정                                                 ║
║  • 한 폴더만 확인 후 전체 결론                                                  ║
║  • About.tsx만 보고 Footer.tsx 놓치는 실수                                    ║
║                                                                              ║
║  ✅ 필수 (REQUIRED):                                                         ║
║  • Grep으로 키워드 검색 → 모든 결과 파일 확인                                   ║
║  • layout/, components/, routes/ 등 주요 폴더 전체 확인                       ║
║  • "없음" 결론 전 최소 3가지 검색 패턴 시도                                      ║
║  • 검색 결과가 0개여도 관련 폴더 구조 직접 확인                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 컴포넌트 사용 여부 확인 절차

### 1단계: Grep 검색 (필수)

```bash
# 예: AppFooter 사용 여부 확인
Grep "AppFooter" path=apps/[앱이름]
```

**규칙**: 검색 결과가 나온 **모든 파일**을 확인해야 함

### 2단계: 검색 결과 전체 확인 (필수)

| 검색 결과 | 조치 |
|-----------|------|
| 1개 파일 | 해당 파일 Read |
| 2개 이상 | **모든 파일** Read |
| 0개 | 3단계로 진행 |

### 3단계: "없음" 결론 전 추가 검증 (필수)

"없음/미사용" 결론 내리기 전 반드시:

1. **폴더 구조 확인**
   ```bash
   Glob "apps/[앱이름]/src/components/**/*.tsx"
   Glob "apps/[앱이름]/src/components/layout/*.tsx"
   ```

2. **대체 검색 패턴 시도** (최소 3가지)
   ```bash
   Grep "Footer"          # 컴포넌트명
   Grep "currentApp"      # 특정 prop
   Grep "@soundblue/ui"   # import 경로
   ```

3. **index.ts/index.tsx 확인**
   - re-export 패턴 확인

---

## 크로스 앱 링크 분석 시 체크리스트

```
□ 각 앱의 layout/ 폴더 확인
□ 각 앱의 Footer 컴포넌트 확인
□ 각 앱의 Header/Navigation 컴포넌트 확인
□ AppFooter import 여부 Grep 검색
□ 검색 결과 모든 파일 Read
□ "없음" 결론 시 3가지 이상 검색 패턴 시도 증거 제시
```

---

## 결론 작성 규칙

### ✅ 올바른 결론 형식

```
[결론]: Dialogue 앱은 AppFooter를 사용함
[근거]: apps/dialogue/src/components/layout/Footer.tsx (라인 2, 26)
[검증]: Grep "AppFooter" → 1개 파일 발견 → Read 확인
```

### ❌ 금지되는 결론 형식

```
[결론]: Dialogue 앱은 AppFooter를 사용하지 않음
[근거]: About.tsx에서 찾지 못함
→ 문제: layout/Footer.tsx 미확인
```

---

## 실수 사례 및 방지책

### 사례 1: Footer 컴포넌트 누락 (2026-01-28)

**실수:**
- About.tsx만 확인
- layout/Footer.tsx 놓침
- "AppFooter 미사용" 잘못된 결론

**방지책:**
```bash
# 1. Grep으로 전체 검색
Grep "AppFooter" path=apps/dialogue

# 2. 검색 결과 모든 파일 확인
# 결과: apps/dialogue/src/components/layout/Footer.tsx
# → 이 파일 반드시 Read

# 3. "없음"이면 폴더 구조 확인
Glob "apps/dialogue/src/components/**/*.tsx"
```

---

## 보고서 작성 시 필수 포함 사항

| 항목 | 필수 |
|------|:----:|
| 검색 명령어 | ✅ |
| 검색 결과 파일 목록 | ✅ |
| 확인한 파일 경로:라인 | ✅ |
| "없음" 결론 시 시도한 검색 패턴 3개 이상 | ✅ |

---

## 자기 검증 질문 (결론 제출 전)

1. 검색 결과로 나온 **모든 파일**을 확인했는가?
2. layout/, components/ 등 **주요 폴더**를 확인했는가?
3. "없음" 결론 시 **3가지 이상 검색 패턴**을 시도했는가?
4. **파일 경로와 라인 번호**를 명시했는가?

**4개 모두 "예"가 아니면 결론 제출 금지**
