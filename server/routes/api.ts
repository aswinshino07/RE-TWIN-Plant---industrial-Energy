import { Router, Request, Response } from 'express';
import { DEMO_PLANT, DEMO_ASSETS } from '../data/foundryPlant';
import { plantSimulator } from '../simulator/plantSimulator';
import { baselineEngine } from '../algorithms/baselineEngine';
import { wasteDetector } from '../algorithms/wasteDetector';
import { equipmentHealthEngine } from '../algorithms/equipmentHealth';
import { twinOptimiser } from '../algorithms/twinOptimiser';
import { mvVerifier } from '../algorithms/mvVerifier';
import { carbonPassportEngine } from '../algorithms/carbonPassport';
import { geminiService } from '../services/geminiService';
import { mqttService } from '../services/mqttService';

const router = Router();

// 1. Plant configuration
router.get('/plant', (req: Request, res: Response) => {
  res.json({
    plant: DEMO_PLANT,
    status: 'SIMULATED_DEMO_ACTIVE',
    mode: 'SIMULATION',
    disclaimer: 'All plant figures are benchmark-derived illustrations with stated assumptions. No measured plant data has been collected yet.',
  });
});

// 2. Asset registry
router.get('/assets', (req: Request, res: Response) => {
  res.json({ assets: DEMO_ASSETS });
});

// 3. Live telemetry
router.get('/readings', (req: Request, res: Response) => {
  const readings = plantSimulator.getLatestReadings();
  const state = plantSimulator.getState();
  res.json({
    readings,
    simulator_state: {
      is_running: state.isRunning,
      speed: state.speed,
      virtual_time: state.virtualTime,
      active_faults: state.activeFaults,
    },
    timestamp: new Date().toISOString(),
  });
});

// 4. Production & Shift History
router.get('/production', (req: Request, res: Response) => {
  const shifts = plantSimulator.getHistoricalShifts();
  res.json({
    total_shifts: shifts.length,
    shifts: shifts.slice(-60), // recent 60 shifts
  });
});

// 5. Executive Dashboard Summary
router.get('/dashboard', (req: Request, res: Response) => {
  const readings = plantSimulator.getLatestReadings();
  const shifts = plantSimulator.getHistoricalShifts();
  const state = plantSimulator.getState();
  const activeWaste = wasteDetector.detectActiveWaste(readings, state.activeFaults);
  const health = equipmentHealthEngine.evaluatePlantHealth(readings, state.activeFaults);

  // Incomer reading
  const incomer = readings.find((r) => r.asset_id === 'incomer-01') || {
    kw: 742.0,
    kva: 789.0,
    kwh_cumulative: 4825000,
    power_factor: 0.94,
  };

  // Recent 3 shifts for today's MWh
  const recentShifts = shifts.slice(-3);
  const todaysKwh = recentShifts.reduce((acc, s) => acc + s.total_energy_kwh, 0) || 6450;
  const todaysTonnes = recentShifts.reduce((acc, s) => acc + s.good_castings_tonnes, 0) || 5.8;
  const currentSec = todaysTonnes > 0 ? Math.round((todaysKwh / todaysTonnes) * 10) / 10 : 1087;

  // Total ₹ and kWh wasted from active events
  const todayWasteRs = activeWaste.reduce((acc, w) => acc + w.estimated_waste_rs, 0);
  const todayWasteKwh = activeWaste.reduce((acc, w) => acc + w.estimated_waste_kwh, 0);

  // Opportunities
  const opportunities = [
    {
      id: 'opp-1',
      title: 'Compressor Leakage & Idle Elimination',
      annual_potential_rs: 240000,
      annual_potential_kwh: 34200,
      confidence: 'HIGH',
      payback_months: 2.5,
    },
    {
      id: 'opp-2',
      title: 'Induction Furnace Holding & Lid Optimization',
      annual_potential_rs: 410000,
      annual_potential_kwh: 58500,
      confidence: 'MEDIUM',
      payback_months: 4.8,
    },
    {
      id: 'opp-3',
      title: 'APFC Capacitor Bank & Power Factor Upgrade',
      annual_potential_rs: 140000,
      annual_potential_kwh: 14000,
      confidence: 'HIGH',
      payback_months: 3.2,
    },
  ];

  res.json({
    kpi: {
      current_power_kw: Math.round(incomer.kw * 10) / 10,
      todays_energy_mwh: Math.round((todaysKwh / 1000) * 100) / 100,
      todays_production_tonnes: Math.round(todaysTonnes * 10) / 10,
      sec_kwh_per_tonne: currentSec,
      sec_benchmark: DEMO_PLANT.benchmark_sec_kwh_per_tonne,
      todays_waste_rs: todayWasteRs,
      todays_waste_kwh: todayWasteKwh,
      potential_annual_savings_rs_lakh: 15.4, // Headline illustration from report
      co2_avoided_tonnes_year: 154.0,
      plant_health_score: health.overall_plant_health,
      active_alerts_count: activeWaste.length,
      power_factor: Math.round((incomer.power_factor || 0.94) * 1000) / 1000,
      contract_demand_kva: DEMO_PLANT.contract_demand_kVA,
      apparent_power_kva: Math.round(incomer.kva * 10) / 10,
    },
    active_waste_events: activeWaste,
    opportunities,
    recent_readings: readings,
  });
});

// 6. Specific Energy Consumption (SEC) Engine
router.get('/sec', (req: Request, res: Response) => {
  const shifts = plantSimulator.getHistoricalShifts();
  const baseline = baselineEngine.fitBaseline(shifts);

  const secTrend = shifts.slice(-30).map((s) => ({
    date: s.date,
    shift: s.shift,
    sec: s.sec_kwh_per_tonne,
    benchmark: DEMO_PLANT.benchmark_sec_kwh_per_tonne,
    theoretical_minimum: DEMO_PLANT.furnace_theoretical_melting_kwh_per_tonne,
    good_tonnes: s.good_castings_tonnes,
    energy_kwh: s.total_energy_kwh,
  }));

  const avgSec = Math.round(
    shifts.reduce((acc, s) => acc + s.sec_kwh_per_tonne, 0) / (shifts.length || 1)
  );

  const bestSec = Math.min(...shifts.map((s) => s.sec_kwh_per_tonne));
  const worstSec = Math.max(...shifts.map((s) => s.sec_kwh_per_tonne));

  res.json({
    current_sec: secTrend[secTrend.length - 1]?.sec || 1087,
    average_sec: avgSec,
    best_sec: bestSec,
    worst_sec: worstSec,
    benchmark_sec: DEMO_PLANT.benchmark_sec_kwh_per_tonne,
    theoretical_minimum_sec: DEMO_PLANT.furnace_theoretical_melting_kwh_per_tonne,
    target_sec: 990, // 10% reduction scenario
    gap_to_benchmark_percent: Math.round(((avgSec - DEMO_PLANT.benchmark_sec_kwh_per_tonne) / DEMO_PLANT.benchmark_sec_kwh_per_tonne) * 1000) / 10,
    sec_trend: secTrend,
  });
});

// 7. Normalised Baseline Model & Predictions
router.get('/baseline', (req: Request, res: Response) => {
  const shifts = plantSimulator.getHistoricalShifts();
  const model = baselineEngine.fitBaseline(shifts);
  const predictions = baselineEngine.evaluateShifts(shifts.slice(-30), model);

  res.json({
    model,
    predictions,
    ashrae_standards: {
      cv_rmse_threshold: '< 20% for daily/shift models (ASHRAE Guideline 14)',
      nmbe_threshold: '< ±5% (ASHRAE Guideline 14)',
      actual_cv_rmse: model.cv_rmse_percent,
      actual_nmbe: model.nmbe_percent,
      compliant: model.ashrae_compliant,
    },
  });
});

// 8. Waste Detection & Single-Meter Compressor Diagnostic
router.get('/waste', (req: Request, res: Response) => {
  const readings = plantSimulator.getLatestReadings();
  const state = plantSimulator.getState();
  const events = wasteDetector.detectActiveWaste(readings, state.activeFaults);
  const compressorDiag = wasteDetector.diagnoseCompressor(readings, state.activeFaults);

  res.json({
    active_events: events,
    compressor_single_meter_diagnostic: compressorDiag,
  });
});

// 9. Equipment Health
router.get('/equipment-health', (req: Request, res: Response) => {
  const readings = plantSimulator.getLatestReadings();
  const state = plantSimulator.getState();
  const health = equipmentHealthEngine.evaluatePlantHealth(readings, state.activeFaults);
  res.json(health);
});

// 10. Digital Twin Scenarios & Simulation
router.get('/twin/scenarios', (req: Request, res: Response) => {
  const scenarios = twinOptimiser.getAllScenarios();
  const baseline = twinOptimiser.getBaseline();
  res.json({
    baseline,
    scenarios,
    constraints: {
      throughput_minimum_tonnes: 2000,
      quality_yield_minimum_percent: 88,
      melt_cycle_integrity_enforced: true,
      refractory_temperature_limit_C: 1550,
      advisory_notice: 'Recommendations are advisory. The system does not take automated control of machinery.',
    },
  });
});

router.post('/twin/explain', async (req: Request, res: Response) => {
  const { scenario_id, language } = req.body || {};
  const scenarios = twinOptimiser.getAllScenarios();
  const target = scenarios.find((s) => s.scenario_id === scenario_id) || scenarios[1];

  try {
    const explanation = await geminiService.processIndustrialQuery(
      `What happens if we implement ${target.name}? How much could this save?`,
      language || 'en'
    );

    res.json({
      scenario_id: target.scenario_id,
      name: target.name,
      explanation,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Measurement & Verification (M&V) Verification Engine
router.post('/verify', (req: Request, res: Response) => {
  const { action_id, action_name, savings_percent, inject_noise } = req.body || {};
  const shifts = plantSimulator.getHistoricalShifts();
  const baseline = baselineEngine.fitBaseline(shifts);

  const verificationReport = mvVerifier.verifyIntervention(
    action_id || 'act-comp-leak-repair',
    action_name || 'Compressed Air Leakage Repair & Furnace Lid Management',
    baseline,
    shifts,
    savings_percent !== undefined ? Number(savings_percent) : 8.5,
    inject_noise !== undefined ? Boolean(inject_noise) : true
  );

  res.json(verificationReport);
});

// 12. Carbon Passport
router.get('/carbon', (req: Request, res: Response) => {
  const passport = carbonPassportEngine.generatePassport();
  res.json(passport);
});

// 13. Simulator Controls
router.post('/simulator/speed', (req: Request, res: Response) => {
  const { speed } = req.body;
  if ([1, 5, 10].includes(speed)) {
    plantSimulator.setSpeed(speed as 1 | 5 | 10);
  }
  res.json({ status: 'ok', state: plantSimulator.getState() });
});

router.post('/simulator/reset', (req: Request, res: Response) => {
  plantSimulator.resetSimulation();
  res.json({ status: 'reset_completed', state: plantSimulator.getState() });
});

router.post('/fault/inject', (req: Request, res: Response) => {
  const { fault, active, severity } = req.body;
  if (fault) {
    plantSimulator.setFault(fault, Boolean(active), severity !== undefined ? Number(severity) : 0.6);
  }
  res.json({
    status: 'fault_updated',
    fault,
    active: Boolean(active),
    severity: severity || 0.6,
    state: plantSimulator.getState(),
  });
});

// 14. Industrial AI Assistant & Energy Intelligence (strictly constrained by backend data)
router.post('/ai/explain', async (req: Request, res: Response) => {
  try {
    const { query, user_query, language } = req.body || {};
    const textQuery = query || user_query || 'Summarise today\'s plant performance.';
    const lang = language || 'en';

    const explanation = await geminiService.processIndustrialQuery(textQuery, lang);
    res.json({ explanation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI explanation error' });
  }
});

// 15. Recent MQTT messages from virtual broker
router.get('/mqtt/messages', (req: Request, res: Response) => {
  const messages = mqttService.getRecentMessages(30);
  res.json({ messages });
});

export default router;
