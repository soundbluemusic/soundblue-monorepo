# AGENTS.md

Instructions for AI coding agents working on SoundBlue Monorepo.

> For Claude Code users: See [CLAUDE.md](CLAUDE.md) for detailed instructions in Korean.

## Project overview

- SoundBlue is a creative platform for musicians, built as a pnpm + Turbo monorepo.
- Three apps: Sound Blue (artist website), Tools (free music tools), Dialogue (offline Q&A).
- All apps use TanStack Start with SSR deployed on Cloudflare Workers.
- Tech stack: React 19, TypeScript 5.9 (strict), Tailwind CSS v4, Vite 8 (Rolldown).

## Dev environment tips

- Run `pnpm install` to install all dependencies.
- Use `pnpm dev:main` for Sound Blue, `pnpm dev:tools` for Tools, or `pnpm dev:dialogue` for Dialogue.
- Run `pnpm prebuild:all` before building to sync dictionaries and generate types.
- Use `pnpm build` to build all apps. Output goes to `apps/*/dist/`.
- Check the `name` field inside each package's `package.json` to confirm the right package name.

## Package architecture

- This is a monorepo with 4 layers: `apps/` → `ui/` → `platform/` → `core/`.
- `core/` packages (hangul, translator, nlu, audio-engine, locale, text-processor) must have **zero browser API imports**. No `window`, `document`, or `navigator`.
- `platform/` packages (web-audio, storage, worker, i18n, seo, pwa) must provide dual implementation:
  - `*.browser.ts` - Real browser API implementation (used at runtime)
  - `*.noop.ts` - Empty stub (used during SSR/SSG build)
- `ui/` packages contain React components only.
- `apps/` can import from any layer below.

## Testing instructions

- Run `pnpm test` to execute all Vitest tests.
- Run `pnpm test --filter @soundblue/hangul` to test a specific package.
- Run `pnpm check:fix` to lint and format with Biome.
- Run `pnpm check:circular` to detect circular dependencies.
- Fix any test or type errors until the whole suite is green.
- Both vitest AND browser UI must pass before declaring something "fixed".

## Resource-heavy commands

- Do **not** run tasks that spawn headless browsers (e.g. `pnpm check:size`, Lighthouse, Playwright, Puppeteer/estimo) without **explicit user confirmation**.
- If a CI failure points to one of these tasks, explain the risk (multiple Chrome processes) and ask before running locally.

## Critical rules

**NO SPA - SSR/SSG only:**

- SPA mode is forbidden for SEO reasons. All apps use TanStack Start with SSR.
- Never disable SSR or switch to client-side only rendering.
- If you see empty HTML being served, something is wrong.

**NO downgrade - Forward only:**

- Never downgrade package versions to fix problems.
- Never remove features to avoid issues.
- Always analyze root cause and implement proper fixes.
- Add compatibility layers or migration code if needed.

**Tools app - ToolGuide required:**

- Every tool in `apps/tools/` must include a `ToolGuide` component at the bottom.
- Register the guide in `apps/tools/app/lib/toolGuides.ts` with both `ko` and `en` versions.

## Code style

- TypeScript strict mode is enabled. Do not use `any` without justification.
- Use Biome for linting and formatting. Run `pnpm check:fix` to auto-fix.
- Prefer functional patterns and avoid mutation where possible.
- Never hardcode values for specific test cases. Always generalize.
- Never hide errors with empty catch blocks or unexplained `@ts-ignore`.
- When adding features, extend existing functionality—do not delete/replace.

## Security considerations

- Never commit `.env` files or credentials. Use `.env.example` for templates.
- Do not store sensitive data in localStorage or IndexedDB without encryption.
- All apps are public-facing; assume any client-side code can be inspected.
- SEO verification files (Google, Bing) must never be deleted—they prove site ownership.

## PR instructions

- Always run `pnpm check:fix` and `pnpm test` before committing.
- Use descriptive commit messages that explain WHY, not just WHAT.
- Document changes with a before/after table showing file, previous state, new state, and effect.
- If you encounter pre-commit hook failures, fix the issues and create a NEW commit (never amend).

## Project structure

```
soundblue-monorepo/
├── apps/
│   ├── sound-blue/     # Artist website (soundbluemusic.com)
│   ├── tools/          # Music tools (tools.soundbluemusic.com)
│   └── dialogue/       # Q&A learning tool (dialogue.soundbluemusic.com)
├── packages/
│   ├── core/           # Pure logic (no browser APIs)
│   ├── platform/       # Browser API adapters (dual implementation)
│   └── ui/             # React components
├── data/dictionaries/  # JSON data (Single Source of Truth for translations)
├── scripts/            # Build & automation scripts
└── tooling/            # Shared configs (TypeScript, Biome, etc.)
```

## Additional resources

- [CLAUDE.md](CLAUDE.md) - Detailed instructions for Claude Code (Korean)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Full architecture documentation
- [.claude/rules/](.claude/rules/) - Specific rule files for quality, SEO, React patterns
