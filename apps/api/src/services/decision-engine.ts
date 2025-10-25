import { logger } from '../utils/logger';
import { 
  ConjunctionAlert, 
  SpaceWeatherAlert, 
  SuggestedAction, 
  Thresholds,
  DEFAULT_THRESHOLDS 
} from '@space-sa/core';

export class DecisionEngine {
  private thresholds: Thresholds;

  constructor(thresholds: Thresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
  }

  analyzeConjunction(alert: ConjunctionAlert): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    const now = new Date();
    const tca = new Date(alert.tca);

    // Check if conjunction is within 72 hours
    const hoursToTca = (tca.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursToTca > 72) {
      return actions; // Too far in the future
    }

    // Determine severity based on miss distance and probability
    let severity = 'Low';
    if (alert.miss_distance_km < this.thresholds.conjunction.warning_miss_distance_km) {
      severity = 'High';
    }
    if (alert.pc && alert.pc > this.thresholds.conjunction.critical_pc) {
      severity = 'Critical';
    }

    // Generate maneuver suggestions based on RIC analysis
    if (alert.sigma_ran_km && alert.sigma_tan_km && alert.sigma_norm_km) {
      const ricAnalysis = this.analyzeRIC(
        alert.sigma_ran_km,
        alert.sigma_tan_km,
        alert.sigma_norm_km
      );

      if (ricAnalysis.inPlaneImprovement > 0) {
        actions.push({
          id: `maneuver-${alert.primary_norad}-${Date.now()}`,
          type: 'maneuver',
          deltaV_mps: ricAnalysis.inPlaneDeltaV,
          direction: 'In-plane maneuver to increase miss distance',
          rationale: `In-plane ΔV of ${ricAnalysis.inPlaneDeltaV.toFixed(2)} m/s can improve miss distance by ${ricAnalysis.inPlaneImprovement.toFixed(2)} km`,
          expected_risk_delta: -ricAnalysis.inPlaneImprovement,
          window_start: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour from now
          window_end: new Date(tca.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour before TCA
        });
      }

      if (ricAnalysis.outOfPlaneImprovement > 0) {
        actions.push({
          id: `maneuver-${alert.primary_norad}-${Date.now() + 1}`,
          type: 'maneuver',
          deltaV_mps: ricAnalysis.outOfPlaneDeltaV,
          direction: 'Out-of-plane maneuver to increase miss distance',
          rationale: `Out-of-plane ΔV of ${ricAnalysis.outOfPlaneDeltaV.toFixed(2)} m/s can improve miss distance by ${ricAnalysis.outOfPlaneImprovement.toFixed(2)} km`,
          expected_risk_delta: -ricAnalysis.outOfPlaneImprovement,
          window_start: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
          window_end: new Date(tca.getTime() - 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Add monitoring action if no maneuvers are suggested
    if (actions.length === 0) {
      actions.push({
        id: `monitor-${alert.primary_norad}-${Date.now()}`,
        type: 'monitor',
        deltaV_mps: null,
        direction: null,
        rationale: 'Continue monitoring - no immediate action required',
        expected_risk_delta: null,
        window_start: null,
        window_end: null,
      });
    }

    return actions;
  }

  analyzeSpaceWeather(alert: SpaceWeatherAlert): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    const now = new Date();

    // Check Kp index
    if (alert.kp && alert.kp >= this.thresholds.space_weather.kp_warning) {
      actions.push({
        id: `safe-mode-kp-${Date.now()}`,
        type: 'safe_mode',
        deltaV_mps: null,
        direction: null,
        rationale: `Kp index of ${alert.kp} exceeds warning threshold of ${this.thresholds.space_weather.kp_warning}`,
        expected_risk_delta: null,
        window_start: now.toISOString(),
        window_end: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });
    }

    // Check CME ETA
    if (alert.cme_eta_start && alert.cme_eta_end) {
      const etaStart = new Date(alert.cme_eta_start);
      const etaEnd = new Date(alert.cme_eta_end);
      const hoursToEta = (etaStart.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursToEta < this.thresholds.space_weather.cme_hours_to_eta_critical) {
        actions.push({
          id: `safe-mode-cme-${Date.now()}`,
          type: 'safe_mode',
          deltaV_mps: null,
          direction: null,
          rationale: `CME expected in ${hoursToEta.toFixed(1)} hours (critical threshold: ${this.thresholds.space_weather.cme_hours_to_eta_critical} hours)`,
          expected_risk_delta: null,
          window_start: now.toISOString(),
          window_end: etaEnd.toISOString(),
        });
      }
    }

    return actions;
  }

  private analyzeRIC(
    sigmaRan: number,
    sigmaTan: number,
    sigmaNorm: number
  ): {
    inPlaneImprovement: number;
    outOfPlaneImprovement: number;
    inPlaneDeltaV: number;
    outOfPlaneDeltaV: number;
  } {
    // Simple RIC analysis for maneuver suggestions
    // This is a simplified model - in practice, you'd use more sophisticated orbital mechanics

    const inPlaneDeltaV = Math.min(sigmaTan * 0.1, 10); // Max 10 m/s
    const outOfPlaneDeltaV = Math.min(sigmaNorm * 0.1, 5); // Max 5 m/s

    const inPlaneImprovement = inPlaneDeltaV * 100; // Rough estimate
    const outOfPlaneImprovement = outOfPlaneDeltaV * 50; // Rough estimate

    return {
      inPlaneImprovement,
      outOfPlaneImprovement,
      inPlaneDeltaV,
      outOfPlaneDeltaV,
    };
  }

  updateThresholds(newThresholds: Thresholds): void {
    this.thresholds = newThresholds;
    logger.info('Decision engine thresholds updated', { thresholds: newThresholds });
  }

  getThresholds(): Thresholds {
    return this.thresholds;
  }
}
