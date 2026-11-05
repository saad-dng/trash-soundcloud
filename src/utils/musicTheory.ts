import { ScaleMode } from '../types/synth';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<ScaleMode, number[]> = {
  natural_minor: [0, 2, 3, 5, 7, 8, 10], // Aeolian
  pentatonic_minor: [0, 3, 5, 7, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  hirajoshi: [0, 2, 3, 7, 8],            // Authentic Cyberpunk / Anime Neo-Tokyo sound
  blues: [0, 3, 5, 6, 7, 10],
};

/**
 * Convert note name (e.g. "C4", "F#3") to frequency in Hz.
 */
export function noteToFreq(note: string): number {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 440;

  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return 440;

  // MIDI number: C4 is 60 (A4 is 69 = 440Hz)
  const midi = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convert MIDI note number to Note Name (e.g. 60 -> "C4")
 */
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Get all available notes for a given root note, scale, and octave range.
 */
export function getScaleNotes(rootNote: string = 'A', scaleMode: ScaleMode = 'natural_minor', startOctave: number = 2, octaves: number = 3): string[] {
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  const safeRoot = rootIndex >= 0 ? rootIndex : 0;
  const intervals = SCALES[scaleMode] || SCALES.natural_minor;
  const notes: string[] = [];

  for (let oct = startOctave; oct < startOctave + octaves; oct++) {
    for (const interval of intervals) {
      const midi = (oct + 1) * 12 + safeRoot + interval;
      notes.push(midiToNoteName(midi));
    }
  }

  return notes;
}

/**
 * Quantize any arbitrary MIDI note or note name to the nearest note in the given scale.
 */
export function quantizeToScale(noteName: string, rootNote: string, scaleMode: ScaleMode): string {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return noteName;

  const octave = parseInt(match[2], 10);
  const scaleNotes = getScaleNotes(rootNote, scaleMode, octave, 1);
  if (scaleNotes.length === 0) return noteName;

  const targetFreq = noteToFreq(noteName);
  let closest = scaleNotes[0];
  let minDiff = Infinity;

  for (const sn of scaleNotes) {
    const diff = Math.abs(noteToFreq(sn) - targetFreq);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sn;
    }
  }

  return closest;
}

/**
 * Euclidean rhythm algorithm (Bjorklund's algorithm).
 * Generates mathematically balanced rhythmic pulses.
 * e.g., 5 pulses in 16 steps = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0]
 */
export function generateEuclideanRhythm(pulses: number, steps: number = 16): boolean[] {
  if (pulses <= 0) return new Array(steps).fill(false);
  if (pulses >= steps) return new Array(steps).fill(true);

  // Bresenham-based Euclidean distribution
  const pattern: boolean[] = [];
  let accumulator = 0;

  for (let i = 0; i < steps; i++) {
    accumulator += pulses;
    if (accumulator >= steps) {
      accumulator -= steps;
      pattern.push(true);
    } else {
      pattern.push(false);
    }
  }

  return pattern;
}

