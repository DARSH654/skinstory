/**
 * ============================================================================
 * Stage 2: Skin Biological Trigger Ingestion Bridge
 * ============================================================================
 * 
 * Plain-English Purpose:
 * Takes the clean outputs from Stage 1 (Stage1DailyLog[]) and converts them
 * into standardized 4-number clinical trigger tickets:
 *   { category, intensity, peakHours, halfLifeHours }
 * 
 * Architecture:
 * 1. Fast-Track Table (100% Deterministic, 0ms, Zero AI):
 *    Directly handles all unaltered default questions (water, sleep, routine, SPF, etc.)
 *    and default Question 1 conditions (cysts, pimples, flaking, etc.).
 * 
 * 2. Ingestion AI Router (Async Intelligent Interpretation):
 *    Identifies custom user questions, edited questions, free-form text, or images,
 *    and formats the clinical prompt to obtain the 4-number ticket.
 */

import { SanitizedQuestionAnswer, ParsedSkinMapAnswer } from './stage1RawDataRules';
import { QuestionDef } from '@/store/journalStore';

/**
 * The 7 MECE Clinical Skin Categories
 */
export type SkinAxisCategory =
  | 'hydration'
  | 'barrier'
  | 'inflammation'
  | 'sebum'
  | 'turnover'
  | 'pigmentation'
  | 'edema';

/**
 * The Standardized 4-Number Clinical Ticket
 */
export interface ClinicalTriggerTicket {
  id: string;
  sourceKey: string;
  sourceLabel: string;
  category: SkinAxisCategory;
  // Intensity: -1.0 (healing/protective) to +1.0 (severe aggravation/damage)
  intensity: number;
  // Peak Hours: hours from event onset until maximum biological impact
  peakHours: number;
  // Half-life Hours: hours until the biological effect naturally decays by 50%
  halfLifeHours: number;
  // Exact timestamp when this happened
  loggedAt: number;
  hoursAgo: number;
  // Source classification
  origin: 'default_fast_track' | 'ai_ingestion';
}

/**
 * ============================================================================
 * PART 1: Fast-Track Pre-Calibrated Lookup Tables (Zero AI)
 * ============================================================================
 */

// Condition mappings from Question 1 (Skin Map)
// Fully synchronized with all default zone conditions from SkinExperienceQuestionView
export const DEFAULT_CONDITION_TICKETS: Record<
  string,
  { category: SkinAxisCategory; intensity: number; peakHours: number; halfLifeHours: number }
> = {
  // Forehead / Cheeks / Jawline / Temples Acne Flares
  'Active breakouts / pimples': { category: 'inflammation', intensity: 0.7, peakHours: 36, halfLifeHours: 48 },
  'Active pimples': { category: 'inflammation', intensity: 0.7, peakHours: 36, halfLifeHours: 48 },
  'Acne breakouts': { category: 'inflammation', intensity: 0.75, peakHours: 36, halfLifeHours: 48 },
  'Hormonal breakouts': { category: 'inflammation', intensity: 0.8, peakHours: 48, halfLifeHours: 72 },
  'Cystic acne': { category: 'inflammation', intensity: 0.95, peakHours: 48, halfLifeHours: 96 },
  'Deep painful cysts': { category: 'inflammation', intensity: 0.95, peakHours: 48, halfLifeHours: 96 },
  'Subsurface bumps': { category: 'sebum', intensity: 0.5, peakHours: 24, halfLifeHours: 72 },
  'Subsurface texture': { category: 'turnover', intensity: -0.4, peakHours: 24, halfLifeHours: 72 },
  'Post-acne marks': { category: 'pigmentation', intensity: 0.6, peakHours: 48, halfLifeHours: 168 },
  
  // Sebum & Pores
  'Excess oil & shine': { category: 'sebum', intensity: 0.75, peakHours: 6, halfLifeHours: 12 },
  'Excess oil': { category: 'sebum', intensity: 0.75, peakHours: 6, halfLifeHours: 12 },
  'Excess oiliness': { category: 'sebum', intensity: 0.75, peakHours: 6, halfLifeHours: 12 },
  'Stubborn blackheads': { category: 'sebum', intensity: 0.5, peakHours: 24, halfLifeHours: 72 },
  'Enlarged visible pores': { category: 'sebum', intensity: 0.45, peakHours: 24, halfLifeHours: 72 },
  'Enlarged pores': { category: 'sebum', intensity: 0.45, peakHours: 24, halfLifeHours: 72 },
  'Blackheads & large pores': { category: 'sebum', intensity: 0.45, peakHours: 24, halfLifeHours: 72 },

  // Barrier & Dryness
  'Flaky dry patches': { category: 'barrier', intensity: 0.65, peakHours: 12, halfLifeHours: 36 },
  'Rough dry patches': { category: 'barrier', intensity: 0.6, peakHours: 12, halfLifeHours: 36 },
  'Dryness & peeling': { category: 'barrier', intensity: 0.7, peakHours: 16, halfLifeHours: 48 },

  // Inflammation & Redness
  'Redness & irritation': { category: 'inflammation', intensity: 0.7, peakHours: 8, halfLifeHours: 24 },
  'Redness & flushing': { category: 'inflammation', intensity: 0.75, peakHours: 6, halfLifeHours: 18 },
  'Redness around nostrils': { category: 'inflammation', intensity: 0.65, peakHours: 8, halfLifeHours: 24 },
  'Under-eye redness': { category: 'inflammation', intensity: 0.6, peakHours: 8, halfLifeHours: 24 },

  // Pigmentation
  'Hyperpigmentation': { category: 'pigmentation', intensity: 0.6, peakHours: 48, halfLifeHours: 168 },
  'Dark spots / Melasma': { category: 'pigmentation', intensity: 0.7, peakHours: 48, halfLifeHours: 240 },

  // Edema & Under-Eye
  'Puffy eyes': { category: 'edema', intensity: 0.7, peakHours: 4, halfLifeHours: 10 },
  'Under-eye bags': { category: 'edema', intensity: 0.65, peakHours: 4, halfLifeHours: 12 },
  'Dark circles': { category: 'edema', intensity: 0.5, peakHours: 8, halfLifeHours: 18 },
  'Morning puffiness': { category: 'edema', intensity: 0.75, peakHours: 4, halfLifeHours: 10 },
};

/**
 * Resolves Question 1 Skin Map data into clean tickets
 */
export function resolveSkinMapTickets(
  skinMapData: ParsedSkinMapAnswer | null,
  loggedAt: number,
  hoursAgo: number
): ClinicalTriggerTicket[] {
  if (!skinMapData || !skinMapData.zones || skinMapData.zones.length === 0) {
    return [];
  }

  const tickets: ClinicalTriggerTicket[] = [];
  const maxScale = skinMapData.maxSeverityScale || 5;

  for (const zone of skinMapData.zones) {
    // Severity multiplier from 0.3 (level 1) to 1.0 (max level)
    const severityVal = typeof zone.severity === 'number' ? zone.severity : 3;
    const severityMultiplier = Math.max(0.3, Math.min(1.0, severityVal / maxScale));
    const conditionsList = Array.isArray(zone.conditions)
      ? zone.conditions
      : (zone as any).condition
      ? [(zone as any).condition]
      : [];

    const zoneId = zone.id || (zone as any).zoneId || 'unknown';
    const zoneName = zone.name || (zone as any).zoneName || 'Skin Zone';

    for (const condition of conditionsList) {
      const template = DEFAULT_CONDITION_TICKETS[condition];
      if (template) {
        tickets.push({
          id: `q_skin_${zoneId}_${condition}_${loggedAt}`,
          sourceKey: 'q_skin_map',
          sourceLabel: `${zoneName}: ${condition}`,
          category: template.category,
          intensity: Math.round(template.intensity * severityMultiplier * 100) / 100,
          peakHours: template.peakHours,
          halfLifeHours: template.halfLifeHours,
          loggedAt,
          hoursAgo,
          origin: 'default_fast_track',
        });
      } else {
        // Fallback for custom user conditions added in Question 1:
        // By default assign to inflammation with standard acute flare timeline
        tickets.push({
          id: `q_skin_custom_${zoneId}_${condition}_${loggedAt}`,
          sourceKey: 'q_skin_map',
          sourceLabel: `${zoneName}: ${condition}`,
          category: 'inflammation',
          intensity: Math.round(0.6 * severityMultiplier * 100) / 100,
          peakHours: 36,
          halfLifeHours: 48,
          loggedAt,
          hoursAgo,
          origin: 'ai_ingestion',
        });
      }
    }
  }

  return tickets;
}

/**
 * Resolves standard default unaltered questionnaire answers
 */
export function resolveDefaultQuestionTicket(
  answer: SanitizedQuestionAnswer
): ClinicalTriggerTicket | null {
  const { questionKey, rawString, answeredAt, hoursAgo, semanticPayload } = answer;

  switch (questionKey) {
    // 1. Routine Compliance
    case 'q_routine': {
      const val = rawString.toLowerCase();
      if (val.includes('morning & evening') || val.includes('morning, evening')) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Full Routine (AM & PM)',
          category: 'barrier',
          intensity: -0.7, // Negative = protective/repair
          peakHours: 12,
          halfLifeHours: 24,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      }
      if (val.includes('morning') || val.includes('evening')) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Half Routine',
          category: 'barrier',
          intensity: -0.4,
          peakHours: 8,
          halfLifeHours: 18,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      }
      if (val.includes('no') || val.includes('skipped')) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Skipped Routine',
          category: 'barrier',
          intensity: 0.5, // Barrier neglect
          peakHours: 14,
          halfLifeHours: 24,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      }
      return null;
    }

    // 2. Water Intake
    case 'q_water': {
      const glasses = semanticPayload.numeric?.value ?? parseInt(rawString, 10);
      if (isNaN(glasses)) return null;

      let intensity = 0;
      if (glasses >= 8) intensity = -0.75; // High hydration
      else if (glasses >= 5) intensity = -0.45;
      else if (glasses >= 3) intensity = -0.15;
      else intensity = 0.5; // Dehydration stressor

      return {
        id: `${questionKey}_${answeredAt}`,
        sourceKey: questionKey,
        sourceLabel: `${glasses} Glasses Water`,
        category: 'hydration',
        intensity,
        peakHours: 3,
        halfLifeHours: 8,
        loggedAt: answeredAt,
        hoursAgo,
        origin: 'default_fast_track',
      };
    }

    // 3. Sleep Quality (Scale 1-5)
    case 'q_sleep': {
      const level = semanticPayload.scale?.level ?? parseInt(rawString, 10);
      if (isNaN(level)) return null;

      // 1 (very poor) -> high barrier stress; 5 (deep sleep) -> high cellular turnover & repair
      if (level <= 2) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Poor Sleep Restlessness',
          category: 'barrier',
          intensity: 0.65,
          peakHours: 16,
          halfLifeHours: 36,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      } else if (level >= 4) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Restorative Sleep',
          category: 'turnover',
          intensity: -0.6,
          peakHours: 12,
          halfLifeHours: 24,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      }
      return null;
    }

    // 4. Stress Level (Scale 1-5)
    case 'q_stress': {
      const level = semanticPayload.scale?.level ?? parseInt(rawString, 10);
      if (isNaN(level) || level <= 2) return null; // Low stress has no acute spike

      return {
        id: `${questionKey}_${answeredAt}`,
        sourceKey: questionKey,
        sourceLabel: level >= 4 ? 'Severe Acute Stress' : 'Moderate Stress',
        category: 'sebum',
        intensity: level >= 4 ? 0.8 : 0.45,
        peakHours: 36, // HPA axis cortisol peaks sebum at 36 hours
        halfLifeHours: 48,
        loggedAt: answeredAt,
        hoursAgo,
        origin: 'default_fast_track',
      };
    }

    // 5. Sunscreen Application (Boolean)
    case 'q_sunscreen': {
      const isApplied = semanticPayload.boolean?.value ?? rawString.toLowerCase().includes('yes');
      return {
        id: `${questionKey}_${answeredAt}`,
        sourceKey: questionKey,
        sourceLabel: isApplied ? 'SPF Photoprotection' : 'Skipped Sunscreen',
        category: 'pigmentation',
        intensity: isApplied ? -0.8 : 0.6,
        peakHours: 4,
        halfLifeHours: 14,
        loggedAt: answeredAt,
        hoursAgo,
        origin: 'default_fast_track',
      };
    }

    // 6. Diet Cleanliness (q_junk)
    case 'q_junk': {
      const level = semanticPayload.scale?.level ?? parseInt(rawString, 10);
      if (isNaN(level)) return null;

      if (level <= 2) {
        // High junk / inflammatory diet
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'High-Glycemic Inflammatory Diet',
          category: 'inflammation',
          intensity: 0.75,
          peakHours: 48,
          halfLifeHours: 72,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      } else if (level >= 4) {
        return {
          id: `${questionKey}_${answeredAt}`,
          sourceKey: questionKey,
          sourceLabel: 'Clean Antioxidant Diet',
          category: 'inflammation',
          intensity: -0.4,
          peakHours: 24,
          halfLifeHours: 48,
          loggedAt: answeredAt,
          hoursAgo,
          origin: 'default_fast_track',
        };
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * ============================================================================
 * PART 2: Custom Question & Ingestion AI Prompt Routing
 * ============================================================================
 */

/**
 * Checks if a question answer is custom or edited (must be routed to Ingestion AI)
 */
export function requiresAiIngestion(
  answer: SanitizedQuestionAnswer,
  allKnownQuestions: QuestionDef[] = []
): boolean {
  // If it's not a known system question, it is 100% custom
  if (!answer.questionKey.startsWith('q_')) {
    return true;
  }

  // Check if a default question was customized by the user
  const qDef = allKnownQuestions.find((q) => q.key === answer.questionKey);
  if (!qDef) return true;

  // If question has custom free-form text
  if (answer.dataType === 'text' || answer.dataType === 'image') {
    return true;
  }

  return false;
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
