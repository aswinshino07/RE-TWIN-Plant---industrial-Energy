import { DEMO_PLANT } from '../data/foundryPlant';

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

export class CarbonPassportEngine {
  public generatePassport(
    productionTonnes = 168.4, // Monthly typical
    electricityKwh = 185200,
    dieselLitres = 1450,
    kwhSaved = 18500
  ): CarbonPassportRecord {
    const gridEf = DEMO_PLANT.cea_emission_factor_tco2_per_mwh; // 0.70 kg CO2 / kWh
    const fuelEf = 2.68; // kg CO2 / litre diesel

    const scope2Kg = Math.round(electricityKwh * gridEf);
    const scope1Kg = Math.round(dieselLitres * fuelEf);
    const totalKg = scope2Kg + scope1Kg;
    const totalTonnes = Math.round((totalKg / 1000) * 10) / 10;

    const carbonIntensity = Math.round((totalKg / productionTonnes) * 10) / 10; // kg CO2 / tonne
    const benchmarkIntensity = 840.0; // Typical Indian MSME induction foundry benchmark
    const deltaPercent = Math.round(((carbonIntensity - benchmarkIntensity) / benchmarkIntensity) * 1000) / 10;
    const avoidedTonnes = Math.round(((kwhSaved * gridEf) / 1000) * 10) / 10;

    return {
      passport_id: `CBAM-PASS-IND-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      plant_name: DEMO_PLANT.name,
      site_id: DEMO_PLANT.site_id,
      reporting_period: 'September 2026 (Monthly Standard Period)',
      product_name: 'Ductile & Grey Iron Castings (HS Code: 7325.99)',
      good_production_tonnes: productionTonnes,
      electricity_consumed_kwh: electricityKwh,
      fuel_diesel_consumed_litres: dieselLitres,
      scope_2_emissions_kg_co2: scope2Kg,
      scope_1_emissions_kg_co2: scope1Kg,
      total_emissions_kg_co2: totalKg,
      total_emissions_tonnes_co2: totalTonnes,
      carbon_intensity_kg_co2_per_tonne: carbonIntensity,
      benchmark_intensity_kg_co2_per_tonne: benchmarkIntensity,
      intensity_delta_percent: deltaPercent,
      avoided_emissions_tonnes_co2: avoidedTonnes,
      grid_emission_factor_value: gridEf,
      grid_emission_factor_unit: 'kg CO2e / kWh (0.70 tCO2/MWh)',
      grid_emission_factor_source: DEMO_PLANT.emission_factor_source,
      grid_emission_factor_version: DEMO_PLANT.emission_factor_version,
      fuel_emission_factor_value: fuelEf,
      fuel_emission_factor_unit: 'kg CO2e / litre diesel',
      fuel_emission_factor_source: 'IPCC 2006 Guidelines for National GHG Inventories (Stationary Combustion)',
      data_quality_completeness_percent: 99.4,
      cbam_applicability:
        'Complies with EU CBAM Definitive Period (effective Jan 1, 2026) embedded emissions reporting format for iron & steel cast articles.',
      legal_disclaimer:
        'DISCLAIMER: RE-TWIN Plant does not certify emissions. All figures are calculated from sub-metered telemetry and versioned emission factors. Third-party verification requirements under CBAM or buyer ESG frameworks still apply.',
      generated_at: new Date().toISOString(),
    };
  }
}

export const carbonPassportEngine = new CarbonPassportEngine();
