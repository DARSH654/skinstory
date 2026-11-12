/**
 * ============================================================================
 * Stage 3: Continuous-Time State Space Skin Forecasting Engine
 * ============================================================================
 * 
 * Clinical & Mathematical Architecture (First Principles):
 * 
 * 1. Continuous-Time State-Space Formulation (Kalman / Biomedical Standard):
 *    - The user's biological state is represented by vector X(t) across 7 axes:
 *      X = [hydration, barrier, inflammation, sebum, turnover, pigmentation, edema]
 * 
 * 2. Natural Homeostatic Decay (Continuous Time Step):
 *    When time Δt passes without interventions, the state relaxes naturally toward
 *    the user's physiological baseline (X_baseline) via exponential decay:
 *      X(t + Δt) = X_baseline + (X(t) - X_baseline) * exp(-λ * Δt)
 *      where λ = ln(2) / T_half
 * 
 * 3. Discrete Impulse Updates (Event Absorption):
 *    When a clinical ticket occurs at time t (whether Question 1 flare, SPF, water, or AI custom item):
 *    The impulse vector U is absorbed into the state:
 *      X(t+) = clamp(X(t-) + U, 0.0, 1.0)
 * 
 * 4. Multi-Horizon Future Trajectory Projection (+12h, +24h, +48h, +7d, +30d):
 *    Simulates the forward trajectory from current time t_now into future horizons
 *    to detect:
 *    - Acute peaks (e.g., inflammation peaking at +36h).
 *    - Homeostatic milestones (e.g., barrier repair milestone at +7d, collagen remodeling at +30d).
 * 
 * 5. Dominant Milestone & Risk Scoring:
 *    Ranks the forecasted deviations from baseline to output:
 *    - Dominant primary axis & secondary active axes.
 *    - Exact time horizon ('tomorrow_morning', 'in_48_hours', 'in_7_days', 'in_1_month').
 *    - Structured clinical forecast metrics.
 */

import {
  SkinStateVector,
  Stage3EngineInputPayload,
} from './stage3EngineBridge';
import { SkinAxisCategory, ClinicalTriggerTicket } from './stage2IngestionBridge';

/**
 * Natural Baseline Half-Life Parameters (in hours)
 * When an impulse strikes an axis, this governs how long the body takes
 * to clear or repair that axis back toward baseline homeostasis.
 */
export const AXIS_NATURAL_HALF_LIVES: Record<SkinAxisCategory, number> = {
  hydration: 8,       // Fast water equilibrium (6-8 hours)
  edema: 12,          // Lymphatic fluid clearance (10-14 hours)
  sebum: 24,          // Sebaceous glandular cycle (18-24 hours)
  inflammation: 48,   // Cytokine cascade clearance (36-48 hours)
  barrier: 72,        // Stratum corneum lipid lamellae re-sealing (48-72 hours)
  turnover: 336,      // Epidermal transit & desquamation (14 days = 336h)
  pigmentation: 480,  // Melanosome degradation & fading (20 days = 480h)
};

/**
 * Multi-Horizon Projection Targets (in hours from now)
 */
export const FORECAST_HORIZONS = {
  tomorrow_morning: 14,
  in_48_hours: 48,
  in_7_days: 168,
  in_1_month: 720,
} as const;

export type ForecastHorizonKey = keyof typeof FORECAST_HORIZONS;

/**
 * Single Horizon Projected Skin State
 */
export interface ProjectedSkinHorizon {
  horizonKey: ForecastHorizonKey;
  horizonHours: number;
  displayLabel: string;
  stateVector: SkinStateVector;
  // Net deviation from baseline on this horizon (positive = elevated/stress, negative = improved/repaired)
  deltaFromBaseline: SkinStateVector;
  dominantAxis: SkinAxisCategory;
  dominantDelta: number;
}

/**
 * Complete Forecast Engine Output Contract
 */
export interface Stage3ForecastResult {
  // Current real-time state vector at t_now
  currentStateVector: SkinStateVector;
  baselineVector: SkinStateVector;
  // Multi-horizon projections
  horizons: Record<ForecastHorizonKey, ProjectedSkinHorizon>;
  // The #1 Winning Forecast (Highest Salience)
  winningForecast: {
    dominantAxis: SkinAxisCategory;
    horizonKey: ForecastHorizonKey;
    horizonDisplay: string;
    headline: string;
    description: string;
    severityScore: number; // 0.0 (calm) to 1.0 (critical peak)
    direction: 'improving' | 'worsening' | 'stable';
    activeDrivers: Array<{
      sourceLabel: string;
      category: SkinAxisCategory;
      hoursAgo: number;
      intensity: number;
    }>;
  };
  totalTicketsEvaluated: number;
  computedAt: number;
}

/**
 * ============================================================================
 * STATE SPACE MATHEMATICAL PRIMITIVES
 * ============================================================================
 */

/**
 * Continuous-Time Decay Step:
 * Relaxes vector X toward X_baseline over time delta deltaHours
 */
export function relaxStateTowardBaseline(
  currentState: SkinStateVector,
  baseline: SkinStateVector,
  deltaHours: number
): SkinStateVector {
  if (deltaHours <= 0) return { ...currentState };

  const result: Partial<SkinStateVector> = {};
  const axes: SkinAxisCategory[] = [
    'hydration',
    'barrier',
    'inflammation',
    'sebum',
    'turnover',
    'pigmentation',
    'edema',
  ];

  for (const axis of axes) {
    const halfLife = AXIS_NATURAL_HALF_LIVES[axis];
    const lambda = Math.LN2 / halfLife;
    const decayFactor = Math.exp(-lambda * deltaHours);

    // X(t + Δt) = X_base + (X(t) - X_base) * exp(-λ * Δt)
    const currentVal = currentState[axis];
    const baseVal = baseline[axis];
    const decayedVal = baseVal + (currentVal - baseVal) * decayFactor;

    // Clamp strictly within [0.0, 1.0]
    result[axis] = Math.max(0.0, Math.min(1.0, Math.round(decayedVal * 1000) / 1000));
  }

  return result as SkinStateVector;
}

/**
 * Calculates remaining active impulse of a ticket at a given future or elapsed hour
 * Uses natural asymmetrical bell curve: builds up toward peakHours, then decays with halfLifeHours
 */
export function evaluateTicketImpulse(
  ticket: ClinicalTriggerTicket,
  evalHoursAgo: number
): number {
  const { intensity, peakHours, halfLifeHours } = ticket;

  if (evalHoursAgo < 0) return 0; // Hasn't happened yet

  if (evalHoursAgo <= peakHours) {
    // Rising phase toward peak
    const progress = Math.max(0.1, evalHoursAgo / Math.max(1, peakHours));
    return intensity * progress;
  } else {
    // Decaying phase after peak
    const hoursPastPeak = evalHoursAgo - peakHours;
    const lambda = Math.LN2 / Math.max(1, halfLifeHours);
    const decay = Math.exp(-lambda * hoursPastPeak);
    return intensity * decay;
  }
}

/**
 * ============================================================================
 * CORE ENGINE SIMULATION: Continuous State Roll
 * ============================================================================
 * Rolls the state forward through all chronological historical tickets up to t_now.
 */
export function computeCurrentSkinState(
  payload: Stage3EngineInputPayload
): { currentState: SkinStateVector; baseline: SkinStateVector } {
  const { baselineProfile, chronologicalTickets, currentTime } = payload;
  const baseline = { ...baselineProfile.baselineVector };

  // Start at baseline at the time of the earliest ticket (or now if empty)
  let simulatedState: SkinStateVector = { ...baseline };

  if (chronologicalTickets.length === 0) {
    return { currentState: simulatedState, baseline };
  }

  let lastEventTime = chronologicalTickets[0].loggedAt;

  // Process all tickets sequentially through continuous time
  for (let i = 0; i < chronologicalTickets.length; i++) {
    const ticket = chronologicalTickets[i];

    // 1. Advance time from last event to this ticket's event time
    const timeGapHours = Math.max(0, (ticket.loggedAt - lastEventTime) / (1000 * 60 * 60));
    simulatedState = relaxStateTowardBaseline(simulatedState, baseline, timeGapHours);

    // 2. Absorb impulse into the state vector
    const currentVal = simulatedState[ticket.category];
    // Positive intensity increases category level; negative intensity decreases/protects
    const updatedVal = Math.max(0.0, Math.min(1.0, currentVal + ticket.intensity * 0.35));
    simulatedState[ticket.category] = Math.round(updatedVal * 1000) / 1000;

    lastEventTime = ticket.loggedAt;
  }

  // 3. Finally, advance from the last ticket to current time t_now
  const finalGapHours = Math.max(0, (currentTime - lastEventTime) / (1000 * 60 * 60));
  const finalState = relaxStateTowardBaseline(simulatedState, baseline, finalGapHours);

  return { currentState: finalState, baseline };
}

/**
 * ============================================================================
 * MULTI-HORIZON PROJECTION & DOMINANT HEADLINE SELECTOR
 * ============================================================================
 */
export function runStage3ForecastEngine(
  payload: Stage3EngineInputPayload
): Stage3ForecastResult {
  const { currentState, baseline } = computeCurrentSkinState(payload);
  const { chronologicalTickets, currentTime } = payload;

  const horizons: Record<ForecastHorizonKey, ProjectedSkinHorizon> = {} as any;
  const horizonKeys: ForecastHorizonKey[] = [
    'tomorrow_morning',
    'in_48_hours',
    'in_7_days',
    'in_1_month',
  ];

  const horizonLabels: Record<ForecastHorizonKey, string> = {
    tomorrow_morning: 'Tomorrow Morning',
    in_48_hours: 'In 48 Hours',
    in_7_days: 'In 7 Days',
    in_1_month: 'In 1 Month',
  };

  let maxSalienceScore = -1;
  let winningHorizonKey: ForecastHorizonKey = 'tomorrow_morning';
  let winningAxis: SkinAxisCategory = 'barrier';

  // 1. Project state forward across the 4 future horizons
  for (const hKey of horizonKeys) {
    const forwardHours = FORECAST_HORIZONS[hKey];

    // Relax from current state forward by forwardHours
    const projectedState = relaxStateTowardBaseline(currentState, baseline, forwardHours);

    // Evaluate active unresolved tickets that will hit peak or linger into this future horizon
    for (const ticket of chronologicalTickets) {
      const ticketHoursAgoNow = (currentTime - ticket.loggedAt) / (1000 * 60 * 60);
      const ticketHoursAgoAtHorizon = ticketHoursAgoNow - forwardHours;

      // If the ticket was within active impact range
      if (ticketHoursAgoAtHorizon < ticket.peakHours + ticket.halfLifeHours * 2) {
        const remainingImpulse = evaluateTicketImpulse(
          ticket,
          Math.max(0, ticketHoursAgoNow + forwardHours)
        );
        const curr = projectedState[ticket.category];
        projectedState[ticket.category] = Math.max(
          0.0,
          Math.min(1.0, curr + remainingImpulse * 0.15)
        );
      }
    }

    // Compute delta from baseline across each axis
    const deltas: Partial<SkinStateVector> = {};
    let dominantAxisForHorizon: SkinAxisCategory = 'inflammation';
    let maxAbsDelta = -1;

    const axes: SkinAxisCategory[] = [
      'hydration',
      'barrier',
      'inflammation',
      'sebum',
      'turnover',
      'pigmentation',
      'edema',
    ];

    for (const axis of axes) {
      const delta = Math.round((projectedState[axis] - baseline[axis]) * 1000) / 1000;
      deltas[axis] = delta;
      if (Math.abs(delta) > maxAbsDelta) {
        maxAbsDelta = Math.abs(delta);
        dominantAxisForHorizon = axis;
      }
    }

    horizons[hKey] = {
      horizonKey: hKey,
      horizonHours: forwardHours,
      displayLabel: horizonLabels[hKey],
      stateVector: projectedState,
      deltaFromBaseline: deltas as SkinStateVector,
      dominantAxis: dominantAxisForHorizon,
      dominantDelta: maxAbsDelta,
    };

    // Track overall winning forecast across all horizons
    // Apply clinical weighting: acute inflammation/barrier peaks have high immediate salience,
    // while sustained 1-month collagen/turnover has high long-term milestone salience
    const salienceWeight =
      hKey === 'in_48_hours' || hKey === 'tomorrow_morning' ? 1.2 : 1.0;
    const weightedSalience = maxAbsDelta * salienceWeight;

    if (weightedSalience > maxSalienceScore) {
      maxSalienceScore = weightedSalience;
      winningHorizonKey = hKey;
      winningAxis = dominantAxisForHorizon;
    }
  }

  // 2. Synthesize Winning Headline & Description
  const winningHorizon = horizons[winningHorizonKey];
  const netDelta = winningHorizon.deltaFromBaseline[winningAxis];
  const isWorsening = netDelta > 0.08;
  const isImproving = netDelta < -0.08;

  let headline = '';
  let description = '';

  switch (winningAxis) {
    case 'inflammation':
      if (isWorsening) {
        headline = `Active inflammation flare peaking ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'Elevated cytokine activity detected. Keep routines gentle and avoid picking.';
      } else {
        headline = `Inflammation calming steadily by ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'Redness and cellular reactivity are subsiding toward natural baseline.';
      }
      break;

    case 'barrier':
      if (isWorsening) {
        headline = `Transepidermal barrier vulnerability ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'Lipid matrix recovery in progress. Prioritize barrier ceramides and SPF.';
      } else {
        headline = `Barrier resilience milestone ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'Stratum corneum hydration and cellular moisture retention trending upward.';
      }
      break;

    case 'sebum':
      if (isWorsening) {
        headline = `Follicular oil surge projected ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'HPA-axis stress or lipid rebound detected. Cleanse consistently.';
      } else {
        headline = `Sebaceous balance restored by ${winningHorizon.displayLabel.toLowerCase()}`;
        description = 'T-zone oiliness is normalizing with balanced lipid production.';
      }
      break;

    case 'turnover':
      headline = `Cellular renewal milestone ${winningHorizon.displayLabel.toLowerCase()}`;
      description = isWorsening
        ? 'Dead skin corneocyte accumulation detected. Gentle exfoliation recommended.'
        : 'Epidermal transit is optimal, promoting smooth surface radiance.';
      break;

    case 'hydration':
      headline = isWorsening
        ? `Acute dehydration rebound ${winningHorizon.displayLabel.toLowerCase()}`
        : `Deep cellular hydration peak ${winningHorizon.displayLabel.toLowerCase()}`;
      description = isWorsening
        ? 'Fluid intake dropped below optimal threshold. Increase daily water intake.'
        : 'Optimal systemic and topical moisture levels reached.';
      break;

    case 'pigmentation':
      headline = isWorsening
        ? `Melanocyte UV surge risk ${winningHorizon.displayLabel.toLowerCase()}`
        : `Post-inflammatory marks fading steadily ${winningHorizon.displayLabel.toLowerCase()}`;
      description = isWorsening
        ? 'Recent sun exposure or post-breakout marks require strict daily SPF protection.'
        : 'Melanin distribution is evening out naturally across healing zones.';
      break;

    case 'edema':
    default:
      headline = isWorsening
        ? `Fluid retention & puffiness peaking ${winningHorizon.displayLabel.toLowerCase()}`
        : `Lymphatic balance restored ${winningHorizon.displayLabel.toLowerCase()}`;
      description = isWorsening
        ? 'Elevated under-eye fluid retention. Hydrate and maintain upright sleep posture.'
        : 'Facial contour and periorbital puffiness have completely subsided.';
      break;
  }

  // Active contributing drivers (last 72 hours)
  const activeDrivers = chronologicalTickets
    .filter((t) => (currentTime - t.loggedAt) / (1000 * 60 * 60) <= 72)
    .slice(-5)
    .map((t) => ({
      sourceLabel: t.sourceLabel,
      category: t.category,
      hoursAgo: Math.round(((currentTime - t.loggedAt) / (1000 * 60 * 60)) * 10) / 10,
      intensity: t.intensity,
    }));

  return {
    currentStateVector: currentState,
    baselineVector: baseline,
    horizons,
    winningForecast: {
      dominantAxis: winningAxis,
      horizonKey: winningHorizonKey,
      horizonDisplay: winningHorizon.displayLabel,
      headline,
      description,
      severityScore: Math.min(1.0, Math.round(maxSalienceScore * 100) / 100),
      direction: isWorsening ? 'worsening' : isImproving ? 'improving' : 'stable',
      activeDrivers,
    },
    totalTicketsEvaluated: chronologicalTickets.length,
    computedAt: currentTime,
  };
}
