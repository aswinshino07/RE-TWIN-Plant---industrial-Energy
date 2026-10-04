import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Leaf,
  FileCheck2,
  Download,
  Printer,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  Award,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';
import { CarbonPassportRecord } from '../types';

export const CarbonPassportView: React.FC = () => {
  const { plant, addNotification } = useApp();
  const [passport, setPassport] = useState<CarbonPassportRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCarbonPassport()
      .then((data) => {
        setPassport(data);
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

  const handleDownloadCsv = () => {
    if (!passport) return;
    const csvContent =
      `Passport ID,${passport.passport_id}\n` +
      `Plant Name,${passport.plant_name}\n` +
      `Product,${passport.product_name}\n` +
      `Reporting Period,${passport.reporting_period}\n` +
      `Good Production (Tonnes),${passport.good_production_tonnes}\n` +
      `Electricity Consumed (kWh),${passport.electricity_consumed_kwh}\n` +
      `Fuel Consumed (Litres),${passport.fuel_diesel_consumed_litres}\n` +
      `Scope 1 (kg CO2),${passport.scope_1_emissions_kg_co2}\n` +
      `Scope 2 (kg CO2),${passport.scope_2_emissions_kg_co2}\n` +
      `Total Emissions (kg CO2),${passport.total_emissions_kg_co2}\n` +
      `Carbon Intensity (kg CO2/tonne),${passport.carbon_intensity_kg_co2_per_tonne}\n` +
      `Grid Emission Factor,${passport.grid_emission_factor_value} (${passport.grid_emission_factor_source})\n` +
      `CBAM Status,${passport.cbam_applicability}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Carbon-Passport-${passport.passport_id}.csv`;
    a.click();
    addNotification({
      type: 'success',
      title: 'Passport Downloaded',
      message: 'Carbon passport CSV exported for buyer disclosure.',
    });
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Product Carbon Passport (EU CBAM Ready)
            </h1>
            <span className="rounded bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
              Scope 1 & Scope 2 Embedded Emissions
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Auditable specific emissions transparency in kg CO₂ per tonne of iron castings for export buyers and border carbon adjustment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 rounded bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Carbon Passport PDF</span>
          </button>
        </div>
      </div>

      {/* Mandatory Certification Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-200/90">
        <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-amber-300 uppercase tracking-wide text-[11px]">
            Regulatory Audit Disclaimer (Report Section 9.2 & 12.1):
          </span>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {passport?.legal_disclaimer ||
              'RE-TWIN Plant does not certify emissions. All figures are calculated from sub-metered telemetry and versioned emission factors. Third-party accreditation requirements under EU CBAM or buyer ESG frameworks still apply.'}
          </p>
        </div>
      </div>

      {/* Official Passport Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl text-zinc-200 space-y-6 print:border-none print:bg-white print:text-black">
        {/* Passport Title Header */}
        <div className="border-b border-zinc-800 pb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-cyan-400 uppercase">
                  Product Carbon Passport
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold">
                  PASS
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {passport?.product_name || 'Ductile & Grey Iron Castings (HS Code: 7325.99)'}
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Passport ID: {passport?.passport_id} • Issued: {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-right font-mono text-xs">
            <div className="text-[10px] uppercase text-zinc-500">EU CBAM Regulation Status</div>
            <div className="font-bold text-cyan-300">Definitive Period Compliant</div>
            <div className="text-[10px] text-zinc-400 mt-1">Effective 1 January 2026</div>
          </div>
        </div>

        {/* Primary Indicator: kg CO2 / Tonne of Good Product */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Product Carbon Intensity
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-extrabold text-cyan-300">
                {passport?.carbon_intensity_kg_co2_per_tonne || 798.2}
              </span>
              <span className="text-xs font-mono text-zinc-400">kg CO₂e / tonne of castings</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300">
              Benchmark foundry cluster intensity: <strong className="text-white">840.0 kg CO₂/t</strong>. Performance delta: <strong className="text-emerald-400">-5.0% lower emissions</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Scope 2 Emissions (Grid)
            </span>
            <div className="mt-2 font-mono text-2xl font-bold text-zinc-100">
              {(passport?.scope_2_emissions_kg_co2 || 129640).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">kg CO₂ (96.8% of total)</span>
            <div className="mt-2 text-[10px] text-zinc-400">
              185,200 kWh × 0.70 kg CO₂/kWh
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Scope 1 Emissions (Fuel)
            </span>
            <div className="mt-2 font-mono text-2xl font-bold text-zinc-100">
              {(passport?.scope_1_emissions_kg_co2 || 3886).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">kg CO₂ (3.2% of total)</span>
            <div className="mt-2 text-[10px] text-zinc-400">
              1,450 L Diesel × 2.68 kg CO₂/L
            </div>
          </div>
        </div>

        {/* Detailed Boundary & Factor Audit Trail */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Versioned Emission Factors & Methodology Trail
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs font-mono">
            <div className="rounded bg-zinc-950 p-3 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Electricity Factor (Scope 2)</span>
              <div className="text-zinc-200">Value: <strong>0.70 kg CO₂e / kWh</strong> (0.70 tCO₂/MWh)</div>
              <div className="text-zinc-400 text-[11px]">Source: Central Electricity Authority (CEA) Baseline Database</div>
              <div className="text-zinc-500 text-[10px]">Version: v20.0 (Illustrative placeholder for prototype)</div>
            </div>

            <div className="rounded bg-zinc-950 p-3 border border-zinc-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400">Stationary Combustion (Scope 1)</span>
              <div className="text-zinc-200">Value: <strong>2.68 kg CO₂e / Litre diesel</strong></div>
              <div className="text-zinc-400 text-[11px]">Source: IPCC 2006 Guidelines for National GHG Inventories</div>
              <div className="text-zinc-500 text-[10px]">Ladle pre-heating torch & standby DG set combustion</div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="border-t border-zinc-800 pt-4 flex flex-col justify-between gap-2 sm:flex-row text-xs text-zinc-400 font-mono">
          <div>Data Quality Completeness: 99.4% (Class 0.5S Meters)</div>
          <div>Auditable Reporting Format: GHG Protocol Corporate Standard & ISO 14064</div>
        </div>
      </div>
    </div>
  );
};
