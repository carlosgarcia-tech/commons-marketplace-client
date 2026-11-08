'use client';
import { useEffect, useState } from 'react';

export interface ChartDatum {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export const SLATE_PALETTE = ['#f1f5f9', '#cbd5e1', '#94a3b8', '#64748b', '#475569'] as const;

const DONUT_SIZE = 160;
const DONUT_RADIUS = 58;
const DONUT_GAP = 3;
const DONUT_STROKE = 16;
const DONUT_STROKE_ACTIVE = 24;

const formatNumber = (n: number): string => n.toLocaleString('es-MX');

const colorOf = (datum: ChartDatum, index: number): string =>
  datum.color ?? SLATE_PALETTE[index % SLATE_PALETTE.length];

export function AnimatedNumber({ value, durationMs = 900 }: { value: number; durationMs?: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Con movimiento reducido la duración es 0: el primer frame ya muestra el
    // valor final. Así setShown solo se llama dentro del callback de rAF.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : durationMs;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{formatNumber(shown)}</>;
}

interface DonutChartProps {
  data: ChartDatum[];
  centerLabel: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export function DonutChart({ data, centerLabel, selectedId = null, onSelect }: DonutChartProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const activeId = hoverId ?? selectedId;
  const active = data.find((d) => d.id === activeId);
  const circumference = 2 * Math.PI * DONUT_RADIUS;
  const center = DONUT_SIZE / 2;

  const toggle = (id: string) => onSelect?.(selectedId === id ? null : id);

  const lengths = data.map((d) => (total ? (circumference * d.value) / total : 0));
  const segments = data.map((datum, index) => ({
    datum,
    index,
    dash: Math.max(lengths[index] - DONUT_GAP, 0),
    offset: lengths.slice(0, index).reduce((sum, length) => sum + length, 0),
  }));

  return (
    <div className="lg-donut" onMouseLeave={() => setHoverId(null)}>
      <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} role="img" aria-label={centerLabel}>
        <circle cx={center} cy={center} r={DONUT_RADIUS} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={DONUT_STROKE} />
        {segments.map(({ datum, index, dash, offset: segOffset }) => (
          <circle
            key={datum.id}
            className="lg-donut__seg"
            cx={center}
            cy={center}
            r={DONUT_RADIUS}
            fill="none"
            stroke={colorOf(datum, index)}
            strokeWidth={activeId === datum.id ? DONUT_STROKE_ACTIVE : DONUT_STROKE}
            opacity={!activeId || activeId === datum.id ? 1 : 0.3}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-segOffset}
            transform={`rotate(-90 ${center} ${center})`}
            onMouseEnter={() => setHoverId(datum.id)}
            onClick={() => toggle(datum.id)}
          />
        ))}
        <text x={center} y={center + 2} textAnchor="middle" className="lg-donut__num">
          {formatNumber(active ? active.value : total)}
        </text>
        <text x={center} y={center + 19} textAnchor="middle" className="lg-donut__cap">
          {(active ? active.label : centerLabel).toUpperCase()}
        </text>
      </svg>

      <div className="lg-legend">
        {data.map((datum, index) => (
          <button
            key={datum.id}
            type="button"
            className={`lg-legend-item ${activeId === datum.id ? 'is-active' : ''}`}
            aria-pressed={selectedId === datum.id}
            onMouseEnter={() => setHoverId(datum.id)}
            onFocus={() => setHoverId(datum.id)}
            onBlur={() => setHoverId(null)}
            onClick={() => toggle(datum.id)}
          >
            <i style={{ background: colorOf(datum, index) }} />
            {datum.label}
            <b>{total ? `${Math.round((datum.value / total) * 100)}%` : '0%'}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

interface HBarChartProps {
  data: ChartDatum[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

export function HBarChart({ data, selectedId = null, onSelect }: HBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="lg-hbar">
      {data.map((datum) => {
        const isActive = selectedId === datum.id;
        const isDim = selectedId !== null && !isActive;
        return (
          <button
            key={datum.id}
            type="button"
            className={`lg-hbar__row ${isActive ? 'is-active' : ''} ${isDim ? 'is-dim' : ''}`}
            aria-pressed={isActive}
            onClick={() => onSelect?.(isActive ? null : datum.id)}
          >
            <span className="lg-hbar__label" title={datum.label}>{datum.label}</span>
            <span className="lg-hbar__track">
              <span className="lg-hbar__fill" style={{ display: 'block', width: `${(datum.value / max) * 100}%` }} />
            </span>
            <b>{formatNumber(datum.value)}</b>
          </button>
        );
      })}
    </div>
  );
}