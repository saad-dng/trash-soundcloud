import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { audioCtxManager } from '../../audio/AudioContext';
import { PRESETS } from '../../data/presets';
import { Preset } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import confetti from 'canvas-confetti';
import {
  Circle,
  Download,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
  Wand2,
  Zap,
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
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
      // Stop recording and get WAV Blob
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      const wavBlob = await audioEngine.toggleRecording();
      setIsRecording(false);
      setRecordingSeconds(0);

      if (wavBlob) {
        const url = URL.createObjectURL(wavBlob);
        setDownloadUrl(url);

        // Auto trigger download prompt
        const a = document.createElement('a');
        a.href = url;
        a.download = `HYPERWAVE_${currentPreset.name.replace(/\s+/g, '_')}_${Date.now()}.wav`;
        a.click();
      }
    } else {
      // Start recording
      setDownloadUrl(null);
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
        particleCount: 65,
        spread: 70,
        origin: { y: 0.15 },
        colors: ['#00f0ff', '#ff0055', '#bf00ff', '#00ffa6'],
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
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/30 backdrop-blur-xl px-4 py-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-600 p-[1.5px] shadow-[0_0_18px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-500 font-mono">
                HYPERWAVE
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider">
                STUDIO v2.0
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Algorithmic Modular DAW & Audio-Reactive Visual Sandbox
            </p>
          </div>
        </div>

        {/* Center: Transport Controls (Play, Stop, BPM, Swing) */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={onPlayToggle}
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
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
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
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
            color="#00f0ff"
            defaultValue={124}
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
            color="#ff0055"
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
            color="#00ffa6"
            defaultValue={85}
            size={46}
            onChange={(val) => handleVolumeChange(val / 100)}
          />
        </div>

        {/* Right: Presets, AI Generate, Record & Help */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <div className="flex flex-col">
            <label htmlFor="preset-select" className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
              Demo Preset
            </label>
            <select
              id="preset-select"
              value={currentPreset.id}
              onChange={(e) => {
                const found = PRESETS.find((p) => p.id === e.target.value);
                if (found) onPresetSelect(found);
              }}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono rounded-lg px-2.5 py-1.5 hover:border-cyan-500/50 focus:outline-none focus:border-cyan-400"
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
              onClick={() => triggerGenerativeWithConfetti('synthwave')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-mono text-xs font-bold px-3 py-2 rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.35)] transition-all active:scale-95"
              title="Procedurally generate a complete track"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>SURPRISE ME</span>
            </button>

            {/* Quick genre selector dropdown on hover */}
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-fuchsia-500/40 rounded-xl p-1 shadow-2xl z-50 min-w-[140px] text-xs font-mono">
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('synthwave')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-600/30 text-fuchsia-200"
              >
                ⚡ Synthwave 80s
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('techno')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-600/30 text-fuchsia-200"
              >
                🔥 Acid 303 Techno
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('chillhop')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-600/30 text-fuchsia-200"
              >
                ☕ Lo-Fi Chillhop
              </button>
              <button
                type="button"
                onClick={() => triggerGenerativeWithConfetti('ambient')}
                className="text-left px-2.5 py-1.5 rounded hover:bg-fuchsia-600/30 text-fuchsia-200"
              >
                🌌 Deep Space Ambient
              </button>
            </div>
          </div>

          {/* Live WAV Record */}
          <button
            type="button"
            onClick={handleToggleRecord}
            className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
              isRecording
                ? 'bg-red-600/30 border-red-500 text-red-200 shadow-[0_0_18px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-red-400'
            }`}
            title="Record master output to uncompressed WAV file"
          >
            <Circle className={`w-3 h-3 ${isRecording ? 'fill-red-500 text-red-500' : 'fill-slate-400 text-slate-400'}`} />
            <span>{isRecording ? `REC ${formatRecordTime(recordingSeconds)}` : 'REC WAV'}</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
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
