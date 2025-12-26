import { ArrowLeftRight, Check, Copy, Share2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';
import {
  defaultTranslatorSettings,
  type TranslationDirection,
  type TranslatorSettings,
} from './settings';
import styles from './Translator.module.scss';
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
    const base = styles.shareButton;
    if (shareStatus === 'copied') return `${base} ${styles.shareCopied}`;
    if (shareStatus === 'error') return `${base} ${styles.shareError}`;
    return `${base} ${styles.shareIdle}`;
  };

  return (
    <div className={styles.container}>
      {/* Header with direction toggle */}
      <div className={styles.directionHeader}>
        <span className={`${styles.langLabel} ${styles.source}`}>{sourceLabel}</span>
        <button
          type="button"
          onClick={toggleDirection}
          className={styles.toggleButton}
          title="Switch direction"
        >
          <ArrowLeftRight className={styles.toggleIcon} />
        </button>
        <span className={styles.langLabel}>{targetLabel}</span>
      </div>

      {/* Input area */}
      <div className={styles.textAreaWrapper}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.currentTarget.value)}
          placeholder={
            settings.direction === 'ko-en'
              ? '번역할 텍스트를 입력하세요...'
              : 'Enter text to translate...'
          }
          className={styles.inputTextarea}
        />
      </div>

      {/* Output area */}
      <div className={styles.outputWrapper}>
        <div className={styles.outputDisplay}>{outputText}</div>

        {/* Copy button */}
        {outputText && (
          <button
            type="button"
            onClick={copyToClipboard}
            className={styles.copyButton}
            title={m['common.copy']?.()}
          >
            {isCopied ? (
              <Check className={`${styles.copyIcon} ${styles.copyIconSuccess}`} />
            ) : (
              <Copy className={styles.copyIcon} />
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button type="button" onClick={clearAll} className={styles.clearButton}>
          <Trash2 className={styles.clearIcon} />
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
              <Check className={styles.shareIcon} />
              <span>{m['tools.urlCopied']?.()}</span>
            </>
          ) : shareStatus === 'error' ? (
            <>
              <X className={styles.shareIcon} />
              <span>{settings.direction === 'ko-en' ? '너무 깁니다' : 'Too long'}</span>
            </>
          ) : (
            <>
              <Share2 className={styles.shareIcon} />
              <span>{settings.direction === 'ko-en' ? '공유' : 'Share'}</span>
            </>
          )}
        </button>

        <div className={styles.algorithmBadge}>
          <div className={styles.algorithmDot} />
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
