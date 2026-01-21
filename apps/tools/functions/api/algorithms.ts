/**
 * Algorithms D1 API Endpoint
 *
 * 번역 알고리즘용 데이터를 조회합니다.
 * - dict_stems: 어간 패턴 (동사/형용사/명사)
 * - dict_domains: 도메인별 어휘
 * - dict_polysemy: 다의어 처리
 */

interface Env {
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

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { ALGORITHMS_DB } = context.env;
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'all';

  try {
    if (type === 'stems') {
      return new Response(JSON.stringify(await fetchStems(ALGORITHMS_DB)), {
        headers: corsHeaders,
      });
    }

    if (type === 'domains') {
      return new Response(JSON.stringify(await fetchDomains(ALGORITHMS_DB)), {
        headers: corsHeaders,
      });
    }

    if (type === 'polysemy') {
      return new Response(JSON.stringify(await fetchPolysemy(ALGORITHMS_DB)), {
        headers: corsHeaders,
      });
    }

    if (type === 'all') {
      const [stems, domains, polysemy] = await Promise.all([
        fetchStems(ALGORITHMS_DB),
        fetchDomains(ALGORITHMS_DB),
        fetchPolysemy(ALGORITHMS_DB),
      ]);

      return new Response(
        JSON.stringify({
          stems,
          domains,
          polysemy,
        }),
        { headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type. Use: stems, domains, polysemy, or all' }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error('Algorithms D1 query error:', error);
    return new Response(
      JSON.stringify({ error: 'Database query failed', details: String(error) }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
};

// 어간 사전 조회
async function fetchStems(db: D1Database) {
  const { results } = await db
    .prepare('SELECT stem, en, type FROM dict_stems ORDER BY stem')
    .all<StemRow>();

  // 타입별로 분류
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
}

// 도메인별 어휘 조회
async function fetchDomains(db: D1Database) {
  const { results } = await db
    .prepare('SELECT ko, en, domain, direction FROM dict_domains ORDER BY domain, ko')
    .all<DomainRow>();

  // 도메인별로 그룹화
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
}

// 다의어 사전 조회
async function fetchPolysemy(db: D1Database) {
  const { results } = await db
    .prepare('SELECT word, meanings, examples FROM dict_polysemy ORDER BY word')
    .all<PolysemyRow>();

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
}
