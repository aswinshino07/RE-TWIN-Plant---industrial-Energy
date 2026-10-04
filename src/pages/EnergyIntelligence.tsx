import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Gauge,
  Activity,
  TrendingDown,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
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
  ReferenceLine,
} from 'recharts';
import { api } from '../services/api';

export const EnergyIntelligence: React.FC = () => {
  const { plant, setActiveTab } = useApp();
  const [secData, setSecData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSec()
      .then((data) => {
        setSecData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Specific Energy Consumption (SEC) Engine
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              kWh / Tonne of Good Castings
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Heat-by-heat and shift-level energy intensity tracking benchmarked against Bureau of Energy Efficiency (BEE) data
          </p>
        </div>

        <button
          onClick={() => setActiveTab('baseline')}
          className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
        >
          <span>Correlate with Baseline</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* SEC Benchmark Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Current SEC</span>
          <div className="mt-1 font-mono text-2xl font-bold text-zinc-100">
            {secData?.current_sec || 1087}
          </div>
          <span className="text-[10px] text-zinc-400">kWh/tonne</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Published Benchmark</span>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
            {secData?.benchmark_sec || 1100}
          </div>
          <span className="text-[10px] text-zinc-400">Kolhapur MSME Cluster</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">10% Target SEC</span>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
            {secData?.target_sec || 990}
          </div>
          <span className="text-[10px] text-zinc-400">Central Case Target</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Theoretical Minimum</span>
          <div className="mt-1 font-mono text-2xl font-bold text-cyan-400">
            {secData?.theoretical_minimum_sec || 396}
          </div>
          <span className="text-[10px] text-zinc-400">Thermodynamic to 1500°C</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Best Shift Recorded</span>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-300">
            {secData?.best_sec || 964}
          </div>
          <span className="text-[10px] text-zinc-400">Historical Minimum</span>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Intensity Gap</span>
          <div className="mt-1 font-mono text-2xl font-bold text-rose-400">
            +{secData?.gap_to_benchmark_percent || 1.2}%
          </div>
          <span className="text-[10px] text-zinc-400">Against Target Goal</span>
        </div>
      </div>

      {/* SEC Trend Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Shift Specific Energy Consumption Trend (Last 30 Shifts)
            </h2>
            <p className="text-xs text-zinc-400">
              Continuous monitoring reveals shifts affected by uninsulated holding and compressor leaks
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="h-0.5 w-3 bg-amber-400"></span> Benchmark: 1,100 kWh/t
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-0.5 w-3 bg-emerald-400"></span> Target: 990 kWh/t
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={secData?.sec_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} domain={[900, 1300]} unit=" kWh/t" />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} kWh/tonne`, 'Shift SEC']}
              />
              <ReferenceLine y={1100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Industry Benchmark 1100', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={990} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 990', fill: '#10b981', fontSize: 10 }} />
              <Line type="monotone" dataKey="sec" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engineering Decomposition: Where does the energy go? */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-100 mb-2">
          Thermodynamic Physics Decomposition (Report Section 2.2)
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Coreless induction furnace losses decomposed into theoretical heating, coil/electrical losses, and operating practice:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500">1. Theoretical Heat</span>
            <div className="text-base font-bold font-mono text-cyan-400 mt-1">396 kWh/tonne</div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Enthalpy to heat & liquefy grey iron from 30°C to 1500°C pouring bath.
            </p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500">2. Furnace Coil Losses</span>
            <div className="text-base font-bold font-mono text-amber-400 mt-1">115 kWh/tonne</div>
            <p className="text-[11px] text-zinc-400 mt-1">
              I²R losses in water-cooled copper coil & harmonic losses in thyristor invertor.
            </p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500">3. Radiant & Holding</span>
            <div className="text-base font-bold font-mono text-rose-400 mt-1">145 kWh/tonne</div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Stefan-Boltzmann radiation from open crucible mouth during deslagging and holding.
            </p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500">4. Plant Utilities</span>
            <div className="text-base font-bold font-mono text-zinc-200 mt-1">431 kWh/tonne</div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Compressor leakage, sand mixer, dust extraction fan, lighting, and transformer losses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
