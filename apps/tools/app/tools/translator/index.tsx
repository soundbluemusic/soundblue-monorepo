import { ArrowLeftRight, Check, Copy, Share2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';
import {
  defaultTranslatorSettings,
  type TranslationDirection,
  type TranslatorSettings,
} from './settings';
import { translate } from './translator-service';
import { createShareUrl, getSharedDataFromCurrentUrl, getTextLengthWarning } from './url-sharing';

interface TranslatorProps {
  settings?: TranslatorSettings;
  onSettingsChange?: (settings: Partial<TranslatorSettings>) => void;
}

export function Translator({ settings: propSettings, onSettingsChange }: TranslatorProps) {
  const [internalSettings, setInternalSettings] = useState(defaultTranslatorSettings);
  const settings = useMemo(
    () => ({ ...defaultTranslatorSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<TranslatorSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  const [inputText, setInputText] = useState(settings.lastInput || '');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDirectionRef = useRef(settings.direction);
  const isInitializedRef = useRef(false);

  // Load shared translation from URL on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const sharedData = getSharedDataFromCurrentUrl();
    if (sharedData) {
      setInputText(sharedData.text);
      if (sharedData.direction !== settings.direction) {
        handleSettingsChange({ direction: sharedData.direction });
      }
      // Clean up URL without reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('s');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [settings.direction, handleSettingsChange]);

  // Translate function
  const doTranslate = useCallback(() => {
    const text = inputText.trim();
    if (!text) {
      setOutputText('');
      return;
    }

    const result = translate(text, settings.direction);
    setOutputText(result);
  }, [inputText, settings.direction]);

  // Auto-translate with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputText.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        doTranslate();
      }, 300);
    } else {
      setOutputText('');
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, doTranslate]);

  // Re-translate when direction changes (not on inputText change - that's handled by debounce)
  useEffect(() => {
    if (prevDirectionRef.current !== settings.direction) {
      prevDirectionRef.current = settings.direction;
      if (inputText.trim()) {
        doTranslate();
      }
    }
  }, [settings.direction, doTranslate, inputText]);

  // Toggle direction
  const toggleDirection = useCallback(() => {
    const newDirection: TranslationDirection = settings.direction === 'ko-en' ? 'en-ko' : 'ko-en';
    handleSettingsChange({ direction: newDirection });

    const currentOutput = outputText;
    if (currentOutput) {
      setInputText(currentOutput);
      setOutputText('');
    }
  }, [settings.direction, outputText, handleSettingsChange]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const text = outputText;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard failed
    }
  }, [outputText]);

  // Clear all
  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    handleSettingsChange({ lastInput: '' });
  }, [handleSettingsChange]);

  // Share translation via URL
  const shareTranslation = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const baseUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';

    const result = createShareUrl(baseUrl, {
      text,
      direction: settings.direction,
    });

    if (result.error) {
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(result.url!);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  }, [inputText, settings.direction]);

  const textWarning = useMemo(() => getTextLengthWarning(inputText), [inputText]);

  // Save input on change
  useEffect(() => {
    if (inputText !== settings.lastInput) {
      handleSettingsChange({ lastInput: inputText });
    }
  }, [inputText, settings.lastInput, handleSettingsChange]);

  const sourceLabel = settings.direction === 'ko-en' ? '한국어' : 'English';
  const targetLabel = settings.direction === 'ko-en' ? 'English' : '한국어';

  const getShareButtonClass = () => {
    const base =
      'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] disabled:opacity-50 disabled:cursor-not-allowed';
    if (shareStatus === 'copied') return `${base} text-green-600 dark:text-green-400`;
    if (shareStatus === 'error') return `${base} text-red-600 dark:text-red-400`;
    return `${base} text-(--muted-foreground) hover:text-(--foreground)`;
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:p-4">
      {/* Header with direction toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className="min-w-[3.75rem] text-right text-sm font-medium">{sourceLabel}</span>
        <button
          type="button"
          onClick={toggleDirection}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-(--border) bg-transparent transition-all duration-200 hover:scale-105 hover:bg-black/[0.08] active:scale-95 dark:hover:bg-white/[0.12]"
          title="Switch direction"
        >
          <ArrowLeftRight className="size-4" />
        </button>
        <span className="min-w-[3.75rem] text-sm font-medium">{targetLabel}</span>
      </div>

      {/* Input area */}
      <div className="min-h-[7.5rem] flex-1">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          placeholder={
            settings.direction === 'ko-en'
              ? '번역할 텍스트를 입력하세요...'
              : 'Enter text to translate...'
          }
          className="size-full resize-none rounded-xl border border-(--border) bg-(--background) p-3 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
        />
      </div>

      {/* Output area */}
      <div className="relative min-h-[7.5rem] flex-1">
        <section
          className="size-full overflow-auto rounded-xl border border-(--border) bg-black/[0.03] p-3 text-sm dark:bg-white/[0.03]"
          aria-live="polite"
          aria-atomic="true"
          aria-label={settings.direction === 'ko-en' ? '번역 결과' : 'Translation result'}
        >
          {outputText}
        </section>

        {/* Copy button */}
        {outputText && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-lg border border-(--border) bg-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-black/[0.08] dark:bg-black/80 dark:hover:bg-white/[0.12]"
            title={m['common.copy']?.()}
          >
            {isCopied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-transparent px-3 text-xs text-(--muted-foreground) transition-colors duration-200 hover:bg-black/[0.08] hover:text-(--foreground) dark:hover:bg-white/[0.12]"
        >
          <Trash2 className="size-3.5" />
          <span>{settings.direction === 'ko-en' ? '지우기' : 'Clear'}</span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={shareTranslation}
          disabled={!inputText.trim() || textWarning === 'danger'}
          className={getShareButtonClass()}
          title={
            textWarning === 'danger'
              ? settings.direction === 'ko-en'
                ? '텍스트가 너무 깁니다'
                : 'Text too long'
              : m['tools.shareUrl']?.()
          }
        >
          {shareStatus === 'copied' ? (
            <>
              <Check className="size-3.5" />
              <span>{m['tools.urlCopied']?.()}</span>
            </>
          ) : shareStatus === 'error' ? (
            <>
              <X className="size-3.5" />
              <span>{settings.direction === 'ko-en' ? '너무 깁니다' : 'Too long'}</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5" />
              <span>{settings.direction === 'ko-en' ? '공유' : 'Share'}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-(--muted-foreground)">
          <div className="size-2 rounded-full bg-blue-500" />
          <span>
            {settings.direction === 'ko-en' ? '알고리즘 번역' : 'Algorithm-based Translation'}
          </span>
        </div>
      </div>
    </div>
  );
}

export {
  defaultTranslatorSettings,
  type TranslationDirection,
  type TranslatorSettings,
} from './settings';
