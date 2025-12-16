import { createEffect, onCleanup, onMount } from 'solid-js';
import { getAudioContext } from '@/lib/audio-context';

interface SpectrumProps {
  width?: number;
  height?: number;
  analyserNode?: AnalyserNode | null;
  barColor?: string;
  peakColor?: string;
  barCount?: number;
  class?: string;
}

/**
 * Real-time spectrum analyzer visualization using Canvas 2D
 * Displays audio signal as frequency bars
 */
export function Spectrum(props: SpectrumProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let analyser: AnalyserNode | null = props.analyserNode ?? null;
  let dataArray: Uint8Array<ArrayBuffer> | null = null;
  let peaks: number[] = [];
  let animationId = 0;

  const width = () => props.width ?? 300;
  const height = () => props.height ?? 100;
  const barColor = () => props.barColor ?? '#3b82f6';
  const peakColor = () => props.peakColor ?? '#ef4444';
  const barCount = () => props.barCount ?? 32;

  // Create internal analyser if none provided, and sync peaks array with barCount
  createEffect(() => {
    if (!props.analyserNode) {
      const audioCtx = getAudioContext();
      const internalAnalyser = audioCtx.createAnalyser();
      internalAnalyser.fftSize = 256;
      internalAnalyser.smoothingTimeConstant = 0.8;
      analyser = internalAnalyser;
    } else {
      analyser = props.analyserNode;
    }

    if (analyser) {
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    // Sync peaks array size with barCount
    const count = barCount();
    if (peaks.length !== count) {
      peaks = new Array(count).fill(0);
    }
  });

  const initCanvas = () => {
    if (!canvasRef) return;

    const dpr = window.devicePixelRatio || 1;
    const w = width();
    const h = height();

    canvasRef.width = w * dpr;
    canvasRef.height = h * dpr;
    canvasRef.style.width = `${w}px`;
    canvasRef.style.height = `${h}px`;

    ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
  };

  const draw = () => {
    if (!ctx || !canvasRef) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const w = width();
    const h = height();
    const dpr = window.devicePixelRatio || 1;

    // Reset transform and clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    if (!analyser || !dataArray) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    analyser.getByteFrequencyData(dataArray);

    const count = barCount();
    const barWidth = w / count - 2;
    const step = Math.floor(dataArray.length / count);

    for (let i = 0; i < count; i++) {
      // Average the frequencies for this bar
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] ?? 0;
      }
      const value = sum / step;

      const barHeight = (value / 255) * h;
      const x = i * (barWidth + 2);
      const y = h - barHeight;

      // Draw bar
      ctx.fillStyle = barColor();
      ctx.fillRect(x, y, barWidth, barHeight);

      // Update and draw peak
      const currentPeak = peaks[i] ?? 0;
      if (barHeight > currentPeak) {
        peaks[i] = barHeight;
      } else {
        peaks[i] = Math.max(0, currentPeak - 1);
      }

      const peakY = h - (peaks[i] ?? 0);
      ctx.fillStyle = peakColor();
      ctx.fillRect(x, peakY - 2, barWidth, 2);
    }

    animationId = requestAnimationFrame(draw);
  };

  onMount(() => {
    initCanvas();
    draw();
  });

  onCleanup(() => {
    cancelAnimationFrame(animationId);
    ctx = null;
  });

  return (
    <canvas
      ref={canvasRef}
      class={props.class}
      style={{
        width: `${width()}px`,
        height: `${height()}px`,
      }}
    />
  );
}
