import { ArrowLeftRight, Check, Copy, Share2, Trash2, X } from 'lucide-solid';
import { type Component, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { useLanguage } from '@/i18n';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';
import { translate } from './translator-service';
import {
  createShareUrl,
  getSharedDataFromCurrentUrl,
  getTextLengthWarning,
} from './url-sharing';

// ========================================
// Translator Tool - 번역기 (한-영 전용)
// 사전 기반 번역 (문장 → 패턴 → 형태소)
// ========================================

// Types
type TranslationDirection = 'ko-en' | 'en-ko';

export interface TranslatorSettings {
  direction: TranslationDirection;
  lastInput: string;
}

export const defaultTranslatorSettings: TranslatorSettings = {
  direction: 'ko-en',
  lastInput: '',
};

// ========================================
// Main Component
// ========================================

const TranslatorComponent: Component<ToolProps<TranslatorSettings>> = (props) => {
  const { t } = useLanguage();
  const settings = () => props.settings;

  // State
  const [inputText, setInputText] = createSignal(settings().lastInput || '');
  const [outputText, setOutputText] = createSignal('');
  const [isCopied, setIsCopied] = createSignal(false);
  const [shareStatus, setShareStatus] = createSignal<'idle' | 'copied' | 'error'>('idle');

  // Load shared translation from URL on mount
  onMount(() => {
    const sharedData = getSharedDataFromCurrentUrl();
    if (sharedData) {
      setInputText(sharedData.text);
      if (sharedData.direction !== settings().direction) {
        props.onSettingsChange({ direction: sharedData.direction });
      }
      // Clean up URL without reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('s');
        window.history.replaceState({}, '', url.toString());
      }
    }
  });

  // Translate function
  const doTranslate = () => {
    const text = inputText().trim();
    if (!text) {
      setOutputText('');
      return;
    }

    const result = translate(text, settings().direction);
    setOutputText(result);
  };

  // Auto-translate with debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  createEffect(() => {
    const text = inputText();

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (text.trim()) {
      debounceTimer = setTimeout(() => {
        doTranslate();
      }, 300);
    } else {
      setOutputText('');
    }
  });

  // Re-translate when direction changes
  createEffect(() => {
    const _direction = settings().direction;
    if (inputText().trim()) {
      doTranslate();
    }
  });

  onCleanup(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  // Toggle direction
  const toggleDirection = () => {
    const newDirection: TranslationDirection = settings().direction === 'ko-en' ? 'en-ko' : 'ko-en';
    props.onSettingsChange({ direction: newDirection });

    // Swap input/output
    const currentOutput = outputText();
    if (currentOutput) {
      setInputText(currentOutput);
      setOutputText('');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const text = outputText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard failed
    }
  };

  // Clear all
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    props.onSettingsChange({ lastInput: '' });
  };

  // Share translation via URL
  const shareTranslation = async () => {
    const text = inputText().trim();
    if (!text) return;

    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : '';

    const result = createShareUrl(baseUrl, {
      text,
      direction: settings().direction,
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
  };

  // Text length warning for share button
  const textWarning = () => getTextLengthWarning(inputText());

  // Save input on change
  createEffect(() => {
    const text = inputText();
    if (text !== settings().lastInput) {
      props.onSettingsChange({ lastInput: text });
    }
  });

  const sourceLabel = () => (settings().direction === 'ko-en' ? '한국어' : 'English');
  const targetLabel = () => (settings().direction === 'ko-en' ? 'English' : '한국어');

  return (
    <div class="flex h-full flex-col p-3 sm:p-4 gap-3 overflow-auto">
      {/* Header with direction toggle */}
      <div class="flex items-center justify-center gap-3">
        <span class="text-sm font-medium min-w-[60px] text-right">{sourceLabel()}</span>
        <button
          type="button"
          onClick={toggleDirection}
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-all duration-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.12] hover:scale-105 active:scale-95"
          title="Switch direction"
        >
          <ArrowLeftRight class="h-4 w-4" />
        </button>
        <span class="text-sm font-medium min-w-[60px]">{targetLabel()}</span>
      </div>

      {/* Input area */}
      <div class="flex-1 min-h-[120px]">
        <textarea
          value={inputText()}
          onInput={(e) => setInputText(e.currentTarget.value)}
          placeholder={
            settings().direction === 'ko-en'
              ? '번역할 텍스트를 입력하세요...'
              : 'Enter text to translate...'
          }
          class="h-full w-full resize-none rounded-xl border border-border bg-background p-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        />
      </div>

      {/* Output area */}
      <div class="flex-1 min-h-[120px] relative">
        <div class="h-full w-full rounded-xl border border-border bg-muted/30 p-3 text-sm overflow-auto">
          {outputText()}
        </div>

        {/* Copy button */}
        {outputText() && (
          <button
            type="button"
            onClick={copyToClipboard}
            class="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.12]"
            title={t().common.copy}
          >
            {isCopied() ? (
              <Check class="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy class="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div class="flex items-center justify-between">
        <button
          type="button"
          onClick={clearAll}
          class="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground transition-colors hover:bg-black/[0.08] dark:hover:bg-white/[0.12] hover:text-foreground"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span>{settings().direction === 'ko-en' ? '지우기' : 'Clear'}</span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={shareTranslation}
          disabled={!inputText().trim() || textWarning() === 'danger'}
          class="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/[0.08] dark:hover:bg-white/[0.12]"
          classList={{
            'text-muted-foreground hover:text-foreground': shareStatus() === 'idle',
            'text-green-600 dark:text-green-400': shareStatus() === 'copied',
            'text-red-600 dark:text-red-400': shareStatus() === 'error',
          }}
          title={
            textWarning() === 'danger'
              ? settings().direction === 'ko-en'
                ? '텍스트가 너무 깁니다'
                : 'Text too long'
              : t().tools.shareUrl
          }
        >
          {shareStatus() === 'copied' ? (
            <>
              <Check class="h-3.5 w-3.5" />
              <span>{t().tools.urlCopied}</span>
            </>
          ) : shareStatus() === 'error' ? (
            <>
              <X class="h-3.5 w-3.5" />
              <span>{settings().direction === 'ko-en' ? '너무 깁니다' : 'Too long'}</span>
            </>
          ) : (
            <>
              <Share2 class="h-3.5 w-3.5" />
              <span>{settings().direction === 'ko-en' ? '공유' : 'Share'}</span>
            </>
          )}
        </button>

        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div class="h-2 w-2 rounded-full bg-blue-500" />
          <span>{settings().direction === 'ko-en' ? '사전 번역' : 'Dictionary Translation'}</span>
        </div>
      </div>
    </div>
  );
};

// Tool Definition
export const translatorTool: ToolDefinition<TranslatorSettings> = {
  meta: {
    id: 'translator',
    name: {
      ko: '번역기',
      en: 'Translator',
    },
    description: {
      ko: '한국어 ↔ 영어 사전 기반 번역',
      en: 'Korean ↔ English dictionary-based translation',
    },
    icon: '🌐',
    category: 'utility',
    defaultSize: 'md',
    minSize: { width: 300, height: 360 },
    tags: ['translate', 'korean', 'english', 'language', '번역', '한영', '영한'],
  },
  defaultSettings: defaultTranslatorSettings,
  component: TranslatorComponent,
};

// Auto-register
registerTool(translatorTool);
