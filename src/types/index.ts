export type UserRole = 'plant_manager' | 'energy_manager' | 'operator';
export type AppLanguage = 'en' | 'ta' | 'hi';

export interface PlantConfig {
  site_id: string;
  name: string;
  cluster: string;
  state: string;
  tariff_class: string;
  contract_demand_kVA: number;
  annual_production_tonnes: number;
  benchmark_sec_kwh_per_tonne: number;
  base_tariff_rs_per_kwh: number;
  peak_surcharge_percent: number;
  offpeak_rebate_percent: number;
  cea_emission_factor_tco2_per_mwh: number;
  emission_factor_source: string;
  emission_factor_version: string;
  furnace_theoretical_melting_kwh_per_tonne: number;
  furnace_efficiency_benchmark: number;
  currency: string;
  monitoring_points: number;
  assumed_monitoring_outlay_rs: number;
  assumed_corrective_outlay_rs: number;
}

export interface PlantAsset {
  asset_id: string;
  site_id: string;
  name: string;
  type: 'incomer' | 'furnace' | 'compressor' | 'motor';
  rated_kW: number;
  rated_voltage_V: number;
  rated_current_A: number;
  meter_id: string;
  criticality: 'critical' | 'high' | 'medium';
  subsystem: string;
  description: string;
}

export interface TelemetryReading {
  reading_id: string;
  asset_id: string;
  site_id: string;
  timestamp: string;
  voltage_V: number;
  current_A: number;
  kw: number;
  kva: number;
  power_factor: number;
  frequency_Hz: number;
  kwh_cumulative: number;
  operating_state: 'OFF' | 'IDLE' | 'LOADED' | 'WARNING' | 'FAULT';
  temperature_C: number;
  vibration_mm_s?: number;
  current_imbalance_percent?: number;
  quality_flag: 'GOOD' | 'MISSING' | 'RESET' | 'CLOCK_DRIFT' | 'OUTLIER' | 'SIMULATED';
}

export interface DashboardKpi {
  current_power_kw: number;
  todays_energy_mwh: number;
  todays_production_tonnes?: number;
  sec_kwh_per_tonne: number;
  sec_benchmark: number;
  todays_waste_rs: number;
  todays_waste_kwh: number;
  potential_annual_savings_rs_lakh: number;
  co2_avoided_tonnes_year: number;
  plant_health_score: number;
  active_alerts_count: number;
  power_factor: number;
  contract_demand_kva: number;
  apparent_power_kva: number;
}

export interface WasteEvent {
  event_id: string;
  asset_id: string;
  asset_name: string;
  type:
    | 'COMPRESSOR_LEAKAGE'
    | 'IDLE_RUNNING'
    | 'LOW_POWER_FACTOR'
    | 'DEMAND_SPIKE'
    | 'FURNACE_HOLDING_LOSS'
    | 'MOTOR_CURRENT_IMBALANCE'
    | 'PRODUCTION_SEC_ANOMALY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  detected_at: string;
  duration_minutes: number;
  excess_power_kw: number;
  estimated_waste_kwh: number;
  estimated_waste_rs: number;
  confidence_percent: number;
  is_active: boolean;
  recommended_action: string;
  physics_basis: string;
}

export interface CompressorLeakageDiagnosis {
  asset_id: string;
  method: 'SINGLE_METER_POWER_INFERENCE';
  rated_power_kw: number;
  measured_loaded_power_kw: number;
  measured_unloaded_power_kw: number;
  unloaded_power_fraction_percent: number;
  load_time_seconds: number;
  unload_time_seconds: number;
  cycle_period_seconds: number;
  duty_cycle_percent: number;
  baseline_duty_cycle_percent: number;
  estimated_leakage_cfm: number;
  estimated_leakage_percent: number;
  leakage_status: 'NORMAL' | 'SLIGHT_LEAK' | 'MODERATE_LEAK' | 'SEVERE_LEAK';
  annual_waste_kwh: number;
  annual_waste_rs: number;
  annual_co2_tonnes: number;
  confidence_score: number;
  disclaimer: string;
}

export interface AssetHealthReport {
  asset_id: string;
  asset_name: string;
  asset_type: PlantAsset['type'];
  subsystem: string;
  health_index: number;
  status: 'EXCELLENT' | 'HEALTHY' | 'WATCH' | 'WARNING' | 'CRITICAL';
  current_imbalance_percent: number;
  rms_current_A: number;
  temperature_C: number;
  power_factor: number;
  duty_factor_percent: number;
  degradation_rate_per_month: number;
  trend_direction: 'STABLE' | 'DEGRADING' | 'IMPROVING';
  observed_symptoms: string[];
  recommended_maintenance: string;
  rul_disclaimer: string;
  historical_trend: { timestamp: string; score: number }[];
}

export interface BaselineRegressionResult {
  model_id: string;
  site_id: string;
  version: string;
  beta_0: number;
  beta_production: number;
  beta_temperature: number;
  r_squared: number;
  cv_rmse_percent: number;
  nmbe_percent: number;
  residual_std_error: number;
  ashrae_compliant: boolean;
  training_sample_count: number;
  cusum_drift_detected: boolean;
  valid_from: string;
  valid_to: string;
  summary_equation: string;
}

export interface BaselinePredictionPoint {
  date: string;
  shift: string;
  production_tonnes: number;
  temperature_C: number;
  actual_kwh: number;
  expected_baseline_kwh: number;
  residual_kwh: number;
  uncertainty_bound_95: number;
  upper_bound_kwh: number;
  lower_bound_kwh: number;
  cusum_kwh: number;
  is_waste_anomaly: boolean;
}

export type TwinScenarioKey =
  | 'current_operation'
  | 'compressor_repair'
  | 'furnace_holding'
  | 'load_shifting'
  | 'power_factor'
  | 'solar_integration'
  | 'second_life_battery';

export interface ScenarioStateData {
  annual_energy_kwh: number;
  annual_cost_rs: number;
  annual_co2_tonnes: number;
  peak_demand_kva: number;
  sec_kwh_per_tonne: number;
  production_tonnes: number;
  throughput_rate: string;
  payback_months: number;
  capex_rs: number;
}

export interface ScenarioDeltas {
  kwh_saved: number;
  kwh_saved_percent: number;
  rs_saved: number;
  rs_saved_percent: number;
  co2_avoided_tonnes: number;
  peak_demand_reduction_kva: number;
  sec_reduction_percent: number;
  production_delta_tonnes: number;
  throughput_delta_percent: number;
  roi_percent: number;
}

export interface ScenarioWhyExplanation {
  headline: string;
  root_cause: string;
  thermodynamic_mechanism: string;
  economic_rationale: string;
  implementation_steps: string[];
  risk_and_safety_mitigation: string;
}

export interface ScenarioConstraintsCheck {
  production_target_met: boolean;
  quality_maintained: boolean;
  safety_limits_respected: boolean;
  operator_limits_enforced: boolean;
  details: {
    production_text: string;
    quality_text: string;
    safety_text: string;
    operator_text: string;
  };
}

export interface TwinScenarioResult {
  scenario_id: string;
  key?: TwinScenarioKey;
  name: string;
  category: 'BASE' | 'OPERATIONAL' | 'MAINTENANCE' | 'RETROFIT' | 'RENEWABLE' | 'STORAGE_OPTIONAL' | 'POWER_QUALITY';
  description: string;
  annual_energy_kwh: number;
  annual_cost_rs: number;
  annual_co2_tonnes: number;
  sec_kwh_per_tonne: number;
  sec_reduction_percent: number;
  kwh_saved_per_year: number;
  rs_saved_per_year: number;
  co2_avoided_tonnes_per_year: number;
  capex_investment_rs: number;
  simple_payback_months: number;
  roi_percent: number;
  peak_demand_kva: number;
  throughput_tonnes: number;
  confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
  risk_level: 'LOW' | 'MEDIUM' | 'NEGLIGIBLE';
  is_optional_module?: boolean;
  engineering_mechanism: string;
  affected_nodes?: string[];
  current_state?: ScenarioStateData;
  counterfactual_state?: ScenarioStateData;
  deltas?: ScenarioDeltas;
  why_this_scenario?: ScenarioWhyExplanation;
  constraints_check?: ScenarioConstraintsCheck;
}

export interface MvTimelinePoint {
  shift_id: string;
  date: string;
  shift_name: string;
  period: 'BASELINE' | 'POST_INTERVENTION';
  production_tonnes: number;
  ambient_temp_C: number;
  actual_kwh: number;
  expected_baseline_kwh: number;
  upper_bound_kwh: number;
  lower_bound_kwh: number;
  delta_kwh: number;
  is_intervention_point?: boolean;
}

export interface MvWhyExplanation {
  title: string;
  headline: string;
  mathematical_proof: string;
  normalisation_factor_explanation: string;
  next_recommended_action: string;
}

export interface MvVerificationReport {
  verification_id: string;
  action_id: string;
  action_name: string;
  reporting_period_start: string;
  reporting_period_end: string;
  intervention_date: string;
  evaluation_shifts_count: number;
  total_production_tonnes: number;
  avg_ambient_temp_C: number;
  normalised_baseline_energy_kwh: number;
  actual_measured_energy_kwh: number;
  gross_savings_kwh: number;
  gross_savings_percent: number;
  uncertainty_kwh_95: number;
  uncertainty_percent: number;
  lower_bound_savings_kwh: number;
  upper_bound_savings_kwh: number;
  verified_savings_kwh: number;
  verified_savings_rs: number;
  avoided_co2_tonnes: number;
  savings_percent: number;
  verification_status: 'VERIFIED' | 'INCONCLUSIVE' | 'NO_SAVING' | 'NEGATIVE_SAVING';
  status_explanation: string;
  methodology: string;
  confidence_level_percent: number;
  why_explanation?: MvWhyExplanation;
  baseline_period_summary?: {
    shifts_count: number;
    start_date: string;
    end_date: string;
    total_energy_kwh: number;
    total_production_tonnes: number;
    avg_sec_kwh_per_tonne: number;
    avg_temp_C: number;
    formula_equation: string;
  };
  intervention_summary?: {
    action_name: string;
    date: string;
    capex_rs: number;
    physical_mechanism: string;
  };
  timeline_points?: MvTimelinePoint[];
  shift_comparisons: {
    shift_id: string;
    date: string;
    production_tonnes: number;
    normalised_baseline_kwh: number;
    actual_kwh: number;
    delta_savings_kwh: number;
  }[];
}

export interface CarbonPassportRecord {
  passport_id: string;
  plant_name: string;
  site_id: string;
  reporting_period: string;
  product_name: string;
  good_production_tonnes: number;
  electricity_consumed_kwh: number;
  fuel_diesel_consumed_litres: number;
  scope_2_emissions_kg_co2: number;
  scope_1_emissions_kg_co2: number;
  total_emissions_kg_co2: number;
  total_emissions_tonnes_co2: number;
  carbon_intensity_kg_co2_per_tonne: number;
  benchmark_intensity_kg_co2_per_tonne: number;
  intensity_delta_percent: number;
  avoided_emissions_tonnes_co2: number;
  grid_emission_factor_value: number;
  grid_emission_factor_unit: string;
  grid_emission_factor_source: string;
  grid_emission_factor_version: string;
  fuel_emission_factor_value: number;
  fuel_emission_factor_unit: string;
  fuel_emission_factor_source: string;
  data_quality_completeness_percent: number;
  cbam_applicability: string;
  legal_disclaimer: string;
  generated_at: string;
}

export interface SimulatorFaultState {
  compressorLeakage: { active: boolean; severity: number };
  compressorIdleRunning: { active: boolean; severity: number };
  furnaceInefficientHolding: { active: boolean; severity: number };
  motorDegradation: { active: boolean; severity: number };
  lowPowerFactor: { active: boolean; severity: number };
  demandSpike: { active: boolean; severity: number };
  sensorDropout: { active: boolean; severity: number };
  productionDrop: { active: boolean; severity: number };
}
