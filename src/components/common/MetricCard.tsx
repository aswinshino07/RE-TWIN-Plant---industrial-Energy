import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  subtext?: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  statusColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'zinc';
  delta?: {
    value: string | number;
    isPositiveGood: boolean;
    isIncrease: boolean;
  };
  uncertainty?: string;
  onClick?: () => void;
  benchmarkComparison?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  subtext,
  badge,
  badgeVariant = 'neutral',
  statusColor = 'zinc',
  delta,
  uncertainty,
  onClick,
  benchmarkComparison,
}) => {
  const badgeClasses = {
    neutral: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  }[badgeVariant];

  const accentBorder = {
    emerald: 'border-l-2 border-l-emerald-500',
    amber: 'border-l-2 border-l-amber-500',
    rose: 'border-l-2 border-l-rose-500',
    cyan: 'border-l-2 border-l-cyan-500',
    zinc: 'border-l-2 border-l-zinc-700',
  }[statusColor];

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-900/70 p-3.5 shadow-xs transition-all hover:border-zinc-700 hover:bg-zinc-900/90 ${accentBorder} ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      }`}
    >
      {/* Top Row: Label and Icon / Badge */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 truncate">
          {label}
        </span>
        {badge ? (
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-mono font-medium border ${badgeClasses}`}>
            {badge}
          </span>
        ) : Icon ? (
          <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
        ) : null}
      </div>

      {/* Main Metric Value */}
      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs font-medium text-zinc-400">
            {unit}
          </span>
        )}
      </div>

      {/* Footer Info: Delta, Uncertainty, Benchmark */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-zinc-800/60 pt-2 text-[11px]">
        {delta && (
          <span
            className={`font-mono font-medium text-[10px] ${
              delta.isIncrease
                ? delta.isPositiveGood
                  ? 'text-emerald-400'
                  : 'text-rose-400'
                : delta.isPositiveGood
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}
          >
            {delta.isIncrease ? '▲' : '▼'} {delta.value}
          </span>
        )}

        {uncertainty && (
          <span className="font-mono text-[9px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/40">
            ±{uncertainty}
          </span>
        )}

        {benchmarkComparison && (
          <span className="text-[10px] text-zinc-400 font-mono">
            {benchmarkComparison}
          </span>
        )}

        {subtext && (
          <span className="text-[10px] text-zinc-400 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
