# 🎵 SoundBlue Monorepo

**A creative platform for musicians**
**(뮤지션을 위한 크리에이티브 플랫폼)**

---

## 🎯 App List (앱 리스트)

|  | 🎵 Sound Blue | 🎛️ Tools | 💬 Dialogue |
|--|---------------|----------|-------------|
| **What** | Artist Website (아티스트 웹사이트) | Music Tools (음악 도구) | Learning Tool (학습 도구) |
| **URL** | soundbluemusic.com | tools.soundbluemusic.com | dialogue.soundbluemusic.com |

<br>

### 🎵 Sound Blue

> Official website for SoundBlue
> (SoundBlue 공식 웹사이트)

- 🎧 Music & Albums (음악 & 앨범)
- 📰 News & Blog (뉴스 & 블로그)
- 🤖 AI Chat Assistant (AI 채팅 어시스턴트)

<br>

### 🎛️ Tools

> Free music tools for everyone
> (누구나 무료로 쓰는 음악 도구)

- 🥁 Drum Machine (드럼 머신)
- ⏱️ Metronome (메트로놈)
- 📱 QR Code Generator (QR 코드 생성기)
- 🌐 Translator (번역기) - Ko↔En bidirectional (한영 양방향)

<br>

### 💬 Dialogue

> Offline Q&A learning tool
> (오프라인 Q&A 학습 도구)

- 🔌 Works offline (오프라인 작동)
- 🌏 2 Languages: EN / KO (2개 언어 지원)
- ⚡ Instant answers (즉시 답변)

---

## 🛠️ Tech Stack (기술 스택)

### Frontend (프론트엔드)

| Tech | Description (설명) |
|------|-------------------|
| **React 19** | Fast reactive framework (빠른 반응형 프레임워크) |
| **React Router 7** | SSG mode routing (SSG 모드 라우팅) |
| **TypeScript** | Type-safe JavaScript (타입 안전한 자바스크립트) |
| **Tailwind CSS** | Utility-first styling (유틸리티 기반 스타일링) |

### Build & Deploy (빌드 & 배포)

| Tech | Description (설명) |
|------|-------------------|
| **Vite** | Fast build tool (빠른 빌드 도구) |
| **pnpm** | Fast package manager (빠른 패키지 매니저) |
| **Cloudflare** | Static hosting (정적 호스팅) |

### Quality (코드 품질)

| Tech | Description (설명) |
|------|-------------------|
| **Biome** | Linting & formatting (린팅 & 포맷팅) |
| **Vitest** | Unit testing (유닛 테스트) |
| **Playwright** | E2E testing (E2E 테스트) |

---

## 📁 Project Structure (폴더 구조)

```
soundblue-monorepo/
│
├── 📱 apps/
│   ├── sound-blue/    → Artist website (아티스트 웹사이트)
│   ├── tools/         → Music tools (음악 도구)
│   └── dialogue/      → Learning tool (학습 도구)
│
└── 📦 packages/
    ├── shared/        → [Legacy] For SolidJS backups (레거시 - SolidJS 백업용)
    └── shared-react/  → Shared code for all apps (모든 앱 공용 코드)
```

---

## 🚀 Getting Started (시작하기)

### 1️⃣ Clone (클론)

```bash
git clone https://github.com/soundbluemusic/soundblue-monorepo.git
cd soundblue-monorepo
```

### 2️⃣ Install (설치)

```bash
pnpm install
```

### 3️⃣ Run (실행)

```bash
# Sound Blue (아티스트 웹사이트)
pnpm dev:main

# Tools (음악 도구)
pnpm dev:tools

# Dialogue (학습 도구)
pnpm dev:dialogue
```

---

## 📝 Scripts (스크립트)

| Command (명령어) | Description (설명) |
|-----------------|-------------------|
| `pnpm dev:main` | Run Sound Blue (Sound Blue 실행) |
| `pnpm dev:tools` | Run Tools (Tools 실행) |
| `pnpm dev:dialogue` | Run Dialogue (Dialogue 실행) |
| `pnpm build` | Build all apps (모든 앱 빌드) |
| `pnpm test` | Run tests (테스트 실행) |
| `pnpm check:fix` | Lint & format (린트 & 포맷) |

---

## 🔍 Type Validation Process (타입 검증 프로세스)

> Use this process when finding type errors or code quality issues
> (타입 에러나 코드 품질 문제를 찾을 때 사용)

| Step | Action | Parallel |
|------|--------|----------|
| 1 | `tsc --noEmit` (all apps) | Yes |
| 2 | `tsc --noEmit --strict` (all apps) | Yes |
| 3 | `grep ": any"` | Yes |
| 4 | `grep "as any"` | Yes |
| 5 | `grep "as never"` | Yes |
| 6 | `grep "as unknown"` | Yes |
| 7 | `grep "@ts-ignore"` | Yes |
| 8 | `grep "@ts-expect-error"` | Yes |
| 9 | Collect & fix all issues (수집 후 수정) | - |
| 10 | Verify with `tsc --noEmit --strict` (검증) | - |
| 11 | Commit (커밋) | - |

**Note:** Steps 1-8 can run in parallel. Steps 9-11 must run sequentially.

---

## 🔬 Code Analysis Rules (코드 분석 규칙)

> Rules for AI assistants when analyzing code or suggesting improvements
> (AI 어시스턴트가 코드 분석/개선 제안 시 따라야 하는 규칙)

### Prohibited (금지)

| ❌ Don't | ✅ Do |
|----------|-------|
| Assign severity (HIGH/MEDIUM/LOW) without evidence | Verify actual impact before labeling |
| Suggest improvements without verification | Check usage, tests, and intent first |
| Pass agent results without validation | Manually verify each finding |
| Assert when uncertain | Ask questions instead |

### Required Checklist (필수 체크리스트)

Before suggesting any improvement:

- [ ] Is the code actually used? (실제 사용 여부)
- [ ] Will tests break? (테스트 영향)
- [ ] Could this be intentional? (의도적 설계 여부)
- [ ] Does it cause runtime issues? (런타임 문제 여부)

### Core Principles (핵심 원칙)

1. **"Find issues" ≠ "There are issues"** - Search results aren't automatically problems
2. **Evidence-based severity** - Labels only after verified impact analysis
3. **Respect current code** - May be intentional design choice
4. **Question > Assert** - When uncertain, ask don't tell

📄 **Full documentation:** `.claude/rules/analysis.md`

---

## ✨ Features (특징)

- 🌐 **Bilingual** - English & Korean (영어 & 한국어 지원)
- 📱 **PWA** - Install as app (앱으로 설치 가능)
- 🔌 **Offline** - Works without internet (인터넷 없이 작동)
- ⚡ **Fast** - 100% static sites (100% 정적 사이트)
- ♿ **Accessible** - WCAG compliant (웹 접근성 준수)

---

## 📜 License (라이선스)

MIT License - Free to use (자유롭게 사용 가능)

---

<p align="center">
  Made with ❤️ by <a href="https://soundbluemusic.com">SoundBlue</a>
</p>
