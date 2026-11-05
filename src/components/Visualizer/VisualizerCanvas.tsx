import React, { useEffect, useRef, useState } from 'react';
import { audioCtxManager } from '../../audio/AudioContext';
import { VisualizerMode, VisualizerSettings } from '../../types/synth';
import { Activity, Disc, Sparkles, Waves } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
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

  // Initialize 3D particles for warp mode
  useEffect(() => {
    const numParticles = 350;
    const particles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 1,
        pz: 1000,
        color: ['#00f0ff', '#ff0055', '#bf00ff', '#00ffa6'][Math.floor(Math.random() * 4)],
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

      // Compute bass / energy average
      let bassEnergy = 0;
      for (let i = 0; i < 16; i++) {
        bassEnergy += freqData[i];
      }
      bassEnergy = bassEnergy / (16 * 255); // 0.0 - 1.0

      // Semi-transparent clear for smooth trail effect
      ctx.fillStyle = settings.trail ? 'rgba(7, 10, 19, 0.22)' : 'rgba(7, 10, 19, 0.95)';
      ctx.fillRect(0, 0, width, height);

      // Color palette definitions
      const getColor = (alpha: number = 1.0, isAlt: boolean = false) => {
        switch (settings.colorScheme) {
          case 'cyber_magenta':
            return isAlt ? `rgba(255, 0, 85, ${alpha})` : `rgba(0, 240, 255, ${alpha})`;
          case 'amber_crt':
            return isAlt ? `rgba(255, 170, 0, ${alpha})` : `rgba(255, 220, 100, ${alpha})`;
          case 'matrix_green':
            return isAlt ? `rgba(0, 255, 102, ${alpha})` : `rgba(180, 255, 180, ${alpha})`;
          case 'solar_fire':
            return isAlt ? `rgba(255, 50, 0, ${alpha})` : `rgba(255, 200, 0, ${alpha})`;
          default:
            return isAlt ? `rgba(191, 0, 255, ${alpha})` : `rgba(0, 240, 255, ${alpha})`;
        }
      };

      if (settings.mode === 'cyber_oscilloscope') {
        // --- MODE 1: CYBERPUNK OSCILLOSCOPE ---
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = settings.bloom ? 14 : 0;
        ctx.shadowColor = getColor(0.9, false);
        ctx.strokeStyle = getColor(0.95, false);

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();

        // Secondary glow mirror wave
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = getColor(0.6, true);
        ctx.shadowColor = getColor(0.8, true);
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i += 2) {
          const v = (timeData[i] / 128.0 - 1.0) * 1.4 + 1.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth * 2;
        }
        ctx.stroke();

        // Grid lines
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();

      } else if (settings.mode === 'radial_spectrum') {
        // --- MODE 2: RADIAL AUDIO GALAXY ---
        ctx.save();
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.22 + bassEnergy * 25;
        const numBars = 120;
        rotationRef.current += 0.005 + bassEnergy * 0.015;

        // Central glowing reactor core
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 0.85);
        coreGradient.addColorStop(0, getColor(0.4 + bassEnergy * 0.4, false));
        coreGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // Radiating spectrum bars
        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2 + rotationRef.current;
          const dataIdx = Math.floor((i / numBars) * 180);
          const barHeight = (freqData[dataIdx] / 255.0) * (Math.min(width, height) * 0.28) * settings.sensitivity;

          const x1 = cx + Math.cos(angle) * baseRadius;
          const y1 = cy + Math.sin(angle) * baseRadius;
          const x2 = cx + Math.cos(angle) * (baseRadius + barHeight);
          const y2 = cy + Math.sin(angle) * (baseRadius + barHeight);

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = i % 2 === 0 ? getColor(0.9, false) : getColor(0.8, true);
          ctx.shadowBlur = settings.bloom ? 8 : 0;
          ctx.shadowColor = getColor(0.7, false);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();

      } else if (settings.mode === 'particle_warp') {
        // --- MODE 3: 3D HYPERSPACE WARP TUNNEL ---
        ctx.save();
        const cx = width / 2;
        const cy = height / 2;
        const speed = 6 + bassEnergy * 28;

        for (const p of particlesRef.current) {
          p.pz = p.z;
          p.z -= speed;

          if (p.z <= 0) {
            p.z = 1000;
            p.pz = 1000;
            p.x = (Math.random() - 0.5) * 2000;
            p.y = (Math.random() - 0.5) * 2000;
          }

          const k = 300 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          const prevK = 300 / p.pz;
          const prevX = p.x * prevK + cx;
          const prevY = p.y * prevK + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(1, (1 - p.z / 1000) * 4.5 * (1 + bassEnergy * 0.8));
            ctx.lineWidth = size;
            ctx.strokeStyle = p.color;
            ctx.shadowBlur = settings.bloom ? 6 : 0;
            ctx.shadowColor = p.color;

            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
        ctx.restore();

      } else if (settings.mode === 'matrix_waterfall') {
        // --- MODE 4: MATRIX SPECTROGRAM ---
        ctx.save();
        const barCount = 64;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const val = freqData[Math.floor(i * 3.5)] / 255.0;
          const barHeight = val * (height * 0.85) * settings.sensitivity;
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, getColor(0.2, true));
          grad.addColorStop(0.6, getColor(0.8, false));
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.shadowBlur = settings.bloom ? 10 : 0;
          ctx.shadowColor = getColor(0.7, false);
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 2, barWidth, 2);
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
    { id: 'cyber_oscilloscope', label: 'Oscilloscope', icon: <Waves className="w-3.5 h-3.5" /> },
    { id: 'radial_spectrum', label: 'Radial Galaxy', icon: <Disc className="w-3.5 h-3.5" /> },
    { id: 'particle_warp', label: 'Hyperspace 3D', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'matrix_waterfall', label: 'Spectrogram', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden border border-cyan-500/25 bg-slate-950/80 shadow-[0_0_25px_rgba(0,240,255,0.12)]">
      {/* Background CRT scanline overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10" />

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Visualizer Mode Controls Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSettingsChange({ ...settings, mode: m.id })}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
              settings.mode === m.id
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            aria-pressed={settings.mode === m.id}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Visualizer Color & FX toggles */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-lg">
        <label htmlFor="vis-scheme" className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Theme</label>
        <select
          id="vis-scheme"
          value={settings.colorScheme}
          onChange={(e) => onSettingsChange({ ...settings, colorScheme: e.target.value as any })}
          className="bg-slate-800 text-cyan-300 text-xs font-mono rounded px-2 py-0.5 border border-slate-600 focus:outline-none focus:border-cyan-400"
        >
          <option value="neon_cyan">Neon Cyan</option>
          <option value="cyber_magenta">Cyber Magenta</option>
          <option value="amber_crt">Amber CRT</option>
          <option value="matrix_green">Matrix Green</option>
          <option value="solar_fire">Solar Fire</option>
        </select>

        <button
          type="button"
          onClick={() => onSettingsChange({ ...settings, bloom: !settings.bloom })}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
            settings.bloom ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-slate-500 border-slate-700'
          }`}
          title="Toggle Neon Bloom"
        >
          BLOOM
        </button>
      </div>
    </div>
  );
};
