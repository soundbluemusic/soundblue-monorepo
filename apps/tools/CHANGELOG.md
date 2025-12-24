# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Built With 페이지 (`/built-with`) - 기술 스택 페이지
- Footer 컴포넌트 - SoundBlueMusic 링크 포함
- Header에 Built With 메뉴 추가

### Fixed

- Built With 페이지 푸터 "SoundBlue Music" → "SoundBlueMusic" 띄어쓰기 수정

---

## [2.0.0-alpha] - 2025-12-08

### Changed

- **프레임워크**: React 19.1 + React Router 7.6 (SSG mode)
- **상태관리**: Zustand 5
- **UI 컴포넌트**: Radix UI (접근성 프리미티브)
- **다국어 지원**: @inlang/paraglide-js
- **라우팅**: React Router 7 (파일 기반 라우팅)
- **빌드 시스템**: Vite 6.3
- **사이트맵 생성**: scripts/generate-sitemaps.ts (커스텀)

### Note

- SolidJS로의 임시 마이그레이션 후 React로 복귀
- React 19.1의 개선된 성능과 React Router v7의 SSG 지원 활용

---

## [1.0.2-베타] - 2025-12-08

### Changed

- React 19 + Next.js 16 기반으로 프레임워크 마이그레이션 완료
- Rust + wasm-pack 기반 WASM 빌드 시스템으로 전환
- Biome 2.3 린터/포매터로 통합

### Added

- Piano Roll (MIDI 시퀀서, Pixi.js 기반)
- Sheet Editor (악보 편집기)
- Rhythm Game (/rhythm)
- World Clock (세계 시계)
- next-intl 다국어 지원 (ko/en)

---

## [1.0.1-베타] - 2025-12-01

### Added

- Zustand 5 상태 관리
- Shadcn UI 컴포넌트 시스템
- Pixi.js 8 GPU 가속 렌더링

---

## [1.0.0-베타] - 2025-11-30

### Changed

- 프레임워크 아키텍처 재설계 (React 19 기반)
- Rust + wasm-pack 기반 WASM 빌드 시스템 도입

---

## [0.1.5-베타] - 2025-12-02

### Added

- 전체화면 버튼 추가 (모든 인터랙티브 도구에 적용)
- sitemap.xml 자동 생성 스크립트 (`pnpm build` 시 자동 실행)
- 중앙 집중식 브랜드 설정 (`src/constants/brand.ts`)

### Changed

- 푸터 공유 버튼이 현재 페이지 대신 홈페이지를 공유하도록 변경

### Fixed

- 사이드바 네비게이션 선택 오류 수정
- UI 스터터링 성능 문제 수정

### Refactored

- 미사용 코드 제거 및 번들 사이즈 최적화 (~3,810 bytes 절감)

---

## [0.1.3-베타] - 2024-12-02

### Changed

- ESLint 설정 파일을 TypeScript로 변환

---

## [0.1.2-베타] - 2024-12-01

### Changed

- 빌드 스크립트를 JavaScript에서 TypeScript로 마이그레이션

---

## [0.1.1-베타] - 2024-12-01

### Added

- 자동 버전 범프 및 릴리스 워크플로우 추가
- Husky pre-commit 훅

---

## [0.1.0-베타] - 2024-11-30

### Added

- 메트로놈 (Metronome) - BPM 조절, 다양한 박자 설정
- 드럼머신 (Drum Machine) - 드럼 패턴 시퀀서
- 드럼 사운드 합성기 (Drum Sound Synth)
- QR 코드 생성기 (QR Generator)
- TypeScript 기반
- Vite 빌드 도구
- PWA 지원
- Cloudflare Pages 배포

---

[Unreleased]: https://github.com/soundbluemusic/tools/compare/v2.0.0-alpha...HEAD
[2.0.0-alpha]: https://github.com/soundbluemusic/tools/compare/v1.0.2-베타...v2.0.0-alpha
[1.0.2-베타]: https://github.com/soundbluemusic/tools/compare/v1.0.1-베타...v1.0.2-베타
[1.0.1-베타]: https://github.com/soundbluemusic/tools/compare/v1.0.0-베타...v1.0.1-베타
[1.0.0-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.5-베타...v1.0.0-베타
[0.1.5-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.3-베타...v0.1.5-베타
[0.1.3-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.2-베타...v0.1.3-베타
[0.1.2-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.1-베타...v0.1.2-베타
[0.1.1-베타]: https://github.com/soundbluemusic/tools/compare/v0.1.0-베타...v0.1.1-베타
[0.1.0-베타]: https://github.com/soundbluemusic/tools/releases/tag/v0.1.0-베타
