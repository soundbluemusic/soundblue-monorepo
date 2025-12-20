import { onCleanup, onMount } from 'solid-js';

// ========================================
// Canvas 2D Component
// ========================================
// 범용 Canvas 2D 렌더링 컴포넌트

interface CanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  class?: string;
  onReady?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export function Canvas2D(props: CanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  const initCanvas = () => {
    if (!canvasRef) return;

    const dpr = window.devicePixelRatio || 1;
    const width = props.width ?? (canvasRef.clientWidth || 300);
    const height = props.height ?? (canvasRef.clientHeight || 150);

    // Set canvas size with device pixel ratio
    canvasRef.width = width * dpr;
    canvasRef.height = height * dpr;
    canvasRef.style.width = `${width}px`;
    canvasRef.style.height = `${height}px`;

    ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Fill background
    if (props.backgroundColor) {
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Notify parent
    if (props.onReady) {
      props.onReady(ctx, canvasRef);
    }
  };

  onMount(() => {
    initCanvas();

    // Handle resize
    if (canvasRef) {
      const resizeObserver = new ResizeObserver(() => {
        initCanvas();
      });

      resizeObserver.observe(canvasRef);

      onCleanup(() => {
        resizeObserver.disconnect();
      });
    }
  });

  return (
    <canvas
      ref={canvasRef}
      class={props.class}
      style={{
        width: props.width ? `${props.width}px` : '100%',
        height: props.height ? `${props.height}px` : '100%',
      }}
    />
  );
}
