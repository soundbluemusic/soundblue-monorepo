# SoundBlue Monorepo

> **⚠️ 모든 응답 전 검증 규칙을 따를 것**
> 확인 없이 단정 금지 | 추측은 추측으로 표시 | 출처 명시

@./README.md

## 모노레포 구조 (Monorepo Structure)

| App | 설명 | 경로 |
|-----|------|------|
| Sound Blue | 아티스트 웹사이트 (Artist Website) | apps/sound-blue |
| Tools | 음악 도구 (Music Tools) | apps/tools |
| Dialogue | 학습 도구 (Learning Tool) | apps/dialogue |
| Shared | 공용 코드 (Shared Code) | packages/shared |

## 주요 명령어 (Main Commands)

```bash
pnpm dev:main      # Sound Blue 실행
pnpm dev:tools     # Tools 실행
pnpm dev:dialogue  # Dialogue 실행
pnpm build         # 모든 앱 빌드
pnpm test          # 테스트 실행
```

## 앱별 작업 시 (When Working on Specific App)

해당 앱 폴더의 CLAUDE.md를 참조하세요:
- `apps/sound-blue/CLAUDE.md` - 아티스트 웹사이트
- `apps/tools/CLAUDE.md` - 음악 도구
- `apps/dialogue/CLAUDE.md` - 학습 도구

## 모노레포 규칙 (Monorepo Rules)

- 앱 간 의존성은 packages/shared를 통해서만 (Cross-app dependencies via packages/shared only)
- 각 앱은 독립적으로 빌드/배포 가능 (Each app can be built/deployed independently)
- 공통 설정은 루트에서 관리 (Common configs managed at root)

## 타입 검증 (Type Validation)

타입 에러 검색 시 아래 프로세스를 따르세요.
(Follow the Type Validation Process below when searching for type errors.)

```bash
# 병렬 실행 가능 (Can run in parallel)
tsc --noEmit              # 기본 타입 체크
tsc --noEmit --strict     # 엄격 타입 체크
grep ": any"              # any 타입 찾기
grep "as any"             # as any 찾기
grep "as never"           # as never 찾기
grep "as unknown"         # as unknown 찾기
grep "@ts-ignore"         # ts-ignore 찾기
grep "@ts-expect-error"   # ts-expect-error 찾기
```

## 코드 품질 규칙 (Code Quality Rules)

코드 수정 시 반드시 따라야 하는 품질 원칙입니다.
(Quality principles that must be followed when modifying code.)

**절대 금지 (Absolute Prohibitions):**
- 에러를 숨기려고 코드 삭제/주석 처리 금지 (Never delete/comment out code to hide errors)
- 테스트 통과를 위한 하드코딩/목데이터 금지 (Never hardcode values or mock data to pass tests)
- 테스트, 검증, 보안 체크 비활성화 금지 (Never disable tests, validation, or security checks)
- `// ... existing code ...` 사용 금지 - 항상 완전한 코드 제공 (Never use `// ... existing code ...` - always provide complete code)

**필수 프로세스 (Required Process):**
수정 전 반드시:
1. 근본 원인 파악 (WHY, not just WHAT)
2. 단순 해결책(삭제/하드코딩/비활성화)이 왜 잘못인지 설명
3. 기존 기능이 유지되는지 검증

**품질 기준 (Quality Standards):**
- 표면적 패치보다 구조적 해결책 우선
- 엣지 케이스 명시적 처리
- 프로젝트 컨벤션 준수
- WHY를 설명하는 주석 추가

**불확실할 때 (When Uncertain):**
다음 상황에서는 먼저 질문: 코드 제거, 핵심 로직 변경, 브레이킹 체인지

## 코드 분석 규칙 (Code Analysis Rules)

코드 분석, 리뷰, 개선 제안 시 아래 규칙을 따르세요.
(Follow the rules below when analyzing code or suggesting improvements.)

**금지 사항:**
- 근거 없는 심각도(HIGH/MEDIUM/LOW) 부여
- 검증 없는 개선 제안 (사용처, 테스트, 의도 확인 필수)
- 에이전트 결과 무검증 전달

**필수 사항:**
- 제안 전 실제 코드에서 사용처 확인
- 불확실하면 단정 짓지 말고 질문으로 전환

## 검증 규칙 (Verification Rules)

모든 응답에 아래 규칙을 따르세요.
(Follow the rules below for all responses.)

**핵심 원칙:**
- 확인 전에 말하지 않는다
- 추측은 추측이라고 표시한다
- 모르면 모른다고 한다
- 출처를 명시한다

**확신도 표현:**
- "확인 결과" - 직접 검증함
- "~로 보입니다" - 강한 근거 있는 추론
- "~일 수 있습니다" - 가능성 제시
- "확인이 필요합니다" - 판단 불가
