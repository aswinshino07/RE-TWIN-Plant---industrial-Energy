import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Wind,
  Flame,
  Activity,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SimulatorFaultState } from '../types';

export const DataSimulatorView: React.FC = () => {
  const {
    activeFaults,
    triggerFault,
    simSpeed,
    changeSpeed,
    resetPlantSimulation,
    readings,
    kpi,
    setActiveTab,
  } = useApp();

  const faultDefinitions: {
    key: keyof SimulatorFaultState;
    title: string;
    targetAsset: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    physicsEffect: string;
  }[] = [
    {
      key: 'compressorLeakage',
      title: 'Compressor Orifice Leakage Growth',
      targetAsset: 'Air Compressor (Rotary Screw 75 kW)',
      description: 'Simulates pipe fissures and loose pneumatic fittings. Increases compressor duty cycle from 31% to 68% and unloaded draw.',
      icon: Wind,
      physicsEffect: 'Single-meter power signature reflects shortened unload time; waste quantified via CAC leakage relation.',
    },
    {
      key: 'compressorIdleRunning',
      title: 'Compressor Prolonged Idle Running',
      targetAsset: 'Air Compressor (Rotary Screw 75 kW)',
      description: 'Simulates compressor running unloaded without entering auto-shutdown during non-production shifts.',
      icon: Clock,
      physicsEffect: 'Compressor draws 21 kW unloaded power producing zero pneumatic air for > 20 mins.',
    },
    {
      key: 'furnaceInefficientHolding',
      title: 'Furnace Radiant Holding & Open Lid Loss',
      targetAsset: 'Induction Melting Furnace (Coreless 1.5t)',
      description: 'Simulates open crucible lid during ladle delays and alloy staging; elevated radiant heat loss at 1500°C.',
      icon: Flame,
      physicsEffect: 'Stefan-Boltzmann radiative loss increases holding power from 135 kW to 280 kW.',
    },
    {
      key: 'motorDegradation',
      title: 'Cooling Pump Motor Bearing / Winding Degradation',
      targetAsset: 'Furnace Cooling Pump (Motor 1, 37 kW)',
      description: 'Induces negative-sequence current imbalance and stator temperature rise on the critical induction coil cooling loop.',
      icon: Activity,
      physicsEffect: 'Phase current imbalance jumps from 1.2% to 6.2%; motor temperature climbs from 48°C to 74°C.',
    },
    {
      key: 'lowPowerFactor',
      title: 'APFC Capacitor Bank Step Trip (Low PF)',
      targetAsset: 'Main Incomer 11kV/415V Substation',
      description: 'Deactivates 100 kVAr capacitor steps, dropping plant power factor from 0.95 to 0.82 and triggering DISCOM penalties.',
      icon: Zap,
      physicsEffect: 'Higher apparent power (kVA = kW/PF) increases transformer losses and incurs monthly utility penalty.',
    },
    {
      key: 'demandSpike',
      title: 'Coincident Peak Demand Surge',
      targetAsset: 'Main Incomer 11kV/415V',
      description: 'Simulates simultaneous furnace peak melt and auxiliary starts approaching the 1,200 kVA contract demand limit.',
      icon: AlertTriangle,
      physicsEffect: 'Triggers maximum demand overshoot warning; tariff demand charges apply at 150-200% rate.',
    },
    {
      key: 'sensorDropout',
      title: 'CT Clamp Comms Loss / Bad Quality Flag',
      targetAsset: 'Sand Intensive Mixer (Motor 2, 45 kW)',
      description: 'Simulates Modbus/RS485 sensor communication dropout; assigns MISSING quality flag to readings.',
      icon: Radio,
      physicsEffect: 'Data pipeline flags missing telemetry; baseline fitting excludes corrupted time intervals.',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Data Simulator & Fault Injection Console
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              Deterministic Seeded Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Inject realistic thermodynamic and electrical faults to test real-time anomaly detection, single-meter diagnostics, and M&V
          </p>
        </div>

        {/* Global Simulator Controls */}
        <div className="flex items-center gap-2">
          {/* Speed */}
          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-1 text-xs">
            <span className="px-2 text-zinc-400 font-mono">Speed:</span>
            {([1, 5, 10] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => changeSpeed(spd)}
                className={`rounded px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                  simSpeed === spd
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={resetPlantSimulation}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Quick Test Preset Buttons */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          Quick Demo Presets
        </span>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <button
            onClick={async () => {
              await resetPlantSimulation();
              await triggerFault('compressorLeakage', true, 0.75);
              setActiveTab('waste');
            }}
            className="flex items-center gap-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-amber-300 font-medium transition-colors cursor-pointer"
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Preset 1: Inject Compressor Leakage & View Waste</span>
          </button>

          <button
            onClick={async () => {
              await resetPlantSimulation();
              await triggerFault('furnaceInefficientHolding', true, 0.8);
              setActiveTab('waste');
            }}
            className="flex items-center gap-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-rose-300 font-medium transition-colors cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Preset 2: Inject Furnace Open Lid Holding</span>
          </button>

          <button
            onClick={async () => {
              await resetPlantSimulation();
              await triggerFault('motorDegradation', true, 0.85);
              setActiveTab('health');
            }}
            className="flex items-center gap-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Preset 3: Inject Cooling Pump Motor Imbalance</span>
          </button>

          <button
            onClick={async () => {
              await resetPlantSimulation();
              await triggerFault('lowPowerFactor', true, 0.8);
              setActiveTab('live_plant');
            }}
            className="flex items-center gap-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-purple-300 font-medium transition-colors cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Preset 4: Trip APFC Capacitor Bank (PF 0.82)</span>
          </button>
        </div>
      </div>

      {/* Fault Injection Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {faultDefinitions.map((f) => {
          const Icon = f.icon;
          const faultConfig = activeFaults[f.key];
          const isActive = faultConfig?.active;
          const severity = faultConfig?.severity || 0.6;

          return (
            <div
              key={f.key}
              className={`rounded-xl border p-5 text-xs transition-all ${
                isActive
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-md shadow-amber-950/30'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100">{f.title}</h3>
                    <span className="text-[10px] font-mono text-zinc-500">{f.targetAsset}</span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => triggerFault(f.key, !isActive, severity)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <p className="text-zinc-400 text-[11px] leading-relaxed mb-3">
                {f.description}
              </p>

              {/* Severity Slider */}
              <div className="space-y-1.5 border-t border-zinc-800/80 pt-3 mb-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Fault Severity:</span>
                  <span className={`font-bold ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {(severity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={severity}
                  onChange={(e) => triggerFault(f.key, isActive, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Physics Mechanism Callout */}
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80 text-[10px] text-zinc-400">
                <span className="font-bold text-zinc-300">Physics Effect: </span>
                {f.physicsEffect}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
