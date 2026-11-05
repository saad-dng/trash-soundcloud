import React, { useEffect, useRef } from 'react';
import { audioCtxManager } from '../../audio/AudioContext';
import { VisualizerMode, VisualizerSettings } from '../../types/synth';
import { Activity, Disc, Sparkles, Waves } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface VisualizerCanvasProps {
  settings: VisualizerSettings;
  onSettingsChange: (settings: VisualizerSettings) => void;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ settings, onSettingsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef<number>(0);

  // Initialize cozy ambient floating dust particles
  useEffect(() => {
    const numParticles = 80;
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioCtxManager.getAnalyser();
    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // Average bass energy
      let bassEnergy = 0;
      for (let i = 0; i < 16; i++) {
        bassEnergy += freqData[i];
      }
      bassEnergy = bassEnergy / (16 * 255);

      // Deep rich espresso background
      ctx.fillStyle = '#16110f';
      ctx.fillRect(0, 0, width, height);

      // Subtle warm vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.7);
      vignette.addColorStop(0, 'rgba(38, 30, 24, 0.4)');
      vignette.addColorStop(1, 'rgba(16, 12, 10, 0.9)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Cozy Palette: strictly two main accents (Caramel + Cream)
      const primaryColor = settings.colorScheme === 'soft_latte'
        ? 'rgba(232, 204, 167, ALPHA)' // Cream Latte
        : 'rgba(217, 155, 97, ALPHA)'; // Warm Caramel

      const secondaryColor = settings.colorScheme === 'soft_latte'
        ? 'rgba(222, 184, 135, ALPHA)' // Soft Biscuit
        : 'rgba(232, 204, 167, ALPHA)'; // Cream Latte

      const getCol = (colStr: string, a: number) => colStr.replace('ALPHA', a.toFixed(2));

      if (settings.mode === 'warm_oscilloscope') {
        // --- MODE 1: SILKY WARM OSCILLOSCOPE ---
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = getCol(primaryColor, 0.9);
        if (settings.bloom) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = getCol(primaryColor, 0.5);
        }

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();

        // Subtle warm secondary harmonic wave
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = getCol(secondaryColor, 0.4);
        ctx.shadowBlur = 0;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i += 2) {
          const v = (timeData[i] / 128.0 - 1.0) * 1.3 + 1.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth * 2;
        }
        ctx.stroke();

        // Elegant center axis line
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(232, 204, 167, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.restore();

      } else if (settings.mode === 'latte_ripples') {
        // --- MODE 2: HARMONIC LATTE RIPPLES ---
        ctx.save();
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.22 + bassEnergy * 15;
        const numBars = 96;
        rotationRef.current += 0.003 + bassEnergy * 0.008;

        // Warm latte center glow
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.85);
        coreGrad.addColorStop(0, getCol(secondaryColor, 0.25 + bassEnergy * 0.2));
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Radiating ripple spokes
        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 + rotationRef.current;
          const dataIdx = Math.floor((i / numBars) * 120);
          const barHeight = (freqData[dataIdx] / 255.0) * (Math.min(width, height) * 0.25) * settings.sensitivity;

          const x1 = cx + Math.cos(angle) * baseRadius;
          const y1 = cy + Math.sin(angle) * baseRadius;
          const x2 = cx + Math.cos(angle) * (baseRadius + barHeight);
          const y2 = cy + Math.sin(angle) * (baseRadius + barHeight);

          ctx.lineWidth = 2.0;
          ctx.strokeStyle = i % 2 === 0 ? getCol(primaryColor, 0.85) : getCol(secondaryColor, 0.7);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();

      } else if (settings.mode === 'cozy_dust') {
        // --- MODE 3: FLOATING COZY EMBERS / DUST ---
        ctx.save();
        for (const p of particlesRef.current) {
          p.x += p.vx * (1 + bassEnergy * 1.5);
          p.y += p.vy * (1 + bassEnergy * 2);

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const currentSize = p.size * (1 + bassEnergy * 0.8);
          ctx.fillStyle = getCol(primaryColor, p.alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw a gentle wave through the dust
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = getCol(secondaryColor, 0.4);
        ctx.beginPath();
        const stepSize = width / 128;
        for (let i = 0; i < 128; i++) {
          const v = timeData[i * 4] / 128.0;
          const y = (v * height * 0.6) + height * 0.2;
          const x = i * stepSize;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

      } else if (settings.mode === 'ambient_bars') {
        // --- MODE 4: AMBIENT SPECTRUM BARS ---
        ctx.save();
        const barCount = 48;
        const barWidth = Math.max(3, (width / barCount) - 3);

        for (let i = 0; i < barCount; i++) {
          const val = freqData[Math.floor(i * 3.2)] / 255.0;
          const barHeight = val * (height * 0.75) * settings.sensitivity;
          const x = i * (barWidth + 3);
          const y = height - barHeight - 4;

          // Warm caramel gradient
          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, getCol(primaryColor, 0.2));
          grad.addColorStop(0.7, getCol(primaryColor, 0.8));
          grad.addColorStop(1, getCol(secondaryColor, 0.95));

          ctx.fillStyle = grad;
          // Smooth rounded top
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [settings]);

  const modes: { id: VisualizerMode; label: string; icon: React.ReactNode }[] = [
    { id: 'warm_oscilloscope', label: 'Waveform', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'latte_ripples', label: 'Latte Art', icon: <Disc className="w-3.5 h-3.5" /> },
    { id: 'cozy_dust', label: 'Floating Dust', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'ambient_bars', label: 'Warm Bars', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative w-full h-52 md:h-56 rounded-2xl overflow-hidden border border-[#332820] bg-[#16110f] shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Visualizer Mode Buttons */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1 bg-[#201915]/90 backdrop-blur-md p-1 rounded-xl border border-[#382d24]">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSettingsChange({ ...settings, mode: m.id })}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
              settings.mode === m.id
                ? 'bg-[#d99b61] text-[#14100e] font-bold shadow-sm'
                : 'text-[#a89988] hover:text-[#f4ece4] hover:bg-[#2b221b]'
            }`}
            aria-pressed={settings.mode === m.id}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Color Scheme and Glow Toggle */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-[#201915]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#382d24]">
        <label htmlFor="vis-scheme" className="text-[10px] font-mono uppercase tracking-wider text-[#a89988]">
          Palette
        </label>
        <select
          id="vis-scheme"
          value={settings.colorScheme}
          onChange={(e) => onSettingsChange({ ...settings, colorScheme: e.target.value as any })}
          className="bg-[#2b221b] text-[#e8cca7] text-xs font-mono rounded-lg px-2 py-0.5 border border-[#3d3127] focus:outline-none focus:border-[#d99b61]"
        >
          <option value="warm_caramel">Warm Caramel</option>
          <option value="soft_latte">Soft Latte</option>
          <option value="dark_mocha">Dark Mocha</option>
        </select>

        <button
          type="button"
          onClick={() => onSettingsChange({ ...settings, bloom: !settings.bloom })}
          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-colors ${
            settings.bloom
              ? 'bg-[#d99b61]/25 text-[#e8cca7] border-[#d99b61]/40'
              : 'text-[#6e5d50] border-[#382d24]'
          }`}
          title="Toggle Warm Glow"
        >
          GLOW
        </button>
      </div>
    </div>
  );
};
