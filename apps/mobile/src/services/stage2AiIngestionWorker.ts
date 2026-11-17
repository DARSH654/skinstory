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
import * as FileSystem from 'expo-file-system/legacy';
import type {
  ClinicalTriggerTicket,
  SkinAxisCategory,
} from './stage2IngestionBridge';
import { SanitizedQuestionAnswer } from './stage1RawDataRules';

// Gemini API Key from environment
function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
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
  isNetworkError?: boolean;
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
  isNetworkError?: boolean;
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
  isRelevant: boolean;
  visualSummary?: string;
  category: SkinAxisCategory;
  intensity: number;
  peakHours: number;
  halfLifeHours: number;
} | null {
  const validCategories: (SkinAxisCategory | 'none')[] = [
    'hydration',
    'barrier',
    'inflammation',
    'sebum',
    'turnover',
    'pigmentation',
    'edema',
    'none',
  ];

  if (!parsed || typeof parsed !== 'object') return null;

  const rawCat = String(parsed.category || '').toLowerCase().trim();
  const category = (rawCat === 'none' || rawCat === 'null' || !rawCat ? 'none' : rawCat) as SkinAxisCategory;
  if (!validCategories.includes(category)) return null;

  let intensity = typeof parsed.intensity === 'number' ? parsed.intensity : 0.0;
  intensity = Math.max(-1.0, Math.min(1.0, intensity));

  const isRelevant = parsed.isRelevant !== false && Math.abs(intensity) >= 0.01 && (category as any) !== 'none';

  let peakHours = typeof parsed.peakHours === 'number' ? parsed.peakHours : 24;
  peakHours = Math.max(0, Math.min(168, peakHours));

  let halfLifeHours = typeof parsed.halfLifeHours === 'number' ? parsed.halfLifeHours : 48;
  halfLifeHours = Math.max(0, Math.min(336, halfLifeHours));

  const visualSummary = typeof parsed.visualSummary === 'string' && parsed.visualSummary.trim().length > 0
    ? parsed.visualSummary.trim()
    : undefined;

  return {
    isRelevant,
    visualSummary,
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
    semanticScale?: { level: number; label: string; range: string };
  }
): string {
  const isImage = customItem.dataType === 'image';
  const isMultiSelect = customItem.dataType === 'multi_select';
  const isScale = customItem.dataType === 'scale';

  let rules = "";
  if (isImage) {
    rules = `Rules:
1. Face selfie: isRelevant:false, intensity:0, category:"none", visualSummary:"Face / skin selfie".
2. Skincare product: isRelevant:true, visualSummary:2-5 word name, classify biological impact.
3. Food/Drink: isRelevant:true, visualSummary:2-4 word food, classify skin impact.
4. Unrelated/Object: isRelevant:false, intensity:0, category:"none", visualSummary:2-4 word object.`;
  } else if (isMultiSelect) {
    rules = `Rules:
1. Multiple items selected. Scale intensity to COUNT and harshness: 1 item=0.2-0.4, 2-3 items=0.5-0.7, 4+ items=0.75-0.85 (cap: 0.85). Protective items=negative.
2. Gibberish/no impact: isRelevant:false, intensity:0, category:"none".`;
  } else if (isScale) {
    rules = `Rules:
1. Scaled rating. Position: low=0.05-0.15, mid=0.35-0.5, peak=0.7-0.9.
2. Invalid/gibberish: isRelevant:false, intensity:0, category:"none".`;
  } else {
    rules = `Rules:
1. Correlate factor to skin impact (isRelevant:true).
2. Gibberish/unrelated/zero impact: isRelevant:false, intensity:0, category:"none".`;
  }

  const inputLine = isImage
    ? `Input: "${customItem.questionTitle}" | [Attached Image] (Type: image)`
    : isScale
    ? `Input: "${customItem.questionTitle}" | Rating: Level ${customItem.semanticScale?.level || customItem.userAnswer} of ${customItem.semanticScale?.range || '1-5'} ("${customItem.semanticScale?.label || ''}") (Type: scale)`
    : `Input: "${customItem.questionTitle}" | Answer: "${customItem.userAnswer}" (Type: ${customItem.dataType})`;

  return `Skin biology classifier. Translate log into 1 biological ticket.
Categories: hydration, barrier, inflammation, sebum, turnover, pigmentation, edema, none.
${rules}
${inputLine}
JSON:
{"isRelevant":true|false,"visualSummary":"2-5 words or empty","category":"hydration"|"barrier"|"inflammation"|"sebum"|"turnover"|"pigmentation"|"edema"|"none","intensity":-1.0 to 1.0,"peakHours":2-72,"halfLifeHours":6-168}`;
}


/**
 * Calls Gemini directly with fallback model support and multimodal image support
 */
async function callGeminiForTicket(
  prompt: string,
  signal?: AbortSignal,
  imagePayload?: { base64: string; mimeType: string } | null
): Promise<any> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.error('[SKIN_CONDITION_AI] ❌ API Key is missing! Check EXPO_PUBLIC_GEMINI_API_KEY.');
    return null;
  }

  const callModel = async (model: string): Promise<string | null> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`[SKIN_CONDITION_AI] 📡 Network: Dispatching request to Gemini (${model})${imagePayload ? ' with attached image' : ''}...`);
    console.log(`[SKIN_CONDITION_AI] 📝 ==================== EXACT PROMPT SENT TO GEMINI ====================\n${prompt}\n========================================================================`);
    // Each attempt gets its own independent 15s timeout
    const { signal: timeoutSignal, cleanup } = createTimeoutSignal(signal, 15000);

    try {
      const parts: any[] = [{ text: prompt }];
      if (imagePayload?.base64) {
        parts.push({
          inlineData: {
            mimeType: imagePayload.mimeType,
            data: imagePayload.base64,
          },
        });
      }

      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: timeoutSignal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
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
 * ============================================================================
 * MAIN EXPORT: Translate Custom Item into ClinicalTriggerTicket
 * ============================================================================
 */
export async function ingestCustomItemWithAi(
  answer: SanitizedQuestionAnswer,
  signal?: AbortSignal
): Promise<ClinicalTriggerTicket | null> {
  const cacheKey = `${answer.questionKey}:::${answer.rawString.trim().toLowerCase()}`;
  const cache = await loadTicketCache();

  // 1. Check persistent local cache first (0ms, zero network)
  if (cache[cacheKey]) {
    const cached = cache[cacheKey];
    console.log(`[STAGE 2 - AI INGESTION] ⚡ Cache HIT for "${cacheKey}". Reusing locally saved numbers: Category=${cached.category}, Intensity=${cached.intensity}, Peak=${cached.peakHours}h, HalfLife=${cached.halfLifeHours}h (0 AI calls, 0ms)`);
    return {
      id: `${answer.questionKey}_ai_${answer.answeredAt}`,
      sourceKey: answer.questionKey,
      sourceLabel: (cached.visualSummary && answer.dataType === 'image') ? cached.visualSummary : (answer.subtitle || answer.questionKey),
      category: cached.category,
      intensity: cached.intensity,
      peakHours: cached.peakHours,
      halfLifeHours: cached.halfLifeHours,
      loggedAt: answer.answeredAt,
      hoursAgo: answer.hoursAgo,
      origin: 'ai_ingestion',
      isRelevant: cached.isRelevant,
      visualSummary: cached.visualSummary,
    };
  }

  console.log(`[STAGE 2 - AI INGESTION] 🌐 Cache MISS for "${cacheKey}". Custom Question: "${answer.subtitle}", User Answer: "${answer.rawString}". Calling Gemini to convert to biological numbers...`);

  // 2. Prepare image payload if image dataType
  let imagePayload: { base64: string; mimeType: string } | null = null;
  if (answer.dataType === 'image' && answer.rawString) {
    try {
      const cleanUri = answer.rawString.trim();
      const ext = cleanUri.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const base64 = await FileSystem.readAsStringAsync(cleanUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (base64) {
        imagePayload = { base64, mimeType };
      }
    } catch (err: any) {
      console.warn(`[STAGE 2 - AI INGESTION] ⚠️ Could not read image file for vision ingestion:`, err?.message || err);
    }
  }

  // Guard against visual hallucination: If this is an image question but the file
  // could not be loaded into memory, NEVER call Gemini with an empty picture payload.
  if (answer.dataType === 'image' && !imagePayload) {
    console.warn(`[STAGE 2 - AI INGESTION] 🚫 Image payload is missing or unreadable for "${answer.subtitle}". Skipping AI call to prevent hallucination.`);
    return null;
  }

  // 3. Build prompt using Stage 2 Bridge contract
  const prompt = buildIngestionAiPrompt({
    questionTitle: answer.subtitle || answer.questionKey,
    userAnswer: answer.rawString,
    dataType: answer.dataType || 'text',
    semanticScale: answer.semanticPayload?.scale,
  });
  console.log(`[STAGE 2 - AI INGESTION] 📝 ==================== EXACT PROMPT SENT TO GEMINI (STAGE 2) ====================\n${prompt}\n========================================================================`);

  // 4. Call Gemini
  let ticketData: {
    isRelevant: boolean;
    visualSummary?: string;
    category: SkinAxisCategory;
    intensity: number;
    peakHours: number;
    halfLifeHours: number;
  } | null = null;

  if (getGeminiApiKey()) {
    const rawAiResult = await callGeminiForTicket(prompt, signal, imagePayload);
    if (rawAiResult) {
      console.log(`[STAGE 2 - AI INGESTION] 📜 ==================== RAW GEMINI ANSWER RECEIVED (STAGE 2) ====================\n${JSON.stringify(rawAiResult, null, 2)}\n========================================================================`);
      ticketData = sanitizeAiResponse(rawAiResult);
    }
  }

  // 5. Strict Zero-Fallback Policy: If network fails, Gemini is unreachable,
  // or input was classified as non-skin / irrelevant ("none"), return null.
  if (!ticketData || !ticketData.isRelevant || ticketData.category === ("none" as any)) {
    console.warn(`[STAGE 2 - AI INGESTION] 🚫 Ignored ticket (irrelevant, "none" category, or network failure) for "${answer.subtitle}".`);
    return null;
  }

  console.log(`[STAGE 2 - AI INGESTION] ✅ [Worker] Ingested biological ticket: Category=${ticketData.category}, Intensity=${ticketData.intensity}, Relevant=${ticketData.isRelevant}, VisualSummary="${ticketData.visualSummary || ''}". Saving to AsyncStorage...`);
  // 6. Persist verified AI tickets to cache locally for all future runs
  await saveTicketToCache(cacheKey, ticketData);

  return {
    id: `${answer.questionKey}_ai_${answer.answeredAt}`,
    sourceKey: answer.questionKey,
    sourceLabel: (ticketData.visualSummary && answer.dataType === 'image') ? ticketData.visualSummary : (answer.subtitle || answer.questionKey),
    category: ticketData.category,
    intensity: ticketData.intensity,
    peakHours: ticketData.peakHours,
    halfLifeHours: ticketData.halfLifeHours,
    loggedAt: answer.answeredAt,
    hoursAgo: answer.hoursAgo,
    origin: 'ai_ingestion',
    isRelevant: ticketData.isRelevant,
    visualSummary: ticketData.visualSummary,
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
  return `Skin validator. Input: "${conditionText}" | Zone: "${zoneName}".
Rules:
1. VALID: Real skin symptom/issue on any body zone. Keep exact phrasing in "resolvedName". Pick 1 category & kinetics.
2. INVALID: Gibberish, non-skin words, bad typos. Give 3 closest real suggestions for "${zoneName}".
JSON format:
Valid: {"isValid":true,"resolvedName":"${conditionText}","category":"hydration"|"barrier"|"inflammation"|"sebum"|"turnover"|"pigmentation"|"edema","intensity":0.1-1.0,"peakHours":2-72,"halfLifeHours":6-168}
Invalid: {"isValid":false,"suggestions":["s1","s2","s3"]}`;
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
  //    do NOT silently accept. Return invalid with generic suggestions and flag isNetworkError.
  console.warn(`[SKIN_CONDITION_AI] ⚠️ [Worker] AI call failed or returned null. Returning fallback suggestions.`);
  return {
    isValid: false,
    suggestions: ['Acne / Breakout', 'Dryness / Flaking', 'Redness / Irritation'],
    isNetworkError: true,
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

  const prompt = `Skin zone validator. Input: "${zoneText}".
Rules:
1. VALID: Any human body skin area. Keep exact phrasing in "resolvedName".
2. INVALID: Non-anatomical words, objects, food, gibberish. Give 3 real zone suggestions.
JSON:
Valid: {"isValid":true,"resolvedName":"${zoneText}"}
Invalid: {"isValid":false,"suggestions":["s1","s2","s3"]}`;

  let rawResult: any = null;
  if (getGeminiApiKey()) {
    rawResult = await callGeminiForTicket(prompt, signal);
  }

  if (rawResult && typeof rawResult === 'object') {
    const res: GenericValidationResult = {
      isValid: Boolean(rawResult.isValid),
      resolvedName: typeof rawResult.resolvedName === 'string' ? rawResult.resolvedName.trim() : zoneText.trim(),
      suggestions: Array.isArray(rawResult.suggestions) ? rawResult.suggestions.slice(0, 3) : ['Neck', 'Chest', 'Hands'],
    };
    try {
      cache[cacheKey] = res;
      memoryZoneCache = cache;
      await AsyncStorage.setItem(SKIN_ZONE_CACHE_KEY, JSON.stringify(cache));
    } catch {}
    return res;
  }

  return { isValid: false, suggestions: ['Neck', 'Chest', 'Hands'], isNetworkError: true };
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

  const prompt = `Skin symptom severity validator. Input: "${severityText}" | Level: ${level}.
Rules:
1. VALID: Real skin symptom, sensation, or discomfort. Keep exact phrasing in "resolvedName".
2. INVALID: Non-symptom words, objects, gibberish. Give 3 real symptom suggestions for level ${level}.
JSON:
Valid: {"isValid":true,"resolvedName":"${severityText}"}
Invalid: {"isValid":false,"suggestions":["s1","s2","s3"]}`;

  let rawResult: any = null;
  if (getGeminiApiKey()) {
    rawResult = await callGeminiForTicket(prompt, signal);
  }

  if (rawResult && typeof rawResult === 'object') {
    const res: GenericValidationResult = {
      isValid: Boolean(rawResult.isValid),
      resolvedName: typeof rawResult.resolvedName === 'string' ? rawResult.resolvedName.trim() : severityText.trim(),
      suggestions: Array.isArray(rawResult.suggestions) ? rawResult.suggestions.slice(0, 3) : ['Moderate discomfort', 'Mild irritation', 'Severe flare-up'],
    };
    try {
      cache[cacheKey] = res;
      memorySeverityCache = cache;
      await AsyncStorage.setItem(SKIN_SEVERITY_CACHE_KEY, JSON.stringify(cache));
    } catch {}
    return res;
  }

  return { isValid: false, suggestions: ['Moderate discomfort', 'Mild irritation', 'Severe flare-up'], isNetworkError: true };
}
