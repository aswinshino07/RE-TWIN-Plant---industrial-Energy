import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Info,
  Thermometer,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import { AssetHealthReport } from '../types';

export const EquipmentHealthView: React.FC = () => {
  const { activeFaults } = useApp();
  const [healthData, setHealthData] = useState<{ overall_plant_health: number; asset_reports: AssetHealthReport[] } | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('compressor-01');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEquipmentHealth()
      .then((data) => {
        setHealthData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [activeFaults]);

  const selectedReport = healthData?.asset_reports.find((r) => r.asset_id === selectedAssetId) || healthData?.asset_reports[0];

  const getStatusColor = (status: AssetHealthReport['status']) => {
    switch (status) {
      case 'EXCELLENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'WATCH':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'WARNING':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-700';
    }
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Equipment Health Intelligence & Current Features
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              Composite Plant Index: {healthData?.overall_plant_health || 86}/100
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Current RMS, phase imbalance, thermal signature, and load deviation tracking without invasive dismantling
          </p>
        </div>
      </div>

      {/* Mandatory Truth Disclosure on RUL */}
      <div className="flex items-start gap-2.5 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-300 font-mono">
        <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-cyan-300 uppercase tracking-wide text-[10px]">
            Technical Rule (Report Section 7.2 & 12.1):
          </span>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Remaining Useful Life (RUL) claims are deliberately NOT asserted because empirical run-to-failure factory datasets do not exist for this site. The system produces explainable <strong>Health Trends</strong> derived from phase current imbalance, power factor distortion, and casing temperature drift.
          </p>
        </div>
      </div>

      {/* 5 Physical Assets Health Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {healthData?.asset_reports.map((report) => {
          const isSelected = selectedAssetId === report.asset_id;
          return (
            <div
              key={report.asset_id}
              onClick={() => setSelectedAssetId(report.asset_id)}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/50'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-zinc-200 truncate">
                  {report.asset_name}
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border ${getStatusColor(report.status)}`}>
                  {report.status}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="font-mono text-3xl font-bold text-zinc-100">
                  {report.health_index}
                </span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>

              <div className="space-y-1 font-mono text-[11px] border-t border-zinc-800/80 pt-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Current Imb:</span>
                  <span className={report.current_imbalance_percent > 3 ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                    {report.current_imbalance_percent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className={report.temperature_C > 70 ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                    {report.temperature_C}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trend:</span>
                  <span className={report.trend_direction === 'DEGRADING' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                    {report.trend_direction}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Asset Deep Health Trend & Diagnostics */}
      {selectedReport && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Trend Chart */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  14-Day Health Trend: {selectedReport.asset_name}
                </h3>
                <p className="text-xs text-zinc-400">
                  Multi-feature health trajectory (Current RMS, Imbalance, Thermal Drift)
                </p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-300">
                Degradation Rate: {selectedReport.degradation_rate_per_month}% / mo
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedReport.historical_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="timestamp" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} domain={[30, 100]} unit=" score" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} / 100`, 'Health Index']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diagnostic Symptoms & Maintenance */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">
              Diagnostic Symptoms & Advisory
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Observed Electrical Symptoms</span>
                <ul className="mt-1.5 space-y-1 text-zinc-300 text-[11px] list-disc pl-4">
                  {selectedReport.observed_symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded bg-zinc-950 p-3 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Recommended Maintenance</span>
                <p className="mt-1 text-zinc-300 text-[11px] leading-relaxed">
                  {selectedReport.recommended_maintenance}
                </p>
              </div>

              <div className="rounded bg-amber-500/5 p-2.5 border border-amber-500/20 text-[10px] text-amber-300">
                {selectedReport.rul_disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
