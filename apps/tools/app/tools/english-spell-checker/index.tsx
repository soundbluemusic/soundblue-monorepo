import { useParaglideI18n } from '@soundblue/i18n';
import { AlertTriangle, Check, Copy, Loader2, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import m from '~/lib/messages';
import { getToolGuide } from '~/lib/toolGuides';
import {
  checkEnglishSpelling,
  getSpellCheckerError,
  hasSpellCheckerError,
  isSpellCheckerLoading,
  isSpellCheckerReady,
  preloadSpellChecker,
  resetSpellChecker,
} from './engine';
import { defaultEnglishSpellCheckerSettings, type EnglishSpellCheckerSettings } from './settings';
import type { EnglishSpellCheckResult, EnglishSpellError } from './types';

// ========================================
// English Spell Checker Tool
// 영어 맞춤법 검사기
// ========================================

interface EnglishSpellCheckerProps {
  settings?: EnglishSpellCheckerSettings;
  onSettingsChange?: (settings: Partial<EnglishSpellCheckerSettings>) => void;
}

export function EnglishSpellChecker({
  settings: propSettings,
  onSettingsChange,
}: EnglishSpellCheckerProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const guide = getToolGuide('englishSpellChecker', currentLocale);

  // Merge provided settings with defaults
  const [internalSettings, setInternalSettings] = useState(defaultEnglishSpellCheckerSettings);
  const settings = useMemo(
    () => ({ ...defaultEnglishSpellCheckerSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const [inputText, setInputText] = useState(settings.lastInput || '');
  const [result, setResult] = useState<EnglishSpellCheckResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Preload spell checker on mount
  useEffect(() => {
    const loadDictionary = async () => {
      setLoadError(null);
      try {
        await preloadSpellChecker();
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load dictionary';
        setLoadError(errorMsg);
      }
    };

    loadDictionary();

    // Update loading state
    const checkLoading = () => {
      setIsLoading(isSpellCheckerLoading() && !isSpellCheckerReady());
      if (hasSpellCheckerError() && !loadError) {
        const err = getSpellCheckerError();
        setLoadError(err?.message || 'Unknown error');
      }
    };

    checkLoading();
    const interval = setInterval(checkLoading, 100);

    return () => clearInterval(interval);
  }, [loadError]);

  // Retry loading dictionary
  const handleRetryLoad = useCallback(async () => {
    setLoadError(null);
    resetSpellChecker();
    try {
      await preloadSpellChecker();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load dictionary';
      setLoadError(errorMsg);
    }
  }, []);

  const handleSettingsChange = useCallback(
    (partial: Partial<EnglishSpellCheckerSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  // State for check errors
  const [checkError, setCheckError] = useState<string | null>(null);

  // Run spell check with useTransition for UI responsiveness
  const handleCheck = useCallback(async () => {
    if (!inputText.trim()) return;

    setCheckError(null);
    try {
      const checkResult = await checkEnglishSpelling(inputText, {
        maxSuggestions: settings.maxSuggestions,
        ignoreNumbers: settings.ignoreNumbers,
        checkSpacing: settings.checkSpacing,
        checkGrammar: settings.checkGrammar,
      });

      // Use startTransition for non-urgent state updates
      startTransition(() => {
        setResult(checkResult);
        handleSettingsChange({ lastInput: inputText });
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to check spelling';
      setCheckError(errorMsg);
      // Also update load error if it's a dictionary loading issue
      if (hasSpellCheckerError()) {
        setLoadError(getSpellCheckerError()?.message || 'Dictionary error');
      }
    }
  }, [inputText, settings, handleSettingsChange]);

  // Error type colors
  const getErrorBadgeColor = (type: EnglishSpellError['type']) => {
    switch (type) {
      case 'spelling':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      case 'spacing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'grammar':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getErrorColor = (type: EnglishSpellError['type']) => {
    switch (type) {
      case 'spelling':
        return 'text-red-600 dark:text-red-400';
      case 'spacing':
        return 'text-blue-600 dark:text-blue-400';
      case 'grammar':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getErrorTypeLabel = (type: EnglishSpellError['type']) => {
    switch (type) {
      case 'spelling':
        return m['englishSpellChecker.spelling']?.() ?? 'Spelling';
      case 'spacing':
        return m['englishSpellChecker.spacing']?.() ?? 'Spacing';
      case 'grammar':
        return m['englishSpellChecker.grammar']?.() ?? 'Grammar';
      default:
        return type;
    }
  };

  // Reset
  const handleReset = useCallback(() => {
    setInputText('');
    setResult(null);
    setCopied(false);
  }, []);

  // Copy corrected text
  const handleCopy = useCallback(async () => {
    if (!result) return;

    // Build corrected text by replacing misspelled words with first suggestion
    let correctedText = result.original;
    // Apply corrections from end to start to preserve positions
    const sortedErrors = [...result.errors].sort((a, b) => b.start - a.start);

    for (const error of sortedErrors) {
      if (error.suggestions.length > 0) {
        correctedText =
          correctedText.slice(0, error.start) +
          error.suggestions[0] +
          correctedText.slice(error.end);
      }
    }

    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access failed
    }
  }, [result]);

  // Apply first suggestion for all errors
  const handleApplyAll = useCallback(() => {
    if (!result || result.errors.length === 0) return;

    let correctedText = result.original;
    const sortedErrors = [...result.errors].sort((a, b) => b.start - a.start);

    for (const error of sortedErrors) {
      if (error.suggestions.length > 0) {
        correctedText =
          correctedText.slice(0, error.start) +
          error.suggestions[0] +
          correctedText.slice(error.end);
      }
    }

    setInputText(correctedText);
    setResult(null);
  }, [result]);

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:gap-4 sm:p-4">
      {/* Loading indicator for dictionary */}
      {isLoading && !loadError && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          {m['englishSpellChecker.loadingDictionary']?.() ?? 'Loading dictionary...'}
        </div>
      )}

      {/* Error indicator for dictionary loading */}
      {loadError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-950/50">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {m['englishSpellChecker.loadError']?.() ?? 'Failed to load dictionary'}
            </span>
          </div>
          {import.meta.env.DEV && (
            <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
          )}
          <button
            type="button"
            onClick={handleRetryLoad}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {m['englishSpellChecker.retry']?.() ?? 'Retry'}
          </button>
        </div>
      )}

      {/* Error indicator for check errors */}
      {checkError && !loadError && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          {m['englishSpellChecker.checkError']?.() ?? 'Failed to check spelling. Please try again.'}
        </div>
      )}

      {/* Input Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <label
          htmlFor="english-spell-check-input"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {m['englishSpellChecker.inputLabel']?.() ?? 'Text to check'}
        </label>
        <textarea
          id="english-spell-check-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={m['englishSpellChecker.placeholder']?.() ?? 'Enter English text...'}
          className="min-h-32 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-40 sm:text-base"
          rows={5}
        />

        {/* Options */}
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkSpelling}
              onChange={(e) => handleSettingsChange({ checkSpelling: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['englishSpellChecker.checkSpelling']?.() ?? 'Spelling'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkSpacing}
              onChange={(e) => handleSettingsChange({ checkSpacing: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['englishSpellChecker.checkSpacing']?.() ?? 'Spacing'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.checkGrammar}
              onChange={(e) => handleSettingsChange({ checkGrammar: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['englishSpellChecker.checkGrammar']?.() ?? 'Grammar'}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.ignoreNumbers}
              onChange={(e) => handleSettingsChange({ ignoreNumbers: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span>{m['englishSpellChecker.ignoreNumbers']?.() ?? 'Ignore numbers'}</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleCheck}
          disabled={!inputText.trim() || isPending || isLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-primary/80 bg-primary px-6 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {m['englishSpellChecker.check']?.() ?? 'Check'}
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
              {m['englishSpellChecker.resultTitle']?.() ?? 'Results'}
            </span>
            <div className="flex flex-wrap gap-2">
              {result.stats.spellingErrors > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('spelling')}`}
                >
                  {getErrorTypeLabel('spelling')} {result.stats.spellingErrors}
                </span>
              )}
              {result.stats.spacingErrors > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('spacing')}`}
                >
                  {getErrorTypeLabel('spacing')} {result.stats.spacingErrors}
                </span>
              )}
              {result.stats.grammarErrors > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${getErrorBadgeColor('grammar')}`}
                >
                  {getErrorTypeLabel('grammar')} {result.stats.grammarErrors}
                </span>
              )}
              {result.errors.length === 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  {m['englishSpellChecker.noErrors']?.() ?? 'No errors'}
                </span>
              )}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {result.stats.totalWords} {m['englishSpellChecker.words']?.() ?? 'words'}
              </span>
            </div>
          </div>

          {/* Corrected Text */}
          {result.corrected !== result.original && (
            <div className="mb-4">
              <div className="mb-2 text-sm font-medium text-foreground">
                {m['englishSpellChecker.correctedText']?.() ?? 'Corrected text'}
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-relaxed dark:border-green-800 dark:bg-green-950/50 sm:text-base">
                {result.corrected}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-black/8 dark:hover:bg-white/12"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied
                    ? (m['englishSpellChecker.copied']?.() ?? 'Copied')
                    : (m['englishSpellChecker.copy']?.() ?? 'Copy')}
                </button>
                <button
                  type="button"
                  onClick={handleApplyAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
                >
                  {m['englishSpellChecker.apply']?.() ?? 'Apply'}
                </button>
              </div>
            </div>
          )}

          {/* Error List */}
          {result.errors.length > 0 && (
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">
                {m['englishSpellChecker.errorList']?.() ?? 'Corrections'}
              </div>
              <div className="space-y-2">
                {result.errors.map((error, idx) => (
                  <div
                    key={`${error.word}-${error.start}-${idx}`}
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
                          <span className="line-through decoration-red-500">
                            {error.word.replace(/ /g, '␣')}
                          </span>
                          {error.suggestions.length > 0 && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className={getErrorColor(error.type)}>
                                {error.suggestions[0].replace(/ /g, '␣')}
                              </span>
                            </>
                          )}
                        </div>
                        {error.message && (
                          <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
                        )}
                        {error.suggestions.length > 1 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {m['englishSpellChecker.otherSuggestions']?.() ?? 'Other'}:{' '}
                            {error.suggestions.slice(1).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool Guide */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}

export {
  defaultEnglishSpellCheckerSettings,
  type EnglishSpellCheckerSettings,
} from './settings';
