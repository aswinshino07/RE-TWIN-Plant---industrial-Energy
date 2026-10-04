import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Factory,
  Radio,
  PlayCircle,
  Sparkles,
  ShieldAlert,
  Globe,
  UserCheck,
  RotateCcw,
  Zap,
  Clock,
  Layers,
} from 'lucide-react';
import { AppLanguage, UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    plant,
    role,
    setRole,
    language,
    setLanguage,
    startHackathonDemo,
    resetPlantSimulation,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    simSpeed,
    changeSpeed,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-md">
      {/* Brand & Plant Metadata */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Zap className="h-5 w-5 fill-emerald-500/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-white uppercase">
              RE-TWIN <span className="text-emerald-400">Plant</span>
            </span>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider text-amber-400 border border-amber-500/30 uppercase">
              Simulation Mode
            </span>
            <span className="hidden xl:inline-flex rounded bg-zinc-800/80 px-2 py-0.5 text-[9px] font-mono text-zinc-400 border border-zinc-700/50">
              Team IMPEDRA • Yuva Yodha 2026
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <Factory className="h-3 w-3 text-zinc-500" />
            <span className="truncate text-zinc-300 font-medium">
              {plant?.name || 'Kolhapur Casting Works – Foundry Demo'}
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-zinc-400">HT-1 Industrial (1,200 kVA)</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Shift / ToD, MQTT, Simulator Speed, Demo Launcher, Role & AI */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* ToD Tariff Slot Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] font-mono text-zinc-300">
          <Clock className="h-3 w-3 text-amber-400" />
          <span>Shift 2 • Peak Tariff (+25%)</span>
        </div>

        {/* Live Telemetry MQTT Pill */}
        <div className="hidden md:flex items-center gap-2 rounded-md bg-zinc-900 border border-zinc-800 px-2 py-1 text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">MQTT: live/telemetry</span>
        </div>

        {/* Simulation Speed Adjuster */}
        <div className="hidden sm:flex items-center rounded-md bg-zinc-900 border border-zinc-800 p-0.5 text-xs font-mono">
          <span className="px-1.5 text-[9px] font-bold uppercase text-zinc-500">Sim:</span>
          {([1, 5, 10] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => changeSpeed(spd)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                simSpeed === spd
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {spd}x
            </button>
          ))}
          <button
            onClick={resetPlantSimulation}
            title="Reset Simulation to Baseline State"
            className="ml-1 rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* HACKATHON DEMO TOUR BUTTON */}
        <button
          onClick={startHackathonDemo}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-zinc-950 shadow-sm transition-all hover:bg-emerald-400 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          <span className="font-bold text-[11px] uppercase tracking-wider">Demo Tour</span>
        </button>

        {/* Language Picker */}
        <div className="flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-1 py-0.5">
          <Globe className="h-3 w-3 ml-1 text-zinc-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
            className="bg-transparent px-1.5 text-[11px] font-mono text-zinc-200 outline-none cursor-pointer"
          >
            <option value="en" className="bg-zinc-900 text-zinc-200">EN</option>
            <option value="ta" className="bg-zinc-900 text-zinc-200">தமிழ் (TA)</option>
            <option value="hi" className="bg-zinc-900 text-zinc-200">हिन्दी (HI)</option>
          </select>
        </div>

        {/* User Role Selector */}
        <div className="hidden xl:flex items-center rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">
          <UserCheck className="h-3 w-3 mr-1 text-zinc-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="bg-transparent text-[11px] font-mono text-zinc-300 outline-none cursor-pointer"
          >
            <option value="plant_manager" className="bg-zinc-900 text-zinc-200">Plant Manager</option>
            <option value="energy_manager" className="bg-zinc-900 text-zinc-200">Energy Manager</option>
            <option value="operator" className="bg-zinc-900 text-zinc-200">Operator</option>
          </select>
        </div>

        {/* AI Intelligence Toggle */}
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-all ${
            isAiDrawerOpen
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
          }`}
        >
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span className="hidden sm:inline text-[11px] font-mono">RE-TWIN AI</span>
        </button>
      </div>
    </header>
  );
};
