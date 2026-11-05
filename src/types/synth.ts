export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'noise';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export type ScaleMode =
  | 'pentatonic_minor'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'major'
  | 'dorian'
  | 'phrygian'
  | 'hirajoshi'
  | 'blues';

export type InstrumentType =
  | 'lead'
  | 'bass'
  | 'pad'
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'openhat'
  | 'clap'
  | 'zap'
  | 'tom';

export interface Step {
  active: boolean;
  note: string;       // e.g. "C4"
  octave: number;     // e.g. 4
  velocity: number;   // 0.0 - 1.0
  gate: number;       // step duration multiplier 0.1 - 1.0
  probability: number;// 0 - 100%
  slide?: boolean;    // for 303 bass slides
  accent?: boolean;   // for dynamic accents
}

export interface Track {
  id: string;
  name: string;
  type: InstrumentType;
  color: string;
  steps: Step[];
  volume: number; // 0.0 - 1.0
  pan: number;    // -1.0 to 1.0
  mute: boolean;
  solo: boolean;
}

export interface ADSR {
  attack: number;  // seconds
  decay: number;   // seconds
  sustain: number; // 0.0 - 1.0 level
  release: number; // seconds
}

export interface SynthParams {
  osc1Wave: Waveform;
  osc1Octave: number; // -2 to +2
  osc1Detune: number; // cents -50 to +50
  osc2Wave: Waveform;
  osc2Octave: number;
  osc2Detune: number;
  oscMix: number;     // 0 = 100% osc1, 1 = 100% osc2
  subLevel: number;   // 0.0 - 1.0 sub-oscillator level (-1 octave sine)
  noiseLevel: number; // 0.0 - 1.0 white noise mix
  glide: number;      // portamento time in seconds 0.0 - 0.5
  filterType: FilterType;
  filterCutoff: number;    // 20 - 20000 Hz
  filterResonance: number; // 0 - 25 Q
  filterEnvAmount: number; // -1.0 to 1.0
  ampEnv: ADSR;
  filterEnv: ADSR;
  lfoRate: number;    // 0.1 - 20 Hz
  lfoDepth: number;   // 0.0 - 1.0
  lfoTarget: 'cutoff' | 'pitch' | 'pan';
}

export interface BassParams {
  wave: 'sawtooth' | 'square';
  cutoff: number;      // 30 - 5000 Hz
  resonance: number;   // 1 - 25
  envMod: number;      // 0 - 1.0
  decay: number;       // 0.05 - 1.5 s
  accent: number;      // 0 - 1.0
  overdrive: number;   // 0 - 1.0
  slideTime: number;   // 0.02 - 0.2 s
}

export interface PadParams {
  wave: Waveform;
  detuneSpread: number; // 5 - 40 cents
  cutoff: number;
  resonance: number;
  attack: number;
  release: number;
  chorusMix: number;
}

export interface DelayParams {
  enabled: boolean;
  time: number;       // seconds (0.05 - 1.0)
  feedback: number;   // 0.0 - 0.95
  pingPong: boolean;
  mix: number;        // wet 0.0 - 1.0
}

export interface ReverbParams {
  enabled: boolean;
  decay: number;      // seconds 0.2 - 8.0
  damping: number;    // Hz 1000 - 16000
  mix: number;        // wet 0.0 - 1.0
}

export interface DistortionParams {
  enabled: boolean;
  drive: number;      // 0.0 - 1.0
  tone: number;       // 500 - 12000 Hz
  mix: number;        // wet 0.0 - 1.0
}

export interface BitcrusherParams {
  enabled: boolean;
  bits: number;       // 2 - 16
  normFreq: number;   // 0.02 - 1.0
  mix: number;        // wet 0.0 - 1.0
}

export interface MasterParams {
  bpm: number;        // 60 - 180
  swing: number;      // 0.50 (straight) to 0.75 (heavy swing)
  volume: number;     // 0.0 - 1.0
  limiter: boolean;
}

export interface FXParams {
  delay: DelayParams;
  reverb: ReverbParams;
  distortion: DistortionParams;
  bitcrusher: BitcrusherParams;
}

export interface Preset {
  id: string;
  name: string;
  genre: string;
  description: string;
  bpm: number;
  scale: ScaleMode;
  rootNote: string;
  tracks: Track[];
  synthParams: SynthParams;
  bassParams: BassParams;
  padParams: PadParams;
  fxParams: FXParams;
}

export type VisualizerMode = 'warm_oscilloscope' | 'latte_ripples' | 'cozy_dust' | 'ambient_bars';

export interface VisualizerSettings {
  mode: VisualizerMode;
  colorScheme: 'warm_caramel' | 'soft_latte' | 'dark_mocha';
  sensitivity: number;
  bloom: boolean;
  trail: boolean;
}

