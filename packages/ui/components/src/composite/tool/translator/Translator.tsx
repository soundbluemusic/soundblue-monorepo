import { ArrowLeftRight, Check, Copy, Info, Share2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultTranslatorSettings,
  FORMALITY_OPTIONS,
  type Formality,
  type TranslationDirection,
  type TranslatorSettings,
} from './settings';
import { detectFormality, translate } from './translator-service';
import { createShareUrl, getSharedDataFromCurrentUrl, getTextLengthWarning } from './url-sharing';

/** i18n 메시지 (외부에서 주입 가능) */
export interface TranslatorMessages {
  copy?: string;
  shareUrl?: string;
  urlCopied?: string;
}

const defaultMessages: TranslatorMessages = {
  copy: 'Copy',
  shareUrl: 'Share URL',
  urlCopied: 'URL Copied!',
};

/** 입력 타입 분석 결과 */
type InputType = 'word' | 'sentence' | 'mixed';

/** 입력 분석 결과 */
interface InputAnalysis {
  type: InputType;
  detectedFormality: Formality | null;
}

/** 입력 분석 함수 */
function analyzeInput(text: string, direction: TranslationDirection): InputAnalysis {
  const trimmed = text.trim();
  if (!trimmed) {
    return { type: 'word', detectedFormality: null };
  }

  // 단어 vs 문장 판별
  const hasSpace = trimmed.includes(' ');
  const hasPunctuation = /[.!?？！。]/.test(trimmed);
  const isShort = trimmed.length < 10;

  let type: InputType = 'sentence';
  if (!hasSpace && isShort && !hasPunctuation) {
    type = 'word';
  } else if (hasSpace && !hasPunctuation && isShort) {
    type = 'mixed'; // 짧은 구 (short phrase)
  }

  const detectedFormality = detectFormality(trimmed, direction);

  return { type, detectedFormality };
}

/** 어투 라벨 가져오기 */
function getFormalityLabel(formality: Formality, direction: TranslationDirection): string {
  const option = FORMALITY_OPTIONS.find((o) => o.value === formality);
  if (!option) return '';
  return direction === 'ko-en' ? option.labelKo : option.labelEn;
}

interface TranslatorProps {
  settings?: TranslatorSettings;
  onSettingsChange?: (settings: Partial<TranslatorSettings>) => void;
  /** i18n 메시지 (외부에서 주입 가능, 기본값 제공) */
  messages?: TranslatorMessages;
}

export function Translator({
  settings: propSettings,
  onSettingsChange,
  messages: propMessages,
}: TranslatorProps) {
  const messages = useMemo(() => ({ ...defaultMessages, ...propMessages }), [propMessages]);
  const [internalSettings, setInternalSettings] = useState(defaultTranslatorSettings);
  // Merge order: defaults → internal → props (props have highest priority)
  const settings = useMemo(
    () => ({ ...defaultTranslatorSettings, ...internalSettings, ...propSettings }),
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
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDirectionRef = useRef(settings.direction);
  const prevFormalityRef = useRef(settings.formality);
  const isInitializedRef = useRef(false);
  const directionJustChangedRef = useRef(false);
  const [isAutoFormality, setIsAutoFormality] = useState(true); // 자동 어투 감지 모드
  const prevDetectedFormality = useRef(settings.formality); // 이전 감지된 어투
  const [isMounted, setIsMounted] = useState(false); // hydration 불일치 방지

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  // Hydration 완료 후 마운트 상태 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    const result = translate(text, settings.direction, { formality: settings.formality });
    setOutputText(result);
  }, [inputText, settings.direction, settings.formality]);

  // Auto-detect formality and translate with debounce
  useEffect(() => {
    // Skip if direction just changed (handled by direction effect)
    if (directionJustChangedRef.current) {
      directionJustChangedRef.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputText.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        // 자동 어투 감지 모드일 때만 감지
        if (isAutoFormality) {
          const detected = detectFormality(inputText, settings.direction);
          if (detected && detected !== prevDetectedFormality.current) {
            prevDetectedFormality.current = detected;
            handleSettingsChange({ formality: detected });
          }
        }
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
  }, [inputText, doTranslate, isAutoFormality, settings.direction, handleSettingsChange]);

  // Re-translate immediately when direction or formality changes
  useEffect(() => {
    const directionChanged = prevDirectionRef.current !== settings.direction;
    const formalityChanged = prevFormalityRef.current !== settings.formality;

    if (directionChanged || formalityChanged) {
      prevDirectionRef.current = settings.direction;
      prevFormalityRef.current = settings.formality;

      if (directionChanged) {
        directionJustChangedRef.current = true; // Prevent debounce effect from double-translating
      }

      if (inputText.trim()) {
        // Translate immediately with new direction or formality
        const result = translate(inputText.trim(), settings.direction, {
          formality: settings.formality,
        });
        setOutputText(result);
      }
    }
  }, [settings.direction, settings.formality, inputText]);

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
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard failed
    }
  }, [outputText]);

  // Clear all
  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    setIsAutoFormality(true); // 자동 모드 복원
    prevDetectedFormality.current = 'neutral';
    handleSettingsChange({ lastInput: '', formality: 'neutral' });
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
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareStatus('idle'), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(result.url!);
      setShareStatus('copied');
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      setShareStatus('error');
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareStatus('idle'), 3000);
    }
  }, [inputText, settings.direction]);

  const textWarning = useMemo(() => getTextLengthWarning(inputText), [inputText]);

  // 입력 분석 (단어/문장, 감지된 어투)
  const inputAnalysis = useMemo(
    () => analyzeInput(inputText, settings.direction),
    [inputText, settings.direction],
  );

  // Save input on change
  useEffect(() => {
    if (inputText !== settings.lastInput) {
      handleSettingsChange({ lastInput: inputText });
    }
  }, [inputText, settings.lastInput, handleSettingsChange]);

  const sourceLabel = settings.direction === 'ko-en' ? '한국어' : 'English';
  const targetLabel = settings.direction === 'ko-en' ? 'English' : '한국어';

  // 입력 타입 라벨
  const getInputTypeLabel = (): string => {
    if (!inputText.trim()) return '';
    const isKo = settings.direction === 'ko-en';
    switch (inputAnalysis.type) {
      case 'word':
        return isKo ? '단어' : 'Word';
      case 'mixed':
        return isKo ? '구/표현' : 'Phrase';
      case 'sentence':
        return isKo ? '문장' : 'Sentence';
    }
  };

  const getShareButtonClass = () => {
    const base =
      'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] disabled:opacity-50 disabled:cursor-not-allowed';
    if (shareStatus === 'copied') return `${base} text-green-600 dark:text-green-400`;
    if (shareStatus === 'error') return `${base} text-red-600 dark:text-red-400`;
    return `${base} text-muted-foreground hover:text-foreground`;
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto p-3 sm:p-4">
      {/* Header with direction toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className="min-w-[3.75rem] text-right text-sm font-medium">{sourceLabel}</span>
        <button
          type="button"
          onClick={toggleDirection}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-transparent transition-all duration-200 hover:scale-105 hover:bg-black/[0.08] active:scale-95 dark:hover:bg-white/[0.12]"
          title="Switch direction"
        >
          <ArrowLeftRight className="size-4" />
        </button>
        <span className="min-w-[3.75rem] text-sm font-medium">{targetLabel}</span>
      </div>

      {/* Input analysis indicator + Formality hint */}
      {/* 고정 높이로 공간 예약하여 레이아웃 시프트(CLS) 방지 */}
      <div
        className={`flex min-h-[1.625rem] flex-wrap items-center justify-center gap-2 text-xs transition-opacity duration-150 ${
          inputText.trim() ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* 입력 타입 표시 */}
        <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2 py-0.5 dark:bg-white/[0.08]">
          <span className="text-muted-foreground">{getInputTypeLabel() || '\u00A0'}</span>
        </span>

        {/* 감지된 어투 표시 */}
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-600 transition-opacity duration-150 dark:bg-blue-900/30 dark:text-blue-400 ${
            inputAnalysis.detectedFormality ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>
            {settings.direction === 'ko-en' ? '감지된 어투:' : 'Detected:'}{' '}
            {inputAnalysis.detectedFormality
              ? getFormalityLabel(inputAnalysis.detectedFormality, settings.direction)
              : '\u00A0\u00A0\u00A0\u00A0'}
          </span>
        </span>

        {/* 자동/수동 모드 표시 */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
            isAutoFormality
              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
          }`}
        >
          {isAutoFormality
            ? settings.direction === 'ko-en'
              ? '자동 선택'
              : 'Auto'
            : settings.direction === 'ko-en'
              ? '수동 선택'
              : 'Manual'}
        </span>
      </div>

      {/* Formality selector - 출력 어투 선택 (en→ko only, 영어에는 존댓말/반말 없음) */}
      {/* isMounted 체크로 hydration 불일치 방지 (SSG prerender vs client state) */}
      {isMounted && settings.direction === 'en-ko' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Info className="size-3" />
            <span>Choose output tone</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {FORMALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  // 수동 선택 시 자동 모드 해제
                  setIsAutoFormality(false);
                  prevDetectedFormality.current = option.value;
                  handleSettingsChange({ formality: option.value });
                }}
                className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs transition-colors duration-200 ${
                  settings.formality === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-black/[0.05] text-muted-foreground hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]'
                }`}
              >
                {option.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Split Panel: Input/Output */}
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        {/* Input area */}
        <div className="relative flex-1">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.currentTarget.value)}
            placeholder={
              settings.direction === 'ko-en'
                ? '번역할 텍스트를 입력하세요...'
                : 'Enter text to translate...'
            }
            className="h-full w-full resize-none rounded-xl border border-border bg-background p-3 text-sm transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Output area */}
        <div className="relative flex-1">
          <section
            className="h-full w-full overflow-auto rounded-xl border border-border bg-black/[0.03] p-3 text-sm dark:bg-white/[0.03]"
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
              className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-lg border border-border bg-white/80 backdrop-blur-sm transition-colors duration-200 hover:bg-black/[0.08] dark:bg-black/80 dark:hover:bg-white/[0.12]"
              title={messages.copy}
            >
              {isCopied ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-transparent px-3 text-xs text-muted-foreground transition-colors duration-200 hover:bg-black/[0.08] hover:text-foreground dark:hover:bg-white/[0.12]"
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
              : messages.shareUrl
          }
        >
          {shareStatus === 'copied' ? (
            <>
              <Check className="size-3.5" />
              <span>{messages.urlCopied}</span>
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

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="size-2 rounded-full bg-blue-500" />
          <span>
            {settings.direction === 'ko-en' ? '알고리즘 번역' : 'Algorithm-based Translation'}
          </span>
        </div>
      </div>
    </div>
  );
}
