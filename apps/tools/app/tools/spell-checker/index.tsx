import { AlertTriangle, Check, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import m from '~/lib/messages';
import { checkSpelling } from './engine';
import { defaultSpellCheckerSettings, type SpellCheckerSettings } from './settings';
import type { SpellCheckResult, SpellError } from './types';

// ========================================
// Korean Spell Checker Tool
// 한국어 맞춤법 검사기
// ========================================

interface SpellCheckerProps {
  settings?: SpellCheckerSettings;
  onSettingsChange?: (settings: Partial<SpellCheckerSettings>) => void;
}

export function SpellChecker({ settings: propSettings, onSettingsChange }: SpellCheckerProps) {
  // Merge provided settings with defaults
  const [internalSettings, setInternalSettings] = useState(defaultSpellCheckerSettings);
  const settings = useMemo(
    () => ({ ...defaultSpellCheckerSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const [inputText, setInputText] = useState(settings.lastInput || '');
  const [result, setResult] = useState<SpellCheckResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleSettingsChange = useCallback(
    (partial: Partial<SpellCheckerSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // 검사 실행
  const handleCheck = useCallback(() => {
    if (!inputText.trim()) return;

    const checkResult = checkSpelling(inputText, {
      checkSpacing: settings.checkSpacing,
      checkTypo: settings.checkTypo,
      checkGrammar: settings.checkGrammar,
    });

    setResult(checkResult);
    handleSettingsChange({ lastInput: inputText });
  }, [inputText, settings, handleSettingsChange]);

  // 초기화
  const handleReset = useCallback(() => {
    setInputText('');
    setResult(null);
    setCopied(false);
  }, []);

  // 수정된 텍스트 복사
  const handleCopy = useCallback(async () => {
    if (!result?.corrected) return;

    try {
      await navigator.clipboard.writeText(result.corrected);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 클립보드 접근 실패 - 사용자에게 피드백 제공
      console.warn('[clipboard] Copy failed:', error);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  }, [result]);

  // 수정된 텍스트 적용
  const handleApply = useCallback(() => {
    if (!result?.corrected) return;
    setInputText(result.corrected);
    setResult(null);
  }, [result]);

  // 에러 유형별 색상
  const getErrorColor = (type: SpellError['type']) => {
    switch (type) {
      case 'spacing':
        return 'text-blue-600 dark:text-blue-400';
      case 'typo':
        return 'text-red-600 dark:text-red-400';
      case 'grammar':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getErrorBadgeColor = (type: SpellError['type']) => {
    switch (type) {
      case 'spacing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'typo':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case 'grammar':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getErrorTypeLabel = (type: SpellError['type']) => {
    switch (type) {
      case 'spacing':
        return m['spellChecker.spacing']?.() ?? '띄어쓰기';
      case 'typo':
        return m['spellChecker.typo']?.() ?? '오타';
      case 'grammar':
        return m['spellChecker.grammar']?.() ?? '문법';
      default:
        return type;
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:gap-4 sm:p-4">
      {/* Input Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label
          htmlFor="spell-check-input"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {m['spellChecker.inputLabel']?.() ?? '검사할 텍스트'}
        </label>
        <textarea
          id="spell-check-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={m['spellChecker.placeholder']?.() ?? '한국어 텍스트를 입력하세요...'}
          className="min-h-32 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-40 sm:text-base"
          rows={5}
        />

        {/* Options */}
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkSpacing}
              onChange={(e) => handleSettingsChange({ checkSpacing: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['spellChecker.checkSpacing']?.() ?? '띄어쓰기'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkTypo}
              onChange={(e) => handleSettingsChange({ checkTypo: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['spellChecker.checkTypo']?.() ?? '오타'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkGrammar}
              onChange={(e) => handleSettingsChange({ checkGrammar: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['spellChecker.checkGrammar']?.() ?? '문법'}</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={!inputText.trim()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary/80 bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {m['spellChecker.check']?.() ?? '검사하기'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-all duration-200 hover:bg-black/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 dark:hover:bg-white/12"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          {/* Stats */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">
              {m['spellChecker.resultTitle']?.() ?? '검사 결과'}
            </span>
            <div className="flex flex-wrap gap-2">
              {result.stats.spacingErrors > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('spacing')}`}
                >
                  {getErrorTypeLabel('spacing')} {result.stats.spacingErrors}
                </span>
              )}
              {result.stats.typoErrors > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('typo')}`}>
                  {getErrorTypeLabel('typo')} {result.stats.typoErrors}
                </span>
              )}
              {result.stats.grammarErrors > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('grammar')}`}
                >
                  {getErrorTypeLabel('grammar')} {result.stats.grammarErrors}
                </span>
              )}
              {result.stats.totalErrors === 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  {m['spellChecker.noErrors']?.() ?? '오류 없음'}
                </span>
              )}
            </div>
          </div>

          {/* Corrected Text */}
          {result.corrected !== result.original && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-foreground">
                {m['spellChecker.correctedText']?.() ?? '수정된 텍스트'}
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-relaxed dark:border-green-800 dark:bg-green-950/50 sm:text-base">
                {result.corrected}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    copyFailed
                      ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400'
                      : 'border-border hover:bg-black/8 dark:hover:bg-white/12'
                  }`}
                >
                  {copyFailed ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copyFailed
                    ? (m['spellChecker.copyFailed']?.() ?? '복사 실패')
                    : copied
                      ? (m['spellChecker.copied']?.() ?? '복사됨')
                      : (m['spellChecker.copy']?.() ?? '복사')}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
                >
                  {m['spellChecker.apply']?.() ?? '적용'}
                </button>
              </div>
            </div>
          )}

          {/* Error List */}
          {result.errors.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">
                {m['spellChecker.errorList']?.() ?? '수정 사항'}
              </div>
              <div className="space-y-2">
                {result.errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border bg-background p-3 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor(error.type)}`}
                      >
                        {getErrorTypeLabel(error.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="line-through decoration-red-500">{error.original}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className={getErrorColor(error.type)}>{error.suggestion}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { defaultSpellCheckerSettings, type SpellCheckerSettings } from './settings';
