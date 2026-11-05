import { BassParams } from '../../types/synth';
import { noteToFreq } from '../../utils/musicTheory';

export class AcidSynth {
  private ctx: AudioContext;
  public output: GainNode;

  private osc: OscillatorNode | null = null;
  private filter: BiquadFilterNode;
  private ampGain: GainNode;
  private driveNode: WaveShaperNode;
  private lastFreq: number = 65;
  private isPlaying: boolean = false;

  private params: BassParams = {
    wave: 'sawtooth',
    cutoff: 800,
    resonance: 14,
    envMod: 0.85,
    decay: 0.28,
    accent: 0.6,
    overdrive: 0.45,
    slideTime: 0.08,
  };

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.output = ctx.createGain();

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.params.cutoff;
    this.filter.Q.value = this.params.resonance;

    this.ampGain = ctx.createGain();
    this.ampGain.gain.value = 0.0;

    this.driveNode = ctx.createWaveShaper();
    this.driveNode.oversample = '4x';
    this.setDrive(this.params.overdrive);

    // Chain: ampGain -> filter -> driveNode -> output
    this.ampGain.connect(this.filter);
    this.filter.connect(this.driveNode);
    this.driveNode.connect(this.output);
  }

  private setDrive(amount: number) {
    const k = amount * 40;
    const n = 4096;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.driveNode.curve = curve;
  }

  public updateParams(params: Partial<BassParams>) {
    this.params = { ...this.params, ...params };
    const time = this.ctx.currentTime;
    this.filter.Q.setTargetAtTime(this.params.resonance, time, 0.02);
    if (params.overdrive !== undefined) {
      this.setDrive(this.params.overdrive);
    }
  }

  public triggerNote(note: string, velocity: number = 0.8, slide: boolean = false, accent: boolean = false, time: number = this.ctx.currentTime, gateDuration: number = 0.2) {
    const freq = noteToFreq(note);
    const effectiveDecay = accent ? this.params.decay * 1.3 : this.params.decay;
    const peakCutoff = Math.min(18000, this.params.cutoff + (accent ? 4000 : 2500) * this.params.envMod * velocity);

    if (!this.isPlaying || !this.osc) {
      // Start a new oscillator
      this.osc = this.ctx.createOscillator();
      this.osc.type = this.params.wave;
      this.osc.frequency.setValueAtTime(slide ? this.lastFreq : freq, time);
      if (slide) {
        this.osc.frequency.exponentialRampToValueAtTime(freq, time + this.params.slideTime);
      }
      this.osc.connect(this.ampGain);
      this.osc.start(time);
      this.isPlaying = true;
    } else {
      // Legato / Slide to new frequency
      if (slide) {
        this.osc.frequency.cancelScheduledValues(time);
        this.osc.frequency.setValueAtTime(this.lastFreq, time);
        this.osc.frequency.exponentialRampToValueAtTime(freq, time + this.params.slideTime);
      } else {
        this.osc.frequency.setValueAtTime(freq, time);
      }
    }

    this.lastFreq = freq;

    // Filter Envelope (303 snappy decay)
    this.filter.frequency.cancelScheduledValues(time);
    this.filter.frequency.setValueAtTime(peakCutoff, time);
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(30, this.params.cutoff), time + effectiveDecay);

    // Amp Envelope
    const effectiveVol = (accent ? velocity * 1.25 : velocity) * 0.75;
    this.ampGain.gain.cancelScheduledValues(time);
    this.ampGain.gain.setValueAtTime(effectiveVol, time);
    this.ampGain.gain.exponentialRampToValueAtTime(0.001, time + Math.max(gateDuration, effectiveDecay));

    // Cleanup oscillator slightly after note end if not sustaining
    const stopTime = time + Math.max(gateDuration, effectiveDecay) + 0.05;
    setTimeout(() => {
      if (this.ctx.currentTime >= stopTime && this.isPlaying) {
        try {
          this.osc?.stop();
          this.osc?.disconnect();
        } catch {
          // already stopped
        }
        this.osc = null;
        this.isPlaying = false;
      }
    }, (Math.max(gateDuration, effectiveDecay) + 0.06) * 1000);
  }

  public stopAll() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // ignore
      }
      this.osc = null;
    }
    this.isPlaying = false;
    this.ampGain.gain.value = 0;
  }
}
