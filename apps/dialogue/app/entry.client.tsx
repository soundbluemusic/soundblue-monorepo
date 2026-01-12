// ============================================================================
// entry.client.tsx - DO NOT DELETE!
// React Router v7 SSG hydration bug workaround
// ============================================================================
//
// ⚠️ SYNC REQUIRED: This file must be identical across all 3 apps:
// - apps/sound-blue/app/entry.client.tsx
// - apps/tools/app/entry.client.tsx
// - apps/dialogue/app/entry.client.tsx
// When modifying, update ALL files together!
//
// ----------------------------------------------------------------------------
//
// Problem: After SSG build, buttons don't work (bookmark, download, etc.)
// Cause: When hydration fails, React creates new DOM but doesn't remove
//        the original server-rendered HTML, causing DOM duplication
//
// This workaround removes the orphan DOM that React doesn't manage.
//
// Related issues:
// - https://github.com/remix-run/react-router/issues/12893
// - https://github.com/remix-run/react-router/issues/12360
//
// ⚠️ DO NOT DELETE until official fix is released!
// ============================================================================

import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Workaround: Remove orphan DOM created by hydration failure
setTimeout(() => {
  const divs = [...document.body.children].filter((el) => el.tagName === 'DIV');
  const firstDiv = divs[0];
  if (divs.length >= 2 && firstDiv && !Object.keys(firstDiv).some((k) => k.startsWith('__react'))) {
    firstDiv.remove();
  }
}, 100);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
