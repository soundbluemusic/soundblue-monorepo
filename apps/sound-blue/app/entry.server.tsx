// ============================================================================
// entry.server.tsx - Cloudflare Pages Functions SSR
// ============================================================================
//
// ⚠️ SYNC REQUIRED: This file must be identical across all 3 apps:
// - apps/sound-blue/app/entry.server.tsx
// - apps/tools/app/entry.server.tsx
// - apps/dialogue/app/entry.server.tsx
// When modifying, update ALL files together!
//
// ============================================================================

import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  let status = responseStatusCode;

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error('SSR Error:', error);
        status = 500;
      },
    },
  );

  // Wait for all content to be ready for bots (SEO)
  if (isbot(request.headers.get('user-agent') || '')) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(body, {
    headers: responseHeaders,
    status,
  });
}
