import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

// ========================================
// DrumGrid - Canvas 2D drum pattern grid
// ========================================

export type DrumId = 'kick' | 'snare' | 'hihat' | 'clap';

interface DrumGridProps {
  pattern: Record<DrumId, boolean[]>;
  steps: number;
  currentStep: number;
  isPlaying: boolean;
  onStepToggle: (drumId: DrumId, step: number, value: boolean) => void;
  onDragStart: (drumId: DrumId, step: number) => void;
  onDragEnter: (drumId: DrumId, step: number) => void;
  onDragEnd: () => void;
  class?: string;
}

// Grid configuration
const DRUMS: { id: DrumId; name: string; color: string }[] = [
  { id: 'kick', name: 'Kick', color: '#ff6b6b' },
  { id: 'snare', name: 'Snare', color: '#4ecdc4' },
  { id: 'hihat', name: 'Hi-Hat', color: '#ffe66d' },
  { id: 'clap', name: 'Clap', color: '#a29bfe' },
];

// Base sizes (will scale on mobile)
const BASE_CELL_SIZE = 28;
const BASE_CELL_GAP = 3;
const BASE_LABEL_WIDTH = 52;
const HEADER_HEIGHT = 0;
const MIN_CELL_SIZE = 14; // Minimum cell size for mobile

// Colors
const COLORS = {
  background: '#1a1a2e',
  cellInactive: '#2d2d44',
  cellHover: '#3d3d5c',
  cellActive: '#6366f1',
  beatMarker: '#404060',
  playhead: '#fbbf24',
  text: '#ffffff',
};

export function DrumGrid(props: DrumGridProps) {
  // Skip rendering on server
  if (isServer) {
    return <div class={props.class} />;
  }

  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;

  // Drag state
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragValue, setDragValue] = createSignal(false);
  const [dragDrumId, setDragDrumId] = createSignal<DrumId | null>(null);
  const [isReady, setIsReady] = createSignal(false);

  // Responsive sizing
  const [scale, setScale] = createSignal(1);

  const getCellSize = () => Math.max(MIN_CELL_SIZE, BASE_CELL_SIZE * scale());
  const getCellGap = () => Math.max(2, BASE_CELL_GAP * scale());
  const getLabelWidth = () => Math.max(36, BASE_LABEL_WIDTH * scale());

  // Calculate dimensions
  const getGridWidth = () => getLabelWidth() + props.steps * (getCellSize() + getCellGap());
  const getGridHeight = () => HEADER_HEIGHT + DRUMS.length * (getCellSize() + getCellGap());

  // Get cell position
  const getCellPosition = (drumIndex: number, step: number) => ({
    x: getLabelWidth() + step * (getCellSize() + getCellGap()),
    y: HEADER_HEIGHT + drumIndex * (getCellSize() + getCellGap()),
  });

  // Get cell from mouse coordinates
  const getCellFromPoint = (x: number, y: number): { drumId: DrumId; step: number } | null => {
    const labelWidth = getLabelWidth();
    const cellSize = getCellSize();
    const cellGap = getCellGap();

    // Check if in cell area (not label area)
    if (x < labelWidth) return null;

    const step = Math.floor((x - labelWidth) / (cellSize + cellGap));
    const drumIndex = Math.floor((y - HEADER_HEIGHT) / (cellSize + cellGap));

    if (step < 0 || step >= props.steps) return null;
    if (drumIndex < 0 || drumIndex >= DRUMS.length) return null;

    // Check if within cell bounds (not in gap)
    const cellX = labelWidth + step * (cellSize + cellGap);
    const cellY = HEADER_HEIGHT + drumIndex * (cellSize + cellGap);

    if (x > cellX + cellSize || y > cellY + cellSize) return null;

    const drum = DRUMS[drumIndex];
    if (!drum) return null;

    return { drumId: drum.id, step };
  };

  // Draw rounded rectangle helper
  const roundRect = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  };

  // Draw beat markers (every 4 steps)
  const drawBeatMarkers = (context: CanvasRenderingContext2D) => {
    const labelWidth = getLabelWidth();
    const cellSize = getCellSize();
    const cellGap = getCellGap();

    context.strokeStyle = COLORS.beatMarker;
    context.globalAlpha = 0.5;
    context.lineWidth = 1;

    for (let step = 0; step < props.steps; step++) {
      if (step % 4 === 0) {
        const x = labelWidth + step * (cellSize + cellGap) - cellGap / 2;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, getGridHeight());
        context.stroke();
      }
    }

    context.globalAlpha = 1;
  };

  // Draw drum labels
  const drawLabels = (context: CanvasRenderingContext2D) => {
    const labelWidth = getLabelWidth();
    const cellSize = getCellSize();
    const cellGap = getCellGap();
    const fontSize = Math.max(8, 10 * scale());

    DRUMS.forEach((drum, index) => {
      const y = HEADER_HEIGHT + index * (cellSize + cellGap);

      context.globalAlpha = 0.3;
      context.fillStyle = drum.color;
      roundRect(context, 0, y, labelWidth - cellGap, cellSize, 4);
      context.fill();
      context.globalAlpha = 1;

      // Draw label text
      context.fillStyle = COLORS.text;
      context.font = `${fontSize}px sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(drum.name, (labelWidth - cellGap) / 2, y + cellSize / 2);
    });
  };

  // Draw a single cell
  const drawCell = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    isActive: boolean,
    isCurrentStep: boolean,
    drumColor: string
  ) => {
    const cellSize = getCellSize();

    // Cell background
    context.fillStyle = isActive ? drumColor : COLORS.cellInactive;
    roundRect(context, x, y, cellSize, cellSize, 4);
    context.fill();

    // Current step highlight
    if (isCurrentStep) {
      context.strokeStyle = COLORS.playhead;
      context.lineWidth = 2;
      roundRect(context, x, y, cellSize, cellSize, 4);
      context.stroke();
    }
  };

  // Full render
  const render = () => {
    if (!ctx || !canvasRef) return;

    const dpr = window.devicePixelRatio || 1;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Scale for device pixel ratio
    ctx.save();
    ctx.scale(dpr, dpr);

    // Fill background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, getGridWidth(), getGridHeight());

    // Draw static elements
    drawBeatMarkers(ctx);
    drawLabels(ctx);

    // Draw cells
    DRUMS.forEach((drum, drumIndex) => {
      for (let step = 0; step < props.steps; step++) {
        const pos = getCellPosition(drumIndex, step);
        const isActive = props.pattern[drum.id]?.[step] ?? false;
        const isCurrentStep = props.isPlaying && props.currentStep === step;
        drawCell(ctx!, pos.x, pos.y, isActive, isCurrentStep, drum.color);
      }
    });

    ctx.restore();
  };

  // Calculate scale based on container width
  const updateScale = () => {
    if (!containerRef) return;

    const containerWidth = containerRef.clientWidth;
    const baseWidth = BASE_LABEL_WIDTH + props.steps * (BASE_CELL_SIZE + BASE_CELL_GAP);

    // Scale down if container is smaller than base width
    const newScale = Math.min(1, containerWidth / baseWidth);
    setScale(newScale);
  };

  // Initialize canvas
  const initCanvas = () => {
    if (!canvasRef) return;

    updateScale();

    const dpr = window.devicePixelRatio || 1;
    const width = getGridWidth();
    const height = getGridHeight();

    // Set canvas size with device pixel ratio for sharp rendering
    canvasRef.width = width * dpr;
    canvasRef.height = height * dpr;
    canvasRef.style.width = `${width}px`;
    canvasRef.style.height = `${height}px`;

    ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    setIsReady(true);
    render();
  };

  // Get mouse position relative to canvas
  const getMousePos = (e: MouseEvent | PointerEvent): { x: number; y: number } => {
    if (!canvasRef) return { x: 0, y: 0 };
    const rect = canvasRef.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Event handlers
  const handlePointerDown = (e: PointerEvent) => {
    const pos = getMousePos(e);
    const cell = getCellFromPoint(pos.x, pos.y);

    if (cell) {
      const currentValue = props.pattern[cell.drumId]?.[cell.step] ?? false;
      const newValue = !currentValue;

      setIsDragging(true);
      setDragValue(newValue);
      setDragDrumId(cell.drumId);

      props.onStepToggle(cell.drumId, cell.step, newValue);
      props.onDragStart(cell.drumId, cell.step);

      // Capture pointer for drag
      canvasRef?.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging()) return;

    const pos = getMousePos(e);
    const cell = getCellFromPoint(pos.x, pos.y);

    if (cell && cell.drumId === dragDrumId()) {
      props.onStepToggle(cell.drumId, cell.step, dragValue());
      props.onDragEnter(cell.drumId, cell.step);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isDragging()) {
      setIsDragging(false);
      setDragDrumId(null);
      props.onDragEnd();
      canvasRef?.releasePointerCapture(e.pointerId);
    }
  };

  // Handle resize
  const handleResize = () => {
    updateScale();
    initCanvas();
  };

  // Mount
  onMount(() => {
    // Small delay to ensure container is measured
    requestAnimationFrame(() => {
      initCanvas();
    });

    // Add event listeners
    canvasRef?.addEventListener('pointerdown', handlePointerDown);
    canvasRef?.addEventListener('pointermove', handlePointerMove);
    canvasRef?.addEventListener('pointerup', handlePointerUp);
    canvasRef?.addEventListener('pointercancel', handlePointerUp);

    // Resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef) {
      resizeObserver.observe(containerRef);
    }

    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  // Update when pattern or currentStep changes
  createEffect(() => {
    // Access reactive props to track them
    const _pattern = props.pattern;
    const _currentStep = props.currentStep;
    const _isPlaying = props.isPlaying;

    if (isReady()) {
      render();
    }
  });

  // Cleanup
  onCleanup(() => {
    canvasRef?.removeEventListener('pointerdown', handlePointerDown);
    canvasRef?.removeEventListener('pointermove', handlePointerMove);
    canvasRef?.removeEventListener('pointerup', handlePointerUp);
    canvasRef?.removeEventListener('pointercancel', handlePointerUp);
  });

  return (
    <div ref={containerRef} class="w-full overflow-x-auto">
      <canvas
        ref={canvasRef}
        class={props.class}
        style={{
          width: `${getGridWidth()}px`,
          height: `${getGridHeight()}px`,
          'max-width': 'none',
          cursor: 'pointer',
          'touch-action': 'pan-x pan-y',
        }}
      />
    </div>
  );
}
