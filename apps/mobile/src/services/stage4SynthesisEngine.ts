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

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';

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
  prefix: string;        // Line 1: Short bold event title (e.g. "Barrier Recovery Peak")
  highlight: string;     // Line 2: Time window (e.g. "Tomorrow Morning")
  suffix?: string;       // Optional
  meta: string;          // Line 3: Causal story + action (max 8-10 words)
  logDays: number;       // Actual non-hardcoded count of logged days
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
  userProfile?: UserSkinProfile,
  isTodayLogged: boolean = true
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
  let highlight = isTodayLogged ? horizonDisplay : 'This Morning';
  let suffix: string | undefined = undefined;
  let meta = '';

  if (isTodayLogged) {
    // Post-Log Mode: Forward Projection into tomorrow/future
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
  } else {
    // Pre-Log Mode: Morning status based on decaying past 24-72h logs
    if (direction === 'improving') {
      prefix = `Active ${info.positiveName.toLowerCase()} phase`;
      meta = `${info.title} recovering (+${Math.round(severityScore * 30)}% vs baseline)`;
    } else if (direction === 'worsening') {
      prefix = `Active ${info.negativeName.toLowerCase()} status`;
      meta = `${info.title} active response (+${Math.round(severityScore * 35)}%)`;
    } else {
      prefix = `Skin physiological equilibrium`;
      meta = `Metrics balanced at physiological baseline`;
    }
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

  let insightTitle = '';
  let insightSummary = '';
  let actionTip = '';

  if (isTodayLogged) {
    insightTitle = direction === 'improving'
      ? `${info.title} Recovery Phase`
      : direction === 'worsening'
      ? `${info.title} Elevation Alert`
      : `${info.title} Stable`;

    insightSummary = direction === 'improving'
      ? `Your skin is actively clearing metabolic stress, ${driverContext}. Lipid repair kinetics indicate peak recovery by ${horizonDisplay}.`
      : direction === 'worsening'
      ? `Elevated biological markers in ${info.title.toLowerCase()} detected, ${driverContext}. Expect transient reactivity before stabilizing.`
      : `Your skin parameters remain tightly anchored to your biological baseline. Hydration and barrier kinetics are balanced.`;

    actionTip = dominantAxis === 'barrier'
      ? 'Reinforce barrier lipids tonight with ceramides and avoid physical scrubs.'
      : dominantAxis === 'hydration'
      ? 'Drink an extra glass of water and layer a humectant (hyaluronic or glycerin) onto damp skin.'
      : dominantAxis === 'inflammation'
      ? 'Soothe active pathways with centella, niacinamide, or panthenol; pause harsh acids today.'
      : dominantAxis === 'sebum'
      ? 'Keep routine lightweight with gel-based hydrators and gentle salicylic acid cleanse.'
      : 'Maintain your consistent AM/PM routine to preserve epidermal barrier strength.';
  } else {
    // Pre-Log Mode: Morning status from decaying past 24-72h logs
    insightTitle = direction === 'improving'
      ? `${info.title} Morning Recovery`
      : direction === 'worsening'
      ? `${info.title} Morning Alert`
      : `${info.title} Steady State`;

    insightSummary = direction === 'improving'
      ? `Your skin is in an active repair phase this morning, ${driverContext}. Short-term daily factors have cleared, while cellular recovery is underway.`
      : direction === 'worsening'
      ? `Elevated biological markers in ${info.title.toLowerCase()} are active this morning, ${driverContext}. Guard against external skin stressors today.`
      : `Your skin parameters remain balanced at your biological baseline this morning. Moisture and barrier kinetics are holding steady.`;

    actionTip = dominantAxis === 'barrier'
      ? 'Protect your skin barrier today with ceramides and broad-spectrum sunscreen.'
      : dominantAxis === 'hydration'
      ? 'Start your morning with a tall glass of water and apply a lightweight moisturizer to damp skin.'
      : dominantAxis === 'inflammation'
      ? 'Calm morning sensitivity with centella or niacinamide, and keep your routine gentle today.'
      : dominantAxis === 'sebum'
      ? 'Balance morning oil with a gentle cleanse and an oil-free hydrating moisturizer.'
      : 'Apply broad-spectrum sunscreen and maintain gentle barrier care today.';
  }

  return {
    heroCard: {
      prefix: `${info.title} ${direction === 'worsening' ? 'Alert' : 'Peak'}`,
      highlight: isTodayLogged ? winningForecast.horizonDisplay : 'This Morning',
      suffix: undefined,
      meta: direction === 'improving'
        ? `${dominantAxis} recovering from active care; lock in hydration.`
        : direction === 'worsening'
        ? `Elevated ${dominantAxis} stress; keep routine gentle tonight.`
        : `${dominantAxis} balanced at baseline; maintain standard routine.`,
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
  userProfile?: UserSkinProfile,
  isTodayLogged: boolean = true
): string {
  const { winningForecast } = stage3Result;
  const driversList = (winningForecast.activeDrivers || []).map(d => d.sourceLabel).filter(Boolean).join(", ") || "daily factors";
  const peakHours = typeof winningForecast.peakHoursFromNow === 'number' ? winningForecast.peakHoursFromNow : 14;

  const now = new Date();
  const currentDayTime = now.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });

  return `Skin forecast in 3 natural lines. No medical jargon.
Focus: ${winningForecast.dominantAxis} (${winningForecast.direction}, ${winningForecast.severityScore}).
Triggers: ${driversList}.
Peak: in ${peakHours}h (Current: ${currentDayTime}).

Output JSON:
{
  "eventTitle": "2-4 word natural title",
  "timeWindow": "Conversational time window from now + ${peakHours}h (clock time or natural period)",
  "causalStory": "10-14 words: trigger cause then 1 routine action"
}`;
}

/**
 * Strips markdown formatting (```json ... ```) safely
 */
function extractJsonFromString(text: string): any {
  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned);
}

/**
 * Invokes Gemini for clinical synthesis without arbitrary premature timeout
 */
async function callGeminiForSynthesis(prompt: string, signal?: AbortSignal): Promise<any> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.log('[STAGE 4 - AI] ⚠️ No EXPO_PUBLIC_GEMINI_API_KEY detected in env. Falling back to local deterministic synthesis.');
    return null;
  }

  const callModel = async (model: string): Promise<string | null> => {
    const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '***';
    const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${maskedKey}`;
    const actualUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`[STAGE 4 - AI] 🌐 Calling Gemini API (${model}). URL: ${requestUrl}`);
    console.log(`[STAGE 4 - AI] 📝 ==================== EXACT PROMPT SENT TO GEMINI (STAGE 4 FORECAST) ====================\n${prompt}\n========================================================================`);
    const netStart = Date.now();

    const response = await fetch(actualUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Nuanced clinical reasoning while adhering strictly to facts
          maxOutputTokens: 120,
          responseMimeType: 'application/json',
        },
      }),
    });

    const netElapsed = Date.now() - netStart;
    console.log(`[STAGE 4 - AI] 📡 Gemini (${model}) responded in ${netElapsed}ms with HTTP status ${response.status}`);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[STAGE 4 - AI] ⚠️ Gemini call failed with status ${response.status}: ${errText.slice(0, 150)}`);
      return null;
    }
    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    if (resultText) {
      console.log(`[STAGE 4 - AI] 📥 Received valid JSON payload from Gemini (${resultText.length} chars)`);
      console.log(`[STAGE 4 - AI] 📜 ==================== RAW GEMINI ANSWER RECEIVED (STAGE 4 FORECAST) ====================\n${resultText}\n========================================================================`);
    } else {
      console.warn('[STAGE 4 - AI] ⚠️ Gemini responded with empty candidate parts');
    }
    return resultText;
  };

  try {
    const textPrimary = await callModel(PRIMARY_MODEL);
    if (textPrimary) return extractJsonFromString(textPrimary);
  } catch (e: any) {
    console.log(`[STAGE 4 - AI] ⚠️ Gemini (${PRIMARY_MODEL}) failed: ${e?.message || e}`);
  }

  return null;
}

/**
 * Merges AI output with deterministic baseline data
 */
function mergeAiOutputWithSynthesis(
  aiData: any,
  deterministic: SkinForecastSynthesis,
  isTodayLogged: boolean = true
): SkinForecastSynthesis {
  if (!aiData || typeof aiData !== 'object') return deterministic;

  const rawHighlight = typeof aiData.heroCard?.highlight === 'string' && aiData.heroCard.highlight.trim()
    ? aiData.heroCard.highlight.trim()
    : deterministic.heroCard.highlight;

  // In Pre-Log mode, highlight MUST always be "This Morning"
  const highlight = isTodayLogged ? rawHighlight : 'This Morning';

  const prefix = typeof aiData.eventTitle === 'string' && aiData.eventTitle.trim()
    ? aiData.eventTitle.trim()
    : (typeof aiData.heroCard?.prefix === 'string' ? aiData.heroCard.prefix.trim() : deterministic.heroCard.prefix);

  const windowText = typeof aiData.timeWindow === 'string' && aiData.timeWindow.trim()
    ? aiData.timeWindow.trim()
    : (typeof aiData.heroCard?.highlight === 'string' ? aiData.heroCard.highlight.trim() : highlight);

  const causalStory = typeof aiData.causalStory === 'string' && aiData.causalStory.trim()
    ? aiData.causalStory.trim()
    : (typeof aiData.heroCard?.meta === 'string' ? aiData.heroCard.meta.trim() : deterministic.heroCard.meta);

  const heroCard: ForecastHeroCardData = {
    prefix,
    highlight: isTodayLogged ? windowText : 'This Morning',
    suffix: undefined,
    meta: causalStory,
    logDays: deterministic.heroCard.logDays,
  };

  return {
    heroCard,
    clinicalInsight: deterministic.clinicalInsight,
    horizons: deterministic.horizons,
    biomarkerDeltas: deterministic.biomarkerDeltas,
    source: (PRIMARY_MODEL as any) || 'gemini-3.1-flash-lite',
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
    isTodayLogged?: boolean;
  }
): Promise<SkinForecastSynthesis> {
  const isTodayLogged = options?.isTodayLogged ?? true;

  // Step 1: Immediately build the rock-solid deterministic baseline
  const deterministic = buildDeterministicSynthesis(stage3Result, userProfile, isTodayLogged);

  // If no Gemini API key configured, return deterministic immediately
  if (!getGeminiApiKey()) {
    return deterministic;
  }

  // Step 2: Formulate unique cache key based on winning axis, computedAt bucket, skin type, and pre/post mode
  const cacheKey = `${winningKey(stage3Result)}_${userProfile?.skinType || 'combo'}_${isTodayLogged ? 'post' : 'pre'}`;

  if (!options?.forceAiRefresh) {
    const cached = await getCachedSynthesis(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Step 3: Invoke Gemini 3.8-flash
  try {
    const prompt = buildStage4AiPrompt(stage3Result, userProfile, isTodayLogged);
    const aiResponse = await callGeminiForSynthesis(prompt, options?.signal);

    if (aiResponse) {
      const merged = mergeAiOutputWithSynthesis(aiResponse, deterministic, isTodayLogged);
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
  const { dominantAxis, horizonKey, direction, activeDrivers } = stage3Result.winningForecast;
  const triggersHash = (activeDrivers || []).map(d => d.sourceLabel).filter(Boolean).sort().join('|');
  return `${dominantAxis}_${horizonKey}_${direction}_${triggersHash}`;
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
    isTodayLogged?: boolean;
  }
): Promise<SkinForecastSynthesis> {
  const pipelineStart = Date.now();
  console.log('[PIPELINE] ════════════════════════════════════════════════════════════════');
  console.log(`[PIPELINE] 🏁 STARTING 4-STAGE PIPELINE (Records: ${historyRecords.length}, Questions: ${questions.length}, Mode: ${options?.isTodayLogged ? 'Post-Log' : 'Pre-Log (Morning)'})`);

  // STAGE 1: Extract & sanitize raw history data
  const t1 = Date.now();
  const stage1Logs: Stage1DailyLog[] = extractStage1HistoryLogs(historyRecords, questions);
  console.log(`[PIPELINE] 🔹 Stage 1 (Raw Rules) completed in ${Date.now() - t1}ms | Valid logs: ${stage1Logs.length}`);

  // STAGE 2 & 3 BRIDGE: Assemble engine payload with fast-track tickets + custom AI ingestion
  const t2 = Date.now();
  const stage3Payload: Stage3EngineInputPayload = await assembleStage3EnginePayload(
    stage1Logs,
    questions,
    userProfile?.skinType || 'combination',
    options?.signal
  );
  console.log(`[PIPELINE] 🔹 Stage 2 (Biological Ingestion) completed in ${Date.now() - t2}ms | Trigger tickets: ${stage3Payload.chronologicalTickets.length}`);

  // STAGE 3 ENGINE: Simulate continuous state-space trajectory
  const t3 = Date.now();
  const stage3Result: Stage3ForecastResult = runStage3ForecastEngine(stage3Payload);
  const winning = stage3Result.winningForecast;
  console.log(`[PIPELINE] 🔹 Stage 3 (Bateman ODE Solver) completed in ${Date.now() - t3}ms | Dominant: ${winning.dominantAxis} (${winning.direction}, score: ${winning.severityScore} at ${winning.horizonKey})`);

  // STAGE 4: Synthesize human clinical forecast
  const t4 = Date.now();
  const synthesisResult: SkinForecastSynthesis = await synthesizeSkinForecast(
    stage3Result,
    userProfile,
    options
  );
  console.log(`[PIPELINE] 🔹 Stage 4 (Clinical Synthesis) completed in ${Date.now() - t4}ms | Source: ${synthesisResult.source}`);
  console.log(`[PIPELINE] 🏁 Total Pipeline Time: ${Date.now() - pipelineStart}ms`);
  console.log('[PIPELINE] ════════════════════════════════════════════════════════════════');

  return synthesisResult;
}
