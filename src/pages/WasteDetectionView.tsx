import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  TrendingDown,
  Wind,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Info,
  Sliders,
  DollarSign,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { WasteEvent, CompressorLeakageDiagnosis } from '../types';

export const WasteDetectionView: React.FC = () => {
  const { activeWaste, activeFaults, triggerFault, setActiveTab } = useApp();
  const [compressorDiag, setCompressorDiag] = useState<CompressorLeakageDiagnosis | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWaste()
      .then((data) => {
        setCompressorDiag(data.compressor_single_meter_diagnostic);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [activeFaults]);

  const filteredWaste = activeWaste.filter((w) => {
    if (severityFilter === 'ALL') return true;
    return w.severity === severityFilter;
  });

  const paretoData = [
    { name: 'Compressor Leaks', kwh: activeFaults.compressorLeakage.active ? 180 : 25, rs: activeFaults.compressorLeakage.active ? 1260 : 175, fill: '#f59e0b' },
    { name: 'Furnace Holding', kwh: activeFaults.furnaceInefficientHolding.active ? 220 : 35, rs: activeFaults.furnaceInefficientHolding.active ? 1540 : 245, fill: '#ef4444' },
    { name: 'Compressor Idle', kwh: activeFaults.compressorIdleRunning.active ? 68 : 12, rs: activeFaults.compressorIdleRunning.active ? 476 : 84, fill: '#06b6d4' },
    { name: 'Motor Imbalance', kwh: activeFaults.motorDegradation.active ? 48 : 8, rs: activeFaults.motorDegradation.active ? 336 : 56, fill: '#8b5cf6' },
    { name: 'Low Power Factor', kwh: activeFaults.lowPowerFactor.active ? 120 : 15, rs: activeFaults.lowPowerFactor.active ? 840 : 105, fill: '#ec4899' },
  ];

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Waste Detection & Single-Meter Intelligence
            </h1>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
              {activeWaste.length} Active Alarms
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Single-meter compressor leakage formula, idle running, radiant holding losses, and low power factor penalties
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition-colors"
        >
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          <span>Fault Injector</span>
        </button>
      </div>

      {/* CORE DIFFERENTIATOR: Single-Meter Compressor Leakage Diagnostic Panel */}
      <div className="rounded-lg border border-amber-500/40 bg-zinc-900/80 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-100">
                  Single-Meter Compressor Leakage Intelligence
                </h2>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-mono text-amber-300 font-bold border border-amber-500/30">
                  STATUS: {compressorDiag?.leakage_status || 'NORMAL'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Infers distribution leakage and unloaded power fraction using <strong>ONLY ONE electrical meter signal</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerFault('compressorLeakage', !activeFaults.compressorLeakage.active, 0.75)}
              className={`rounded px-3 py-1 text-xs font-mono font-bold transition-all cursor-pointer ${
                activeFaults.compressorLeakage.active
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              }`}
            >
              {activeFaults.compressorLeakage.active ? 'Clear Leak (Simulate Repair)' : '+ Inject Orifice Leak Fault'}
            </button>
          </div>
        </div>

        {/* 6 Key Single-Meter Indicators */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Duty Cycle</span>
            <div className="text-sm font-bold text-amber-400 mt-0.5 tabular-nums">
              {compressorDiag?.duty_cycle_percent || 31.1}%
            </div>
            <span className="text-[9px] text-zinc-500">Nominal: {compressorDiag?.baseline_duty_cycle_percent}%</span>
          </div>

          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Load vs Unload</span>
            <div className="text-sm font-bold text-zinc-200 mt-0.5 tabular-nums">
              {compressorDiag?.load_time_seconds}s / {compressorDiag?.unload_time_seconds}s
            </div>
            <span className="text-[9px] text-zinc-500">90s cycle period</span>
          </div>

          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Unloaded Power</span>
            <div className="text-sm font-bold text-zinc-200 mt-0.5 tabular-nums">
              {compressorDiag?.measured_unloaded_power_kw} kW
            </div>
            <span className="text-[9px] text-zinc-500">
              {compressorDiag?.unloaded_power_fraction_percent}% of rated
            </span>
          </div>

          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Estimated Leakage</span>
            <div className="text-sm font-bold text-rose-400 mt-0.5 tabular-nums">
              {compressorDiag?.estimated_leakage_cfm} CFM
            </div>
            <span className="text-[9px] text-zinc-500">
              {compressorDiag?.estimated_leakage_percent}% total airflow
            </span>
          </div>

          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Annual Loss</span>
            <div className="text-sm font-bold text-rose-400 mt-0.5 tabular-nums">
              ₹{(compressorDiag?.annual_waste_rs || 0).toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-500">{compressorDiag?.annual_waste_kwh.toLocaleString()} kWh/yr</span>
          </div>

          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase">Confidence</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 tabular-nums">
              {compressorDiag?.confidence_score}%
            </div>
            <span className="text-[9px] text-zinc-500">Single-meter inference</span>
          </div>
        </div>

        {/* Mechanism Banner */}
        <div className="mt-3.5 rounded bg-zinc-950 p-3 border border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-zinc-500 mb-1">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Single-Meter Physics Derivation:</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Leakage airflow is derived from the Compressed Air Challenge (CAC) duty cycle equation: <span className="text-emerald-400 font-bold">Leakage % = (T_load / (T_load + T_unload)) × (P_unloaded / P_rated)</span>. When artificial demand causes the unloader to cycle prematurely, RE-TWIN flags the financial loss in real time without physical flow transducers.
          </p>
        </div>
      </div>

      {/* Two Columns: Alarm Annunciator Table & Waste Pareto */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* SCADA Alarm Annunciator Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                SCADA Alarm Annunciator Log
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Active thermodynamic anomalies ranked by financial severity (₹ / shift)
              </p>
            </div>

            {/* Severity filter */}
            <div className="flex rounded bg-zinc-950 p-0.5 border border-zinc-800 text-[10px] font-mono">
              {(['ALL', 'CRITICAL', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`rounded px-2 py-0.5 transition-colors cursor-pointer ${
                    severityFilter === lvl ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredWaste.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-800 rounded">
                No active waste events for selected severity filter.
              </div>
            ) : (
              filteredWaste.map((event) => (
                <div
                  key={event.event_id}
                  className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 text-xs hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-100 text-xs">{event.title}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold border ${
                      event.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : event.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}>
                      {event.severity}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between border-t border-zinc-900 pt-2 font-mono text-[10px]">
                    <span className="text-zinc-400">
                      Excess: <strong className="text-amber-400">{event.excess_power_kw} kW</strong>
                    </span>
                    <span className="text-zinc-400">
                      Waste: <strong className="text-rose-400">₹{event.estimated_waste_rs.toLocaleString()}</strong> ({event.estimated_waste_kwh} kWh)
                    </span>
                    <span className="text-emerald-400">
                      Confidence: {event.confidence_percent}%
                    </span>
                  </div>

                  <div className="mt-2 rounded bg-zinc-900/80 p-2 text-[10px] text-zinc-300">
                    <strong className="text-emerald-400">Action:</strong> {event.recommended_action}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Waste Pareto Chart */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                Energy Waste Pareto (₹ / Shift)
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Identifies high-impact targets for immediate energy payback
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paretoData} layout="vertical">
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" fontSize={10} fontVariant="tabular-nums" unit=" ₹" />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={10} width={105} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any) => [`₹${val}`, 'Estimated Waste per Shift']}
                />
                <Bar dataKey="rs" radius={[0, 3, 3, 0]}>
                  {paretoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
