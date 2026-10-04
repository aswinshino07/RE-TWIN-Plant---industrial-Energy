import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Network,
  Cpu,
  Radio,
  Database,
  LineChart,
  Workflow,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedLayer, setSelectedLayer] = useState<number>(0);

  const layers = [
    {
      id: 1,
      name: 'Layer 1: Plant Sensing',
      subtitle: 'Non-Invasive CT-Clamp Meters & Context Loggers',
      icon: Cpu,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      components: [
        'CT-clamp energy meters on Main Incomer, Induction Furnace, Screw Compressor, and 3 Auxiliary Motors',
        '3-phase Voltage (V), Current (A), Active Power (kW), Reactive Power (kVA), Power Factor (PF), and Cumulative kWh',
        'Ambient temperature sensor & digital production tally counter (good tonnes & shift heat count)',
      ],
      designNotes:
        'Split-core current transformers clip over existing cables without plant shutdown. Non-invasive deployment takes ~1 day for 6 monitoring nodes.',
    },
    {
      id: 2,
      name: 'Layer 2: Edge Gateway',
      subtitle: 'Modbus RTU to MQTT & Local Buffering',
      icon: Radio,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      components: [
        'ESP32 / Industrial Linux Edge Gateway with RS485 transceiver',
        'Modbus RTU polling loop (5-second intervals per metering node)',
        'Local flash ring buffer preserving up to 72 hours of telemetry during factory internet outages',
        'TLS encrypted MQTT publishing to virtual / cloud broker (`plant/kolhapur/meter/#`)',
      ],
      designNotes:
        'Local anomaly thresholds run directly on the gateway so critical current imbalance warnings fire even if WAN connectivity is dropped.',
    },
    {
      id: 3,
      name: 'Layer 3: Data Layer & Registry',
      subtitle: 'Time-Series Store & Versioned Factor Tables',
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      components: [
        'High-throughput time-series store (TimescaleDB / InfluxDB schema abstraction)',
        'Data hygiene pipeline: Missing interval interpolation, meter reset detection, clock drift alignment',
        'Asset registry: rated kW, serial numbers, maintenance logs, and sub-meter mapping',
        'Versioned tariff matrices (Time-of-Day peak surcharges) & CEA grid emission factors',
      ],
      designNotes:
        'Tariff and emission factors are strictly versioned with effective date bounds so all historical M&V audit certificates remain 100% reproducible.',
    },
    {
      id: 4,
      name: 'Layer 4: Analytics Engine',
      subtitle: 'Normalised Baseline, Single-Meter Intelligence & Waste Detection',
      icon: LineChart,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      components: [
        'OLS Multiple Linear Regression: E = β₀ + β₁·Production + β₂·Temperature + ε (ASHRAE Guideline 14 validated)',
        'CUSUM cumulative sum tracking for long-term baseline drift detection',
        'Single-Meter Intelligence: Rotary screw compressor duty-cycle and unloaded power fraction leakage formula',
        'Equipment Health Scoring: Phase current imbalance (NEMA MG1), motor temperature rise, and power factor degradation',
      ],
      designNotes:
        'Simple, explainable physics-informed models first. No black-box neural networks for the core baseline, ensuring auditable credibility.',
    },
    {
      id: 5,
      name: 'Layer 5: Digital Twin & Optimiser',
      subtitle: 'Physics What-If Simulation & Mixed-Integer Scheduler',
      icon: Workflow,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      components: [
        'Deterministic what-if plant simulator with 8 candidate operational and retrofit scenarios',
        'Mixed-integer load shifting scheduler: moves flexible motor/sand preparation loads away from 25% peak tariff slots',
        'Rooftop solar PV profile integration & optional second-life EV battery peak shaving',
        'Hard constraints strictly locked: Throughput ≥ 2,000 tonnes/yr, quality yield ≥ 88%, furnace melt cycle integrity',
      ],
      designNotes:
        'All scenario outputs are scored side-by-side on ₹ cost, kWh savings, CO₂ avoidance, and simple payback before capital commitment.',
    },
    {
      id: 6,
      name: 'Layer 6: Governance, M&V & Alerts',
      subtitle: 'IPMVP Option C Verification, Carbon Passport & Vernacular Alerts',
      icon: ShieldCheck,
      color: 'text-lime-400',
      bgColor: 'bg-lime-500/10 border-lime-500/30',
      components: [
        'IPMVP Option C statistical verification: Net savings = Baseline - Actual ± U₉₅ (flagged INCONCLUSIVE if interval spans 0)',
        'Product-Level Carbon Passport (kg CO₂/tonne castings) compliant with EU CBAM Definitive Period disclosure',
        'Advisory Decision Center: Action recommendation roadmap with managerial approval audit trail',
        'Multilingual alerts in Tamil, Hindi, and English via WhatsApp / Telegram operator dispatch',
      ],
      designNotes:
        'Recommendations are strictly advisory. System never takes autonomous physical control of factory floor machinery in version 1.',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              System Architecture & Industrial Data Flow
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              Figure 2 & Section 5 Architecture
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            6-tier industrial IoT and analytics stack from non-invasive CT clamps to verified IPMVP savings reports
          </p>
        </div>
      </div>

      {/* 6 Layers Horizontal Selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          const isSelected = selectedLayer === idx;
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(idx)}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg mb-2 ${layer.bgColor}`}>
                <Icon className={`h-4 w-4 ${layer.color}`} />
              </div>
              <span className="font-bold text-xs text-zinc-200">
                Layer {layer.id}
              </span>
              <span className="text-[10px] text-zinc-500 truncate w-full mt-0.5">
                {layer.name.split(':')[1]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Layer Deep Dive */}
      {(() => {
        const cur = layers[selectedLayer];
        const Icon = cur.icon;
        return (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cur.bgColor}`}>
                <Icon className={`h-5 w-5 ${cur.color}`} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500">Tier Specification</span>
                <h3 className="text-base font-bold text-white">{cur.name}</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">{cur.subtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs">
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Components & Functional Modules
                </span>
                <ul className="space-y-2 text-zinc-300">
                  {cur.components.map((comp, i) => (
                    <li key={i} className="flex items-start gap-2 rounded bg-zinc-950 p-2.5 border border-zinc-800/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Industrial Design Notes (Report Section 5.1)
                </span>
                <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 text-zinc-300 text-[11px] leading-relaxed space-y-2">
                  <p>{cur.designNotes}</p>
                  <div className="pt-2 border-t border-zinc-900 font-mono text-[10px] text-zinc-500">
                    Protocols: Modbus RTU (RS485), MQTT 3.1.1 over TLS, HTTP/2 REST APIs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* End-to-End Workflow Diagram: Figure 1 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">
          End-to-End Workflow: Measure → Baseline → Diagnose → Optimise → Decide → Verify
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Structured 6-stage lifecycle preventing unverified estimation and ensuring trust with plant owners
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-6 text-xs font-mono">
          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-center">
            <span className="text-[9px] uppercase text-zinc-500">1. Measure</span>
            <div className="text-xs font-bold text-zinc-100 mt-1">CT Clamps</div>
            <p className="text-[10px] text-zinc-500 mt-1">Clean time-series per asset</p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-center">
            <span className="text-[9px] uppercase text-zinc-500">2. Baseline</span>
            <div className="text-xs font-bold text-zinc-100 mt-1">OLS Regression</div>
            <p className="text-[10px] text-zinc-500 mt-1">Prod & Temp normalised</p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-center">
            <span className="text-[9px] uppercase text-zinc-500">3. Diagnose</span>
            <div className="text-xs font-bold text-zinc-100 mt-1">Waste Detector</div>
            <p className="text-[10px] text-zinc-500 mt-1">Ranked waste in kWh & ₹</p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-center">
            <span className="text-[9px] uppercase text-zinc-500">4. Optimise</span>
            <div className="text-xs font-bold text-zinc-100 mt-1">Digital Twin</div>
            <p className="text-[10px] text-zinc-500 mt-1">Load shift & what-if</p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-zinc-800 text-center">
            <span className="text-[9px] uppercase text-zinc-500">5. Decide</span>
            <div className="text-xs font-bold text-zinc-100 mt-1">Decision Center</div>
            <p className="text-[10px] text-zinc-500 mt-1">ROI, payback, ₹ scored</p>
          </div>

          <div className="rounded-lg bg-zinc-950 p-3 border border-emerald-500/40 bg-emerald-950/20 text-center">
            <span className="text-[9px] uppercase text-emerald-400 font-bold">6. Verify</span>
            <div className="text-xs font-bold text-emerald-300 mt-1">IPMVP M&V</div>
            <p className="text-[10px] text-emerald-400/80 mt-1">Verified Savings Report</p>
          </div>
        </div>
      </div>
    </div>
  );
};
