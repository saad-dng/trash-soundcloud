import React, { useState } from 'react';
import { BassParams, PadParams, SynthParams, Waveform } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import { audioEngine } from '../../audio/AudioEngine';
import { Cpu, Flame, Layers, Waves } from 'lucide-react';

interface SynthEditorProps {
  synthParams: SynthParams;
  bassParams: BassParams;
  padParams: PadParams;
  onSynthChange: (params: SynthParams) => void;
  onBassChange: (params: BassParams) => void;
  onPadChange: (params: PadParams) => void;
}

export const SynthEditor: React.FC<SynthEditorProps> = ({
  synthParams,
  bassParams,
  padParams,
  onSynthChange,
  onBassChange,
  onPadChange,
}) => {
  const [activeTab, setActiveTab] = useState<'poly' | 'acid' | 'pad'>('poly');

  const waveforms: Waveform[] = ['sawtooth', 'square', 'sine', 'triangle'];

  const handlePolyKnob = <K extends keyof SynthParams>(key: K, val: SynthParams[K]) => {
    const updated = { ...synthParams, [key]: val };
    onSynthChange(updated);
    audioEngine.polySynth.updateParams(updated);
  };

  const handleAmpEnv = (key: 'attack' | 'decay' | 'sustain' | 'release', val: number) => {
    const updated = {
      ...synthParams,
      ampEnv: { ...synthParams.ampEnv, [key]: val },
    };
    onSynthChange(updated);
    audioEngine.polySynth.updateParams(updated);
  };

  const handleFilterEnv = (key: 'attack' | 'decay' | 'sustain' | 'release', val: number) => {
    const updated = {
      ...synthParams,
      filterEnv: { ...synthParams.filterEnv, [key]: val },
    };
    onSynthChange(updated);
    audioEngine.polySynth.updateParams(updated);
  };

  const handleBassKnob = <K extends keyof BassParams>(key: K, val: BassParams[K]) => {
    const updated = { ...bassParams, [key]: val };
    onBassChange(updated);
    audioEngine.acidSynth.updateParams(updated);
  };

  const handlePadKnob = <K extends keyof PadParams>(key: K, val: PadParams[K]) => {
    const updated = { ...padParams, [key]: val };
    onPadChange(updated);
    audioEngine.padSynth.updateParams(updated);
  };

  return (
    <div className="w-full bg-[#1b1511] rounded-2xl border border-[#2e241d] p-4 shadow-sm">
      {/* Editor Tabs */}
      <div className="flex items-center justify-between border-b border-[#2e241d] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#d99b61]" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-[#f4ece4] uppercase">
            Sound Engine Architecture
          </h2>
        </div>

        <div className="flex gap-1 bg-[#201915] p-1 rounded-xl border border-[#332820]">
          <button
            type="button"
            onClick={() => setActiveTab('poly')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
              activeTab === 'poly'
                ? 'bg-[#d99b61] text-[#14100e] shadow-sm'
                : 'text-[#a89988] hover:text-[#f4ece4]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Poly Synth</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acid')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
              activeTab === 'acid'
                ? 'bg-[#d99b61] text-[#14100e] shadow-sm'
                : 'text-[#a89988] hover:text-[#f4ece4]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Acid 303 Bass</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pad')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
              activeTab === 'pad'
                ? 'bg-[#d99b61] text-[#14100e] shadow-sm'
                : 'text-[#a89988] hover:text-[#f4ece4]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Warm Pad</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POLY SYNTH */}
      {activeTab === 'poly' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Section 1: Oscillators */}
          <div className="bg-[#201915] p-3 rounded-xl border border-[#2e241d] space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#e8cca7] uppercase tracking-wider border-b border-[#2e241d] pb-1">
              Dual Oscillators
            </h3>

            {/* Osc 1 Wave */}
            <div>
              <div className="text-[10px] font-mono text-[#a89988] mb-1">Osc 1 Shape</div>
              <div className="grid grid-cols-4 gap-1">
                {waveforms.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handlePolyKnob('osc1Wave', w)}
                    className={`text-[9px] font-mono py-1 rounded-md border uppercase ${
                      synthParams.osc1Wave === w
                        ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] font-bold'
                        : 'bg-[#28201a] text-[#a89988] border-[#382d24] hover:text-white'
                    }`}
                  >
                    {w.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Osc 2 Wave */}
            <div>
              <div className="text-[10px] font-mono text-[#a89988] mb-1">Osc 2 Shape</div>
              <div className="grid grid-cols-4 gap-1">
                {waveforms.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handlePolyKnob('osc2Wave', w)}
                    className={`text-[9px] font-mono py-1 rounded-md border uppercase ${
                      synthParams.osc2Wave === w
                        ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] font-bold'
                        : 'bg-[#28201a] text-[#a89988] border-[#382d24] hover:text-white'
                    }`}
                  >
                    {w.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Knobs */}
            <div className="grid grid-cols-3 gap-1 pt-1">
              <Knob
                label="DETUNE"
                value={synthParams.osc2Detune}
                min={-30}
                max={30}
                unit="c"
                color="#d99b61"
                onChange={(v) => handlePolyKnob('osc2Detune', v)}
              />
              <Knob
                label="OSC MIX"
                value={Math.round(synthParams.oscMix * 100)}
                min={0}
                max={100}
                unit="%"
                color="#d99b61"
                onChange={(v) => handlePolyKnob('oscMix', v / 100)}
              />
              <Knob
                label="SUB OSC"
                value={Math.round(synthParams.subLevel * 100)}
                min={0}
                max={100}
                unit="%"
                color="#e8cca7"
                onChange={(v) => handlePolyKnob('subLevel', v / 100)}
              />
            </div>
          </div>

          {/* Section 2: Ladder Filter */}
          <div className="bg-[#201915] p-3 rounded-xl border border-[#2e241d] space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#e8cca7] uppercase tracking-wider border-b border-[#2e241d] pb-1">
              Warm Analog Filter
            </h3>

            {/* Filter Type */}
            <div className="grid grid-cols-4 gap-1">
              {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => handlePolyKnob('filterType', ft)}
                  className={`text-[9px] font-mono py-1 rounded-md border uppercase ${
                    synthParams.filterType === ft
                      ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] font-bold'
                      : 'bg-[#28201a] text-[#a89988] border-[#382d24] hover:text-white'
                  }`}
                >
                  {ft.slice(0, 3)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2">
              <Knob
                label="CUTOFF"
                value={synthParams.filterCutoff}
                min={60}
                max={16000}
                step={50}
                unit="Hz"
                color="#d99b61"
                onChange={(v) => handlePolyKnob('filterCutoff', v)}
              />
              <Knob
                label="RESON"
                value={Math.round(synthParams.filterResonance * 10)}
                min={1}
                max={200}
                unit=""
                color="#d99b61"
                onChange={(v) => handlePolyKnob('filterResonance', v / 10)}
              />
              <Knob
                label="ENV MOD"
                value={Math.round(synthParams.filterEnvAmount * 100)}
                min={-100}
                max={100}
                unit="%"
                color="#e8cca7"
                onChange={(v) => handlePolyKnob('filterEnvAmount', v / 100)}
              />
            </div>

            {/* Filter Envelope Sliders */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              <Knob
                label="F-ATT"
                value={Math.round(synthParams.filterEnv.attack * 1000)}
                min={1}
                max={1000}
                unit="ms"
                color="#e8cca7"
                size={42}
                onChange={(v) => handleFilterEnv('attack', v / 1000)}
              />
              <Knob
                label="F-DEC"
                value={Math.round(synthParams.filterEnv.decay * 1000)}
                min={10}
                max={2000}
                unit="ms"
                color="#e8cca7"
                size={42}
                onChange={(v) => handleFilterEnv('decay', v / 1000)}
              />
              <Knob
                label="F-SUS"
                value={Math.round(synthParams.filterEnv.sustain * 100)}
                min={0}
                max={100}
                unit="%"
                color="#e8cca7"
                size={42}
                onChange={(v) => handleFilterEnv('sustain', v / 100)}
              />
              <Knob
                label="F-REL"
                value={Math.round(synthParams.filterEnv.release * 1000)}
                min={10}
                max={2500}
                unit="ms"
                color="#e8cca7"
                size={42}
                onChange={(v) => handleFilterEnv('release', v / 1000)}
              />
            </div>
          </div>

          {/* Section 3: Amp Envelope (ADSR) */}
          <div className="bg-[#201915] p-3 rounded-xl border border-[#2e241d] space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#e8cca7] uppercase tracking-wider border-b border-[#2e241d] pb-1">
              Amp Envelope (ADSR)
            </h3>

            <div className="grid grid-cols-4 gap-1 pt-2">
              <Knob
                label="ATTACK"
                value={Math.round(synthParams.ampEnv.attack * 1000)}
                min={1}
                max={1200}
                unit="ms"
                color="#d99b61"
                size={46}
                onChange={(v) => handleAmpEnv('attack', v / 1000)}
              />
              <Knob
                label="DECAY"
                value={Math.round(synthParams.ampEnv.decay * 1000)}
                min={10}
                max={2000}
                unit="ms"
                color="#d99b61"
                size={46}
                onChange={(v) => handleAmpEnv('decay', v / 1000)}
              />
              <Knob
                label="SUSTAIN"
                value={Math.round(synthParams.ampEnv.sustain * 100)}
                min={0}
                max={100}
                unit="%"
                color="#d99b61"
                size={46}
                onChange={(v) => handleAmpEnv('sustain', v / 100)}
              />
              <Knob
                label="RELEASE"
                value={Math.round(synthParams.ampEnv.release * 1000)}
                min={10}
                max={2500}
                unit="ms"
                color="#d99b61"
                size={46}
                onChange={(v) => handleAmpEnv('release', v / 1000)}
              />
            </div>

            {/* Visual envelope preview shape */}
            <div className="h-12 bg-[#16110f] rounded-lg p-1.5 flex items-end border border-[#2e241d]">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path
                  d={`M 0 40 L 20 5 L 45 ${40 - synthParams.ampEnv.sustain * 35} L 75 ${40 - synthParams.ampEnv.sustain * 35} L 100 40`}
                  fill="none"
                  stroke="#d99b61"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Section 4: LFO & Glide */}
          <div className="bg-[#201915] p-3 rounded-xl border border-[#2e241d] space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#e8cca7] uppercase tracking-wider border-b border-[#2e241d] pb-1">
              LFO Modulation & Glide
            </h3>

            {/* LFO Destination */}
            <div className="grid grid-cols-3 gap-1">
              {(['cutoff', 'pitch', 'pan'] as const).map((tgt) => (
                <button
                  key={tgt}
                  type="button"
                  onClick={() => handlePolyKnob('lfoTarget', tgt)}
                  className={`text-[9px] font-mono py-1 rounded-md border uppercase ${
                    synthParams.lfoTarget === tgt
                      ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] font-bold'
                      : 'bg-[#28201a] text-[#a89988] border-[#382d24] hover:text-white'
                  }`}
                >
                  {tgt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2">
              <Knob
                label="LFO RATE"
                value={Math.round(synthParams.lfoRate * 10)}
                min={1}
                max={200}
                unit="Hz"
                color="#d99b61"
                onChange={(v) => handlePolyKnob('lfoRate', v / 10)}
              />
              <Knob
                label="LFO DEPTH"
                value={Math.round(synthParams.lfoDepth * 100)}
                min={0}
                max={100}
                unit="%"
                color="#e8cca7"
                onChange={(v) => handlePolyKnob('lfoDepth', v / 100)}
              />
              <Knob
                label="GLIDE"
                value={Math.round(synthParams.glide * 1000)}
                min={0}
                max={250}
                unit="ms"
                color="#d99b61"
                onChange={(v) => handlePolyKnob('glide', v / 1000)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACID 303 BASS */}
      {activeTab === 'acid' && (
        <div className="bg-[#201915] p-4 rounded-xl border border-[#2e241d]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Waveform Toggle */}
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#a89988]">Waveform</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleBassKnob('wave', 'sawtooth')}
                  className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                    bassParams.wave === 'sawtooth'
                      ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61]'
                      : 'bg-[#28201a] text-[#e8cca7] border-[#382d24]'
                  }`}
                >
                  SAW
                </button>
                <button
                  type="button"
                  onClick={() => handleBassKnob('wave', 'square')}
                  className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold border transition-colors ${
                    bassParams.wave === 'square'
                      ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61]'
                      : 'bg-[#28201a] text-[#e8cca7] border-[#382d24]'
                  }`}
                >
                  SQUARE
                </button>
              </div>
            </div>

            {/* Knobs */}
            <div className="flex flex-wrap items-center gap-4">
              <Knob
                label="CUTOFF"
                value={bassParams.cutoff}
                min={40}
                max={5000}
                unit="Hz"
                color="#d99b61"
                onChange={(v) => handleBassKnob('cutoff', v)}
              />
              <Knob
                label="RESONANCE"
                value={bassParams.resonance}
                min={1}
                max={24}
                unit=""
                color="#d99b61"
                onChange={(v) => handleBassKnob('resonance', v)}
              />
              <Knob
                label="ENV MOD"
                value={Math.round(bassParams.envMod * 100)}
                min={0}
                max={100}
                unit="%"
                color="#e8cca7"
                onChange={(v) => handleBassKnob('envMod', v / 100)}
              />
              <Knob
                label="DECAY"
                value={Math.round(bassParams.decay * 1000)}
                min={50}
                max={1200}
                unit="ms"
                color="#d99b61"
                onChange={(v) => handleBassKnob('decay', v / 1000)}
              />
              <Knob
                label="ACCENT"
                value={Math.round(bassParams.accent * 100)}
                min={0}
                max={100}
                unit="%"
                color="#e8cca7"
                onChange={(v) => handleBassKnob('accent', v / 100)}
              />
              <Knob
                label="OVERDRIVE"
                value={Math.round(bassParams.overdrive * 100)}
                min={0}
                max={100}
                unit="%"
                color="#d99b61"
                onChange={(v) => handleBassKnob('overdrive', v / 100)}
              />
              <Knob
                label="SLIDE TIME"
                value={Math.round(bassParams.slideTime * 1000)}
                min={20}
                max={200}
                unit="ms"
                color="#e8cca7"
                onChange={(v) => handleBassKnob('slideTime', v / 1000)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATMOSPHERIC PAD */}
      {activeTab === 'pad' && (
        <div className="bg-[#201915] p-4 rounded-xl border border-[#2e241d]">
          <div className="flex flex-wrap items-center gap-5">
            <Knob
              label="DETUNE"
              value={padParams.detuneSpread}
              min={5}
              max={45}
              unit="c"
              color="#d99b61"
              onChange={(v) => handlePadKnob('detuneSpread', v)}
            />
            <Knob
              label="CUTOFF"
              value={padParams.cutoff}
              min={200}
              max={8000}
              unit="Hz"
              color="#d99b61"
              onChange={(v) => handlePadKnob('cutoff', v)}
            />
            <Knob
              label="ATTACK"
              value={Math.round(padParams.attack * 1000)}
              min={100}
              max={2500}
              unit="ms"
              color="#e8cca7"
              onChange={(v) => handlePadKnob('attack', v / 1000)}
            />
            <Knob
              label="RELEASE"
              value={Math.round(padParams.release * 1000)}
              min={200}
              max={4000}
              unit="ms"
              color="#e8cca7"
              onChange={(v) => handlePadKnob('release', v / 1000)}
            />
            <Knob
              label="CHORUS"
              value={Math.round(padParams.chorusMix * 100)}
              min={0}
              max={100}
              unit="%"
              color="#d99b61"
              onChange={(v) => handlePadKnob('chorusMix', v / 100)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
