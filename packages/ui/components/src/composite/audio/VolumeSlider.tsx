// ========================================
// @soundblue/ui-components/composite - VolumeSlider
// Volume control slider
// ========================================

import { useCallback } from 'react';

export interface VolumeSliderProps {
  value: number; // 0-1
  onChange: (value: number) => void;
  muted?: boolean;
  onMuteToggle?: () => void;
  className?: string;
}

/**
 * Volume slider with mute button
 */
export function VolumeSlider({
  value,
  onChange,
  muted = false,
  onMuteToggle,
  className = '',
}: VolumeSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number.parseFloat(e.target.value));
    },
    [onChange],
  );

  const displayValue = muted ? 0 : value;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onMuteToggle && (
        <button
          type="button"
          onClick={onMuteToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          {muted || value === 0 ? (
            // Muted icon
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          ) : value < 0.5 ? (
            // Low volume icon
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
            </svg>
          ) : (
            // High volume icon
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      )}

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={displayValue}
        onChange={handleChange}
        className="
          w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-blue-500
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:bg-blue-500
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer
        "
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayValue * 100)}
      />

      <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
        {Math.round(displayValue * 100)}%
      </span>
    </div>
  );
}
