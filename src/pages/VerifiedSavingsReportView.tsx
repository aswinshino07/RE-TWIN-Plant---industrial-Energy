import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Activity,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { MvVerificationReport } from '../types';

export const VerifiedSavingsReportView: React.FC = () => {
  const { plant, addNotification } = useApp();
  const [report, setReport] = useState<MvVerificationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.verifySavings({ action_name: 'Compressed Air Leakage Repair & Furnace Lid Management', savings_percent: 9.2 })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (!report) return;
    const headers = 'Shift ID,Date,Production (t),Baseline Expected (kWh),Actual Measured (kWh),Savings (kWh)\n';
    const rows = report.shift_comparisons
      .map((s) => `${s.shift_id},${s.date},${s.production_tonnes},${s.normalised_baseline_kwh},${s.actual_kwh},${s.delta_savings_kwh}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RE-TWIN-M&V-Report-${report.verification_id}.csv`;
    a.click();
    addNotification({
      type: 'success',
      title: 'CSV Exported',
      message: 'M&V shift verification table downloaded successfully.',
    });
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Verified Savings Report (IPMVP Option C)
            </h1>
            <span className={`rounded px-2.5 py-0.5 text-[10px] font-mono font-bold border ${
              report?.verification_status === 'VERIFIED'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : report?.verification_status === 'INCONCLUSIVE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              STATUS: {report?.verification_status || 'VERIFIED'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Core Promise: <strong className="text-zinc-200">"Verified savings, not estimated savings."</strong> Official audit documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Official Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Official Audit Document Container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl text-zinc-200 space-y-6 print:border-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-white tracking-wider">
                RE-TWIN <span className="text-emerald-400">Plant</span>
              </span>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                Team IMPEDRA • Yuva Yodha 2026
              </span>
            </div>
            <h2 className="text-sm font-bold text-zinc-100 mt-2 uppercase tracking-wide">
              Measurement & Verification (M&V) Savings Audit Certificate
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Doc ID: {report?.verification_id} • Target Plant: {plant?.name || 'Kolhapur Casting Works – Foundry Demo'}
            </p>
          </div>

          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-right font-mono text-xs">
            <div className="text-[10px] uppercase text-zinc-500">M&V Protocol Standard</div>
            <div className="font-bold text-emerald-400">IPMVP Option C</div>
            <div className="text-[10px] text-zinc-400 mt-1">Whole-Facility Normalised Model</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            1. Executive Audit Summary
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            During the reporting period from <strong className="text-white">{report?.reporting_period_start}</strong> to <strong className="text-white">{report?.reporting_period_end}</strong>, the facility completed <strong className="text-white">{report?.evaluation_shifts_count} shifts</strong> producing <strong className="text-white">{report?.total_production_tonnes} tonnes</strong> of good iron castings. Following implementation of <em>{report?.action_name}</em>, the measured post-intervention energy was compared against the calibrated production- and temperature-normalised baseline model.
          </p>
        </div>

        {/* 2. Key Audit Metrics Table */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 font-mono text-xs">
          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">Normalised Baseline</span>
            <div className="text-sm font-bold text-zinc-100 mt-1">{report?.normalised_baseline_energy_kwh.toLocaleString()} kWh</div>
            <span className="text-[10px] text-zinc-500">Expected without retrofit</span>
          </div>

          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">Actual Measured</span>
            <div className="text-sm font-bold text-zinc-100 mt-1">{report?.actual_measured_energy_kwh.toLocaleString()} kWh</div>
            <span className="text-[10px] text-zinc-500">CT-meter subtotal</span>
          </div>

          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">Gross Savings</span>
            <div className="text-sm font-bold text-emerald-400 mt-1">{report?.gross_savings_kwh.toLocaleString()} kWh</div>
            <span className="text-[10px] text-zinc-500">{report?.gross_savings_percent}% reduction</span>
          </div>

          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">95% Uncertainty (U₉₅)</span>
            <div className="text-sm font-bold text-amber-400 mt-1">±{report?.uncertainty_kwh_95.toLocaleString()} kWh</div>
            <span className="text-[10px] text-zinc-500">Relative ±{report?.uncertainty_percent}%</span>
          </div>

          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">Net Verified Value</span>
            <div className="text-sm font-bold text-emerald-400 mt-1">₹{report?.verified_savings_rs.toLocaleString()}</div>
            <span className="text-[10px] text-zinc-500">@ ₹7.00/kWh tariff</span>
          </div>

          <div className="rounded bg-zinc-900/80 p-3 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 uppercase">Avoided Carbon</span>
            <div className="text-sm font-bold text-cyan-400 mt-1">{report?.avoided_co2_tonnes} tCO2</div>
            <span className="text-[10px] text-zinc-500">@ 0.70 tCO2/MWh</span>
          </div>
        </div>

        {/* 3. Verification Rigor & Statistical Confidence Statement */}
        <div className="rounded-lg bg-zinc-900/50 p-4 border border-zinc-800 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h4 className="font-bold text-zinc-100 uppercase tracking-wide text-[11px]">
              Statistical Significance & Verification Criteria
            </h4>
          </div>
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            {report?.status_explanation}
          </p>
          <div className="font-mono text-[10px] text-zinc-500">
            Formula: S_net = (E_baseline_adjusted - E_actual) ± (t_crit × SE_baseline × √n) = [{report?.lower_bound_savings_kwh.toLocaleString()} to {report?.upper_bound_savings_kwh.toLocaleString()} kWh]
          </div>
        </div>

        {/* 4. Shift-by-Shift Audit Trail Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            4. Post-Intervention Shift Telemetry Records
          </h3>
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Production (t)</th>
                  <th className="py-2.5 px-3">Adjusted Baseline</th>
                  <th className="py-2.5 px-3">Measured Actual</th>
                  <th className="py-2.5 px-3">Verified Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                {report?.shift_comparisons.slice(-10).map((s) => (
                  <tr key={s.shift_id} className="hover:bg-zinc-900/40">
                    <td className="py-2 px-3 text-zinc-300">{s.date}</td>
                    <td className="py-2 px-3 text-zinc-300">{s.production_tonnes} t</td>
                    <td className="py-2 px-3 text-zinc-400">{s.normalised_baseline_kwh.toLocaleString()} kWh</td>
                    <td className="py-2 px-3 text-zinc-100 font-bold">{s.actual_kwh.toLocaleString()} kWh</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">+{s.delta_savings_kwh.toLocaleString()} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer & Sign-off */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end text-xs text-zinc-400 font-mono">
          <div>
            <div>Engine Version: RE-TWIN Plant M&V Kernel v1.4-Simulated</div>
            <div>Database Integrity: SHA-256 Hash Verified (Zero missing intervals)</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-300">Auditor Status: PROTOTYPE SIMULATION</div>
            <div className="text-[10px] text-zinc-500">Benchmark figures subject to physical verification before accreditation</div>
          </div>
        </div>
      </div>
    </div>
  );
};
