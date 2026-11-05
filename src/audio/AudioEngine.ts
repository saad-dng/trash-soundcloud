import { audioCtxManager } from './AudioContext';
import { PolySynth } from './synths/PolySynth';
import { AcidSynth } from './synths/AcidSynth';
import { DrumSynth } from './synths/DrumSynth';
import { PadSynth } from './synths/PadSynth';
import { DelayEffect } from './effects/DelayEffect';
import { ReverbEffect } from './effects/ReverbEffect';
import { DistortionEffect } from './effects/DistortionEffect';
import { BitcrusherEffect } from './effects/BitcrusherEffect';
import { WavRecorder } from './WavRecorder';
import { FXParams, MasterParams, Track } from '../types/synth';

export class AudioEngine {
  public ctx: AudioContext;
  public polySynth: PolySynth;
  public acidSynth: AcidSynth;
  public drumSynth: DrumSynth;
  public padSynth: PadSynth;

  public delay: DelayEffect;
  public reverb: ReverbEffect;
  public distortion: DistortionEffect;
  public bitcrusher: BitcrusherEffect;

  public masterGain: GainNode;
  public recorder: WavRecorder;

  // Track busses & channel gains
  public trackGains: Map<string, GainNode> = new Map();

  // Playback / Sequencer state
  public isPlaying: boolean = false;
  private currentStep: number = 0;
  private nextStepTime: number = 0;
  private timerId: number | null = null;
  private tracks: Track[] = [];
  private onStepCallback: ((step: number) => void) | null = null;

  public masterParams: MasterParams = {
    bpm: 124,
    swing: 0.50,
    volume: 0.85,
    limiter: true,
  };

  constructor() {
    this.ctx = audioCtxManager.getContext();

    // Instantiate instruments
    this.polySynth = new PolySynth(this.ctx);
    this.acidSynth = new AcidSynth(this.ctx);
    this.drumSynth = new DrumSynth(this.ctx);
    this.padSynth = new PadSynth(this.ctx);

    // Instantiate effects
    this.delay = new DelayEffect(this.ctx);
    this.reverb = new ReverbEffect(this.ctx);
    this.distortion = new DistortionEffect(this.ctx);
    this.bitcrusher = new BitcrusherEffect(this.ctx);

    this.masterGain = audioCtxManager.getMasterGain();
    this.recorder = new WavRecorder(this.ctx);

    this.routeAudioGraph();
    this.initMidi();
  }

  private routeAudioGraph() {
    // Effects Chain:
    // Instrument track gains -> Distortion -> Bitcrusher -> Delay -> Reverb -> MasterGain
    const fxBus = this.ctx.createGain();
    fxBus.gain.value = 1.0;

    fxBus.connect(this.distortion.input);
    this.distortion.output.connect(this.bitcrusher.input);
    this.bitcrusher.output.connect(this.delay.input);
    this.delay.output.connect(this.reverb.input);
    this.reverb.output.connect(this.masterGain);

    // Connect instruments to the effects bus
    this.polySynth.output.connect(fxBus);
    this.acidSynth.output.connect(fxBus);
    this.drumSynth.output.connect(fxBus);
    this.padSynth.output.connect(fxBus);
  }

  private initMidi() {
    if (typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator) {
      navigator.requestMIDIAccess().then(
        (midiAccess) => {
          for (const input of midiAccess.inputs.values()) {
            input.onmidimessage = (msg) => this.handleMidiMessage(msg);
          }
        },
        () => {
          // MIDI not available or permission denied - graceful fallback
        }
      );
    }
  }

  private handleMidiMessage(msg: any) {
    if (!msg.data || msg.data.length < 2) return;
    const [status, noteNum, velocity] = msg.data;
    const command = status >> 4;
    const noteName = this.midiNoteToName(noteNum);
    // 9 = note on, 8 = note off
    if (command === 9 && velocity > 0) {
      this.polySynth.noteOn(noteName, velocity / 127);
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      this.polySynth.stopAll();
    }
  }

  private midiNoteToName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = notes[midi % 12];
    return `${note}${octave}`;
  }

  public setTracks(tracks: Track[]) {
    this.tracks = tracks;
  }

  public setOnStepCallback(cb: (step: number) => void) {
    this.onStepCallback = cb;
  }

  public updateFX(params: FXParams) {
    this.delay.updateParams(params.delay);
    this.reverb.updateParams(params.reverb);
    this.distortion.updateParams(params.distortion);
    this.bitcrusher.updateParams(params.bitcrusher);
  }

  public setBPM(bpm: number) {
    this.masterParams.bpm = Math.max(40, Math.min(240, bpm));
  }

  public setSwing(swing: number) {
    this.masterParams.swing = Math.max(0.5, Math.min(0.75, swing));
  }

  public setMasterVolume(vol: number) {
    this.masterParams.volume = vol;
    audioCtxManager.setMasterVolume(vol);
  }

  public async start() {
    await audioCtxManager.unlock();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;
    this.scheduleLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.polySynth.stopAll();
    this.acidSynth.stopAll();
    this.padSynth.stopAll();
    this.currentStep = 0;
    if (this.onStepCallback) {
      this.onStepCallback(0);
    }
  }

  /**
   * Lookahead Scheduler
   * Schedules events up to 100ms in advance with sub-millisecond Web Audio precision.
   */
  private scheduleLoop = () => {
    if (!this.isPlaying) return;

    const scheduleAheadTime = 0.1; // 100ms lookahead

    while (this.nextStepTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 25);
  };

  private advanceStep() {
    // 16th note step duration in seconds
    const secondsPerBeat = 60.0 / this.masterParams.bpm;
    const baseStepDuration = secondsPerBeat / 4.0;

    // Apply swing to even-numbered steps (0-indexed: step 1, 3, 5, etc.)
    const isEvenStep = this.currentStep % 2 === 1;
    const swingFactor = isEvenStep ? (this.masterParams.swing - 0.5) * 2 : 0;
    const stepDuration = baseStepDuration + (isEvenStep ? swingFactor * baseStepDuration * 0.4 : -swingFactor * baseStepDuration * 0.4);

    this.nextStepTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleStep(stepIndex: number, time: number) {
    // Notify UI synchronously with the audio step trigger
    const delayFromNow = Math.max(0, (time - this.ctx.currentTime) * 1000);
    setTimeout(() => {
      if (this.isPlaying && this.onStepCallback) {
        this.onStepCallback(stepIndex);
      }
    }, delayFromNow);

    // Check if any track is soloed
    const hasSolo = this.tracks.some(t => t.solo);

    for (const track of this.tracks) {
      if (track.mute) continue;
      if (hasSolo && !track.solo) continue;

      const step = track.steps[stepIndex];
      if (!step || !step.active) continue;

      // Probability check
      if (step.probability < 100 && Math.random() * 100 > step.probability) {
        continue;
      }

      const effectiveVelocity = step.velocity * track.volume;
      const secondsPerBeat = 60.0 / this.masterParams.bpm;
      const gateDuration = (secondsPerBeat / 4.0) * step.gate;

      switch (track.type) {
        case 'kick':
        case 'snare':
        case 'hihat':
        case 'openhat':
        case 'clap':
        case 'zap':
        case 'tom':
          this.drumSynth.triggerSound(track.type, time, effectiveVelocity);
          break;

        case 'lead':
          this.polySynth.triggerNote(step.note, effectiveVelocity, time, gateDuration);
          break;

        case 'bass':
          this.acidSynth.triggerNote(
            step.note,
            effectiveVelocity,
            step.slide || false,
            step.accent || false,
            time,
            gateDuration
          );
          break;

        case 'pad':
          this.padSynth.triggerChord([step.note], effectiveVelocity, time, gateDuration * 1.5);
          break;
      }
    }
  }

  // Kaoss Pad Touch sweep
  public setKaossControl(x: number, y: number) {
    // x: 0..1 (Filter Cutoff)
    // y: 0..1 (Filter Resonance / Delay Mix)
    const time = this.ctx.currentTime;
    const cutoff = 60 + Math.pow(x, 2.5) * 16000;
    const res = 1 + y * 20;

    this.polySynth.updateParams({
      filterCutoff: cutoff,
      filterResonance: res,
    });

    this.delay.updateParams({
      enabled: true,
      time: 0.15 + (1 - x) * 0.4,
      feedback: 0.2 + y * 0.55,
      pingPong: true,
      mix: 0.1 + y * 0.45,
    });
  }

  // Recording controls
  public async toggleRecording(): Promise<Blob | null> {
    if (this.recorder.getIsRecording()) {
      return await this.recorder.stop();
    } else {
      await audioCtxManager.unlock();
      this.recorder.start(this.masterGain);
      return null;
    }
  }

  public getIsRecording(): boolean {
    return this.recorder.getIsRecording();
  }
}

export const audioEngine = new AudioEngine();
