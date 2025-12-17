# SoundBlue Monorepo

@./README.md
@./.claude/rules/common.md

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
