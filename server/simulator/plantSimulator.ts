import { DEMO_PLANT, DEMO_ASSETS, PlantAsset } from '../data/foundryPlant';
import { mqttService } from '../services/mqttService';

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

export interface ShiftProductionRecord {
  record_id: string;
  date: string;
  shift: 'Shift 1 (06:00-14:00)' | 'Shift 2 (14:00-22:00)' | 'Shift 3 (22:00-06:00)';
  heats_completed: number;
  molten_tonnes: number;
  good_castings_tonnes: number;
  rejection_rate_percent: number;
  total_energy_kwh: number;
  sec_kwh_per_tonne: number;
  avg_ambient_temp_C: number;
  tariff_cost_rs: number;
  production_target_tonnes: number;
  status: 'COMPLETED' | 'IN_PROGRESS';
  holding_hours?: number;
  idle_waste_kwh?: number;
}

export interface FaultConfig {
  active: boolean;
  targetSeverity: number; // 0 to 1
  currentSeverity: number; // smooth progression from 0 to target
  severity?: number;
  startTime?: string;
  notes?: string;
}

export interface SimulatorState {
  isRunning: boolean;
  speed: 1 | 5 | 10;
  virtualTime: Date;
  tickCounter: number;
  activeFaults: {
    compressorLeakage: FaultConfig;
    compressorIdleRunning: FaultConfig;
    furnaceInefficientHolding: FaultConfig;
    motorDegradation: FaultConfig;
    lowPowerFactor: FaultConfig;
    demandSpike: FaultConfig;
    sensorDropout: FaultConfig;
    productionDrop: FaultConfig;
  };
}

class SeededRandom {
  private seed: number;
  private readonly initialSeed: number;

  constructor(seed = 123456789) {
    this.initialSeed = seed;
    this.seed = seed;
  }

  public reset(newSeed?: number) {
    this.seed = newSeed !== undefined ? newSeed : this.initialSeed;
  }

  public next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public normal(mean = 0, std = 1): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * std;
  }
}

export class PlantSimulator {
  private state: SimulatorState;
  private timer: NodeJS.Timeout | null = null;
  private rng: SeededRandom;
  private historicalProduction: ShiftProductionRecord[] = [];
  private cumulativeKWh: Map<string, number> = new Map();
  private lastLiveReadings: Map<string, TelemetryReading> = new Map();

  // Physics state machines
  private furnacePhaseTimer = 0; // minutes into 80-minute heat
  private compressorCycleTimer = 0; // seconds into 90-second cycle
  private compressorDutyCycleHistory: number[] = [];

  constructor() {
    this.rng = new SeededRandom(20261004);
    this.state = {
      isRunning: true,
      speed: 1,
      virtualTime: new Date(),
      tickCounter: 0,
      activeFaults: {
        compressorLeakage: { active: false, targetSeverity: 0.75, currentSeverity: 0 },
        compressorIdleRunning: { active: false, targetSeverity: 0.6, currentSeverity: 0 },
        furnaceInefficientHolding: { active: false, targetSeverity: 0.8, currentSeverity: 0 },
        motorDegradation: { active: false, targetSeverity: 0.85, currentSeverity: 0 },
        lowPowerFactor: { active: false, targetSeverity: 0.8, currentSeverity: 0 },
        demandSpike: { active: false, targetSeverity: 0.7, currentSeverity: 0 },
        sensorDropout: { active: false, targetSeverity: 0.5, currentSeverity: 0 },
        productionDrop: { active: false, targetSeverity: 0.6, currentSeverity: 0 },
      },
    };

    // Sub-meter baseline initialization (monotonically increasing kWh)
    this.cumulativeKWh.set('incomer-01', 4825000);
    this.cumulativeKWh.set('furnace-01', 3420000);
    this.cumulativeKWh.set('compressor-01', 485000);
    this.cumulativeKWh.set('motor-01', 248000);
    this.cumulativeKWh.set('motor-02', 195000);
    this.cumulativeKWh.set('motor-03', 172000);

    this.generateHistoricalData(60);
    this.startLiveSimulation();
  }

  public getState(): SimulatorState {
    return {
      ...this.state,
      activeFaults: {
        compressorLeakage: { ...this.state.activeFaults.compressorLeakage, severity: this.state.activeFaults.compressorLeakage.currentSeverity } as any,
        compressorIdleRunning: { ...this.state.activeFaults.compressorIdleRunning, severity: this.state.activeFaults.compressorIdleRunning.currentSeverity } as any,
        furnaceInefficientHolding: { ...this.state.activeFaults.furnaceInefficientHolding, severity: this.state.activeFaults.furnaceInefficientHolding.currentSeverity } as any,
        motorDegradation: { ...this.state.activeFaults.motorDegradation, severity: this.state.activeFaults.motorDegradation.currentSeverity } as any,
        lowPowerFactor: { ...this.state.activeFaults.lowPowerFactor, severity: this.state.activeFaults.lowPowerFactor.currentSeverity } as any,
        demandSpike: { ...this.state.activeFaults.demandSpike, severity: this.state.activeFaults.demandSpike.currentSeverity } as any,
        sensorDropout: { ...this.state.activeFaults.sensorDropout, severity: this.state.activeFaults.sensorDropout.currentSeverity } as any,
        productionDrop: { ...this.state.activeFaults.productionDrop, severity: this.state.activeFaults.productionDrop.currentSeverity } as any,
      },
    };
  }

  public getHistoricalShifts(): ShiftProductionRecord[] {
    return this.historicalProduction;
  }

  public getLatestReadings(): TelemetryReading[] {
    return Array.from(this.lastLiveReadings.values());
  }

  public setSpeed(speed: 1 | 5 | 10) {
    this.state.speed = speed;
  }

  public setFault(faultKey: keyof SimulatorState['activeFaults'], active: boolean, targetSeverity = 0.75) {
    if (this.state.activeFaults[faultKey]) {
      this.state.activeFaults[faultKey].active = active;
      this.state.activeFaults[faultKey].targetSeverity = targetSeverity;
      if (active) {
        this.state.activeFaults[faultKey].startTime = new Date().toISOString();
        // Give a starting slight onset if currently 0
        if (this.state.activeFaults[faultKey].currentSeverity === 0) {
          this.state.activeFaults[faultKey].currentSeverity = 0.15;
        }
      }

      mqttService.publish(`plant/kolhapur/faults/${faultKey}`, {
        fault: faultKey,
        active,
        targetSeverity,
        currentSeverity: this.state.activeFaults[faultKey].currentSeverity,
        timestamp: new Date().toISOString(),
      });
    }
  }

  public resetSimulation() {
    this.rng.reset(20261004);
    for (const key of Object.keys(this.state.activeFaults) as (keyof SimulatorState['activeFaults'])[]) {
      this.state.activeFaults[key].active = false;
      this.state.activeFaults[key].currentSeverity = 0;
      this.state.activeFaults[key].targetSeverity = 0.5;
    }
    this.state.virtualTime = new Date();
    this.state.tickCounter = 0;
    this.furnacePhaseTimer = 35;
    this.compressorCycleTimer = 15;
    this.generateHistoricalData(60);
    this.tickLiveTelemetry();
  }

  private startLiveSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.state.isRunning) {
        this.tickLiveTelemetry();
      }
    }, 2000);
  }

  /**
   * Smoothly updates progressive wear / fault severity.
   * Rather than jumping instantly, faults smoothly ramp up or down.
   */
  private updateFaultProgression() {
    for (const key of Object.keys(this.state.activeFaults) as (keyof SimulatorState['activeFaults'])[]) {
      const fault = this.state.activeFaults[key];
      if (fault.active) {
        // Smooth exponential approach towards target severity
        const delta = fault.targetSeverity - fault.currentSeverity;
        fault.currentSeverity = Math.min(
          fault.targetSeverity,
          fault.currentSeverity + Math.max(0.04, delta * 0.2)
        );
      } else {
        // Smooth recovery when fault is cleared / repaired
        if (fault.currentSeverity > 0) {
          fault.currentSeverity = Math.max(0, fault.currentSeverity - 0.15);
        }
      }
    }
  }

  /**
   * Deterministic real-time telemetry generator with strict physics correlations:
   * 1. Ambient temperature cycle influences furnace coil resistance and cooling tower heat dissipation.
   * 2. Compressor leakage increases unloaded power draw and loaded duty cycle duration.
   * 3. Motor degradation drives current imbalance and thermal casing temperature rise.
   * 4. Low power factor elevates apparent kVA draw without mechanical work.
   * 5. Open furnace lid holding dramatically increases standby radiant holding energy per tonne.
   */
  private tickLiveTelemetry() {
    this.state.tickCounter++;
    this.updateFaultProgression();

    const now = new Date();
    this.state.virtualTime = now;
    const hour = now.getHours();

    // Ambient Temperature: Diurnal sinusoidal curve, peak at 14:00, coolest at 05:00
    // Kolhapur semi-arid climate: 22°C night to 36°C day
    const diurnalRad = ((hour - 5) / 24) * 2 * Math.PI;
    const baseAmbientTemp = 28.5 + 7.5 * Math.sin(diurnalRad);
    const ambientTempC = Math.round((baseAmbientTemp + (Math.sin(this.state.tickCounter * 0.05) * 0.4)) * 10) / 10;

    // Physical temperature coefficient on electrical equipment (thermal resistivity)
    const tempThermalFactor = 1 + (ambientTempC - 25) * 0.0035;

    // Active Fault Progressive Severities
    const leakSev = this.state.activeFaults.compressorLeakage.currentSeverity;
    const idleSev = this.state.activeFaults.compressorIdleRunning.currentSeverity;
    const holdSev = this.state.activeFaults.furnaceInefficientHolding.currentSeverity;
    const motorSev = this.state.activeFaults.motorDegradation.currentSeverity;
    const pfSev = this.state.activeFaults.lowPowerFactor.currentSeverity;
    const demandSev = this.state.activeFaults.demandSpike.currentSeverity;
    const prodDropSev = this.state.activeFaults.productionDrop.currentSeverity;
    const sensorDropSev = this.state.activeFaults.sensorDropout.currentSeverity;

    // -------------------------------------------------------------
    // 1. INDUCTION MELTING FURNACE (Coreless 1.5 tonne, 650 kW rated)
    // -------------------------------------------------------------
    // 80-minute heat cycle:
    //  0 - 15m: Cold Scrap Charging & Initial Heating (~260 kW)
    // 15 - 55m: High-Power Steady Melting (590-630 kW)
    // 55 - 70m: Superheating to 1500°C & Deslagging (~440 kW)
    // 70 - 80m: Tapping into ladles / Covered holding (125-140 kW)
    // IF furnaceInefficientHolding fault is active:
    // Holding stage draws 260-340 kW due to uninsulated crucible mouth & radiation!
    this.furnacePhaseTimer = (this.furnacePhaseTimer + 1) % 80;
    let furnaceKw = 0;
    let furnaceState: TelemetryReading['operating_state'] = 'LOADED';

    if (prodDropSev > 0.4 && this.furnacePhaseTimer > 45) {
      // Production halted: Furnace is stuck holding molten bath
      furnaceKw = 190 + holdSev * 95;
      furnaceState = 'IDLE';
    } else if (this.furnacePhaseTimer >= 70 || (holdSev > 0 && this.furnacePhaseTimer > 55)) {
      if (holdSev > 0.05) {
        // Radiant heat loss: Stefan-Boltzmann (T^4) loss from open crucible lid
        // Holding power surges from 135 kW to up to 320 kW
        furnaceKw = 135 + holdSev * 175 + Math.sin(this.state.tickCounter * 0.2) * 8;
        furnaceState = holdSev > 0.5 ? 'WARNING' : 'IDLE';
      } else {
        furnaceKw = 130 + Math.sin(this.state.tickCounter * 0.1) * 6;
        furnaceState = 'IDLE';
      }
    } else if (this.furnacePhaseTimer < 15) {
      furnaceKw = 255 + Math.sin(this.state.tickCounter * 0.15) * 8;
    } else if (this.furnacePhaseTimer < 55) {
      furnaceKw = 605 * tempThermalFactor + Math.sin(this.state.tickCounter * 0.1) * 12;
      furnaceState = 'LOADED';
    } else {
      furnaceKw = 445 * tempThermalFactor + Math.sin(this.state.tickCounter * 0.1) * 10;
      furnaceState = 'LOADED';
    }

    // -------------------------------------------------------------
    // 2. AIR COMPRESSOR (Rotary Screw 75 kW rated, 120 CFM, 7.5 bar)
    // -------------------------------------------------------------
    // Single-Meter Duty Cycle Intelligence:
    // Nominal baseline: 28 seconds loaded @ 68.5 kW, 62 seconds unloaded @ 19.5 kW (Cycle: 90s, Duty: 31.1%)
    // CORRELATED LEAKAGE RELATION:
    // As leakSev ↑, artificial demand continuously vents air:
    // -> Load duration increases up to 64 seconds
    // -> Unload duration shrinks to 26 seconds
    // -> Unloaded power draw increases from 19.5 kW up to 24.8 kW due to intake throttling backpressure
    this.compressorCycleTimer = (this.compressorCycleTimer + 2) % 90;
    const nominalLoadTime = 28;
    const leakLoadExtension = Math.round(leakSev * 36); // up to 64s loaded
    const activeLoadThreshold = Math.min(80, nominalLoadTime + leakLoadExtension);

    let compressorKw = 0;
    let compressorState: TelemetryReading['operating_state'] = 'LOADED';

    if (idleSev > 0.2 && leakSev < 0.2 && this.state.tickCounter % 20 < 10) {
      // Idle running during shift breaks without auto-shutdown
      compressorKw = 20.5 + idleSev * 3.5;
      compressorState = 'IDLE';
    } else if (this.compressorCycleTimer < activeLoadThreshold) {
      // Compressor is actively pumping (Loaded)
      compressorKw = 68.2 * tempThermalFactor + Math.sin(this.state.tickCounter * 0.3) * 1.5;
      compressorState = leakSev > 0.4 ? 'WARNING' : 'LOADED';
    } else {
      // Compressor is running Unloaded (Unloaded power draw increases with leakage backpressure)
      const baseUnload = 19.4;
      const unloadPenalty = leakSev * 5.2; // unloaded power climbs up to 24.6 kW!
      compressorKw = baseUnload + unloadPenalty + Math.sin(this.state.tickCounter * 0.2) * 0.8;
      compressorState = leakSev > 0.4 ? 'WARNING' : 'IDLE';
    }

    // -------------------------------------------------------------
    // 3. MOTOR 1: FURNACE COIL WATER COOLING PUMP (37 kW rated)
    // -------------------------------------------------------------
    // Continuous circulation loop cooling induction coil and inverter thyristors.
    // CORRELATED DEGRADATION RELATION:
    // As motorSev ↑:
    // -> Phase current imbalance surges from 1.1% up to 6.8% (NEMA MG1 violation)
    // -> Winding and casing temperature climbs from 48°C up to 76°C
    // -> Power draw rises from 31.8 kW to 38.2 kW (parasitic braking torque)
    let mot1Kw = 31.8 * tempThermalFactor;
    let mot1Temp = 47.0 + (ambientTempC - 25) * 0.5;
    let mot1Imbalance = 1.15;
    let mot1State: TelemetryReading['operating_state'] = 'LOADED';

    if (motorSev > 0.05) {
      mot1Kw += motorSev * 6.5; // up to 38.3 kW (overload)
      mot1Temp += motorSev * 27.5; // up to 75.5°C
      mot1Imbalance += motorSev * 5.6; // up to 6.75% current imbalance
      mot1State = motorSev > 0.6 ? 'FAULT' : 'WARNING';
    }

    // -------------------------------------------------------------
    // 4. MOTOR 2: SAND INTENSIVE MIXER (45 kW rated)
    // -------------------------------------------------------------
    // Cyclic batch mixer correlated with moulding shop demand.
    // Cycles 8 ticks loaded (~38.5 kW) and 4 ticks idle unloader (~4.2 kW).
    let mot2Kw = 0;
    let mot2State: TelemetryReading['operating_state'] = 'IDLE';
    const mixerCycle = this.state.tickCounter % 12;

    if (prodDropSev > 0.5) {
      // Moulding line down
      mot2Kw = 3.8;
      mot2State = 'IDLE';
    } else if (mixerCycle < 8) {
      mot2Kw = 38.5 * tempThermalFactor + Math.sin(this.state.tickCounter * 0.4) * 2.2;
      mot2State = 'LOADED';
    } else {
      mot2Kw = 4.2;
      mot2State = 'IDLE';
    }

    // -------------------------------------------------------------
    // 5. MOTOR 3: BAGHOUSE DUST EXHAUST FAN (30 kW rated)
    // -------------------------------------------------------------
    // Continuous ventilation fan with steady aerodynamic load.
    const mot3Kw = 25.6 * tempThermalFactor + Math.sin(this.state.tickCounter * 0.08) * 0.6;
    const mot3State: TelemetryReading['operating_state'] = 'LOADED';

    // -------------------------------------------------------------
    // 6. MAIN INCOMER (Total Plant Sum + Auxiliaries)
    // -------------------------------------------------------------
    // Auxiliaries: Lighting, Ladle drying torch blowers, Transformer core losses (~38 kW)
    let auxKw = 38.0 + (ambientTempC - 25) * 0.4;
    if (demandSev > 0.05) {
      auxKw += 80 + demandSev * 85; // Coincident peak spike
    }

    const totalKw = furnaceKw + compressorKw + mot1Kw + mot2Kw + mot3Kw + auxKw;

    // CORRELATED POWER FACTOR RELATION:
    // Nominal PF is 0.945 - 0.955.
    // When lowPowerFactor fault is injected (capacitor bank trip):
    // Power factor collapses down to 0.81 - 0.83.
    // Apparent Power: kVA = kW / PF directly surges, loading transformer and cables!
    let powerFactor = 0.952 - (ambientTempC > 32 ? 0.008 : 0);
    if (pfSev > 0.05) {
      powerFactor = 0.952 - pfSev * 0.138; // down to 0.814
    }
    const totalKva = totalKw / powerFactor;

    let incomerState: TelemetryReading['operating_state'] = 'LOADED';
    if (totalKva > DEMO_PLANT.contract_demand_kVA * 0.92) {
      incomerState = 'WARNING';
    }
    if (powerFactor < 0.90) {
      incomerState = 'WARNING';
    }

    // Update cumulative energy (2 seconds tick = 2/3600 hours)
    const deltaHours = 2 / 3600;

    const telemetryMap: Record<
      string,
      {
        kw: number;
        state: TelemetryReading['operating_state'];
        temp: number;
        imb?: number;
        pf?: number;
      }
    > = {
      'incomer-01': { kw: totalKw, state: incomerState, temp: 34.0 + (ambientTempC - 25) * 0.4, imb: 1.2, pf: powerFactor },
      'furnace-01': { kw: furnaceKw, state: furnaceState, temp: 68.0 + (holdSev * 14), imb: 1.6, pf: 0.94 },
      'compressor-01': { kw: compressorKw, state: compressorState, temp: 72.0 + (leakSev * 14.5), imb: 1.8, pf: 0.91 },
      'motor-01': { kw: mot1Kw, state: mot1State, temp: mot1Temp, imb: mot1Imbalance, pf: 0.89 },
      'motor-02': { kw: mot2Kw, state: mot2State, temp: 44.0, imb: 1.4, pf: 0.88 },
      'motor-03': { kw: mot3Kw, state: mot3State, temp: 41.5, imb: 1.2, pf: 0.90 },
    };

    for (const asset of DEMO_ASSETS) {
      const spec = telemetryMap[asset.asset_id];
      const prevCum = this.cumulativeKWh.get(asset.asset_id) || 10000;
      const nextCum = prevCum + spec.kw * deltaHours;
      this.cumulativeKWh.set(asset.asset_id, nextCum);

      const pf = spec.pf || 0.92;
      const kva = spec.kw / pf;
      const voltage = 413.5 - (totalKw / 1000) * 4.5 + Math.sin(this.state.tickCounter * 0.1) * 1.5;
      const current = (kva * 1000) / (Math.sqrt(3) * voltage);

      const isSensorDrop = sensorDropSev > 0.4 && asset.asset_id === 'motor-02';
      const qualityFlag: TelemetryReading['quality_flag'] = isSensorDrop ? 'MISSING' : 'SIMULATED';

      const reading: TelemetryReading = {
        reading_id: `read-${asset.asset_id}-${this.state.tickCounter}`,
        asset_id: asset.asset_id,
        site_id: DEMO_PLANT.site_id,
        timestamp: now.toISOString(),
        voltage_V: Math.round(voltage * 10) / 10,
        current_A: Math.round(current * 10) / 10,
        kw: Math.round(spec.kw * 10) / 10,
        kva: Math.round(kva * 10) / 10,
        power_factor: Math.round(pf * 1000) / 1000,
        frequency_Hz: Math.round((50.0 + Math.sin(this.state.tickCounter * 0.05) * 0.06) * 100) / 100,
        kwh_cumulative: Math.round(nextCum * 100) / 100,
        operating_state: qualityFlag === 'MISSING' ? 'OFF' : spec.state,
        temperature_C: Math.round(spec.temp * 10) / 10,
        current_imbalance_percent: spec.imb ? Math.round(spec.imb * 10) / 10 : undefined,
        quality_flag: qualityFlag,
      };

      this.lastLiveReadings.set(asset.asset_id, reading);
      mqttService.publish(`plant/kolhapur/meters/${asset.asset_id}/telemetry`, reading);
    }
  }

  /**
   * Generates 60 days of physically correlated historical shift data.
   * Incorporates:
   * 1. Weekday vs Weekend patterns (Monday-Friday full, Saturday partial, Sunday maintenance).
   * 2. Shift patterns (Morning cold start, Afternoon peak temp, Night off-peak).
   * 3. Production ↑ → Energy ↑ correlation.
   * 4. Ambient temperature sensitivity (~4.2 kWh/°C).
   * 5. Historical events (compressor leakage progression in weeks 3-4 before repair).
   */
  private generateHistoricalData(days: number) {
    this.historicalProduction = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);

    const shifts: ('Shift 1 (06:00-14:00)' | 'Shift 2 (14:00-22:00)' | 'Shift 3 (22:00-06:00)')[ ] = [
      'Shift 1 (06:00-14:00)',
      'Shift 2 (14:00-22:00)',
      'Shift 3 (22:00-06:00)',
    ];

    for (let d = 0; d < days; d++) {
      const curDate = new Date(baseDate);
      curDate.setDate(baseDate.getDate() + d);
      const dateStr = curDate.toISOString().split('T')[0];
      const dayOfWeek = curDate.getDay(); // 0 = Sunday, 6 = Saturday

      for (let s = 0; s < 3; s++) {
        const shiftName = shifts[s];

        // 1. Production Tonnage Modeling: Weekday vs Weekend
        let targetTonnes = 1.88;
        let goodTonnes = 0;

        if (dayOfWeek === 0) {
          // Sunday: Scheduled maintenance day
          if (s === 0) {
            targetTonnes = 0.8;
            goodTonnes = 0.75 + this.rng.range(-0.05, 0.05); // light shift
          } else if (s === 1) {
            targetTonnes = 0.9;
            goodTonnes = 0.85 + this.rng.range(-0.05, 0.08);
          } else {
            // Sunday Shift 3: Maintenance shutdown, zero melt output
            targetTonnes = 0.0;
            goodTonnes = 0.0; // zero output, machine idle maintenance
          }
        } else if (dayOfWeek === 6 && s === 2) {
          // Saturday night shift: Reduced melt schedule
          targetTonnes = 1.2;
          goodTonnes = 1.15 + this.rng.range(-0.08, 0.1);
        } else {
          // Normal weekday commercial production
          targetTonnes = 1.88;
          // Correlated variance around shift target
          goodTonnes = this.rng.normal(1.92, 0.18);
          goodTonnes = Math.max(1.1, Math.min(2.4, goodTonnes));
        }
        goodTonnes = Math.round(goodTonnes * 100) / 100;

        // Foundry Yield: ~88% good casting yield from molten bath
        const moltenTonnes = goodTonnes > 0 ? Math.round((goodTonnes / 0.88) * 100) / 100 : 0;
        const heats = goodTonnes > 0 ? Math.max(1, Math.round(moltenTonnes / 0.72)) : 0;

        // 2. Ambient Temperature: Seasonal sinusoidal drift + shift diurnal cycle
        // Shift 1 (morning): 25-28°C
        // Shift 2 (afternoon/evening): 31-36°C (warmest)
        // Shift 3 (night): 21-25°C (coolest)
        const seasonalDrift = Math.sin((d / days) * Math.PI) * 4.0;
        const shiftDiurnalOffset = s === 0 ? 0.5 : s === 1 ? 5.2 : -4.8;
        const ambTemp = Math.round((27.5 + seasonalDrift + shiftDiurnalOffset + this.rng.range(-0.8, 0.8)) * 10) / 10;

        // Furnace idle holding hours modeling:
        // Nominal shifts have minimal holding (0.1 - 0.25 hrs during ladle changeover).
        // On days 12-16 (moulding track congestion) and occasionally on Shift 2, holding extends to 0.8 - 1.6 hrs.
        let holdingHours = 0;
        if (goodTonnes > 0) {
          if (d >= 12 && d <= 16) {
            holdingHours = Math.round((0.8 + this.rng.range(0.2, 0.8)) * 10) / 10;
          } else if (s === 1 && this.rng.next() < 0.25) {
            holdingHours = Math.round((0.4 + this.rng.range(0.1, 0.6)) * 10) / 10;
          } else {
            holdingHours = Math.round((0.1 + this.rng.range(0.0, 0.15)) * 10) / 10;
          }
        }

        // 3. PHYSICALLY CORRELATED ENERGY EQUATION:
        // Expected Energy = β₀ (baseload standby) + β₁·Production + β₂·Temperature + β₃·HoldingLoss
        // β₀ = 210.0 kWh (furnace coil holding standby, lighting, idle utilities)
        // β₁ = 975.0 kWh/t (thermodynamic melt + auxiliaries)
        // β₂ = 4.2 kWh/°C (cooling efficiency loss, coil resistance)
        // β₃ = 155.0 kWh/hr of furnace idle holding (direct thermal radiation from open melt crucible)
        let baseloadKwh = 210.0;
        let incrementalMeltKwh = goodTonnes * 975.0;
        let tempSensitivityKwh = (ambTemp - 25.0) * 4.2;
        let holdingLossKwh = holdingHours * 155.0;

        // Production = 0 (Sunday Shift 3): Equipment remains ON in idle standby
        // Machine ON with 0 production incurs direct idle waste
        let idleWasteKwh = 0;
        if (goodTonnes === 0) {
          incrementalMeltKwh = 0;
          holdingLossKwh = 0;
          holdingHours = 0;
          idleWasteKwh = 385; // compressor unloaded + cooling pump running + baghouse standby
        }

        // Shift 1 cold-start penalty (furnace refractory pre-heating after night or weekend)
        const coldStartPenalty = s === 0 ? 55 : 0;

        // Deliberate realistic historical event: Weeks 3-4 (days 21 to 35)
        // Compressor pneumatic leakage gradually grew from 5% to 32%, then repaired
        let historicalLeakPenalty = 0;
        if (d >= 21 && d <= 35) {
          const leakProgression = Math.sin(((d - 21) / 14) * Math.PI); // bell curve of leak growth
          historicalLeakPenalty = Math.round(leakProgression * 165);
        }

        const totalEnergyKwh = Math.round(
          baseloadKwh +
          incrementalMeltKwh +
          tempSensitivityKwh +
          holdingLossKwh +
          idleWasteKwh +
          coldStartPenalty +
          historicalLeakPenalty +
          this.rng.normal(0, 18) // subtle unmodelled noise
        );

        // SEC Calculation (kWh / tonne of good castings):
        // Notice: holdingHours ↑ directly drives SEC (energy per tonne) ↑
        // If production = 0, SEC is null/0, but energy is recorded as idle waste
        const sec = goodTonnes > 0 ? Math.round((totalEnergyKwh / goodTonnes) * 10) / 10 : 0;

        // 4. Tariff Rate Mapping:
        // Shift 1: 4 hours of morning peak (+25% surcharge)
        // Shift 2: 4 hours of evening peak (+25% surcharge)
        // Shift 3: 8 hours of night off-peak (-10% rebate)
        let effectiveTariff = DEMO_PLANT.base_tariff_rs_per_kwh;
        if (s === 0 || s === 1) {
          effectiveTariff = DEMO_PLANT.base_tariff_rs_per_kwh * (1 + (0.25 * 4) / 8); // ₹7.875/kWh
        } else {
          effectiveTariff = DEMO_PLANT.base_tariff_rs_per_kwh * 0.90; // ₹6.30/kWh
        }

        const costRs = Math.round(totalEnergyKwh * effectiveTariff);

        this.historicalProduction.push({
          record_id: `shift-rec-${d}-${s}`,
          date: dateStr,
          shift: shiftName,
          heats_completed: heats,
          molten_tonnes: moltenTonnes,
          good_castings_tonnes: goodTonnes,
          rejection_rate_percent: goodTonnes > 0 ? Math.round((12.0 + this.rng.range(-1.2, 1.5)) * 10) / 10 : 0,
          total_energy_kwh: totalEnergyKwh,
          sec_kwh_per_tonne: sec,
          avg_ambient_temp_C: ambTemp,
          tariff_cost_rs: costRs,
          production_target_tonnes: targetTonnes,
          status: 'COMPLETED',
          holding_hours: holdingHours,
          idle_waste_kwh: idleWasteKwh,
        });
      }
    }
  }
}

export const plantSimulator = new PlantSimulator();
