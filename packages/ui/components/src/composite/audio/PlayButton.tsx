// ========================================
// @soundblue/ui-components/composite - PlayButton
// Play/pause button for audio controls
// ========================================

import { memo } from 'react';

// 성능: 아이콘을 별도 컴포넌트로 분리하여 props 변경 시 불필요한 리렌더링 방지
const PlayIcon = memo(function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
    </svg>
  );
});

const PauseIcon = memo(function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
});

export interface PlayButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Play/pause toggle button
 * 성능: React.memo로 불필요한 리렌더링 방지
 */
export const PlayButton = memo(function PlayButton({
  isPlaying,
  onToggle,
  size = 'md',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: PlayButtonProps) {
  const iconSize = iconSizes[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full bg-blue-500 text-white
        hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      aria-label={ariaLabel || (isPlaying ? 'Pause' : 'Play')}
      aria-pressed={isPlaying}
    >
      {isPlaying ? <PauseIcon size={iconSize} /> : <PlayIcon size={iconSize} />}
    </button>
  );
});
