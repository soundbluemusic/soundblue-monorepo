import { useCallback, useEffect, useRef, useState } from 'react';
import type { DrumId } from './settings';

interface DrumGridProps {
  pattern: Record<DrumId, boolean[]>;
  steps: number;
  currentStep: number;
  isPlaying: boolean;
  onStepToggle: (drumId: DrumId, step: number, value: boolean) => void;
  className?: string;
}

const DRUMS: { id: DrumId; name: string; color: string }[] = [
  { id: 'kick', name: 'Kick', color: '#ff6b6b' },
  { id: 'snare', name: 'Snare', color: '#4ecdc4' },
  { id: 'hihat', name: 'Hi-Hat', color: '#ffe66d' },
  { id: 'openhat', name: 'Open Hat', color: '#ffd93d' },
  { id: 'clap', name: 'Clap', color: '#a29bfe' },
];

const BASE_CELL_SIZE = 28;
const BASE_CELL_GAP = 3;
const BASE_LABEL_WIDTH = 52;
const HEADER_HEIGHT = 0;
const MIN_CELL_SIZE = 24;

const COLORS = {
  background: '#1a1a2e',
  cellInactive: '#2d2d44',
  cellHover: '#3d3d5c',
  cellActive: '#6366f1',
  beatMarker: '#404060',
  playhead: '#fbbf24',
  text: '#ffffff',
};

// 성능: 컴포넌트 외부로 이동하여 매 렌더마다 재정의 방지
function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
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
}

export function DrumGrid({
  pattern,
  steps,
  currentStep,
  isPlaying,
  onStepToggle,
  className,
}: DrumGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(false);
  const [dragDrumId, setDragDrumId] = useState<DrumId | null>(null);
  const [scale, setScale] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const getCellSize = useCallback(() => Math.max(MIN_CELL_SIZE, BASE_CELL_SIZE * scale), [scale]);
  const getCellGap = useCallback(() => Math.max(2, BASE_CELL_GAP * scale), [scale]);
  const getLabelWidth = useCallback(() => Math.max(36, BASE_LABEL_WIDTH * scale), [scale]);

  const getGridWidth = useCallback(
    () => getLabelWidth() + steps * (getCellSize() + getCellGap()),
    [getLabelWidth, steps, getCellSize, getCellGap],
  );
  const getGridHeight = useCallback(
    () => HEADER_HEIGHT + DRUMS.length * (getCellSize() + getCellGap()),
    [getCellSize, getCellGap],
  );

  const getCellPosition = useCallback(
    (drumIndex: number, step: number) => ({
      x: getLabelWidth() + step * (getCellSize() + getCellGap()),
      y: HEADER_HEIGHT + drumIndex * (getCellSize() + getCellGap()),
    }),
    [getLabelWidth, getCellSize, getCellGap],
  );

  const getCellFromPoint = useCallback(
    (x: number, y: number): { drumId: DrumId; step: number } | null => {
      const labelWidth = getLabelWidth();
      const cellSize = getCellSize();
      const cellGap = getCellGap();

      if (x < labelWidth) return null;

      const step = Math.floor((x - labelWidth) / (cellSize + cellGap));
      const drumIndex = Math.floor((y - HEADER_HEIGHT) / (cellSize + cellGap));

      if (step < 0 || step >= steps) return null;
      if (drumIndex < 0 || drumIndex >= DRUMS.length) return null;

      const cellX = labelWidth + step * (cellSize + cellGap);
      const cellY = HEADER_HEIGHT + drumIndex * (cellSize + cellGap);

      if (x > cellX + cellSize || y > cellY + cellSize) return null;

      const drum = DRUMS[drumIndex];
      if (!drum) return null;

      return { drumId: drum.id, step };
    },
    [getLabelWidth, getCellSize, getCellGap, steps],
  );

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const gridWidth = getGridWidth();
    const gridHeight = getGridHeight();
    const labelWidth = getLabelWidth();
    const cellSize = getCellSize();
    const cellGap = getCellGap();

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, gridWidth, gridHeight);

    // Beat markers
    ctx.strokeStyle = COLORS.beatMarker;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    for (let step = 0; step < steps; step++) {
      if (step % 4 === 0) {
        const x = labelWidth + step * (cellSize + cellGap) - cellGap / 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridHeight);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Labels
    const fontSize = Math.max(8, 10 * scale);
    DRUMS.forEach((drum, index) => {
      const y = HEADER_HEIGHT + index * (cellSize + cellGap);

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = drum.color;
      roundRect(ctx, 0, y, labelWidth - cellGap, cellSize, 4);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = COLORS.text;
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drum.name, (labelWidth - cellGap) / 2, y + cellSize / 2);
    });

    // Cells
    DRUMS.forEach((drum, drumIndex) => {
      for (let step = 0; step < steps; step++) {
        const pos = getCellPosition(drumIndex, step);
        const isActive = pattern[drum.id]?.[step] ?? false;
        const isCurrentStep = isPlaying && currentStep === step;

        ctx.fillStyle = isActive ? drum.color : COLORS.cellInactive;
        roundRect(ctx, pos.x, pos.y, cellSize, cellSize, 4);
        ctx.fill();

        if (isCurrentStep) {
          ctx.strokeStyle = COLORS.playhead;
          ctx.lineWidth = 2;
          roundRect(ctx, pos.x, pos.y, cellSize, cellSize, 4);
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  }, [
    getGridWidth,
    getGridHeight,
    getLabelWidth,
    getCellSize,
    getCellGap,
    getCellPosition,
    steps,
    scale,
    pattern,
    isPlaying,
    currentStep,
  ]);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const baseWidth = BASE_LABEL_WIDTH + steps * (BASE_CELL_SIZE + BASE_CELL_GAP);
    const newScale = Math.min(1, containerWidth / baseWidth);
    setScale(newScale);
  }, [steps]);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    updateScale();

    const dpr = window.devicePixelRatio || 1;
    const width = getGridWidth();
    const height = getGridHeight();

    canvasRef.current.width = width * dpr;
    canvasRef.current.height = height * dpr;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    ctxRef.current = canvasRef.current.getContext('2d');
    if (!ctxRef.current) return;

    setIsReady(true);
    render();
  }, [updateScale, getGridWidth, getGridHeight, render]);

  const getMousePos = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      const cell = getCellFromPoint(pos.x, pos.y);

      if (cell) {
        const currentValue = pattern[cell.drumId]?.[cell.step] ?? false;
        const newValue = !currentValue;

        setIsDragging(true);
        setDragValue(newValue);
        setDragDrumId(cell.drumId);

        onStepToggle(cell.drumId, cell.step, newValue);
        canvasRef.current?.setPointerCapture(e.pointerId);
      }
    },
    [getMousePos, getCellFromPoint, pattern, onStepToggle],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      const pos = getMousePos(e);
      const cell = getCellFromPoint(pos.x, pos.y);

      if (cell && cell.drumId === dragDrumId) {
        onStepToggle(cell.drumId, cell.step, dragValue);
      }
    },
    [isDragging, getMousePos, getCellFromPoint, dragDrumId, dragValue, onStepToggle],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        setIsDragging(false);
        setDragDrumId(null);
        canvasRef.current?.releasePointerCapture(e.pointerId);
      }
    },
    [isDragging],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      initCanvas();
    });

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
      initCanvas();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [initCanvas, updateScale]);

  useEffect(() => {
    if (isReady) {
      render();
    }
  }, [isReady, render, pattern, currentStep, isPlaying]);

  // Generate pattern description for screen readers
  const getPatternDescription = useCallback(() => {
    const activeSteps = DRUMS.map((drum) => {
      const active = pattern[drum.id]?.map((v, i) => (v ? i + 1 : null)).filter(Boolean) ?? [];
      return active.length > 0 ? `${drum.name}: steps ${active.join(', ')}` : null;
    }).filter(Boolean);
    return activeSteps.length > 0 ? activeSteps.join('. ') : 'No active steps';
  }, [pattern]);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      {/* biome-ignore lint/a11y/useSemanticElements: Canvas requires role="grid" for accessibility with custom grid rendering */}
      <canvas
        ref={canvasRef}
        className={className}
        role="grid"
        aria-label={`Drum pattern grid with ${steps} steps and ${DRUMS.length} instruments. Click to toggle beats.`}
        style={{
          width: `${getGridWidth()}px`,
          height: `${getGridHeight()}px`,
          maxWidth: 'none',
          cursor: 'pointer',
          touchAction: 'pan-x pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {/* Screen reader description */}
      <div className="sr-only" aria-live="polite">
        {getPatternDescription()}
      </div>
    </div>
  );
}
