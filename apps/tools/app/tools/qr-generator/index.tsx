import { Check, Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import m from '~/lib/messages';
import { cn } from '~/lib/utils';
import { defaultQRSettings, type QRSettings } from './settings';

interface QRGeneratorProps {
  settings?: QRSettings;
  onSettingsChange?: (settings: Partial<QRSettings>) => void;
}

export function QRGenerator({ settings: propSettings, onSettingsChange }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [internalSettings, setInternalSettings] = useState(defaultQRSettings);
  const settings = useMemo(
    () => ({ ...defaultQRSettings, ...propSettings, ...internalSettings }),
    [propSettings, internalSettings],
  );

  const handleSettingsChange = useCallback(
    (partial: Partial<QRSettings>) => {
      setInternalSettings((prev) => ({ ...prev, ...partial }));
      onSettingsChange?.(partial);
    },
    [onSettingsChange],
  );

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate QR code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const generateQR = async () => {
      try {
        setError(null);
        await QRCode.toCanvas(canvas, settings.text || ' ', {
          width: settings.size,
          margin: 2,
          color: {
            dark: settings.foregroundColor,
            light: settings.backgroundColor,
          },
          errorCorrectionLevel: settings.errorCorrection,
        });
      } catch {
        setError(m['qr_generationFailed']?.() ?? 'Failed to generate QR code');
      }
    };

    generateQR();
  }, [settings]);

  const downloadQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      );

      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copy failed silently
    }
  }, []);

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Input */}
      <textarea
        value={settings.text}
        onChange={(e) => handleSettingsChange({ text: e.currentTarget.value })}
        placeholder={m['qr.inputPlaceholder']?.()}
        className={cn(
          'h-16 w-full resize-none rounded border bg-background px-3 py-2 text-sm',
          'transition-all duration-200',
          'hover:border-primary/40 hover:bg-black/6 dark:hover:bg-white/8',
          'focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        )}
      />

      {/* QR Code */}
      <div className="flex flex-1 items-center justify-center">
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <canvas
            ref={canvasRef}
            className="rounded border [image-rendering:pixelated]"
            style={{ width: '200px', height: '200px' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={downloadQR}
          disabled={!!error}
          className={cn(
            'inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <Download className="mr-1 h-4 w-4" />
          {m['common.save']?.()}
        </button>
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!!error}
          className={cn(
            'inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {copied ? (
            <Check className="mr-1 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-1 h-4 w-4" />
          )}
          {m['common.copy']?.()}
        </button>
      </div>

      {/* Color Options */}
      <div className="flex justify-center gap-4 text-sm">
        <label className="group flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-all duration-200 hover:bg-black/8 focus-within:ring-2 focus-within:ring-ring dark:hover:bg-white/12">
          <input
            type="color"
            value={settings.foregroundColor}
            onChange={(e) => handleSettingsChange({ foregroundColor: e.currentTarget.value })}
            className="h-6 w-6 cursor-pointer rounded border transition-all duration-200 hover:border-primary/50 focus:outline-none"
            aria-label={m['qr.foreground']?.()}
          />
          <span className="transition-colors duration-200 group-hover:text-foreground">
            {m['qr.foreground']?.()}
          </span>
        </label>
        <label className="group flex cursor-pointer items-center gap-1 rounded px-2 py-1 transition-all duration-200 hover:bg-black/8 focus-within:ring-2 focus-within:ring-ring dark:hover:bg-white/12">
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => handleSettingsChange({ backgroundColor: e.currentTarget.value })}
            className="h-6 w-6 cursor-pointer rounded border transition-all duration-200 hover:border-primary/50 focus:outline-none"
            aria-label={m['qr.background']?.()}
          />
          <span className="transition-colors duration-200 group-hover:text-foreground">
            {m['qr.background']?.()}
          </span>
        </label>
      </div>
    </div>
  );
}

export { defaultQRSettings, type QRSettings } from './settings';
