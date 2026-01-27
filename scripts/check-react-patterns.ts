#!/usr/bin/env tsx
/**
 * React Pattern Checker
 *
 * Detects dangerous patterns that can cause bugs (infinite loops, etc.)
 * Patterns are defined in ./react-patterns/patterns.ts
 *
 * Run: pnpm check:react-patterns
 *
 * 새 버그 발견 시: ./react-patterns/patterns.ts에 패턴 추가
 *
 * @see .claude/rules/react-patterns.md
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DANGEROUS_PATTERNS,
  type DangerousPattern,
  hasProtection,
} from './react-patterns/patterns.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface PatternMatch {
  file: string;
  line: number;
  pattern: DangerousPattern;
}

function findTsxFiles(): string[] {
  try {
    const output = execSync(
      'find apps packages -name "*.tsx" -type f | grep -v node_modules | grep -v dist | grep -v .turbo',
      { cwd: ROOT, encoding: 'utf-8' },
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function findLineNumber(content: string, match: RegExpMatchArray): number {
  const beforeMatch = content.slice(0, match.index);
  return (beforeMatch.match(/\n/g) || []).length + 1;
}

function checkFile(filePath: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const fullPath = join(ROOT, filePath);

  try {
    const content = readFileSync(fullPath, 'utf-8');

    // Skip if file has protection patterns
    if (hasProtection(content)) {
      return [];
    }

    for (const pattern of DANGEROUS_PATTERNS) {
      // Skip if file is excluded
      if (pattern.excludeFiles?.test(filePath)) {
        continue;
      }

      const match = content.match(pattern.regex);
      if (match) {
        matches.push({
          file: filePath,
          line: findLineNumber(content, match),
          pattern,
        });
      }
    }
  } catch {
    // File read error, skip
  }

  return matches;
}

function printMatch(match: PatternMatch) {
  const { file, line, pattern } = match;
  const icon = pattern.severity === 'error' ? '❌' : '⚠️';

  console.log(`${icon} ${file}:${line}`);
  console.log(`   Pattern: ${pattern.name}`);
  console.log(`   ${pattern.description}`);
  if (pattern.relatedIssue) {
    console.log(`   Related: ${pattern.relatedIssue}`);
  }
  console.log(`   Solution:`);
  for (const solutionLine of pattern.solution.trim().split('\n')) {
    console.log(`      ${solutionLine}`);
  }
  console.log('');
}

function main() {
  console.log('🔍 React Pattern Checker\n');
  console.log(`📋 Loaded ${DANGEROUS_PATTERNS.length} patterns from database\n`);

  const files = findTsxFiles();
  console.log(`📁 Scanning ${files.length} TSX files...\n`);

  const allMatches: PatternMatch[] = [];

  for (const file of files) {
    const matches = checkFile(file);
    allMatches.push(...matches);
  }

  const errors = allMatches.filter((m) => m.pattern.severity === 'error');
  const warnings = allMatches.filter((m) => m.pattern.severity === 'warning');

  if (errors.length > 0) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('                      ERRORS                           ');
    console.log('═══════════════════════════════════════════════════════\n');
    errors.forEach(printMatch);
  }

  if (warnings.length > 0) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('                     WARNINGS                          ');
    console.log('═══════════════════════════════════════════════════════\n');
    warnings.forEach(printMatch);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No dangerous patterns detected.\n');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Summary: ${errors.length} errors, ${warnings.length} warnings`);
  console.log('═══════════════════════════════════════════════════════');

  if (errors.length > 0) {
    console.log('\n💡 Fix errors before committing.');
    console.log('📖 See: .claude/rules/react-patterns.md');
    console.log('➕ Add new patterns: scripts/react-patterns/patterns.ts\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('\n💡 Consider fixing warnings to improve code quality.');
  }
}

main();
