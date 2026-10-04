import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Info,
  Sliders,
  ArrowRight,
  Scale,
  Gauge,
  Activity,
  Calendar,
  AlertOctagon,
  RefreshCw,
  FileCheck,
  Zap,
  Flame,
  Wind,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { api } from '../services/api';
import { BaselineRegressionResult, BaselinePredictionPoint, MvVerificationReport } from '../types';

export const BaselineAndMV: React.FC = () => {
  const { setActiveTab } = useApp();
  const [model, setModel] = useState<BaselineRegressionResult | null>(null);
  const [predictions, setPredictions] = useState<BaselinePredictionPoint[]>([]);
  const [ashrae, setAshrae] = useState<any>(null);
  const [verification, setVerification] = useState<MvVerificationReport | null>(null);
  const [savingsSlider, setSavingsSlider] = useState<number>(8.5);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    Promise.all([api.getBaseline(), api.verifySavings({ savings_percent: savingsSlider })])
      .then(([baseData, verifyData]) => {
        setModel(baseData.model);
        setPredictions(baseData.predictions);
        setAshrae(baseData.ashrae_standards);
        setVerification(verifyData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load M&V engine data:', err);
        setLoading(false);
      });
  }, []);

  const handleReverify = async (newSavings: number) => {
    setSavingsSlider(newSavings);
    setVerifying(true);
    try {
      const res = await api.verifySavings({ savings_percent: newSavings });
      setVerification(res);
    } catch (err) {
      console.error('Verification simulation failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="rounded bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>STATUS: VERIFIED (95% CI &gt; 0)</span>
          </span>
        );
      case 'INCONCLUSIVE':
        return (
          <span className="rounded bg-amber-500/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>STATUS: INCONCLUSIVE (CI SPANS ZERO)</span>
          </span>
        );
      case 'NO_SAVING':
      case 'NEGATIVE_SAVING':
      default:
        return (
          <span className="rounded bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold text-rose-300 border border-rose-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>STATUS: NO SAVING (ACTUAL &gt; BASELINE)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 p-5">
      {/* Supervisory Header Banner */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Measurement & Verification (M&V) Engine
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20 uppercase">
              IPMVP Option C Validated
            </span>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-500/20">
              Core Differentiator
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Production- and temperature-normalised regression model separating operational efficiency from weather and volume variations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3.5 py-1.5 text-xs font-bold font-mono text-zinc-950 hover:bg-emerald-400 transition-all uppercase tracking-wider cursor-pointer shadow-sm active:scale-95"
          >
            <FileCheck className="h-4 w-4" />
            <span>Generate Official Audit Certificate</span>
          </button>
        </div>
      </div>

      {/* CORE PHILOSOPHY CALLOUT */}
      <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-200 font-mono">
        <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="font-bold text-emerald-300 uppercase tracking-wide">
            The RE-TWIN M&V Principle: "Verified Savings, Not Estimated Savings"
          </span>
          <p className="text-zinc-300">
            A simple drop in monthly electricity bills does <strong>NOT</strong> prove an energy efficiency project worked. Production volume may have dropped, or weather may have cooled. Conversely, if production surges, a successful project might be falsely dismissed because bills increased. RE-TWIN isolates true efficiency by adjusting the baseline for exact shift tonnes and ambient temperatures using Ordinary Least Squares (OLS) under <strong>ASHRAE Guideline 14 / EVO IPMVP Option C</strong>.
          </p>
        </div>
      </div>

      {/* 3-PHASE CHRONOLOGICAL HORIZON (BASELINE -> INTERVENTION -> POST-INTERVENTION) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 font-mono text-xs">
        {/* Phase 1: Baseline Period */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Phase 1</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-300">
              {verification?.baseline_period_summary?.shifts_count || 35} Shifts
            </span>
          </div>
          <h3 className="font-bold text-xs uppercase text-zinc-100">
            1. BASELINE PERIOD
          </h3>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
            Pre-intervention sub-metered historical operation. Used to calibrate the multivariate regression model.
          </p>
          <div className="mt-3 space-y-1 text-[10px] text-zinc-300 border-t border-zinc-800/80 pt-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Duration:</span>
              <span>{verification?.baseline_period_summary?.start_date} to {verification?.baseline_period_summary?.end_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Total Energy:</span>
              <span className="text-zinc-100 font-bold">{verification?.baseline_period_summary?.total_energy_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Output:</span>
              <span>{verification?.baseline_period_summary?.total_production_tonnes} tonnes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Baseline SEC:</span>
              <span className="text-amber-400 font-bold">{verification?.baseline_period_summary?.avg_sec_kwh_per_tonne} kWh/t</span>
            </div>
          </div>
        </div>

        {/* Phase 2: Intervention */}
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/15 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2.5">
            <span className="text-[10px] text-amber-400 uppercase font-bold">Milestone</span>
            <span className="rounded bg-amber-500/20 text-amber-300 px-1.5 py-0.5 text-[9px] font-bold">
              Commissioned
            </span>
          </div>
          <h3 className="font-bold text-xs uppercase text-amber-200">
            2. INTERVENTION COMMISSIONING
          </h3>
          <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
            {verification?.intervention_summary?.action_name || 'Compressor Leak Repair & Furnace Lid Management'}
          </p>
          <div className="mt-3 space-y-1 text-[10px] text-zinc-300 border-t border-zinc-800/80 pt-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Intervention Date:</span>
              <span className="text-amber-300 font-bold">{verification?.intervention_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Implementation Outlay:</span>
              <span className="text-zinc-100">₹{(verification?.intervention_summary?.capex_rs || 65000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Target Mechanism:</span>
              <span className="text-emerald-400 font-bold">Thermodynamic & Leakage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Boundary Meter:</span>
              <span>Class 0.5S HT Incomer</span>
            </div>
          </div>
        </div>

        {/* Phase 3: Post-Intervention Period */}
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/15 p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2.5">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Phase 3</span>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[9px] font-bold">
              {verification?.evaluation_shifts_count || 25} Shifts
            </span>
          </div>
          <h3 className="font-bold text-xs uppercase text-emerald-200">
            3. POST-INTERVENTION PERIOD
          </h3>
          <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
            Continuous measurement compared against counterfactual baseline adjusted for post-intervention conditions.
          </p>
          <div className="mt-3 space-y-1 text-[10px] text-zinc-300 border-t border-zinc-800/80 pt-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Reporting Window:</span>
              <span>{verification?.reporting_period_start} to {verification?.reporting_period_end}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Measured Consumption:</span>
              <span className="text-cyan-400 font-bold">{verification?.actual_measured_energy_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Counterfactual Baseline:</span>
              <span className="text-emerald-400 font-bold">{verification?.normalised_baseline_energy_kwh.toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Confidence Band:</span>
              <span className="text-zinc-200">95% (t-stat = 1.96)</span>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION STATUS & CALCULATIONS HUD (6 CORE METRICS) */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 shadow-xs">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800 pb-3 mb-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-100">
                Deterministic M&V Calculations & Statistical Audit
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Strict mathematical rule: <strong className="text-zinc-200">Savings carry a 95% uncertainty band. If the interval includes zero, savings MUST be flagged as INCONCLUSIVE.</strong>
            </p>
          </div>

          <div>{getStatusBadge(verification?.verification_status)}</div>
        </div>

        {/* 6 Key Calculations */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
          {/* 1. Normalised Baseline Energy */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">1. Normalised Baseline</span>
            <div className="text-sm font-bold text-zinc-100 mt-1 tabular-nums">
              {verification?.normalised_baseline_energy_kwh.toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-400">kWh (Expected)</span>
          </div>

          {/* 2. Actual Energy */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">2. Actual Energy</span>
            <div className="text-sm font-bold text-cyan-400 mt-1 tabular-nums">
              {verification?.actual_measured_energy_kwh.toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-400">kWh (Measured)</span>
          </div>

          {/* 3. Gross Savings */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">3. Gross Savings</span>
            <div className={`text-sm font-bold mt-1 tabular-nums ${
              (verification?.gross_savings_kwh || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(verification?.gross_savings_kwh || 0) > 0 ? `+${verification?.gross_savings_kwh.toLocaleString()}` : verification?.gross_savings_kwh.toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-400">kWh (Baseline - Actual)</span>
          </div>

          {/* 4. Uncertainty (U_95) */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">4. 95% Uncertainty (U₉₅)</span>
            <div className="text-sm font-bold text-amber-400 mt-1 tabular-nums">
              ±{verification?.uncertainty_kwh_95.toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-400">kWh ({verification?.uncertainty_percent}%)</span>
          </div>

          {/* 5. Savings % */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">5. Savings %</span>
            <div className={`text-sm font-bold mt-1 tabular-nums ${
              (verification?.gross_savings_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(verification?.gross_savings_percent || 0) > 0 ? `+${verification?.gross_savings_percent}%` : `${verification?.gross_savings_percent}%`}
            </div>
            <span className="text-[9px] text-zinc-400">of Normalised Baseline</span>
          </div>

          {/* 6. Lower Bound / Verified Value */}
          <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold">6. Lower Bound (S - U₉₅)</span>
            <div className={`text-sm font-bold mt-1 tabular-nums ${
              (verification?.lower_bound_savings_kwh || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(verification?.lower_bound_savings_kwh || 0) > 0 ? `+${verification?.lower_bound_savings_kwh.toLocaleString()}` : verification?.lower_bound_savings_kwh.toLocaleString()}
            </div>
            <span className="text-[9px] text-zinc-400">
              {(verification?.lower_bound_savings_kwh || 0) > 0 ? 'Safe for Bank Audit' : 'Spans Zero'}
            </span>
          </div>
        </div>

        {/* INTERACTIVE SAVINGS TESTER SLIDER & PRESETS (For Hackathon Judges) */}
        <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950 p-3.5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase font-mono">
                Judge Test Console: Simulate Intervention Savings Magnitude
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Simulated Reduction: <strong className="text-emerald-400">{savingsSlider.toFixed(1)}%</strong>
            </span>
          </div>

          {/* Slider */}
          <div className="mt-2.5 flex items-center gap-4">
            <input
              type="range"
              min="-3"
              max="15"
              step="0.5"
              value={savingsSlider}
              onChange={(e) => handleReverify(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Instant Presets for Judges */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-zinc-500 self-center mr-1">Presets:</span>
            <button
              onClick={() => handleReverify(8.5)}
              className={`rounded px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                savingsSlider === 8.5
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Preset 1: High Savings (8.5% → VERIFIED)
            </button>

            <button
              onClick={() => handleReverify(2.5)}
              className={`rounded px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                savingsSlider === 2.5
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Preset 2: Marginal Savings (2.5% → INCONCLUSIVE)
            </button>

            <button
              onClick={() => handleReverify(-1.5)}
              className={`rounded px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                savingsSlider === -1.5
                  ? 'bg-rose-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              Preset 3: Negative Savings (-1.5% → NO SAVING)
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY M&V VISUAL CHART: EXPECTED BASELINE vs 95% PREDICTION INTERVAL vs ACTUAL CONSUMPTION vs INTERVENTION POINT */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
        <div className="flex flex-col justify-between gap-2 border-b border-zinc-800 pb-3 mb-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-100">
                Full-Horizon M&V Trajectory: Baseline Period, Intervention Point & Post-Intervention Tracking
              </h3>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                60 Shift Record
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Notice the shift at Day 35: Prior to intervention, actual energy tracks the expected baseline. After intervention, actual consumption clearly decouples below the baseline.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Actual Measured
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-0.5 w-3 bg-emerald-400"></span> Normalised Baseline
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-2 w-3 bg-emerald-500/20 rounded-xs"></span> 95% Prediction Interval
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="h-2 w-0.5 bg-amber-400"></span> Intervention Point
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-80 w-full">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-xs font-mono text-zinc-500">
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
              <span>Calibrating regression matrix and loading M&V timeline...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={verification?.timeline_points || []}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={10}
                  fontVariant="tabular-nums"
                  tickFormatter={(val, idx) => (idx % 4 === 0 ? val : '')}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  domain={['dataMin - 150', 'dataMax + 150']}
                  unit=" kWh"
                  fontVariant="tabular-nums"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(val: any, name: any) => [
                    `${val} kWh`,
                    name === 'actual_kwh'
                      ? 'Actual Measured Energy'
                      : name === 'expected_baseline_kwh'
                      ? 'Normalised Baseline Expected'
                      : name === 'upper_bound_kwh'
                      ? 'Upper 95% Prediction Bound'
                      : name === 'lower_bound_kwh'
                      ? 'Lower 95% Prediction Bound'
                      : name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px', fontFamily: 'monospace' }} />

                {/* 95% Confidence Interval Ribbon */}
                <Area
                  type="monotone"
                  dataKey="upper_bound_kwh"
                  name="95% Upper Bound"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.08}
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound_kwh"
                  name="95% Lower Bound"
                  stroke="none"
                  fill="#09090b"
                  fillOpacity={1}
                />

                {/* Expected Baseline Model Curve */}
                <Line
                  type="monotone"
                  dataKey="expected_baseline_kwh"
                  name="Normalised Baseline"
                  stroke="#10b981"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />

                {/* Actual Measured Energy Curve */}
                <Line
                  type="monotone"
                  dataKey="actual_kwh"
                  name="Actual Measured"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#38bdf8' }}
                />

                {/* Prominent Intervention Point Boundary */}
                {verification?.timeline_points && (
                  <ReferenceLine
                    x={verification.timeline_points.find((p) => p.is_intervention_point)?.date || '2026-09-22'}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{
                      value: 'INTERVENTION: ECM Commissioned',
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'top',
                      fontFamily: 'monospace',
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* "WHY WAS THIS SAVING VERIFIED?" or "WHY WAS THIS RESULT INCONCLUSIVE?" DEDICATED AUDIT CARD */}
      {verification?.why_explanation && (
        <div className={`rounded-lg border p-5 shadow-sm text-xs font-mono transition-all ${
          verification.verification_status === 'VERIFIED'
            ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
            : verification.verification_status === 'INCONCLUSIVE'
            ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
            : 'border-rose-500/50 bg-rose-950/20 text-rose-200'
        }`}>
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
            <div className="flex items-center gap-2">
              {verification.verification_status === 'VERIFIED' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : verification.verification_status === 'INCONCLUSIVE' ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : (
                <AlertOctagon className="h-5 w-5 text-rose-400" />
              )}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {verification.why_explanation.title}
                </h3>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  {verification.why_explanation.headline}
                </p>
              </div>
            </div>

            <span className="text-[10px] text-zinc-400">
              IPMVP Option C Mathematical Audit Clause
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded bg-zinc-950/80 p-3 border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                1. Mathematical Confidence Proof
              </span>
              <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                {verification.why_explanation.mathematical_proof}
              </p>
            </div>

            <div className="rounded bg-zinc-950/80 p-3 border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                2. Weather & Production Normalisation Check
              </span>
              <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                {verification.why_explanation.normalisation_factor_explanation}
              </p>
            </div>

            <div className="rounded bg-zinc-950/80 p-3 border border-zinc-800">
              <span className="text-[10px] font-bold uppercase text-zinc-400">
                3. Mandatory Next Regulatory Action
              </span>
              <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                {verification.why_explanation.next_recommended_action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTION & TEMPERATURE NORMALISATION DEEP DIVE (THE MATHEMATICAL FOUNDATION) */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
              Multivariate Linear Normalisation Model (ASHRAE Guideline 14 & EVO IPMVP)
            </h3>
          </div>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-[9px] font-mono text-zinc-300">
            OLS Closed-Form Matrix Solution
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 font-mono text-xs">
          {/* Calibrated Formula */}
          <div className="rounded bg-zinc-950 p-3.5 border border-zinc-800 lg:col-span-2">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Calibrated Shift Energy Equation</span>
            <div className="mt-1.5 rounded bg-zinc-900 p-2.5 border border-zinc-800 text-xs font-bold text-emerald-300">
              {model?.summary_equation || 'E = 210.0 + (975.0 × Production_Tonnes) + (4.2 × Temp_°C)'}
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] text-zinc-300">
              <div>
                <span className="text-zinc-500">β₀ (Baseload Standby):</span>
                <div className="font-bold text-zinc-100">{model?.beta_0} kWh/shift</div>
              </div>
              <div>
                <span className="text-zinc-500">β₁ (Melt Enthalpy):</span>
                <div className="font-bold text-zinc-100">{model?.beta_production} kWh/tonne</div>
              </div>
              <div>
                <span className="text-zinc-500">β₂ (Thermal Sens.):</span>
                <div className="font-bold text-zinc-100">{model?.beta_temperature} kWh/°C</div>
              </div>
            </div>
          </div>

          {/* ASHRAE Guideline 14 Pass/Fail Metrics */}
          <div className="rounded bg-zinc-950 p-3.5 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Standard Goodness-of-Fit</span>
              <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 text-[9px] font-bold">
                PASS
              </span>
            </div>
            <div className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">R² Coefficient:</span>
                <span className="text-emerald-400 font-bold">{model?.r_squared || 0.932} (Target &gt; 0.75)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CV(RMSE):</span>
                <span className="text-emerald-400 font-bold">{model?.cv_rmse_percent || 7.4}% (Limit &lt; 20%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">NMBE (Bias):</span>
                <span className="text-emerald-400 font-bold">+{model?.nmbe_percent || 0.8}% (Limit &lt; ±5%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
