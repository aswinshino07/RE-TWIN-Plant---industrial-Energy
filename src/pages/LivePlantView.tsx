import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Cpu,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Thermometer,
  Gauge,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryReading, PlantAsset } from '../types';

export const LivePlantView: React.FC = () => {
  const { assets, readings, kpi, activeFaults, triggerFault, setActiveTab } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('compressor-01');
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);

  useEffect(() => {
    if (readings.length === 0) return;
    const now = new Date();
    const timeLabel = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const incomer = readings.find((r) => r.asset_id === 'incomer-01')?.kw || 740;
    const furnace = readings.find((r) => r.asset_id === 'furnace-01')?.kw || 580;
    const compressor = readings.find((r) => r.asset_id === 'compressor-01')?.kw || 68;
    const motor1 = readings.find((r) => r.asset_id === 'motor-01')?.kw || 32;
    const motor2 = readings.find((r) => r.asset_id === 'motor-02')?.kw || 38;
    const motor3 = readings.find((r) => r.asset_id === 'motor-03')?.kw || 26;

    setTelemetryHistory((prev) => {
      const next = [
        ...prev,
        {
          time: timeLabel,
          incomer,
          furnace,
          compressor,
          motor1,
          motor2,
          motor3,
        },
      ];
      return next.slice(-20);
    });
  }, [readings]);

  const selectedAsset = assets.find((a) => a.asset_id === selectedAssetId) || assets[0];
  const selectedReading = readings.find((r) => r.asset_id === selectedAssetId);

  const getStateBadge = (state?: TelemetryReading['operating_state']) => {
    switch (state) {
      case 'LOADED':
        return <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider">LOADED</span>;
      case 'IDLE':
        return <span className="rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider">IDLE</span>;
      case 'WARNING':
        return <span className="rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider">WARNING</span>;
      case 'FAULT':
        return <span className="rounded bg-red-600 text-white px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider">FAULT SUSPECTED</span>;
      default:
        return <span className="rounded bg-zinc-800 text-zinc-400 px-2 py-0.5 text-[9px] font-mono">OFF</span>;
    }
  };

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
              Plant Single-Line Diagram (SLD) & Telemetry
            </h1>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
              6 Sub-metered Nodes
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Non-invasive CT-clamp digital meters streaming V, A, kW, kVA, PF, and cumulative kWh over Modbus/MQTT
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
        >
          <span>Fault Injector</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Industrial Schematic Single-Line Diagram */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
              Substation Distribution Busbar (11kV / 415V, 1200 kVA Transformer)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Select node to inspect live CT waveforms
          </span>
        </div>

        {/* Tree Root: Main Incomer */}
        {(() => {
          const incReading = readings.find((r) => r.asset_id === 'incomer-01');
          const isSelected = selectedAssetId === 'incomer-01';
          return (
            <div className="flex justify-center mb-4">
              <div
                onClick={() => setSelectedAssetId('incomer-01')}
                className={`w-full max-w-lg rounded-lg border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/40'
                    : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="font-bold font-mono text-xs text-zinc-100 uppercase">
                      MAIN INCOMER (11kV / 415V TRANSFORMER)
                    </span>
                  </div>
                  {getStateBadge(incReading?.operating_state)}
                </div>
                <div className="mt-2.5 grid grid-cols-4 gap-2 text-center font-mono text-xs">
                  <div className="rounded bg-zinc-950 p-1.5 border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500">Active Load</div>
                    <div className="font-bold text-emerald-400 tabular-nums">{incReading?.kw || 742} kW</div>
                  </div>
                  <div className="rounded bg-zinc-950 p-1.5 border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500">Apparent</div>
                    <div className="font-bold text-zinc-200 tabular-nums">{incReading?.kva || 789} kVA</div>
                  </div>
                  <div className="rounded bg-zinc-950 p-1.5 border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500">Power Factor</div>
                    <div className={`font-bold tabular-nums ${incReading && incReading.power_factor < 0.90 ? 'text-rose-400' : 'text-zinc-200'}`}>
                      {incReading?.power_factor || 0.94}
                    </div>
                  </div>
                  <div className="rounded bg-zinc-950 p-1.5 border border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500">Voltage</div>
                    <div className="font-bold text-zinc-200 tabular-nums">{incReading?.voltage_V || 412} V</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Busbar Vertical Line */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="h-4 w-0.5 bg-emerald-500/50"></div>
        </div>

        {/* 5 Plant Asset Feeder Nodes */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {assets
            .filter((a) => a.type !== 'incomer')
            .map((asset) => {
              const r = readings.find((read) => read.asset_id === asset.asset_id);
              const isSelected = selectedAssetId === asset.asset_id;
              return (
                <div
                  key={asset.asset_id}
                  onClick={() => setSelectedAssetId(asset.asset_id)}
                  className={`rounded-lg border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/40'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-200 truncate">
                      {asset.name}
                    </span>
                    {getStateBadge(r?.operating_state)}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate mb-2 font-mono">
                    {asset.subsystem}
                  </div>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-zinc-800/60 pb-0.5">
                      <span className="text-zinc-500">Load:</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{r?.kw || 0} kW</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/60 pb-0.5">
                      <span className="text-zinc-500">Current:</span>
                      <span className="text-zinc-300 tabular-nums">{r?.current_A || 0} A</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800/60 pb-0.5">
                      <span className="text-zinc-500">PF:</span>
                      <span className={`tabular-nums ${r && r.power_factor < 0.90 ? 'text-rose-400 font-bold' : 'text-zinc-300'}`}>
                        {r?.power_factor || 0.92}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Temp:</span>
                      <span className={`tabular-nums ${r && r.temperature_C > 70 ? 'text-rose-400 font-bold' : 'text-zinc-300'}`}>
                        {r?.temperature_C || 45}°C
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Selected Asset Telemetry Drawer & Live Rolling Waveform */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Asset Details Inspector */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
            <div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase">CT Meter Point</div>
              <h3 className="text-xs font-bold font-mono text-zinc-100 uppercase">{selectedAsset?.name}</h3>
            </div>
            {getStateBadge(selectedReading?.operating_state)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="rounded bg-zinc-950 p-2.5 border border-zinc-800 text-[11px] leading-relaxed text-zinc-300">
              <span className="text-[9px] uppercase font-bold text-zinc-500 block mb-1">Specification</span>
              {selectedAsset?.description}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Rated Capacity</span>
                <div className="font-bold text-zinc-200 mt-0.5">{selectedAsset?.rated_kW} kW</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Meter ID</span>
                <div className="font-bold text-emerald-400 mt-0.5">{selectedAsset?.meter_id}</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Current RMS</span>
                <div className="font-bold text-zinc-200 mt-0.5">{selectedReading?.current_A} A</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Line Voltage</span>
                <div className="font-bold text-zinc-200 mt-0.5">{selectedReading?.voltage_V} V</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Cumulative</span>
                <div className="font-bold text-emerald-400 mt-0.5">{selectedReading?.kwh_cumulative.toLocaleString()} kWh</div>
              </div>
              <div className="rounded bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase">Data Quality</span>
                <div className="font-bold text-emerald-400 mt-0.5">{selectedReading?.quality_flag}</div>
              </div>
            </div>

            {selectedAsset?.type === 'compressor' && (
              <div className="rounded border border-amber-500/30 bg-amber-950/20 p-2.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                  <span>SINGLE-METER INFERENCE</span>
                  <span>{activeFaults.compressorLeakage.active ? 'LEAK DETECTED' : 'NOMINAL'}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-300 leading-tight">
                  Duty cycle derived from electrical load waveform without airflow transducers.
                </p>
                <button
                  onClick={() => setActiveTab('waste')}
                  className="mt-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 uppercase"
                >
                  <span>Open Leak Analysis</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Rolling Power Waveform */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4.5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                Real-Time Feeder Load Profile (kW vs Time)
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Streaming live at 2-second sampling intervals via simulated MQTT broker
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE TELEMETRY</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis dataKey="time" stroke="#71717a" fontSize={10} fontVariant="tabular-nums" />
                <YAxis stroke="#71717a" fontSize={10} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="furnace" name="Induction Furnace" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.65} />
                <Area type="monotone" dataKey="compressor" name="Air Compressor" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.65} />
                <Area type="monotone" dataKey="motor1" name="Cooling Pump (M1)" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.65} />
                <Area type="monotone" dataKey="motor2" name="Sand Mixer (M2)" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.65} />
                <Area type="monotone" dataKey="motor3" name="Baghouse Fan (M3)" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.65} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
