import { ArrowLeftRight, Check, Copy, Share2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '~/i18n';
import { cn } from '~/lib/utils';
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
  const { t } = useI18n();

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

  // Load shared translation from URL on mount
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Re-translate when direction changes
  useEffect(() => {
    if (inputText.trim()) {
      doTranslate();
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

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:p-4">
      {/* Header with direction toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className="min-w-15 text-right text-sm font-medium">{sourceLabel}</span>
        <button
          type="button"
          onClick={toggleDirection}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-all duration-200 hover:scale-105 hover:bg-black/8 active:scale-95 dark:hover:bg-white/12"
          title="Switch direction"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <span className="min-w-15 text-sm font-medium">{targetLabel}</span>
      </div>

      {/* Input area */}
      <div className="min-h-30 flex-1">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          placeholder={
            settings.direction === 'ko-en'
              ? '번역할 텍스트를 입력하세요...'
              : 'Enter text to translate...'
          }
          className="h-full w-full resize-none rounded-xl border border-border bg-background p-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </div>

      {/* Output area */}
      <div className="relative min-h-30 flex-1">
        <div className="h-full w-full overflow-auto rounded-xl border border-border bg-muted/30 p-3 text-sm">
          {outputText}
        </div>

        {/* Copy button */}
        {outputText && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-black/8 dark:hover:bg-white/12"
            title={t.common.copy}
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-black/8 hover:text-foreground dark:hover:bg-white/12"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{settings.direction === 'ko-en' ? '지우기' : 'Clear'}</span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={shareTranslation}
          disabled={!inputText.trim() || textWarning === 'danger'}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            'hover:bg-black/8 dark:hover:bg-white/12',
            shareStatus === 'idle' && 'text-muted-foreground hover:text-foreground',
            shareStatus === 'copied' && 'text-green-600 dark:text-green-400',
            shareStatus === 'error' && 'text-red-600 dark:text-red-400',
          )}
          title={
            textWarning === 'danger'
              ? settings.direction === 'ko-en'
                ? '텍스트가 너무 깁니다'
                : 'Text too long'
              : t.tools.shareUrl
          }
        >
          {shareStatus === 'copied' ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{t.tools.urlCopied}</span>
            </>
          ) : shareStatus === 'error' ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>{settings.direction === 'ko-en' ? '너무 깁니다' : 'Too long'}</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" />
              <span>{settings.direction === 'ko-en' ? '공유' : 'Share'}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>{settings.direction === 'ko-en' ? '사전 번역' : 'Dictionary Translation'}</span>
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
