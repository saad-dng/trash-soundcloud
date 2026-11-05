import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { Drum, Radio, Sparkles } from 'lucide-react';

interface PadDef {
  id: string;
  name: string;
  soundType: string;
  shortcut: string;
  color: string;
}

const DRUM_PADS: PadDef[] = [
  { id: 'kick', name: '808 KICK', soundType: 'kick', shortcut: '1', color: '#ff0055' },
  { id: 'snare', name: 'CRUNCH SNARE', soundType: 'snare', shortcut: '2', color: '#ff7700' },
  { id: 'hihat', name: 'CLOSED HAT', soundType: 'hihat', shortcut: '3', color: '#ffea00' },
  { id: 'openhat', name: 'OPEN HAT', soundType: 'openhat', shortcut: '4', color: '#ffc400' },
  { id: 'clap', name: 'HAND CLAP', soundType: 'clap', shortcut: 'Q', color: '#00ffa6' },
  { id: 'zap', name: 'CYBER ZAP', soundType: 'zap', shortcut: 'W', color: '#00f0ff' },
  { id: 'tom1', name: 'HI TOM', soundType: 'tom', shortcut: 'E', color: '#bf00ff' },
  { id: 'tom2', name: 'LO TOM', soundType: 'tom', shortcut: 'R', color: '#7b2cbf' },
];

export const DrumPads: React.FC = () => {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [padVelocity, setPadVelocity] = useState<number>(0.9);

  const triggerPad = (pad: PadDef) => {
    setActivePad(pad.id);
    audioEngine.drumSynth.triggerSound(pad.soundType, audioEngine.ctx.currentTime, padVelocity);
    setTimeout(() => {
      setActivePad((cur) => (cur === pad.id ? null : cur));
    }, 120);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const key = e.key.toUpperCase();
      const matched = DRUM_PADS.find((p) => p.shortcut === key);
      if (matched) {
        triggerPad(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [padVelocity]);

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Drum className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
            MPC Beat Launchpads
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Pad Velocity:</span>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={padVelocity}
            onChange={(e) => setPadVelocity(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
          <span className="text-xs font-mono text-cyan-300 font-bold w-9 text-right">
            {Math.round(padVelocity * 100)}%
          </span>
        </div>
      </div>

      {/* 8 Drum Pads Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
        {DRUM_PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              onPointerDown={() => triggerPad(pad)}
              className={`h-20 rounded-xl flex flex-col items-center justify-between p-2.5 font-mono transition-all active:scale-90 border select-none ${
                isActive
                  ? 'border-transparent text-slate-950 scale-95 shadow-xl'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
              style={{
                backgroundColor: isActive ? pad.color : undefined,
                boxShadow: isActive ? `0 0 20px ${pad.color}` : undefined,
              }}
              title={`Trigger ${pad.name} (Key: ${pad.shortcut})`}
            >
              <div className="w-full flex items-center justify-between">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: pad.color }}
                />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-300">
                  {pad.shortcut}
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-center leading-tight truncate w-full">
                {pad.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
