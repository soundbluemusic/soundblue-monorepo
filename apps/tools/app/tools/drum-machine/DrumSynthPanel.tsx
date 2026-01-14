import { ChevronDown, Play, RotateCcw, Volume2 } from 'lucide-react';
import { memo } from 'react';
import { Slider } from '~/components/ui/slider';
import { useAutoAnimate } from '~/hooks/useAutoAnimate';
import { cn } from '~/lib/utils';
import { DRUM_SOUNDS, type DrumId, type DrumSynthParams } from './settings';

interface DrumSynthPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  getSynthParams: (drumId: DrumId) => DrumSynthParams;
  onParamUpdate: (drumId: DrumId, param: keyof DrumSynthParams, value: number) => void;
  onParamReset: (drumId: DrumId) => void;
  onPreviewSound: (drumId: DrumId) => void;
}

export const DrumSynthPanel = memo(function DrumSynthPanel({
  isOpen,
  onToggle,
  getSynthParams,
  onParamUpdate,
  onParamReset,
  onPreviewSound,
}: DrumSynthPanelProps) {
  const [synthRef] = useAutoAnimate<HTMLDivElement>({ duration: 200 });

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
        <Volume2 className="h-4 w-4" />
        <span>Drum Synth</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <div ref={synthRef}>
        {isOpen && (
          <div className="max-h-64 space-y-3 overflow-auto border-t bg-muted/30 p-3">
            {DRUM_SOUNDS.map((drum) => {
              const params = getSynthParams(drum.id);
              return (
                <DrumSynthCard
                  key={drum.id}
                  drum={drum}
                  params={params}
                  onParamUpdate={onParamUpdate}
                  onParamReset={onParamReset}
                  onPreviewSound={onPreviewSound}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
});

interface DrumSynthCardProps {
  drum: (typeof DRUM_SOUNDS)[number];
  params: DrumSynthParams;
  onParamUpdate: (drumId: DrumId, param: keyof DrumSynthParams, value: number) => void;
  onParamReset: (drumId: DrumId) => void;
  onPreviewSound: (drumId: DrumId) => void;
}

const DrumSynthCard = memo(function DrumSynthCard({
  drum,
  params,
  onParamUpdate,
  onParamReset,
  onPreviewSound,
}: DrumSynthCardProps) {
  const getPitchRange = () => {
    if (drum.id === 'kick') return { min: 20, max: 150 };
    if (drum.id === 'hihat' || drum.id === 'openhat') return { min: 4000, max: 12000 };
    return { min: 80, max: 800 };
  };

  const pitchRange = getPitchRange();

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{drum.icon}</span>
          <span className="text-sm font-medium">{drum.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPreviewSound(drum.id)}
            className="inline-flex h-7 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Play className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => onParamReset(drum.id)}
            className="inline-flex h-7 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Pitch</span>
            <span className="font-mono text-xs">{params.pitch}Hz</span>
          </div>
          <Slider
            value={[params.pitch]}
            onValueChange={([v]) => onParamUpdate(drum.id, 'pitch', v ?? pitchRange.min)}
            min={pitchRange.min}
            max={pitchRange.max}
            step={1}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Decay</span>
            <span className="font-mono text-xs">{(params.decay * 1000).toFixed(0)}ms</span>
          </div>
          <Slider
            value={[params.decay * 1000]}
            onValueChange={([v]) => onParamUpdate(drum.id, 'decay', (v ?? 100) / 1000)}
            min={10}
            max={drum.id === 'kick' ? 1000 : 500}
            step={1}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tone</span>
            <span className="font-mono text-xs">{params.tone}%</span>
          </div>
          <Slider
            value={[params.tone]}
            onValueChange={([v]) => onParamUpdate(drum.id, 'tone', v ?? 50)}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Punch</span>
            <span className="font-mono text-xs">{params.punch}%</span>
          </div>
          <Slider
            value={[params.punch]}
            onValueChange={([v]) => onParamUpdate(drum.id, 'punch', v ?? 50)}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
});
