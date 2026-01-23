/**
 * @fileoverview Virtual List Component
 *
 * High-performance virtualized list using @tanstack/react-virtual.
 * Ideal for long lists like piano rolls, timelines, or large datasets.
 */

'use client';

import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { type CSSProperties, type ReactNode, useMemo, useRef } from 'react';
import { cn } from '~/lib/utils';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  className?: string;
  overscan?: number;
  gap?: number;
  style?: CSSProperties;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  className,
  overscan = 5,
  gap = 0,
  style,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof itemHeight === 'function' ? itemHeight : () => itemHeight,
    overscan,
    gap,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={cn('overflow-auto', className)} style={style}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface VirtualGridProps<T> {
  items: T[];
  columns: number;
  rowHeight: number;
  columnWidth?: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  gap?: number;
  style?: CSSProperties;
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight,
  columnWidth,
  renderItem,
  className,
  overscan = 5,
  gap = 0,
  style,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    gap,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={cn('overflow-auto', className)} style={style}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: columnWidth
                  ? `repeat(${columns}, ${columnWidth}px)`
                  : `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => renderItem(item, startIndex + colIndex))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Piano Roll specific virtualizer
export interface PianoRollNote {
  pitch: number; // MIDI pitch 0-127
  start: number; // Start time in beats
  duration: number; // Duration in beats
  velocity: number; // 0-127
}

export interface VirtualPianoRollProps {
  notes: PianoRollNote[];
  totalKeys?: number;
  keyHeight?: number;
  beatsVisible?: number;
  pixelsPerBeat?: number;
  currentBeat?: number;
  className?: string;
  renderNote?: (note: PianoRollNote, index: number) => ReactNode;
  renderKey?: (pitch: number) => ReactNode;
  onNoteClick?: (note: PianoRollNote, index: number) => void;
}

export function VirtualPianoRoll({
  notes,
  totalKeys = 88,
  keyHeight = 20,
  beatsVisible = 16,
  pixelsPerBeat = 40,
  currentBeat = 0,
  className,
  renderNote,
  renderKey,
  onNoteClick,
}: VirtualPianoRollProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 성능: notes를 pitch별로 미리 인덱싱하여 O(n*k) → O(n+k) 개선
  const notesByPitch = useMemo(() => {
    const map = new Map<number, PianoRollNote[]>();
    for (const note of notes) {
      const existing = map.get(note.pitch);
      if (existing) {
        existing.push(note);
      } else {
        map.set(note.pitch, [note]);
      }
    }
    return map;
  }, [notes]);

  const virtualizer = useVirtualizer({
    count: totalKeys,
    getScrollElement: () => parentRef.current,
    estimateSize: () => keyHeight,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className={cn('overflow-auto', className)} style={{ height: '100%' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: `${beatsVisible * pixelsPerBeat}px`,
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const pitch = totalKeys - 1 - virtualRow.index;
          const rowNotes = notesByPitch.get(pitch) ?? [];

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                borderBottom: '1px solid hsl(var(--border) / 0.3)',
                backgroundColor:
                  pitch % 12 === 1 ||
                  pitch % 12 === 3 ||
                  pitch % 12 === 6 ||
                  pitch % 12 === 8 ||
                  pitch % 12 === 10
                    ? 'hsl(var(--secondary) / 0.3)'
                    : 'transparent',
              }}
            >
              {renderKey ? (
                renderKey(pitch)
              ) : (
                <div
                  style={{
                    width: 60,
                    borderRight: '1px solid hsl(var(--border))',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 4,
                    fontSize: 10,
                  }}
                >
                  {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pitch % 12]}
                  {Math.floor(pitch / 12) - 1}
                </div>
              )}

              <div style={{ position: 'relative', flex: 1 }}>
                {rowNotes.map((note, noteIndex) => {
                  const noteLeft = (note.start - currentBeat) * pixelsPerBeat;
                  const noteWidth = note.duration * pixelsPerBeat;

                  if (noteLeft + noteWidth < 0 || noteLeft > beatsVisible * pixelsPerBeat) {
                    return null;
                  }

                  return renderNote ? (
                    renderNote(note, noteIndex)
                  ) : (
                    <button
                      type="button"
                      key={`${note.pitch}-${note.start}`}
                      onClick={() => onNoteClick?.(note, noteIndex)}
                      style={{
                        position: 'absolute',
                        left: noteLeft,
                        width: noteWidth - 2,
                        height: keyHeight - 2,
                        backgroundColor: `hsl(var(--primary) / ${note.velocity / 127})`,
                        borderRadius: 2,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
