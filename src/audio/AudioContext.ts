/**
 * Web Audio Context Manager
 * Handles audio context lifecycle, master bus, analyser, and limiter.
 */

class AudioContextManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isUnlocked: boolean = false;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.setupMasterChain();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  public getAnalyser(): AnalyserNode {
    this.getContext();
    return this.analyser!;
  }

  public getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  public getMasterOutput(): AudioNode {
    this.getContext();
    return this.masterGain!;
  }

  private setupMasterChain() {
    if (!this.ctx) return;

    // Analyser node for visualizers
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;

    // Master Dynamics Compressor (Acting as Master Limiter / Bus Glue)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master Gain control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Chain: MasterGain -> Compressor -> Analyser -> Destination
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public unlock(): Promise<void> {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') {
      return Promise.resolve();
    }

    const ctx = this.getContext();
    return ctx.resume().then(() => {
      this.isUnlocked = true;
    });
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, val));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
  }

  public getTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }
}

export const audioCtxManager = new AudioContextManager();
