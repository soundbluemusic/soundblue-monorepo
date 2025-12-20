// ========================================
// Patterns Dictionary - 패턴 사전
// ========================================

import type { PatternEntry } from '../types';

export const koToEnPatterns: PatternEntry[] = [
  // === 진행형 패턴 (V-고 있다) ===
  { ko: /^(.+)을 (.+)고 있어요$/, en: 'I am $2ing $1' },
  { ko: /^(.+)를 (.+)고 있어요$/, en: 'I am $2ing $1' },
  { ko: /^(.+)고 있어요$/, en: 'I am $1ing' },
  { ko: /^(.+)고 있어$/, en: 'I am $1ing' },
  { ko: /^(.+)고 있다$/, en: 'I am $1ing' },

  // === 요청 패턴 (V-아/어 주세요) ===
  { ko: /^(.+)에 (.+)해 주세요$/, en: 'Please $2 the $1' },
  { ko: /^(.+)를 (.+)해 주세요$/, en: 'Please $2 $1' },
  { ko: /^(.+)을 (.+)해 주세요$/, en: 'Please $2 $1' },
  { ko: /^(.+)아 주세요$/, en: 'Please $1' },
  { ko: /^(.+)어 주세요$/, en: 'Please $1' },
  { ko: /^(.+)해 주세요$/, en: 'Please $1' },

  // === 명령 패턴 (V-아/어라) ===
  { ko: /^(.+)에 (.+)해라$/, en: '$2 the $1' },
  { ko: /^(.+)아라$/, en: '$1' },
  { ko: /^(.+)어라$/, en: '$1' },
  { ko: /^(.+)해라$/, en: '$1' },

  // === 질문 패턴 (주어 생략, you 추론) ===
  // Note: ? is removed by normalize, questionOnly patterns only match when isQuestion=true
  // $1PP = past participle of $1 (eaten, not eated)
  { ko: /^(.+) (.+)었어$/, en: 'Have you $2PP $1', questionOnly: true },
  { ko: /^(.+)었어$/, en: 'Have you $1PP', questionOnly: true },
  { ko: /^어디\s*가$/, en: 'Where are you going', questionOnly: true },
  { ko: /^뭐 해$/, en: 'What are you doing', questionOnly: true },
  { ko: /^뭐 먹어$/, en: 'What are you eating', questionOnly: true },

  // === 추측 패턴 ===
  { ko: /^(.+)겠다$/, en: 'That looks $1' },
  { ko: /^(.+)겠어$/, en: 'That looks $1' },
  { ko: /^(.+)겠네$/, en: 'That looks $1' },

  // === 희망 패턴 (V-고 싶다) ===
  { ko: /^(.+) (.+)고 싶다$/, en: 'I want to $2 $1' },
  { ko: /^(.+) (.+)고 싶어$/, en: 'I want to $2 $1' },
  { ko: /^(.+) (.+)고 싶어요$/, en: 'I want to $2 $1' },
  { ko: /^(.+)고 싶다$/, en: 'I want to $1' },
  { ko: /^(.+)고 싶어$/, en: 'I want to $1' },
  { ko: /^(.+)고 싶어요$/, en: 'I want to $1' },

  // === 청유 패턴 (V-자) ===
  { ko: /^(.+) (.+)자$/, en: "let's $2 $1" },
  { ko: /^(.+)자$/, en: "let's $1" },

  // === 동사 패턴 ===
  { ko: /^(.+)하고 싶어요$/, en: 'I want to $1' },
  { ko: /^(.+)할 수 있어요$/, en: 'I can $1' },
  { ko: /^(.+)할 수 없어요$/, en: "I can't $1" },
  { ko: /^(.+)해야 해요$/, en: 'I have to $1' },
  { ko: /^(.+)하면 안 돼요$/, en: "You shouldn't $1" },
  { ko: /^(.+)해도 돼요$/, en: 'You can $1' },
  { ko: /^(.+)하는 중이에요$/, en: "I'm $1ing" },
  { ko: /^(.+)할 거예요$/, en: 'I will $1' },
  { ko: /^(.+)했어요$/, en: 'I $1ed' },

  // === 과거 시제 패턴 ===
  { ko: /^(.+)을 (.+)었어요$/, en: 'I $2PAST $1' },
  { ko: /^(.+)를 (.+)었어요$/, en: 'I $2PAST $1' },
  { ko: /^(.+)을 (.+)았어요$/, en: 'I $2PAST $1' },
  { ko: /^(.+)를 (.+)았어요$/, en: 'I $2PAST $1' },
  { ko: /^(.+)었어요$/, en: 'I $1PAST' },
  { ko: /^(.+)았어요$/, en: 'I $1PAST' },

  // === 질문 패턴 ===
  { ko: /^(.+)이 뭐예요$/, en: 'What is $1' },
  { ko: /^(.+)가 뭐예요$/, en: 'What is $1' },
  { ko: /^(.+)은 어디예요$/, en: 'Where is $1' },
  { ko: /^(.+)는 어디예요$/, en: 'Where is $1' },
  { ko: /^(.+)이 있어요$/, en: 'Is there $1' },
  { ko: /^(.+)가 있어요$/, en: 'Is there $1' },
  { ko: /^(.+)을 좋아해요$/, en: 'I like $1' },
  { ko: /^(.+)를 좋아해요$/, en: 'I like $1' },

  // === 형용사 패턴 ===
  { ko: /^너무 (.+)해요$/, en: "It's too $1" },
  { ko: /^정말 (.+)해요$/, en: "It's really $1" },
  { ko: /^(.+)보다 (.+)해요$/, en: "It's more $2 than $1" },

  // === 시간 패턴 ===
  { ko: /^(.+)에 만나요$/, en: "Let's meet at $1" },
  { ko: /^(.+)부터 (.+)까지$/, en: 'From $1 to $2' },
];

// 영→한 패턴
export const enToKoPatterns: PatternEntry[] = [
  { ko: /^I want to (.+)$/i, en: '$1하고 싶어요' },
  { ko: /^Please (.+)$/i, en: '$1해 주세요' },
  { ko: /^I can (.+)$/i, en: '$1할 수 있어요' },
  { ko: /^I can't (.+)$/i, en: '$1할 수 없어요' },
  { ko: /^I have to (.+)$/i, en: '$1해야 해요' },
  { ko: /^I will (.+)$/i, en: '$1할 거예요' },
  { ko: /^I like (.+)$/i, en: '$1을 좋아해요' },
  { ko: /^What is (.+)$/i, en: '$1이 뭐예요' },
  { ko: /^Where is (.+)$/i, en: '$1은 어디예요' },
  { ko: /^Is there (.+)$/i, en: '$1이 있어요' },
];
