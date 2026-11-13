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
import {
  ClinicalTriggerTicket,
  SkinAxisCategory,
  buildIngestionAiPrompt,
} from './stage2IngestionBridge';
import { SanitizedQuestionAnswer } from './stage1RawDataRules';

// Gemini API Key from environment
function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
}

const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

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

const ASYNC_STORAGE_TICKET_CACHE_KEY = 'skinstory_ai_ingestion_ticket_cache_v1';

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
 * Calls Gemini directly with fallback model support
 */
async function callGeminiForTicket(prompt: string, signal?: AbortSignal): Promise<any> {
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
          temperature: 0.1, // Near-deterministic clinical precision
          maxOutputTokens: 250,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  };

  try {
    try {
      const textPrimary = await callModel(PRIMARY_MODEL);
      if (textPrimary) return extractJsonFromString(textPrimary);
    } catch {
      // Try fallback
    }

    try {
      const textFallback = await callModel(FALLBACK_MODEL);
      if (textFallback) return extractJsonFromString(textFallback);
    } catch {
      // Network or parse failure
    }
  } finally {
    cleanup();
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
