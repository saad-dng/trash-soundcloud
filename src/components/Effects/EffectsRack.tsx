import React from 'react';
import { FXParams } from '../../types/synth';
import { Knob } from '../Controls/Knob';
import { audioEngine } from '../../audio/AudioEngine';
import { Power, SlidersHorizontal } from 'lucide-react';

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
    <div className="w-full bg-[#1b1511] rounded-2xl border border-[#2e241d] p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#2e241d] pb-3 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-[#d99b61]" />
        <h2 className="text-sm font-mono font-bold tracking-wider text-[#f4ece4] uppercase">
          Studio Effects Processor Rack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* FX MODULE 1: STEREO DELAY */}
        <div
          className={`bg-[#201915] p-3 rounded-xl border transition-all ${
            fxParams.delay.enabled
              ? 'border-[#3d3127] shadow-sm'
              : 'border-[#241c16] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-[#e8cca7] uppercase">
              Analog Delay
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
                  ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] shadow-sm'
                  : 'bg-[#28201a] text-[#6e5d50] border-[#382d24]'
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
              color="#d99b61"
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
              color="#d99b61"
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
              color="#e8cca7"
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
          className={`bg-[#201915] p-3 rounded-xl border transition-all ${
            fxParams.reverb.enabled
              ? 'border-[#3d3127] shadow-sm'
              : 'border-[#241c16] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-[#e8cca7] uppercase">
              Warm Reverb
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
                  ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] shadow-sm'
                  : 'bg-[#28201a] text-[#6e5d50] border-[#382d24]'
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
              color="#d99b61"
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
              color="#d99b61"
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
              color="#e8cca7"
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
          className={`bg-[#201915] p-3 rounded-xl border transition-all ${
            fxParams.distortion.enabled
              ? 'border-[#3d3127] shadow-sm'
              : 'border-[#241c16] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-[#e8cca7] uppercase">
              Tape Drive
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
                  ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] shadow-sm'
                  : 'bg-[#28201a] text-[#6e5d50] border-[#382d24]'
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
              color="#d99b61"
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
              color="#d99b61"
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
              color="#e8cca7"
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
          className={`bg-[#201915] p-3 rounded-xl border transition-all ${
            fxParams.bitcrusher.enabled
              ? 'border-[#3d3127] shadow-sm'
              : 'border-[#241c16] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-2">
            <span className="text-xs font-mono font-bold text-[#e8cca7] uppercase">
              Vinyl Crunch
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
                  ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61] shadow-sm'
                  : 'bg-[#28201a] text-[#6e5d50] border-[#382d24]'
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
              color="#d99b61"
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
              color="#e8cca7"
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
