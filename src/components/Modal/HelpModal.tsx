import React from 'react';
import { HelpCircle, Keyboard, Sparkles, Wand2, X, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider">
              HYPERWAVE STUDIO // Operational Manual & Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs font-mono text-slate-300">
          {/* Quickstart */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
            <h3 className="text-cyan-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Quickstart Guide
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Press the <strong className="text-cyan-300">Play button</strong> or hit <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">Space</kbd> to start the sequencer. Switch presets via the top menu to audition different electronic genres, or click <strong className="text-fuchsia-400">SURPRISE ME</strong> to procedurally synthesize brand new tracks using Euclidean algorithms and music theory.
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <h3 className="text-cyan-400 font-bold flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Global Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Play / Pause</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded text-cyan-300 font-bold">Space</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Finger Drumming</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded text-cyan-300 font-bold">1-4, Q, W, E, R</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Play White Piano Keys</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded text-cyan-300 font-bold">A, S, D, F, G, H, J, K, L</kbd>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400">Play Black Piano Keys</span>
                <kbd className="px-2 py-0.5 bg-slate-800 rounded text-cyan-300 font-bold">W, E, T, Y, U, O, P</kbd>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <h3 className="text-cyan-400 font-bold flex items-center gap-2">
              <Wand2 className="w-4 h-4" /> Advanced Features
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-200">X/Y Kaoss Touchpad:</strong> Drag across the glowing neon pad to sweep cutoff frequency (X) and ping-pong delay / resonance (Y) in real time.
              </li>
              <li>
                <strong className="text-slate-200">Acid 303 Slide & Accent:</strong> Right-click on any bass step in the sequencer to toggle portamento slides and high-resonance accents.
              </li>
              <li>
                <strong className="text-slate-200">Scale Lock:</strong> Automatically quantizes notes to harmonic modes (Dorian, Hirajoshi Neo-Tokyo, Pentatonic Minor) so your jams are always melodic.
              </li>
              <li>
                <strong className="text-slate-200">WAV Recording:</strong> Click <span className="text-red-400 font-bold">REC WAV</span> to record your jam directly to an uncompressed 16-bit 44.1kHz studio WAV audio file.
              </li>
              <li>
                <strong className="text-slate-200">MIDI Support:</strong> Plug in any USB MIDI keyboard to play polyphonic synth voices with velocity sensitivity.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md transition-all"
          >
            LET'S MAKE MUSIC
          </button>
        </div>
      </div>
    </div>
  );
};
