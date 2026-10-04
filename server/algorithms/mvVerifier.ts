import { ShiftProductionRecord } from '../simulator/plantSimulator';
import { BaselineRegressionResult } from './baselineEngine';
import { DEMO_PLANT } from '../data/foundryPlant';

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

export class MvVerifier {
  /**
   * Executes deterministic IPMVP Option C verification against the calibrated baseline.
   * Compares BASELINE PERIOD (shifts 0..34) -> INTERVENTION (day 35) -> POST-INTERVENTION (shifts 35..n)
   */
  public verifyIntervention(
    actionId: string,
    actionName: string,
    baselineModel: BaselineRegressionResult,
    allShifts: ShiftProductionRecord[],
    simulatedSavingsPercent = 8.5,
    injectNoise = true
  ): MvVerificationReport {
    // Partition shifts into Baseline (first 35 shifts) and Post-Intervention (remaining 25 shifts)
    const baselineShiftCount = Math.min(35, Math.floor(allShifts.length * 0.6));
    const baselineShifts = allShifts.slice(0, baselineShiftCount);
    const postShifts = allShifts.slice(baselineShiftCount);

    const interventionDate = allShifts[baselineShiftCount]?.date || '2026-09-22';
    const interventionShift = allShifts[baselineShiftCount]?.shift || 'Shift 1';

    // Baseline Period Summary
    const baseEnergyTotal = baselineShifts.reduce((acc, s) => acc + s.total_energy_kwh, 0);
    const baseProdTotal = baselineShifts.reduce((acc, s) => acc + s.good_castings_tonnes, 0);
    const baseTempAvg = Math.round((baselineShifts.reduce((acc, s) => acc + s.avg_ambient_temp_C, 0) / (baselineShifts.length || 1)) * 10) / 10;
    const baseSecAvg = baseProdTotal > 0 ? Math.round((baseEnergyTotal / baseProdTotal) * 10) / 10 : 1100;

    let totalProd = 0;
    let totalTemp = 0;
    let totalActual = 0;
    let totalBaseline = 0;

    const seModel = baselineModel.residual_std_error || 38.4;
    const tStat = 1.96; // 95% two-tailed standard normal / student-t with df > 30

    // Compute Post-Intervention Shift Comparisons
    const shiftComparisons = postShifts.map((r, idx) => {
      // Normalised baseline for actual weather and production of this specific shift
      const exp =
        baselineModel.beta_0 +
        baselineModel.beta_production * r.good_castings_tonnes +
        baselineModel.beta_temperature * r.avg_ambient_temp_C;

      // Realistic post-intervention measured energy:
      const savingsMultiplier = 1 - simulatedSavingsPercent / 100;
      const noise = injectNoise ? Math.sin(idx * 1.7) * 24 : 0;
      const act = Math.round(exp * savingsMultiplier + noise);
      const delta = Math.round(exp - act);

      totalProd += r.good_castings_tonnes;
      totalTemp += r.avg_ambient_temp_C;
      totalActual += act;
      totalBaseline += exp;

      return {
        shift_id: r.record_id,
        date: r.date,
        production_tonnes: r.good_castings_tonnes,
        normalised_baseline_kwh: Math.round(exp),
        actual_kwh: act,
        delta_savings_kwh: delta,
      };
    });

    const n = postShifts.length || 1;
    const m = baselineShifts.length || 1;
    const avgTemp = Math.round((totalTemp / n) * 10) / 10;
    const grossSavings = Math.round(totalBaseline - totalActual);
    const grossPercent = totalBaseline > 0 ? Math.round((grossSavings / totalBaseline) * 1000) / 10 : 0;

    // IPMVP statistical uncertainty formula at 95% confidence:
    // U_95 = t * SE_model * sqrt(n * (1 + n/m))
    const sampleInflationFactor = Math.sqrt(1 + n / m);
    const uncertaintyKwh = Math.round(tStat * seModel * Math.sqrt(n) * sampleInflationFactor);
    const uncertaintyPercent = grossSavings !== 0 ? Math.round((uncertaintyKwh / Math.abs(grossSavings)) * 1000) / 10 : 0;

    const lowerBound = grossSavings - uncertaintyKwh;
    const upperBound = grossSavings + uncertaintyKwh;

    // Strict Decision Criterion:
    let status: MvVerificationReport['verification_status'] = 'INCONCLUSIVE';
    let statusExplanation = '';
    let whyExplanation: MvWhyExplanation;

    if (grossSavings > 0 && lowerBound > 0) {
      status = 'VERIFIED';
      statusExplanation = `Statistically verified at 95% confidence. Lower bound of savings (+${lowerBound.toLocaleString()} kWh) is strictly positive, proving the intervention produced measurable energy reduction beyond weather and production variance.`;
      whyExplanation = {
        title: 'Why Was This Saving Verified?',
        headline: `Gross savings of ${grossSavings.toLocaleString()} kWh (+${grossPercent}%) strictly exceed the 95% uncertainty interval.`,
        mathematical_proof: `Calculated Lower Bound (S - U₉₅ = ${grossSavings.toLocaleString()} - ${uncertaintyKwh.toLocaleString()} = +${lowerBound.toLocaleString()} kWh) is strictly greater than zero. Under IPMVP Option C, because zero is outside the 95% confidence band, we mathematically reject the null hypothesis of chance variation.`,
        normalisation_factor_explanation: `Crucial check: Post-intervention production averaged ${(totalProd / n).toFixed(2)} tonnes/shift (ambient temp ${avgTemp}°C). The regression equation adjusted expected baseline consumption upwards by ${(baselineModel.beta_production * (totalProd / n)).toFixed(0)} kWh for production and ${(baselineModel.beta_temperature * (avgTemp - 25)).toFixed(0)} kWh for ambient temperature, proving that savings came from true operational efficiency rather than lower output or cooler weather.`,
        next_recommended_action: `Issue formal Energy Efficiency Certificate; report verified ₹${Math.round(grossSavings * DEMO_PLANT.base_tariff_rs_per_kwh).toLocaleString()} cost reduction to plant executive committee and bank ESCO lenders.`,
      };
    } else if (grossSavings > 0 && lowerBound <= 0) {
      status = 'INCONCLUSIVE';
      statusExplanation = `Result inconclusive: The 95% prediction interval includes zero (${lowerBound.toLocaleString()} to +${upperBound.toLocaleString()} kWh). While average consumption decreased by ${grossPercent}%, random shift variations cannot rule out statistical noise. More shifts required.`;
      whyExplanation = {
        title: 'Why Was This Result Inconclusive?',
        headline: `Reported savings of ${grossSavings.toLocaleString()} kWh (+${grossPercent}%) fall within the ±${uncertaintyKwh.toLocaleString()} kWh uncertainty band.`,
        mathematical_proof: `The 95% prediction interval spans from ${lowerBound.toLocaleString()} kWh (negative) to +${upperBound.toLocaleString()} kWh (positive), crossing zero. According to ASHRAE Guideline 14 and IPMVP Option C, whenever zero is bounded within the confidence interval, an auditor CANNOT certify the savings as real.`,
        normalisation_factor_explanation: `While production was normalized (${(totalProd / n).toFixed(2)} t/shift), the post-intervention observation sample (n=${n} shifts) is too short to overpower unmodelled shift noise (SE = ${seModel} kWh).`,
        next_recommended_action: `Continue continuous sub-metering for an additional 20 shifts. As sample size n increases, the uncertainty band narrows by 1/√n, allowing true savings to emerge with mathematical certainty.`,
      };
    } else {
      status = 'NO_SAVING';
      statusExplanation = `No saving detected: Measured post-intervention energy exceeded the normalised baseline by ${Math.abs(grossSavings).toLocaleString()} kWh. Check for unmetered auxiliary equipment additions or process degradation.`;
      whyExplanation = {
        title: 'Why Was This Flagged as NO SAVING?',
        headline: `Measured post-intervention energy exceeded the adjusted baseline by ${Math.abs(grossSavings).toLocaleString()} kWh (-${Math.abs(grossPercent)}%).`,
        mathematical_proof: `Actual measured energy (${totalActual.toLocaleString()} kWh) > Normalised baseline (${totalBaseline.toLocaleString()} kWh). Gross savings S is negative (-${Math.abs(grossSavings).toLocaleString()} kWh).`,
        normalisation_factor_explanation: `After adjusting for actual production volume (${totalProd.toFixed(1)} tonnes) and weather (${avgTemp}°C), the plant consumed MORE energy per unit output than during the baseline period.`,
        next_recommended_action: `Initiate root-cause investigation: inspect furnace coil cooling pumps for thermal throttling, check for newly introduced unmetered welding loads, or inspect refractory lining wear.`,
      };
    }

    const verifiedKwh = status === 'VERIFIED' ? grossSavings : 0;
    const verifiedRs = Math.round(verifiedKwh * DEMO_PLANT.base_tariff_rs_per_kwh);
    const avoidedCo2 = Math.round(((verifiedKwh * DEMO_PLANT.cea_emission_factor_tco2_per_mwh) / 1000) * 10) / 10;

    // Generate Complete Visual Timeline: Baseline Period -> Intervention Point -> Post-Intervention Period
    const timelinePoints: MvTimelinePoint[] = [];

    // 1. Baseline Period Points
    baselineShifts.forEach((s, idx) => {
      const exp =
        baselineModel.beta_0 +
        baselineModel.beta_production * s.good_castings_tonnes +
        baselineModel.beta_temperature * s.avg_ambient_temp_C;

      timelinePoints.push({
        shift_id: s.record_id,
        date: s.date,
        shift_name: s.shift,
        period: 'BASELINE',
        production_tonnes: s.good_castings_tonnes,
        ambient_temp_C: s.avg_ambient_temp_C,
        actual_kwh: s.total_energy_kwh,
        expected_baseline_kwh: Math.round(exp),
        upper_bound_kwh: Math.round(exp + 1.96 * seModel),
        lower_bound_kwh: Math.round(exp - 1.96 * seModel),
        delta_kwh: Math.round(exp - s.total_energy_kwh),
        is_intervention_point: idx === baselineShifts.length - 1,
      });
    });

    // 2. Post-Intervention Period Points
    postShifts.forEach((s, idx) => {
      const exp =
        baselineModel.beta_0 +
        baselineModel.beta_production * s.good_castings_tonnes +
        baselineModel.beta_temperature * s.avg_ambient_temp_C;

      const act = shiftComparisons[idx].actual_kwh;

      timelinePoints.push({
        shift_id: s.record_id,
        date: s.date,
        shift_name: s.shift,
        period: 'POST_INTERVENTION',
        production_tonnes: s.good_castings_tonnes,
        ambient_temp_C: s.avg_ambient_temp_C,
        actual_kwh: act,
        expected_baseline_kwh: Math.round(exp),
        upper_bound_kwh: Math.round(exp + 1.96 * seModel),
        lower_bound_kwh: Math.round(exp - 1.96 * seModel),
        delta_kwh: Math.round(exp - act),
        is_intervention_point: false,
      });
    });

    return {
      verification_id: `mv-verify-${Date.now().toString().slice(-6)}`,
      action_id: actionId,
      action_name: actionName,
      reporting_period_start: postShifts[0]?.date || '2026-09-22',
      reporting_period_end: postShifts[postShifts.length - 1]?.date || '2026-10-04',
      intervention_date: `${interventionDate} (${interventionShift})`,
      evaluation_shifts_count: n,
      total_production_tonnes: Math.round(totalProd * 100) / 100,
      avg_ambient_temp_C: avgTemp,
      normalised_baseline_energy_kwh: Math.round(totalBaseline),
      actual_measured_energy_kwh: Math.round(totalActual),
      gross_savings_kwh: grossSavings,
      gross_savings_percent: grossPercent,
      uncertainty_kwh_95: uncertaintyKwh,
      uncertainty_percent: uncertaintyPercent,
      lower_bound_savings_kwh: lowerBound,
      upper_bound_savings_kwh: upperBound,
      verified_savings_kwh: verifiedKwh,
      verified_savings_rs: verifiedRs,
      avoided_co2_tonnes: avoidedCo2,
      savings_percent: simulatedSavingsPercent,
      verification_status: status,
      status_explanation: statusExplanation,
      methodology: 'IPMVP Option C (Whole Facility Normalised Regression, ASHRAE Guideline 14)',
      confidence_level_percent: 95,
      why_explanation: whyExplanation,
      baseline_period_summary: {
        shifts_count: baselineShifts.length,
        start_date: baselineShifts[0]?.date || '2026-08-01',
        end_date: baselineShifts[baselineShifts.length - 1]?.date || '2026-09-21',
        total_energy_kwh: baseEnergyTotal,
        total_production_tonnes: Math.round(baseProdTotal * 10) / 10,
        avg_sec_kwh_per_tonne: baseSecAvg,
        avg_temp_C: baseTempAvg,
        formula_equation: baselineModel.summary_equation,
      },
      intervention_summary: {
        action_name: actionName,
        date: interventionDate,
        capex_rs: 65000,
        physical_mechanism: 'Sealing 28% pneumatic leaks & automated crucible lid holding control commissioned on-site.',
      },
      timeline_points: timelinePoints,
      shift_comparisons: shiftComparisons,
    };
  }
}

export const mvVerifier = new MvVerifier();
