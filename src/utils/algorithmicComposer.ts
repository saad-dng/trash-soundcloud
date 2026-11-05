import { Preset, ScaleMode, Step, Track } from '../types/synth';
import { generateEuclideanRhythm, getScaleNotes, NOTE_NAMES } from './musicTheory';

export function generateAlgorithmicTrack(genre: 'synthwave' | 'techno' | 'ambient' | 'chillhop' = 'synthwave'): Preset {
  const rootNotes = ['A', 'C', 'D', 'F', 'G'];
  const rootNote = rootNotes[Math.floor(Math.random() * rootNotes.length)];

  let scale: ScaleMode = 'natural_minor';
  let bpm = 124;

  if (genre === 'techno') {
    scale = Math.random() > 0.5 ? 'hirajoshi' : 'phrygian';
    bpm = Math.floor(130 + Math.random() * 10);
  } else if (genre === 'ambient') {
    scale = 'pentatonic_minor';
    bpm = Math.floor(68 + Math.random() * 12);
  } else if (genre === 'chillhop') {
    scale = 'dorian';
    bpm = Math.floor(82 + Math.random() * 8);
  } else {
    scale = 'natural_minor';
    bpm = Math.floor(122 + Math.random() * 8);
  }

  const bassScaleNotes = getScaleNotes(rootNote, scale, 2, 1);
  const leadScaleNotes = getScaleNotes(rootNote, scale, 4, 2);
  const padScaleNotes = getScaleNotes(rootNote, scale, 3, 1);

  // Euclidean rhythms for percussion
  const kickEuclid = genre === 'ambient' ? generateEuclideanRhythm(2, 16) : generateEuclideanRhythm(4, 16);
  const snareSteps = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
  const hihatEuclid = genre === 'ambient' ? generateEuclideanRhythm(5, 16) : generateEuclideanRhythm(10, 16);
  const zapEuclid = generateEuclideanRhythm(genre === 'techno' ? 6 : 3, 16);

  // Generate melodic lead steps
  const leadSteps: Step[] = [];
  const leadDensity = genre === 'ambient' ? 0.35 : 0.65;
  for (let i = 0; i < 16; i++) {
    const active = Math.random() < leadDensity;
    const note = leadScaleNotes[Math.floor(Math.random() * leadScaleNotes.length)];
    leadSteps.push({
      active,
      note,
      octave: 4,
      velocity: 0.7 + Math.random() * 0.25,
      gate: 0.5 + Math.random() * 0.3,
      probability: 100,
    });
  }

  // Generate bass steps
  const bassSteps: Step[] = [];
  for (let i = 0; i < 16; i++) {
    const isBeat = i % 2 === 0;
    const active = isBeat || (Math.random() < 0.35);
    const note = active ? bassScaleNotes[Math.floor(Math.random() * bassScaleNotes.length)] : bassScaleNotes[0];
    const slide = Math.random() < 0.25;
    const accent = i % 4 === 0 || Math.random() < 0.2;
    bassSteps.push({
      active,
      note,
      octave: 2,
      velocity: accent ? 0.95 : 0.75,
      gate: slide ? 0.9 : 0.6,
      probability: 100,
      slide,
      accent,
    });
  }

  // Generate pad chords (held notes)
  const padSteps: Step[] = [];
  for (let i = 0; i < 16; i++) {
    const active = i === 0 || i === 8;
    const note = active ? (i === 0 ? padScaleNotes[0] : padScaleNotes[Math.min(2, padScaleNotes.length - 1)]) : padScaleNotes[0];
    padSteps.push({
      active,
      note,
      octave: 3,
      velocity: 0.75,
      gate: 1.0,
      probability: 100,
    });
  }

  const tracks: Track[] = [
    {
      id: 'kick',
      name: 'Kick Drum',
      type: 'kick',
      color: '#ff0055',
      volume: 0.95,
      pan: 0,
      mute: false,
      solo: false,
      steps: kickEuclid.map((active) => ({
        active,
        note: 'C1',
        octave: 1,
        velocity: 1.0,
        gate: 0.8,
        probability: 100,
      })),
    },
    {
      id: 'snare',
      name: 'Snare / Clap',
      type: 'snare',
      color: '#ff7700',
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      steps: snareSteps.map((active) => ({
        active,
        note: 'D2',
        octave: 2,
        velocity: 0.9,
        gate: 0.8,
        probability: 100,
      })),
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      type: 'hihat',
      color: '#ffea00',
      volume: 0.75,
      pan: -0.1,
      mute: false,
      solo: false,
      steps: hihatEuclid.map((active, i) => ({
        active,
        note: 'F#2',
        octave: 2,
        velocity: i % 2 === 0 ? 0.85 : 0.55,
        gate: 0.6,
        probability: 100,
      })),
    },
    {
      id: 'zap',
      name: 'Cyber Perc',
      type: 'zap',
      color: '#00f0ff',
      volume: 0.7,
      pan: 0.2,
      mute: false,
      solo: false,
      steps: zapEuclid.map((active) => ({
        active,
        note: 'C4',
        octave: 4,
        velocity: 0.8,
        gate: 0.5,
        probability: 100,
      })),
    },
    {
      id: 'bass',
      name: 'Acid Bassline',
      type: 'bass',
      color: '#00ff66',
      volume: 0.9,
      pan: 0,
      mute: false,
      solo: false,
      steps: bassSteps,
    },
    {
      id: 'lead',
      name: 'Generative Lead',
      type: 'lead',
      color: '#bf00ff',
      volume: 0.85,
      pan: 0.1,
      mute: false,
      solo: false,
      steps: leadSteps,
    },
    {
      id: 'pad',
      name: 'Atmosphere Pad',
      type: 'pad',
      color: '#00ffa6',
      volume: 0.7,
      pan: -0.1,
      mute: false,
      solo: false,
      steps: padSteps,
    },
  ];

  return {
    id: `procedural_${Date.now()}`,
    name: `Algorithmic ${genre.toUpperCase()} #${Math.floor(Math.random() * 900 + 100)}`,
    genre: `${genre.toUpperCase()} (AI Procedural)`,
    description: `Procedurally generated ${genre} sequence using Euclidean polyrhythms and harmonic ${scale} scale quantization.`,
    bpm,
    scale,
    rootNote,
    tracks,
    synthParams: {
      osc1Wave: 'sawtooth',
      osc1Octave: 0,
      osc1Detune: -7,
      osc2Wave: 'square',
      osc2Octave: 1,
      osc2Detune: 9,
      oscMix: 0.5,
      subLevel: 0.3,
      noiseLevel: 0.04,
      glide: 0.03,
      filterType: 'lowpass',
      filterCutoff: 3400,
      filterResonance: 4.0,
      filterEnvAmount: 0.6,
      ampEnv: { attack: 0.015, decay: 0.25, sustain: 0.5, release: 0.35 },
      filterEnv: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.4 },
      lfoRate: 3.5,
      lfoDepth: 0.2,
      lfoTarget: 'cutoff',
    },
    bassParams: {
      wave: genre === 'techno' ? 'square' : 'sawtooth',
      cutoff: 1100,
      resonance: 12,
      envMod: 0.8,
      decay: 0.25,
      accent: 0.6,
      overdrive: 0.45,
      slideTime: 0.08,
    },
    padParams: {
      wave: 'sawtooth',
      detuneSpread: 24,
      cutoff: 1800,
      resonance: 2.0,
      attack: 0.6,
      release: 1.4,
      chorusMix: 0.5,
    },
    fxParams: {
      delay: { enabled: true, time: 0.32, feedback: 0.45, pingPong: true, mix: 0.32 },
      reverb: { enabled: true, decay: 3.0, damping: 7000, mix: 0.35 },
      distortion: { enabled: true, drive: 0.35, tone: 4500, mix: 0.25 },
      bitcrusher: { enabled: false, bits: 8, normFreq: 0.5, mix: 0.0 },
    },
  };
}
