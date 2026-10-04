import {
  PlantConfig,
  PlantAsset,
  TelemetryReading,
  DashboardKpi,
  WasteEvent,
  CompressorLeakageDiagnosis,
  AssetHealthReport,
  BaselineRegressionResult,
  BaselinePredictionPoint,
  TwinScenarioResult,
  MvVerificationReport,
  CarbonPassportRecord,
  SimulatorFaultState,
  AppLanguage,
} from '../types';

export const api = {
  async getPlant(): Promise<{ plant: PlantConfig; status: string; mode: string; disclaimer: string }> {
    const res = await fetch('/api/plant');
    if (!res.ok) throw new Error('Failed to fetch plant info');
    return res.json();
  },

  async getAssets(): Promise<{ assets: PlantAsset[] }> {
    const res = await fetch('/api/assets');
    if (!res.ok) throw new Error('Failed to fetch asset registry');
    return res.json();
  },

  async getReadings(): Promise<{
    readings: TelemetryReading[];
    simulator_state: {
      is_running: boolean;
      speed: 1 | 5 | 10;
      virtual_time: string;
      active_faults: SimulatorFaultState;
    };
    timestamp: string;
  }> {
    const res = await fetch('/api/readings');
    if (!res.ok) throw new Error('Failed to fetch readings');
    return res.json();
  },

  async getDashboard(): Promise<{
    kpi: DashboardKpi;
    active_waste_events: WasteEvent[];
    opportunities: {
      id: string;
      title: string;
      annual_potential_rs: number;
      annual_potential_kwh: number;
      confidence: string;
      payback_months: number;
    }[];
    recent_readings: TelemetryReading[];
  }> {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getSec(): Promise<{
    current_sec: number;
    average_sec: number;
    best_sec: number;
    worst_sec: number;
    benchmark_sec: number;
    theoretical_minimum_sec: number;
    target_sec: number;
    gap_to_benchmark_percent: number;
    sec_trend: {
      date: string;
      shift: string;
      sec: number;
      benchmark: number;
      theoretical_minimum: number;
      good_tonnes: number;
      energy_kwh: number;
    }[];
  }> {
    const res = await fetch('/api/sec');
    if (!res.ok) throw new Error('Failed to fetch SEC metrics');
    return res.json();
  },

  async getBaseline(): Promise<{
    model: BaselineRegressionResult;
    predictions: BaselinePredictionPoint[];
    ashrae_standards: {
      cv_rmse_threshold: string;
      nmbe_threshold: string;
      actual_cv_rmse: number;
      actual_nmbe: number;
      compliant: boolean;
    };
  }> {
    const res = await fetch('/api/baseline');
    if (!res.ok) throw new Error('Failed to fetch baseline regression');
    return res.json();
  },

  async getWaste(): Promise<{
    active_events: WasteEvent[];
    compressor_single_meter_diagnostic: CompressorLeakageDiagnosis;
  }> {
    const res = await fetch('/api/waste');
    if (!res.ok) throw new Error('Failed to fetch waste analysis');
    return res.json();
  },

  async getEquipmentHealth(): Promise<{
    overall_plant_health: number;
    asset_reports: AssetHealthReport[];
  }> {
    const res = await fetch('/api/equipment-health');
    if (!res.ok) throw new Error('Failed to fetch equipment health');
    return res.json();
  },

  async getTwinScenarios(): Promise<{
    baseline: TwinScenarioResult;
    scenarios: TwinScenarioResult[];
    constraints: {
      throughput_minimum_tonnes: number;
      quality_yield_minimum_percent: number;
      melt_cycle_integrity_enforced: boolean;
      refractory_temperature_limit_C: number;
      advisory_notice: string;
    };
  }> {
    const res = await fetch('/api/twin/scenarios');
    if (!res.ok) throw new Error('Failed to fetch twin scenarios');
    return res.json();
  },

  async explainTwinScenario(params: {
    scenario_id: string;
    language?: 'en' | 'ta' | 'hi';
  }): Promise<{ scenario_id: string; name: string; explanation: string }> {
    const res = await fetch('/api/twin/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate scenario explanation');
    return res.json();
  },

  async verifySavings(params?: {
    action_id?: string;
    action_name?: string;
    savings_percent?: number;
    inject_noise?: boolean;
  }): Promise<MvVerificationReport> {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Failed to verify savings');
    return res.json();
  },

  async getCarbonPassport(): Promise<CarbonPassportRecord> {
    const res = await fetch('/api/carbon');
    if (!res.ok) throw new Error('Failed to fetch carbon passport');
    return res.json();
  },

  async setSimulatorSpeed(speed: 1 | 5 | 10): Promise<void> {
    await fetch('/api/simulator/speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
  },

  async resetSimulator(): Promise<void> {
    await fetch('/api/simulator/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async injectFault(fault: string, active: boolean, severity = 0.6): Promise<void> {
    await fetch('/api/fault/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fault, active, severity }),
    });
  },

  async askAi(payload: {
    query?: string;
    context_type?: string;
    language?: AppLanguage;
    user_query?: string;
    structured_data?: any;
  }): Promise<{ explanation: string }> {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate AI explanation');
    return res.json();
  },

  async getMqttMessages(): Promise<{ messages: any[] }> {
    const res = await fetch('/api/mqtt/messages');
    if (!res.ok) throw new Error('Failed to fetch MQTT messages');
    return res.json();
  },
};
