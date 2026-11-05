import React, { useCallback, useEffect, useRef, useState } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  defaultValue?: number;
  size?: number;
  onChange: (val: number) => void;
  formatDisplay?: (val: number) => string;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  color = '#d99b61',
  defaultValue,
  size = 54,
  onChange,
  formatDisplay,
}) => {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const startValue = useRef(value);

  // Normalized value 0.0 - 1.0
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Angle range: -135deg to +135deg (total 270deg)
  const angle = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    startValue.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaY = dragStartY.current - e.clientY;
    const range = max - min;
    const sensitivity = 200; // pixels for full sweep
    const change = (deltaY / sensitivity) * range;
    let newValue = startValue.current + change;

    // Apply step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }

    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDoubleClick = () => {
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    } else {
      onChange((min + max) / 2);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const change = (step || (max - min) / 100) * direction * 2;
    let newValue = value + change;
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = step || 1;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -(step || 1);
    if (delta !== 0) {
      e.preventDefault();
      const nv = Math.max(min, Math.min(max, value + delta));
      onChange(nv);
    }
  };

  // SVG arc calculation
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = (135 * Math.PI) / 180;
  const currentAngle = ((-135 + normalized * 270) * Math.PI) / 180;

  // Polar to Cartesian
  const p2c = (r: number, a: number) => ({
    x: cx + r * Math.sin(a),
    y: cy - r * Math.cos(a),
  });

  const arcStart = p2c(radius, -((135 * Math.PI) / 180));
  const arcCurrent = p2c(radius, currentAngle);
  const largeArcFlag = normalized > 0.666 ? 1 : 0;

  const displayVal = formatDisplay
    ? formatDisplay(value)
    : step < 1
    ? `${value.toFixed(2)}${unit}`
    : `${Math.round(value)}${unit}`;

  return (
    <div className="flex flex-col items-center select-none group min-w-[56px]">
      <div
        ref={knobRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayVal}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        className="relative cursor-ns-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99b61] rounded-full"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="overflow-visible">
          {/* Background track circle arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(232, 204, 167, 0.14)"
            strokeWidth="3.5"
            strokeDasharray={`${radius * 1.5 * Math.PI} ${radius * 2 * Math.PI}`}
            strokeDashoffset={-radius * 0.35}
            strokeLinecap="round"
          />

          {/* Active progress indicator arc */}
          {normalized > 0.01 && (
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${arcCurrent.x} ${arcCurrent.y}`}
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                filter: isDragging ? `drop-shadow(0 0 4px ${color})` : undefined,
              }}
            />
          )}

          {/* Knob Body */}
          <circle
            cx={cx}
            cy={cy}
            r={radius * 0.76}
            fill="#231c17"
            stroke={isDragging ? color : '#3d3229'}
            strokeWidth="1.5"
            className="transition-colors"
          />

          {/* Center Indicator Pointer Line */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + Math.sin((angle * Math.PI) / 180) * (radius * 0.7)}
            y2={cy - Math.cos((angle * Math.PI) / 180) * (radius * 0.7)}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Label and Value */}
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9e8c7c] mt-1 truncate max-w-[64px] text-center">
        {label}
      </span>
      <span className="text-[10px] font-mono font-semibold text-[#f4ece4]">
        {displayVal}
      </span>
    </div>
  );
};

