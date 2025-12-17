/**
 * @fileoverview 실시간 스펙트럼 분석기 컴포넌트 (Real-time Spectrum Analyzer)
 *
 * Web Audio API의 AnalyserNode를 사용하여 오디오 주파수 데이터를
 * Canvas 2D로 시각화하는 컴포넌트입니다.
 *
 * @module spectrum
 */

import { createEffect, onCleanup, onMount } from 'solid-js';
import { getAudioContext } from '@/lib/audio-context';

/**
 * Spectrum 컴포넌트 Props
 *
 * @interface SpectrumProps
 * @property {number} [width=300] - 캔버스 너비 (px)
 * @property {number} [height=100] - 캔버스 높이 (px)
 * @property {AnalyserNode|null} [analyserNode] - 외부 AnalyserNode 연결.
 *   미제공 시 내부에서 생성하며, 이 경우 오디오 소스를 직접 연결해야 함.
 * @property {string} [barColor='#3b82f6'] - 주파수 바 색상 (CSS color)
 * @property {string} [peakColor='#ef4444'] - 피크 표시 색상 (CSS color)
 * @property {number} [barCount=32] - 표시할 주파수 바 개수
 * @property {string} [class] - 추가 CSS 클래스
 *
 * @example
 * // 외부 AnalyserNode 연결 방법
 * const audioCtx = new AudioContext();
 * const analyser = audioCtx.createAnalyser();
 * const source = audioCtx.createMediaElementSource(audioElement);
 * source.connect(analyser);
 * analyser.connect(audioCtx.destination);
 *
 * <Spectrum analyserNode={analyser} width={400} height={150} barCount={64} />
 */
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
