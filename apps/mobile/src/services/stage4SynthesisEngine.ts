/**
 * ============================================================================
 * Stage 4: Clinical Forecast Synthesis Engine
 * ============================================================================
 * 
 * Plain-English Purpose:
 * Stage 3 computes the pure clinical math (state vectors, decay rates, and
 * multi-horizon projections across 7 biological axes).
 * 
 * Stage 4 is the Clinical Dermatologist:
 * 1. Takes the Stage 3 mathematical forecast output and user skin profile.
 * 2. Provides an instant, deterministic clinical translation (0ms) so the
 *    app never has a blank screen or broken UI.
 * 3. Sends the exact clinical state vectors and active drivers to Gemini 3.8-flash
 *    to produce human, empathetic, dermatologist-grade commentary.
 * 4. Persistently caches AI syntheses locally in AsyncStorage so users don't
 *    waste tokens or wait for repeated network calls if their data hasn't changed.
 * 5. Provides an end-to-end master runner function: `runFullSkinForecastingPipeline`
 *    that executes Stages 1, 2, 3, and 4 in one seamless, type-safe call.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  extractStage1HistoryLogs,
  Stage1DailyLog,
} from './stage1RawDataRules';
import {
  JournalHistoryRecord,
  QuestionDef,
} from '../store/journalStore';
import {
  ClinicalTriggerTicket,
  SkinAxisCategory,
} from './stage2IngestionBridge';
import {
  SkinStateVector,
  Stage3EngineInputPayload,
  assembleStage3EnginePayload,
  DEFAULT_BASELINE_VECTORS,
} from './stage3EngineBridge';
import {
  Stage3ForecastResult,
  ForecastHorizonKey,
  runStage3ForecastEngine,
  FORECAST_HORIZONS,
} from './stage3SkinForecastEngine';

// Gemini API Configuration
function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
}

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

const ASYNC_STORAGE_SYNTHESIS_CACHE_KEY = 'skinstory_forecast_synthesis_cache_v1';

function createTimeoutSignal(externalSignal?: AbortSignal, timeoutMs = 8000): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort());
    }
  }
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

/**
 * UI-Ready Contract for the Home Screen & Forecast Views
 */
export interface ForecastHeroCardData {
  prefix: string;        // e.g. "Peak glow and clarity expected in" or "Barrier recovery expected in"
  highlight: string;     // e.g. "Tomorrow morning", "48 hours", "1 day", "7 days"
  suffix?: string;       // e.g. "by 9 AM" or undefined
  meta: string;          // e.g. "Ceramide lipid lamellae restoring (+24%)"
  logDays: number;       // Number of days of journal logs factored in
}

export interface HorizonSummaryData {
  label: string;
  hoursFromNow: number;
  statusHeadline: string;
  keyChangeText: string;
  direction: 'improving' | 'worsening' | 'stable';
}

export interface BiomarkerDeltaData {
  category: SkinAxisCategory;
  label: string;
  deltaPercent: number;    // e.g. +18, -12
  formattedText: string;   // e.g. "+18% vs baseline"
  status: 'optimal' | 'recovering' | 'stressed';
}

export interface SkinForecastSynthesis {
  // Drop-in compatible with index.tsx ForecastItemData
  heroCard: ForecastHeroCardData;
  // Clinical story & daily routine recommendation
  clinicalInsight: {
    title: string;
    summary: string;
    actionTip: string;
    dominantAxis: SkinAxisCategory;
    direction: 'improving' | 'worsening' | 'stable';
    severityScore: number; // 0.0 (calm) to 1.0 (critical)
  };
  // Multi-horizon outlook (Tomorrow morning, 48h, 7d, 30d)
  horizons: Record<ForecastHorizonKey, HorizonSummaryData>;
  // Biological biomarkers for health meters
  biomarkerDeltas: BiomarkerDeltaData[];
  // Source metadata
  source: 'gemini-3.8-flash' | 'gemini-fallback' | 'deterministic-engine';
  computedAt: number;
}

export interface UserSkinProfile {
  skinType?: 'oily' | 'combination' | 'dry' | 'normal' | 'sensitive';
  concerns?: string[];
  firstName?: string;
}

/**
 * Friendly axis display titles and clinical descriptions
 */
const AXIS_DISPLAY_INFO: Record<SkinAxisCategory, { title: string; positiveName: string; negativeName: string }> = {
  hydration: {
    title: 'Hydration',
    positiveName: 'Moisture retention',
    negativeName: 'Transepidermal dehydration',
  },
  barrier: {
    title: 'Skin Barrier',
    positiveName: 'Ceramide lipid repair',
    negativeName: 'Lipid matrix compromise',
  },
  inflammation: {
    title: 'Inflammation',
    positiveName: 'Micro-vascular calming',
    negativeName: 'Inflammatory flare',
  },
  sebum: {
    title: 'Sebum Production',
    positiveName: 'Sebaceous balance',
    negativeName: 'Sebum hyper-secretion',
  },
  turnover: {
    title: 'Cellular Turnover',
    positiveName: 'Epidermal desquamation',
    negativeName: 'Sluggish cell renewal',
  },
  pigmentation: {
    title: 'Melanin Clarity',
    positiveName: 'Melanosome dispersion & fading',
    negativeName: 'Melanin clustering',
  },
  edema: {
    title: 'Lymphatic Drainage',
    positiveName: 'Puffiness resolution',
    negativeName: 'Lymphatic fluid retention',
  },
};

/**
 * ----------------------------------------------------------------------------
 * 1. DETERMINISTIC FAST-SYNTHESIS (0ms, 100% Offline Reliable)
 * ----------------------------------------------------------------------------
 * Converts Stage 3's mathematical result directly into clinical English.
 * Guarantees zero blank screens if Gemini is offline or slow.
 */
export function buildDeterministicSynthesis(
  stage3Result: Stage3ForecastResult,
  userProfile?: UserSkinProfile
): SkinForecastSynthesis {
  const { winningForecast, horizons, currentStateVector, baselineVector } = stage3Result;
  const { dominantAxis, horizonKey, horizonDisplay, direction, severityScore, activeDrivers } = winningForecast;

  const info = AXIS_DISPLAY_INFO[dominantAxis] || {
    title: dominantAxis,
    positiveName: `${dominantAxis} optimization`,
    negativeName: `${dominantAxis} stress`,
  };

  // 1. Build Hero Card (matching index.tsx ForecastItemData)
  let prefix = '';
  let highlight = horizonDisplay;
  let suffix: string | undefined = undefined;
  let meta = '';

  if (direction === 'improving') {
    prefix = `Optimal ${info.positiveName.toLowerCase()} expected in`;
    meta = `${info.title} trending +${Math.round(severityScore * 30)}% above baseline`;
  } else if (direction === 'worsening') {
    prefix = `Potential ${info.negativeName.toLowerCase()} window`;
    meta = `${info.title} active stress detected (+${Math.round(severityScore * 35)}%)`;
  } else {
    prefix = `Peak equilibrium and stability in`;
    meta = `Skin metrics holding steady at physiological baseline`;
  }

  // 2. Build Biomarker Deltas
  const categories: SkinAxisCategory[] = [
    'hydration',
    'barrier',
    'inflammation',
    'sebum',
    'turnover',
    'pigmentation',
    'edema',
  ];

  const biomarkerDeltas: BiomarkerDeltaData[] = categories.map((cat) => {
    const cur = currentStateVector[cat] ?? 0.5;
    const base = baselineVector[cat] ?? 0.5;
    const delta = cur - base;
    const deltaPercent = Math.round(delta * 100);

    let status: 'optimal' | 'recovering' | 'stressed' = 'optimal';
    if (cat === 'inflammation' || cat === 'edema') {
      if (cur > base + 0.15) status = 'stressed';
      else if (cur > base + 0.05) status = 'recovering';
      else status = 'optimal';
    } else {
      if (cur < base - 0.15) status = 'stressed';
      else if (cur < base) status = 'recovering';
      else status = 'optimal';
    }

    const sign = deltaPercent > 0 ? '+' : '';
    return {
      category: cat,
      label: AXIS_DISPLAY_INFO[cat].title,
      deltaPercent,
      formattedText: `${sign}${deltaPercent}% vs baseline`,
      status,
    };
  });

  // 3. Build Multi-Horizon Summaries
  const horizonSummaries: Record<ForecastHorizonKey, HorizonSummaryData> = {
    tomorrow_morning: {
      label: 'Tomorrow Morning',
      hoursFromNow: FORECAST_HORIZONS.tomorrow_morning,
      statusHeadline: horizons.tomorrow_morning.dominantDelta > 0.05
        ? `${AXIS_DISPLAY_INFO[horizons.tomorrow_morning.dominantAxis].title} active shift`
        : 'Morning homeostasis stable',
      keyChangeText: `${AXIS_DISPLAY_INFO[horizons.tomorrow_morning.dominantAxis].title} delta: ${Math.round(horizons.tomorrow_morning.dominantDelta * 100)}%`,
      direction: horizons.tomorrow_morning.dominantDelta > 0.15 ? 'worsening' : 'improving',
    },
    in_48_hours: {
      label: 'In 48 Hours',
      hoursFromNow: FORECAST_HORIZONS.in_48_hours,
      statusHeadline: `${AXIS_DISPLAY_INFO[horizons.in_48_hours.dominantAxis].title} midpoint clearance`,
      keyChangeText: `Impulse decay reaching 50% half-life clearance`,
      direction: 'improving',
    },
    in_7_days: {
      label: 'In 7 Days',
      hoursFromNow: FORECAST_HORIZONS.in_7_days,
      statusHeadline: 'Cellular turnover reset',
      keyChangeText: 'Epidermal desquamation advancing toward fresh layer',
      direction: 'improving',
    },
    in_1_month: {
      label: 'In 1 Month',
      hoursFromNow: FORECAST_HORIZONS.in_1_month,
      statusHeadline: 'Deep stratum corneum renewal',
      keyChangeText: 'Full biological renewal cycle complete',
      direction: 'stable',
    },
  };

  // 4. Clinical Narrative
  const driverNames = activeDrivers.map((d) => d.sourceLabel).filter(Boolean);
  const driverContext = driverNames.length > 0 ? `influenced by recent ${driverNames.slice(0, 2).join(' and ')}` : 'maintaining homeostatic equilibrium';

  const insightTitle = direction === 'improving'
    ? `${info.title} Recovery Phase`
    : direction === 'worsening'
    ? `${info.title} Elevation Alert`
    : `${info.title} Stable`;

  const insightSummary = direction === 'improving'
    ? `Your skin is actively clearing metabolic stress, ${driverContext}. Lipid repair kinetics indicate peak recovery by ${horizonDisplay}.`
    : direction === 'worsening'
    ? `Elevated biological markers in ${info.title.toLowerCase()} detected, ${driverContext}. Expect transient reactivity before stabilizing.`
    : `Your skin parameters remain tightly anchored to your biological baseline. Hydration and barrier kinetics are balanced.`;

  const actionTip = dominantAxis === 'barrier'
    ? 'Reinforce barrier lipids tonight with ceramides and avoid physical scrubs.'
    : dominantAxis === 'hydration'
    ? 'Drink an extra glass of water and layer a humectant (hyaluronic or glycerin) onto damp skin.'
    : dominantAxis === 'inflammation'
    ? 'Soothe active pathways with centella, niacinamide, or panthenol; pause harsh acids today.'
    : dominantAxis === 'sebum'
    ? 'Keep routine lightweight with gel-based hydrators and gentle salicylic acid cleanse.'
    : 'Maintain your consistent AM/PM routine to preserve epidermal barrier strength.';

  return {
    heroCard: {
      prefix,
      highlight,
      suffix,
      meta,
      logDays: Math.max(1, Math.min(14, Math.round(stage3Result.totalTicketsEvaluated / 2))),
    },
    clinicalInsight: {
      title: insightTitle,
      summary: insightSummary,
      actionTip,
      dominantAxis,
      direction,
      severityScore,
    },
    horizons: horizonSummaries,
    biomarkerDeltas,
    source: 'deterministic-engine',
    computedAt: Date.now(),
  };
}

/**
 * ----------------------------------------------------------------------------
 * 2. CLINICAL AI SYNTHESIS (Gemini 3.8-flash)
 * ----------------------------------------------------------------------------
 * Assembles the full clinical state vector prompt, invokes Gemini, and
 * returns the deep dermatologist narrative.
 */

function buildStage4AiPrompt(
  stage3Result: Stage3ForecastResult,
  userProfile?: UserSkinProfile
): string {
  const { currentStateVector, baselineVector, winningForecast, horizons, totalTicketsEvaluated } = stage3Result;

  const promptObj = {
    clinical_instructions: `You are a Board-Certified Clinical Dermatologist and Director of Dermatological Data Science.
Analyze the provided continuous-time skin state space vectors (scale 0.0 to 1.0) and write a succinct, empowering, highly personalized skin forecast for the user's mobile app.

Tone: Clinical yet warm, deeply empathetic, highly precise. Avoid generic clichés. Directly reference the biological mechanisms (e.g., ceramide lipid lamellae, cytokine clearance, sebaceous homeostasis, transepidermal water loss).

Format Requirement: Return ONLY valid RFC-8259 JSON matching this exact structure:
{
  "heroCard": {
    "prefix": "Short lead-in text (e.g. 'Peak barrier recovery expected in' or 'Potential sebum elevation window')",
    "highlight": "Time horizon (e.g. 'Tomorrow morning', '48 hours', '3 days')",
    "suffix": "Optional suffix or empty string",
    "meta": "One crisp clinical takeaway metric (e.g. 'Ceramide lipid synthesis up 24%')"
  },
  "clinicalInsight": {
    "title": "3-5 word clinical headline (e.g. 'Epidermal Barrier Restoration Phase')",
    "summary": "2 clear sentences explaining WHY this is happening, linking their recent logged actions directly to the forecasted skin state.",
    "actionTip": "1 ultra-specific, practical routine recommendation for today."
  },
  "tomorrowMorningSummary": "One crisp sentence on tomorrow morning's state",
  "in48HoursSummary": "One crisp sentence on the 48-hour outlook",
  "in7DaysSummary": "One crisp sentence on the 7-day outlook"
}`,
    user_context: {
      skin_type: userProfile?.skinType || 'combination',
      primary_concerns: userProfile?.concerns || ['barrier health', 'glow'],
      user_name: userProfile?.firstName || 'User',
      total_history_logs_analyzed: totalTicketsEvaluated,
    },
    state_space_data: {
      current_vector: currentStateVector,
      baseline_vector: baselineVector,
      winning_forecast: winningForecast,
      horizon_projections: {
        tomorrow_morning_14h: horizons.tomorrow_morning,
        in_48_hours: horizons.in_48_hours,
        in_7_days: horizons.in_7_days,
        in_1_month: horizons.in_1_month,
      },
    },
  };

  return JSON.stringify(promptObj, null, 2);
}

/**
 * Strips markdown formatting (```json ... ```) safely
 */
function extractJsonFromString(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Invokes Gemini 3.8-flash for clinical synthesis
 */
async function callGeminiForSynthesis(prompt: string, signal?: AbortSignal): Promise<any> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const { signal: timeoutSignal, cleanup } = createTimeoutSignal(signal, 8000);

  const callModel = async (model: string): Promise<string | null> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: timeoutSignal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Nuanced clinical reasoning while adhering strictly to facts
          maxOutputTokens: 600,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  };

  try {
    // Try primary model (gemini-3.8-flash)
    try {
      const textPrimary = await callModel(PRIMARY_MODEL);
      if (textPrimary) return extractJsonFromString(textPrimary);
    } catch {
      // Failover
    }

    // Try fallback model (gemini-3.5-flash-lite)
    try {
      const textFallback = await callModel(FALLBACK_MODEL);
      if (textFallback) return extractJsonFromString(textFallback);
    } catch {
      // Complete failure
    }
  } finally {
    cleanup();
  }

  return null;
}

/**
 * Merges AI output with deterministic baseline data
 */
function mergeAiOutputWithSynthesis(
  aiData: any,
  deterministic: SkinForecastSynthesis
): SkinForecastSynthesis {
  if (!aiData || typeof aiData !== 'object') return deterministic;

  const heroCard: ForecastHeroCardData = {
    prefix: typeof aiData.heroCard?.prefix === 'string' && aiData.heroCard.prefix.trim()
      ? aiData.heroCard.prefix.trim()
      : deterministic.heroCard.prefix,
    highlight: typeof aiData.heroCard?.highlight === 'string' && aiData.heroCard.highlight.trim()
      ? aiData.heroCard.highlight.trim()
      : deterministic.heroCard.highlight,
    suffix: typeof aiData.heroCard?.suffix === 'string' && aiData.heroCard.suffix.trim()
      ? aiData.heroCard.suffix.trim()
      : undefined,
    meta: typeof aiData.heroCard?.meta === 'string' && aiData.heroCard.meta.trim()
      ? aiData.heroCard.meta.trim()
      : deterministic.heroCard.meta,
    logDays: deterministic.heroCard.logDays,
  };

  const clinicalInsight = {
    title: typeof aiData.clinicalInsight?.title === 'string' && aiData.clinicalInsight.title.trim()
      ? aiData.clinicalInsight.title.trim()
      : deterministic.clinicalInsight.title,
    summary: typeof aiData.clinicalInsight?.summary === 'string' && aiData.clinicalInsight.summary.trim()
      ? aiData.clinicalInsight.summary.trim()
      : deterministic.clinicalInsight.summary,
    actionTip: typeof aiData.clinicalInsight?.actionTip === 'string' && aiData.clinicalInsight.actionTip.trim()
      ? aiData.clinicalInsight.actionTip.trim()
      : deterministic.clinicalInsight.actionTip,
    dominantAxis: deterministic.clinicalInsight.dominantAxis,
    direction: deterministic.clinicalInsight.direction,
    severityScore: deterministic.clinicalInsight.severityScore,
  };

  const updatedHorizons = { ...deterministic.horizons };
  if (typeof aiData.tomorrowMorningSummary === 'string' && aiData.tomorrowMorningSummary.trim()) {
    updatedHorizons.tomorrow_morning.keyChangeText = aiData.tomorrowMorningSummary.trim();
  }
  if (typeof aiData.in48HoursSummary === 'string' && aiData.in48HoursSummary.trim()) {
    updatedHorizons.in_48_hours.keyChangeText = aiData.in48HoursSummary.trim();
  }
  if (typeof aiData.in7DaysSummary === 'string' && aiData.in7DaysSummary.trim()) {
    updatedHorizons.in_7_days.keyChangeText = aiData.in7DaysSummary.trim();
  }

  return {
    heroCard,
    clinicalInsight,
    horizons: updatedHorizons,
    biomarkerDeltas: deterministic.biomarkerDeltas,
    source: 'gemini-3.8-flash',
    computedAt: Date.now(),
  };
}

/**
 * ----------------------------------------------------------------------------
 * 3. PERSISTENT CACHING LAYER
 * ----------------------------------------------------------------------------
 */
async function getCachedSynthesis(cacheKey: string): Promise<SkinForecastSynthesis | null> {
  try {
    const raw = await AsyncStorage.getItem(`${ASYNC_STORAGE_SYNTHESIS_CACHE_KEY}_${cacheKey}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

async function setCachedSynthesis(cacheKey: string, synthesis: SkinForecastSynthesis): Promise<void> {
  try {
    await AsyncStorage.setItem(`${ASYNC_STORAGE_SYNTHESIS_CACHE_KEY}_${cacheKey}`, JSON.stringify(synthesis));
  } catch {
    // ignore
  }
}

/**
 * ----------------------------------------------------------------------------
 * 4. SYNTHESIZE FORECAST (Core Stage 4 Function)
 * ----------------------------------------------------------------------------
 */
export async function synthesizeSkinForecast(
  stage3Result: Stage3ForecastResult,
  userProfile?: UserSkinProfile,
  options?: {
    forceAiRefresh?: boolean;
    signal?: AbortSignal;
  }
): Promise<SkinForecastSynthesis> {
  // Step 1: Immediately build the rock-solid deterministic baseline
  const deterministic = buildDeterministicSynthesis(stage3Result, userProfile);

  // If no Gemini API key configured, return deterministic immediately
  if (!getGeminiApiKey()) {
    return deterministic;
  }

  // Step 2: Formulate unique cache key based on winning axis, computedAt bucket, and user skin type
  const cacheKey = `${winningKey(stage3Result)}_${userProfile?.skinType || 'combo'}`;

  if (!options?.forceAiRefresh) {
    const cached = await getCachedSynthesis(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Step 3: Invoke Gemini 3.8-flash
  try {
    const prompt = buildStage4AiPrompt(stage3Result, userProfile);
    const aiResponse = await callGeminiForSynthesis(prompt, options?.signal);

    if (aiResponse) {
      const merged = mergeAiOutputWithSynthesis(aiResponse, deterministic);
      // Save to cache asynchronously
      setCachedSynthesis(cacheKey, merged).catch(() => {});
      return merged;
    }
  } catch {
    // Fail silently to deterministic fallback
  }

  return deterministic;
}

function winningKey(stage3Result: Stage3ForecastResult): string {
  const { dominantAxis, horizonKey, direction } = stage3Result.winningForecast;
  return `${dominantAxis}_${horizonKey}_${direction}_${Math.round(stage3Result.computedAt / (1000 * 60 * 30))}`;
}

/**
 * ----------------------------------------------------------------------------
 * 5. MASTER END-TO-END PIPELINE RUNNER
 * ----------------------------------------------------------------------------
 * Chains Stages 1, 2, 3, and 4 into a single, seamless, production function:
 * 
 * Stage 1: extractStage1HistoryLogs(historyRecords, questions)
 * Stage 2 & 3 Bridge: assembleStage3EnginePayload(...)
 * Stage 3 Engine: runStage3ForecastEngine(...)
 * Stage 4: synthesizeSkinForecast(...) (AI + Deterministic fallback)
 */
export async function runFullSkinForecastingPipeline(
  historyRecords: JournalHistoryRecord[],
  questions: QuestionDef[],
  userProfile?: UserSkinProfile,
  options?: {
    forceAiRefresh?: boolean;
    signal?: AbortSignal;
  }
): Promise<SkinForecastSynthesis> {
  // STAGE 1: Extract & sanitize raw history data
  const stage1Logs: Stage1DailyLog[] = extractStage1HistoryLogs(historyRecords, questions);

  // STAGE 2 & 3 BRIDGE: Assemble engine payload with fast-track tickets + custom AI ingestion
  const stage3Payload: Stage3EngineInputPayload = await assembleStage3EnginePayload(
    stage1Logs,
    questions,
    userProfile?.skinType || 'combination',
    options?.signal
  );

  // STAGE 3 ENGINE: Simulate continuous state-space trajectory
  const stage3Result: Stage3ForecastResult = runStage3ForecastEngine(stage3Payload);

  // STAGE 4: Synthesize human clinical forecast
  const synthesisResult: SkinForecastSynthesis = await synthesizeSkinForecast(
    stage3Result,
    userProfile,
    options
  );

  return synthesisResult;
}
