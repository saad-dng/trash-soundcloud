import React from 'react';
import { Coffee, Keyboard, Sparkles, Sliders, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0a08]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c1613] border border-[#382d24] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e241d] pb-3">
          <div className="flex items-center gap-2.5">
            <Coffee className="w-5 h-5 text-[#d99b61]" />
            <h2 className="text-base font-mono font-bold text-[#ede0d4] uppercase tracking-wider">
              MOCHA STUDIO // Operational Manual & Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9e8c80] hover:text-[#ede0d4] p-1 rounded-lg hover:bg-[#281f19] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs font-mono text-[#bdafa4]">
          {/* Quickstart */}
          <div className="bg-[#16110e] p-3.5 rounded-xl border border-[#2a2018] space-y-1.5">
            <h3 className="text-[#d99b61] font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Quickstart Guide
            </h3>
            <p className="text-[#9e8c80] leading-relaxed">
              Press the <strong className="text-[#ede0d4]">Play button</strong> or hit <kbd className="px-1.5 py-0.5 bg-[#251d18] rounded border border-[#3d2e23] text-[#e8cca7]">Space</kbd> to start the sequencer. Switch cozy acoustic & lo-fi presets via the top menu, or click <strong className="text-[#d99b61]">BREW PATTERN</strong> to procedurally synthesize brand new melodic compositions using Euclidean rhythm algorithms and warm music theory.
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-[#16110e] p-3.5 rounded-xl border border-[#2a2018] space-y-2">
            <h3 className="text-[#d99b61] font-bold flex items-center gap-2">
              <Keyboard className="w-4 h-4" /> Global Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center justify-between bg-[#1f1814] p-2 rounded-lg border border-[#2d231b]">
                <span className="text-[#9e8c80]">Play / Pause</span>
                <kbd className="px-2 py-0.5 bg-[#2a2019] rounded text-[#e8cca7] font-bold">Space</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1f1814] p-2 rounded-lg border border-[#2d231b]">
                <span className="text-[#9e8c80]">Finger Drumming</span>
                <kbd className="px-2 py-0.5 bg-[#2a2019] rounded text-[#e8cca7] font-bold">1-4, Q, W, E, R</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1f1814] p-2 rounded-lg border border-[#2d231b]">
                <span className="text-[#9e8c80]">Play Natural Ivory Keys</span>
                <kbd className="px-2 py-0.5 bg-[#2a2019] rounded text-[#e8cca7] font-bold">A, S, D, F, G, H, J, K, L</kbd>
              </div>
              <div className="flex items-center justify-between bg-[#1f1814] p-2 rounded-lg border border-[#2d231b]">
                <span className="text-[#9e8c80]">Play Dark Espresso Keys</span>
                <kbd className="px-2 py-0.5 bg-[#2a2019] rounded text-[#e8cca7] font-bold">W, E, T, Y, U, O, P</kbd>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-[#16110e] p-3.5 rounded-xl border border-[#2a2018] space-y-2">
            <h3 className="text-[#d99b61] font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Acoustic & Ambient Tools
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-[#9e8c80] leading-relaxed">
              <li>
                <strong className="text-[#ede0d4]">X/Y Kaoss Touchpad:</strong> Drag across the warm mocha touchpad to sweep low-pass warmth (X) and analog warm tape delay (Y) in real time.
              </li>
              <li>
                <strong className="text-[#ede0d4]">Bass Slide & Accent:</strong> Right-click on any bass step in the sequencer to toggle silky portamento slides and warm saturated accents.
              </li>
              <li>
                <strong className="text-[#ede0d4]">Scale Lock:</strong> Automatically quantizes notes to harmonic modes (Dorian, Pentatonic Minor, Lo-Fi Major 7th) so your melodies remain effortlessly musical.
              </li>
              <li>
                <strong className="text-[#ede0d4]">WAV Recording:</strong> Click <span className="text-[#b85d43] font-bold">REC WAV</span> to capture your session directly into an uncompressed, studio-grade 16-bit 44.1kHz audio file.
              </li>
              <li>
                <strong className="text-[#ede0d4]">MIDI Controller Support:</strong> Plug in any USB MIDI keyboard or controller to play velocity-sensitive PolySynth voices instantly.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#2e241d]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#d99b61] text-[#14100e] hover:bg-[#e8cca7] shadow-md transition-all active:scale-95"
          >
            LET'S MAKE MUSIC
          </button>
        </div>
      </div>
    </div>
  );
};
