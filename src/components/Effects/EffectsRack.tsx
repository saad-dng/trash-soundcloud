import React from 'react';
import { FXParams } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import { audioEngine } from '../../audio/AudioEngine';
import { Activity, Disc, Power, Sparkles, Volume2, Zap } from 'lucide-react';

interface EffectsRackProps {
  fxParams: FXParams;
  onFXChange: (params: FXParams) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({ fxParams, onFXChange }) => {
  const updateFX = (newParams: FXParams) => {
    onFXChange(newParams);
    audioEngine.updateFX(newParams);
  };

  return (
    <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <Zap className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
          Studio Effects Processor Rack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* FX MODULE 1: STEREO DELAY */}
        <div
          className={`bg-slate-900/60 p-3 rounded-xl border transition-all ${
            fxParams.delay.enabled
              ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              Ping-Pong Delay
            </span>
            <button
              type="button"
              onClick={() =>
                updateFX({
                  ...fxParams,
                  delay: { ...fxParams.delay, enabled: !fxParams.delay.enabled },
                })
              }
              className={`p-1 rounded-md border transition-colors ${
                fxParams.delay.enabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Power On / Bypass"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <Knob
              label="TIME"
              value={Math.round(fxParams.delay.time * 1000)}
              min={50}
              max={1000}
              unit="ms"
              color="#00f0ff"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  delay: { ...fxParams.delay, time: v / 1000 },
                })
              }
            />
            <Knob
              label="FEEDBACK"
              value={Math.round(fxParams.delay.feedback * 100)}
              min={0}
              max={92}
              unit="%"
              color="#00f0ff"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  delay: { ...fxParams.delay, feedback: v / 100 },
                })
              }
            />
            <Knob
              label="WET MIX"
              value={Math.round(fxParams.delay.mix * 100)}
              min={0}
              max={100}
              unit="%"
              color="#00f0ff"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  delay: { ...fxParams.delay, mix: v / 100 },
                })
              }
            />
          </div>
        </div>

        {/* FX MODULE 2: SHIMMER REVERB */}
        <div
          className={`bg-slate-900/60 p-3 rounded-xl border transition-all ${
            fxParams.reverb.enabled
              ? 'border-fuchsia-500/40 shadow-[0_0_15px_rgba(217,70,239,0.1)]'
              : 'border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase">
              Lush Reverb
            </span>
            <button
              type="button"
              onClick={() =>
                updateFX({
                  ...fxParams,
                  reverb: { ...fxParams.reverb, enabled: !fxParams.reverb.enabled },
                })
              }
              className={`p-1 rounded-md border transition-colors ${
                fxParams.reverb.enabled
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Power On / Bypass"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <Knob
              label="DECAY"
              value={Math.round(fxParams.reverb.decay * 10)}
              min={5}
              max={80}
              unit="s"
              formatDisplay={(v) => `${(v / 10).toFixed(1)}s`}
              color="#d946ef"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  reverb: { ...fxParams.reverb, decay: v / 10 },
                })
              }
            />
            <Knob
              label="DAMPING"
              value={fxParams.reverb.damping}
              min={1000}
              max={16000}
              step={200}
              unit="Hz"
              color="#d946ef"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  reverb: { ...fxParams.reverb, damping: v },
                })
              }
            />
            <Knob
              label="WET MIX"
              value={Math.round(fxParams.reverb.mix * 100)}
              min={0}
              max={100}
              unit="%"
              color="#d946ef"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  reverb: { ...fxParams.reverb, mix: v / 100 },
                })
              }
            />
          </div>
        </div>

        {/* FX MODULE 3: TUBE DISTORTION */}
        <div
          className={`bg-slate-900/60 p-3 rounded-xl border transition-all ${
            fxParams.distortion.enabled
              ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              : 'border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-red-400 uppercase">
              Drive / Saturator
            </span>
            <button
              type="button"
              onClick={() =>
                updateFX({
                  ...fxParams,
                  distortion: {
                    ...fxParams.distortion,
                    enabled: !fxParams.distortion.enabled,
                  },
                })
              }
              className={`p-1 rounded-md border transition-colors ${
                fxParams.distortion.enabled
                  ? 'bg-red-500/20 text-red-300 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Power On / Bypass"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            <Knob
              label="DRIVE"
              value={Math.round(fxParams.distortion.drive * 100)}
              min={0}
              max={100}
              unit="%"
              color="#ef4444"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  distortion: { ...fxParams.distortion, drive: v / 100 },
                })
              }
            />
            <Knob
              label="TONE"
              value={fxParams.distortion.tone}
              min={800}
              max={10000}
              step={100}
              unit="Hz"
              color="#ef4444"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  distortion: { ...fxParams.distortion, tone: v },
                })
              }
            />
            <Knob
              label="WET MIX"
              value={Math.round(fxParams.distortion.mix * 100)}
              min={0}
              max={100}
              unit="%"
              color="#ef4444"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  distortion: { ...fxParams.distortion, mix: v / 100 },
                })
              }
            />
          </div>
        </div>

        {/* FX MODULE 4: BITCRUSHER */}
        <div
          className={`bg-slate-900/60 p-3 rounded-xl border transition-all ${
            fxParams.bitcrusher.enabled
              ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'border-slate-800/60 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
              Lo-Fi Bitcrusher
            </span>
            <button
              type="button"
              onClick={() =>
                updateFX({
                  ...fxParams,
                  bitcrusher: {
                    ...fxParams.bitcrusher,
                    enabled: !fxParams.bitcrusher.enabled,
                  },
                })
              }
              className={`p-1 rounded-md border transition-colors ${
                fxParams.bitcrusher.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Power On / Bypass"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Knob
              label="RESOLUTION"
              value={fxParams.bitcrusher.bits}
              min={3}
              max={16}
              step={1}
              unit="-bit"
              color="#10b981"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  bitcrusher: { ...fxParams.bitcrusher, bits: v },
                })
              }
            />
            <Knob
              label="WET MIX"
              value={Math.round(fxParams.bitcrusher.mix * 100)}
              min={0}
              max={100}
              unit="%"
              color="#10b981"
              size={46}
              onChange={(v) =>
                updateFX({
                  ...fxParams,
                  bitcrusher: { ...fxParams.bitcrusher, mix: v / 100 },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
