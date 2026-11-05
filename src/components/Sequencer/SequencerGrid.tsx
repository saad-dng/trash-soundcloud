import React, { useState } from 'react';
import { InstrumentType, Step, Track } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import { NOTE_NAMES, generateEuclideanRhythm } from '../../utils/musicTheory';
import {
  Dice5,
  Edit3,
  Sliders,
  Trash2,
  Volume2,
  VolumeX,
  Wand,
} from 'lucide-react';

interface SequencerGridProps {
  tracks: Track[];
  currentStep: number;
  isPlaying: boolean;
  onTrackChange: (tracks: Track[]) => void;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  tracks,
  currentStep,
  isPlaying,
  onTrackChange,
}) => {
  const [editingStep, setEditingStep] = useState<{
    trackIndex: number;
    stepIndex: number;
    step: Step;
  } | null>(null);

  const [euclideanModalTrack, setEuclideanModalTrack] = useState<number | null>(null);
  const [euclidPulses, setEuclidPulses] = useState<number>(4);

  // Toggle step active state
  const handleStepClick = (trackIndex: number, stepIndex: number) => {
    const updated = tracks.map((track, tIdx) => {
      if (tIdx !== trackIndex) return track;
      const steps = [...track.steps];
      steps[stepIndex] = {
        ...steps[stepIndex],
        active: !steps[stepIndex].active,
      };
      return { ...track, steps };
    });
    onTrackChange(updated);
  };

  // Toggle Mute
  const handleToggleMute = (trackIndex: number) => {
    const updated = tracks.map((t, i) => (i === trackIndex ? { ...t, mute: !t.mute } : t));
    onTrackChange(updated);
  };

  // Toggle Solo
  const handleToggleSolo = (trackIndex: number) => {
    const updated = tracks.map((t, i) => (i === trackIndex ? { ...t, solo: !t.solo } : t));
    onTrackChange(updated);
  };

  // Clear Track
  const handleClearTrack = (trackIndex: number) => {
    const updated = tracks.map((track, tIdx) => {
      if (tIdx !== trackIndex) return track;
      const steps = track.steps.map((s) => ({ ...s, active: false }));
      return { ...track, steps };
    });
    onTrackChange(updated);
  };

  // Randomize Track Pattern
  const handleRandomizeTrack = (trackIndex: number) => {
    const updated = tracks.map((track, tIdx) => {
      if (tIdx !== trackIndex) return track;
      const steps = track.steps.map((s) => ({
        ...s,
        active: Math.random() < 0.4,
        velocity: 0.6 + Math.random() * 0.4,
      }));
      return { ...track, steps };
    });
    onTrackChange(updated);
  };

  // Apply Euclidean Rhythm
  const handleApplyEuclid = () => {
    if (euclideanModalTrack === null) return;
    const pattern = generateEuclideanRhythm(euclidPulses, 16);
    const updated = tracks.map((track, tIdx) => {
      if (tIdx !== euclideanModalTrack) return track;
      const steps = track.steps.map((s, i) => ({
        ...s,
        active: pattern[i],
      }));
      return { ...track, steps };
    });
    onTrackChange(updated);
    setEuclideanModalTrack(null);
  };

  // Save Step Edit Modal
  const handleSaveStep = (newStep: Step) => {
    if (!editingStep) return;
    const { trackIndex, stepIndex } = editingStep;
    const updated = tracks.map((track, tIdx) => {
      if (tIdx !== trackIndex) return track;
      const steps = [...track.steps];
      steps[stepIndex] = newStep;
      return { ...track, steps };
    });
    onTrackChange(updated);
    setEditingStep(null);
  };

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
      {/* Sequencer Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
            16-Step Multitrack Sequencer
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Tip: Click step to toggle • Right-click to edit pitch & velocity
        </div>
      </div>

      {/* Step Numbers Playhead Indicator Bar */}
      <div className="flex items-center mt-3 mb-2">
        <div className="w-52 shrink-0 hidden md:block text-[10px] font-mono uppercase tracking-wider text-slate-400 pl-2">
          Track Info
        </div>
        <div className="flex-1 grid grid-cols-16 gap-1 md:gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCurrent = isPlaying && currentStep === i;
            const isBeatStart = i % 4 === 0;
            return (
              <div
                key={i}
                className={`text-center py-1 rounded text-[10px] font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.8)] scale-105'
                    : isBeatStart
                    ? 'bg-slate-800/90 text-cyan-300'
                    : 'bg-slate-900/60 text-slate-400'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Track Rows */}
      <div className="space-y-2 mt-2">
        {tracks.map((track, trackIdx) => {
          return (
            <div
              key={track.id}
              className={`flex flex-col md:flex-row items-stretch md:items-center gap-2 p-2 rounded-xl border transition-all ${
                track.mute
                  ? 'bg-slate-950/40 border-slate-900 opacity-50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Track Left Info Column */}
              <div className="w-full md:w-52 shrink-0 flex items-center justify-between pr-2">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: track.color, color: track.color }}
                  />
                  <span className="text-xs font-mono font-bold text-slate-200 truncate">
                    {track.name}
                  </span>
                </div>

                {/* Track Solo / Mute / Tools Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleMute(trackIdx)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                      track.mute
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                    title="Mute Track"
                  >
                    M
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSolo(trackIdx)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                      track.solo
                        ? 'bg-amber-500/30 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                    title="Solo Track"
                  >
                    S
                  </button>

                  {/* Euclidean Generator Button */}
                  <button
                    type="button"
                    onClick={() => setEuclideanModalTrack(trackIdx)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/60"
                    title="Generate Euclidean Rhythm"
                  >
                    <Wand className="w-3 h-3" />
                  </button>

                  {/* Randomize Track Button */}
                  <button
                    type="button"
                    onClick={() => handleRandomizeTrack(trackIdx)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                    title="Randomize Track"
                  >
                    <Dice5 className="w-3 h-3" />
                  </button>

                  {/* Clear Track */}
                  <button
                    type="button"
                    onClick={() => handleClearTrack(trackIdx)}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 border border-slate-700/60"
                    title="Clear Track Steps"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 16 Step Buttons */}
              <div className="flex-1 grid grid-cols-16 gap-1 md:gap-1.5">
                {track.steps.map((step, stepIdx) => {
                  const isCurrent = isPlaying && currentStep === stepIdx;
                  const isBeatStart = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      type="button"
                      onClick={() => handleStepClick(trackIdx, stepIdx)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setEditingStep({ trackIndex: trackIdx, stepIndex: stepIdx, step });
                      }}
                      className={`relative h-11 md:h-12 rounded-lg flex flex-col items-center justify-between p-1 transition-all active:scale-95 border ${
                        step.active
                          ? 'border-transparent text-slate-950 font-bold shadow-md'
                          : isBeatStart
                          ? 'bg-slate-950/80 border-slate-700/60 hover:bg-slate-800/80 text-slate-400'
                          : 'bg-slate-950/40 border-slate-800/40 hover:bg-slate-800/60 text-slate-500'
                      } ${
                        isCurrent
                          ? 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-950 scale-105'
                          : ''
                      }`}
                      style={{
                        backgroundColor: step.active ? track.color : undefined,
                        boxShadow: step.active
                          ? `0 0 14px ${track.color}80, inset 0 1px 1px rgba(255,255,255,0.4)`
                          : undefined,
                      }}
                      title={`${track.name} Step ${stepIdx + 1} (${step.note}) - Click to toggle, right-click to edit`}
                    >
                      {/* Note name display for tonal synths */}
                      <span
                        className={`text-[9px] font-mono leading-none truncate w-full text-center ${
                          step.active ? 'text-slate-950 font-extrabold' : 'opacity-40'
                        }`}
                      >
                        {track.type === 'bass' || track.type === 'lead' || track.type === 'pad'
                          ? step.note
                          : ''}
                      </span>

                      {/* Velocity bar preview */}
                      <div className="w-full flex items-center justify-center gap-0.5 h-1">
                        {step.active && (
                          <div
                            className="h-1 rounded-full bg-slate-950/70"
                            style={{ width: `${Math.round(step.velocity * 100)}%` }}
                          />
                        )}
                      </div>

                      {/* Slide or Accent badge */}
                      <div className="flex items-center gap-0.5">
                        {step.slide && (
                          <span className="text-[7px] font-mono leading-none px-0.5 bg-slate-950/60 text-white rounded">
                            ~
                          </span>
                        )}
                        {step.accent && (
                          <span className="text-[7px] font-mono leading-none px-0.5 bg-slate-950/60 text-white rounded">
                            !
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Detail Edit Modal */}
      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-cyan-300">
                Edit Step {editingStep.stepIndex + 1} (
                {tracks[editingStep.trackIndex].name})
              </h3>
              <button
                type="button"
                onClick={() => setEditingStep(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {/* Note Selector */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Pitch / Note
              </label>
              <div className="grid grid-cols-6 gap-1">
                {NOTE_NAMES.map((n) => {
                  const curNote = editingStep.step.note.replace(/\d+/, '');
                  const curOctave = editingStep.step.octave;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setEditingStep({
                          ...editingStep,
                          step: { ...editingStep.step, note: `${n}${curOctave}` },
                        })
                      }
                      className={`text-xs font-mono py-1 rounded border ${
                        curNote === n
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Octave selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Octave</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((oct) => {
                  const noteBase = editingStep.step.note.replace(/\d+/, '');
                  return (
                    <button
                      key={oct}
                      type="button"
                      onClick={() =>
                        setEditingStep({
                          ...editingStep,
                          step: {
                            ...editingStep.step,
                            octave: oct,
                            note: `${noteBase}${oct}`,
                          },
                        })
                      }
                      className={`w-7 h-7 rounded text-xs font-mono border ${
                        editingStep.step.octave === oct
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {oct}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Velocity Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Velocity</span>
                <span>{Math.round(editingStep.step.velocity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={editingStep.step.velocity}
                onChange={(e) =>
                  setEditingStep({
                    ...editingStep,
                    step: {
                      ...editingStep.step,
                      velocity: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Probability Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Trigger Probability</span>
                <span>{editingStep.step.probability}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={editingStep.step.probability}
                onChange={(e) =>
                  setEditingStep({
                    ...editingStep,
                    step: {
                      ...editingStep.step,
                      probability: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Slide & Accent Toggles for 303 */}
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingStep.step.slide || false}
                  onChange={(e) =>
                    setEditingStep({
                      ...editingStep,
                      step: { ...editingStep.step, slide: e.target.checked },
                    })
                  }
                  className="rounded accent-cyan-400"
                />
                <span>Slide (Portamento)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingStep.step.accent || false}
                  onChange={(e) =>
                    setEditingStep({
                      ...editingStep,
                      step: { ...editingStep.step, accent: e.target.checked },
                    })
                  }
                  className="rounded accent-cyan-400"
                />
                <span>Accent</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingStep(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveStep(editingStep.step)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
              >
                Save Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Euclidean Rhythm Generator Modal */}
      {euclideanModalTrack !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-mono font-bold text-cyan-300">
              Euclidean Rhythm Generator ({tracks[euclideanModalTrack].name})
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Distribute rhythmic pulses evenly across 16 steps using Euclidean geometry.
            </p>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Pulses</span>
                <span>{euclidPulses} of 16 steps</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={euclidPulses}
                onChange={(e) => setEuclidPulses(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Pattern Preview */}
            <div className="grid grid-cols-16 gap-1 p-2 bg-slate-950 rounded-lg">
              {generateEuclideanRhythm(euclidPulses, 16).map((active, i) => (
                <div
                  key={i}
                  className={`h-6 rounded flex items-center justify-center text-[9px] font-mono font-bold ${
                    active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {active ? '●' : '·'}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEuclideanModalTrack(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyEuclid}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md"
              >
                Apply Rhythm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
