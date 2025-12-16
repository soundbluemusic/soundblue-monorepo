import { knowledge, KnowledgeItem } from "~/data/knowledge";
import type { Locale } from "~/i18n";

interface SearchResult {
  item: KnowledgeItem;
  score: number;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,.\-_!?]+/)
    .filter((token) => token.length > 0);
}

function calculateScore(query: string, item: KnowledgeItem): number {
  const queryNormalized = normalizeText(query);
  const queryTokens = tokenize(query);

  let score = 0;

  // Exact keyword match (highest weight)
  for (const keyword of item.keywords) {
    const keywordNormalized = normalizeText(keyword);
    if (queryNormalized.includes(keywordNormalized)) {
      score += 10;
    }
    if (queryTokens.some((token) => keywordNormalized.includes(token))) {
      score += 5;
    }
  }

  // Question similarity
  const questionTokens = tokenize(item.question);
  for (const queryToken of queryTokens) {
    for (const questionToken of questionTokens) {
      if (questionToken.includes(queryToken) || queryToken.includes(questionToken)) {
        score += 3;
      }
    }
  }

  // Partial match in answer (lower weight)
  const answerNormalized = normalizeText(item.answer);
  for (const queryToken of queryTokens) {
    if (answerNormalized.includes(queryToken)) {
      score += 1;
    }
  }

  return score;
}

export function searchKnowledge(
  query: string,
  locale: Locale,
  limit: number = 3
): KnowledgeItem[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const item of knowledge) {
    // Filter by locale
    if (item.locale !== "all" && item.locale !== locale) {
      continue;
    }

    const score = calculateScore(query, item);
    if (score > 0) {
      results.push({ item, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Return top results
  return results.slice(0, limit).map((r) => r.item);
}

export function getWelcomeResponse(locale: Locale): string {
  const intro = knowledge.find(
    (item) =>
      item.id.startsWith("dialogue-intro") && item.locale === locale
  );
  return intro?.answer || "";
}
