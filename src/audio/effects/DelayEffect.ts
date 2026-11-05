import { DelayParams } from '../../types/synth';

export class DelayEffect {
  private ctx: AudioContext;
  public input: GainNode;
  public output: GainNode;

  private dryGain: GainNode;
  private wetGain: GainNode;
  private delayLeft: DelayNode;
  private delayRight: DelayNode;
  private feedbackLeft: GainNode;
  private feedbackRight: GainNode;
  private filterLeft: BiquadFilterNode;
  private filterRight: BiquadFilterNode;
  private merger: ChannelMergerNode;
  private splitter: ChannelSplitterNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    this.delayLeft = ctx.createDelay(2.0);
    this.delayRight = ctx.createDelay(2.0);
    this.feedbackLeft = ctx.createGain();
    this.feedbackRight = ctx.createGain();

    // Warm high-cut filter on delay repeats
    this.filterLeft = ctx.createBiquadFilter();
    this.filterLeft.type = 'lowpass';
    this.filterLeft.frequency.value = 4500;

    this.filterRight = ctx.createBiquadFilter();
    this.filterRight.type = 'lowpass';
    this.filterRight.frequency.value = 4500;

    this.splitter = ctx.createChannelSplitter(2);
    this.merger = ctx.createChannelMerger(2);

    // Dry path
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    // Wet path - Ping Pong
    this.input.connect(this.delayLeft);
    this.delayLeft.connect(this.filterLeft);
    this.filterLeft.connect(this.feedbackLeft);
    // Left delay feeds into Right delay for ping-pong
    this.feedbackLeft.connect(this.delayRight);
    this.filterLeft.connect(this.merger, 0, 0); // left channel

    this.delayRight.connect(this.filterRight);
    this.filterRight.connect(this.feedbackRight);
    // Right delay feeds back to Left
    this.feedbackRight.connect(this.delayLeft);
    this.filterRight.connect(this.merger, 0, 1); // right channel

    this.merger.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Default params
    this.updateParams({
      enabled: true,
      time: 0.32,
      feedback: 0.45,
      pingPong: true,
      mix: 0.28,
    });
  }

  public updateParams(params: DelayParams) {
    const time = this.ctx.currentTime;
    if (!params.enabled || params.mix === 0) {
      this.dryGain.gain.setTargetAtTime(1.0, time, 0.01);
      this.wetGain.gain.setTargetAtTime(0.0, time, 0.01);
      return;
    }

    const t = Math.max(0.02, Math.min(1.5, params.time));
    this.delayLeft.delayTime.setTargetAtTime(t, time, 0.02);
    // Ping pong offset
    const rightDelay = params.pingPong ? t * 1.5 : t;
    this.delayRight.delayTime.setTargetAtTime(Math.min(1.5, rightDelay), time, 0.02);

    const fb = Math.max(0, Math.min(0.92, params.feedback));
    this.feedbackLeft.gain.setTargetAtTime(fb, time, 0.02);
    this.feedbackRight.gain.setTargetAtTime(fb * 0.9, time, 0.02);

    const mix = Math.max(0, Math.min(1, params.mix));
    this.dryGain.gain.setTargetAtTime(1 - mix * 0.5, time, 0.02);
    this.wetGain.gain.setTargetAtTime(mix, time, 0.02);
  }
}
