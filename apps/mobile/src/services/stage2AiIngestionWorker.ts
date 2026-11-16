/**
 * ============================================================================
 * Stage 2: AI Ingestion Worker
 * ============================================================================
 * 
 * Plain-English Purpose:
 * When the user logs an unmapped, custom question or free-form text note,
 * this worker runs in the background. It sends the clinical prompt from
 * Stage 2 Bridge to Gemini, parses the returned JSON into the 4-number
 * clinical ticket, and permanently caches it locally in AsyncStorage.
 * 
 * Features:
 * 1. Persistent Local Caching: A custom question/answer pair is ONLY translated once.
 *    Repeated runs read directly from cache in 0ms without hitting the network.
 * 2. Robust JSON Sanitization: Strips markdown code blocks, backticks, or trailing prose.
 * 3. Offline-Safe Fallback: If network fails or Gemini is unavailable, computes
 *    a safe heuristic ticket so the engine NEVER crashes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ClinicalTriggerTicket,
  SkinAxisCategory,
} from './stage2IngestionBridge';
import { SanitizedQuestionAnswer } from './stage1RawDataRules';

// Gemini API Key from environment
function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCMutQD_o7oFGp7VzZyHcGGJOBK4mpvr6k';
}

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';

function createTimeoutSignal(externalSignal?: AbortSignal, timeoutMs = 15000): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.warn(`[SKIN_CONDITION_AI] ⏰ Timeout reached (${timeoutMs}ms). Aborting request.`);
    controller.abort('timeout');
  }, timeoutMs);

  if (externalSignal) {
    if (externalSignal.aborted) {
      console.warn(`[SKIN_CONDITION_AI] 🛑 External signal ALREADY aborted when initiating request.`);
      controller.abort('external_abort');
    } else {
      externalSignal.addEventListener('abort', () => {
        console.warn(`[SKIN_CONDITION_AI] 🛑 External abort signal triggered during request.`);
        controller.abort('external_abort');
      });
    }
  }
  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timer),
  };
}

const ASYNC_STORAGE_TICKET_CACHE_KEY = 'skinstory_ai_ingestion_ticket_cache_v1';
const SKIN_CONDITION_CACHE_KEY = 'skinstory_skin_condition_cache_v1';
const SKIN_ZONE_CACHE_KEY = 'skinstory_skin_zone_cache_v1';
const SKIN_SEVERITY_CACHE_KEY = 'skinstory_skin_severity_cache_v1';

/**
 * Result of validating a custom zone or severity label
 */
export interface GenericValidationResult {
  isValid: boolean;
  resolvedName?: string;
  suggestions?: string[];
}

/**
 * Result of validating + classifying a custom skin condition via Gemini
 */
export interface SkinConditionValidationResult {
  isValid: boolean;
  resolvedName?: string;
  category?: SkinAxisCategory;
  intensity?: number;
  peakHours?: number;
  halfLifeHours?: number;
  suggestions?: string[];
}

// In-memory cache synced with AsyncStorage
let memoryTicketCache: Record<string, {
  category: SkinAxisCategory;
  intensity: number;
  peakHours: number;
  halfLifeHours: number;
}> | null = null;

async function loadTicketCache(): Promise<Record<string, any>> {
  if (memoryTicketCache !== null) return memoryTicketCache;
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_TICKET_CACHE_KEY);
    if (raw) {
      memoryTicketCache = JSON.parse(raw);
      return memoryTicketCache || {};
    }
  } catch {
    // ignore storage read failure
  }
  memoryTicketCache = {};
  return memoryTicketCache;
}

async function saveTicketToCache(
  cacheKey: string,
  ticketData: {
    category: SkinAxisCategory;
    intensity: number;
    peakHours: number;
    halfLifeHours: number;
  }
) {
  try {
    const cache = await loadTicketCache();
    cache[cacheKey] = ticketData;
    memoryTicketCache = cache;
    await AsyncStorage.setItem(ASYNC_STORAGE_TICKET_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage write failure
  }
}

/**
 * Strips markdown code fencing (```json ... ```) and extracts pure JSON
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
 * Validates and clamps the 4 clinical numbers returned by AI
 */
function sanitizeAiResponse(parsed: any): {
  category: SkinAxisCategory;
  intensity: number;
  peakHours: number;
  halfLifeHours: number;
} | null {
  const validCategories: SkinAxisCategory[] = [
    'hydration',
    'barrier',
    'inflammation',
    'sebum',
    'turnover',
    'pigmentation',
    'edema',
  ];

  if (!parsed || typeof parsed !== 'object') return null;

  const category = String(parsed.category || '').toLowerCase().trim() as SkinAxisCategory;
  if (!validCategories.includes(category)) return null;

  let intensity = typeof parsed.intensity === 'number' ? parsed.intensity : 0.5;
  intensity = Math.max(-1.0, Math.min(1.0, intensity));

  let peakHours = typeof parsed.peakHours === 'number' ? parsed.peakHours : 24;
  peakHours = Math.max(1, Math.min(168, peakHours));

  let halfLifeHours = typeof parsed.halfLifeHours === 'number' ? parsed.halfLifeHours : 48;
  halfLifeHours = Math.max(2, Math.min(336, halfLifeHours));

  return {
    category,
    intensity: Math.round(intensity * 100) / 100,
    peakHours: Math.round(peakHours),
    halfLifeHours: Math.round(halfLifeHours),
  };
}

/**
 * Constructs the clinical prompt for Ingestion AI to translate any custom input
 * into the standardized 4-number ticket.
 */
export function buildIngestionAiPrompt(
  customItem: {
    questionTitle: string;
    userAnswer: string;
    dataType: string;
  }
): string {
  return `You are an elite clinical dermatologist and pharmacokinetic modeling system.
Your job is to translate a user's custom skin log into exactly one 4-number biological ticket.

Available Categories (select strictly ONE):
- hydration (moisture, water loss, humidity)
- barrier (skin barrier, lipid matrix, TEWL, acid mantle)
- inflammation (cytokines, active acne, redness, swelling, burning)
- sebum (oil production, pores, follicular occlusion)
- turnover (cellular renewal, flaking, peeling, exfoliation)
- pigmentation (melanin surge, UV damage, dark spots, PIH)
- edema (puffiness, fluid retention, lymphatic pooling)

Input:
- Question: "${customItem.questionTitle}"
- User Answer: "${customItem.userAnswer}"
- Data Type: "${customItem.dataType}"

Respond strictly with valid JSON conforming to this schema (no extra prose or markdown code blocks):
{
  "category": "hydration" | "barrier" | "inflammation" | "sebum" | "turnover" | "pigmentation" | "edema",
  "intensity": number between -1.0 (healing/protective) and +1.0 (severe damage/stress),
  "peakHours": number of hours from event onset until maximum biological impact (typical range: 2 to 72),
  "halfLifeHours": number of hours until the biological effect naturally fades by 50% (typical range: 6 to 168)
}`;
}

/**
 * Calls Gemini directly with fallback model support
 */
async function callGeminiForTicket(prompt: string, signal?: AbortSignal): Promise<any> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error('[SKIN_CONDITION_AI] ❌ API Key is missing! Check EXPO_PUBLIC_GEMINI_API_KEY.');
    return null;
  }

  const callModel = async (model: string): Promise<string | null> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`[SKIN_CONDITION_AI] 📡 Network: Dispatching request to Gemini (${model})...`);
    console.log(`[SKIN_CONDITION_AI] 📝 ==================== EXACT PROMPT SENT TO GEMINI ====================\n${prompt}\n========================================================================`);
    // Each attempt gets its own independent 15s timeout
    const { signal: timeoutSignal, cleanup } = createTimeoutSignal(signal, 15000);

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: timeoutSignal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Near-deterministic clinical precision
            maxOutputTokens: 250,
            responseMimeType: 'application/json',
          },
        }),
      });

      const elapsed = Date.now() - startTime;
      console.log(`[SKIN_CONDITION_AI] 📥 Network: Response received in ${elapsed}ms! HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[SKIN_CONDITION_AI] ❌ Gemini (${model}) Request FAILED (HTTP ${response.status}):\n${errText}`);
        return null;
      }
      const data = await response.json();
      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      console.log(`[SKIN_CONDITION_AI] 📜 ==================== RAW GEMINI ANSWER RECEIVED ====================\n${resultText}\n========================================================================`);
      return resultText;
    } finally {
      cleanup();
    }
  };

  try {
    const textPrimary = await callModel(PRIMARY_MODEL);
    if (textPrimary) return extractJsonFromString(textPrimary);
  } catch (e: any) {
    console.warn(`[SKIN_CONDITION_AI] ⚠️ Gemini (${PRIMARY_MODEL}) error:`, e?.message || e);
  }

  return null;
}

/**
 * Offline / Safe Rule-Based Heuristic Fallback
 */
function computeOfflineFallbackTicket(userAnswer: string): {
  category: SkinAxisCategory;
  intensity: number;
  peakHours: number;
  halfLifeHours: number;
} {
  const lower = userAnswer.toLowerCase();

  if (lower.includes('water') || lower.includes('drink') || lower.includes('hydrat')) {
    return { category: 'hydration', intensity: 0.5, peakHours: 3, halfLifeHours: 8 };
  }
  if (lower.includes('oil') || lower.includes('sebum') || lower.includes('greas') || lower.includes('pore')) {
    return { category: 'sebum', intensity: 0.6, peakHours: 8, halfLifeHours: 24 };
  }
  if (lower.includes('peel') || lower.includes('acid') || lower.includes('retin') || lower.includes('burn')) {
    return { category: 'barrier', intensity: 0.75, peakHours: 24, halfLifeHours: 72 };
  }
  if (lower.includes('sun') || lower.includes('tan') || lower.includes('dark spot') || lower.includes('pigment')) {
    return { category: 'pigmentation', intensity: 0.65, peakHours: 48, halfLifeHours: 168 };
  }
  if (lower.includes('puff') || lower.includes('eye') || lower.includes('swell') || lower.includes('alcohol')) {
    return { category: 'edema', intensity: 0.7, peakHours: 4, halfLifeHours: 12 };
  }

  // Default fallback: general acute inflammatory response
  return { category: 'inflammation', intensity: 0.5, peakHours: 24, halfLifeHours: 48 };
}

/**
 * ============================================================================
 * MAIN EXPORT: Translate Custom Item into ClinicalTriggerTicket
 * ============================================================================
 */
export async function ingestCustomItemWithAi(
  answer: SanitizedQuestionAnswer,
  signal?: AbortSignal
): Promise<ClinicalTriggerTicket> {
  const cacheKey = `${answer.questionKey}:::${answer.rawString.trim().toLowerCase()}`;
  const cache = await loadTicketCache();

  // 1. Check persistent local cache first (0ms, zero network)
  if (cache[cacheKey]) {
    const cached = cache[cacheKey];
    return {
      id: `${answer.questionKey}_ai_${answer.answeredAt}`,
      sourceKey: answer.questionKey,
      sourceLabel: answer.subtitle,
      category: cached.category,
      intensity: cached.intensity,
      peakHours: cached.peakHours,
      halfLifeHours: cached.halfLifeHours,
      loggedAt: answer.answeredAt,
      hoursAgo: answer.hoursAgo,
      origin: 'ai_ingestion',
    };
  }

  // 2. Build prompt using Stage 2 Bridge contract
  const prompt = buildIngestionAiPrompt({
    questionTitle: answer.subtitle || answer.questionKey,
    userAnswer: answer.rawString,
    dataType: answer.dataType || 'text',
  });

  // 3. Call Gemini
  let ticketData: {
    category: SkinAxisCategory;
    intensity: number;
    peakHours: number;
    halfLifeHours: number;
  } | null = null;

  if (getGeminiApiKey()) {
    const rawAiResult = await callGeminiForTicket(prompt, signal);
    if (rawAiResult) {
      ticketData = sanitizeAiResponse(rawAiResult);
    }
  }

  // 4. If AI call failed, use robust offline fallback
  if (!ticketData) {
    ticketData = computeOfflineFallbackTicket(answer.rawString);
  }

  // 5. Persist to cache locally for all future runs
  await saveTicketToCache(cacheKey, ticketData);

  return {
    id: `${answer.questionKey}_ai_${answer.answeredAt}`,
    sourceKey: answer.questionKey,
    sourceLabel: answer.subtitle,
    category: ticketData.category,
    intensity: ticketData.intensity,
    peakHours: ticketData.peakHours,
    halfLifeHours: ticketData.halfLifeHours,
    loggedAt: answer.answeredAt,
    hoursAgo: answer.hoursAgo,
    origin: 'ai_ingestion',
  };
}

/**
 * ============================================================================
 * SKIN CONDITION VALIDATION & CLASSIFICATION (Question 1 Custom Conditions)
 * ============================================================================
 * When a user types a custom condition on the 3D Face Map, this module:
 * 1. Checks the in-memory + AsyncStorage cache for a previous classification.
 * 2. If not cached, calls Gemini to validate AND classify in a single call.
 * 3. If gibberish / non-skin input, returns isValid: false with suggestions.
 * 4. If valid, caches the clinical 4-number ticket for 0ms future lookups.
 */

// In-memory skin condition cache synced with AsyncStorage
let memorySkinConditionCache: Record<string, SkinConditionValidationResult> | null = null;

async function loadSkinConditionCache(): Promise<Record<string, SkinConditionValidationResult>> {
  if (memorySkinConditionCache !== null) return memorySkinConditionCache;
  try {
    const raw = await AsyncStorage.getItem(SKIN_CONDITION_CACHE_KEY);
    if (raw) {
      memorySkinConditionCache = JSON.parse(raw);
      return memorySkinConditionCache || {};
    }
  } catch {
    // ignore storage read failure
  }
  memorySkinConditionCache = {};
  return memorySkinConditionCache;
}

async function saveSkinConditionToCache(
  cacheKey: string,
  result: SkinConditionValidationResult
) {
  try {
    const cache = await loadSkinConditionCache();
    cache[cacheKey] = result;
    memorySkinConditionCache = cache;
    await AsyncStorage.setItem(SKIN_CONDITION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage write failure
  }
}

/**
 * SYNCHRONOUS cache reader for resolveSkinMapTickets (which must stay sync).
 * Returns the cached 4-number ticket data if the condition was previously
 * classified by Gemini, or null if not yet classified.
 */
export function getCachedSkinConditionTicket(conditionText: string): {
  category: SkinAxisCategory;
  intensity: number;
  peakHours: number;
  halfLifeHours: number;
} | null {
  if (!memorySkinConditionCache) return null;
  const key = conditionText.trim().toLowerCase();
  const cached = memorySkinConditionCache[key];
  if (cached && cached.isValid && cached.category && cached.intensity != null) {
    return {
      category: cached.category,
      intensity: cached.intensity,
      peakHours: cached.peakHours ?? 24,
      halfLifeHours: cached.halfLifeHours ?? 48,
    };
  }
  return null;
}

/**
 * Boot-time preloader: call once at app startup so the in-memory cache is
 * warm before any synchronous resolveSkinMapTickets reads.
 */
export async function preloadSkinConditionCache(): Promise<void> {
  await loadSkinConditionCache();
}

/**
 * Builds the Gemini prompt for validating + classifying a custom skin condition.
 * Highly token-optimized for low latency and minimal input costs at scale.
 */
function buildSkinConditionValidationPrompt(conditionText: string, zoneName: string): string {
  return `Clinical skin validator.
Input: "${conditionText}" | Face Zone: "${zoneName}".

Rules:
1. VALID: Real skin concern/symptom/condition (e.g. wrinkles, dryness, acne, redness, milia).
   Retain the user's exact phrasing and casing in "resolvedName". Classify biological axis & kinetics.
2. INVALID: Gibberish, random letters, non-skin words, or severe typos.
   Generate 3 contextual suggestions based on closest phonetic/typo match or common conditions for "${zoneName}". Do NOT return generic placeholders.

Respond strictly in JSON:
If valid: {"isValid":true,"resolvedName":"${conditionText}","category":"hydration"|"barrier"|"inflammation"|"sebum"|"turnover"|"pigmentation"|"edema","intensity":0.1-1.0,"peakHours":2-72,"halfLifeHours":6-168}
If invalid: {"isValid":false,"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}`;
}

/**
 * MAIN EXPORT: Validate and classify a custom skin condition from Question 1.
 *
 * Called from SkinExperienceQuestionView when the user types a custom condition.
 * - Checks local cache first (0ms).
 * - If not cached, calls Gemini for validation + classification.
 * - Caches valid results permanently.
 * - Returns { isValid: false, suggestions } for gibberish.
 */
export async function validateCustomSkinCondition(
  conditionText: string,
  zoneName: string,
  signal?: AbortSignal
): Promise<SkinConditionValidationResult> {
  const cacheKey = conditionText.trim().toLowerCase();
  console.log(`[SKIN_CONDITION_AI] 🔍 [Worker] Validating condition: "${conditionText}" for zone: "${zoneName}"`);

  // 1. Check cache first (0ms)
  const cache = await loadSkinConditionCache();
  if (cache[cacheKey]) {
    console.log(`[SKIN_CONDITION_AI] ⚡ [Worker] Cache HIT for "${conditionText}":`, JSON.stringify(cache[cacheKey]));
    return cache[cacheKey];
  }
  console.log(`[SKIN_CONDITION_AI] 🌐 [Worker] Cache MISS for "${conditionText}". Calling Gemini...`);

  // 2. Build prompt and call Gemini
  const prompt = buildSkinConditionValidationPrompt(conditionText, zoneName);
  let rawResult: any = null;

  if (getGeminiApiKey()) {
    rawResult = await callGeminiForTicket(prompt, signal);
  } else {
    console.error('[SKIN_CONDITION_AI] ❌ No API key available');
  }

  console.log(`[SKIN_CONDITION_AI] 📦 [Worker] Gemini raw parsed result:`, JSON.stringify(rawResult));

  // 3. Parse and validate the AI response
  if (rawResult && typeof rawResult === 'object') {
    if (rawResult.isValid === false) {
      console.log(`[SKIN_CONDITION_AI] 🚫 [Worker] Gemini determined condition is INVALID (gibberish/non-skin). Suggestions:`, rawResult.suggestions);
      const invalidResult: SkinConditionValidationResult = {
        isValid: false,
        suggestions: Array.isArray(rawResult.suggestions)
          ? rawResult.suggestions.slice(0, 5).map((s: any) => String(s))
          : ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
      };
      await saveSkinConditionToCache(cacheKey, invalidResult);
      return invalidResult;
    }

    // Valid condition — sanitize clinical numbers
    const validCategories: SkinAxisCategory[] = [
      'hydration', 'barrier', 'inflammation', 'sebum', 'turnover', 'pigmentation', 'edema',
    ];
    const category = String(rawResult.category || '').toLowerCase().trim() as SkinAxisCategory;

    if (validCategories.includes(category)) {
      let intensity = typeof rawResult.intensity === 'number' ? rawResult.intensity : 0.5;
      intensity = Math.max(0.1, Math.min(1.0, intensity));

      let peakHours = typeof rawResult.peakHours === 'number' ? rawResult.peakHours : 24;
      peakHours = Math.max(2, Math.min(72, peakHours));

      let halfLifeHours = typeof rawResult.halfLifeHours === 'number' ? rawResult.halfLifeHours : 48;
      halfLifeHours = Math.max(6, Math.min(168, halfLifeHours));

      const validResult: SkinConditionValidationResult = {
        isValid: true,
        resolvedName: typeof rawResult.resolvedName === 'string'
          ? rawResult.resolvedName.trim()
          : conditionText.trim(),
        category,
        intensity: Math.round(intensity * 100) / 100,
        peakHours: Math.round(peakHours),
        halfLifeHours: Math.round(halfLifeHours),
      };

      console.log(`[SKIN_CONDITION_AI] ✅ [Worker] Condition VALID. Classified as:`, JSON.stringify(validResult));
      await saveSkinConditionToCache(cacheKey, validResult);
      return validResult;
    }
  }

  // 4. AI call failed or returned unparseable data — treat as network error,
  //    do NOT silently accept. Return invalid with generic suggestions.
  console.warn(`[SKIN_CONDITION_AI] ⚠️ [Worker] AI call failed or returned null. Returning fallback suggestions.`);
  return {
    isValid: false,
    suggestions: ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
  };
}

/**
 * ============================================================================
 * CUSTOM ZONE & CUSTOM SEVERITY VALIDATORS (Ultra-compact & token-optimized)
 * ============================================================================
 */
let memoryZoneCache: Record<string, GenericValidationResult> | null = null;
let memorySeverityCache: Record<string, GenericValidationResult> | null = null;

async function loadZoneCache(): Promise<Record<string, GenericValidationResult>> {
  if (memoryZoneCache !== null) return memoryZoneCache;
  try {
    const raw = await AsyncStorage.getItem(SKIN_ZONE_CACHE_KEY);
    if (raw) {
      memoryZoneCache = JSON.parse(raw);
      return memoryZoneCache || {};
    }
  } catch {}
  memoryZoneCache = {};
  return memoryZoneCache;
}

async function loadSeverityCache(): Promise<Record<string, GenericValidationResult>> {
  if (memorySeverityCache !== null) return memorySeverityCache;
  try {
    const raw = await AsyncStorage.getItem(SKIN_SEVERITY_CACHE_KEY);
    if (raw) {
      memorySeverityCache = JSON.parse(raw);
      return memorySeverityCache || {};
    }
  } catch {}
  memorySeverityCache = {};
  return memorySeverityCache;
}

/**
 * Validates a custom face zone (e.g. "Neck", "Upper lip", "Behind ears")
 */
export async function validateCustomSkinZone(
  zoneText: string,
  signal?: AbortSignal
): Promise<GenericValidationResult> {
  const cacheKey = zoneText.trim().toLowerCase();
  console.log(`[SKIN_ZONE_AI] 🔍 [Worker] Validating custom zone: "${zoneText}"`);

  const cache = await loadZoneCache();
  if (cache[cacheKey]) {
    console.log(`[SKIN_ZONE_AI] ⚡ [Worker] Cache HIT for "${zoneText}":`, JSON.stringify(cache[cacheKey]));
    return cache[cacheKey];
  }

  const prompt = `Anatomical zone validator. Input: "${zoneText}".
Rules:
1. VALID: Human face, head, neck, or skin area (e.g. Neck, Hairline, Upper Lip).
   Retain user's exact phrasing/casing in "resolvedName".
2. INVALID: Non-body words, gibberish, animals, objects.
   Generate 3 real skin/face zone suggestions. Do NOT use generic placeholders.

Respond strictly in JSON:
If valid: {"isValid":true,"resolvedName":"${zoneText}"}
If invalid: {"isValid":false,"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}`;

  let rawResult: any = null;
  if (getGeminiApiKey()) {
    rawResult = await callGeminiForTicket(prompt, signal);
  }

  if (rawResult && typeof rawResult === 'object') {
    const res: GenericValidationResult = {
      isValid: Boolean(rawResult.isValid),
      resolvedName: typeof rawResult.resolvedName === 'string' ? rawResult.resolvedName.trim() : zoneText.trim(),
      suggestions: Array.isArray(rawResult.suggestions) ? rawResult.suggestions.slice(0, 3) : ['Neck', 'Upper Lip', 'Jawline'],
    };
    try {
      cache[cacheKey] = res;
      memoryZoneCache = cache;
      await AsyncStorage.setItem(SKIN_ZONE_CACHE_KEY, JSON.stringify(cache));
    } catch {}
    return res;
  }

  return { isValid: false, suggestions: ['Neck', 'Upper Lip', 'Jawline'] };
}

/**
 * Validates a custom severity level label (e.g. "Severe itching", "Mild redness")
 */
export async function validateCustomSkinSeverity(
  severityText: string,
  level: number,
  signal?: AbortSignal
): Promise<GenericValidationResult> {
  const cacheKey = `${level}:::${severityText.trim().toLowerCase()}`;
  console.log(`[SKIN_SEVERITY_AI] 🔍 [Worker] Validating severity label: "${severityText}" for level ${level}`);

  const cache = await loadSeverityCache();
  if (cache[cacheKey]) {
    console.log(`[SKIN_SEVERITY_AI] ⚡ [Worker] Cache HIT for "${severityText}":`, JSON.stringify(cache[cacheKey]));
    return cache[cacheKey];
  }

  const prompt = `Skin severity label validator. Input: "${severityText}" | Scale Level: ${level}.
Rules:
1. VALID: Real symptom, sensation, or severity description (e.g. Mild itch, Severe stinging, Bleeding).
   Retain user's exact phrasing/casing in "resolvedName".
2. INVALID: Non-symptom words, gibberish, objects.
   Generate 3 real severity/symptom suggestions for scale level ${level}. Do NOT use generic placeholders.

Respond strictly in JSON:
If valid: {"isValid":true,"resolvedName":"${severityText}"}
If invalid: {"isValid":false,"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}`;

  let rawResult: any = null;
  if (getGeminiApiKey()) {
    rawResult = await callGeminiForTicket(prompt, signal);
  }

  if (rawResult && typeof rawResult === 'object') {
    const res: GenericValidationResult = {
      isValid: Boolean(rawResult.isValid),
      resolvedName: typeof rawResult.resolvedName === 'string' ? rawResult.resolvedName.trim() : severityText.trim(),
      suggestions: Array.isArray(rawResult.suggestions) ? rawResult.suggestions.slice(0, 3) : ['Moderate discomfort', 'Severe flare-up', 'Mild irritation'],
    };
    try {
      cache[cacheKey] = res;
      memorySeverityCache = cache;
      await AsyncStorage.setItem(SKIN_SEVERITY_CACHE_KEY, JSON.stringify(cache));
    } catch {}
    return res;
  }

  return { isValid: false, suggestions: ['Moderate discomfort', 'Severe flare-up', 'Mild irritation'] };
}
