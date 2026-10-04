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

export const DEMO_PLANT: PlantConfig = {
  site_id: 'plant-kolhapur-01',
  name: 'Kolhapur Casting Works – Foundry Demo',
  cluster: 'Kolhapur MSME Foundry Cluster, Maharashtra / Belgaum Border',
  state: 'Maharashtra / Tamil Nadu HT Tariff Benchmark',
  tariff_class: 'HT-1 Industrial (Time of Day: Morning & Evening Peak)',
  contract_demand_kVA: 1200,
  annual_production_tonnes: 2000,
  benchmark_sec_kwh_per_tonne: 1100, // Mid-range of published 1,000–1,200 kWh/t
  base_tariff_rs_per_kwh: 7.00, // Illustrative baseline bill placeholder
  peak_surcharge_percent: 25, // 25% surcharge in morning 06:00-10:00 & evening 18:00-22:00
  offpeak_rebate_percent: 10, // 10% rebate in night slot 22:00-06:00
  cea_emission_factor_tco2_per_mwh: 0.70, // Illustrative placeholder, CEA Baseline Database
  emission_factor_source: 'Central Electricity Authority (CEA) CO2 Baseline Database (Illustrative)',
  emission_factor_version: 'v20.0 (Benchmark Draft)',
  furnace_theoretical_melting_kwh_per_tonne: 396, // Theoretical thermodynamic minimum to heat iron to 1500°C
  furnace_efficiency_benchmark: 0.71, // Typical 65-75% efficiency
  currency: 'INR',
  monitoring_points: 6,
  assumed_monitoring_outlay_rs: 250000, // ₹2.5 lakh monitoring node & gateway
  assumed_corrective_outlay_rs: 500000, // ₹5.0 lakh corrective measures (leak repairs, PF bank, VSD, lid management)
};

export const DEMO_ASSETS: PlantAsset[] = [
  {
    asset_id: 'incomer-01',
    site_id: 'plant-kolhapur-01',
    name: 'Main Incomer 11kV/415V',
    type: 'incomer',
    rated_kW: 1000,
    rated_voltage_V: 415,
    rated_current_A: 1670,
    meter_id: 'meter-inc-01',
    criticality: 'critical',
    subsystem: 'Substation & Main Distribution',
    description: 'Class 0.5S digital energy meter with CT clamps on main 1200 kVA transformer secondary side',
  },
  {
    asset_id: 'furnace-01',
    site_id: 'plant-kolhapur-01',
    name: 'Induction Melting Furnace',
    type: 'furnace',
    rated_kW: 650,
    rated_voltage_V: 415,
    rated_current_A: 1050,
    meter_id: 'meter-fur-01',
    criticality: 'critical',
    subsystem: 'Melt Shop (Coreless 1.5t crucible)',
    description: 'Medium-frequency coreless induction furnace for grey and ductile iron castings, 1500°C tapping',
  },
  {
    asset_id: 'compressor-01',
    site_id: 'plant-kolhapur-01',
    name: 'Air Compressor (Rotary Screw)',
    type: 'compressor',
    rated_kW: 75,
    rated_voltage_V: 415,
    rated_current_A: 130,
    meter_id: 'meter-comp-01',
    criticality: 'high',
    subsystem: 'Compressed Air Utility (7.5 bar, 120 CFM)',
    description: 'Load/unload rotary screw compressor supplying pneumatic sand ramming, moulding lines & dust valves',
  },
  {
    asset_id: 'motor-01',
    site_id: 'plant-kolhapur-01',
    name: 'Furnace Cooling Pump (Motor 1)',
    type: 'motor',
    rated_kW: 37,
    rated_voltage_V: 415,
    rated_current_A: 64,
    meter_id: 'meter-mot-01',
    criticality: 'critical',
    subsystem: 'Melt Shop Coil Cooling Loop',
    description: 'Continuous deionised water cooling circulation pump for induction furnace coil & power supply thyristors',
  },
  {
    asset_id: 'motor-02',
    site_id: 'plant-kolhapur-01',
    name: 'Sand Intensive Mixer (Motor 2)',
    type: 'motor',
    rated_kW: 45,
    rated_voltage_V: 415,
    rated_current_A: 78,
    meter_id: 'meter-mot-02',
    criticality: 'medium',
    subsystem: 'Moulding & Sand Preparation Shop',
    description: 'Cyclic batch intensive green sand mixer with binder & moisture dosing for moulding sand preparation',
  },
  {
    asset_id: 'motor-03',
    site_id: 'plant-kolhapur-01',
    name: 'Baghouse Dust Exhaust Fan (Motor 3)',
    type: 'motor',
    rated_kW: 30,
    rated_voltage_V: 415,
    rated_current_A: 52,
    meter_id: 'meter-mot-03',
    criticality: 'medium',
    subsystem: 'Pollution Control & Ventilation',
    description: 'Centrifugal extraction fan exhausting foundry fume collection hood through baghouse filtration unit',
  },
];
