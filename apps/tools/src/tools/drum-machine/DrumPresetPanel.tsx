import { ChevronDown, Music } from 'lucide-react';
import { memo } from 'react';
import { useAutoAnimate } from '~/hooks/useAutoAnimate';
import { cn } from '~/lib/utils';
import { PRESET_PATTERNS, type PresetName } from './settings';

interface DrumPresetPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onLoadPreset: (presetName: PresetName) => void;
}

export const DrumPresetPanel = memo(function DrumPresetPanel({
  isOpen,
  onToggle,
  onLoadPreset,
}: DrumPresetPanelProps) {
  const [presetsRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-center gap-2 border-t py-2',
          'text-sm text-muted-foreground transition-colors hover:text-foreground',
        )}
      >
        <Music className="h-4 w-4" />
        <span>Presets</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <div ref={presetsRef}>
        {isOpen && (
          <div className="flex flex-wrap gap-2 border-t bg-muted/30 p-3">
            {(Object.keys(PRESET_PATTERNS) as PresetName[]).map((presetName) => {
              const preset = PRESET_PATTERNS[presetName];
              return (
                <button
                  key={presetName}
                  type="button"
                  onClick={() => onLoadPreset(presetName)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
});
