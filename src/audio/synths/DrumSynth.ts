/**
 * Procedural Drum Synthesizer
 * High-definition synthetic analog & digital drum models
 */

export class DrumSynth {
  private ctx: AudioContext;
  public output: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 1.0;
  }

  /**
   * 808/909 punchy pitch-swept kick
   */
  public triggerKick(time: number = this.ctx.currentTime, velocity: number = 0.9) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Fast pitch sweep from 160Hz down to 42Hz for punch
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.07);

    // Initial click transient
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(320, time);
    clickOsc.frequency.exponentialRampToValueAtTime(20, time + 0.015);
    clickGain.gain.setValueAtTime(velocity * 0.7, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    // Amp envelope
    const dur = 0.38;
    gain.gain.setValueAtTime(velocity * 1.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    clickOsc.connect(clickGain);

    gain.connect(this.output);
    clickGain.connect(this.output);

    osc.start(time);
    clickOsc.start(time);

    osc.stop(time + dur);
    clickOsc.stop(time + 0.02);
  }

  /**
   * Dual-component analog snare (body tone + filtered noise burst)
   */
  public triggerSnare(time: number = this.ctx.currentTime, velocity: number = 0.85) {
    // 1. Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.05);

    oscGain.gain.setValueAtTime(velocity * 0.8, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.output);

    // 2. Snare wire noise burst
    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1200, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(velocity * 0.9, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.20);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.output);

    osc.start(time);
    noise.start(time);

    osc.stop(time + 0.14);
    noise.stop(time + 0.22);
  }

  /**
   * Crisp Metallic Closed Hi-Hat
   */
  public triggerHiHat(time: number = this.ctx.currentTime, velocity: number = 0.7) {
    const dur = 0.06;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(9500, time);
    filter.Q.setValueAtTime(3.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);

    noise.start(time);
    noise.stop(time + dur);
  }

  /**
   * Shimmering Open Hi-Hat
   */
  public triggerOpenHat(time: number = this.ctx.currentTime, velocity: number = 0.7) {
    const dur = 0.38;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);

    noise.start(time);
    noise.stop(time + dur);
  }

  /**
   * Multi-burst Handclap
   */
  public triggerClap(time: number = this.ctx.currentTime, velocity: number = 0.8) {
    const dur = 0.25;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.setValueAtTime(2.0, time);

    const gain = this.ctx.createGain();
    // 3 micro-bursts
    gain.gain.setValueAtTime(0, time);
    gain.gain.setValueAtTime(velocity * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.012);
    gain.gain.setValueAtTime(velocity * 0.85, time + 0.013);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);
    gain.gain.setValueAtTime(velocity * 0.9, time + 0.026);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);

    noise.start(time);
    noise.stop(time + dur);
  }

  /**
   * Cyber Zap / FM Percussion
   */
  public triggerZap(time: number = this.ctx.currentTime, velocity: number = 0.75) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(4.0, time);

    gain.gain.setValueAtTime(velocity * 0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.output);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  /**
   * Resonant Analog Tom
   */
  public triggerTom(time: number = this.ctx.currentTime, velocity: number = 0.8) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, time);
    osc.frequency.exponentialRampToValueAtTime(75, time + 0.2);

    gain.gain.setValueAtTime(velocity * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.output);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  public triggerSound(type: string, time: number = this.ctx.currentTime, velocity: number = 0.8) {
    switch (type) {
      case 'kick':
        this.triggerKick(time, velocity);
        break;
      case 'snare':
        this.triggerSnare(time, velocity);
        break;
      case 'hihat':
        this.triggerHiHat(time, velocity);
        break;
      case 'openhat':
        this.triggerOpenHat(time, velocity);
        break;
      case 'clap':
        this.triggerClap(time, velocity);
        break;
      case 'zap':
        this.triggerZap(time, velocity);
        break;
      case 'tom':
        this.triggerTom(time, velocity);
        break;
      default:
        this.triggerHiHat(time, velocity);
        break;
    }
  }
}
