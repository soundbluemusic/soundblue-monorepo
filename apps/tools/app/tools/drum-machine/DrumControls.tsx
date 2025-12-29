import { Pause, Play, RotateCcw, Timer, Volume2 } from 'lucide-react';
import { Slider } from '~/components/ui/slider';
import m from '~/lib/messages';
import { cn } from '~/lib/utils';

interface DrumControlsProps {
  isPlaying: boolean;
  bpm: number;
  volume: number;
  metronomeEnabled: boolean;
  onTogglePlay: () => void;
  onClearPattern: () => void;
  onMetronomeToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function DrumControls({
  isPlaying,
  bpm,
  volume,
  metronomeEnabled,
  onTogglePlay,
  onClearPattern,
  onMetronomeToggle,
  onBpmChange,
  onVolumeChange,
}: DrumControlsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isPlaying
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClearPattern}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMetronomeToggle}
            title={m['drumMachine.metronome']?.()}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              metronomeEnabled
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Timer className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">BPM</span>
          <input
            type="number"
            value={bpm}
            onChange={(e) =>
              onBpmChange(
                Math.max(40, Math.min(300, Number.parseInt(e.currentTarget.value, 10) || 120)),
              )
            }
            className="w-14 rounded border bg-background px-1.5 py-1 text-center text-sm transition-colors hover:bg-black/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-white/12"
          />
        </div>
      </div>
      <div className="hidden items-center gap-3 sm:flex">
        <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          onValueChange={([v]) => onVolumeChange((v ?? 0) / 100)}
          max={100}
          className="w-24"
        />
      </div>
    </div>
  );
}
