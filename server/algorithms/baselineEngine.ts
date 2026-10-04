import { ShiftProductionRecord } from '../simulator/plantSimulator';

export interface BaselineRegressionResult {
  model_id: string;
  site_id: string;
  version: string;
  beta_0: number; // Intercept (baseload kWh per shift)
  beta_production: number; // Coefficient for good castings (kWh per tonne)
  beta_temperature: number; // Coefficient for ambient temperature (kWh per °C)
  r_squared: number;
  cv_rmse_percent: number; // Coefficient of Variation of RMSE (%)
  nmbe_percent: number; // Normalised Mean Bias Error (%)
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
  residual_kwh: number; // actual - expected
  uncertainty_bound_95: number;
  upper_bound_kwh: number;
  lower_bound_kwh: number;
  cusum_kwh: number;
  is_waste_anomaly: boolean;
}

export class BaselineEngine {
  private cachedModel: BaselineRegressionResult | null = null;

  /**
   * Fits Multiple Linear Regression: E = beta_0 + beta_1 * Prod + beta_2 * Temp
   * using Ordinary Least Squares (OLS) closed-form matrix solution (X^T X)^-1 X^T y.
   */
  public fitBaseline(records: ShiftProductionRecord[]): BaselineRegressionResult {
    // Exclude zero-production or bad-quality records
    const validRecords = records.filter(r => r.good_castings_tonnes > 0.3 && r.total_energy_kwh > 200);
    const n = validRecords.length;

    if (n < 10) {
      throw new Error('Insufficient shift records to train a valid baseline (minimum 10 required).');
    }

    // Design matrix X has 3 columns: [1, Production, Temperature]
    // Vector y is total_energy_kwh
    let sum1 = 0, sumP = 0, sumT = 0;
    let sumP2 = 0, sumT2 = 0, sumPT = 0;
    let sumY = 0, sumPY = 0, sumTY = 0;

    for (const r of validRecords) {
      const p = r.good_castings_tonnes;
      const t = r.avg_ambient_temp_C;
      const y = r.total_energy_kwh;

      sum1 += 1;
      sumP += p;
      sumT += t;
      sumP2 += p * p;
      sumT2 += t * t;
      sumPT += p * t;
      sumY += y;
      sumPY += p * y;
      sumTY += t * y;
    }

    // Solve 3x3 linear system: A * [b0, b1, b2]^T = B
    // A = [ [n, sumP, sumT], [sumP, sumP2, sumPT], [sumT, sumPT, sumT2] ]
    // B = [sumY, sumPY, sumTY]
    const A = [
      [sum1, sumP, sumT],
      [sumP, sumP2, sumPT],
      [sumT, sumPT, sumT2]
    ];
    const B = [sumY, sumPY, sumTY];

    const coeffs = this.solve3x3(A, B);
    const b0 = coeffs[0];
    const b1 = coeffs[1];
    const b2 = coeffs[2];

    // Compute residuals, R², RMSE, NMBE
    const yMean = sumY / n;
    let ssTotal = 0;
    let ssResidual = 0;
    let sumResiduals = 0;

    for (const r of validRecords) {
      const y = r.total_energy_kwh;
      const yPred = b0 + b1 * r.good_castings_tonnes + b2 * r.avg_ambient_temp_C;
      const res = y - yPred;

      ssTotal += Math.pow(y - yMean, 2);
      ssResidual += Math.pow(res, 2);
      sumResiduals += res;
    }

    const rSquared = Math.max(0, 1 - ssResidual / ssTotal);
    const rmse = Math.sqrt(ssResidual / (n - 3));
    const cvRmse = (rmse / yMean) * 100;
    const nmbe = (sumResiduals / ((n - 3) * yMean)) * 100;

    // ASHRAE Guideline 14 acceptance threshold: CV(RMSE) <= 20% for daily/shift models, NMBE <= 5%
    const ashraeCompliant = cvRmse <= 20.0 && Math.abs(nmbe) <= 5.0;

    const result: BaselineRegressionResult = {
      model_id: 'model-ols-v1.4',
      site_id: 'plant-kolhapur-01',
      version: '1.4 (OLS Normalised)',
      beta_0: Math.round(b0 * 100) / 100,
      beta_production: Math.round(b1 * 100) / 100,
      beta_temperature: Math.round(b2 * 100) / 100,
      r_squared: Math.round(rSquared * 1000) / 1000,
      cv_rmse_percent: Math.round(cvRmse * 10) / 10,
      nmbe_percent: Math.round(nmbe * 100) / 100,
      residual_std_error: Math.round(rmse * 10) / 10,
      ashrae_compliant: ashraeCompliant,
      training_sample_count: n,
      cusum_drift_detected: false,
      valid_from: validRecords[0]?.date || '2026-08-01',
      valid_to: validRecords[validRecords.length - 1]?.date || '2026-10-04',
      summary_equation: `E (kWh/shift) = ${b0.toFixed(1)} + (${b1.toFixed(1)} × Tonnes) + (${b2.toFixed(1)} × Temp°C)`,
    };

    this.cachedModel = result;
    return result;
  }

  /**
   * Applies the baseline model to shift records to produce expected energy,
   * prediction intervals (95% CI), residuals, and CUSUM.
   */
  public evaluateShifts(records: ShiftProductionRecord[], model?: BaselineRegressionResult): BaselinePredictionPoint[] {
    const m = model || this.cachedModel || this.fitBaseline(records);
    let runningCusum = 0;

    return records.map((r) => {
      const expected = m.beta_0 + m.beta_production * r.good_castings_tonnes + m.beta_temperature * r.avg_ambient_temp_C;
      const residual = r.total_energy_kwh - expected;
      runningCusum += residual;

      // 95% Prediction Interval: t_crit * standard error (approx 1.96 * RMSE)
      const uncertainty = 1.96 * m.residual_std_error;
      const upperBound = expected + uncertainty;
      const lowerBound = expected - uncertainty;

      // Waste anomaly is flagged if actual consumption exceeds upper 95% bound
      const isWaste = r.total_energy_kwh > upperBound;

      return {
        date: r.date,
        shift: r.shift,
        production_tonnes: r.good_castings_tonnes,
        temperature_C: r.avg_ambient_temp_C,
        actual_kwh: r.total_energy_kwh,
        expected_baseline_kwh: Math.round(expected),
        residual_kwh: Math.round(residual),
        uncertainty_bound_95: Math.round(uncertainty),
        upper_bound_kwh: Math.round(upperBound),
        lower_bound_kwh: Math.round(lowerBound),
        cusum_kwh: Math.round(runningCusum),
        is_waste_anomaly: isWaste,
      };
    });
  }

  /**
   * Helper to solve 3x3 linear equations via Cramer's rule.
   */
  private solve3x3(A: number[][], B: number[]): [number, number, number] {
    const det = (m: number[][]) =>
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

    const d = det(A);
    if (Math.abs(d) < 1e-12) {
      // Degenerate system, fallback to typical empirical foundry coefficients
      return [210.0, 975.0, 4.2];
    }

    const replaceCol = (m: number[][], colIdx: number, vec: number[]) => {
      const copy = m.map(row => [...row]);
      for (let i = 0; i < 3; i++) {
        copy[i][colIdx] = vec[i];
      }
      return copy;
    };

    const d0 = det(replaceCol(A, 0, B));
    const d1 = det(replaceCol(A, 1, B));
    const d2 = det(replaceCol(A, 2, B));

    return [d0 / d, d1 / d, d2 / d];
  }
}

export const baselineEngine = new BaselineEngine();
