/// <reference types="@cloudflare/workers-types" />

// @ts-expect-error - virtual module provided by Cloudflare Vite plugin
import * as serverBuild from 'virtual:react-router/server-build';
import { createRequestHandler } from '@react-router/cloudflare';

const requestHandler = createRequestHandler(serverBuild, 'production');

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler;
