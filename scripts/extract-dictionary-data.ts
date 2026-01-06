#!/usr/bin/env tsx
/**
 * Extract pure dictionary data from TypeScript files to JSON
 *
 * This script extracts pure vocabulary data (사과=apple level)
 * from TypeScript dictionary files and converts them to JSON format.
 *
 * Output: data/dictionaries/
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ROOT = process.cwd();
const TRANSLATOR_DICT = join(ROOT, 'apps/tools/app/tools/translator/dictionary');
const OUTPUT_DIR = join(ROOT, 'data/dictionaries');

interface WordEntry {
  ko: string;
  en: string;
}

interface StemEntry {
  stem: string;
  en: string;
  type: 'verb' | 'adjective' | 'noun';
}

interface IdiomEntry {
  ko: string;
  en: string;
  literal?: string;
  category?: string;
  variants?: string[];
}

interface PolysemyTranslation {
  english: string;
  category: string;
  priority?: number;
  contextHints?: string[];
}

interface PolysemyEntry {
  korean: string;
  translations: PolysemyTranslation[];
}

interface DomainEntry {
  ko: string;
  en: string;
  domain: string;
}

/**
 * Parse a TypeScript object literal to extract key-value pairs
 * Handles both simple strings and quoted keys
 */
function parseObjectLiteral(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  // Match patterns like:
  // key: 'value',
  // 'key with spaces': 'value',
  // "key": "value",
  const regex = /(?:['"]([^'"]+)['"]|([가-힣a-zA-Z0-9_-]+))\s*:\s*['"]([^'"]+)['"]/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1] || match[2];
    const value = match[3];
    if (key && value) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extract manualKoToEnWords from words.ts
 */
function extractKoToEnWords(): WordEntry[] {
  const filePath = join(TRANSLATOR_DICT, 'words.ts');
  const content = readFileSync(filePath, 'utf-8');

  // Find the manualKoToEnWords object
  const startMarker = 'const manualKoToEnWords: Record<string, string> = {';
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error('Could not find manualKoToEnWords in words.ts');
  }

  // Find the closing brace (accounting for nested objects)
  let braceCount = 0;
  let endIndex = startIndex + startMarker.length;
  let foundStart = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundStart && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  const objectContent = content.slice(startIndex, endIndex);
  const parsed = parseObjectLiteral(objectContent);

  return Object.entries(parsed).map(([ko, en]) => ({ ko, en }));
}

/**
 * Extract manualEnToKoWords from words.ts
 */
function extractEnToKoWords(): WordEntry[] {
  const filePath = join(TRANSLATOR_DICT, 'words.ts');
  const content = readFileSync(filePath, 'utf-8');

  const startMarker = 'const manualEnToKoWords: Record<string, string> = {';
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error('Could not find manualEnToKoWords in words.ts');
  }

  let braceCount = 0;
  let endIndex = startIndex + startMarker.length;
  let foundStart = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundStart && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  const objectContent = content.slice(startIndex, endIndex);
  const parsed = parseObjectLiteral(objectContent);

  return Object.entries(parsed).map(([en, ko]) => ({ ko, en }));
}

/**
 * Extract an object from content starting at a marker
 */
function extractObjectFromMarker(content: string, marker: string): string | null {
  const startIndex = content.indexOf(marker);
  if (startIndex === -1) return null;

  let braceCount = 0;
  let endIndex = startIndex;
  let foundStart = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundStart && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  return content.slice(startIndex, endIndex);
}

/**
 * Extract stems from stems.ts
 */
function extractStems(): StemEntry[] {
  const filePath = join(TRANSLATOR_DICT, 'stems.ts');
  if (!existsSync(filePath)) {
    console.log('  ⚠️ stems.ts not found, skipping');
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const entries: StemEntry[] = [];

  // Extract VERB_STEMS (using const, not export const)
  const verbContent = extractObjectFromMarker(
    content,
    'const VERB_STEMS: Record<string, string> = {',
  );
  if (verbContent) {
    const parsed = parseObjectLiteral(verbContent);
    for (const [stem, en] of Object.entries(parsed)) {
      entries.push({ stem, en, type: 'verb' });
    }
  }

  // Extract ADJECTIVE_STEMS
  const adjContent = extractObjectFromMarker(
    content,
    'const ADJECTIVE_STEMS: Record<string, string> = {',
  );
  if (adjContent) {
    const parsed = parseObjectLiteral(adjContent);
    for (const [stem, en] of Object.entries(parsed)) {
      entries.push({ stem, en, type: 'adjective' });
    }
  }

  // Extract NOUN_STEMS
  const nounContent = extractObjectFromMarker(
    content,
    'const NOUN_STEMS: Record<string, string> = {',
  );
  if (nounContent) {
    const parsed = parseObjectLiteral(nounContent);
    for (const [stem, en] of Object.entries(parsed)) {
      entries.push({ stem, en, type: 'noun' });
    }
  }

  return entries;
}

/**
 * Extract colors from colors.ts
 */
function extractColors(): { koToEn: WordEntry[]; enToKo: WordEntry[] } {
  const filePath = join(TRANSLATOR_DICT, 'colors.ts');
  if (!existsSync(filePath)) {
    console.log('  ⚠️ colors.ts not found, skipping');
    return { koToEn: [], enToKo: [] };
  }

  const content = readFileSync(filePath, 'utf-8');
  const koToEn: WordEntry[] = [];
  const enToKo: WordEntry[] = [];

  // Extract koToEnColors
  const koToEnMatch = content.match(/export const koToEnColors[^{]*{([^}]+)}/s);
  if (koToEnMatch) {
    const parsed = parseObjectLiteral(koToEnMatch[0]);
    for (const [ko, en] of Object.entries(parsed)) {
      koToEn.push({ ko, en });
    }
  }

  // Extract enToKoColors
  const enToKoMatch = content.match(/export const enToKoColors[^{]*{([^}]+)}/s);
  if (enToKoMatch) {
    const parsed = parseObjectLiteral(enToKoMatch[0]);
    for (const [en, ko] of Object.entries(parsed)) {
      enToKo.push({ ko, en });
    }
  }

  return { koToEn, enToKo };
}

/**
 * Extract countries from countries.ts
 */
function extractCountries(): { koToEn: WordEntry[]; enToKo: WordEntry[] } {
  const filePath = join(TRANSLATOR_DICT, 'countries.ts');
  if (!existsSync(filePath)) {
    console.log('  ⚠️ countries.ts not found, skipping');
    return { koToEn: [], enToKo: [] };
  }

  const content = readFileSync(filePath, 'utf-8');
  const koToEn: WordEntry[] = [];
  const enToKo: WordEntry[] = [];

  // Extract koToEnCountries
  const koToEnMatch = content.match(/export const koToEnCountries[^{]*{([^}]+)}/s);
  if (koToEnMatch) {
    const parsed = parseObjectLiteral(koToEnMatch[0]);
    for (const [ko, en] of Object.entries(parsed)) {
      koToEn.push({ ko, en });
    }
  }

  // Extract enToKoCountries
  const enToKoMatch = content.match(/export const enToKoCountries[^{]*{([^}]+)}/s);
  if (enToKoMatch) {
    const parsed = parseObjectLiteral(enToKoMatch[0]);
    for (const [en, ko] of Object.entries(parsed)) {
      enToKo.push({ ko, en });
    }
  }

  return { koToEn, enToKo };
}

/**
 * Extract an array from content starting at a marker
 */
function _extractArrayFromMarker(content: string, marker: string): string | null {
  const startIndex = content.indexOf(marker);
  if (startIndex === -1) return null;

  let bracketCount = 0;
  let endIndex = startIndex;
  let foundStart = false;

  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '[') {
      bracketCount++;
      foundStart = true;
    } else if (content[i] === ']') {
      bracketCount--;
      if (foundStart && bracketCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  return content.slice(startIndex, endIndex);
}

/**
 * Extract idioms from idioms.ts
 */
function extractIdioms(): IdiomEntry[] {
  const filePath = join(TRANSLATOR_DICT, 'idioms.ts');
  if (!existsSync(filePath)) {
    console.log('  ⚠️ idioms.ts not found, skipping');
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const entries: IdiomEntry[] = [];

  // Match each idiom entry object
  const idiomRegex =
    /\{\s*ko:\s*['"]([^'"]+)['"]\s*,\s*en:\s*['"]([^'"]+)['"]\s*(?:,\s*literal:\s*['"]([^'"]+)['"])?\s*(?:,\s*category:\s*['"]([^'"]+)['"])?\s*(?:,\s*variants:\s*\[([^\]]*)\])?\s*\}/g;

  let match: RegExpExecArray | null;
  while ((match = idiomRegex.exec(content)) !== null) {
    const entry: IdiomEntry = {
      ko: match[1],
      en: match[2],
    };
    if (match[3]) entry.literal = match[3];
    if (match[4]) entry.category = match[4];
    if (match[5]) {
      const variants = match[5]
        .split(',')
        .map((v) => v.trim().replace(/['"]/g, ''))
        .filter((v) => v.length > 0);
      if (variants.length > 0) entry.variants = variants;
    }
    entries.push(entry);
  }

  return entries;
}

/**
 * Extract polysemy (multi-translation words) from word-types.ts
 */
function extractPolysemy(): PolysemyEntry[] {
  const filePath = join(TRANSLATOR_DICT, 'word-types.ts');
  if (!existsSync(filePath)) {
    console.log('  ⚠️ word-types.ts not found, skipping');
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  const entries: PolysemyEntry[] = [];

  // Find MULTI_TRANSLATION_WORDS array start
  const marker = 'export const MULTI_TRANSLATION_WORDS: MultiTranslationWord[] = [';
  const startIdx = content.indexOf(marker);
  if (startIdx === -1) {
    console.log('  ⚠️ MULTI_TRANSLATION_WORDS not found');
    return [];
  }

  // Extract the full array using bracket counting
  let bracketCount = 0;
  let endIdx = startIdx;
  let foundStart = false;

  for (let i = startIdx + marker.length - 1; i < content.length; i++) {
    if (content[i] === '[') {
      bracketCount++;
      foundStart = true;
    } else if (content[i] === ']') {
      bracketCount--;
      if (foundStart && bracketCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }

  const arrayContent = content.slice(startIdx, endIdx);

  // Find each word block by matching korean: ... pattern and then finding translations
  const koreanMatches = [...arrayContent.matchAll(/korean:\s*['"]([^'"]+)['"]/g)];

  for (const koreanMatch of koreanMatches) {
    const korean = koreanMatch[1];
    const blockStart = koreanMatch.index!;

    // Find the translations array for this word
    const translationsStart = arrayContent.indexOf('translations:', blockStart);
    if (translationsStart === -1 || translationsStart > blockStart + 200) continue;

    // Find matching brackets for translations array
    let tBracketCount = 0;
    let tEndIdx = translationsStart;
    let tFoundStart = false;

    for (let i = translationsStart; i < arrayContent.length; i++) {
      if (arrayContent[i] === '[') {
        tBracketCount++;
        tFoundStart = true;
      } else if (arrayContent[i] === ']') {
        tBracketCount--;
        if (tFoundStart && tBracketCount === 0) {
          tEndIdx = i + 1;
          break;
        }
      }
    }

    const translationsBlock = arrayContent.slice(translationsStart, tEndIdx);

    // Parse each translation object
    const translations: PolysemyTranslation[] = [];
    const transRegex =
      /english:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"](?:[\s\S]*?priority:\s*(\d+))?(?:[\s\S]*?contextHints:\s*\[([^\]]*)\])?/g;

    let transMatch: RegExpExecArray | null;
    while ((transMatch = transRegex.exec(translationsBlock)) !== null) {
      const trans: PolysemyTranslation = {
        english: transMatch[1],
        category: transMatch[2],
      };
      if (transMatch[3]) trans.priority = parseInt(transMatch[3], 10);
      if (transMatch[4]) {
        trans.contextHints = transMatch[4]
          .split(',')
          .map((h) => h.trim().replace(/['"]/g, ''))
          .filter((h) => h.length > 0);
      }
      translations.push(trans);
    }

    if (translations.length > 0) {
      entries.push({ korean, translations });
    }
  }

  return entries;
}

/**
 * Extract domain dictionary from a single domain file
 */
function extractDomainFile(
  filePath: string,
  domainName: string,
): { koToEn: DomainEntry[]; enToKo: DomainEntry[] } {
  const content = readFileSync(filePath, 'utf-8');
  const koToEn: DomainEntry[] = [];
  const enToKo: DomainEntry[] = [];

  // Find all Record<string, string> exports
  const koEnRegex = /(?:export )?const \w+_KO_EN[^{]*{/g;
  const enKoRegex = /(?:export )?const \w+_EN_KO[^{]*{/g;

  // Extract ko-to-en dictionaries
  let match: RegExpExecArray | null;
  while ((match = koEnRegex.exec(content)) !== null) {
    const objContent = extractObjectFromMarker(content.slice(match.index), match[0].slice(-1));
    if (objContent) {
      const parsed = parseObjectLiteral(match[0] + objContent.slice(1));
      for (const [ko, en] of Object.entries(parsed)) {
        koToEn.push({ ko, en, domain: domainName });
      }
    }
  }

  // Extract en-to-ko dictionaries
  while ((match = enKoRegex.exec(content)) !== null) {
    const objContent = extractObjectFromMarker(content.slice(match.index), match[0].slice(-1));
    if (objContent) {
      const parsed = parseObjectLiteral(match[0] + objContent.slice(1));
      for (const [en, ko] of Object.entries(parsed)) {
        enToKo.push({ ko, en, domain: domainName });
      }
    }
  }

  return { koToEn, enToKo };
}

/**
 * Extract all domains from domains/ folder
 */
function extractDomains(): { koToEn: DomainEntry[]; enToKo: DomainEntry[] } {
  const domainsDir = join(TRANSLATOR_DICT, 'domains');
  if (!existsSync(domainsDir)) {
    console.log('  ⚠️ domains/ directory not found, skipping');
    return { koToEn: [], enToKo: [] };
  }

  const allKoToEn: DomainEntry[] = [];
  const allEnToKo: DomainEntry[] = [];

  // Process all .ts files in domains/
  const files = readdirSync(domainsDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');

  for (const file of files) {
    const filePath = join(domainsDir, file);
    const domainName = basename(file, '.ts');

    try {
      const { koToEn, enToKo } = extractDomainFile(filePath, domainName);
      allKoToEn.push(...koToEn);
      allEnToKo.push(...enToKo);
      console.log(`    📁 ${domainName}: ${koToEn.length} ko→en, ${enToKo.length} en→ko`);
    } catch (error) {
      console.log(`    ⚠️ Error processing ${file}: ${error}`);
    }
  }

  // Process subdirectories (body/, technology/)
  const subdirs = readdirSync(domainsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const subdir of subdirs) {
    const subdirPath = join(domainsDir, subdir);
    const subFiles = readdirSync(subdirPath).filter((f) => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of subFiles) {
      const filePath = join(subdirPath, file);
      const domainName = `${subdir}/${basename(file, '.ts')}`;

      try {
        const { koToEn, enToKo } = extractDomainFile(filePath, domainName);
        allKoToEn.push(...koToEn);
        allEnToKo.push(...enToKo);
        console.log(`    📁 ${domainName}: ${koToEn.length} ko→en, ${enToKo.length} en→ko`);
      } catch (error) {
        console.log(`    ⚠️ Error processing ${subdir}/${file}: ${error}`);
      }
    }
  }

  return { koToEn: allKoToEn, enToKo: allEnToKo };
}

/**
 * Extract expressions (onomatopoeia, cultural, compound-words, phrasal-verbs)
 */
function extractExpressions(): {
  onomatopoeia: WordEntry[];
  cultural: WordEntry[];
  compoundWords: WordEntry[];
  phrasalVerbs: WordEntry[];
} {
  const result = {
    onomatopoeia: [] as WordEntry[],
    cultural: [] as WordEntry[],
    compoundWords: [] as WordEntry[],
    phrasalVerbs: [] as WordEntry[],
  };

  // Onomatopoeia
  const onomatopoeiaPath = join(TRANSLATOR_DICT, 'onomatopoeia.ts');
  if (existsSync(onomatopoeiaPath)) {
    const content = readFileSync(onomatopoeiaPath, 'utf-8');
    // Variable name is 'onomatopoeia' not 'koToEnOnomatopoeia'
    const objContent = extractObjectFromMarker(
      content,
      'export const onomatopoeia: Record<string, string> = {',
    );
    if (objContent) {
      const parsed = parseObjectLiteral(objContent);
      result.onomatopoeia = Object.entries(parsed).map(([ko, en]) => ({ ko, en }));
    }
  }

  // Cultural expressions
  const culturalPath = join(TRANSLATOR_DICT, 'cultural.ts');
  if (existsSync(culturalPath)) {
    const content = readFileSync(culturalPath, 'utf-8');
    const objContent = extractObjectFromMarker(
      content,
      'export const culturalExpressions: Record<string, string> = {',
    );
    if (objContent) {
      const parsed = parseObjectLiteral(objContent);
      result.cultural = Object.entries(parsed).map(([ko, en]) => ({ ko, en }));
    }
  }

  // Compound words - has CompoundWordEntry with translation property
  const compoundPath = join(TRANSLATOR_DICT, 'compound-words.ts');
  if (existsSync(compoundPath)) {
    const content = readFileSync(compoundPath, 'utf-8');
    // Match entries like: 한국사람: { translation: 'Korean' }
    const compoundRegex = /['"]?([가-힣a-zA-Z]+)['"]?\s*:\s*\{\s*translation:\s*['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = compoundRegex.exec(content)) !== null) {
      result.compoundWords.push({ ko: match[1], en: match[2] });
    }
  }

  // Phrasal verbs (English → Korean)
  const phrasalPath = join(TRANSLATOR_DICT, 'phrasal-verbs.ts');
  if (existsSync(phrasalPath)) {
    const content = readFileSync(phrasalPath, 'utf-8');
    const objContent = extractObjectFromMarker(
      content,
      'export const phrasalVerbs: Record<string, string> = {',
    );
    if (objContent) {
      const parsed = parseObjectLiteral(objContent);
      result.phrasalVerbs = Object.entries(parsed).map(([en, ko]) => ({ ko, en }));
    }
  }

  return result;
}

/**
 * Write JSON file with proper formatting
 */
function writeJson(filePath: string, data: unknown): void {
  const dir = join(filePath, '..');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

async function main() {
  console.log('📚 Extracting dictionary data to JSON...\n');

  // Phase 2: words.ts
  console.log('📖 Phase 2: Extracting words.ts...');

  try {
    const koToEnWords = extractKoToEnWords();
    console.log(`  ✅ ko-to-en: ${koToEnWords.length} entries`);
    writeJson(join(OUTPUT_DIR, 'words/ko-to-en.json'), koToEnWords);

    const enToKoWords = extractEnToKoWords();
    console.log(`  ✅ en-to-ko: ${enToKoWords.length} entries`);
    writeJson(join(OUTPUT_DIR, 'words/en-to-ko.json'), enToKoWords);
  } catch (error) {
    console.error(`  ❌ Error extracting words: ${error}`);
  }

  // Phase 3: stems.ts
  console.log('\n📖 Phase 3: Extracting stems.ts...');
  try {
    const stems = extractStems();
    console.log(`  ✅ stems: ${stems.length} entries`);
    writeJson(join(OUTPUT_DIR, 'words/stems.json'), stems);
  } catch (error) {
    console.error(`  ❌ Error extracting stems: ${error}`);
  }

  // Phase 4: idioms.ts
  console.log('\n📖 Phase 4: Extracting idioms.ts...');
  try {
    const idioms = extractIdioms();
    console.log(`  ✅ idioms: ${idioms.length} entries`);
    writeJson(join(OUTPUT_DIR, 'idioms/idioms.json'), idioms);
  } catch (error) {
    console.error(`  ❌ Error extracting idioms: ${error}`);
  }

  // Phase 5: word-types.ts (polysemy)
  console.log('\n📖 Phase 5: Extracting polysemy from word-types.ts...');
  try {
    const polysemy = extractPolysemy();
    console.log(`  ✅ polysemy: ${polysemy.length} entries`);
    writeJson(join(OUTPUT_DIR, 'polysemy/polysemy.json'), polysemy);
  } catch (error) {
    console.error(`  ❌ Error extracting polysemy: ${error}`);
  }

  // Phase 6: colors.ts + countries.ts
  console.log('\n📖 Phase 6: Extracting colors and countries...');
  try {
    const colors = extractColors();
    console.log(`  ✅ colors ko-to-en: ${colors.koToEn.length} entries`);
    console.log(`  ✅ colors en-to-ko: ${colors.enToKo.length} entries`);
    writeJson(join(OUTPUT_DIR, 'words/colors.json'), {
      koToEn: colors.koToEn,
      enToKo: colors.enToKo,
    });

    const countries = extractCountries();
    console.log(`  ✅ countries ko-to-en: ${countries.koToEn.length} entries`);
    console.log(`  ✅ countries en-to-ko: ${countries.enToKo.length} entries`);
    writeJson(join(OUTPUT_DIR, 'words/countries.json'), {
      koToEn: countries.koToEn,
      enToKo: countries.enToKo,
    });
  } catch (error) {
    console.error(`  ❌ Error extracting colors/countries: ${error}`);
  }

  // Phase 7: domains/
  console.log('\n📖 Phase 7: Extracting domains...');
  try {
    const domains = extractDomains();
    console.log(`  ✅ domains ko-to-en: ${domains.koToEn.length} total entries`);
    console.log(`  ✅ domains en-to-ko: ${domains.enToKo.length} total entries`);
    writeJson(join(OUTPUT_DIR, 'domains/all-domains.json'), {
      koToEn: domains.koToEn,
      enToKo: domains.enToKo,
    });
  } catch (error) {
    console.error(`  ❌ Error extracting domains: ${error}`);
  }

  // Phase 8: expressions
  console.log('\n📖 Phase 8: Extracting expressions...');
  try {
    const expressions = extractExpressions();
    console.log(`  ✅ onomatopoeia: ${expressions.onomatopoeia.length} entries`);
    console.log(`  ✅ cultural: ${expressions.cultural.length} entries`);
    console.log(`  ✅ compound-words: ${expressions.compoundWords.length} entries`);
    console.log(`  ✅ phrasal-verbs: ${expressions.phrasalVerbs.length} entries`);

    if (expressions.onomatopoeia.length > 0) {
      writeJson(join(OUTPUT_DIR, 'expressions/onomatopoeia.json'), expressions.onomatopoeia);
    }
    if (expressions.cultural.length > 0) {
      writeJson(join(OUTPUT_DIR, 'expressions/cultural.json'), expressions.cultural);
    }
    if (expressions.compoundWords.length > 0) {
      writeJson(join(OUTPUT_DIR, 'expressions/compound-words.json'), expressions.compoundWords);
    }
    if (expressions.phrasalVerbs.length > 0) {
      writeJson(join(OUTPUT_DIR, 'expressions/phrasal-verbs.json'), expressions.phrasalVerbs);
    }
  } catch (error) {
    console.error(`  ❌ Error extracting expressions: ${error}`);
  }

  console.log('\n✅ Dictionary data extraction complete!');
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
