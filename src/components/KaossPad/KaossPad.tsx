import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { Crosshair, Lock, Unlock } from 'lucide-react';

export const KaossPad: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.3 });
  const ripplesRef = useRef<{ x: number; y: number; radius: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Active crosshair
      if (isPressed || isLocked) {
        const px = coords.x * canvas.width;
        const py = (1 - coords.y) * canvas.height;

        // Subtle guide lines in warm caramel
        ctx.strokeStyle = 'rgba(217, 155, 97, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
        ctx.stroke();

        // Central crosshair in warm caramel
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#d99b61';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f4ece4';
        ctx.fill();
      }

      // Render ripples in cream latte
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 2.0;
        r.alpha -= 0.025;

        if (r.alpha <= 0) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232, 204, 167, ${r.alpha.toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPressed, isLocked, coords]);

  const updatePadFromEvent = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / rect.width;
    const rawY = 1 - (clientY - rect.top) / rect.height;

    const x = Math.max(0, Math.min(1, rawX));
    const y = Math.max(0, Math.min(1, rawY));

    setCoords({ x, y });
    audioEngine.setKaossControl(x, y);

    const canvas = canvasRef.current;
    if (canvas) {
      ripplesRef.current.push({
        x: x * canvas.width,
        y: (1 - y) * canvas.height,
        radius: 6,
        alpha: 0.7,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePadFromEvent(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPressed) return;
    updatePadFromEvent(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPressed(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!isLocked) {
      setCoords({ x: 0.5, y: 0.2 });
      audioEngine.setKaossControl(0.5, 0.2);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cutoffDisplay = Math.round(60 + Math.pow(coords.x, 2.5) * 16000);
  const fxDisplay = Math.round(coords.y * 100);

  return (
    <div className="w-full bg-[#1b1511] rounded-2xl border border-[#2e241d] p-4 shadow-sm flex flex-col">
      {/* Title & Status */}
      <div className="flex items-center justify-between border-b border-[#2e241d] pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-[#d99b61]" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-[#f4ece4] uppercase">
            X/Y Touchpad Controller
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#a89988]">
            CUTOFF: <strong className="text-[#e8cca7]">{cutoffDisplay} Hz</strong> | RES/ECHO:{' '}
            <strong className="text-[#e8cca7]">{fxDisplay}%</strong>
          </span>

          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-colors ${
              isLocked
                ? 'bg-[#d99b61] text-[#14100e] border-[#d99b61]'
                : 'bg-[#241c16] text-[#a89988] border-[#382d24] hover:text-[#f4ece4]'
            }`}
            title="Lock current touch position on release"
          >
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{isLocked ? 'HOLD' : 'GATE'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Touch Area */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 h-44 rounded-xl overflow-hidden cursor-crosshair border border-[#2e241d] bg-[#16110f] shadow-inner select-none"
      >
        {/* Subtle Warm Grid Background */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(217,155,97,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,155,97,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Corner labels */}
        <span className="absolute bottom-2 left-3 text-[10px] font-mono text-[#6e5d50] pointer-events-none">
          ◀ 60 Hz (WARM LOWS)
        </span>
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-[#6e5d50] pointer-events-none">
          16 kHz (OPEN FILTER) ▶
        </span>
        <span className="absolute top-2 left-3 text-[10px] font-mono text-[#6e5d50] pointer-events-none">
          ▲ HIGH ECHO & RESONANCE
        </span>
      </div>
    </div>
  );
};
