import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sliders,
  RotateCcw,
  Save,
  Globe,
  UserCheck,
  Zap,
} from 'lucide-react';
import { AppLanguage, UserRole } from '../types';

export const DataQualityAndSettings: React.FC = () => {
  const {
    plant,
    role,
    setRole,
    language,
    setLanguage,
    addNotification,
    resetPlantSimulation,
  } = useApp();

  const [tariff, setTariff] = useState<number>(plant?.base_tariff_rs_per_kwh || 7.0);
  const [contractDemand, setContractDemand] = useState<number>(plant?.contract_demand_kVA || 1200);
  const [emissionFactor, setEmissionFactor] = useState<number>(plant?.cea_emission_factor_tco2_per_mwh || 0.70);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Plant calibration parameters updated in local state.',
    });
  };

  const qualityChecks = [
    { name: 'Time-Series Completeness', status: 'PASS', score: '99.4%', detail: 'Zero missing intervals in active monitoring buffer' },
    { name: 'Meter Reset Detection', status: 'PASS', score: '0 Events', detail: 'Monotonic cumulative kWh counter verified' },
    { name: 'Clock Synchronization', status: 'PASS', score: '< 15 ms', detail: 'NTP edge gateway synchronization within limits' },
    { name: 'Sensor Outlier Filter', status: 'PASS', score: '3 Filtered', detail: 'Filtered transient arc-furnace charging spikes' },
    { name: 'Production Alignment', status: 'PASS', score: '100% Synced', detail: 'Heat tap logs aligned with 15-minute energy intervals' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Data Quality Pipeline & Plant Configuration
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20">
              Data Hygiene Active
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Automated screening for clock drift, meter resets, outliers, and configuration calibrations
          </p>
        </div>
      </div>

      {/* Data Quality Section (Report Section 6.2) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Telemetry Data Quality Pipeline (Report Section 6.2)
            </h3>
            <p className="text-xs text-zinc-400">
              "Real plant data is messy. Baseline fitting excludes flagged bad-quality periods."
            </p>
          </div>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20 font-bold">
            99.4% VALIDATED
          </span>
        </div>

        <div className="space-y-2.5">
          {qualityChecks.map((qc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg bg-zinc-950 p-3 border border-zinc-800/80 text-xs"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-zinc-200">{qc.name}</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{qc.detail}</p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="font-bold text-emerald-400">{qc.score}</span>
                <div className="text-[10px] text-zinc-500">{qc.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plant Settings Form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-100 mb-1">
          Plant Calibration Parameters
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Versioned tariff, contract demand, and grid emission factor settings
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-zinc-400 mb-1">Electricity Base Tariff (₹/kWh)</label>
              <input
                type="number"
                step="0.1"
                value={tariff}
                onChange={(e) => setTariff(parseFloat(e.target.value))}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-mono">Benchmark: ₹7.00/kWh (HT-1 Industrial)</span>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Contract Demand (kVA)</label>
              <input
                type="number"
                step="50"
                value={contractDemand}
                onChange={(e) => setContractDemand(parseInt(e.target.value))}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-mono">1,200 kVA Sanctioned Demand</span>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">CEA Emission Factor (tCO2/MWh)</label>
              <input
                type="number"
                step="0.01"
                value={emissionFactor}
                onChange={(e) => setEmissionFactor(parseFloat(e.target.value))}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-mono">CEA Baseline Database v20.0 placeholder</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-zinc-800/80">
            <div>
              <label className="block text-zinc-400 mb-1">Operator Alert Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Active User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-200 outline-none focus:border-emerald-500"
              >
                <option value="plant_manager">Plant Manager (Full Authority & Approvals)</option>
                <option value="energy_manager">Energy Manager (Audit, M&V & Twin Simulation)</option>
                <option value="operator">Shift Operator (Real-Time Alarms & Telemetry)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={resetPlantSimulation}
              className="flex items-center gap-1.5 rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Simulator to Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
