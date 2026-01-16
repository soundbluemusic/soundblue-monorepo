/**
 * D1 Dictionary API Endpoint
 *
 * 런타임에 D1에서 어휘 데이터를 조회합니다.
 * Context 앱의 D1 데이터베이스에서 entries, conversations 테이블 조회
 */

interface Env {
  DB: D1Database;
}

interface EntryRow {
  id: string;
  korean: string;
  romanization: string | null;
  part_of_speech: string | null;
  category_id: string;
  difficulty: string | null;
  frequency: string | null;
  tags: string | null;
  translations: string;
}

// ConversationRow는 향후 확장을 위해 정의 (현재는 dialogue 필드만 사용)
interface _ConversationRow {
  id: string;
  category_id: string | null;
  title_ko: string;
  title_en: string;
  dialogue: string;
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
  const { DB } = context.env;
  const url = new URL(context.request.url);
  const type = url.searchParams.get('type') || 'words';

  try {
    if (type === 'words') {
      // entries 테이블에서 단어 조회
      const { results } = await DB.prepare(`
        SELECT id, korean, romanization, part_of_speech, category_id,
               difficulty, frequency, tags, translations
        FROM entries
        ORDER BY korean
      `).all<EntryRow>();

      // ko→en, en→ko 사전 생성
      const koToEn: Record<string, string> = {};
      const enToKo: Record<string, string> = {};

      for (const row of results || []) {
        const ko = row.korean;
        if (!row.translations) continue;

        try {
          const translations = JSON.parse(row.translations);
          const enWord = translations?.en?.word;

          if (ko && enWord) {
            const en = enWord.split(' / ')[0].trim();
            if (!koToEn[ko]) koToEn[ko] = en;
            if (!enToKo[en.toLowerCase()]) enToKo[en.toLowerCase()] = ko;
          }
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      return new Response(
        JSON.stringify({
          koToEn,
          enToKo,
          count: { koToEn: Object.keys(koToEn).length, enToKo: Object.keys(enToKo).length },
        }),
        { headers: corsHeaders },
      );
    }

    if (type === 'sentences') {
      // entries에서 examples, variations, dialogue 추출
      const { results: entries } = await DB.prepare(`
        SELECT korean, translations FROM entries
      `).all<{ korean: string; translations: string }>();

      // conversations에서 대화 추출
      const { results: conversations } = await DB.prepare(`
        SELECT dialogue FROM conversations
      `).all<{ dialogue: string }>();

      const koSentences: Record<string, string> = {};
      const enSentences: Record<string, string> = {};

      // entries에서 문장 추출
      for (const entry of entries || []) {
        if (!entry.translations) continue;

        try {
          const translations = JSON.parse(entry.translations);
          const koTrans = translations?.ko;
          const enTrans = translations?.en;

          // examples
          if (koTrans?.examples && enTrans?.examples) {
            for (const level of ['beginner', 'intermediate', 'advanced', 'master']) {
              const ko = koTrans.examples[level]?.trim();
              const en = enTrans.examples[level]?.trim();
              if (ko && en) {
                if (!koSentences[ko]) koSentences[ko] = en;
                if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
              }
            }
          }

          // variations
          if (koTrans?.variations && enTrans?.variations) {
            for (const type of ['formal', 'casual', 'short']) {
              const koVars = koTrans.variations[type] || [];
              const enVars = enTrans.variations[type] || [];
              const minLen = Math.min(koVars.length, enVars.length);
              for (let i = 0; i < minLen; i++) {
                const ko = koVars[i]?.trim();
                const en = enVars[i]?.trim();
                if (ko && en) {
                  if (!koSentences[ko]) koSentences[ko] = en;
                  if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
                }
              }
            }
          }

          // dialogue in entry
          if (koTrans?.dialogue?.dialogue && enTrans?.dialogue?.dialogue) {
            const koDlg = koTrans.dialogue.dialogue;
            const enDlg = enTrans.dialogue.dialogue;
            const minLen = Math.min(koDlg.length, enDlg.length);
            for (let i = 0; i < minLen; i++) {
              const ko = koDlg[i]?.text?.trim();
              const en = enDlg[i]?.text?.trim();
              if (ko && en) {
                if (!koSentences[ko]) koSentences[ko] = en;
                if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
              }
            }
          }
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      // conversations에서 문장 추출
      for (const conv of conversations || []) {
        if (!conv.dialogue) continue;

        try {
          const dialogue = JSON.parse(conv.dialogue);
          for (const line of dialogue) {
            const ko = line.ko?.trim();
            const en = line.en?.trim();
            if (ko && en) {
              if (!koSentences[ko]) koSentences[ko] = en;
              if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
            }
          }
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }

      return new Response(
        JSON.stringify({
          koToEn: koSentences,
          enToKo: enSentences,
          count: {
            koToEn: Object.keys(koSentences).length,
            enToKo: Object.keys(enSentences).length,
          },
        }),
        { headers: corsHeaders },
      );
    }

    if (type === 'all') {
      // 단어 + 문장 모두 반환
      const wordsResponse = await fetchWords(DB);
      const sentencesResponse = await fetchSentences(DB);

      return new Response(
        JSON.stringify({
          words: wordsResponse,
          sentences: sentencesResponse,
        }),
        { headers: corsHeaders },
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid type. Use: words, sentences, or all' }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('D1 query error:', error);
    return new Response(
      JSON.stringify({ error: 'Database query failed', details: String(error) }),
      { status: 500, headers: corsHeaders },
    );
  }
};

// Helper functions
async function fetchWords(DB: D1Database) {
  const { results } = await DB.prepare(`
    SELECT korean, translations FROM entries ORDER BY korean
  `).all<{ korean: string; translations: string }>();

  const koToEn: Record<string, string> = {};
  const enToKo: Record<string, string> = {};

  for (const row of results || []) {
    const ko = row.korean;
    if (!row.translations) continue;

    try {
      const translations = JSON.parse(row.translations);
      const enWord = translations?.en?.word;
      if (ko && enWord) {
        const en = enWord.split(' / ')[0].trim();
        if (!koToEn[ko]) koToEn[ko] = en;
        if (!enToKo[en.toLowerCase()]) enToKo[en.toLowerCase()] = ko;
      }
    } catch {
      // ignore
    }
  }

  return {
    koToEn,
    enToKo,
    count: { koToEn: Object.keys(koToEn).length, enToKo: Object.keys(enToKo).length },
  };
}

async function fetchSentences(DB: D1Database) {
  const koSentences: Record<string, string> = {};
  const enSentences: Record<string, string> = {};

  // entries
  const { results: entries } = await DB.prepare(`SELECT translations FROM entries`).all<{
    translations: string;
  }>();
  for (const entry of entries || []) {
    if (!entry.translations) continue;
    try {
      const translations = JSON.parse(entry.translations);
      extractSentencesFromTranslations(translations, koSentences, enSentences);
    } catch {
      // ignore
    }
  }

  // conversations
  const { results: conversations } = await DB.prepare(`SELECT dialogue FROM conversations`).all<{
    dialogue: string;
  }>();
  for (const conv of conversations || []) {
    if (!conv.dialogue) continue;
    try {
      const dialogue = JSON.parse(conv.dialogue);
      for (const line of dialogue) {
        const ko = line.ko?.trim();
        const en = line.en?.trim();
        if (ko && en) {
          if (!koSentences[ko]) koSentences[ko] = en;
          if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    koToEn: koSentences,
    enToKo: enSentences,
    count: { koToEn: Object.keys(koSentences).length, enToKo: Object.keys(enSentences).length },
  };
}

interface TranslationData {
  examples?: Record<string, string>;
  variations?: Record<string, string[]>;
}

function extractSentencesFromTranslations(
  translations: { ko?: TranslationData; en?: TranslationData },
  koSentences: Record<string, string>,
  enSentences: Record<string, string>,
) {
  const koTrans = translations?.ko;
  const enTrans = translations?.en;

  // examples
  if (koTrans?.examples && enTrans?.examples) {
    for (const level of ['beginner', 'intermediate', 'advanced', 'master']) {
      const ko = koTrans.examples[level]?.trim();
      const en = enTrans.examples[level]?.trim();
      if (ko && en) {
        if (!koSentences[ko]) koSentences[ko] = en;
        if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
      }
    }
  }

  // variations
  if (koTrans?.variations && enTrans?.variations) {
    for (const type of ['formal', 'casual', 'short']) {
      const koVars = koTrans.variations[type] || [];
      const enVars = enTrans.variations[type] || [];
      const minLen = Math.min(koVars.length, enVars.length);
      for (let i = 0; i < minLen; i++) {
        const ko = koVars[i]?.trim();
        const en = enVars[i]?.trim();
        if (ko && en) {
          if (!koSentences[ko]) koSentences[ko] = en;
          if (!enSentences[en.toLowerCase()]) enSentences[en.toLowerCase()] = ko;
        }
      }
    }
  }
}
