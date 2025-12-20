import { createEffect, onCleanup, onMount } from 'solid-js';
import { getAudioContext } from '~/lib/audio-context';

interface WaveformProps {
  width?: number;
  height?: number;
  analyserNode?: AnalyserNode | null;
  color?: string;
  lineWidth?: number;
  class?: string;
}

/**
 * Real-time waveform visualization using Canvas 2D
 * Displays audio signal as a waveform (time domain)
 */
export function RealtimeWaveform(props: WaveformProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let analyser: AnalyserNode | null = props.analyserNode ?? null;
  let dataArray: Uint8Array<ArrayBuffer> | null = null;
  let animationId = 0;

  const width = () => props.width ?? 300;
  const height = () => props.height ?? 100;
  const color = () => props.color ?? '#3b82f6';
  const lineWidthVal = () => props.lineWidth ?? 2;

  // Create internal analyser if none provided
  createEffect(() => {
    if (!props.analyserNode) {
      const audioCtx = getAudioContext();
      const internalAnalyser = audioCtx.createAnalyser();
      internalAnalyser.fftSize = 2048;
      analyser = internalAnalyser;
    } else {
      analyser = props.analyserNode;
    }

    if (analyser) {
      dataArray = new Uint8Array(analyser.frequencyBinCount);
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

    // Draw center line
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (!analyser || !dataArray) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    analyser.getByteTimeDomainData(dataArray);

    // Draw waveform
    ctx.strokeStyle = color();
    ctx.lineWidth = lineWidthVal();
    ctx.beginPath();

    const sliceWidth = w / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] ?? 128) / 128.0;
      const y = (v * h) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

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
