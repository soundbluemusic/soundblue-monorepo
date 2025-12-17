import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { cn } from '~/lib/utils';

interface VUMeterProps {
  level: number; // 0-1
  peak?: number; // 0-1
  vertical?: boolean;
  showDb?: boolean;
  class?: string;
}

/**
 * VU Meter visualization
 * Displays audio level with peak hold
 */
export function VUMeter(props: VUMeterProps) {
  const [peakHold, setPeakHold] = createSignal(0);
  let peakTimeout: ReturnType<typeof setTimeout> | null = null;

  const vertical = () => props.vertical ?? false;
  const showDb = () => props.showDb ?? false;

  // Update peak hold
  createEffect(() => {
    const level = props.level;
    const peak = props.peak;

    if (peak !== undefined) {
      setPeakHold(peak);
    } else if (level > peakHold()) {
      setPeakHold(level);

      // Reset peak after 1.5s
      if (peakTimeout) {
        clearTimeout(peakTimeout);
      }
      peakTimeout = setTimeout(() => {
        setPeakHold(0);
      }, 1500);
    }
  });

  onCleanup(() => {
    if (peakTimeout) {
      clearTimeout(peakTimeout);
    }
  });

  const levelDb = () => (props.level > 0 ? 20 * Math.log10(props.level) : -60);
  const levelPercent = () => Math.min(100, Math.max(0, props.level * 100));
  const peakPercent = () => Math.min(100, Math.max(0, peakHold() * 100));

  // Determine color based on level
  const getColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500 dark:bg-red-400';
    if (percent > 70) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-green-500 dark:bg-green-400';
  };

  return (
    <Show
      when={vertical()}
      fallback={
        <div class={cn('flex items-center gap-2', props.class)}>
          <div class="relative h-4 flex-1 rounded bg-muted">
            {/* Level */}
            <div
              class={cn(
                'absolute bottom-0 left-0 top-0 rounded transition-all',
                getColor(levelPercent())
              )}
              style={{ width: `${levelPercent()}%` }}
            />
            {/* Peak indicator */}
            <Show when={peakHold() > 0}>
              <div
                class="absolute top-0 bottom-0 w-0.5 bg-red-500 dark:bg-red-400 transition-all"
                style={{ left: `${peakPercent()}%` }}
              />
            </Show>
          </div>
          <Show when={showDb()}>
            <span class="w-12 text-xs font-mono tabular-nums text-muted-foreground">
              {levelDb() > -60 ? levelDb().toFixed(1) : '-∞'} dB
            </span>
          </Show>
        </div>
      }
    >
      <div class={cn('flex flex-col items-center gap-1', props.class)}>
        <div class="relative h-32 w-4 rounded bg-muted">
          {/* Level */}
          <div
            class={cn(
              'absolute bottom-0 left-0 right-0 rounded transition-all',
              getColor(levelPercent())
            )}
            style={{ height: `${levelPercent()}%` }}
          />
          {/* Peak indicator */}
          <Show when={peakHold() > 0}>
            <div
              class="absolute left-0 right-0 h-0.5 bg-red-500 dark:bg-red-400 transition-all"
              style={{ bottom: `${peakPercent()}%` }}
            />
          </Show>
          {/* Scale markers */}
          <div class="absolute -right-4 top-0 text-[8px] text-muted-foreground">0</div>
          <div class="absolute -right-6 top-1/4 text-[8px] text-muted-foreground">-6</div>
          <div class="absolute -right-8 top-1/2 text-[8px] text-muted-foreground">-12</div>
          <div class="absolute -right-8 bottom-0 text-[8px] text-muted-foreground">-60</div>
        </div>
        <Show when={showDb()}>
          <span class="text-xs font-mono tabular-nums text-muted-foreground">
            {levelDb() > -60 ? levelDb().toFixed(1) : '-∞'} dB
          </span>
        </Show>
      </div>
    </Show>
  );
}

/**
 * Stereo VU Meter
 * Displays left and right channel levels
 */
export function StereoVUMeter(props: {
  leftLevel: number;
  rightLevel: number;
  leftPeak?: number;
  rightPeak?: number;
  vertical?: boolean;
  showDb?: boolean;
  class?: string;
}) {
  const vertical = () => props.vertical ?? false;
  const showDb = () => props.showDb ?? false;

  return (
    <Show
      when={vertical()}
      fallback={
        <div class={cn('flex flex-col gap-1', props.class)}>
          <div class="flex items-center gap-1">
            <span class="w-4 text-[10px] text-muted-foreground">L</span>
            <VUMeter
              level={props.leftLevel}
              peak={props.leftPeak}
              showDb={showDb()}
              class="flex-1"
            />
          </div>
          <div class="flex items-center gap-1">
            <span class="w-4 text-[10px] text-muted-foreground">R</span>
            <VUMeter
              level={props.rightLevel}
              peak={props.rightPeak}
              showDb={showDb()}
              class="flex-1"
            />
          </div>
        </div>
      }
    >
      <div class={cn('flex gap-1', props.class)}>
        <VUMeter level={props.leftLevel} peak={props.leftPeak} vertical showDb={showDb()} />
        <VUMeter level={props.rightLevel} peak={props.rightPeak} vertical showDb={showDb()} />
      </div>
    </Show>
  );
}
