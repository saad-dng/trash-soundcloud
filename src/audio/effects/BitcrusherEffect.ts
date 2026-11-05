import { BitcrusherParams } from '../../types/synth';

export class BitcrusherEffect {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;

  private dryGain: GainNode;
  private wetGain: GainNode;
  private waveShaper: WaveShaperNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.waveShaper = ctx.createWaveShaper();

    // Dry
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Wet: input -> waveShaper -> wetGain -> output
    this.input.connect(this.waveShaper);
    this.waveShaper.connect(this.wetGain);
    this.wetGain.connect(this.output);

    this.makeBitcrushCurve(8);

    this.updateParams({
      enabled: false,
      bits: 8,
      normFreq: 0.5,
      mix: 0.0,
    });
  }

  private makeBitcrushCurve(bits: number) {
    const stepCount = Math.pow(2, Math.max(2, Math.min(16, bits)));
    const samples = 4096;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Quantize x into discrete step levels
      curve[i] = Math.round(x * stepCount) / stepCount;
    }

    this.waveShaper.curve = curve;
  }

  public updateParams(params: BitcrusherParams) {
    const time = this.ctx.currentTime;
    if (!params.enabled || params.mix === 0) {
      this.dryGain.gain.setTargetAtTime(1.0, time, 0.01);
      this.wetGain.gain.setTargetAtTime(0.0, time, 0.01);
      return;
    }

    this.makeBitcrushCurve(params.bits);

    const mix = Math.max(0, Math.min(1, params.mix));
    this.dryGain.gain.setTargetAtTime(1 - mix * 0.4, time, 0.02);
    this.wetGain.gain.setTargetAtTime(mix, time, 0.02);
  }
}
