import { Check, Copy, Download } from 'lucide-solid';
import QRCode from 'qrcode';
import { type Component, createEffect, createSignal, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { useLanguage } from '~/i18n';
import { cn } from '~/lib/utils';
import { registerTool } from '../registry';
import type { ToolDefinition, ToolProps } from '../types';

// ========================================
// QR Generator Tool - QR 코드 생성기
// ========================================

export interface QRSettings {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

// Alias for backward compatibility
export type QRGeneratorSettings = QRSettings;

export const defaultQRSettings: QRSettings = {
  text: 'https://tools.soundbluemusic.com',
  size: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrection: 'M',
};

const QRGeneratorComponent: Component<ToolProps<QRSettings>> = (props) => {
  const { t } = useLanguage();
  let canvasRef: HTMLCanvasElement | undefined;
  const [copied, setCopied] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const settings = () => props.settings;

  // Generate QR code using qrcode library
  createEffect(() => {
    const canvas = canvasRef;
    if (!canvas) return;

    const generateQR = async () => {
      try {
        setError(null);
        await QRCode.toCanvas(canvas, settings().text || ' ', {
          width: settings().size,
          margin: 2,
          color: {
            dark: settings().foregroundColor,
            light: settings().backgroundColor,
          },
          errorCorrectionLevel: settings().errorCorrection,
        });
      } catch {
        setError(t().qr.generationFailed);
      }
    };

    generateQR();
  });

  const downloadQR = () => {
    const canvas = canvasRef;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed silently
    }
  };

  const isCompact = () => props.size.width < 320;
  const displaySize = () => Math.min(props.size.width - 32, props.size.height - 120, 200);

  // Update canvas display size reactively
  createEffect(() => {
    const size = displaySize();
    if (canvasRef) {
      canvasRef.style.width = `${size}px`;
      canvasRef.style.height = `${size}px`;
    }
  });

  return (
    <div class={cn('flex h-full flex-col gap-3 p-4', isCompact() && 'gap-2 p-2')}>
      {/* Input */}
      <textarea
        value={settings().text}
        onInput={(e) => props.onSettingsChange({ text: e.currentTarget.value })}
        placeholder={t().qr.inputPlaceholder}
        class={cn(
          'w-full resize-none rounded border bg-background px-3 py-2 text-sm',
          'transition-all duration-200',
          // Visible color contrast on hover
          'hover:bg-black/6 dark:hover:bg-white/8 hover:border-primary/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-primary focus-visible:bg-background',
          isCompact() ? 'h-12' : 'h-16'
        )}
      />

      {/* QR Code */}
      <div class="flex flex-1 items-center justify-center">
        <Show when={!error()} fallback={<div class="text-sm text-destructive">{error()}</div>}>
          <canvas ref={canvasRef} class="rounded border [image-rendering:pixelated]" />
        </Show>
      </div>

      {/* Actions */}
      <div class="flex justify-center gap-2">
        <Button
          variant="outline"
          size={isCompact() ? 'sm' : 'default'}
          onClick={downloadQR}
          disabled={!!error()}
        >
          <Download class="mr-1 h-4 w-4" />
          {t().common.save}
        </Button>
        <Button
          variant="outline"
          size={isCompact() ? 'sm' : 'default'}
          onClick={copyToClipboard}
          disabled={!!error()}
        >
          <Show when={copied()} fallback={<Copy class="mr-1 h-4 w-4" />}>
            <Check class="mr-1 h-4 w-4 text-green-500" />
          </Show>
          {t().common.copy}
        </Button>
      </div>

      {/* Color Options */}
      <Show when={!isCompact()}>
        <div class="flex justify-center gap-4 text-sm">
          <label class="flex items-center gap-1 cursor-pointer group px-2 py-1 rounded transition-all duration-200 hover:bg-black/8 dark:hover:bg-white/12 focus-within:ring-2 focus-within:ring-ring">
            <input
              type="color"
              value={settings().foregroundColor}
              onInput={(e) => props.onSettingsChange({ foregroundColor: e.currentTarget.value })}
              class="h-6 w-6 cursor-pointer rounded border transition-all duration-200 hover:border-primary/50 focus:outline-none"
              aria-label={t().qr.foreground}
            />
            <span class="transition-colors duration-200 group-hover:text-foreground">
              {t().qr.foreground}
            </span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer group px-2 py-1 rounded transition-all duration-200 hover:bg-black/8 dark:hover:bg-white/12 focus-within:ring-2 focus-within:ring-ring">
            <input
              type="color"
              value={settings().backgroundColor}
              onInput={(e) => props.onSettingsChange({ backgroundColor: e.currentTarget.value })}
              class="h-6 w-6 cursor-pointer rounded border transition-all duration-200 hover:border-primary/50 focus:outline-none"
              aria-label={t().qr.background}
            />
            <span class="transition-colors duration-200 group-hover:text-foreground">
              {t().qr.background}
            </span>
          </label>
        </div>
      </Show>
    </div>
  );
};

// Tool Definition
export const qrGeneratorTool: ToolDefinition<QRSettings> = {
  meta: {
    id: 'qr-generator',
    name: {
      ko: 'QR 생성기',
      en: 'QR Generator',
    },
    description: {
      ko: 'URL이나 텍스트를 QR 코드로 변환',
      en: 'Convert URL or text to QR code',
    },
    icon: '📱',
    category: 'productivity',
    defaultSize: 'md',
    minSize: { width: 200, height: 280 },
    tags: ['qr', 'code', 'url', 'share'],
  },
  defaultSettings: defaultQRSettings,
  component: QRGeneratorComponent,
};

// Auto-register
registerTool(qrGeneratorTool);
