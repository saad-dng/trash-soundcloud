import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { ScaleMode } from '../../types/synth';
import { NOTE_NAMES, getScaleNotes } from '../../utils/musicTheory';
import { Keyboard as KeyboardIcon, ShieldCheck } from 'lucide-react';

interface VirtualKeyboardProps {
  rootNote: string;
  scaleMode: ScaleMode;
}

interface KeyDef {
  note: string;
  octave: number;
  isBlack: boolean;
  keyLabel?: string;
}

// Computer keyboard mappings for 2 octaves
const KEY_MAP: Record<string, string> = {
  // Lower octave (C3 - B3)
  a: 'C',
  w: 'C#',
  s: 'D',
  e: 'D#',
  d: 'E',
  f: 'F',
  t: 'F#',
  g: 'G',
  y: 'G#',
  h: 'A',
  u: 'A#',
  j: 'B',
  // Upper octave (C4 - E4)
  k: 'C_UP',
  o: 'C#_UP',
  l: 'D_UP',
  p: 'D#_UP',
  ';': 'E_UP',
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ rootNote, scaleMode }) => {
  const [baseOctave, setBaseOctave] = useState<number>(3);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [scaleLock, setScaleLock] = useState<boolean>(true);

  // Generate valid scale notes in the current octave range
  const scaleNotes = getScaleNotes(rootNote, scaleMode, baseOctave, 2);

  // Build key definitions for 2 octaves (24 semitones)
  const keys: KeyDef[] = [];
  const keyChars = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];

  let charIdx = 0;
  for (let oct = baseOctave; oct <= baseOctave + 1; oct++) {
    for (let n = 0; n < 12; n++) {
      const noteName = NOTE_NAMES[n];
      const isBlack = noteName.includes('#');
      const fullNote = `${noteName}${oct}`;
      const char = charIdx < keyChars.length ? keyChars[charIdx] : undefined;
      charIdx++;

      keys.push({
        note: fullNote,
        octave: oct,
        isBlack,
        keyLabel: char?.toUpperCase(),
      });
    }
  }

  // Handle note trigger
  const playNote = (note: string) => {
    setActiveNotes((prev) => new Set(prev).add(note));
    audioEngine.polySynth.noteOn(note, 0.85);
  };

  const stopNote = (note: string) => {
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    audioEngine.polySynth.stopAll();
  };

  // Computer keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.repeat) return;

      const key = e.key.toLowerCase();
      const mapped = KEY_MAP[key];
      if (!mapped) return;

      let targetNote = '';
      if (mapped.endsWith('_UP')) {
        targetNote = `${mapped.replace('_UP', '')}${baseOctave + 1}`;
      } else {
        targetNote = `${mapped}${baseOctave}`;
      }

      if (scaleLock && !scaleNotes.includes(targetNote)) return;

      playNote(targetNote);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = KEY_MAP[key];
      if (!mapped) return;

      let targetNote = '';
      if (mapped.endsWith('_UP')) {
        targetNote = `${mapped.replace('_UP', '')}${baseOctave + 1}`;
      } else {
        targetNote = `${mapped}${baseOctave}`;
      }

      stopNote(targetNote);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [baseOctave, scaleLock, scaleNotes]);

  return (
    <div className="w-full bg-[#1b1511] rounded-2xl border border-[#2e241d] p-4 shadow-sm">
      {/* Keyboard Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#2e241d] pb-2 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <KeyboardIcon className="w-4 h-4 text-[#d99b61]" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-[#f4ece4] uppercase">
            Polyphonic Piano Keyboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Scale Lock Toggle */}
          <button
            type="button"
            onClick={() => setScaleLock(!scaleLock)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
              scaleLock
                ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] shadow-sm'
                : 'bg-[#241c16] text-[#a89988] border-[#382d24]'
            }`}
            title="Lock keys to current musical scale so you never hit a wrong note"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SCALE LOCK ({scaleMode.replace('_', ' ').toUpperCase()})</span>
          </button>

          {/* Octave Shift */}
          <div className="flex items-center gap-1 bg-[#201915] border border-[#332820] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setBaseOctave(Math.max(1, baseOctave - 1))}
              className="px-2 py-0.5 rounded text-xs font-mono text-[#a89988] hover:text-[#f4ece4]"
            >
              -1 Oct
            </button>
            <span className="text-xs font-mono text-[#e8cca7] font-bold px-1.5">
              C{baseOctave}
            </span>
            <button
              type="button"
              onClick={() => setBaseOctave(Math.min(5, baseOctave + 1))}
              className="px-2 py-0.5 rounded text-xs font-mono text-[#a89988] hover:text-[#f4ece4]"
            >
              +1 Oct
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Keys Layout */}
      <div className="relative flex justify-center h-32 md:h-36 select-none overflow-x-auto pb-1">
        <div className="relative flex">
          {keys.map((k) => {
            const inScale = scaleNotes.includes(k.note);
            const isActive = activeNotes.has(k.note);

            if (k.isBlack) {
              return (
                <button
                  key={k.note}
                  type="button"
                  onPointerDown={() => playNote(k.note)}
                  onPointerUp={() => stopNote(k.note)}
                  onPointerLeave={() => stopNote(k.note)}
                  disabled={scaleLock && !inScale}
                  className={`absolute z-10 w-7 md:w-8 h-20 md:h-22 rounded-b-md flex flex-col justify-end items-center pb-2 text-[10px] font-mono font-bold transition-all border ${
                    isActive
                      ? 'bg-[#d99b61] border-[#c4874e] text-[#14100e] shadow-sm'
                      : inScale
                      ? 'bg-[#241c16] text-[#e8cca7] border-[#382d24] hover:bg-[#2d231c]'
                      : scaleLock
                      ? 'bg-[#19130f] border-[#221a14] text-[#42362e] cursor-not-allowed opacity-35'
                      : 'bg-[#201915] text-[#8c7868] border-[#332820]'
                  }`}
                  style={{
                    left: `${getBlackKeyOffset(k.note, baseOctave)}px`,
                  }}
                  title={`${k.note} (${k.keyLabel || ''})`}
                >
                  <span className="text-[9px] opacity-75">{k.keyLabel}</span>
                </button>
              );
            }

            return (
              <button
                key={k.note}
                type="button"
                onPointerDown={() => playNote(k.note)}
                onPointerUp={() => stopNote(k.note)}
                onPointerLeave={() => stopNote(k.note)}
                disabled={scaleLock && !inScale}
                className={`w-10 md:w-11 h-full rounded-b-lg flex flex-col justify-end items-center pb-2 text-xs font-mono font-bold transition-all border ${
                  isActive
                    ? 'bg-[#d99b61] border-[#c4874e] text-[#14100e] shadow-sm'
                    : inScale
                    ? 'bg-[#ede0d4] text-[#241c16] border-[#d8c7b4] hover:bg-[#f5ece1] shadow-sm'
                    : scaleLock
                    ? 'bg-[#201915] border-[#2b221b] text-[#59493e] cursor-not-allowed opacity-40'
                    : 'bg-[#2c231c] text-[#a89988] border-[#382d24]'
                }`}
                title={`${k.note} (${k.keyLabel || ''})`}
              >
                <span className="text-[9px] text-[#6e5d50] font-normal leading-none">
                  {k.keyLabel}
                </span>
                <span className="text-[10px] leading-tight font-extrabold">{k.note}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper to compute black key pixel offset relative to white keys
function getBlackKeyOffset(note: string, baseOctave: number): number {
  const whiteKeyWidth = 44; // px
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 0;

  const noteName = match[1];
  const oct = parseInt(match[2], 10);
  const octDiff = oct - baseOctave;
  const octOffset = octDiff * 7 * whiteKeyWidth;

  const offsets: Record<string, number> = {
    'C#': 30,
    'D#': 74,
    'F#': 162,
    'G#': 206,
    'A#': 250,
  };

  return octOffset + (offsets[noteName] || 0);
}
