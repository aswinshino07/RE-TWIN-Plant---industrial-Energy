import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarClock,
  Zap,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const SchedulingOptimiser: React.FC = () => {
  const { setActiveTab } = useApp();
  const [scheduleMode, setScheduleMode] = useState<'CURRENT' | 'OPTIMISED'>('OPTIMISED');

  // Hourly tariff profile across 24 hours:
  // 00:00 - 06:00: Night Off-Peak (-10% rebate = ₹6.30/kWh)
  // 06:00 - 10:00: Morning Peak (+25% surcharge = ₹8.75/kWh)
  // 10:00 - 18:00: Normal Daytime (₹7.00/kWh)
  // 18:00 - 22:00: Evening Peak (+25% surcharge = ₹8.75/kWh)
  // 22:00 - 24:00: Night Off-Peak (-10% rebate = ₹6.30/kWh)

  const hourlyData = [
    { hour: '00:00', tariff: 6.3, slot: 'Off-Peak', currentKw: 420, optimisedKw: 580 },
    { hour: '02:00', tariff: 6.3, slot: 'Off-Peak', currentKw: 410, optimisedKw: 570 },
    { hour: '04:00', tariff: 6.3, slot: 'Off-Peak', currentKw: 430, optimisedKw: 590 },
    { hour: '06:00', tariff: 8.75, slot: 'Morning Peak (+25%)', currentKw: 760, optimisedKw: 620 },
    { hour: '08:00', tariff: 8.75, slot: 'Morning Peak (+25%)', currentKw: 790, optimisedKw: 640 },
    { hour: '10:00', tariff: 7.0, slot: 'Normal', currentKw: 730, optimisedKw: 720 },
    { hour: '12:00', tariff: 7.0, slot: 'Normal', currentKw: 710, optimisedKw: 710 },
    { hour: '14:00', tariff: 7.0, slot: 'Normal', currentKw: 750, optimisedKw: 740 },
    { hour: '16:00', tariff: 7.0, slot: 'Normal', currentKw: 740, optimisedKw: 730 },
    { hour: '18:00', tariff: 8.75, slot: 'Evening Peak (+25%)', currentKw: 820, optimisedKw: 610 },
    { hour: '20:00', tariff: 8.75, slot: 'Evening Peak (+25%)', currentKw: 840, optimisedKw: 630 },
    { hour: '22:00', tariff: 6.3, slot: 'Night Off-Peak (-10%)', currentKw: 460, optimisedKw: 590 },
  ];

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Time-of-Day (ToD) Scheduling & Load Shifting
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              Mixed-Integer Load Shifter
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Shifts flexible sand preparation and batch auxiliary loads out of 25% peak surcharge windows into 10% night rebate slots
          </p>
        </div>

        {/* Toggle Current vs Optimised */}
        <div className="flex rounded-md bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => setScheduleMode('CURRENT')}
            className={`rounded px-3 py-1 font-semibold transition-colors cursor-pointer ${
              scheduleMode === 'CURRENT'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Current Schedule
          </button>
          <button
            onClick={() => setScheduleMode('OPTIMISED')}
            className={`rounded px-3 py-1 font-bold transition-colors cursor-pointer ${
              scheduleMode === 'OPTIMISED'
                ? 'bg-emerald-500 text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Optimised Schedule
          </button>
        </div>
      </div>

      {/* Crucial Concept Report Distinction: Energy Saving vs Cost Saving */}
      <div className="flex items-start gap-2.5 rounded-md border border-cyan-500/30 bg-cyan-950/20 p-3 text-xs text-cyan-200 font-mono">
        <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-300">
            Core Distinction (Report Section 8.4 & 19): Energy Saving vs Cost Saving
          </span>
          <p className="text-zinc-300 text-[11px] leading-relaxed mt-0.5">
            Load shifting does NOT necessarily reduce total plant kWh consumed. Instead, it reallocates flexible power consumption away from peak tariff slots (₹8.75/kWh) into night rebate hours (₹6.30/kWh). This yields direct <strong className="text-emerald-400 font-bold">₹2.10 Lakh/year</strong> cost reduction while strictly preserving 2,000 tonnes throughput.
          </p>
        </div>
      </div>

      {/* Tariff Impact KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
        <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase">Tariff Cost Savings</span>
          <div className="text-lg font-bold text-emerald-400 mt-1">₹2,10,000 / yr</div>
          <span className="text-[10px] text-zinc-400">Pure financial arbitrage</span>
        </div>

        <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase">Peak Demand Reduction</span>
          <div className="text-lg font-bold text-amber-400 mt-1">-65 kVA</div>
          <span className="text-[10px] text-zinc-400">Avoids 1200 kVA penalty</span>
        </div>

        <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase">Energy Delta (kWh)</span>
          <div className="text-lg font-bold text-zinc-200 mt-1">0 kWh</div>
          <span className="text-[10px] text-zinc-400">Same total throughput</span>
        </div>

        <div className="rounded-lg bg-zinc-900/60 p-3.5 border border-zinc-800">
          <span className="text-[10px] text-zinc-500 uppercase">Implementation Outlay</span>
          <div className="text-lg font-bold text-zinc-200 mt-1">₹35,000</div>
          <span className="text-[10px] text-zinc-400">2 months payback</span>
        </div>
      </div>

      {/* Hourly Plant Load vs Tariff Overlay Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              24-Hour Load Profile vs Time-of-Day Tariff Surcharge Slots
            </h3>
            <p className="text-xs text-zinc-400">
              Red shaded regions highlight 25% peak surcharge hours (06:00-10:00 & 18:00-22:00)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="hour" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} unit=" kW" domain={[300, 900]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar
                dataKey={scheduleMode === 'CURRENT' ? 'currentKw' : 'optimisedKw'}
                name={scheduleMode === 'CURRENT' ? 'Current Load Profile (kW)' : 'Optimised Load Profile (kW)'}
                fill={scheduleMode === 'CURRENT' ? '#71717a' : '#10b981'}
                radius={[4, 4, 0, 0]}
              >
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.slot.includes('Peak')
                        ? scheduleMode === 'CURRENT'
                          ? '#ef4444'
                          : '#f59e0b'
                        : entry.slot.includes('Off-Peak')
                        ? '#06b6d4'
                        : '#10b981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-red-500"></span> Peak Slot (₹8.75/kWh)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500"></span> Normal Slot (₹7.00/kWh)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-cyan-500"></span> Night Rebate (₹6.30/kWh)
          </span>
        </div>
      </div>

      {/* Advisory Workflow Disclaimer */}
      <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 text-xs text-zinc-400">
        <strong className="text-zinc-200">Advisory Schedule Implementation:</strong>
        <p className="mt-1">
          Recommendations are advisory. The system communicates optimal batch start times to shift supervisors via WhatsApp/Telegram in Tamil, Hindi, or English. Automated machinery starts are not enabled in version 1.0.
        </p>
      </div>
    </div>
  );
};
