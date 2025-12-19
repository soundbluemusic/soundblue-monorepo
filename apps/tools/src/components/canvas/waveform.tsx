import { createEffect, onCleanup, onMount } from 'solid-js';

// ========================================
// Waveform Renderer (Canvas 2D)
// ========================================
// 오디오 파형 렌더링

interface WaveformProps {
  audioData?: Float32Array;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  class?: string;
}

export function Waveform(props: WaveformProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const width = () => props.width ?? 800;
  const height = () => props.height ?? 128;
  const color = () => props.color ?? '#3b82f6';
  const backgroundColor = () => props.backgroundColor ?? '#1a1a1a';

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
    drawWaveform();
  };

  const drawWaveform = () => {
    if (!ctx) return;

    const w = width();
    const h = height();
    const audioData = props.audioData;

    // Clear and fill background
    ctx.fillStyle = backgroundColor();
    ctx.fillRect(0, 0, w, h);

    const centerY = h / 2;

    if (!audioData || audioData.length === 0) {
      // Draw center line when no data
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();
      return;
    }

    const samplesPerPixel = Math.ceil(audioData.length / w);

    ctx.strokeStyle = color();
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const startSample = x * samplesPerPixel;
      const endSample = Math.min(startSample + samplesPerPixel, audioData.length);

      let min = 1;
      let max = -1;

      for (let i = startSample; i < endSample; i++) {
        const sample = audioData[i] ?? 0;
        if (sample < min) min = sample;
        if (sample > max) max = sample;
      }

      const minY = centerY - min * centerY;
      const maxY = centerY - max * centerY;

      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }

    ctx.stroke();
  };

  onMount(() => {
    initCanvas();
  });

  // Update waveform when audioData changes
  createEffect(() => {
    // Track props.audioData reactively
    props.audioData;
    if (ctx) {
      drawWaveform();
    }
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

// ========================================
// Real-time Level Meter (Canvas 2D)
// ========================================

interface LevelMeterProps {
  level: number; // 0-1
  peak?: number; // 0-1
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
  class?: string;
}

export function LevelMeter(props: LevelMeterProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const meterWidth = () => props.width ?? 20;
  const meterHeight = () => props.height ?? 200;
  const orientation = () => props.orientation ?? 'vertical';
  const isVertical = () => orientation() === 'vertical';

  const initCanvas = () => {
    if (!canvasRef) return;

    const dpr = window.devicePixelRatio || 1;
    const w = isVertical() ? meterWidth() : meterHeight();
    const h = isVertical() ? meterHeight() : meterWidth();

    canvasRef.width = w * dpr;
    canvasRef.height = h * dpr;
    canvasRef.style.width = `${w}px`;
    canvasRef.style.height = `${h}px`;

    ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    drawMeter();
  };

  const drawMeter = () => {
    if (!ctx) return;

    const w = isVertical() ? meterWidth() : meterHeight();
    const h = isVertical() ? meterHeight() : meterWidth();

    // Draw meter background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, w, h);

    // Draw level
    const levelHeight = h * Math.min(props.level, 1);
    const levelColor = props.level > 0.9 ? '#ff4444' : props.level > 0.7 ? '#ffaa00' : '#44ff44';

    ctx.fillStyle = levelColor;
    if (isVertical()) {
      ctx.fillRect(0, h - levelHeight, w, levelHeight);
    } else {
      ctx.fillRect(0, 0, levelHeight, w);
    }

    // Draw peak
    if (props.peak !== undefined) {
      const peakPos = h * (1 - Math.min(props.peak, 1));
      ctx.fillStyle = '#ffffff';
      if (isVertical()) {
        ctx.fillRect(0, peakPos, w, 2);
      } else {
        ctx.fillRect(h - peakPos - 2, 0, 2, w);
      }
    }
  };

  onMount(() => {
    initCanvas();
  });

  // Update meter when level/peak changes
  createEffect(() => {
    // Track props.level and props.peak reactively
    props.level;
    props.peak;
    if (ctx) {
      drawMeter();
    }
  });

  onCleanup(() => {
    ctx = null;
  });

  return (
    <canvas
      ref={canvasRef}
      class={props.class}
      style={{
        width: isVertical() ? `${meterWidth()}px` : `${meterHeight()}px`,
        height: isVertical() ? `${meterHeight()}px` : `${meterWidth()}px`,
      }}
    />
  );
}
