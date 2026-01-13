// ========================================
// @soundblue/text-processor - English Grammar Check
// Subject-verb agreement, tense consistency, articles, prepositions
// ========================================

import type { TextError } from './types';

// ========================================
// Data: Verb conjugations and patterns
// ========================================

/** Third person singular pronouns */
const thirdPersonSingular = new Set(['he', 'she', 'it']);

/** First/Second person and plural pronouns */
const nonThirdPersonSingular = new Set(['i', 'you', 'we', 'they']);

/** Common irregular verbs: base form → 3rd person singular */
const irregularThirdPerson: Record<string, string> = {
  be: 'is',
  have: 'has',
  do: 'does',
  go: 'goes',
  say: 'says',
};

/** Common irregular verbs: 3rd person singular → base form */
const irregularBaseForm: Record<string, string> = {
  is: 'be',
  am: 'be',
  are: 'be',
  has: 'have',
  does: 'do',
  goes: 'go',
  says: 'say',
};

/** Verbs that should use "am" with "I" */
const beVerbForms = new Set(['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being']);

/** Past tense indicators */
const pastIndicators = new Set([
  'yesterday',
  'ago',
  'last',
  'before',
  'previously',
  'earlier',
  'once',
  'formerly',
]);

/** Present tense indicators */
const presentIndicators = new Set([
  'now',
  'today',
  'currently',
  'always',
  'usually',
  'often',
  'sometimes',
  'never',
  'every',
]);

/** Future tense indicators */
const futureIndicators = new Set(['tomorrow', 'soon', 'later', 'next', 'will', 'going', 'shall']);

/** Countable nouns that commonly need articles */
const countableNouns = new Set([
  'book',
  'car',
  'house',
  'dog',
  'cat',
  'table',
  'chair',
  'computer',
  'phone',
  'person',
  'child',
  'man',
  'woman',
  'boy',
  'girl',
  'student',
  'teacher',
  'doctor',
  'friend',
  'problem',
  'question',
  'answer',
  'idea',
  'example',
  'fact',
  'thing',
  'place',
  'time',
  'day',
  'week',
  'month',
  'year',
  'city',
  'country',
  'school',
  'office',
  'room',
  'door',
  'window',
  'bed',
  'movie',
  'song',
  'game',
  'story',
  'letter',
  'word',
  'sentence',
  'paragraph',
  'page',
]);

/** Uncountable nouns that don't need articles in general statements */
const uncountableNouns = new Set([
  'water',
  'air',
  'money',
  'music',
  'information',
  'advice',
  'news',
  'furniture',
  'equipment',
  'luggage',
  'baggage',
  'traffic',
  'weather',
  'homework',
  'knowledge',
  'progress',
  'research',
  'work',
  'bread',
  'rice',
  'sugar',
  'salt',
  'milk',
  'coffee',
  'tea',
  'food',
  'meat',
  'fish',
  'fruit',
  'love',
  'happiness',
  'sadness',
  'anger',
  'fear',
  'time',
  'space',
  'energy',
  'electricity',
  'gas',
  'oil',
]);

/** Common preposition collocations: verb/adjective → correct preposition */
const _prepositionCollocations: Record<string, string> = {
  // Verb + preposition
  listen: 'to',
  depend: 'on',
  rely: 'on',
  consist: 'of',
  belong: 'to',
  apologize: 'for',
  wait: 'for',
  look: 'at', // or 'for', context-dependent
  arrive: 'at', // or 'in' for countries/cities
  agree: 'with',
  disagree: 'with',
  believe: 'in',
  succeed: 'in',
  participate: 'in',
  concentrate: 'on',
  focus: 'on',
  insist: 'on',
  complain: 'about',
  worry: 'about',
  think: 'about', // or 'of'
  dream: 'about', // or 'of'
  care: 'about',
  talk: 'about',
  argue: 'about',
  // Adjective + preposition
  interested: 'in',
  good: 'at',
  bad: 'at',
  afraid: 'of',
  scared: 'of',
  tired: 'of',
  proud: 'of',
  fond: 'of',
  jealous: 'of',
  aware: 'of',
  capable: 'of',
  full: 'of',
  short: 'of',
  angry: 'with', // or 'at' (US)
  pleased: 'with',
  satisfied: 'with',
  familiar: 'with',
  responsible: 'for',
  famous: 'for',
  sorry: 'for', // or 'about'
  ready: 'for',
  suitable: 'for',
  grateful: 'for',
  different: 'from',
  similar: 'to',
  married: 'to',
  related: 'to',
  addicted: 'to',
  allergic: 'to',
  close: 'to',
  nice: 'to',
  kind: 'to',
  rude: 'to',
};

/** Common wrong prepositions and their corrections */
const wrongPrepositions: Array<{
  pattern: RegExp;
  wrong: string;
  correct: string;
  message: string;
}> = [
  {
    pattern: /\blisten\s+(at|on|for)\b/gi,
    wrong: 'at|on|for',
    correct: 'to',
    message: 'Use "listen to"',
  },
  {
    pattern: /\bdepend\s+(at|to|for)\b/gi,
    wrong: 'at|to|for',
    correct: 'on',
    message: 'Use "depend on"',
  },
  {
    pattern: /\brely\s+(at|to|for)\b/gi,
    wrong: 'at|to|for',
    correct: 'on',
    message: 'Use "rely on"',
  },
  {
    pattern: /\bconsist\s+(on|at|with)\b/gi,
    wrong: 'on|at|with',
    correct: 'of',
    message: 'Use "consist of"',
  },
  {
    pattern: /\bbelong\s+(for|at|with)\b/gi,
    wrong: 'for|at|with',
    correct: 'to',
    message: 'Use "belong to"',
  },
  {
    pattern: /\bwait\s+(to|at|on)\b/gi,
    wrong: 'to|at|on',
    correct: 'for',
    message: 'Use "wait for"',
  },
  {
    pattern: /\binterested\s+(on|at|for)\b/gi,
    wrong: 'on|at|for',
    correct: 'in',
    message: 'Use "interested in"',
  },
  {
    pattern: /\bgood\s+(in|on|for)\b/gi,
    wrong: 'in|on|for',
    correct: 'at',
    message: 'Use "good at"',
  },
  {
    pattern: /\bbad\s+(in|on|for)\b/gi,
    wrong: 'in|on|for',
    correct: 'at',
    message: 'Use "bad at"',
  },
  {
    pattern: /\bafraid\s+(from|at|for)\b/gi,
    wrong: 'from|at|for',
    correct: 'of',
    message: 'Use "afraid of"',
  },
  {
    pattern: /\btired\s+(from|at|with)\b/gi,
    wrong: 'from|at|with',
    correct: 'of',
    message: 'Use "tired of"',
  },
  {
    pattern: /\bproud\s+(for|at|with)\b/gi,
    wrong: 'for|at|with',
    correct: 'of',
    message: 'Use "proud of"',
  },
  {
    pattern: /\bdifferent\s+(than|to|of)\b/gi,
    wrong: 'than|to|of',
    correct: 'from',
    message: 'Use "different from"',
  },
  {
    pattern: /\bsimilar\s+(with|of|from)\b/gi,
    wrong: 'with|of|from',
    correct: 'to',
    message: 'Use "similar to"',
  },
  {
    pattern: /\bmarried\s+(with|of|for)\b/gi,
    wrong: 'with|of|for',
    correct: 'to',
    message: 'Use "married to"',
  },
];

// ========================================
// Helper functions
// ========================================

/**
 * Get the third person singular form of a verb
 */
function getThirdPersonSingular(verb: string): string {
  const lower = verb.toLowerCase();

  // Check irregular verbs first
  if (irregularThirdPerson[lower]) {
    return irregularThirdPerson[lower];
  }

  // Regular verb conjugation rules
  if (
    lower.endsWith('ss') ||
    lower.endsWith('sh') ||
    lower.endsWith('ch') ||
    lower.endsWith('x') ||
    lower.endsWith('o')
  ) {
    return `${lower}es`;
  }
  if (lower.endsWith('y') && !/[aeiou]y$/i.test(lower)) {
    return `${lower.slice(0, -1)}ies`;
  }

  return `${lower}s`;
}

/**
 * Get the base form of a verb from its conjugated form
 */
function getBaseForm(verb: string): string {
  const lower = verb.toLowerCase();

  // Check irregular verbs first
  if (irregularBaseForm[lower]) {
    return irregularBaseForm[lower];
  }

  // Try to reverse regular conjugation
  if (lower.endsWith('ies')) {
    return `${lower.slice(0, -3)}y`;
  }
  if (lower.endsWith('es')) {
    const stem = lower.slice(0, -2);
    if (
      stem.endsWith('ss') ||
      stem.endsWith('sh') ||
      stem.endsWith('ch') ||
      stem.endsWith('x') ||
      stem.endsWith('o')
    ) {
      return stem;
    }
    return lower.slice(0, -1); // just remove 's'
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }

  return lower;
}

/**
 * Check if a word looks like a verb in base form
 */
function looksLikeBaseVerb(word: string): boolean {
  const lower = word.toLowerCase();
  // Common base form verbs
  const commonVerbs = new Set([
    'go',
    'do',
    'have',
    'be',
    'say',
    'get',
    'make',
    'know',
    'think',
    'take',
    'see',
    'come',
    'want',
    'use',
    'find',
    'give',
    'tell',
    'work',
    'call',
    'try',
    'ask',
    'need',
    'feel',
    'become',
    'leave',
    'put',
    'mean',
    'keep',
    'let',
    'begin',
    'seem',
    'help',
    'show',
    'hear',
    'play',
    'run',
    'move',
    'live',
    'believe',
    'hold',
    'bring',
    'happen',
    'write',
    'provide',
    'sit',
    'stand',
    'lose',
    'pay',
    'meet',
    'include',
    'continue',
    'set',
    'learn',
    'change',
    'lead',
    'understand',
    'watch',
    'follow',
    'stop',
    'create',
    'speak',
    'read',
    'allow',
    'add',
    'spend',
    'grow',
    'open',
    'walk',
    'win',
    'offer',
    'remember',
    'love',
    'consider',
    'appear',
    'buy',
    'wait',
    'serve',
    'die',
    'send',
    'expect',
    'build',
    'stay',
    'fall',
    'cut',
    'reach',
    'kill',
    'remain',
    'suggest',
    'raise',
    'pass',
    'sell',
    'require',
    'report',
    'decide',
    'pull',
    'eat',
    'like',
    'look',
    'listen',
    'agree',
  ]);
  return commonVerbs.has(lower);
}

/**
 * Check if a word looks like a third person singular verb
 */
function looksLikeThirdPersonVerb(word: string): boolean {
  const lower = word.toLowerCase();
  if (irregularBaseForm[lower]) return true;
  return lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 2;
}

// ========================================
// Grammar check functions
// ========================================

/**
 * Check subject-verb agreement
 * Examples: "he go" → "he goes", "they goes" → "they go"
 */
export function checkSubjectVerbAgreement(text: string): TextError[] {
  const errors: TextError[] = [];

  // Pattern: pronoun + verb
  // Third person singular needs -s ending
  const pronounVerbPattern = /\b(he|she|it|i|you|we|they)\s+([a-z]+)\b/gi;
  let match: RegExpExecArray | null = pronounVerbPattern.exec(text);

  while (match !== null) {
    const pronounMatch = match[1];
    const verbMatch = match[2];
    if (!pronounMatch || !verbMatch) {
      match = pronounVerbPattern.exec(text);
      continue;
    }
    const pronoun = pronounMatch.toLowerCase();
    const verb = verbMatch.toLowerCase();
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch.length;

    // Skip auxiliary verbs and modals
    const skipVerbs = new Set([
      'will',
      'would',
      'can',
      'could',
      'should',
      'may',
      'might',
      'must',
      'shall',
    ]);
    if (skipVerbs.has(verb)) {
      match = pronounVerbPattern.exec(text);
      continue;
    }

    // Handle "be" verb specially
    if (beVerbForms.has(verb)) {
      // "I is" → "I am"
      if (pronoun === 'i' && verb === 'is') {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} am`],
          message: 'Use "am" with "I"',
          confidence: 0.95,
        });
      }
      // "I are" → "I am"
      else if (pronoun === 'i' && verb === 'are') {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} am`],
          message: 'Use "am" with "I"',
          confidence: 0.95,
        });
      }
      // "he/she/it are" → "he/she/it is"
      else if (thirdPersonSingular.has(pronoun) && verb === 'are') {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} is`],
          message: 'Use "is" with third person singular',
          confidence: 0.95,
        });
      }
      // "you/we/they is" → "you/we/they are"
      else if ((pronoun === 'you' || pronoun === 'we' || pronoun === 'they') && verb === 'is') {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} are`],
          message: 'Use "are" with plural subjects',
          confidence: 0.95,
        });
      }
      // "he/she/it am" → "he/she/it is"
      else if (thirdPersonSingular.has(pronoun) && verb === 'am') {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} is`],
          message: 'Use "is" with third person singular',
          confidence: 0.95,
        });
      }
      match = pronounVerbPattern.exec(text);
      continue;
    }

    // Check "have" → "has" for third person singular
    if (verb === 'have' && thirdPersonSingular.has(pronoun)) {
      errors.push({
        type: 'grammar',
        start,
        end,
        original: fullMatch,
        suggestions: [`${match[1]} has`],
        message: 'Use "has" with third person singular',
        confidence: 0.95,
      });
      match = pronounVerbPattern.exec(text);
      continue;
    }
    // "has" with non-third person singular
    if (verb === 'has' && nonThirdPersonSingular.has(pronoun)) {
      errors.push({
        type: 'grammar',
        start,
        end,
        original: fullMatch,
        suggestions: [`${match[1]} have`],
        message: 'Use "have" with this subject',
        confidence: 0.95,
      });
      match = pronounVerbPattern.exec(text);
      continue;
    }

    // Check "do" → "does" for third person singular
    if (verb === 'do' && thirdPersonSingular.has(pronoun)) {
      errors.push({
        type: 'grammar',
        start,
        end,
        original: fullMatch,
        suggestions: [`${match[1]} does`],
        message: 'Use "does" with third person singular',
        confidence: 0.95,
      });
      match = pronounVerbPattern.exec(text);
      continue;
    }
    // "does" with non-third person singular
    if (verb === 'does' && nonThirdPersonSingular.has(pronoun)) {
      errors.push({
        type: 'grammar',
        start,
        end,
        original: fullMatch,
        suggestions: [`${match[1]} do`],
        message: 'Use "do" with this subject',
        confidence: 0.95,
      });
      match = pronounVerbPattern.exec(text);
      continue;
    }

    // General verb agreement check
    // Third person singular + base form verb → add -s
    if (thirdPersonSingular.has(pronoun) && looksLikeBaseVerb(verb)) {
      const corrected = getThirdPersonSingular(verb);
      errors.push({
        type: 'grammar',
        start,
        end,
        original: fullMatch,
        suggestions: [`${match[1]} ${corrected}`],
        message: `Use "${corrected}" with third person singular`,
        confidence: 0.85,
      });
    }
    // Non-third person singular + third person verb → remove -s
    else if (
      nonThirdPersonSingular.has(pronoun) &&
      looksLikeThirdPersonVerb(verb) &&
      !looksLikeBaseVerb(verb)
    ) {
      const base = getBaseForm(verb);
      if (base !== verb) {
        errors.push({
          type: 'grammar',
          start,
          end,
          original: fullMatch,
          suggestions: [`${match[1]} ${base}`],
          message: `Use "${base}" with this subject`,
          confidence: 0.85,
        });
      }
    }

    match = pronounVerbPattern.exec(text);
  }

  return errors;
}

/**
 * Check tense consistency within a sentence
 * Detects mixing of past and present tense
 */
export function checkTenseConsistency(text: string): TextError[] {
  const errors: TextError[] = [];

  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  for (const sentence of sentences) {
    const words = sentence.toLowerCase().split(/\s+/);

    let hasPastIndicator = false;
    let hasPresentIndicator = false;
    let _hasFutureIndicator = false;

    // Check for tense indicators
    for (const word of words) {
      if (pastIndicators.has(word)) hasPastIndicator = true;
      if (presentIndicators.has(word)) hasPresentIndicator = true;
      if (futureIndicators.has(word)) _hasFutureIndicator = true;
    }

    // Look for tense mismatches
    // Pattern: past indicator + present tense verb (excluding be verbs)
    if (hasPastIndicator && !hasPresentIndicator) {
      // Check for present tense verbs that should be past
      const presentVerbPattern = /\b(yesterday|ago|last\s+\w+)\b.*?\b([a-z]+s)\b/gi;
      let match = presentVerbPattern.exec(sentence);
      while (match !== null) {
        const verbMatch = match[2];
        if (!verbMatch) {
          match = presentVerbPattern.exec(sentence);
          continue;
        }
        const verb = verbMatch.toLowerCase();
        // Skip words that aren't likely verbs
        if (!verb.endsWith('ss') && verb.length > 3 && looksLikeThirdPersonVerb(verb)) {
          const sentenceStart = text.indexOf(sentence);
          const verbStart = sentenceStart + match.index + match[0].indexOf(verbMatch);
          errors.push({
            type: 'grammar',
            start: verbStart,
            end: verbStart + verb.length,
            original: verb,
            suggestions: [], // Hard to suggest correct past tense without more context
            message: 'Possible tense inconsistency: past context with present tense verb',
            confidence: 0.6,
          });
        }
        match = presentVerbPattern.exec(sentence);
      }
    }
  }

  return errors;
}

/**
 * Check for missing or incorrect articles
 * Examples: "I saw dog" → "I saw a dog", "the informations" → "the information"
 */
export function checkArticles(text: string): TextError[] {
  const errors: TextError[] = [];

  // Pattern 1: Countable singular noun without article after common verbs
  const verbNounPattern =
    /\b(saw|see|have|has|had|want|need|buy|bought|found|find|got|get|made|make|take|took|give|gave)\s+([a-z]+)\b/gi;
  let match: RegExpExecArray | null = verbNounPattern.exec(text);

  while (match !== null) {
    const verbPart = match[1];
    const nounPart = match[2];
    if (!verbPart || !nounPart) {
      match = verbNounPattern.exec(text);
      continue;
    }
    const noun = nounPart.toLowerCase();

    // Check if it's a countable noun that needs an article
    if (countableNouns.has(noun)) {
      const start = match.index;
      const end = start + match[0].length;
      errors.push({
        type: 'grammar',
        start,
        end,
        original: match[0],
        suggestions: [`${verbPart} a ${nounPart}`, `${verbPart} the ${nounPart}`],
        message: `Consider adding an article before "${noun}"`,
        confidence: 0.7,
      });
    }

    match = verbNounPattern.exec(text);
  }

  // Pattern 2: "a/an" before uncountable nouns
  const articleUncountablePattern = /\b(a|an)\s+([a-z]+)\b/gi;
  match = articleUncountablePattern.exec(text);

  while (match !== null) {
    const nounPart = match[2];
    if (!nounPart) {
      match = articleUncountablePattern.exec(text);
      continue;
    }
    const noun = nounPart.toLowerCase();

    if (uncountableNouns.has(noun)) {
      const start = match.index;
      const end = start + match[0].length;
      errors.push({
        type: 'grammar',
        start,
        end,
        original: match[0],
        suggestions: [noun, `some ${noun}`],
        message: `"${noun}" is uncountable; don't use "a/an"`,
        confidence: 0.85,
      });
    }

    match = articleUncountablePattern.exec(text);
  }

  // Pattern 3: Plural uncountable nouns with article
  const pluralUncountablePattern = /\b(the|some|many|much)\s+([a-z]+s)\b/gi;
  match = pluralUncountablePattern.exec(text);

  while (match !== null) {
    const articlePart = match[1];
    const wordPart = match[2];
    if (!articlePart || !wordPart) {
      match = pluralUncountablePattern.exec(text);
      continue;
    }
    const word = wordPart.toLowerCase();
    const singular = word.endsWith('s') ? word.slice(0, -1) : word;

    // Check if the singular form is uncountable
    if (uncountableNouns.has(singular) && word !== singular) {
      const start = match.index;
      const end = start + match[0].length;
      errors.push({
        type: 'grammar',
        start,
        end,
        original: match[0],
        suggestions: [`${articlePart} ${singular}`],
        message: `"${singular}" is uncountable and doesn't have a plural form`,
        confidence: 0.85,
      });
    }

    match = pluralUncountablePattern.exec(text);
  }

  return errors;
}

/**
 * Check for incorrect preposition usage
 */
export function checkPrepositions(text: string): TextError[] {
  const errors: TextError[] = [];

  for (const rule of wrongPrepositions) {
    let match = rule.pattern.exec(text);
    // Reset lastIndex for global regex
    rule.pattern.lastIndex = 0;
    match = rule.pattern.exec(text);

    while (match !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Build the corrected version
      const words = match[0].split(/\s+/);
      const corrected = `${words[0]} ${rule.correct}`;

      errors.push({
        type: 'grammar',
        start,
        end,
        original: match[0],
        suggestions: [corrected],
        message: rule.message,
        confidence: 0.9,
      });

      match = rule.pattern.exec(text);
    }
  }

  return errors;
}

/**
 * Run all English grammar checks
 */
export function checkEnglishGrammar(text: string): TextError[] {
  const errors: TextError[] = [];

  errors.push(...checkSubjectVerbAgreement(text));
  errors.push(...checkTenseConsistency(text));
  errors.push(...checkArticles(text));
  errors.push(...checkPrepositions(text));

  // Sort by position
  errors.sort((a, b) => a.start - b.start);

  return errors;
}
