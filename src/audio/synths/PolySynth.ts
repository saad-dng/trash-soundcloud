import { SynthParams, Waveform } from '../../types/synth';
import { noteToFreq } from '../../utils/musicTheory';

interface ActiveVoice {
  id: string;
  note: string;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  subOsc: OscillatorNode;
  noiseSource?: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  voiceGain: GainNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  startTime: number;
}

export class PolySynth {
  private ctx: AudioContext;
  public output: GainNode;
  private activeVoices: Map<string, ActiveVoice> = new Map();
  private maxPolyphony: number = 8;

  public params: SynthParams = {
    osc1Wave: 'sawtooth',
    osc1Octave: 0,
    osc1Detune: -7,
    osc2Wave: 'square',
    osc2Octave: 0,
    osc2Detune: 8,
    oscMix: 0.5,
    subLevel: 0.3,
    noiseLevel: 0.05,
    glide: 0.02,
    filterType: 'lowpass',
    filterCutoff: 3200,
    filterResonance: 3.5,
    filterEnvAmount: 0.65,
    ampEnv: {
      attack: 0.015,
      decay: 0.25,
      sustain: 0.6,
      release: 0.35,
    },
    filterEnv: {
      attack: 0.02,
      decay: 0.35,
      sustain: 0.3,
      release: 0.4,
    },
    lfoRate: 3.0,
    lfoDepth: 0.15,
    lfoTarget: 'cutoff',
  };

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0.8;
  }

  public updateParams(newParams: Partial<SynthParams>) {
    this.params = { ...this.params, ...newParams };
  }

  public noteOn(note: string, velocity: number = 0.8, time: number = this.ctx.currentTime): string {
    // If voice limit exceeded, steal oldest
    if (this.activeVoices.size >= this.maxPolyphony) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [key, voice] of this.activeVoices.entries()) {
        if (voice.startTime < oldestTime) {
          oldestTime = voice.startTime;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        this.noteOff(oldestKey, time);
      }
    }

    const voiceId = `${note}_${Date.now()}_${Math.random()}`;
    const baseFreq = noteToFreq(note);

    // Osc 1
    const osc1 = this.ctx.createOscillator();
    osc1.type = this.params.osc1Wave === 'noise' ? 'sawtooth' : this.params.osc1Wave;
    const osc1Freq = baseFreq * Math.pow(2, this.params.osc1Octave);
    osc1.frequency.setValueAtTime(osc1Freq, time);
    osc1.detune.setValueAtTime(this.params.osc1Detune, time);

    const osc1Gain = this.ctx.createGain();
    osc1Gain.gain.setValueAtTime(1 - this.params.oscMix, time);
    osc1.connect(osc1Gain);

    // Osc 2
    const osc2 = this.ctx.createOscillator();
    osc2.type = this.params.osc2Wave === 'noise' ? 'square' : this.params.osc2Wave;
    const osc2Freq = baseFreq * Math.pow(2, this.params.osc2Octave);
    osc2.frequency.setValueAtTime(osc2Freq, time);
    osc2.detune.setValueAtTime(this.params.osc2Detune, time);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(this.params.oscMix, time);
    osc2.connect(osc2Gain);

    // Sub-Oscillator (1 octave down, sine)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 0.5, time);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(this.params.subLevel * 0.7, time);
    subOsc.connect(subGain);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = this.params.filterType;
    filter.Q.setValueAtTime(this.params.filterResonance, time);

    // Filter Envelope modulation
    const cutoffBase = Math.max(20, Math.min(20000, this.params.filterCutoff));
    const envPeak = Math.max(20, Math.min(20000, cutoffBase + (this.params.filterEnvAmount * 8000)));
    const envSustain = Math.max(20, Math.min(20000, cutoffBase + (this.params.filterEnvAmount * 8000 * this.params.filterEnv.sustain)));

    filter.frequency.setValueAtTime(cutoffBase, time);
    filter.frequency.linearRampToValueAtTime(envPeak, time + this.params.filterEnv.attack);
    filter.frequency.exponentialRampToValueAtTime(Math.max(20, envSustain), time + this.params.filterEnv.attack + this.params.filterEnv.decay);

    // LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(this.params.lfoRate, time);

    if (this.params.lfoTarget === 'cutoff') {
      lfoGain.gain.setValueAtTime(this.params.lfoDepth * 1200, time);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
    } else if (this.params.lfoTarget === 'pitch') {
      lfoGain.gain.setValueAtTime(this.params.lfoDepth * 35, time);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.detune);
      lfoGain.connect(osc2.detune);
    }

    lfo.start(time);

    // Voice Gain (Amp Envelope)
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, time);
    const peakVolume = velocity * 0.45;
    voiceGain.gain.linearRampToValueAtTime(peakVolume, time + this.params.ampEnv.attack);
    voiceGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, peakVolume * this.params.ampEnv.sustain),
      time + this.params.ampEnv.attack + this.params.ampEnv.decay
    );

    // Connect oscillators -> filter -> voiceGain -> output
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    subGain.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(this.output);

    osc1.start(time);
    osc2.start(time);
    subOsc.start(time);

    const voice: ActiveVoice = {
      id: voiceId,
      note,
      osc1,
      osc2,
      subOsc,
      filter,
      voiceGain,
      lfo,
      lfoGain,
      startTime: time,
    };

    this.activeVoices.set(voiceId, voice);
    return voiceId;
  }

  public noteOff(voiceId: string, time: number = this.ctx.currentTime) {
    const voice = this.activeVoices.get(voiceId);
    if (!voice) return;

    const relTime = this.params.ampEnv.release;
    voice.voiceGain.gain.cancelScheduledValues(time);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, time);
    voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, time + relTime);

    voice.filter.frequency.cancelScheduledValues(time);
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, time);
    voice.filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, this.params.filterCutoff * 0.4),
      time + this.params.filterEnv.release
    );

    setTimeout(() => {
      try {
        voice.osc1.stop();
        voice.osc2.stop();
        voice.subOsc.stop();
        voice.lfo?.stop();
        voice.osc1.disconnect();
        voice.osc2.disconnect();
        voice.subOsc.disconnect();
        voice.voiceGain.disconnect();
      } catch {
        // already stopped
      }
      this.activeVoices.delete(voiceId);
    }, (relTime + 0.05) * 1000);
  }

  public stopAll() {
    const time = this.ctx.currentTime;
    for (const [id] of this.activeVoices.entries()) {
      this.noteOff(id, time);
    }
  }

  public triggerNote(note: string, velocity: number = 0.8, time: number = this.ctx.currentTime, gateDuration: number = 0.25) {
    const voiceId = this.noteOn(note, velocity, time);
    this.noteOff(voiceId, time + gateDuration);
  }
}

