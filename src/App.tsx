import React, { useEffect, useState } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { PRESETS } from './data/presets';
import { BassParams, FXParams, PadParams, Preset, SynthParams, Track, VisualizerSettings } from './types/synth';
import { Header } from './components/Header/Header';
import { VisualizerCanvas } from './components/Visualizer/VisualizerCanvas';
import { SequencerGrid } from './components/Sequencer/SequencerGrid';
import { VirtualKeyboard } from './components/Keyboard/VirtualKeyboard';
import { DrumPads } from './components/DrumPads/DrumPads';
import { KaossPad } from './components/KaossPad/KaossPad';
import { EffectsRack } from './components/Effects/EffectsRack';
import { SynthEditor } from './components/SynthEditor/SynthEditor';
import { HelpModal } from './components/Modal/HelpModal';
import { generateAlgorithmicTrack } from './utils/algorithmicComposer';
import { audioCtxManager } from './audio/AudioContext';

export function App() {
  const [currentPreset, setCurrentPreset] = useState<Preset>(PRESETS[0]);
  const [tracks, setTracks] = useState<Track[]>(PRESETS[0].tracks);
  const [synthParams, setSynthParams] = useState<SynthParams>(PRESETS[0].synthParams);
  const [bassParams, setBassParams] = useState<BassParams>(PRESETS[0].bassParams);
  const [padParams, setPadParams] = useState<PadParams>(PRESETS[0].padParams);
  const [fxParams, setFxParams] = useState<FXParams>(PRESETS[0].fxParams);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('Mocha Studio Ready');

  const [visualizerSettings, setVisualizerSettings] = useState<VisualizerSettings>({
    mode: 'warm_oscilloscope',
    colorScheme: 'warm_caramel',
    sensitivity: 1.1,
    bloom: false,
    trail: true,
  });

  // Initialize engine with preset on load
  useEffect(() => {
    loadPreset(PRESETS[0]);

    audioEngine.setOnStepCallback((step) => {
      setCurrentStep(step);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPreset = (preset: Preset) => {
    setCurrentPreset(preset);
    setTracks(preset.tracks);
    setSynthParams(preset.synthParams);
    setBassParams(preset.bassParams);
    setPadParams(preset.padParams);
    setFxParams(preset.fxParams);

    audioEngine.setTracks(preset.tracks);
    audioEngine.setBPM(preset.bpm);
    audioEngine.polySynth.updateParams(preset.synthParams);
    audioEngine.acidSynth.updateParams(preset.bassParams);
    audioEngine.padSynth.updateParams(preset.padParams);
    audioEngine.updateFX(preset.fxParams);

    setAnnouncement(`Loaded preset: ${preset.name}`);
  };

  const handlePlayToggle = async () => {
    await audioCtxManager.unlock();
    if (audioEngine.isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setAnnouncement('Playback paused');
    } else {
      audioEngine.setTracks(tracks);
      audioEngine.start();
      setIsPlaying(true);
      setAnnouncement('Playback started');
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(0);
    setAnnouncement('Playback stopped and reset');
  };

  const handleTracksChange = (updatedTracks: Track[]) => {
    setTracks(updatedTracks);
    audioEngine.setTracks(updatedTracks);
  };

  const handleAlgorithmicGenerate = (genre: 'synthwave' | 'techno' | 'ambient' | 'chillhop') => {
    const generated = generateAlgorithmicTrack(genre);
    loadPreset(generated);
    setAnnouncement(`Generated new ${genre} composition`);
  };

  return (
    <div className="min-h-screen bg-[#14100e] text-[#ede0d4] flex flex-col selection:bg-[#d99b61] selection:text-[#14100e]">
      {/* Screen Reader Live Region for Announcements (Modern Web Accessibility) */}
      <div aria-live="polite" aria-atomic="true" className="visually-hidden">
        {announcement}
      </div>

      {/* Header Bar */}
      <Header
        currentPreset={currentPreset}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        onStop={handleStop}
        onPresetSelect={loadPreset}
        onAlgorithmicGenerate={handleAlgorithmicGenerate}
        onOpenHelp={() => setHelpOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Top Hero: Audio Reactive Visualizer */}
        <section aria-label="Audio Visualizer">
          <VisualizerCanvas
            settings={visualizerSettings}
            onSettingsChange={setVisualizerSettings}
          />
        </section>

        {/* 16-Step Multitrack Sequencer */}
        <section aria-label="Sequencer">
          <SequencerGrid
            tracks={tracks}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onTrackChange={handleTracksChange}
          />
        </section>

        {/* Two-Column Middle Section: Controllers & FX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Virtual Piano & Drum Launchpads */}
          <div className="space-y-5">
            <VirtualKeyboard
              rootNote={currentPreset.rootNote}
              scaleMode={currentPreset.scale}
            />
            <DrumPads />
          </div>

          {/* Right Column: X/Y Kaoss Touchpad & Effects Rack */}
          <div className="space-y-5">
            <KaossPad />
            <EffectsRack fxParams={fxParams} onFXChange={setFxParams} />
          </div>
        </div>

        {/* Bottom Section: Synthesizer & Sound Design Architecture */}
        <section aria-label="Sound Design Architecture">
          <SynthEditor
            synthParams={synthParams}
            bassParams={bassParams}
            padParams={padParams}
            onSynthChange={setSynthParams}
            onBassChange={setBassParams}
            onPadChange={setPadParams}
          />
        </section>
      </main>

      {/* Modern Status Footer */}
      <footer className="w-full bg-[#181310] border-t border-[#2e241d] py-3 px-4 text-xs font-mono text-[#9e8c80] mt-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#d99b61]">
              <span className="w-2 h-2 rounded-full bg-[#d99b61] animate-ping" />
              DSP ENGINE: 44.1kHz STEREO
            </span>
            <span className="hidden sm:inline text-[#3a2d24]">|</span>
            <span className="text-[#9e8c80] hidden sm:inline">
              LATENCY: &lt;5ms (PRECISION LOOKAHEAD)
            </span>
            <span className="hidden sm:inline text-[#3a2d24]">|</span>
            <span className="text-[#e8cca7]">
              SCALE: {currentPreset.rootNote} {currentPreset.scale.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#9e8c80]">
              Press <kbd className="px-1.5 py-0.5 bg-[#201915] rounded border border-[#382d24] text-[#ede0d4]">Space</kbd> to Play
            </span>
            <span className="text-[#3a2d24]">•</span>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="text-[#d99b61] hover:text-[#e8cca7] transition-colors underline"
            >
              Shortcuts & Manual
            </button>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default App;
