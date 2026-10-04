import { TelemetryReading, SimulatorState } from '../simulator/plantSimulator';
import { DEMO_PLANT } from '../data/foundryPlant';

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
  unloaded_power_fraction_percent: number; // Punload / Prated
  load_time_seconds: number;
  unload_time_seconds: number;
  cycle_period_seconds: number;
  duty_cycle_percent: number; // Tload / (Tload + Tunload)
  baseline_duty_cycle_percent: number; // e.g. 31%
  estimated_leakage_cfm: number;
  estimated_leakage_percent: number; // 0 to 100%
  leakage_status: 'NORMAL' | 'SLIGHT_LEAK' | 'MODERATE_LEAK' | 'SEVERE_LEAK';
  annual_waste_kwh: number;
  annual_waste_rs: number;
  annual_co2_tonnes: number;
  confidence_score: number;
  disclaimer: string;
}

export class WasteDetector {
  /**
   * Evaluates latest telemetry readings and simulator faults to generate
   * active waste events ranked by ₹ loss.
   */
  public detectActiveWaste(
    readings: TelemetryReading[],
    faultState: SimulatorState['activeFaults']
  ): WasteEvent[] {
    const events: WasteEvent[] = [];
    const tariff = DEMO_PLANT.base_tariff_rs_per_kwh;
    const now = new Date().toISOString();

    const readingMap = new Map(readings.map((r) => [r.asset_id, r]));
    const incomer = readingMap.get('incomer-01');
    const comp = readingMap.get('compressor-01');
    const furnace = readingMap.get('furnace-01');
    const mot1 = readingMap.get('motor-01');

    // 1. Single-meter compressor leakage detection
    if (faultState.compressorLeakage.active && comp) {
      const sev = faultState.compressorLeakage.severity || 0.6;
      const excessKw = Math.round((14.0 + sev * 18.0) * 10) / 10;
      const durationHours = 4.5;
      const wasteKwh = Math.round(excessKw * durationHours);
      const wasteRs = Math.round(wasteKwh * tariff);

      events.push({
        event_id: 'ev-comp-leak-01',
        asset_id: 'compressor-01',
        asset_name: 'Air Compressor (Rotary Screw 75 kW)',
        type: 'COMPRESSOR_LEAKAGE',
        severity: sev > 0.6 ? 'HIGH' : 'MEDIUM',
        title: 'Suspected Compressed Air Leakage (Single-Meter Inference)',
        description: `Duty cycle elevated to ${Math.round(31 + sev * 38)}% with unload power creeping to ${comp.kw.toFixed(1)} kW. Power profile reveals recurring artificial demand.`,
        detected_at: now,
        duration_minutes: Math.round(durationHours * 60),
        excess_power_kw: excessKw,
        estimated_waste_kwh: wasteKwh,
        estimated_waste_rs: wasteRs,
        confidence_percent: Math.round(85 + sev * 9),
        is_active: true,
        recommended_action:
          'Conduct ultrasonic leak inspection on pneumatic moulding lines, air hoses, and sand rammer quick-couplers. Repair identified orifice leaks.',
        physics_basis:
          'Single-meter duty-cycle tracking: Leak fraction = T_load / (T_load + T_unload) during baseline stable production.',
      });
    }

    // 2. Compressor Idle Running
    if (faultState.compressorIdleRunning.active && comp) {
      const sev = faultState.compressorIdleRunning.severity || 0.5;
      const excessKw = 21.0;
      const durationHours = 2.2;
      const wasteKwh = Math.round(excessKw * durationHours);
      const wasteRs = Math.round(wasteKwh * tariff);

      events.push({
        event_id: 'ev-comp-idle-01',
        asset_id: 'compressor-01',
        asset_name: 'Air Compressor (Rotary Screw 75 kW)',
        type: 'IDLE_RUNNING',
        severity: 'MEDIUM',
        title: 'Prolonged Unloaded Idle Running',
        description: 'Compressor is operating unloaded for > 20 consecutive minutes during zero line demand without entering auto-shutdown mode.',
        detected_at: now,
        duration_minutes: Math.round(durationHours * 60),
        excess_power_kw: excessKw,
        estimated_waste_kwh: wasteKwh,
        estimated_waste_rs: wasteRs,
        confidence_percent: 94,
        is_active: true,
        recommended_action:
          'Enable controller automatic run-down timer (reduce star-delta run-on timer from 15 min to 3 min) or integrate auto-start/stop with shift schedule.',
        physics_basis:
          'Unloaded rotary screws consume 25-35% of full-load power while producing zero compressed air.',
      });
    }

    // 3. Furnace Inefficient Holding Loss
    if (faultState.furnaceInefficientHolding.active && furnace) {
      const sev = faultState.furnaceInefficientHolding.severity || 0.7;
      const excessKw = Math.round(90 + sev * 60);
      const durationHours = 1.8;
      const wasteKwh = Math.round(excessKw * durationHours);
      const wasteRs = Math.round(wasteKwh * tariff);

      events.push({
        event_id: 'ev-fur-hold-01',
        asset_id: 'furnace-01',
        asset_name: 'Induction Melting Furnace (Coreless 1.5t)',
        type: 'FURNACE_HOLDING_LOSS',
        severity: 'CRITICAL',
        title: 'Excessive Holding Energy & Missing Crucible Lid Cover',
        description: `Holding stage draw is ${furnace.kw.toFixed(0)} kW (normal covered holding is 120-140 kW). Radiant blackbody heat loss observed due to open furnace lid and delayed ladle transit.`,
        detected_at: now,
        duration_minutes: Math.round(durationHours * 60),
        excess_power_kw: excessKw,
        estimated_waste_kwh: wasteKwh,
        estimated_waste_rs: wasteRs,
        confidence_percent: 92,
        is_active: true,
        recommended_action:
          'Deploy pneumatic refractory crucible cover immediately during holding. Synchronize ladle pre-heating to avoid holding molten iron beyond 10 minutes at 1500°C.',
        physics_basis:
          'Stefan-Boltzmann radiative loss (T_bath^4 - T_ambient^4) increases losses fourfold when 1500°C bath surface is uncovered.',
      });
    }

    // 4. Low Power Factor Penalty
    if (faultState.lowPowerFactor.active && incomer) {
      const pf = incomer.power_factor;
      const penaltyCostPerMonth = 38500; // illustrative typical DISCOM penalty

      events.push({
        event_id: 'ev-pf-penalty-01',
        asset_id: 'incomer-01',
        asset_name: 'Main Incomer 11kV/415V',
        type: 'LOW_POWER_FACTOR',
        severity: pf < 0.85 ? 'HIGH' : 'MEDIUM',
        title: `Low Power Factor Detected (PF ${pf.toFixed(3)})`,
        description: `Power factor is below the regulatory billing threshold of 0.900 (actual: ${pf.toFixed(3)}). Reactive kVA draw increases distribution losses and invites DISCOM low-PF surcharge.`,
        detected_at: now,
        duration_minutes: 360,
        excess_power_kw: 32.0, // equivalent resistive heating loss in cables & transformer
        estimated_waste_kwh: 192,
        estimated_waste_rs: Math.round((penaltyCostPerMonth / 30)),
        confidence_percent: 99,
        is_active: true,
        recommended_action:
          'Inspect APFC (Automatic Power Factor Correction) capacitor bank steps. Replace de-rated or swollen capacitor units to restore PF >= 0.98.',
        physics_basis:
          'Discom tariff rules penalize PF < 0.90 by 0.5% per 0.01 drop, plus kVA maximum demand surcharge.',
      });
    }

    // 5. Motor Degradation / Current Imbalance
    if (faultState.motorDegradation.active && mot1) {
      const sev = faultState.motorDegradation.severity || 0.8;
      const excessKw = Math.round((3.5 + sev * 3.5) * 10) / 10;
      const durationHours = 8;
      const wasteKwh = Math.round(excessKw * durationHours);
      const wasteRs = Math.round(wasteKwh * tariff);

      events.push({
        event_id: 'ev-mot-degrade-01',
        asset_id: 'motor-01',
        asset_name: 'Furnace Cooling Pump (Motor 1)',
        type: 'MOTOR_CURRENT_IMBALANCE',
        severity: sev > 0.6 ? 'HIGH' : 'MEDIUM',
        title: `Motor Current Imbalance & Thermal Stress (${mot1.current_imbalance_percent?.toFixed(1) || 5.8}%)`,
        description: `Stator winding phase current imbalance exceeds NEMA MG1 1.0% limit. Motor casing temperature is elevated to ${mot1.temperature_C}°C.`,
        detected_at: now,
        duration_minutes: 480,
        excess_power_kw: excessKw,
        estimated_waste_kwh: wasteKwh,
        estimated_waste_rs: wasteRs,
        confidence_percent: 88,
        is_active: true,
        recommended_action:
          'Measure terminal voltages for phase voltage unbalance. Inspect contactor contacts and motor winding resistance. Schedule off-shift bearing greasing.',
        physics_basis:
          'A 3% voltage/current imbalance induces negative-sequence braking currents, increasing motor I^2 R heating by 18-25%.',
      });
    }

    // 6. Demand Spike
    if (faultState.demandSpike.active && incomer) {
      const maxKva = incomer.kva;
      events.push({
        event_id: 'ev-demand-spike-01',
        asset_id: 'incomer-01',
        asset_name: 'Main Incomer 11kV/415V',
        type: 'DEMAND_SPIKE',
        severity: 'CRITICAL',
        title: `Coincident Maximum Demand Exceedance Risk (${Math.round(maxKva)} kVA)`,
        description: `Plant apparent demand is within 5% of 1,200 kVA sanctioned contract limit due to simultaneous furnace melt and auxiliary starts.`,
        detected_at: now,
        duration_minutes: 25,
        excess_power_kw: 95.0,
        estimated_waste_kwh: 40,
        estimated_waste_rs: 18500, // demand overshoot tariff penalty
        confidence_percent: 96,
        is_active: true,
        recommended_action:
          'Interlock sand mixer batch start to pause during furnace peak melt phase (minutes 20-50 of heat cycle).',
        physics_basis:
          'Contract demand penalty applies at 150-200% of standard kVA rate for 15-minute integration windows.',
      });
    }

    // Sort descending by estimated ₹ wasted
    return events.sort((a, b) => b.estimated_waste_rs - a.estimated_waste_rs);
  }

  /**
   * Detailed single-meter intelligence diagnostic for rotary screw compressor.
   */
  public diagnoseCompressor(
    readings: TelemetryReading[],
    faultState: SimulatorState['activeFaults']
  ): CompressorLeakageDiagnosis {
    const isLeaking = faultState.compressorLeakage.active;
    const sev = faultState.compressorLeakage.severity || 0.6;
    const ratedKw = 75;

    // Normal baseline: load 28s, unload 62s (cycle 90s), duty cycle 31.1%
    // Under leak: load increases by up to 34s, unload drops to 28s, duty cycle up to 69%
    const baseDuty = 31.1;
    const currentDuty = isLeaking ? Math.round((baseDuty + sev * 37) * 10) / 10 : baseDuty;
    const cycleSec = 90;
    const loadSec = Math.round((currentDuty / 100) * cycleSec);
    const unloadSec = cycleSec - loadSec;

    const unloadKw = isLeaking ? Math.round((19.5 + sev * 4.8) * 10) / 10 : 19.5;
    const loadedKw = 68.5;
    const unloadFraction = Math.round((unloadKw / ratedKw) * 1000) / 10;

    // 120 CFM capacity compressor
    // Leakage CFM approx capacity * (duty - baseDuty) / 100
    const leakCfm = isLeaking ? Math.round(120 * ((currentDuty - baseDuty) / 100) * 10) / 10 : 3.5;
    const leakPercent = Math.round((leakCfm / 120) * 100);

    // Annual waste calculation (6000 operating hours/yr)
    const excessKw = isLeaking ? (currentDuty - baseDuty) / 100 * (loadedKw - unloadKw) : 0;
    const annualKwh = Math.round(excessKw * 6000);
    const annualRs = Math.round(annualKwh * DEMO_PLANT.base_tariff_rs_per_kwh);
    const annualCo2 = Math.round((annualKwh * DEMO_PLANT.cea_emission_factor_tco2_per_mwh) / 1000 * 10) / 10;

    let status: CompressorLeakageDiagnosis['leakage_status'] = 'NORMAL';
    if (leakPercent > 28) status = 'SEVERE_LEAK';
    else if (leakPercent > 18) status = 'MODERATE_LEAK';
    else if (leakPercent > 8) status = 'SLIGHT_LEAK';

    return {
      asset_id: 'compressor-01',
      method: 'SINGLE_METER_POWER_INFERENCE',
      rated_power_kw: ratedKw,
      measured_loaded_power_kw: loadedKw,
      measured_unloaded_power_kw: unloadKw,
      unloaded_power_fraction_percent: unloadFraction,
      load_time_seconds: loadSec,
      unload_time_seconds: unloadSec,
      cycle_period_seconds: cycleSec,
      duty_cycle_percent: currentDuty,
      baseline_duty_cycle_percent: baseDuty,
      estimated_leakage_cfm: leakCfm,
      estimated_leakage_percent: leakPercent,
      leakage_status: status,
      annual_waste_kwh: annualKwh,
      annual_waste_rs: annualRs,
      annual_co2_tonnes: annualCo2,
      confidence_score: isLeaking ? 91 : 95,
      disclaimer:
        'Single-meter intelligence inference derived from power signal duty cycle. This is an engineering inference and does not replace on-site ultrasonic acoustic leak detection.',
    };
  }
}

export const wasteDetector = new WasteDetector();
