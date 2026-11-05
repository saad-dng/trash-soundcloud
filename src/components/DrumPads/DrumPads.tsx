import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { Drum } from 'lucide-react';
import { TRACK_COLORS } from '../../data/presets';

interface PadDef {
  id: string;
  name: string;
  soundType: string;
  shortcut: string;
  color: string;
}

const DRUM_PADS: PadDef[] = [
  { id: 'kick', name: 'WARM KICK', soundType: 'kick', shortcut: '1', color: TRACK_COLORS.kick },
  { id: 'snare', name: 'MELLOW SNARE', soundType: 'snare', shortcut: '2', color: TRACK_COLORS.snare },
  { id: 'hihat', name: 'CLOSED HAT', soundType: 'hihat', shortcut: '3', color: TRACK_COLORS.hihat },
  { id: 'openhat', name: 'OPEN HAT', soundType: 'openhat', shortcut: '4', color: TRACK_COLORS.openhat },
  { id: 'clap', name: 'HAND CLAP', soundType: 'clap', shortcut: 'Q', color: TRACK_COLORS.zap },
  { id: 'zap', name: 'WARM CHIME', soundType: 'zap', shortcut: 'W', color: TRACK_COLORS.bass },
  { id: 'tom1', name: 'HI TOM', soundType: 'tom', shortcut: 'E', color: TRACK_COLORS.lead },
  { id: 'tom2', name: 'LO TOM', soundType: 'tom', shortcut: 'R', color: TRACK_COLORS.pad },
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
    <div className="w-full bg-[#1b1511] rounded-2xl border border-[#2e241d] p-4 shadow-sm">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Drum className="w-4 h-4 text-[#d99b61]" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-[#f4ece4] uppercase">
            MPC Beat Launchpads
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#a89988]">Velocity:</span>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={padVelocity}
            onChange={(e) => setPadVelocity(parseFloat(e.target.value))}
            className="w-24 accent-[#d99b61]"
          />
          <span className="text-xs font-mono text-[#e8cca7] font-bold w-9 text-right">
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
              className={`h-20 rounded-xl flex flex-col items-center justify-between p-2.5 font-mono transition-all active:scale-95 border select-none ${
                isActive
                  ? 'border-transparent text-[#14100e] scale-95 shadow-sm'
                  : 'bg-[#221a15] hover:bg-[#2b211a] text-[#e8cca7] border-[#332820] hover:border-[#47382d]'
              }`}
              style={{
                backgroundColor: isActive ? pad.color : undefined,
              }}
              title={`Trigger ${pad.name} (Key: ${pad.shortcut})`}
            >
              <div className="w-full flex items-center justify-between">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: pad.color }}
                />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#16110e]/70 text-[#a89988]">
                  {pad.shortcut}
                </span>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                {pad.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
