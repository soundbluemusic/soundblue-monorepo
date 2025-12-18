# SoundBlue Monorepo

@./README.md
@./.claude/rules/common.md
@./.claude/rules/analysis.md
@./.claude/rules/verification.md

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

타입 에러 검색 시 `.claude/rules/common.md`의 타입 검증 프로세스를 따르세요.
(Follow the Type Validation Process in `.claude/rules/common.md` when searching for type errors.)

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

## 코드 분석 규칙 (Code Analysis Rules)

코드 분석, 리뷰, 개선 제안 시 `.claude/rules/analysis.md`를 반드시 따르세요.
(Follow `.claude/rules/analysis.md` when analyzing code or suggesting improvements.)

**금지 사항:**
- 근거 없는 심각도(HIGH/MEDIUM/LOW) 부여
- 검증 없는 개선 제안 (사용처, 테스트, 의도 확인 필수)
- 에이전트 결과 무검증 전달

**필수 사항:**
- 제안 전 실제 코드에서 사용처 확인
- 불확실하면 단정 짓지 말고 질문으로 전환

## 검증 규칙 (Verification Rules)

모든 응답에 `.claude/rules/verification.md`를 따르세요.
(Follow `.claude/rules/verification.md` for all responses.)

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
