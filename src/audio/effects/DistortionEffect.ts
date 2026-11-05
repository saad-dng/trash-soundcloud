import { DistortionParams } from '../../types/synth';

export class DistortionEffect {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;

  private dryGain: GainNode;
  private wetGain: GainNode;
  private preGain: GainNode;
  private waveShaper: WaveShaperNode;
  private toneFilter: BiquadFilterNode;
  private postGain: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();
    this.preGain = ctx.createGain();
    this.postGain = ctx.createGain();

    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.oversample = '4x';

    this.toneFilter = ctx.createBiquadFilter();
    this.toneFilter.type = 'lowpass';
    this.toneFilter.frequency.value = 4000;

    // Dry
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Wet: input -> preGain -> waveShaper -> toneFilter -> postGain -> wetGain -> output
    this.input.connect(this.preGain);
    this.preGain.connect(this.waveShaper);
    this.waveShaper.connect(this.toneFilter);
    this.toneFilter.connect(this.postGain);
    this.postGain.connect(this.wetGain);
    this.wetGain.connect(this.output);

    this.makeDistortionCurve(0.4);

    this.updateParams({
      enabled: false,
      drive: 0.4,
      tone: 4500,
      mix: 0.0,
    });
  }

  private makeDistortionCurve(amount: number) {
    const k = amount * 50;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
      // Hyperbolic tangent soft saturation curve
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    this.waveShaper.curve = curve;
  }

  public updateParams(params: DistortionParams) {
    const time = this.ctx.currentTime;
    if (!params.enabled || params.mix === 0) {
      this.dryGain.gain.setTargetAtTime(1.0, time, 0.01);
      this.wetGain.gain.setTargetAtTime(0.0, time, 0.01);
      return;
    }

    const drive = Math.max(0.01, Math.min(1.0, params.drive));
    this.makeDistortionCurve(drive);

    // Compensate volume when overdrive is increased
    this.preGain.gain.setTargetAtTime(1.0 + drive * 3.0, time, 0.02);
    this.postGain.gain.setTargetAtTime(1.0 / (1.0 + drive * 2.0), time, 0.02);

    this.toneFilter.frequency.setTargetAtTime(
      Math.max(400, Math.min(16000, params.tone)),
      time,
      0.02
    );

    const mix = Math.max(0, Math.min(1.0, params.mix));
    this.dryGain.gain.setTargetAtTime(1.0 - mix * 0.3, time, 0.02);
    this.wetGain.gain.setTargetAtTime(mix, time, 0.02);
  }
}

