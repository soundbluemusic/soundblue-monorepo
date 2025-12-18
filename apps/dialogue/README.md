# Dialogue

**A conversational learning tool that works 100% offline**

## Overview

Dialogue is an offline-first conversational learning tool. It provides instant Q&A based on documented knowledge without requiring neural networks or internet connection.

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | SolidStart |
| Package Manager | pnpm |
| Language | TypeScript (100%) |
| Rendering | SSG (100% Static) |

### Why 100% Static (SSG)?

This project is intentionally built as a **fully static site** with no server-side runtime:

- **Zero Server Cost**: Deploy to any static hosting (GitHub Pages, Netlify, Vercel, etc.) for free
- **Maximum Performance**: Pre-rendered HTML for instant page loads
- **True Offline**: Once cached, works completely offline as a PWA
- **Simple Deployment**: Just upload static files - no Node.js server needed
- **CDN-Friendly**: Easily distributed via CDN for global low-latency access

All pages (`/`, `/ko`) are pre-rendered at build time.

## Features

- **Offline First**: Works perfectly without internet connection
- **Instant Response**: No neural networks, document-based instant answers
- **PWA Support**: Install and use like a native app
- **i18n**: Multi-language support (English, Korean)
  - URL-based routing: `/` (English), `/ko` (Korean)
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Sidebar Navigation**: Clean UI with collapsible sidebar
- **SEO Optimized**: Perfect SEO with static generation

## Requirements

- **Node.js** >= 20.0.0
- **pnpm** (package manager)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production (SSG)
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── app.tsx           # Main app component
├── components/       # UI components
│   ├── Chat.tsx      # Main chat container
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx   # Settings sidebar
├── data/             # Knowledge base
│   └── knowledge.ts
├── i18n/             # Internationalization
│   ├── context.tsx   # URL-based locale detection
│   └── translations.ts
├── theme/            # Theme management
│   └── context.tsx   # Dark/Light mode
├── lib/              # Utilities
│   └── search.ts
├── routes/           # Pages (SSG)
│   ├── index.tsx     # English (default)
│   └── ko.tsx        # Korean
└── styles/           # Global styles
    └── global.css
```

## URL Structure

| URL | Language |
|-----|----------|
| `/` | English (default) |
| `/ko` | Korean (한국어) |

## Adding Knowledge

Edit `src/data/knowledge.ts` to add new Q&A entries:

```typescript
{
  id: "unique-id",
  keywords: ["keyword1", "keyword2"],
  question: "Question text",
  answer: "Answer text",
  category: "category-name",
  locale: "ko" // or "en", "all"
}
```

## License

MIT
