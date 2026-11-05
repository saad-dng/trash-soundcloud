import { PadParams } from '../../types/synth';
import { noteToFreq } from '../../utils/musicTheory';

interface PadVoice {
  id: string;
  oscillators: OscillatorNode[];
  gains: GainNode[];
  filter: BiquadFilterNode;
  masterGain: GainNode;
}

export class PadSynth {
  private ctx: AudioContext;
  public output: GainNode;
  private voices: Map<string, PadVoice> = new Map();

  public params: PadParams = {
    wave: 'sawtooth',
    detuneSpread: 18,
    cutoff: 1600,
    resonance: 1.8,
    attack: 0.6,
    release: 1.2,
    chorusMix: 0.4,
  };

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0.55;
  }

  public updateParams(newParams: Partial<PadParams>) {
    this.params = { ...this.params, ...newParams };
  }

  public noteOn(note: string, velocity: number = 0.7, time: number = this.ctx.currentTime): string {
    const id = `${note}_${Date.now()}`;
    const baseFreq = noteToFreq(note);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.params.cutoff, time);
    filter.Q.setValueAtTime(this.params.resonance, time);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(velocity * 0.4, time + this.params.attack);

    filter.connect(masterGain);
    masterGain.connect(this.output);

    // 4 detuned supersaw / supersine voices
    const detuneOffsets = [-this.params.detuneSpread, -this.params.detuneSpread * 0.4, this.params.detuneSpread * 0.4, this.params.detuneSpread];
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = this.params.wave === 'noise' ? 'sawtooth' : (this.params.wave as OscillatorType);
      osc.frequency.setValueAtTime(baseFreq, time);
      osc.detune.setValueAtTime(detuneOffsets[i], time);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.25, time);

      osc.connect(g);
      g.connect(filter);

      osc.start(time);
      oscillators.push(osc);
      gains.push(g);
    }

    this.voices.set(id, {
      id,
      oscillators,
      gains,
      filter,
      masterGain,
    });

    return id;
  }

  public noteOff(id: string, time: number = this.ctx.currentTime) {
    const voice = this.voices.get(id);
    if (!voice) return;

    voice.masterGain.gain.cancelScheduledValues(time);
    voice.masterGain.gain.setValueAtTime(voice.masterGain.gain.value, time);
    voice.masterGain.gain.exponentialRampToValueAtTime(0.0001, time + this.params.release);

    setTimeout(() => {
      try {
        voice.oscillators.forEach(osc => {
          osc.stop();
          osc.disconnect();
        });
        voice.gains.forEach(g => g.disconnect());
        voice.filter.disconnect();
        voice.masterGain.disconnect();
      } catch {
        // ignore
      }
      this.voices.delete(id);
    }, (this.params.release + 0.1) * 1000);
  }

  public triggerChord(notes: string[], velocity: number = 0.7, time: number = this.ctx.currentTime, duration: number = 1.8) {
    const ids = notes.map(n => this.noteOn(n, velocity, time));
    setTimeout(() => {
      ids.forEach(id => this.noteOff(id, this.ctx.currentTime));
    }, duration * 1000);
  }

  public stopAll() {
    const time = this.ctx.currentTime;
    for (const [id] of this.voices.entries()) {
      this.noteOff(id, time);
    }
  }
}
