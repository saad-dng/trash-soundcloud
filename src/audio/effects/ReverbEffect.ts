import { ReverbParams } from '../../types/synth';

export class ReverbEffect {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;

  private dryGain: GainNode;
  private wetGain: GainNode;
  private convolver: ConvolverNode;
  private dampingFilter: BiquadFilterNode;
  private currentDecay: number = 2.5;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    this.convolver = ctx.createConvolver();
    this.dampingFilter = ctx.createBiquadFilter();
    this.dampingFilter.type = 'lowpass';
    this.dampingFilter.frequency.value = 8000;

    // Dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Wet path: input -> convolver -> damping -> wetGain -> output
    this.input.connect(this.convolver);
    this.convolver.connect(this.dampingFilter);
    this.dampingFilter.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Generate initial impulse response
    this.buildImpulseResponse(this.currentDecay);

    this.updateParams({
      enabled: true,
      decay: 2.5,
      damping: 7000,
      mix: 0.35,
    });
  }

  private buildImpulseResponse(duration: number) {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(0.2, Math.min(8.0, duration)));
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    const decayConstant = 3.0 / duration;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Exponential decay envelope with subtle random micro-echo reflections
      const env = Math.exp(-decayConstant * t);
      // Diffuse noise with early discrete taps
      const earlyTap = (i < 2000 && i % 400 === 0) ? 0.3 : 0;
      left[i] = ((Math.random() * 2 - 1) * 0.7 + earlyTap) * env;
      right[i] = ((Math.random() * 2 - 1) * 0.7 + earlyTap * 0.8) * env;
    }

    this.convolver.buffer = impulse;
    this.currentDecay = duration;
  }

  public updateParams(params: ReverbParams) {
    const time = this.ctx.currentTime;
    if (!params.enabled || params.mix === 0) {
      this.dryGain.gain.setTargetAtTime(1.0, time, 0.01);
      this.wetGain.gain.setTargetAtTime(0.0, time, 0.01);
      return;
    }

    if (Math.abs(params.decay - this.currentDecay) > 0.3) {
      this.buildImpulseResponse(params.decay);
    }

    this.dampingFilter.frequency.setTargetAtTime(
      Math.max(500, Math.min(18000, params.damping)),
      time,
      0.02
    );

    const mix = Math.max(0, Math.min(1, params.mix));
    this.dryGain.gain.setTargetAtTime(1 - mix * 0.4, time, 0.02);
    this.wetGain.gain.setTargetAtTime(mix * 0.9, time, 0.02);
  }
}

