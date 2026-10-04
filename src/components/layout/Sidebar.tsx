import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Gauge,
  LineChart,
  AlertTriangle,
  HeartPulse,
  Workflow,
  CalendarClock,
  CheckCircle2,
  FileText,
  Sliders,
  Network,
  Settings,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  category: 'OVERVIEW' | 'OPERATIONS' | 'INTELLIGENCE' | 'DIGITAL TWIN' | 'VERIFICATION' | 'SYSTEM';
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeWaste } = useApp();

  const navItems: NavItem[] = [
    // OVERVIEW
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, category: 'OVERVIEW' },
    { id: 'live_plant', label: 'Plant Schematic & SLD', icon: Cpu, category: 'OVERVIEW' },

    // OPERATIONS
    {
      id: 'simulator',
      label: 'Simulator & Faults',
      icon: Sliders,
      category: 'OPERATIONS',
      badge: 'Interactive',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },

    // INTELLIGENCE
    { id: 'sec', label: 'SEC Engine (kWh/t)', icon: Gauge, category: 'INTELLIGENCE' },
    {
      id: 'baseline',
      label: 'Normalised Baseline',
      icon: LineChart,
      category: 'INTELLIGENCE',
      badge: 'ASHRAE-14',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
    {
      id: 'waste',
      label: 'Waste & Single-Meter',
      icon: AlertTriangle,
      category: 'INTELLIGENCE',
      badge: activeWaste.length > 0 ? `${activeWaste.length} Alarm` : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold',
    },
    { id: 'health', label: 'Equipment Health', icon: HeartPulse, category: 'INTELLIGENCE' },

    // DIGITAL TWIN
    {
      id: 'twin',
      label: 'Digital Twin What-If',
      icon: Workflow,
      category: 'DIGITAL TWIN',
      badge: '8 Scenarios',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    },
    { id: 'scheduler', label: 'ToD Load Shifter', icon: CalendarClock, category: 'DIGITAL TWIN' },
    { id: 'decision', label: 'Decision Center & ROI', icon: CheckCircle2, category: 'DIGITAL TWIN' },

    // VERIFICATION & CARBON
    {
      id: 'mv',
      label: 'Verified Savings (M&V)',
      icon: ShieldCheck,
      category: 'VERIFICATION',
      badge: 'IPMVP Opt C',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold',
    },
    {
      id: 'carbon',
      label: 'Carbon Passport',
      icon: Flame,
      category: 'VERIFICATION',
      badge: 'EU CBAM',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    { id: 'reports', label: 'Audit Reports & PDF', icon: FileText, category: 'VERIFICATION' },

    // SYSTEM
    { id: 'architecture', label: 'Architecture & Flow', icon: Network, category: 'SYSTEM' },
    { id: 'settings', label: 'Data Quality & Settings', icon: Settings, category: 'SYSTEM' },
  ];

  const categories: NavItem['category'][] = [
    'OVERVIEW',
    'OPERATIONS',
    'INTELLIGENCE',
    'DIGITAL TWIN',
    'VERIFICATION',
    'SYSTEM',
  ];

  return (
    <aside className="flex w-60 flex-col border-r border-zinc-800 bg-zinc-950 p-2.5 shrink-0 select-none">
      {/* 6-Stage M&V Micro-Workflow Tracker */}
      <div className="mb-2.5 rounded-md border border-zinc-800 bg-zinc-900/60 p-2 font-mono">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
          <span>Workflow Stage</span>
          <span className="text-emerald-400">IPMVP Validated</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-400 font-medium">
          <span className="text-zinc-300">Measure</span>
          <span className="text-zinc-600">→</span>
          <span className="text-zinc-300">Baseline</span>
          <span className="text-zinc-600">→</span>
          <span className="text-zinc-300">Diagnose</span>
          <span className="text-zinc-600">→</span>
          <span className="text-zinc-300">Optimise</span>
          <span className="text-zinc-600">→</span>
          <span className="text-emerald-400 font-bold">Verify</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-xs custom-scrollbar">
        {categories.map((cat) => {
          const items = navItems.filter((i) => i.category === cat);
          return (
            <div key={cat} className="space-y-0.5">
              <div className="px-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                {cat}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group relative flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-900 text-emerald-400 border border-zinc-800 shadow-xs'
                        : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-emerald-400" />
                    )}

                    <div className="flex items-center gap-2 truncate pl-1">
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'
                        }`}
                      />
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono leading-none border ${
                          item.badgeColor || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Technical Footer */}
      <div className="mt-auto pt-2.5 border-t border-zinc-900 text-[10px] text-zinc-400 font-mono leading-tight">
        <div className="flex items-center justify-between text-zinc-400">
          <span>Engine v1.4</span>
          <span className="text-emerald-400">Class 0.5S Meters</span>
        </div>
        <p className="mt-1 text-zinc-500">
          Simulated Foundry Prototype • Stated Assumptions (Section 8)
        </p>
      </div>
    </aside>
  );
};
