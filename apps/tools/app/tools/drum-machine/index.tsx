import { useParaglideI18n } from '@soundblue/i18n';
import { useCallback, useState } from 'react';
import { ToolGuide } from '~/components/tools/ToolGuide';
import { useDrumMachine } from '~/hooks/useDrumMachine';
import { getToolGuide } from '~/lib/toolGuides';
import { DrumControls } from './DrumControls';
import { DrumGrid } from './DrumGrid';
import { DrumPresetPanel } from './DrumPresetPanel';
import { DrumSynthPanel } from './DrumSynthPanel';
import {
  type DrumId,
  type DrumMachineSettings,
  defaultDrumMachineSettings,
  type PresetName,
} from './settings';

interface DrumMachineProps {
  settings?: DrumMachineSettings;
  onSettingsChange?: (settings: Partial<DrumMachineSettings>) => void;
}

export function DrumMachine({ settings: propSettings, onSettingsChange }: DrumMachineProps) {
  const { locale } = useParaglideI18n();
  const currentLocale = locale === 'ko' ? 'ko' : 'en';
  const guide = getToolGuide('drumMachine', currentLocale);

  const [showSynth, setShowSynth] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Use Tone.js drum machine hook
  const drumMachine = useDrumMachine({
    initialBpm: propSettings?.bpm ?? defaultDrumMachineSettings.bpm,
    steps: propSettings?.steps ?? defaultDrumMachineSettings.steps,
    volume: propSettings?.volume ?? defaultDrumMachineSettings.volume,
    metronomeEnabled: propSettings?.metronomeEnabled ?? defaultDrumMachineSettings.metronomeEnabled,
    initialPattern: propSettings?.pattern,
    initialSynthParams: propSettings?.synth,
  });

  // Sync settings changes to parent
  const handleBpmChange = useCallback(
    (newBpm: number) => {
      drumMachine.setBpm(newBpm);
      onSettingsChange?.({ bpm: newBpm });
    },
    [drumMachine, onSettingsChange],
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      drumMachine.setVolume(newVolume);
      onSettingsChange?.({ volume: newVolume });
    },
    [drumMachine, onSettingsChange],
  );

  const handleMetronomeToggle = useCallback(() => {
    const newValue = !drumMachine.metronomeEnabled;
    drumMachine.setMetronomeEnabled(newValue);
    onSettingsChange?.({ metronomeEnabled: newValue });
  }, [drumMachine, onSettingsChange]);

  const handleStepChange = useCallback(
    (drumId: DrumId, step: number, value: boolean) => {
      drumMachine.setStep(drumId, step, value);
    },
    [drumMachine],
  );

  const handleClearPattern = useCallback(() => {
    drumMachine.clearPattern();
  }, [drumMachine]);

  const handleLoadPreset = useCallback(
    (presetName: PresetName) => {
      drumMachine.loadPreset(presetName);
      setShowPresets(false);
    },
    [drumMachine],
  );

  const handleSynthParamUpdate = useCallback(
    (drumId: DrumId, param: 'pitch' | 'decay' | 'tone' | 'punch', value: number) => {
      drumMachine.updateSynthParam(drumId, param, value);
    },
    [drumMachine],
  );

  const handleSynthParamReset = useCallback(
    (drumId: DrumId) => {
      drumMachine.resetSynthParams(drumId);
    },
    [drumMachine],
  );

  const handlePreviewSound = useCallback(
    (drumId: DrumId) => {
      drumMachine.previewSound(drumId);
    },
    [drumMachine],
  );

  return (
    <div className="flex h-full flex-col gap-2 p-2 sm:gap-3 sm:p-3">
      {/* Header Controls */}
      <DrumControls
        isPlaying={drumMachine.isPlaying}
        bpm={drumMachine.bpm}
        volume={drumMachine.volume}
        metronomeEnabled={drumMachine.metronomeEnabled}
        onTogglePlay={drumMachine.toggle}
        onClearPattern={handleClearPattern}
        onMetronomeToggle={handleMetronomeToggle}
        onBpmChange={handleBpmChange}
        onVolumeChange={handleVolumeChange}
      />

      {/* Pattern Grid */}
      <div className="-mx-2 min-h-0 flex-1 select-none overflow-x-auto overflow-y-hidden px-2">
        <DrumGrid
          pattern={drumMachine.pattern as Record<DrumId, boolean[]>}
          steps={drumMachine.steps}
          currentStep={drumMachine.currentStep}
          isPlaying={drumMachine.isPlaying}
          onStepToggle={handleStepChange}
          className="rounded-lg"
        />
      </div>

      {/* Preset Panel */}
      <DrumPresetPanel
        isOpen={showPresets}
        onToggle={() => setShowPresets(!showPresets)}
        onLoadPreset={handleLoadPreset}
      />

      {/* Synth Panel */}
      <DrumSynthPanel
        isOpen={showSynth}
        onToggle={() => setShowSynth(!showSynth)}
        getSynthParams={drumMachine.getSynthParams}
        onParamUpdate={handleSynthParamUpdate}
        onParamReset={handleSynthParamReset}
        onPreviewSound={handlePreviewSound}
      />

      {/* Tool Guide */}
      <ToolGuide title={guide.title} sections={guide.sections} />
    </div>
  );
}

export { type DrumId, type DrumMachineSettings, defaultDrumMachineSettings } from './settings';
