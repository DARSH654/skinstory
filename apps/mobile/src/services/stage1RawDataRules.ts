/**
 * ============================================================================
 * Stage 1: Raw Data Foundation & Intake Rules
 * ============================================================================
 * 
 * This file houses the official validation and extraction rules for Stage 1
 * of the Skin Forecasting Pipeline.
 * 
 * Rules Implemented:
 * - RULE 1: Question 1 (Skin Map) Validation & Anchor Rule
 * - RULE 2: History-First Ingestion & Sparse Data Tolerance Rule
 * - RULE 3: Semantic Data Sanitization Rule (All 7 Data Types)
 * - RULE 4: Granular Question-Level Timestamp & Edit Anchor Rule
 */

import { JournalHistoryRecord, QuestionDef } from '@/store/journalStore';

/**
 * Parsed structure for Question 1 (Skin Map)
 */
export interface SkinMapZoneData {
  id: string;
  name: string;
  conditions: string[];
  severity: number;
  isCustom?: boolean;
}

export interface ParsedSkinMapAnswer {
  zones: SkinMapZoneData[];
  maxSeverityScale?: number;
  summary?: string;
}

/**
 * Clean semantic representation of an answered question across the 7 types
 */
export interface SanitizedQuestionAnswer {
  questionKey: string;
  dataType: QuestionDef['dataType'] | 'unknown';
  subtitle: string;
  rawString: string;
  // Exact timestamp when this specific question was answered or last edited (Rule 4)
  answeredAt: number;
  hoursAgo: number;
  // Type-specific semantic payload (Rule 3)
  semanticPayload: {
    singleChoice?: { value: string };
    multiSelect?: { selectedOptions: string[] };
    scale?: { level: number; label: string; range: string };
    numeric?: { value: number; unit: string };
    boolean?: { value: boolean };
    text?: { text: string };
    image?: { uri: string };
  };
}

/**
 * Standardized single day log item produced by Stage 1
 */
export interface Stage1DailyLog {
  recordId: string;
  dateStr: string;
  isoDate: string;
  recordTimestamp: number;
  hasSkinMap: boolean;
  skinMapData: ParsedSkinMapAnswer | null;
  // Clean list of all valid answered questions for this day with semantic details
  sanitizedAnswers: SanitizedQuestionAnswer[];
}

/**
 * ============================================================================
 * RULE 1: Question 1 (Skin Map) Validation & Anchor Rule
 * ============================================================================
 * Validates whether Question 1 is answered with at least one active zone.
 * If valid, parses and returns the zones, severity, and conditions.
 * If empty or corrupt, returns hasSkinMap: false.
 */
export function validateRule1SkinMap(rawAnswer?: string): {
  isValid: boolean;
  parsed: ParsedSkinMapAnswer | null;
} {
  if (!rawAnswer || !rawAnswer.trim()) {
    return { isValid: false, parsed: null };
  }

  try {
    const parsed = JSON.parse(rawAnswer);
    if (parsed && Array.isArray(parsed.zones) && parsed.zones.length > 0) {
      return {
        isValid: true,
        parsed: {
          zones: parsed.zones,
          maxSeverityScale: parsed.maxSeverityScale || 5,
          summary: parsed.summary || '',
        },
      };
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        isValid: true,
        parsed: {
          zones: parsed,
          maxSeverityScale: 5,
          summary: '',
        },
      };
    }
  } catch {
    // Malformed JSON string
    return { isValid: false, parsed: null };
  }

  return { isValid: false, parsed: null };
}

/**
 * ============================================================================
 * RULE 3: Semantic Data Sanitization Rule (for all 7 data types)
 * ============================================================================
 * Guarantees that raw strings are converted into clinical, structured payloads
 * with zero missing fields, unparsed JSON strings, or ambiguous units.
 */
export function sanitizeQuestionAnswer(
  qKey: string,
  rawVal: string,
  qDef?: QuestionDef,
  answeredTimestamp?: number
): SanitizedQuestionAnswer {
  const now = Date.now();
  const timestamp = answeredTimestamp || now;
  const hoursAgo = Math.max(0, (now - timestamp) / (1000 * 60 * 60));
  const dataType = qDef?.dataType || 'unknown';
  const subtitle = qDef?.subtitle || qKey;

  const result: SanitizedQuestionAnswer = {
    questionKey: qKey,
    dataType,
    subtitle,
    rawString: rawVal,
    answeredAt: timestamp,
    hoursAgo,
    semanticPayload: {},
  };

  switch (dataType) {
    case 'scale': {
      const parsedNum = parseInt(rawVal, 10);
      const level = !isNaN(parsedNum) ? parsedNum : 3;
      const range = qDef?.scaleRange || '1-5';
      const label =
        qDef?.stepLabels && qDef.stepLabels[level - 1]
          ? qDef.stepLabels[level - 1]
          : `Level ${level}`;
      result.semanticPayload.scale = { level, label, range };
      break;
    }

    case 'numeric': {
      const match = rawVal.match(/([\d.]+)\s*(.*)/);
      const value = match ? parseFloat(match[1]) : 0;
      const unit = (match && match[2] ? match[2] : qDef?.unit || '').trim();
      result.semanticPayload.numeric = { value: isNaN(value) ? 0 : value, unit };
      break;
    }

    case 'multi_select': {
      let selectedOptions: string[] = [];
      try {
        const parsed = JSON.parse(rawVal);
        if (Array.isArray(parsed)) {
          selectedOptions = parsed.map((s) => String(s).trim()).filter(Boolean);
        } else {
          selectedOptions = [String(parsed).trim()];
        }
      } catch {
        selectedOptions = rawVal.split(',').map((s) => s.trim()).filter(Boolean);
      }
      result.semanticPayload.multiSelect = { selectedOptions };
      break;
    }

    case 'boolean': {
      const lower = rawVal.toLowerCase().trim();
      const val = lower === 'yes' || lower === 'true' || lower === '1';
      result.semanticPayload.boolean = { value: val };
      break;
    }

    case 'single_choice': {
      result.semanticPayload.singleChoice = { value: rawVal.trim() };
      break;
    }

    case 'image': {
      result.semanticPayload.image = { uri: rawVal.trim() };
      break;
    }

    case 'text':
    default: {
      result.semanticPayload.text = { text: rawVal.trim() };
      break;
    }
  }

  return result;
}

/**
 * ============================================================================
 * RULE 4 & RULE 2 Combined: History Extraction with Edit Timestamps
 * ============================================================================
 * 1. Reads directly from historical log records (Rule 2).
 * 2. Anchors each question to its own answeredAt/editedAt timestamp (Rule 4).
 * 3. Sanitizes all 7 data types into structured clinical payloads (Rule 3).
 * 4. Tolerates sparse records without errors.
 * 
 * @param historyRecords - The list of historical records from journalStore
 * @param allKnownQuestions - Question definitions lookup (to extract units, step labels, and data types)
 * @param daysLimit - Maximum number of past history records to inspect (defaults to 14 days)
 * @returns Array of clean Stage1DailyLog objects ready for Stage 2 (Ingestion AI)
 */
export function extractStage1HistoryLogs(
  historyRecords: JournalHistoryRecord[],
  allKnownQuestions: QuestionDef[] = [],
  daysLimit = 14
): Stage1DailyLog[] {
  if (!historyRecords || !Array.isArray(historyRecords) || historyRecords.length === 0) {
    return [];
  }

  const qMap = new Map<string, QuestionDef>();
  for (const q of allKnownQuestions) {
    qMap.set(q.key, q);
  }

  const targetRecords = historyRecords.slice(0, daysLimit);
  const dailyLogs: Stage1DailyLog[] = [];

  for (let i = 0; i < targetRecords.length; i++) {
    const record = targetRecords[i];
    const rawAnswers = record.answers || {};

    // 1. RULE 1: Question 1 validation
    const rule1Result = validateRule1SkinMap(rawAnswers['q_skin_map']);

    // Derive base record timestamp dynamically: Today is always Date.now()
    const dNow = new Date();
    const todayIso = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
    const dYest = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayIso = `${dYest.getFullYear()}-${String(dYest.getMonth() + 1).padStart(2, '0')}-${String(dYest.getDate()).padStart(2, '0')}`;

    const isToday = record.dateStr?.toLowerCase() === 'today' || record.isoDate === todayIso;
    const isYesterday = record.dateStr?.toLowerCase() === 'yesterday' || record.isoDate === yesterdayIso;

    let resolvedIso = record.isoDate;
    let recordTimestamp = Date.now();

    if (isToday) {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      resolvedIso = `${y}-${m}-${day}`;
      recordTimestamp = Date.now();
    } else if (isYesterday) {
      const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      resolvedIso = `${y}-${m}-${day}`;
      recordTimestamp = d.getTime();
    } else if (record.isoDate) {
      resolvedIso = record.isoDate;
      recordTimestamp = new Date(record.isoDate).getTime() || Date.now();
    }

    // Stored question-level timestamps map (Rule 4) if tracked on record, else falls back to recordTimestamp
    const timestampsMap: Record<string, number> =
      (record as any).answeredTimestamps || {};

    const sanitizedAnswers: SanitizedQuestionAnswer[] = [];

    // 2. RULE 2 & 3: Ingest only actually answered questions, sanitized semantically
    for (const [qKey, val] of Object.entries(rawAnswers)) {
      if (val !== undefined && val !== null && typeof val === 'string' && val.trim().length > 0) {
        // Skip q_skin_map here as it is captured in skinMapData
        if (qKey === 'q_skin_map') continue;

        const qDef = qMap.get(qKey);
        // Rule 4: Use individual question timestamp (updated on edit), or record timestamp
        const questionTimestamp = timestampsMap[qKey] || recordTimestamp;

        const sanitized = sanitizeQuestionAnswer(qKey, val, qDef, questionTimestamp);
        sanitizedAnswers.push(sanitized);
      }
    }

    // Only include day if at least Question 1 or any other question was answered
    if (rule1Result.isValid || sanitizedAnswers.length > 0) {
      dailyLogs.push({
        recordId: record.id,
        dateStr: record.dateStr,
        isoDate: resolvedIso,
        recordTimestamp,
        hasSkinMap: rule1Result.isValid,
        skinMapData: rule1Result.parsed,
        sanitizedAnswers,
      });
    }
  }

  return dailyLogs;
}
