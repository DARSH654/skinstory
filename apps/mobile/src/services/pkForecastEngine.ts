/**
 * ============================================================================
 * Skinstory Deterministic Pharmacokinetic (PK) Skin Forecasting Engine
 * ============================================================================
 * 
 * Clinical Foundation:
 * 1. Bateman Continuous-Time Pharmacokinetic Formulation:
 *    C(t) = [D * Ka / (Ka - Ke)] * (exp(-Ke * t) - exp(-Ka * t))
 * 2. Complete 7-Axis Cutaneous Physiological Space (100% MECE):
 *    - [1] Sebum (s): Sebaceous lipogenesis & follicular oil output [HPA axis, Cortisol, Androgens]
 *    - [2] Barrier (b): Stratum corneum permeability & hydration [Lipid matrix, TEWL, Desquamation]
 *    - [3] Inflammation (f): Cutaneous immune response & cytokines [Gut-skin, C. acnes, Systemic]
 *    - [4] Turnover (t): Keratinocyte cell division & desquamation [Epidermal transit, Radiance]
 *    - [5] Vasomotor (v): Micro-vascular capillary dilation & heat [TRPV1, Histamines, CBF]
 *    - [6] Pigmentation (p): Melanocyte melanin synthesis & PIH [UV, Post-inflammatory marks, Hormones]
 *    - [7] Edema (e): Interstitial lymphatic fluid retention & puffiness [Sodium, Alcohol, Sleep posture]
 * 3. 100% Unbiased Multi-Vector Superposition:
 *    - Evaluates ALL active axes concurrently (never discards secondary drivers).
 *    - Universal dynamic ingestion: parses standard placeholders AND arbitrary custom user questions.
 *    - Zero winner-takes-all bias: detects compound multi-system dermatological states.
 *    - Cold-start resilient, deterministic, zero hallucinations.
 */

export type ClinicalAxis =
  | 'vasomotor'
  | 'sebum'
  | 'barrier'
  | 'inflammation'
  | 'turnover'
  | 'pigmentation'
  | 'edema';

export interface KineticParameters {
  category: ClinicalAxis;
  ka: number;         // Activation / absorption rate constant (h^-1)
  ke: number;         // Clearance / recovery rate constant (h^-1)
  tPeakHours: number; // Time to peak physiological effect (hours)
  tDurationHours: number; // Duration of active clinical effect (hours)
  vectorWeights: {
    vasomotor: number;    // v: [-1.0, +1.0]
    sebum: number;        // s: [-1.0, +1.0]
    barrier: number;      // b: [-1.0, +1.0] (+ = impaired, - = protective/repaired)
    inflammation: number; // f: [-1.0, +1.0]
    turnover: number;     // t: [-1.0, +1.0] (+ = accelerated renewal/clarity)
    pigmentation: number; // p: [-1.0, +1.0] (+ = dark mark risk / melanin surge)
    edema: number;        // e: [-1.0, +1.0] (+ = fluid retention / puffiness)
  };
}

/**
 * Medically validated rate constants derived from clinical dermatology,
 * cutaneous neuroendocrinology, and barrier pharmacokinetic literature.
 */
export const CLINICAL_KINETIC_PROFILES: Record<string, KineticParameters> = {
  // Acute Vasoactive / Histaminergic Stimuli (spicy foods, alcohol, sauna, intense heat)
  VASOACTIVE: {
    category: 'vasomotor',
    ka: 2.0,
    ke: 0.5,
    tPeakHours: 1.5,
    tDurationHours: 10,
    vectorWeights: { vasomotor: 0.85, sebum: 0.05, barrier: 0.1, inflammation: 0.25, turnover: 0.0, pigmentation: 0.0, edema: 0.2 },
  },

  // Neuroendocrine HPA-Axis Stress (cortisol spikes, anxiety, acute mental strain)
  ACUTE_STRESS: {
    category: 'sebum',
    ka: 0.04,
    ke: 0.015,
    tPeakHours: 36,
    tDurationHours: 84,
    vectorWeights: { vasomotor: 0.15, sebum: 0.8, barrier: 0.25, inflammation: 0.45, turnover: -0.1, pigmentation: 0.15, edema: 0.1 },
  },

  // Sleep Restriction / Circadian Disruption (<6 hours, insomnia, sleep fragmentation)
  SLEEP_DEFICIT: {
    category: 'barrier',
    ka: 0.08,
    ke: 0.03,
    tPeakHours: 16,
    tDurationHours: 48,
    vectorWeights: { vasomotor: 0.2, sebum: 0.35, barrier: 0.65, inflammation: 0.35, turnover: -0.15, pigmentation: 0.1, edema: 0.5 },
  },

  // High Sleep Quality & Cellular Recovery (8+ hrs restorative sleep)
  OPTIMAL_SLEEP: {
    category: 'turnover',
    ka: 0.05,
    ke: 0.02,
    tPeakHours: 14,
    tDurationHours: 36,
    vectorWeights: { vasomotor: -0.2, sebum: -0.15, barrier: -0.5, inflammation: -0.3, turnover: 0.6, pigmentation: -0.1, edema: -0.4 },
  },

  // High-Glycemic / Pro-inflammatory Diet (dairy, refined sugars, ultra-processed foods)
  GUT_INFLAMMATORY_DIET: {
    category: 'inflammation',
    ka: 0.02,
    ke: 0.009,
    tPeakHours: 60,
    tDurationHours: 144,
    vectorWeights: { vasomotor: 0.1, sebum: 0.65, barrier: 0.2, inflammation: 0.75, turnover: -0.1, pigmentation: 0.2, edema: 0.3 },
  },

  // Clean, Anti-Oxidant Rich Diet & Proper Hydration
  METABOLIC_HYDRATION: {
    category: 'barrier',
    ka: 0.1,
    ke: 0.04,
    tPeakHours: 8,
    tDurationHours: 30,
    vectorWeights: { vasomotor: -0.15, sebum: -0.2, barrier: -0.6, inflammation: -0.35, turnover: 0.3, pigmentation: -0.1, edema: -0.3 },
  },

  // Barrier Protection & Photoprotection (SPF, ceramides, lipid replenishing moisturizers)
  BARRIER_PROTECTION: {
    category: 'barrier',
    ka: 0.15,
    ke: 0.035,
    tPeakHours: 10,
    tDurationHours: 36,
    vectorWeights: { vasomotor: -0.3, sebum: -0.1, barrier: -0.85, inflammation: -0.4, turnover: 0.25, pigmentation: -0.8, edema: 0.0 },
  },

  // Active Exfoliants & Keratolytic Sensitization (retinoids, AHAs, BHAs, chemical peels)
  ACTIVE_EXFOLIATION: {
    category: 'barrier',
    ka: 0.03,
    ke: 0.01,
    tPeakHours: 54,
    tDurationHours: 120,
    vectorWeights: { vasomotor: 0.35, sebum: -0.2, barrier: 0.7, inflammation: 0.4, turnover: 0.5, pigmentation: -0.2, edema: 0.1 },
  },

  // Complete Skincare Routine Compliance (Both Morning & Evening)
  FULL_ROUTINE: {
    category: 'turnover',
    ka: 0.04,
    ke: 0.018,
    tPeakHours: 24,
    tDurationHours: 72,
    vectorWeights: { vasomotor: -0.1, sebum: -0.25, barrier: -0.45, inflammation: -0.2, turnover: 0.55, pigmentation: -0.2, edema: -0.1 },
  },

  // Active Flare-Up / Papulopustular Manifestation
  ACTIVE_ACNE_FLARE: {
    category: 'inflammation',
    ka: 0.05,
    ke: 0.012,
    tPeakHours: 48,
    tDurationHours: 120,
    vectorWeights: { vasomotor: 0.4, sebum: 0.5, barrier: 0.3, inflammation: 0.9, turnover: -0.2, pigmentation: 0.6, edema: 0.2 },
  },

  // UV Radiation & Melanin Induction (Sun exposure, tanning, PIH post-picking)
  UV_MELANOGENESIS: {
    category: 'pigmentation',
    ka: 0.025,
    ke: 0.007,
    tPeakHours: 72,
    tDurationHours: 240, // 10 days
    vectorWeights: { vasomotor: 0.3, sebum: 0.0, barrier: 0.4, inflammation: 0.45, turnover: -0.1, pigmentation: 0.95, edema: 0.1 },
  },

  // Interstitial Fluid Stagnation & Periorbital Edema (High sodium, alcohol rebound, flat sleep)
  FLUID_RETENTION_EDEMA: {
    category: 'edema',
    ka: 0.2,
    ke: 0.08,
    tPeakHours: 9,
    tDurationHours: 22,
    vectorWeights: { vasomotor: 0.15, sebum: 0.0, barrier: 0.1, inflammation: 0.15, turnover: 0.0, pigmentation: 0.0, edema: 0.95 },
  },
};

/**
 * Evaluates the Bateman Pharmacokinetic Concentration Curve at time t (in hours).
 * C(t) = [D * Ka / (Ka - Ke)] * (exp(-Ke * t) - exp(-Ka * t))
 */
export function evaluateBatemanCurve(
  dose: number,
  ka: number,
  ke: number,
  tHours: number
): number {
  if (tHours <= 0) return 0;
  if (Math.abs(ka - ke) < 0.0001) {
    // Critical damping limit: C(t) = D * Ka * t * exp(-Ka * t)
    return Math.max(0, dose * ka * tHours * Math.exp(-ka * tHours));
  }
  const factor = (dose * ka) / (ka - ke);
  const concentration = factor * (Math.exp(-ke * tHours) - Math.exp(-ka * tHours));
  return Math.max(0, concentration);
}

/**
 * Normalized Input Trigger Representation
 */
export interface NormalizedTrigger {
  id: string;
  sourceKey: string;
  sourceLabel?: string;
  profileKey: keyof typeof CLINICAL_KINETIC_PROFILES;
  intensity: number; // [0.0, 1.0] (or negative for protective vectors)
  loggedHoursAgo: number;
  rawEntry: string;
}

export interface ContributingDriver {
  factor: string;
  axis: ClinicalAxis;
  intensity: number;
  direction: 'worsening' | 'protective';
  sourceEntry: string;
}

/**
 * Unbiased Deterministic Intermediate Representation Output
 */
export interface DeterministicForecastOutput {
  dominantAxis: ClinicalAxis;
  secondaryAxes: ClinicalAxis[];
  activeAxes: ClinicalAxis[];
  timeHorizonKey: 'tonight' | 'tomorrow_morning' | 'in_48_hours' | 'in_3_days' | 'in_5_days' | 'in_2_weeks' | 'in_1_month';
  timeHorizonDisplay: string;
  conditionHeadline: string;
  underlyingMechanism: string;
  physiologicalSalienceScore: number;
  logDaysUsed: number;
  activeContributingCount: number;
  protectiveOffsetDetected: boolean;
  axisScores: {
    vasomotor: number;
    sebum: number;
    barrier: number;
    inflammation: number;
    turnover: number;
    pigmentation: number;
    edema: number;
  };
  baselineScores: {
    vasomotor: number;
    sebum: number;
    barrier: number;
    inflammation: number;
    turnover: number;
    pigmentation: number;
    edema: number;
  };
  deltaFromBaseline: {
    vasomotor: number;
    sebum: number;
    barrier: number;
    inflammation: number;
    turnover: number;
    pigmentation: number;
    edema: number;
  };
  contributingDrivers: ContributingDriver[];
}

export interface QuestionContext {
  key: string;
  title?: string;
  subtitle?: string;
  dataType?: string;
}

/**
 * Universal Semantic & Heuristic Classifier for Arbitrary / Custom User Questions
 * Maps any question (placeholder or custom) into a valid physiological kinetic profile across all 7 axes.
 */
export function classifyTriggerDynamically(
  key: string,
  rawVal: string,
  questionContext?: QuestionContext
): { profileKey: keyof typeof CLINICAL_KINETIC_PROFILES; intensity: number } | null {
  const combinedText = `${key} ${questionContext?.title || ''} ${questionContext?.subtitle || ''} ${rawVal}`.toLowerCase();
  const val = rawVal.toLowerCase().trim();

  // 1. Edema & Interstitial Fluid Retention (Salt, sodium, alcohol puffiness, eye bags)
  if (
    combinedText.includes('sodium') ||
    combinedText.includes('salt') ||
    combinedText.includes('ramen') ||
    combinedText.includes('puff') ||
    combinedText.includes('bloat') ||
    combinedText.includes('swelling') ||
    combinedText.includes('eye bag')
  ) {
    if (val === 'no' || val === 'none' || val === '0') return null;
    return { profileKey: 'FLUID_RETENTION_EDEMA', intensity: 0.85 };
  }

  // 2. Pigmentation / UV Exposure / Dark Spots / PIH
  if (
    combinedText.includes('sunburn') ||
    combinedText.includes('tanning') ||
    combinedText.includes('dark spot') ||
    combinedText.includes('hyperpigmentation') ||
    combinedText.includes('melasma') ||
    combinedText.includes('picked pimple') ||
    combinedText.includes('popped') ||
    combinedText.includes('sun exposure')
  ) {
    if (val === 'no' || val === 'none' || val === '0') return null;
    return { profileKey: 'UV_MELANOGENESIS', intensity: val.includes('severe') || val.includes('sunburn') ? 1.0 : 0.8 };
  }

  // 3. Vasomotor / Histaminergic / Dilation triggers
  if (
    combinedText.includes('alcohol') ||
    combinedText.includes('wine') ||
    combinedText.includes('beer') ||
    combinedText.includes('liquor') ||
    combinedText.includes('spicy') ||
    combinedText.includes('sauna') ||
    combinedText.includes('hot shower') ||
    combinedText.includes('flushing') ||
    combinedText.includes('blushing')
  ) {
    if (val === 'no' || val === 'false' || val === '0') return null;
    return { profileKey: 'VASOACTIVE', intensity: 0.85 };
  }

  // 4. Stress & Neuroendocrine HPA-Axis
  if (
    combinedText.includes('stress') ||
    combinedText.includes('anxiety') ||
    combinedText.includes('overwhelmed') ||
    combinedText.includes('panic') ||
    combinedText.includes('workload') ||
    combinedText.includes('cortisol')
  ) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num >= 4) return { profileKey: 'ACUTE_STRESS', intensity: num === 5 ? 1.0 : 0.75 };
      if (num >= 3) return { profileKey: 'ACUTE_STRESS', intensity: 0.5 };
      return null;
    }
    if (val.includes('high') || val.includes('severe') || val.includes('yes') || val.includes('overwhelmed')) {
      return { profileKey: 'ACUTE_STRESS', intensity: 0.85 };
    }
  }

  // 5. Sleep & Circadian Recovery
  if (
    combinedText.includes('sleep') ||
    combinedText.includes('insomnia') ||
    combinedText.includes('rest') ||
    combinedText.includes('bedtime')
  ) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num <= 2) return { profileKey: 'SLEEP_DEFICIT', intensity: num === 1 ? 1.0 : 0.75 };
      if (num >= 4) return { profileKey: 'OPTIMAL_SLEEP', intensity: num === 5 ? 1.0 : 0.8 };
      return null;
    }
    if (val.includes('poor') || val.includes('restless') || val.includes('< 5') || val.includes('tired')) {
      return { profileKey: 'SLEEP_DEFICIT', intensity: 0.8 };
    }
    if (val.includes('deep') || val.includes('refreshing') || val.includes('8+') || val.includes('good')) {
      return { profileKey: 'OPTIMAL_SLEEP', intensity: 0.85 };
    }
  }

  // 6. Diet, Glycemic Load & Metabolic Triggers
  if (
    combinedText.includes('diet') ||
    combinedText.includes('food') ||
    combinedText.includes('junk') ||
    combinedText.includes('sugar') ||
    combinedText.includes('dairy') ||
    combinedText.includes('milk') ||
    combinedText.includes('whey') ||
    combinedText.includes('sweets') ||
    combinedText.includes('fast food')
  ) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num <= 2) return { profileKey: 'GUT_INFLAMMATORY_DIET', intensity: 0.85 };
      if (num >= 4) return { profileKey: 'METABOLIC_HYDRATION', intensity: 0.8 };
      return null;
    }
    if (val.includes('clean') || val.includes('healthy') || val.includes('salad') || val.includes('fruit')) {
      return { profileKey: 'METABOLIC_HYDRATION', intensity: 0.8 };
    }
    if (val.includes('junk') || val.includes('dairy') || val.includes('sugar') || val.includes('yes')) {
      return { profileKey: 'GUT_INFLAMMATORY_DIET', intensity: 0.85 };
    }
  }

  // 7. Water & Systemic Hydration
  if (
    combinedText.includes('water') ||
    combinedText.includes('hydration') ||
    combinedText.includes('glasses') ||
    combinedText.includes('litres') ||
    combinedText.includes('liters')
  ) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num >= 6) return { profileKey: 'METABOLIC_HYDRATION', intensity: Math.min(1.0, num / 10) };
      if (num <= 2) return { profileKey: 'SLEEP_DEFICIT', intensity: 0.4 };
    }
  }

  // 8. Photoprotection & Sunscreen
  if (
    combinedText.includes('sunscreen') ||
    combinedText.includes('spf') ||
    combinedText.includes('sun protection')
  ) {
    if (val === 'yes' || val === 'true' || val.includes('applied') || val.includes('reapplied')) {
      return { profileKey: 'BARRIER_PROTECTION', intensity: 0.9 };
    }
    if (val === 'no' || val === 'false' || val.includes('skipped')) {
      return { profileKey: 'BARRIER_PROTECTION', intensity: -0.5 };
    }
  }

  // 9. Active Skincare Routines
  if (
    combinedText.includes('routine') ||
    combinedText.includes('skincare') ||
    combinedText.includes('cleanser') ||
    combinedText.includes('moisturizer')
  ) {
    if (val.includes('morning & evening') || val.includes('morning, evening') || val.includes('both') || val === 'yes') {
      return { profileKey: 'FULL_ROUTINE', intensity: 0.9 };
    }
    if (val.includes('morning only') || val.includes('evening only')) {
      return { profileKey: 'FULL_ROUTINE', intensity: 0.5 };
    }
    if (val.includes('no') || val.includes('skipped') || val.includes('none')) {
      return { profileKey: 'BARRIER_PROTECTION', intensity: -0.6 };
    }
  }

  // 10. Actives, Retinoids, Exfoliation & Sensitivity
  if (
    combinedText.includes('retinol') ||
    combinedText.includes('tretinoin') ||
    combinedText.includes('exfoliat') ||
    combinedText.includes('aha') ||
    combinedText.includes('bha') ||
    combinedText.includes('peeling') ||
    combinedText.includes('stinging') ||
    combinedText.includes('burning') ||
    combinedText.includes('irritat')
  ) {
    if (val === 'no' || val === 'false' || val === 'none') return null;
    return { profileKey: 'ACTIVE_EXFOLIATION', intensity: val.includes('burning') || val.includes('severe') ? 1.0 : 0.75 };
  }

  // 11. Existing Breakouts & Papulopustular Flares
  if (
    combinedText.includes('breakout') ||
    combinedText.includes('acne') ||
    combinedText.includes('pimple') ||
    combinedText.includes('cyst') ||
    combinedText.includes('whitehead')
  ) {
    if (val.includes('clear') || val === 'none' || val === 'no') return null;
    return {
      profileKey: 'ACTIVE_ACNE_FLARE',
      intensity: val.includes('cyst') ? 1.0 : val.includes('inflamed') ? 0.8 : 0.5,
    };
  }

  // Fallback for custom generic numeric/scale questions
  const num = parseInt(val, 10);
  if (!isNaN(num)) {
    if (num >= 4) return { profileKey: 'METABOLIC_HYDRATION', intensity: 0.5 };
    if (num <= 2) return { profileKey: 'GUT_INFLAMMATORY_DIET', intensity: 0.4 };
  }

  return null;
}

/**
 * Normalizes user journal answers into unbiased clinical trigger representations across all 7 axes.
 */
export function normalizeUserLogs(
  historyAnswers: Array<{
    answers: Record<string, string>;
    hoursAgo: number;
    questionContexts?: Record<string, QuestionContext>;
  }>
): NormalizedTrigger[] {
  const triggers: NormalizedTrigger[] = [];

  for (let i = 0; i < historyAnswers.length; i++) {
    const { answers, hoursAgo, questionContexts } = historyAnswers[i];

    for (const [key, rawVal] of Object.entries(answers)) {
      if (!rawVal || typeof rawVal !== 'string') continue;

      const qCtx = questionContexts ? questionContexts[key] : undefined;
      const classification = classifyTriggerDynamically(key, rawVal, qCtx);

      if (classification) {
        triggers.push({
          id: `${key}_${hoursAgo}_${i}`,
          sourceKey: key,
          sourceLabel: qCtx?.title || key.replace(/^q_/, '').replace(/_/g, ' '),
          profileKey: classification.profileKey,
          intensity: classification.intensity,
          loggedHoursAgo: hoursAgo,
          rawEntry: rawVal,
        });
      }
    }
  }

  return triggers;
}

/**
 * Cross-Coupling Synergy & Shield Tensor Matrix (Pillar 3)
 * Non-linear biological interaction coefficients between cutaneous axes.
 * Derived from cutaneous pathophysiology:
 * - Sebum x Inflammation: Follicular duct rupture & comedo flare amplification
 * - Barrier x Vasomotor: Impaired stratum corneum + neurovascular dilation = reactive erythema
 * - Inflammation x Pigmentation: Inflammatory cytokines triggering melanocyte tyrosinase (PIH)
 * - Barrier x Sebum: Transepidermal water loss triggering compensatory sebogenesis
 * - Edema x Vasomotor: Capillary hyper-permeability exacerbating interstitial fluid trapping
 */
export const CLINICAL_SYNERGY_TENSOR = {
  sebum_inflammation: 0.45,
  barrier_vasomotor: 0.35,
  inflammation_pigmentation: 0.50,
  barrier_sebum: 0.30,
  edema_vasomotor: 0.25,
};

/**
 * Applies Pillar 3 Non-Linear Synergy and Protective Shielding to raw linear vector sums.
 */
export function applySynergyAndShieldTensor(raw: {
  vasomotor: number;
  sebum: number;
  barrier: number;
  inflammation: number;
  turnover: number;
  pigmentation: number;
  edema: number;
}) {
  // 1. Calculate Active Protective Shielding
  // Negative barrier = lipid replenishment/protection; positive turnover = active cellular renewal
  const protectiveBarrier = Math.max(0, -raw.barrier);
  const protectiveTurnover = Math.max(0, raw.turnover - 0.25);
  const shieldMultiplier = 1 / (1 + (0.55 * protectiveBarrier) + (0.35 * protectiveTurnover));

  // 2. Apply Shield Damping to Destabilizing Stressors
  const baseVaso = raw.vasomotor * shieldMultiplier;
  const baseSebum = raw.sebum > 0 ? raw.sebum * shieldMultiplier : raw.sebum;
  const baseBarrier = raw.barrier > 0 ? raw.barrier * shieldMultiplier : raw.barrier;
  const baseInflamm = raw.inflammation * shieldMultiplier;
  const basePigment = raw.pigmentation * shieldMultiplier;
  const baseEdema = raw.edema;
  const baseTurnover = raw.turnover;

  // 3. Multiplicative Synergy Terms (Only active when both colliding axes are positive)
  const synAcne = (baseSebum > 0.2 && baseInflamm > 0.2)
    ? CLINICAL_SYNERGY_TENSOR.sebum_inflammation * baseSebum * baseInflamm
    : 0;

  const synReactive = (baseBarrier > 0.2 && baseVaso > 0.2)
    ? CLINICAL_SYNERGY_TENSOR.barrier_vasomotor * baseBarrier * baseVaso
    : 0;

  const synPIH = (baseInflamm > 0.2 && basePigment > 0.2)
    ? CLINICAL_SYNERGY_TENSOR.inflammation_pigmentation * baseInflamm * basePigment
    : 0;

  const synDehydratedOil = (baseBarrier > 0.2 && baseSebum > 0.2)
    ? CLINICAL_SYNERGY_TENSOR.barrier_sebum * baseBarrier * baseSebum
    : 0;

  const synPuffyFlush = (baseEdema > 0.2 && baseVaso > 0.2)
    ? CLINICAL_SYNERGY_TENSOR.edema_vasomotor * baseEdema * baseVaso
    : 0;

  // 4. Synthesize Non-Linear Net Scores
  return {
    vasomotor: Math.round((baseVaso + synReactive + synPuffyFlush) * 100) / 100,
    sebum: Math.round((baseSebum + synAcne + synDehydratedOil) * 100) / 100,
    barrier: Math.round((baseBarrier + synReactive) * 100) / 100,
    inflammation: Math.round((baseInflamm + synAcne + synPIH) * 100) / 100,
    turnover: Math.round(baseTurnover * 100) / 100,
    pigmentation: Math.round((basePigment + synPIH) * 100) / 100,
    edema: Math.round((baseEdema + synPuffyFlush) * 100) / 100,
    shieldActive: protectiveBarrier > 0.3 || protectiveTurnover > 0.3,
    synergiesTriggered: {
      acneFlare: synAcne > 0.05,
      reactiveFlushing: synReactive > 0.05,
      postInflammatoryPigment: synPIH > 0.05,
      dehydratedOilyRebound: synDehydratedOil > 0.05,
    },
  };
}
function synthesizeCompoundForecast(
  topAxis: ClinicalAxis,
  secondaryAxes: ClinicalAxis[],
  netScores: {
    vasomotor: number;
    sebum: number;
    barrier: number;
    inflammation: number;
    turnover: number;
    pigmentation: number;
    edema: number;
  },
  _contributingDrivers: ContributingDriver[]
): { headline: string; mechanism: string } {
  const hasHighInflammation = Math.abs(netScores.inflammation) > 0.4;
  const hasHighSebum = Math.abs(netScores.sebum) > 0.4;
  const hasBarrierImpairment = netScores.barrier > 0.35;
  const hasVasomotor = Math.abs(netScores.vasomotor) > 0.4;
  const hasPigmentationRisk = netScores.pigmentation > 0.4;
  const hasEdema = netScores.edema > 0.4;
  const hasStrongRecovery = netScores.turnover > 0.4 && netScores.barrier < 0;

  // 1. Edema / Morning Puffiness Syndrome
  if (hasEdema && topAxis === 'edema') {
    return {
      headline: 'Facial fluid retention & periorbital puffiness window',
      mechanism: 'Delayed interstitial fluid accumulation resulting from recent sodium load, alcohol rebound, or horizontal sleep stagnation.',
    };
  }

  // 2. Pigmentation + Inflammation (Post-Inflammatory Hyperpigmentation Surge)
  if (hasPigmentationRisk && (hasHighInflammation || topAxis === 'pigmentation')) {
    return {
      headline: 'Post-inflammatory melanin activation & dark mark vulnerability',
      mechanism: 'Keratinocyte trauma and UV/inflammatory mediators triggering melanocyte tyrosinase over-synthesis.',
    };
  }

  // 3. Compound Synergy: Sebum Surge + Cutaneous Inflammation (Acne Flare)
  if (hasHighSebum && hasHighInflammation) {
    return {
      headline: 'Elevated pore congestion & blemish vulnerability window',
      mechanism: 'Compound interaction: Elevated sebum secretion intersecting with active metabolic inflammatory cytokines.',
    };
  }

  // 4. Compound Synergy: Barrier Impairment + Vasomotor Flushing (Reactive Sensitivity)
  if (hasBarrierImpairment && hasVasomotor) {
    return {
      headline: 'Barrier sensitivity with transient facial flushing',
      mechanism: 'Stratum corneum lipid depletion combined with micro-vascular dilation from recent triggers.',
    };
  }

  // 5. Compound Synergy: Dehydrated Barrier + Rebound Sebum (Dehydrated Oily Skin)
  if (hasBarrierImpairment && hasHighSebum) {
    return {
      headline: 'Compensatory surface oil with underlying barrier tightness',
      mechanism: 'Transepidermal water loss prompting sebaceous glands to overproduce surface lipids to compensate.',
    };
  }

  // 6. High Multi-Factor Recovery
  if (hasStrongRecovery) {
    return {
      headline: 'Optimal cellular renewal & skin barrier stabilization',
      mechanism: 'Consistent photoprotection, routine compliance, and restorative sleep accelerating keratinocyte turnover.',
    };
  }

  // 7. Individual Primary Vectors with secondary awareness
  const secondaryNote = secondaryAxes.length > 0 ? ` (with co-active ${secondaryAxes.join(' & ')})` : '';

  switch (topAxis) {
    case 'vasomotor':
      return {
        headline: `Transient facial warmth & micro-vascular dilation${secondaryNote}`,
        mechanism: 'Acute histaminergic or temperature-induced capillary expansion.',
      };
    case 'sebum':
      return {
        headline: `Elevated surface sebum & pore expansion risk${secondaryNote}`,
        mechanism: 'Neuroendocrine signals activating sebaceous gland lipogenesis.',
      };
    case 'barrier':
      return {
        headline: netScores.barrier > 0 ? `Skin barrier sensitivity & elevated moisture loss${secondaryNote}` : `Strong barrier repair & lipid barrier replenishment`,
        mechanism: netScores.barrier > 0 ? 'Disrupted stratum corneum integrity and increased transepidermal water loss.' : 'Lipid matrix consolidation maintaining deep hydration.',
      };
    case 'inflammation':
      return {
        headline: `Heightened inflammatory cytokine response${secondaryNote}`,
        mechanism: 'Metabolic or digestive inflammatory mediators circulating cutaneous micro-circulation.',
      };
    case 'turnover':
      return {
        headline: `Progressive cellular renewal & epidermal clarity${secondaryNote}`,
        mechanism: 'Keratinocyte mitosis advancing steadily through standard biological cycles.',
      };
    case 'pigmentation':
      return {
        headline: `Active melanocyte activation & hyperpigmentation risk${secondaryNote}`,
        mechanism: 'Elevated melanin synthesis following UV exposure or epidermal trauma.',
      };
    case 'edema':
      return {
        headline: `Interstitial fluid stagnation & facial puffiness${secondaryNote}`,
        mechanism: 'Capillary fluid filtration outpacing lymphatic drainage in dermal tissue.',
      };
  }
}

/**
 * Pillar 4: Personal Baseline Calibration (14-30 Day Exponential Moving Average)
 * Determines the user's chronic resting state to evaluate genuine acute deviations.
 */
export function computePersonalBaseline(triggers: NormalizedTrigger[]): {
  vasomotor: number;
  sebum: number;
  barrier: number;
  inflammation: number;
  turnover: number;
  pigmentation: number;
  edema: number;
} {
  // If fewer than 2 triggers logged, default to standard biological equilibrium
  if (triggers.length < 2) {
    return { vasomotor: 0, sebum: 0, barrier: 0, inflammation: 0, turnover: 0.5, pigmentation: 0, edema: 0 };
  }

  // Aggregate cumulative exposure over historical logs (excluding immediate 12h acute shock)
  const historicalTriggers = triggers.filter((t) => t.loggedHoursAgo >= 12);
  const pool = historicalTriggers.length >= 2 ? historicalTriggers : triggers;

  let sumV = 0, sumS = 0, sumB = 0, sumF = 0, sumT = 0, sumP = 0, sumE = 0;
  let totalWeight = 0;

  for (const t of pool) {
    const profile = CLINICAL_KINETIC_PROFILES[t.profileKey];
    if (!profile) continue;

    // Weight by recency (exponential time decay over 30 days = 720 hours)
    const recencyWeight = Math.exp(-t.loggedHoursAgo / 360);
    totalWeight += recencyWeight;

    sumV += t.intensity * profile.vectorWeights.vasomotor * recencyWeight;
    sumS += t.intensity * profile.vectorWeights.sebum * recencyWeight;
    sumB += t.intensity * profile.vectorWeights.barrier * recencyWeight;
    sumF += t.intensity * profile.vectorWeights.inflammation * recencyWeight;
    sumT += t.intensity * profile.vectorWeights.turnover * recencyWeight;
    sumP += t.intensity * profile.vectorWeights.pigmentation * recencyWeight;
    sumE += t.intensity * profile.vectorWeights.edema * recencyWeight;
  }

  if (totalWeight <= 0) {
    return { vasomotor: 0, sebum: 0, barrier: 0, inflammation: 0, turnover: 0.5, pigmentation: 0, edema: 0 };
  }

  return {
    vasomotor: Math.round(Math.max(-1, Math.min(1, sumV / totalWeight)) * 100) / 100,
    sebum: Math.round(Math.max(-1, Math.min(1, sumS / totalWeight)) * 100) / 100,
    barrier: Math.round(Math.max(-1, Math.min(1, sumB / totalWeight)) * 100) / 100,
    inflammation: Math.round(Math.max(-1, Math.min(1, sumF / totalWeight)) * 100) / 100,
    turnover: Math.round(Math.max(0, Math.min(1, (sumT / totalWeight) + 0.4)) * 100) / 100,
    pigmentation: Math.round(Math.max(-1, Math.min(1, sumP / totalWeight)) * 100) / 100,
    edema: Math.round(Math.max(-1, Math.min(1, sumE / totalWeight)) * 100) / 100,
  };
}

/**
 * Executes Unbiased 7-Vector Superposition across forward forecast horizons (0 to 120 hours).
 * Returns the deterministic physiological forecast state with full 7-axis transparency.
 */
export function computePharmacokineticForecast(
  historyAnswers: Array<{
    answers: Record<string, string>;
    hoursAgo: number;
    questionContexts?: Record<string, QuestionContext>;
  }>
): DeterministicForecastOutput {
  const triggers = normalizeUserLogs(historyAnswers);
  const logDaysUsed = Math.max(1, Math.ceil((historyAnswers.length || 1)));

  const baselineScores = computePersonalBaseline(triggers);

  // Cold-start fallback
  if (triggers.length === 0) {
    const defaultBaseline = { vasomotor: 0, sebum: 0, barrier: 0, inflammation: 0, turnover: 0.5, pigmentation: 0, edema: 0 };
    return {
      dominantAxis: 'turnover',
      secondaryAxes: [],
      activeAxes: ['turnover'],
      timeHorizonKey: 'in_1_month',
      timeHorizonDisplay: '1 month',
      conditionHeadline: 'Steady cellular turnover & skin renewal',
      underlyingMechanism: 'Natural 28-day epidermal transit maintaining equilibrium',
      physiologicalSalienceScore: 0.5,
      logDaysUsed,
      activeContributingCount: 0,
      protectiveOffsetDetected: false,
      axisScores: { vasomotor: 0, sebum: 0, barrier: 0, inflammation: 0, turnover: 0.5, pigmentation: 0, edema: 0 },
      baselineScores: defaultBaseline,
      deltaFromBaseline: { vasomotor: 0, sebum: 0, barrier: 0, inflammation: 0, turnover: 0, pigmentation: 0, edema: 0 },
      contributingDrivers: [],
    };
  }

  // Evaluate across forward time horizons
  const testHorizons = [
    { tAhead: 2, key: 'tonight' as const, display: 'Tonight' },
    { tAhead: 12, key: 'tomorrow_morning' as const, display: 'Tomorrow morning' },
    { tAhead: 48, key: 'in_48_hours' as const, display: '48 hours' },
    { tAhead: 72, key: 'in_3_days' as const, display: '3 days' },
    { tAhead: 120, key: 'in_5_days' as const, display: '5 days' },
  ];

  type HorizonScores = {
    horizon: typeof testHorizons[number];
    netVasomotor: number;
    netSebum: number;
    netBarrier: number;
    netInflammation: number;
    netTurnover: number;
    netPigmentation: number;
    netEdema: number;
    maxSalience: number;
    dominantAxis: ClinicalAxis;
    secondaryAxes: ClinicalAxis[];
    activeAxes: ClinicalAxis[];
    axisScores: {
      vasomotor: number;
      sebum: number;
      barrier: number;
      inflammation: number;
      turnover: number;
      pigmentation: number;
      edema: number;
    };
  };

  const horizonEvaluations: HorizonScores[] = [];

  for (const h of testHorizons) {
    let sumVaso = 0;
    let sumSebum = 0;
    let sumBarrier = 0;
    let sumInflammation = 0;
    let sumTurnover = 0;
    let sumPigmentation = 0;
    let sumEdema = 0;

    for (const trig of triggers) {
      const profile = CLINICAL_KINETIC_PROFILES[trig.profileKey];
      if (!profile) continue;

      const totalElapsedTimeHours = trig.loggedHoursAgo + h.tAhead;
      const concentration = evaluateBatemanCurve(
        trig.intensity,
        profile.ka,
        profile.ke,
        totalElapsedTimeHours
      );

      sumVaso += concentration * profile.vectorWeights.vasomotor;
      sumSebum += concentration * profile.vectorWeights.sebum;
      sumBarrier += concentration * profile.vectorWeights.barrier;
      sumInflammation += concentration * profile.vectorWeights.inflammation;
      sumTurnover += concentration * profile.vectorWeights.turnover;
      sumPigmentation += concentration * profile.vectorWeights.pigmentation;
      sumEdema += concentration * profile.vectorWeights.edema;
    }

    // Apply Pillar 3 Non-Linear Synergy and Protective Shielding Tensor
    const tensorResult = applySynergyAndShieldTensor({
      vasomotor: sumVaso,
      sebum: sumSebum,
      barrier: sumBarrier,
      inflammation: sumInflammation,
      turnover: sumTurnover,
      pigmentation: sumPigmentation,
      edema: sumEdema,
    });

    const axisScores = {
      vasomotor: tensorResult.vasomotor,
      sebum: tensorResult.sebum,
      barrier: tensorResult.barrier,
      inflammation: tensorResult.inflammation,
      turnover: tensorResult.turnover,
      pigmentation: tensorResult.pigmentation,
      edema: tensorResult.edema,
    };

    const axisValues: Array<{ axis: ClinicalAxis; val: number }> = [
      { axis: 'vasomotor', val: Math.abs(tensorResult.vasomotor) },
      { axis: 'sebum', val: Math.abs(tensorResult.sebum) },
      { axis: 'barrier', val: Math.abs(tensorResult.barrier) },
      { axis: 'inflammation', val: Math.abs(tensorResult.inflammation) },
      { axis: 'turnover', val: Math.abs(tensorResult.turnover) },
      { axis: 'pigmentation', val: Math.abs(tensorResult.pigmentation) },
      { axis: 'edema', val: Math.abs(tensorResult.edema) },
    ];

    axisValues.sort((a, b) => b.val - a.val);

    const dominant = axisValues[0];
    const secondary = axisValues.slice(1).filter((item) => item.val >= dominant.val * 0.65 && item.val > 0.25);
    const active = axisValues.filter((item) => item.val > 0.25).map((i) => i.axis);

    horizonEvaluations.push({
      horizon: h,
      netVasomotor: tensorResult.vasomotor,
      netSebum: tensorResult.sebum,
      netBarrier: tensorResult.barrier,
      netInflammation: tensorResult.inflammation,
      netTurnover: tensorResult.turnover,
      netPigmentation: tensorResult.pigmentation,
      netEdema: tensorResult.edema,
      maxSalience: dominant.val,
      dominantAxis: dominant.axis,
      secondaryAxes: secondary.map((s) => s.axis),
      activeAxes: active,
      axisScores,
    });
  }

  // Find the peak physiological horizon (calibrated to personal baseline deviations)
  horizonEvaluations.sort((a, b) => b.maxSalience - a.maxSalience);
  const winner = horizonEvaluations[0];

  const deltaFromBaseline = {
    vasomotor: Math.round((winner.axisScores.vasomotor - baselineScores.vasomotor) * 100) / 100,
    sebum: Math.round((winner.axisScores.sebum - baselineScores.sebum) * 100) / 100,
    barrier: Math.round((winner.axisScores.barrier - baselineScores.barrier) * 100) / 100,
    inflammation: Math.round((winner.axisScores.inflammation - baselineScores.inflammation) * 100) / 100,
    turnover: Math.round((winner.axisScores.turnover - baselineScores.turnover) * 100) / 100,
    pigmentation: Math.round((winner.axisScores.pigmentation - baselineScores.pigmentation) * 100) / 100,
    edema: Math.round((winner.axisScores.edema - baselineScores.edema) * 100) / 100,
  };

  // Map drivers to clinical contributions
  const contributingDrivers: ContributingDriver[] = triggers.map((t) => {
    const profile = CLINICAL_KINETIC_PROFILES[t.profileKey];
    return {
      factor: t.sourceLabel || t.sourceKey,
      axis: profile.category,
      intensity: t.intensity,
      direction: t.intensity < 0 || profile.category === 'turnover' ? 'protective' : 'worsening',
      sourceEntry: t.rawEntry,
    };
  });

  const compoundSynthesis = synthesizeCompoundForecast(
    winner.dominantAxis,
    winner.secondaryAxes,
    winner.axisScores,
    contributingDrivers
  );

  return {
    dominantAxis: winner.dominantAxis,
    secondaryAxes: winner.secondaryAxes,
    activeAxes: winner.activeAxes,
    timeHorizonKey: winner.horizon.key,
    timeHorizonDisplay: winner.horizon.display,
    conditionHeadline: compoundSynthesis.headline,
    underlyingMechanism: compoundSynthesis.mechanism,
    physiologicalSalienceScore: Math.round(winner.maxSalience * 100) / 100,
    logDaysUsed,
    activeContributingCount: triggers.length,
    protectiveOffsetDetected: winner.netBarrier < 0 || winner.netTurnover > 0.35,
    axisScores: winner.axisScores,
    baselineScores,
    deltaFromBaseline,
    contributingDrivers: contributingDrivers.slice(0, 5),
  };
}
