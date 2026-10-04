import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingDown,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info,
  Sliders,
  Check,
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

interface RecommendedAction {
  id: string;
  title: string;
  asset: string;
  category: string;
  reason: string;
  expected_kwh: number;
  expected_rs: number;
  expected_co2_tonnes: number;
  capex_rs: number;
  payback_months: number;
  risk: 'Low' | 'Medium';
  confidence: 'High' | 'Medium';
  production_impact: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const DecisionCenter: React.FC = () => {
  const { setActiveTab, addNotification } = useApp();

  const [actions, setActions] = useState<RecommendedAction[]>([
    {
      id: 'act-1',
      title: 'Repair Compressed Air Orifice Leaks',
      asset: 'Air Compressor (75 kW Rotary Screw)',
      category: 'Maintenance',
      reason: 'Single-meter power signature indicates 28% orifice leakage airflow during non-productive cycles.',
      expected_kwh: 42000,
      expected_rs: 294000,
      expected_co2_tonnes: 29.4,
      capex_rs: 65000,
      payback_months: 2.7,
      risk: 'Low',
      confidence: 'High',
      production_impact: 'None (preserves 2,000 t output)',
      status: 'APPROVED',
    },
    {
      id: 'act-2',
      title: 'Deploy Automated Refractory Crucible Lid Cover',
      asset: 'Induction Melting Furnace (Coreless 1.5t)',
      category: 'Operational',
      reason: 'Prevents 1500°C radiant heat loss during ladle delays and alloy staging; reduces holding draw from 260 kW to 135 kW.',
      expected_kwh: 88000,
      expected_rs: 616000,
      expected_co2_tonnes: 61.6,
      capex_rs: 180000,
      payback_months: 3.5,
      risk: 'Low',
      confidence: 'High',
      production_impact: 'None (preserves melt cycle integrity)',
      status: 'PENDING',
    },
    {
      id: 'act-3',
      title: 'APFC Capacitor Bank Step Overhaul (PF 0.93 → 0.985)',
      asset: 'Main Incomer & Substation APFC',
      category: 'Electrical Retrofit',
      reason: 'Eliminates DISCOM monthly low-power-factor billing surcharges and reduces I²R distribution cable losses.',
      expected_kwh: 14000,
      expected_rs: 178000,
      expected_co2_tonnes: 9.8,
      capex_rs: 140000,
      payback_months: 9.4,
      risk: 'Low',
      confidence: 'High',
      production_impact: 'None',
      status: 'PENDING',
    },
    {
      id: 'act-4',
      title: 'Shift Sand Preparation Mixers to Off-Peak Night Slot',
      asset: 'Sand Intensive Mixer (Motor 2, 45 kW)',
      category: 'Load Shifting',
      reason: 'Arbitrages Tamil Nadu / Maharashtra 25% peak tariff surcharge into 10% night off-peak rebate.',
      expected_kwh: 0,
      expected_rs: 210000,
      expected_co2_tonnes: 0,
      capex_rs: 35000,
      payback_months: 2.0,
      risk: 'Low',
      confidence: 'High',
      production_impact: 'None (buffer bins hold prepared sand)',
      status: 'PENDING',
    },
  ]);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    const action = actions.find((a) => a.id === id);
    addNotification({
      type: status === 'APPROVED' ? 'success' : 'info',
      title: status === 'APPROVED' ? 'Advisory Action Approved' : 'Action Rejected',
      message: `${action?.title} marked as ${status}. Ready for M&V verification tracking.`,
    });
  };

  // Illustrative Foundry Benchmark Scenarios (Report Section 8.3)
  const roiScenarios = [
    { scenario: 'Low (5% SEC)', kwhSaved: 110000, rsSaved: 770000, paybackMonths: 11.7, fill: '#84cc16' },
    { scenario: 'Central (10% SEC)', kwhSaved: 220000, rsSaved: 1540000, paybackMonths: 5.8, fill: '#10b981' },
    { scenario: 'High (15% SEC)', kwhSaved: 330000, rsSaved: 2310000, paybackMonths: 3.9, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Decision Center & ROI Calculator
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              Advisory Governance
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Prioritised retrofit roadmap scored by financial payback, kWh savings, and carbon abatement
          </p>
        </div>

        <button
          onClick={() => setActiveTab('mv')}
          className="flex items-center gap-1.5 rounded bg-emerald-500 px-3.5 py-1.5 text-xs font-bold font-mono text-zinc-950 hover:bg-emerald-400 transition-all uppercase tracking-wider cursor-pointer shadow-sm active:scale-95"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>M&V Verification</span>
        </button>
      </div>

      {/* Advisory Notice */}
      <div className="rounded-md bg-zinc-900/80 p-3 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5 font-mono">
        <Info className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
        <div>
          <strong className="text-zinc-100">Advisory Governance Architecture (Report Section 4.4):</strong>
          <p className="mt-0.5 text-zinc-400 text-[11px] leading-relaxed">
            All recommendations are advisory. Approving an action records management authorization and initiates baseline tracking in the Measurement & Verification (M&V) engine. The system does not take automatic control of physical plant machinery.
          </p>
        </div>
      </div>

      {/* Prioritised Recommendation Cards */}
      <div className="space-y-3">
        {actions.map((act) => (
          <div
            key={act.id}
            className={`rounded-xl border p-4 text-xs transition-all ${
              act.status === 'APPROVED'
                ? 'border-emerald-500/50 bg-emerald-950/20 shadow-sm'
                : act.status === 'REJECTED'
                ? 'border-zinc-800 bg-zinc-950/40 opacity-60'
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
            }`}
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-100">{act.title}</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                    {act.category}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">• {act.asset}</span>
                </div>
                <p className="text-zinc-400 mt-1 text-[11px] leading-relaxed">
                  {act.reason}
                </p>
              </div>

              {/* Approval Buttons */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {act.status === 'APPROVED' ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-300 border border-emerald-500/40">
                    <Check className="h-3.5 w-3.5" />
                    <span>APPROVED</span>
                  </span>
                ) : act.status === 'REJECTED' ? (
                  <span className="rounded-full bg-zinc-800 px-3 py-1 font-mono text-xs text-zinc-400">
                    REJECTED
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(act.id, 'APPROVED')}
                      className="flex items-center gap-1 rounded bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleAction(act.id, 'REJECTED')}
                      className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Impact Metric Chips */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6 font-mono text-[11px]">
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Annual Saving</span>
                <div className="font-bold text-emerald-400">₹{act.expected_rs.toLocaleString()}</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Energy Saved</span>
                <div className="font-bold text-zinc-200">{act.expected_kwh.toLocaleString()} kWh</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Avoided CO2</span>
                <div className="font-bold text-cyan-400">{act.expected_co2_tonnes} tCO2</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Capital Outlay</span>
                <div className="font-bold text-zinc-200">₹{act.capex_rs.toLocaleString()}</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Simple Payback</span>
                <div className="font-bold text-amber-400">{act.payback_months} Months</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 uppercase">Production Impact</span>
                <div className="font-bold text-emerald-400 text-[10px] truncate">{act.production_impact}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Illustrative Foundry ROI Calculator (Concept Report Section 8.2 & 8.3) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">
                Illustrative Foundry ROI Scenarios (Report Section 8.2 & 8.3)
              </h3>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                ILLUSTRATIVE SCENARIO — NOT MEASURED PLANT DATA
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Benchmark assumptions: 2,000 tonnes good castings/yr • 1,100 kWh/t • ₹7/kWh • ₹1.54 Cr power bill • ₹7.5 Lakh total assumed outlay (₹2.5L monitoring + ₹5.0L corrective measures)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Scenario Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2.5">Scenario</th>
                  <th className="py-2.5">SEC Cut</th>
                  <th className="py-2.5">kWh Saved/yr</th>
                  <th className="py-2.5">₹ Saved/yr</th>
                  <th className="py-2.5">Simple Payback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr className="text-zinc-300">
                  <td className="py-2.5 font-bold text-zinc-100">Low Case</td>
                  <td className="py-2.5 text-lime-400">5%</td>
                  <td className="py-2.5">110,000 kWh</td>
                  <td className="py-2.5 font-bold text-emerald-400">₹7.7 Lakh</td>
                  <td className="py-2.5 text-amber-400">~12 months</td>
                </tr>
                <tr className="bg-emerald-950/20 text-zinc-200">
                  <td className="py-2.5 font-bold text-emerald-300">Central Case</td>
                  <td className="py-2.5 text-emerald-400 font-bold">10%</td>
                  <td className="py-2.5">220,000 kWh</td>
                  <td className="py-2.5 font-bold text-emerald-300">₹15.4 Lakh</td>
                  <td className="py-2.5 text-emerald-400 font-bold">~6 months</td>
                </tr>
                <tr className="text-zinc-300">
                  <td className="py-2.5 font-bold text-zinc-100">High Case</td>
                  <td className="py-2.5 text-cyan-400">15%</td>
                  <td className="py-2.5">330,000 kWh</td>
                  <td className="py-2.5 font-bold text-cyan-300">₹23.1 Lakh</td>
                  <td className="py-2.5 text-cyan-400 font-bold">~4 months</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bar chart matching Figure 3 in Concept Report */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiScenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="scenario" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} unit=" ₹L" tickFormatter={(v) => `₹${v / 100000}L`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${(val / 100000).toFixed(1)} Lakh / year`, 'Annual Savings']}
                />
                <Bar dataKey="rsSaved" name="Annual Saving" radius={[4, 4, 0, 0]}>
                  {roiScenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
