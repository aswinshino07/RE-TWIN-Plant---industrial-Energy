import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Workflow,
  Flame,
  LineChart,
} from 'lucide-react';

export const DemoGuideModal: React.FC = () => {
  const {
    isDemoModalOpen,
    setIsDemoModalOpen,
    demoStep,
    advanceDemoStep,
    resetHackathonDemo,
    activeFaults,
    kpi,
  } = useApp();

  if (!isDemoModalOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Observe Normal Plant Baseline',
      tab: 'Executive Dashboard',
      description:
        'The primary foundry is operating under normal steady-state conditions. Total plant draw is ~742 kW, SEC is 1,087 kWh/tonne (close to published 1,100 kWh/t benchmark), and zero major anomalies are active.',
      actionLabel: 'Inject Compressor Leakage Fault',
      badge: 'Baseline State',
    },
    {
      step: 2,
      title: 'Fault Injection: Growing Compressor Leak',
      tab: 'Plant Schematic / Telemetry',
      description:
        'We inject an orifice leakage fault into the 75 kW rotary screw compressor. The single-meter telemetry immediately reflects higher loaded duration (duty cycle climbs from 31% to 68%) and elevated unloaded draw.',
      actionLabel: 'View Real-Time Anomaly Detection',
      badge: 'Fault Active',
    },
    {
      step: 3,
      title: 'Real-Time Anomaly & Waste Quantification',
      tab: 'Waste Detection',
      description:
        'The deterministic waste detection engine immediately catches the anomaly without requiring extra hardware. It estimates excess consumption at ~24.5 kW and quantifies waste in ₹ and kWh.',
      actionLabel: 'Open Single-Meter Leakage Intelligence',
      badge: 'Diagnosis',
    },
    {
      step: 4,
      title: 'Single-Meter Intelligence Deep Dive',
      tab: 'Compressor Single-Meter Intelligence',
      description:
        'Using ONLY ONE power meter signal on the incomer/compressor, RE-TWIN Plant mathematically isolates load vs unload time (T_load / T_cycle) to infer ~28% leakage airflow (34 CFM).',
      actionLabel: 'Open Digital Twin What-If Simulator',
      badge: 'Key Differentiator',
    },
    {
      step: 5,
      title: 'Digital Twin What-If Simulation',
      tab: 'Digital Twin Scenarios',
      description:
        'The plant manager tests the "Repair Compressed Air Leakages" scenario against the plant digital twin. It simulates reducing duty cycle back to 31%, predicting 42,000 kWh/yr and ₹2.94 lakh/yr savings with 2.5 months payback.',
      actionLabel: 'Proceed to Decision Center',
      badge: 'Physics Model',
    },
    {
      step: 6,
      title: 'Decision Center & Advisory Approval',
      tab: 'Decision Center & ROI',
      description:
        'The plant manager reviews the prioritized retrofit action. Production throughput (2,000 t) is strictly locked. The manager marks the advisory action as "Approved" to trigger post-intervention tracking.',
      actionLabel: 'Execute IPMVP M&V Verification',
      badge: 'Governance',
    },
    {
      step: 7,
      title: 'Statistical M&V: Verified Savings',
      tab: 'Verified Savings (M&V)',
      description:
        'Core promise: "Verified savings, not estimated savings." The M&V engine normalises post-intervention data for weather & production, computes the 95% uncertainty interval, and statistically confirms VERIFIED SAVINGS.',
      actionLabel: 'Inspect Product Carbon Passport',
      badge: 'IPMVP Option C',
    },
    {
      step: 8,
      title: 'Export Auditable Carbon Passport',
      tab: 'Carbon Passport (EU CBAM Ready)',
      description:
        'The system generates an official product-level Carbon Passport in kg CO2/tonne of castings (Scope 1 + Scope 2) backed by versioned CEA emission factors, ready for EU CBAM disclosure and export buyers.',
      actionLabel: 'Finish Demo Tour',
      badge: 'CBAM Ready',
    },
  ];

  const current = steps[demoStep - 1] || steps[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg rounded-xl border border-emerald-500/40 bg-zinc-950/95 p-5 shadow-2xl shadow-emerald-950/40 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Yuva Yodha 2026 • Live Hackathon Demo
            </h3>
            <p className="text-[11px] text-zinc-400">
              Step {demoStep} of 8: {current.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetHackathonDemo}
            title="Restart Demo from Step 1"
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsDemoModalOpen(false)}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Pills */}
      <div className="mt-3 flex items-center gap-1">
        {steps.map((s) => (
          <div
            key={s.step}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s.step === demoStep
                ? 'bg-emerald-400'
                : s.step < demoStep
                ? 'bg-emerald-700/60'
                : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-zinc-200">
            Navigating to: <span className="text-emerald-400">{current.tab}</span>
          </span>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
            {current.badge}
          </span>
        </div>

        <p className="text-zinc-400 leading-relaxed text-[12px]">
          {current.description}
        </p>

        {/* Live contextual hint */}
        {demoStep === 2 && activeFaults.compressorLeakage.active && (
          <div className="flex items-center gap-2 rounded bg-amber-500/10 border border-amber-500/30 p-2 text-amber-300 text-[11px]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Telemetry alert: Compressor load duty cycle elevated to ~68%!</span>
          </div>
        )}

        {demoStep === 7 && (
          <div className="flex items-center gap-2 rounded bg-emerald-500/10 border border-emerald-500/30 p-2 text-emerald-300 text-[11px]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>M&V Confidence: 95% CI lower bound is strictly &gt; 0 kWh (Statistically Verified).</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-3">
        <button
          onClick={resetHackathonDemo}
          className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200"
        >
          Reset Simulation
        </button>

        <button
          onClick={advanceDemoStep}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
        >
          <span>{current.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
