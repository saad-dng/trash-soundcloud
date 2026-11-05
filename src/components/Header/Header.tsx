import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { PRESETS } from '../../data/presets';
import { Preset } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import confetti from 'canvas-confetti';
import {
  Circle,
  Coffee,
  HelpCircle,
  Pause,
  Play,
  Sparkles,
  Square,
} from 'lucide-react';

interface HeaderProps {
  currentPreset: Preset;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStop: () => void;
  onPresetSelect: (preset: Preset) => void;
  onAlgorithmicGenerate: (genre: 'synthwave' | 'techno' | 'ambient' | 'chillhop') => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  isPlaying,
  onPlayToggle,
  onStop,
  onPresetSelect,
  onAlgorithmicGenerate,
  onOpenHelp,
}) => {
  const [bpm, setBpm] = useState(currentPreset.bpm);
  const [swing, setSwing] = useState(0.5);
  const [volume, setVolume] = useState(0.85);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordIntervalRef = useRef<number | null>(null);

  // Sync BPM when preset changes
  useEffect(() => {
    setBpm(currentPreset.bpm);
    audioEngine.setBPM(currentPreset.bpm);
  }, [currentPreset.bpm]);

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    audioEngine.setBPM(newBpm);
  };

  const handleSwingChange = (newSwing: number) => {
    setSwing(newSwing);
    audioEngine.setSwing(newSwing);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setMasterVolume(newVol);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      const wavBlob = await audioEngine.toggleRecording();
      setIsRecording(false);
      setRecordingSeconds(0);

      if (wavBlob) {
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MOCHA_${currentPreset.name.replace(/\s+/g, '_')}_${Date.now()}.wav`;
        a.click();
      }
    } else {
      await audioEngine.toggleRecording();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const triggerGenerativeWithConfetti = (genre: 'synthwave' | 'techno' | 'ambient' | 'chillhop') => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.15 },
        colors: ['#d99b61', '#e8cca7', '#b85d43', '#deb887'],
      });
    } catch {
      // ignore
    }
    onAlgorithmicGenerate(genre);
  };

  const formatRecordTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full bg-[#181310]/95 border-b border-[#2d241d] backdrop-blur-md px-4 py-3 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#241c16] border border-[#3d3127] shadow-inner text-[#d99b61]">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-wider text-[#f4ece4] font-mono">
                MOCHA <span className="text-[#d99b61] font-light">//</span> HYPERWAVE
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#271f19] border border-[#3e3227] text-[#e8cca7] font-medium tracking-wide">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#a89988] hidden sm:block">
              Warm Algorithmic Synthesizer & Audio-Visual Studio
            </p>
          </div>
        </div>

        {/* Center: Transport Controls (Play, Stop, BPM, Swing, Master) */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#201915] border border-[#332921] p-1.5 rounded-2xl shadow-inner">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onPlayToggle}
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-[#e8cca7] text-[#1a130f] hover:bg-[#edd8be]'
                : 'bg-[#d99b61] text-[#14100e] hover:bg-[#e2aa75]'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title="Toggle Play / Pause (Spacebar)"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Stop */}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#292019] hover:bg-[#332820] text-[#e8cca7] transition-colors border border-[#382d24]"
            aria-label="Stop Playback"
            title="Stop Playback and Reset to Step 1"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* BPM Knob */}
          <Knob
            label="TEMPO"
            value={bpm}
            min={50}
            max={200}
            step={1}
            unit=" BPM"
            color="#d99b61"
            defaultValue={84}
            size={46}
            onChange={handleBpmChange}
          />

          {/* Swing Knob */}
          <Knob
            label="SWING"
            value={Math.round((swing - 0.5) * 200)}
            min={0}
            max={50}
            step={1}
            unit="%"
            color="#e8cca7"
            defaultValue={0}
            size={46}
            onChange={(val) => handleSwingChange(0.5 + val / 200)}
          />

          {/* Master Volume */}
          <Knob
            label="MASTER"
            value={Math.round(volume * 100)}
            min={0}
            max={100}
            step={1}
            unit="%"
            color="#d99b61"
            defaultValue={85}
            size={46}
            onChange={(val) => handleVolumeChange(val / 100)}
          />
        </div>

        {/* Right: Presets, Surprise Me, Record & Help */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex flex-col">
            <label htmlFor="preset-select" className="text-[9px] font-mono uppercase tracking-wider text-[#a89988]">
              Preset Session
            </label>
            <select
              id="preset-select"
              value={currentPreset.id}
              onChange={(e) => {
                const found = PRESETS.find((p) => p.id === e.target.value);
                if (found) onPresetSelect(found);
              }}
              className="bg-[#201915] border border-[#382d24] text-[#e8cca7] text-xs font-mono rounded-lg px-2.5 py-1.5 hover:border-[#d99b61]/60 focus:outline-none focus:border-[#d99b61]"
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.genre})
                </option>
              ))}
            </select>
          </div>

          {/* Algorithmic "Surprise Me" Dropdown / Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => triggerGenerativeWithConfetti('chillhop')}
              className="flex items-center gap-1.5 bg-[#d99b61] hover:bg-[#e2aa75] text-[#14100e] font-mono text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition-all active:scale-95"
              title="Procedurally generate a complete cozy track"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>SURPRISE ME</span>
            </button>

            {/* Quick genre selector dropdown on hover */}
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-[#201915] border border-[#382d24] rounded-xl p-1 shadow-xl z-50 min-w-[150px] text-xs font-mono">
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('chillhop')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-[#2c221b] text-[#f4ece4]"
              >
                ☕ Lo-Fi Chillhop
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('ambient')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-[#2c221b] text-[#f4ece4]"
              >
                🌧️ Autumn Rain & Tea
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('synthwave')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-[#2c221b] text-[#f4ece4]"
              >
                📻 Vintage Tape Grooves
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('techno')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-[#2c221b] text-[#f4ece4]"
              >
                🔥 Midnight Roast 303
              </button>
            </div>
          </div>

          {/* Live WAV Record */}
          <button
            type="button"
            onClick={handleToggleRecord}
            className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
              isRecording
                ? 'bg-[#b85d43]/30 border-[#b85d43] text-[#f4ece4] shadow-sm animate-pulse'
                : 'bg-[#201915] border-[#382d24] text-[#e8cca7] hover:border-[#b85d43]/60'
            }`}
            title="Record master output to uncompressed WAV file"
          >
            <Circle className={`w-3 h-3 ${isRecording ? 'fill-[#b85d43] text-[#b85d43]' : 'fill-[#8c7868] text-[#8c7868]'}`} />
            <span>{isRecording ? `REC ${formatRecordTime(recordingSeconds)}` : 'REC WAV'}</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#201915] hover:bg-[#2c221b] text-[#a89988] hover:text-[#e8cca7] border border-[#382d24] transition-colors"
            aria-label="Help and Keyboard Shortcuts"
            title="Keyboard Shortcuts & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
