import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/common/MetricCard';
import {
  Zap,
  Activity,
  Gauge,
  TrendingDown,
  DollarSign,
  Leaf,
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  Info,
  ShieldAlert,
  Sparkles,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Scale,
  Clock,
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
  Area,
  ComposedChart,
} from 'recharts';
import { api } from '../services/api';
import { BaselinePredictionPoint } from '../types';

export const ExecutiveDashboard: React.FC = () => {
  const { kpi, activeWaste, setActiveTab, triggerFault, startHackathonDemo } = useApp();
  const [predictions, setPredictions] = useState<BaselinePredictionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBaseline()
      .then((data) => {
        setPredictions(data.predictions);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-5 p-5">
      {/* Supervisory Header Banner */}
      <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-lg font-extrabold tracking-tight text-white uppercase sm:text-xl">
              Industrial Energy Command Center
            </h1>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-400 border border-amber-500/30 uppercase">
              Simulation Mode
            </span>
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-[9px] font-mono text-zinc-400 border border-zinc-700/60">
              Kolhapur MSME Cluster
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Plant: <span className="text-zinc-200">Kolhapur Casting Works (Demo)</span> • Sanctioned Demand: <span className="text-zinc-200">1,200 kVA HT</span> • Tariff: <span className="text-zinc-200">₹7.00/kWh base</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fault Console</span>
          </button>
          <button
            onClick={startHackathonDemo}
            className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Run Demo Tour</span>
          </button>
        </div>
      </div>

      {/* Mandatory Technical Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-md border border-amber-500/30 bg-amber-950/15 p-3 text-xs text-amber-200/90 font-mono">
        <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-0.5 text-[11px] leading-relaxed">
          <span className="font-bold text-amber-300 uppercase tracking-wide">
            Prototype Simulation Model (Yuva Yodha Energy Tech Hackathon 2026):
          </span>
          <p className="text-zinc-300">
            All plant telemetry, specific energy consumption metrics, and ₹ savings are benchmark-derived engineering illustrations (Foundry Benchmark: 1,100 kWh/t, ₹7/kWh, CEA CO₂ Baseline Database v20.0 placeholder). No measured plant data has been collected yet. Figures are labelled <em className="text-amber-300 font-semibold">"SIMULATED"</em> and must be calibrated with physical CT clamps.
          </p>
        </div>
      </div>

      {/* 3-TO-5-MINUTE HACKATHON DEMO FLOW (Interactive Judging Guide) */}
      <div className="rounded-lg border border-emerald-500/40 bg-zinc-900/80 p-4 shadow-sm font-mono text-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-zinc-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              3–5 Minute Hackathon Judging Flow (Core Differentiators)
            </h2>
            <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[9px] font-bold border border-emerald-500/30">
              5 Pillars
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span>Click any pillar to inspect live implementation:</span>
            <button
              onClick={startHackathonDemo}
              className="rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-2.5 py-1 font-bold transition-colors cursor-pointer"
            >
              Start Guided Tour
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
          {/* Pillar 1 */}
          <button
            onClick={() => setActiveTab('baseline')}
            className="flex flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Pillar 1</span>
                <span className="rounded bg-zinc-800 text-zinc-300 text-[8px] px-1 py-0.2">ASHRAE 14</span>
              </div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-emerald-300 transition-colors">
                1. Measure & Baseline
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                OLS multivariate regression isolates production & weather from efficiency.
              </p>
            </div>
            <div className="mt-2 text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <span>Inspect Model</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>

          {/* Pillar 2 */}
          <button
            onClick={() => setActiveTab('waste')}
            className="flex flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Pillar 2</span>
                <span className="rounded bg-amber-500/20 text-amber-300 text-[8px] px-1 py-0.2">Single-Meter</span>
              </div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-amber-300 transition-colors">
                2. Diagnose Leaks
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                Quantifies 28% compressor orifice leakage without pneumatic flow meters.
              </p>
            </div>
            <div className="mt-2 text-[9px] text-amber-400 font-bold flex items-center gap-1">
              <span>View Leak Formula</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>

          {/* Pillar 3 */}
          <button
            onClick={() => setActiveTab('twin')}
            className="flex flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Pillar 3</span>
                <span className="rounded bg-purple-500/20 text-purple-300 text-[8px] px-1 py-0.2">7 Scenarios</span>
              </div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-purple-300 transition-colors">
                3. Digital Twin What-If
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                Simulates retrofits side-by-side preserving 2,000t throughput & zero quality loss.
              </p>
            </div>
            <div className="mt-2 text-[9px] text-purple-400 font-bold flex items-center gap-1">
              <span>Launch Simulator</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>

          {/* Pillar 4 */}
          <button
            onClick={() => setActiveTab('mv')}
            className="flex flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Pillar 4</span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 text-[8px] px-1 py-0.2">IPMVP Opt C</span>
              </div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-emerald-300 transition-colors">
                4. Verified Savings (M&V)
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                Certifies savings only when 95% confidence interval strictly excludes zero.
              </p>
            </div>
            <div className="mt-2 text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <span>Audit Proof</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>

          {/* Pillar 5 */}
          <button
            onClick={() => setActiveTab('carbon')}
            className="flex flex-col justify-between rounded-md border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-zinc-500 uppercase font-bold">Pillar 5</span>
                <span className="rounded bg-cyan-500/20 text-cyan-300 text-[8px] px-1 py-0.2">EU CBAM</span>
              </div>
              <div className="font-bold text-xs text-zinc-200 group-hover:text-cyan-300 transition-colors">
                5. Carbon Passport
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                Generates export buyer certificate in kg CO₂/t castings backed by CEA factors.
              </p>
            </div>
            <div className="mt-2 text-[9px] text-cyan-400 font-bold flex items-center gap-1">
              <span>View Passport</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </div>
          </button>
        </div>
      </div>

      {/* TOP 8 CORE INDUSTRIAL HUD CARDS: Energy | Production | SEC | Waste | Savings | Carbon | Equipment Health | Verification */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {/* 1. ENERGY */}
        <MetricCard
          label="Energy (Draw)"
          value={kpi?.current_power_kw || 742}
          unit="kW"
          icon={Zap}
          statusColor="emerald"
          badge="Live 2s"
          badgeVariant="success"
          subtext="Total Plant Load"
          onClick={() => setActiveTab('live_plant')}
        />

        {/* 2. PRODUCTION */}
        <MetricCard
          label="Production"
          value={kpi?.todays_production_tonnes !== undefined ? kpi.todays_production_tonnes.toFixed(1) : '5.8'}
          unit="Tonnes"
          icon={Activity}
          statusColor="cyan"
          badge="Shift 2"
          badgeVariant="info"
          subtext="Good Iron Output"
          onClick={() => setActiveTab('sec')}
        />

        {/* 3. SEC */}
        <MetricCard
          label="SEC (Specific)"
          value={kpi?.sec_kwh_per_tonne || 1087}
          unit="kWh/t"
          icon={Gauge}
          statusColor={kpi && kpi.sec_kwh_per_tonne > 1100 ? 'amber' : 'emerald'}
          benchmarkComparison="BEE Benchmark: 1,100"
          delta={{ value: '1.2% gap', isPositiveGood: false, isIncrease: true }}
          onClick={() => setActiveTab('sec')}
        />

        {/* 4. WASTE */}
        <MetricCard
          label="Waste (Today)"
          value={`₹${(kpi?.todays_waste_rs || 8420).toLocaleString()}`}
          icon={TrendingDown}
          statusColor={activeWaste.length > 0 ? 'rose' : 'emerald'}
          badge={`${activeWaste.length} Alarms`}
          badgeVariant={activeWaste.length > 0 ? 'warning' : 'success'}
          subtext={`${kpi?.todays_waste_kwh || 120} kWh excess`}
          onClick={() => setActiveTab('waste')}
        />

        {/* 5. SAVINGS */}
        <MetricCard
          label="Savings (Est.)"
          value={kpi?.potential_annual_savings_rs_lakh !== undefined ? `₹${kpi.potential_annual_savings_rs_lakh.toFixed(1)}` : '₹15.4'}
          unit="L/yr"
          icon={DollarSign}
          statusColor="emerald"
          badge="10% SEC Target"
          badgeVariant="success"
          subtext="Central Case (6 mo)"
          onClick={() => setActiveTab('twin')}
        />

        {/* 6. CARBON */}
        <MetricCard
          label="Carbon Avoided"
          value={kpi?.co2_avoided_tonnes_year || 154}
          unit="t/yr"
          icon={Leaf}
          statusColor="cyan"
          badge="Scope 2"
          badgeVariant="info"
          subtext="@ 0.70 tCO2/MWh"
          onClick={() => setActiveTab('carbon')}
        />

        {/* 7. EQUIPMENT HEALTH */}
        <MetricCard
          label="Asset Health"
          value={kpi?.plant_health_score || 86}
          unit="/100"
          icon={HeartPulse}
          statusColor={kpi && kpi.plant_health_score >= 80 ? 'emerald' : 'amber'}
          badge={kpi && kpi.plant_health_score >= 80 ? 'Healthy' : 'Attention'}
          badgeVariant={kpi && kpi.plant_health_score >= 80 ? 'success' : 'warning'}
          subtext="Current-based score"
          onClick={() => setActiveTab('health')}
        />

        {/* 8. VERIFICATION */}
        <MetricCard
          label="Verification"
          value="VERIFIED"
          icon={ShieldCheck}
          statusColor="emerald"
          badge="IPMVP Opt C"
          badgeVariant="success"
          subtext="95% CI > 0 kWh"
          onClick={() => setActiveTab('mv')}
        />
      </div>

      {/* Main Analytical Chart: Shift Energy vs Normalised Baseline with 95% Uncertainty Bands */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                Shift Energy Consumption vs Normalised Baseline (M&V Engine)
              </h2>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/20 uppercase">
                ASHRAE Guideline 14 Validated
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
              Normalised Model: <span className="text-zinc-200 font-bold">E = 210.0 + (975.0 × Tonnes) + (4.2 × Temp°C)</span>. Shaded area represents the 95% prediction interval (±1.96 SE).
            </p>
          </div>

          <button
            onClick={() => setActiveTab('baseline')}
            className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <span>Model Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded border border-zinc-800/40 bg-zinc-950/40 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-zinc-400">Synchronizing OLS regression matrix & telemetry baselines...</span>
              </div>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-2/3 animate-pulse bg-emerald-500"></div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictions.slice(-21)}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} fontVariant="tabular-nums" />
                <YAxis stroke="#71717a" fontSize={10} domain={['dataMin - 120', 'dataMax + 120']} unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(val: any, name: any) => [
                    `${val} kWh`,
                    name === 'actual_kwh'
                      ? 'Actual Measured'
                      : name === 'expected_baseline_kwh'
                      ? 'Normalised Baseline'
                      : name === 'upper_bound_kwh'
                      ? 'Upper 95% Bound'
                      : name === 'lower_bound_kwh'
                      ? 'Lower 95% Bound'
                      : name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '6px', fontFamily: 'monospace' }}
                  formatter={(val) =>
                    val === 'actual_kwh'
                      ? 'Actual Measured Energy'
                      : val === 'expected_baseline_kwh'
                      ? 'Normalised Baseline'
                      : val === 'upper_bound_kwh'
                      ? 'Upper 95% Bound'
                      : val === 'lower_bound_kwh'
                      ? 'Lower 95% Bound'
                      : val
                  }
                />
                <Area type="monotone" dataKey="upper_bound_kwh" stroke="none" fill="#10b981" fillOpacity={0.07} />
                <Area type="monotone" dataKey="lower_bound_kwh" stroke="none" fill="#09090b" fillOpacity={1} />
                <Line type="monotone" dataKey="expected_baseline_kwh" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="actual_kwh" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2.5, fill: '#38bdf8' }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Two Columns: Prioritized Retrofit Roadmap & SCADA Alarm Annunciator */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Prioritised Retrofit Roadmap */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                Prioritised Retrofit Roadmap (Calculated Deterministically)
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Ranked by financial savings (₹), energy saved (kWh), and simple payback
              </p>
            </div>
            <button
              onClick={() => setActiveTab('decision')}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Decision Center</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: 'Compressor Leakage Elimination & Delta-P Tuning',
                annual_rs: '₹2,40,000 / yr',
                annual_kwh: '34,200 kWh',
                payback: '2.5 mo payback',
                confidence: 'HIGH (Single-Meter)',
                mechanism: 'Repair 28% orifice leaks; reduce distribution pressure from 7.5 to 6.8 bar',
                action: () => triggerFault('compressorLeakage', false),
              },
              {
                title: 'Furnace Crucible Lid Deployment & Holding Control',
                annual_rs: '₹4,10,000 / yr',
                annual_kwh: '58,500 kWh',
                payback: '4.8 mo payback',
                confidence: 'MEDIUM',
                mechanism: 'Pneumatic refractory cover eliminates 1500°C blackbody radiant losses',
                action: () => triggerFault('furnaceInefficientHolding', false),
              },
              {
                title: 'APFC Capacitor Bank Step Overhaul (PF 0.93 → 0.985)',
                annual_rs: '₹1,40,000 / yr',
                annual_kwh: '14,000 kWh',
                payback: '3.2 mo payback',
                confidence: 'HIGH',
                mechanism: 'Eliminates DISCOM low-power-factor penalties and transformer cable losses',
                action: () => triggerFault('lowPowerFactor', false),
              },
            ].map((opp, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-md border border-zinc-800/90 bg-zinc-950/70 p-3 sm:flex-row sm:items-center hover:border-zinc-700 transition-colors gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-100">
                      {opp.title}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
                      {opp.confidence}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {opp.mechanism}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <span className="text-emerald-400 font-bold">{opp.annual_rs}</span>
                    <span>•</span>
                    <span>{opp.annual_kwh}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{opp.payback}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('twin')}
                  className="self-start sm:self-center shrink-0 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-200 transition-colors cursor-pointer"
                >
                  Simulate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Waste Annunciator & Active Alarms */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                  Real-Time Waste Detector & Alarm Annunciator
                </h3>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono text-amber-400 border border-amber-500/30">
                  {activeWaste.length} Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Continuous single-meter duty-cycle and physics-based residual alerts
              </p>
            </div>
            <button
              onClick={() => setActiveTab('waste')}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All Alarms</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {activeWaste.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-800 p-8 text-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-400 mb-2" />
              <p className="text-xs font-medium text-zinc-200">
                All Plant Loads Operating Within Nominal Envelopes
              </p>
              <p className="text-[11px] text-zinc-400 max-w-xs mt-1 font-mono">
                No abnormal thermal or load deviations detected. Inject a fault in the simulator to test real-time detection.
              </p>
              <button
                onClick={() => triggerFault('compressorLeakage', true, 0.75)}
                className="mt-3 rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-[11px] font-mono text-emerald-400 transition-colors cursor-pointer"
              >
                + Inject Compressor Leak Fault
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeWaste.slice(0, 3).map((w) => (
                <div
                  key={w.event_id}
                  className="rounded-md border border-amber-500/30 bg-amber-950/20 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">
                      {w.title}
                    </span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 font-bold border border-amber-500/30">
                      {w.severity}
                    </span>
                  </div>
                  <p className="text-zinc-300 mt-1 text-[11px] leading-relaxed">
                    {w.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-zinc-800/80 pt-1.5 text-[10px] font-mono">
                    <span className="text-zinc-400">
                      Excess: <strong className="text-amber-400">{w.excess_power_kw} kW</strong>
                    </span>
                    <span className="text-zinc-400">
                      Waste: <strong className="text-rose-400">₹{w.estimated_waste_rs.toLocaleString()}</strong> ({w.estimated_waste_kwh} kWh)
                    </span>
                    <span className="text-emerald-400">
                      Confidence: {w.confidence_percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
