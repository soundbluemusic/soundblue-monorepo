# 📋 Documentation Inconsistencies Report
# 문서 불일치 보고서

**Generated**: 2025-12-21
**Repository**: soundblue-monorepo
**Branch**: claude/identify-doc-inconsistencies-9iaO0

---

## 🔴 CRITICAL: Framework Mismatch (치명적: 프레임워크 불일치)

### Documentation Claims (문서 주장)
All documentation states the project uses:
- **Framework**: SolidJS 1.9 + SolidStart 1.2
- **Bundler**: Vinxi 0.5
- **Router**: @solidjs/router 0.15

### Actual Implementation (실제 구현)
All apps actually use:
- **Framework**: React 19.1.0
- **Bundler**: Vite 6.3.5
- **Router**: React Router 7.6.1

### Evidence (증거)

**Root README.md** (`/home/user/soundblue-monorepo/README.md`):
```markdown
Line 17: | **SolidJS** | Fast reactive framework |
```

**Sound Blue README** (`/home/user/soundblue-monorepo/apps/sound-blue/README.md`):
```markdown
Line 9:  [![SolidStart](https://img.shields.io/badge/SolidStart-1.2-blue)]
Line 48: | Framework | SolidStart 1.2 + SolidJS 1.9 + TypeScript 5.9 |
Line 49: | Bundler | Vinxi 0.5 |
```

**Tools README** (`/home/user/soundblue-monorepo/apps/tools/README.md`):
```markdown
Line 5: [![SolidJS](https://img.shields.io/badge/SolidJS-1.9-4F88C6.svg)]
Line 6: [![Vinxi](https://img.shields.io/badge/Vinxi-0.5-green.svg)]
Line 125: | **Framework** | SolidStart 1.2, SolidJS 1.9, Vinxi 0.5 |
Line 142: | **프레임워크** | SolidStart 1.2, SolidJS 1.9, Vinxi 0.5 |
```

**Actual Dependencies** (`package.json` files):
- `apps/sound-blue/package.json:19-24` - Keywords: "react", "react-router"
- `apps/sound-blue/package.json:56-58` - Dependencies: react@19.1.0, react-router@7.6.1
- `apps/tools/package.json:57-59` - Dependencies: react@19.1.0, react-router@7.6.1
- `apps/dialogue/package.json:26-28` - Dependencies: react@19.1.0, react-router@7.6.1

**NO SolidJS dependencies** found in any app.

### Impact (영향)
- **Severity**: CRITICAL
- **Affected Files**: All README.md files, CLAUDE.md references
- **User Impact**: Misleading for developers trying to understand or contribute to the project
- **Action Required**: Update all documentation to reflect React/React Router stack

---

## 🟠 HIGH: Configuration File Mismatch (높음: 설정 파일 불일치)

### Documentation Claims (문서 주장)
`/home/user/soundblue-monorepo/CLAUDE.md:6-12`:
```typescript
// app.config.ts 필수 설정
export default defineConfig({
  ssr: false,
  server: { preset: 'static' },
});
```

### Actual Implementation (실제 구현)
Apps use `react-router.config.ts`, NOT `app.config.ts`:
- `/home/user/soundblue-monorepo/apps/sound-blue/react-router.config.ts:4` - `ssr: false`
- `/home/user/soundblue-monorepo/apps/tools/react-router.config.ts:7-8` - `ssr: false` with explicit comment "// 100% SSG - No server-side rendering (CLAUDE.md requirement)"
- `/home/user/soundblue-monorepo/apps/dialogue/react-router.config.ts` - Similar structure

### Evidence (증거)
**No app.config.ts files exist** in any app directory:
```bash
$ find apps/ -name "app.config.ts"
# No results
```

**React Router configs exist**:
```bash
$ find apps/ -name "react-router.config.ts"
apps/sound-blue/react-router.config.ts
apps/tools/react-router.config.ts
apps/dialogue/react-router.config.ts
```

### Impact (영향)
- **Severity**: HIGH
- **Affected Files**: CLAUDE.md
- **Functional Impact**: None (SSG requirement is satisfied, just wrong file name)
- **Action Required**: Update CLAUDE.md to reference `react-router.config.ts`

---

## 🟡 MEDIUM: Missing Documentation (중간: 문서 누락)

### 1. Dialogue App Documentation (Dialogue 앱 문서화)

**Issue**: Dialogue app has no README.md or CLAUDE.md

**Expected Files**:
- `/home/user/soundblue-monorepo/apps/dialogue/README.md` ❌
- `/home/user/soundblue-monorepo/apps/dialogue/CLAUDE.md` ❌

**Workaround**: Basic info exists in `apps/dialogue/public/llms.txt`

**Impact**: Developers working on dialogue app lack guidance

---

### 2. shared-react Package (shared-react 패키지)

**Issue**: Root README.md only mentions `packages/shared/`

**Actual Packages**:
- `/home/user/soundblue-monorepo/packages/shared/` ✅ Documented
- `/home/user/soundblue-monorepo/packages/shared-react/` ❌ NOT documented

**Evidence**:
```markdown
# /home/user/soundblue-monorepo/README.md:40
└── 📦 packages/
    └── shared/        → Shared code (공용 코드)
```

**Reality**:
- `shared` - For SolidJS apps (has solid-js peer deps)
- `shared-react` - For React apps (has react peer deps)
- **Used by all 3 apps** in their package.json files

**Impact**: Package structure unclear to developers

---

### 3. Dialogue App URL (Dialogue 앱 URL)

**Issue**: Root README.md doesn't list URL for dialogue app

**Root README.md** (`/home/user/soundblue-monorepo/README.md:22-24`):
```markdown
| 🎵 Sound Blue | 🎛️ Tools | 💬 Dialogue |
| soundbluemusic.com | tools.soundbluemusic.com | - |
```

**Actual URL** (from `apps/dialogue/public/llms.txt`):
```
https://dialogue.soundbluemusic.com
```

**Impact**: Users can't easily discover dialogue app

---

## 🟡 MEDIUM: Tool Inconsistencies (중간: 도구 불일치)

### Circular Dependency Checker (순환 의존성 검사 도구)

**CLAUDE.md Claims** (`/home/user/soundblue-monorepo/CLAUDE.md:51`):
```markdown
| 4 | Monorepo Integrity | madge (circular deps), syncpack |
```

**Actual Implementation** (`/home/user/soundblue-monorepo/package.json:16`):
```bash
"check:circular": "pnpm -r exec skott --showCircularDependencies ..."
```

**Reality**: Uses `skott`, NOT `madge`

**Impact**:
- Documentation misleading
- Functionality unchanged (both tools check circular deps)
- Action: Update CLAUDE.md to reference `skott`

---

## 🟢 LOW: Incomplete Quality Tool Coverage (낮음: 품질 도구 커버리지 불완전)

### The Perfect Dodecagon - Partial Implementation

**CLAUDE.md** lists 12 quality metrics, but implementation is incomplete:

| Metric | Tool | sound-blue | tools | dialogue |
|--------|------|------------|-------|----------|
| 1. Test Coverage | Vitest + coverage-v8 | ⚠️ No config | ✅ | ⚠️ No config |
| 2. Visual Coverage | Playwright + pixelmatch | ✅ | ✅ | ❌ No E2E |
| 5. Lighthouse Score | @lhci/cli | ✅ | ❌ | ❌ |
| 11. Accessibility | axe-core | ✅ | ❌ | ❌ |

**Missing Implementations**:
1. **Vitest configs** for sound-blue and dialogue (scripts exist but no `vitest.config.ts`)
2. **Playwright E2E tests** for dialogue app (no `e2e/` directory)
3. **Lighthouse CI** only configured for sound-blue app
4. **Accessibility tests** missing for tools and dialogue

**Evidence**:
```bash
# Vitest configs
apps/tools/vitest.config.ts         ✅
apps/sound-blue/vitest.config.ts    ❌
apps/dialogue/vitest.config.ts      ❌

# E2E tests
apps/sound-blue/e2e/                ✅ (9 test files)
apps/tools/e2e/                     ✅ (3 test files)
apps/dialogue/e2e/                  ❌

# Lighthouse
lighthouserc.json                   ✅ (sound-blue only)
```

**Impact**:
- Inconsistent quality standards across apps
- Not all apps meet "Perfect Dodecagon" requirements
- Action: Add missing configs or clarify which apps must meet which metrics

---

## 📊 Summary by Severity (심각도별 요약)

### 🔴 CRITICAL (Must Fix Immediately)
1. ✅ **Framework Documentation** - All docs claim SolidJS, reality is React

### 🟠 HIGH (Should Fix Soon)
2. ✅ **Config File Reference** - CLAUDE.md references app.config.ts, should be react-router.config.ts

### 🟡 MEDIUM (Should Address)
3. ✅ **Dialogue Documentation** - No README.md or CLAUDE.md
4. ✅ **shared-react Package** - Not documented in root README.md
5. ✅ **Dialogue URL** - Not listed in root README.md
6. ✅ **Tool Mismatch** - CLAUDE.md says madge, actually uses skott

### 🟢 LOW (Nice to Have)
7. ✅ **Quality Tool Coverage** - Incomplete implementation across apps

---

## 🎯 Recommended Actions (권장 조치)

### Immediate (즉시)
- [ ] Update all README.md files to replace SolidJS → React, Vinxi → Vite, SolidStart → React Router
- [ ] Update CLAUDE.md to replace app.config.ts → react-router.config.ts
- [ ] Update root README.md tech stack table (line 17)
- [ ] Update app README badges and tech stack sections

### Short Term (단기)
- [ ] Create README.md and CLAUDE.md for dialogue app
- [ ] Document shared-react package in root README.md
- [ ] Add dialogue URL to root README.md app list table
- [ ] Update CLAUDE.md to reference skott instead of madge

### Long Term (장기)
- [ ] Add vitest.config.ts for sound-blue and dialogue apps
- [ ] Add E2E tests for dialogue app
- [ ] Extend Lighthouse CI to test all 3 apps
- [ ] Add accessibility E2E tests for tools and dialogue

---

## 📝 Affected Files List (영향받는 파일 목록)

### Documentation Files to Update
1. `/home/user/soundblue-monorepo/README.md` - Lines 17, 40, 22-24
2. `/home/user/soundblue-monorepo/CLAUDE.md` - Lines 6-12, 51
3. `/home/user/soundblue-monorepo/apps/sound-blue/README.md` - Lines 9, 22, 48-49
4. `/home/user/soundblue-monorepo/apps/tools/README.md` - Lines 5-6, 32, 125-126, 142-143
5. `/home/user/soundblue-monorepo/apps/dialogue/public/llms.txt` - Framework references

### Documentation Files to Create
6. `/home/user/soundblue-monorepo/apps/dialogue/README.md` - NEW
7. `/home/user/soundblue-monorepo/apps/dialogue/CLAUDE.md` - NEW

### Config Files to Create (Optional)
8. `/home/user/soundblue-monorepo/apps/sound-blue/vitest.config.ts` - NEW
9. `/home/user/soundblue-monorepo/apps/dialogue/vitest.config.ts` - NEW
10. `/home/user/soundblue-monorepo/apps/dialogue/e2e/` - NEW directory

---

## ✅ What's Actually Working Well (잘 작동하는 것)

Despite documentation issues, the implementation itself is solid:

1. ✅ **100% SSG** - All apps correctly use `ssr: false`
2. ✅ **Quality Tools** - Biome, TypeScript, Husky all configured
3. ✅ **Scripts** - All documented scripts in root package.json work correctly
4. ✅ **PWA** - All apps have vite-plugin-pwa configured
5. ✅ **Security** - CSP headers, dotenv-linter configured
6. ✅ **Monorepo** - Turbo, pnpm workspaces working correctly
7. ✅ **i18n** - Bilingual support (EN/KO) implemented

**The code is good - only the documentation needs updating.**

---

## 🔍 Verification Commands (검증 명령어)

Run these to verify the findings:

```bash
# Check framework dependencies
grep -r "\"react\"" apps/*/package.json
grep -r "solid-js" apps/*/package.json  # Should find nothing

# Check config file names
find apps/ -name "app.config.ts"        # Should be empty
find apps/ -name "react-router.config.ts"  # Should find 3 files

# Check vitest configs
find apps/ -name "vitest.config.ts"     # Only tools should have one

# Check E2E directories
find apps/ -type d -name "e2e"          # sound-blue and tools only

# Check circular dependency tool
grep "check:circular" package.json      # Should show skott, not madge
```

---

**Report End**
