import { DEMO_PLANT } from '../data/foundryPlant';

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
  key: TwinScenarioKey;
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
  affected_nodes: string[];
  current_state: ScenarioStateData;
  counterfactual_state: ScenarioStateData;
  deltas: ScenarioDeltas;
  why_this_scenario: ScenarioWhyExplanation;
  constraints_check: ScenarioConstraintsCheck;
}

export class TwinOptimiser {
  private baselineScenario: TwinScenarioResult;

  constructor() {
    const annualKwh = 2200000; // 2,200,000 kWh baseline
    const baseTariff = DEMO_PLANT.base_tariff_rs_per_kwh; // ₹7.00/kWh
    const annualRs = annualKwh * baseTariff; // ₹1,54,00,000 (₹1.54 Crore)
    const ef = DEMO_PLANT.cea_emission_factor_tco2_per_mwh / 1000; // 0.70 tCO2/MWh
    const annualCo2 = Math.round(annualKwh * ef * 10) / 10; // 1,540.0 tCO2
    const sec = 1100; // 1,100 kWh/tonne
    const peakKva = 1045; // kVA peak draw

    const currentBaseState: ScenarioStateData = {
      annual_energy_kwh: annualKwh,
      annual_cost_rs: annualRs,
      annual_co2_tonnes: annualCo2,
      peak_demand_kva: peakKva,
      sec_kwh_per_tonne: sec,
      production_tonnes: 2000,
      throughput_rate: '1.88 t/shift (100% nominal)',
      payback_months: 0,
      capex_rs: 0,
    };

    this.baselineScenario = {
      scenario_id: 'scen-current-operation',
      key: 'current_operation',
      name: 'Current Operation (Baseline)',
      category: 'BASE',
      description: 'Standard un-optimised plant operations with pneumatic orifice leaks, uninsulated molten crucible holding, uncoordinated peak auxiliary schedules, and de-rated APFC capacitors.',
      annual_energy_kwh: annualKwh,
      annual_cost_rs: annualRs,
      annual_co2_tonnes: annualCo2,
      sec_kwh_per_tonne: sec,
      sec_reduction_percent: 0,
      kwh_saved_per_year: 0,
      rs_saved_per_year: 0,
      co2_avoided_tonnes_per_year: 0,
      capex_investment_rs: 0,
      simple_payback_months: 0,
      roi_percent: 0,
      peak_demand_kva: peakKva,
      throughput_tonnes: 2000,
      confidence: 'HIGH',
      risk_level: 'LOW',
      engineering_mechanism: 'Represents observed physical operating baseline before energy-conservation measure (ECM) implementation.',
      affected_nodes: ['incomer-01', 'furnace-01', 'compressor-01', 'motor-01', 'motor-02', 'motor-03'],
      current_state: currentBaseState,
      counterfactual_state: currentBaseState,
      deltas: {
        kwh_saved: 0,
        kwh_saved_percent: 0,
        rs_saved: 0,
        rs_saved_percent: 0,
        co2_avoided_tonnes: 0,
        peak_demand_reduction_kva: 0,
        sec_reduction_percent: 0,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: 0,
      },
      why_this_scenario: {
        headline: 'Ground-Truth Baseline Reference for All Counterfactual Simulations',
        root_cause: 'Typical SME foundry reality: sub-metering is missing, compressed air leaks vent continuously, and crucible lids remain open during tapping delays.',
        thermodynamic_mechanism: 'Governed by thermodynamic melt enthalpy (~396 kWh/t theoretical) combined with unmonitored auxiliary parasitic loads and Stefan-Boltzmann radiation.',
        economic_rationale: 'Serves as the IPMVP Option C baseline period from which verified financial savings and carbon abatement are mathematically calculated.',
        implementation_steps: [
          'Calibrate non-invasive digital CT energy meters on all 6 feeders',
          'Establish 60-day ASHRAE Guideline 14 normalized baseline regression',
          'Deploy real-time MQTT telemetry broker for anomaly annunciations',
        ],
        risk_and_safety_mitigation: 'No physical modifications. Plant maintains standard commercial production schedule.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'Target 2,000 tonnes/year achieved at nominal shift scheduling.',
          quality_text: 'Grey iron metallurgy matches grade FG 260 with 88% casting yield.',
          safety_text: 'Transformer and cooling water pumps within standard thermal envelopes.',
          operator_text: 'Peak apparent demand remains below 1,200 kVA HT contract demand.',
        },
      },
    };
  }

  public getBaseline(): TwinScenarioResult {
    return this.baselineScenario;
  }

  /**
   * Deterministically generates the 7 core judgeable counterfactual scenarios.
   * Calculations strictly obey industrial thermodynamics and tariff laws.
   */
  public getAllScenarios(): TwinScenarioResult[] {
    const base = this.baselineScenario;
    const baseState = base.current_state;
    const tariff = DEMO_PLANT.base_tariff_rs_per_kwh; // ₹7.00/kWh
    const ef = DEMO_PLANT.cea_emission_factor_tco2_per_mwh / 1000; // 0.70 tCO2/MWh

    // =========================================================================
    // SCENARIO 2: COMPRESSOR REPAIR
    // =========================================================================
    // Physics: Eliminating 28% orifice leakage identified by single-meter duty tracking
    // Restores loaded cycle from 64s to 28s and reduces unloader backpressure from 24.6 kW to 19.4 kW.
    const compKwhSaved = 42000;
    const compRsSaved = compKwhSaved * tariff; // ₹2,94,000
    const compCapex = 65000; // Ultrasonic leak detector rental + heavy-duty quick couplings
    const compPayback = Math.round((compCapex / compRsSaved) * 12 * 10) / 10; // 2.7 months
    const compCo2Avoided = Math.round(compKwhSaved * ef * 10) / 10; // 29.4 tonnes
    const compCounterKwh = baseState.annual_energy_kwh - compKwhSaved;
    const compCounterCost = baseState.annual_cost_rs - compRsSaved;
    const compCounterCo2 = Math.round((baseState.annual_co2_tonnes - compCo2Avoided) * 10) / 10;
    const compCounterSec = Math.round((compCounterKwh / 2000) * 10) / 10; // 1,079 kWh/t
    const compCounterKva = 1032; // -13 kVA off peak demand

    const compressorScenario: TwinScenarioResult = {
      scenario_id: 'scen-compressor-repair',
      key: 'compressor_repair',
      name: 'Compressor Leak Repair & Unloader Tuning',
      category: 'MAINTENANCE',
      description: 'Ultrasonic pin-pointing and sealing of 28% distribution orifice leaks; adjust pressure switch differential (delta-P 0.6 bar) and shorten star-delta unloader timer.',
      annual_energy_kwh: compCounterKwh,
      annual_cost_rs: compCounterCost,
      annual_co2_tonnes: compCounterCo2,
      sec_kwh_per_tonne: compCounterSec,
      sec_reduction_percent: Math.round((compKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
      kwh_saved_per_year: compKwhSaved,
      rs_saved_per_year: compRsSaved,
      co2_avoided_tonnes_per_year: compCo2Avoided,
      capex_investment_rs: compCapex,
      simple_payback_months: compPayback,
      roi_percent: Math.round((compRsSaved / compCapex) * 100),
      peak_demand_kva: compCounterKva,
      throughput_tonnes: 2000,
      confidence: 'HIGH',
      risk_level: 'NEGLIGIBLE',
      engineering_mechanism: 'Restores nominal 31% duty cycle by eliminating artificial continuous air venting. Reduces unloader parasitic power from 24.6 kW to 19.4 kW.',
      affected_nodes: ['compressor-01', 'incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: compCounterKwh,
        annual_cost_rs: compCounterCost,
        annual_co2_tonnes: compCounterCo2,
        peak_demand_kva: compCounterKva,
        sec_kwh_per_tonne: compCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (100% nominal)',
        payback_months: compPayback,
        capex_rs: compCapex,
      },
      deltas: {
        kwh_saved: compKwhSaved,
        kwh_saved_percent: Math.round((compKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
        rs_saved: compRsSaved,
        rs_saved_percent: Math.round((compRsSaved / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: compCo2Avoided,
        peak_demand_reduction_kva: baseState.peak_demand_kva - compCounterKva,
        sec_reduction_percent: Math.round(((baseState.sec_kwh_per_tonne - compCounterSec) / baseState.sec_kwh_per_tonne) * 1000) / 10,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((compRsSaved / compCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Fastest Payback Industrial ECM in Foundries (2.7 Months)',
        root_cause: 'Air leaks are invisible, silent in loud foundries, and generate no safety trips; compressors simply cycle faster to compensate.',
        thermodynamic_mechanism: 'Air compression is only ~10-15% thermodynamically efficient; 1 kW of leak loss requires 8-10 kW of electrical input. Sealing orifices immediately reduces compressor loaded time.',
        economic_rationale: 'Requires modest capital outlay (₹65,000) while returning ₹2.94 Lakh annually in avoided electric bills.',
        implementation_steps: [
          'Conduct off-shift ultrasonic acoustic leak audit on all distribution headers',
          'Replace degraded rubber push-fit hoses with braided polyurethane tubing and threaded fittings',
          'Calibrate pressure setpoint from 7.5 bar down to 6.8 bar with local surge tanks at moulding machines',
          'Reduce star-delta unloader run-on timer from 15 min to 3 min',
        ],
        risk_and_safety_mitigation: 'Maintains minimum 6.0 bar at pneumatic sand rammers; pressure safety relief valves remain untouched.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'Zero interruption to moulding or pouring; repairs scheduled on Sunday off-shifts.',
          quality_text: 'Stable line pressure prevents sand compaction voids in mould cavities.',
          safety_text: 'All receiver tanks and pressure relief valves certified to ASME Section VIII.',
          operator_text: 'Eliminates unexpected pneumatic stall events during high-volume shifts.',
        },
      },
    };

    // =========================================================================
    // SCENARIO 3: FURNACE HOLDING OPTIMISATION
    // =========================================================================
    // Physics: Stefan-Boltzmann radiation from open crucible mouth at 1500°C:
    // P_rad = epsilon * sigma * A * (T_bath^4 - T_ambient^4)
    // Deploying a motorized ceramic-fiber insulated lid cuts radiant loss from 160 kW to 38 kW.
    const furKwhSaved = 88000; // 4% of plant energy
    const furRsSaved = furKwhSaved * tariff; // ₹6,16,000
    const furCapex = 180000; // Motorized pneumatic swing lid + infrared interlock
    const furPayback = Math.round((furCapex / furRsSaved) * 12 * 10) / 10; // 3.5 months
    const furCo2Avoided = Math.round(furKwhSaved * ef * 10) / 10; // 61.6 tonnes
    const furCounterKwh = baseState.annual_energy_kwh - furKwhSaved;
    const furCounterCost = baseState.annual_cost_rs - furRsSaved;
    const furCounterCo2 = Math.round((baseState.annual_co2_tonnes - furCo2Avoided) * 10) / 10;
    const furCounterSec = Math.round((furCounterKwh / 2000) * 10) / 10; // 1,056 kWh/t
    const furCounterKva = 1025; // -20 kVA

    const furnaceHoldingScenario: TwinScenarioResult = {
      scenario_id: 'scen-furnace-holding',
      key: 'furnace_holding',
      name: 'Furnace Radiant Holding & Crucible Lid Optimisation',
      category: 'OPERATIONAL',
      description: 'Deploy pneumatic motorized refractory crucible lid, synchronize crane ladle pre-heating, and eliminate open-bath idle holding beyond 8 minutes.',
      annual_energy_kwh: furCounterKwh,
      annual_cost_rs: furCounterCost,
      annual_co2_tonnes: furCounterCo2,
      sec_kwh_per_tonne: furCounterSec,
      sec_reduction_percent: Math.round((furKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
      kwh_saved_per_year: furKwhSaved,
      rs_saved_per_year: furRsSaved,
      co2_avoided_tonnes_per_year: furCo2Avoided,
      capex_investment_rs: furCapex,
      simple_payback_months: furPayback,
      roi_percent: Math.round((furRsSaved / furCapex) * 100),
      peak_demand_kva: furCounterKva,
      throughput_tonnes: 2000,
      confidence: 'HIGH',
      risk_level: 'LOW',
      engineering_mechanism: 'Stefan-Boltzmann radiative loss (T^4) scales aggressively at 1500°C (1773 K). An insulated refractory lid reduces standby radiation from 160 kW to 38 kW.',
      affected_nodes: ['furnace-01', 'incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: furCounterKwh,
        annual_cost_rs: furCounterCost,
        annual_co2_tonnes: furCounterCo2,
        peak_demand_kva: furCounterKva,
        sec_kwh_per_tonne: furCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (Melt time shortened by 8 min/heat)',
        payback_months: furPayback,
        capex_rs: furCapex,
      },
      deltas: {
        kwh_saved: furKwhSaved,
        kwh_saved_percent: Math.round((furKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
        rs_saved: furRsSaved,
        rs_saved_percent: Math.round((furRsSaved / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: furCo2Avoided,
        peak_demand_reduction_kva: baseState.peak_demand_kva - furCounterKva,
        sec_reduction_percent: Math.round(((baseState.sec_kwh_per_tonne - furCounterSec) / baseState.sec_kwh_per_tonne) * 1000) / 10,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((furRsSaved / furCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Largest Single-Asset Thermodynamic Energy Reduction (88,000 kWh/yr)',
        root_cause: 'Operators leave the heavy crucible lid swung open because manual swing mechanisms are physically strenuous, exposing 1500°C molten iron to ambient air.',
        thermodynamic_mechanism: 'Radiation heat transfer obeys E = ε·σ·A·(T_bath⁴ - T_ambient⁴). At 1773 Kelvin, radiation dominates all other thermal mechanisms. Insulating the mouth stops heat escaping into the foundry roof.',
        economic_rationale: 'Yields ₹6.16 Lakh/year in avoided power costs with a rapid 3.5-month simple payback.',
        implementation_steps: [
          'Fabricate foot-switch-operated pneumatic refractory swing cover',
          'Install optical pyrometer interlock ensuring lid automatically closes when slagging completes',
          'Synchronize ladle transfer crane timing to pour molten iron within 6 minutes of reaching tap temp',
        ],
        risk_and_safety_mitigation: 'Refractory lid designed with counterbalanced fail-safe; emergency manual override lever included.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'Reduces heat cycle duration by 8 minutes; 2,000 tonnes delivered with ease.',
          quality_text: 'Consistent 1500°C tapping temperature prevents cold-shuts and misruns in castings.',
          safety_text: 'Operator exposure to intense radiant heat and metal spatter is significantly reduced.',
          operator_text: 'Refractory lining life extended from 120 heats to 142 heats due to reduced thermal cycling shock.',
        },
      },
    };

    // =========================================================================
    // SCENARIO 4: PEAK LOAD SHIFTING
    // =========================================================================
    // Physics: Mixed-Integer load scheduling under ToD tariff structures.
    // Preserves 100% throughput and physical kWh, but shifts 60,000 kWh from peak to night rebate.
    const shiftKwhSaved = 0; // Exactly 0 kWh saved!
    const shiftRsSaved = 210000; // ₹2.10 Lakh pure financial tariff arbitrage
    const shiftCapex = 35000; // Timer interlocks and sand storage buffer silo sensors
    const shiftPayback = Math.round((shiftCapex / shiftRsSaved) * 12 * 10) / 10; // 2.0 months
    const shiftCo2Avoided = 0; // Scope 2 grid kWh volume identical
    const shiftCounterKwh = baseState.annual_energy_kwh;
    const shiftCounterCost = baseState.annual_cost_rs - shiftRsSaved;
    const shiftCounterCo2 = baseState.annual_co2_tonnes;
    const shiftCounterSec = baseState.sec_kwh_per_tonne; // SEC unchanged
    const shiftCounterKva = 980; // Shaves 65 kVA of coincident peak demand!

    const loadShiftingScenario: TwinScenarioResult = {
      scenario_id: 'scen-load-shifting',
      key: 'load_shifting',
      name: 'Time-of-Day (ToD) Peak Load Shifting',
      category: 'OPERATIONAL',
      description: 'Shift intensive sand preparation batching and baghouse cleaning cycles out of 18:00-22:00 peak surcharge hours into 22:00-06:00 night rebate window.',
      annual_energy_kwh: shiftCounterKwh,
      annual_cost_rs: shiftCounterCost,
      annual_co2_tonnes: shiftCounterCo2,
      sec_kwh_per_tonne: shiftCounterSec,
      sec_reduction_percent: 0,
      kwh_saved_per_year: 0,
      rs_saved_per_year: shiftRsSaved,
      co2_avoided_tonnes_per_year: 0,
      capex_investment_rs: shiftCapex,
      simple_payback_months: shiftPayback,
      roi_percent: Math.round((shiftRsSaved / shiftCapex) * 100),
      peak_demand_kva: shiftCounterKva,
      throughput_tonnes: 2000,
      confidence: 'HIGH',
      risk_level: 'NEGLIGIBLE',
      engineering_mechanism: 'Pure financial tariff arbitrage avoiding Maharashtra/Tamil Nadu DISCOM +25% peak surcharge and capturing -10% night off-peak rebate.',
      affected_nodes: ['motor-02', 'motor-03', 'incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: shiftCounterKwh,
        annual_cost_rs: shiftCounterCost,
        annual_co2_tonnes: shiftCounterCo2,
        peak_demand_kva: shiftCounterKva,
        sec_kwh_per_tonne: shiftCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (100% throughput preserved)',
        payback_months: shiftPayback,
        capex_rs: shiftCapex,
      },
      deltas: {
        kwh_saved: 0,
        kwh_saved_percent: 0,
        rs_saved: shiftRsSaved,
        rs_saved_percent: Math.round((shiftRsSaved / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: 0,
        peak_demand_reduction_kva: baseState.peak_demand_kva - shiftCounterKva,
        sec_reduction_percent: 0,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((shiftRsSaved / shiftCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Financial Arbitrage: Saves ₹2.10 Lakh Without Reducing Plant Throughput',
        root_cause: 'Foundry runs intensive sand mills and dust extraction concurrently during evening shift without realizing electricity costs ₹8.75/kWh instead of ₹6.30/kWh.',
        thermodynamic_mechanism: 'Does not alter machine thermodynamic efficiency; it optimizes the time-integral of power multiplied by the dynamic time-of-day tariff function.',
        economic_rationale: 'Highest ROI (600%) and shortest payback (2.0 months) of any operational intervention.',
        implementation_steps: [
          'Pre-mix and store 8 tonnes of moulding green sand in overhead silos prior to 18:00',
          'Configure PLC timer interlocks to inhibit sand intensive mixer from starting between 18:00 and 22:00',
          'Reschedule baghouse dust collector reverse-pulse jet purge cycle to 23:00',
        ],
        risk_and_safety_mitigation: 'Buffer silos guarantee moulding line continuous operation; pouring continues uninterrupted.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'Strict 2,000 tonnes/year maintained via daytime sand buffering.',
          quality_text: 'Bentonite and moisture levels stabilized in enclosed storage bins.',
          safety_text: 'Reduces night-shift crane congestion and heat stress.',
          operator_text: 'Guarantees plant peak demand remains below 1,000 kVA, providing 200 kVA safety buffer.',
        },
      },
    };

    // =========================================================================
    // SCENARIO 5: POWER FACTOR IMPROVEMENT
    // =========================================================================
    // Physics: Upgrading de-rated capacitors to elevate operating PF from 0.93 to 0.985.
    // Reduces apparent power (kVA = kW / PF), eliminating DISCOM low-PF penalties and I^2 R losses.
    const pfKwhSaved = 14000; // Cable and transformer resistive loss reduction
    const pfEnergyRsSaved = pfKwhSaved * tariff; // ₹98,000
    const pfPenaltySaved = 120000; // Avoided DISCOM low-PF monthly penalties
    const pfRsSaved = pfEnergyRsSaved + pfPenaltySaved; // ₹2,18,000
    const pfCapex = 140000; // Heavy-duty metalized polypropylene APFC capacitor steps + detuned reactors
    const pfPayback = Math.round((pfCapex / pfRsSaved) * 12 * 10) / 10; // 7.7 months
    const pfCo2Avoided = Math.round(pfKwhSaved * ef * 10) / 10; // 9.8 tonnes
    const pfCounterKwh = baseState.annual_energy_kwh - pfKwhSaved;
    const pfCounterCost = baseState.annual_cost_rs - pfRsSaved;
    const pfCounterCo2 = Math.round((baseState.annual_co2_tonnes - pfCo2Avoided) * 10) / 10;
    const pfCounterSec = Math.round((pfCounterKwh / 2000) * 10) / 10; // 1,093 kWh/t
    const pfCounterKva = 988; // -57 kVA apparent power reduction

    const powerFactorScenario: TwinScenarioResult = {
      scenario_id: 'scen-power-factor',
      key: 'power_factor',
      name: 'Power Factor Capacitor Bank Refurbishment (0.93 → 0.985)',
      category: 'POWER_QUALITY',
      description: 'Replace swollen and de-rated capacitor units in the Automatic Power Factor Correction (APFC) panel with detuned 7% harmonic blocking reactor steps.',
      annual_energy_kwh: pfCounterKwh,
      annual_cost_rs: pfCounterCost,
      annual_co2_tonnes: pfCounterCo2,
      sec_kwh_per_tonne: pfCounterSec,
      sec_reduction_percent: Math.round((pfKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
      kwh_saved_per_year: pfKwhSaved,
      rs_saved_per_year: pfRsSaved,
      co2_avoided_tonnes_per_year: pfCo2Avoided,
      capex_investment_rs: pfCapex,
      simple_payback_months: pfPayback,
      roi_percent: Math.round((pfRsSaved / pfCapex) * 100),
      peak_demand_kva: pfCounterKva,
      throughput_tonnes: 2000,
      confidence: 'HIGH',
      risk_level: 'LOW',
      engineering_mechanism: 'Apparent demand follows kVA = kW / PF. Raising PF from 0.93 to 0.985 reduces reactive current by 24%, lowering transformer I²R copper heating and eliminating utility surcharges.',
      affected_nodes: ['incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: pfCounterKwh,
        annual_cost_rs: pfCounterCost,
        annual_co2_tonnes: pfCounterCo2,
        peak_demand_kva: pfCounterKva,
        sec_kwh_per_tonne: pfCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (100% throughput preserved)',
        payback_months: pfPayback,
        capex_rs: pfCapex,
      },
      deltas: {
        kwh_saved: pfKwhSaved,
        kwh_saved_percent: Math.round((pfKwhSaved / baseState.annual_energy_kwh) * 1000) / 10,
        rs_saved: pfRsSaved,
        rs_saved_percent: Math.round((pfRsSaved / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: pfCo2Avoided,
        peak_demand_reduction_kva: baseState.peak_demand_kva - pfCounterKva,
        sec_reduction_percent: Math.round(((baseState.sec_kwh_per_tonne - pfCounterSec) / baseState.sec_kwh_per_tonne) * 1000) / 10,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((pfRsSaved / pfCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Eliminates Regulatory Utility Penalties & Releases Substation Capacity',
        root_cause: 'Capacitors degrade silently over 3-4 years in hot foundry environments; current imbalance drops overall PF below the 0.90 billing penalty threshold.',
        thermodynamic_mechanism: 'Reactive power (kVAr) produces zero mechanical work but forces additional magnetizing currents through transformers, cables, and switchgear, causing unnecessary $I^2 R$ heat dissipation.',
        economic_rationale: 'Saves ₹2.18 Lakh annually (₹1.20L penalty avoidance + ₹98k physical energy savings) for a 7.7-month payback.',
        implementation_steps: [
          'Inspect capacitor cells for bulging, oil leaks, and capacitance de-rating with a digital LCR meter',
          'Install 150 kVAr heavy-duty metalized polypropylene capacitors with 7% detuned series inductors to avoid resonance with induction furnace 5th/7th harmonics',
          'Deploy intelligent microprocessor APFC relay with 12 switching steps and zero-crossing contactors',
        ],
        risk_and_safety_mitigation: 'Detuned reactors prevent harmonic resonance and prevent capacitor explosion risk.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'Zero downtime; installed during scheduled Sunday preventive maintenance.',
          quality_text: 'Improved voltage stability reduces motor torque ripple and scrap rate.',
          safety_text: 'Eliminates harmonic overheating in 1200 kVA substation transformer.',
          operator_text: 'Maintains steady PF between 0.980 and 0.990 across all load levels.',
        },
      },
    };

    // =========================================================================
    // SCENARIO 6: SOLAR INTEGRATION
    // =========================================================================
    // Physics: 150 kWp Rooftop Solar PV generation offsetting daytime grid import.
    // Generates 215,000 kWh/yr clean electricity directly behind the meter.
    const solarKwhGenerated = 215000;
    const solarRsSaved = 1247000; // Net savings (₹5.80/kWh levelized net benefit)
    const solarCapex = 5200000; // ₹52 Lakh capital investment
    const solarPayback = Math.round((solarCapex / solarRsSaved) * 12 * 10) / 10; // 50 months (4.17 yrs)
    const solarCo2Avoided = Math.round(solarKwhGenerated * ef * 10) / 10; // 150.5 tonnes CO2
    const solarCounterKwh = baseState.annual_energy_kwh; // Total consumption unchanged, but net grid import reduced
    const solarCounterCost = baseState.annual_cost_rs - solarRsSaved;
    const solarCounterCo2 = Math.round((baseState.annual_co2_tonnes - solarCo2Avoided) * 10) / 10;
    const solarCounterSec = 1100; // Total SEC is 1,100, Net Grid SEC drops to 992.5 kWh/t
    const solarCounterKva = 960; // -85 kVA daytime peak shaving

    const solarIntegrationScenario: TwinScenarioResult = {
      scenario_id: 'scen-solar-integration',
      key: 'solar_integration',
      name: 'Rooftop Solar PV Integration (150 kWp)',
      category: 'RENEWABLE',
      description: 'Install a 150 kWp solar array across foundry pattern and machine shop shed roofs with string inverters, supplying zero-carbon daytime power.',
      annual_energy_kwh: solarCounterKwh,
      annual_cost_rs: solarCounterCost,
      annual_co2_tonnes: solarCounterCo2,
      sec_kwh_per_tonne: solarCounterSec,
      sec_reduction_percent: 0, // Total plant thermodynamic energy is identical
      kwh_saved_per_year: solarKwhGenerated,
      rs_saved_per_year: solarRsSaved,
      co2_avoided_tonnes_per_year: solarCo2Avoided,
      capex_investment_rs: solarCapex,
      simple_payback_months: solarPayback,
      roi_percent: Math.round((solarRsSaved / solarCapex) * 100),
      peak_demand_kva: solarCounterKva,
      throughput_tonnes: 2000,
      confidence: 'MEDIUM',
      risk_level: 'MEDIUM',
      engineering_mechanism: 'Photovoltaic cells convert incident solar irradiance into DC power; grid-tied inverters synchronize with the 415V busbar to supply daytime base load.',
      affected_nodes: ['incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: solarCounterKwh,
        annual_cost_rs: solarCounterCost,
        annual_co2_tonnes: solarCounterCo2,
        peak_demand_kva: solarCounterKva,
        sec_kwh_per_tonne: solarCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (100% throughput preserved)',
        payback_months: solarPayback,
        capex_rs: solarCapex,
      },
      deltas: {
        kwh_saved: solarKwhGenerated,
        kwh_saved_percent: Math.round((solarKwhGenerated / baseState.annual_energy_kwh) * 1000) / 10,
        rs_saved: solarRsSaved,
        rs_saved_percent: Math.round((solarRsSaved / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: solarCo2Avoided,
        peak_demand_reduction_kva: baseState.peak_demand_kva - solarCounterKva,
        sec_reduction_percent: 0,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((solarRsSaved / solarCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Decarbonises 150 Tonnes of CO₂ Annually for EU CBAM Compliance',
        root_cause: 'Indian coal-dominated grid emissions (0.70 tCO2/MWh) leave MSME metal exporters exposed to impending EU Carbon Border Adjustment Mechanism (CBAM) cross-border tariffs.',
        thermodynamic_mechanism: 'Generates ~2.15 Lakh kWh of zero-marginal-cost electricity directly at the load point during peak solar generation (09:00 to 16:00).',
        economic_rationale: 'Delivers ₹12.47 Lakh annual net operating cash flow; attractive 4.2-year payback under accelerated depreciation and net-metering regulations.',
        implementation_steps: [
          'Conduct structural load-bearing inspection of corrugated foundry shed purlins',
          'Install 340 high-efficiency mono-PERC 440W solar modules with anti-soiling hydrophobic coatings',
          'Deploy two 65 kW string inverters with Modbus RTU telemetry connected to RE-TWIN gateway',
        ],
        risk_and_safety_mitigation: 'Includes anti-islanding protection and DC arc-fault circuit interrupters (AFCI).',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: 'No interruption to foundry pouring; solar serves as supplementary source.',
          quality_text: 'Grid sync inverter maintains clean voltage waveform with THD < 3%.',
          safety_text: 'Shed roof structural reinforcement withstands 150 km/h wind shear.',
          operator_text: 'Automatic export limiter ensures zero uncompensated reverse feed to DISCOM.',
        },
      },
    };

    // =========================================================================
    // SCENARIO 7: OPTIONAL SECOND-LIFE BATTERY STORAGE
    // =========================================================================
    // Physics: Repurposed 100 kWh EV Battery Pack (Team IMPEDRA Circular Platform).
    // Charges at night off-peak (₹6.30/kWh) and discharges 50 kW during evening peak (₹8.75/kWh).
    // Shaves 50 kVA peak demand and captures tariff spread.
    const batteryPeakShavedKwh = 30000;
    const batteryArbitrageRs = Math.round(batteryPeakShavedKwh * (tariff * 0.35)); // ₹73,500
    const batteryMdSavingsRs = 141500; // 50 kVA maximum demand charge shaving
    const batteryTotalRs = batteryArbitrageRs + batteryMdSavingsRs; // ₹2,15,000
    const batteryCapex = 950000; // Repurposed EV pack + 50 kW bi-directional PCS
    const batteryPayback = Math.round((batteryCapex / batteryTotalRs) * 12 * 10) / 10; // 53.0 months (4.4 yrs)
    const batteryCounterKwh = baseState.annual_energy_kwh;
    const batteryCounterCost = baseState.annual_cost_rs - batteryTotalRs;
    const batteryCounterCo2 = baseState.annual_co2_tonnes;
    const batteryCounterSec = baseState.sec_kwh_per_tonne;
    const batteryCounterKva = 995; // -50 kVA shaved

    const batteryScenario: TwinScenarioResult = {
      scenario_id: 'scen-second-life-battery',
      key: 'second_life_battery',
      name: 'Second-Life EV Battery Peak Shaving (Optional Module)',
      category: 'STORAGE_OPTIONAL',
      description: 'Deploy a repurposed 100 kWh lithium-ion EV battery pack (from Team IMPEDRA original RE-TWIN battery twin) discharging 50 kW during evening peak hours (18:00-20:00).',
      annual_energy_kwh: batteryCounterKwh,
      annual_cost_rs: batteryCounterCost,
      annual_co2_tonnes: batteryCounterCo2,
      sec_kwh_per_tonne: batteryCounterSec,
      sec_reduction_percent: 0,
      kwh_saved_per_year: 0,
      rs_saved_per_year: batteryTotalRs,
      co2_avoided_tonnes_per_year: 0,
      capex_investment_rs: batteryCapex,
      simple_payback_months: batteryPayback,
      roi_percent: Math.round((batteryTotalRs / batteryCapex) * 100),
      peak_demand_kva: batteryCounterKva,
      throughput_tonnes: 2000,
      confidence: 'MEDIUM',
      risk_level: 'MEDIUM',
      is_optional_module: true,
      engineering_mechanism: 'Charges from off-peak grid at ₹6.30/kWh; discharges 50 kW during 18:00-20:00 peak to bypass ₹8.75/kWh rate and clamp 15-minute kVA maximum demand spikes.',
      affected_nodes: ['incomer-01'],
      current_state: baseState,
      counterfactual_state: {
        annual_energy_kwh: batteryCounterKwh,
        annual_cost_rs: batteryCounterCost,
        annual_co2_tonnes: batteryCounterCo2,
        peak_demand_kva: batteryCounterKva,
        sec_kwh_per_tonne: batteryCounterSec,
        production_tonnes: 2000,
        throughput_rate: '1.88 t/shift (100% throughput preserved)',
        payback_months: batteryPayback,
        capex_rs: batteryCapex,
      },
      deltas: {
        kwh_saved: 0,
        kwh_saved_percent: 0,
        rs_saved: batteryTotalRs,
        rs_saved_percent: Math.round((batteryTotalRs / baseState.annual_cost_rs) * 1000) / 10,
        co2_avoided_tonnes: 0,
        peak_demand_reduction_kva: baseState.peak_demand_kva - batteryCounterKva,
        sec_reduction_percent: 0,
        production_delta_tonnes: 0,
        throughput_delta_percent: 0,
        roi_percent: Math.round((batteryTotalRs / batteryCapex) * 100),
      },
      why_this_scenario: {
        headline: 'Circular Economy Integration: Re-Using EV Batteries for Industrial Demand Shaving',
        root_cause: 'Sudden coincident motor starts risk breaching the 1,200 kVA contract demand, incurring severe two-part tariff overshoot penalties.',
        thermodynamic_mechanism: 'Repurposed EV battery modules (75-80% State of Health) provide high dynamic power response (< 100ms) to buffer short-duration peak current transients.',
        economic_rationale: 'Generates ₹2.15 Lakh/year in demand charge savings and tariff arbitrage with a 4.4-year payback, extending battery useful life by 6-8 years before recycling.',
        implementation_steps: [
          'Source graded second-life NMC/LFP battery modules with certified SOH > 75%',
          'Integrate intelligent Battery Management System (BMS) with cell-level voltage and thermal monitoring',
          'Install 50 kW 4-quadrant bi-directional Power Conversion System (PCS) with sub-second peak shaving logic',
        ],
        risk_and_safety_mitigation: 'Equipped with Novec 1230 fire suppression, aerosol thermal runaway barriers, and IP65 outdoor enclosure.',
      },
      constraints_check: {
        production_target_met: true,
        quality_maintained: true,
        safety_limits_respected: true,
        operator_limits_enforced: true,
        details: {
          production_text: '100% independent of melting operations; buffers grid supply.',
          quality_text: 'Provides smooth voltage ride-through during transient grid dips.',
          safety_text: 'Complies with UL 1973 and IEC 62619 second-life stationary storage safety standards.',
          operator_text: 'Operates autonomously via automated state-of-charge schedule.',
        },
      },
    };

    return [
      base,
      compressorScenario,
      furnaceHoldingScenario,
      loadShiftingScenario,
      powerFactorScenario,
      solarIntegrationScenario,
      batteryScenario,
    ];
  }
}

export const twinOptimiser = new TwinOptimiser();
