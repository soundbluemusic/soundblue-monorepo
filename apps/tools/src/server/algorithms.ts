/// <reference types="@cloudflare/workers-types" />

/**
 * Algorithms D1 Server Functions
 *
 * TanStack Start 서버 함수를 사용하여 Algorithms D1 데이터베이스에 접근합니다.
 * Cloudflare Workers에서 실행되며, D1 바인딩을 통해 데이터를 조회합니다.
 */

import { createServerFn } from '@tanstack/react-start';

// Cloudflare env 타입 정의
interface CloudflareEnv {
  ALGORITHMS_DB: D1Database;
}

interface StemRow {
  id: number;
  stem: string;
  en: string;
  type: string;
}

interface DomainRow {
  id: number;
  ko: string;
  en: string;
  domain: string;
  direction: string;
}

interface PolysemyRow {
  id: number;
  word: string;
  meanings: string;
  examples: string | null;
}

export interface StemsResponse {
  verb: Record<string, string>;
  adj: Record<string, string>;
  noun: Record<string, string>;
  count: { verb: number; adj: number; noun: number };
}

export interface DomainsResponse {
  domains: Record<string, { koToEn: Record<string, string>; enToKo: Record<string, string> }>;
  count: number;
  totalEntries: number;
}

export interface PolysemyResponse {
  words: Record<string, { meanings: string[]; examples?: string[] }>;
  count: number;
}

export interface AllAlgorithmsResponse {
  stems: StemsResponse;
  domains: DomainsResponse;
  polysemy: PolysemyResponse;
}

/**
 * 어간 사전 조회
 */
export const getStems = createServerFn({ method: 'GET' }).handler(
  async (): Promise<StemsResponse> => {
    try {
      // @ts-expect-error - Cloudflare 런타임에서 globalThis.env로 바인딩 접근
      const env = globalThis.env as CloudflareEnv | undefined;

      if (!env?.ALGORITHMS_DB) {
        console.warn('[Algorithms D1] ALGORITHMS_DB binding not available');
        return {
          verb: {},
          adj: {},
          noun: {},
          count: { verb: 0, adj: 0, noun: 0 },
        };
      }

      const { results } = await env.ALGORITHMS_DB.prepare(
        'SELECT stem, en, type FROM dict_stems ORDER BY stem',
      ).all<StemRow>();

      const verb: Record<string, string> = {};
      const adj: Record<string, string> = {};
      const noun: Record<string, string> = {};

      for (const row of results || []) {
        const target = row.type === 'verb' ? verb : row.type === 'adj' ? adj : noun;
        target[row.stem] = row.en;
      }

      return {
        verb,
        adj,
        noun,
        count: {
          verb: Object.keys(verb).length,
          adj: Object.keys(adj).length,
          noun: Object.keys(noun).length,
        },
      };
    } catch (error) {
      console.error('[Algorithms D1] Failed to fetch stems:', error);
      return {
        verb: {},
        adj: {},
        noun: {},
        count: { verb: 0, adj: 0, noun: 0 },
      };
    }
  },
);

/**
 * 도메인별 어휘 조회
 */
export const getDomains = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DomainsResponse> => {
    try {
      // @ts-expect-error - Cloudflare 런타임에서 globalThis.env로 바인딩 접근
      const env = globalThis.env as CloudflareEnv | undefined;

      if (!env?.ALGORITHMS_DB) {
        console.warn('[Algorithms D1] ALGORITHMS_DB binding not available');
        return {
          domains: {},
          count: 0,
          totalEntries: 0,
        };
      }

      const { results } = await env.ALGORITHMS_DB.prepare(
        'SELECT ko, en, domain, direction FROM dict_domains ORDER BY domain, ko',
      ).all<DomainRow>();

      const byDomain: Record<
        string,
        { koToEn: Record<string, string>; enToKo: Record<string, string> }
      > = {};

      for (const row of results || []) {
        if (!byDomain[row.domain]) {
          byDomain[row.domain] = { koToEn: {}, enToKo: {} };
        }

        if (row.direction === 'ko-to-en' || row.direction === 'both') {
          byDomain[row.domain].koToEn[row.ko] = row.en;
        }
        if (row.direction === 'en-to-ko' || row.direction === 'both') {
          byDomain[row.domain].enToKo[row.en.toLowerCase()] = row.ko;
        }
      }

      return {
        domains: byDomain,
        count: Object.keys(byDomain).length,
        totalEntries: results?.length || 0,
      };
    } catch (error) {
      console.error('[Algorithms D1] Failed to fetch domains:', error);
      return {
        domains: {},
        count: 0,
        totalEntries: 0,
      };
    }
  },
);

/**
 * 다의어 사전 조회
 */
export const getPolysemy = createServerFn({ method: 'GET' }).handler(
  async (): Promise<PolysemyResponse> => {
    try {
      // @ts-expect-error - Cloudflare 런타임에서 globalThis.env로 바인딩 접근
      const env = globalThis.env as CloudflareEnv | undefined;

      if (!env?.ALGORITHMS_DB) {
        console.warn('[Algorithms D1] ALGORITHMS_DB binding not available');
        return {
          words: {},
          count: 0,
        };
      }

      const { results } = await env.ALGORITHMS_DB.prepare(
        'SELECT word, meanings, examples FROM dict_polysemy ORDER BY word',
      ).all<PolysemyRow>();

      const words: Record<string, { meanings: string[]; examples?: string[] }> = {};

      for (const row of results || []) {
        try {
          const meanings = JSON.parse(row.meanings);
          const examples = row.examples ? JSON.parse(row.examples) : undefined;
          words[row.word] = { meanings, examples };
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      return {
        words,
        count: Object.keys(words).length,
      };
    } catch (error) {
      console.error('[Algorithms D1] Failed to fetch polysemy:', error);
      return {
        words: {},
        count: 0,
      };
    }
  },
);

/**
 * 모든 알고리즘 데이터 조회 (stems + domains + polysemy)
 */
export const getAllAlgorithms = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AllAlgorithmsResponse> => {
    const [stems, domains, polysemy] = await Promise.all([getStems(), getDomains(), getPolysemy()]);

    return { stems, domains, polysemy };
  },
);
