/**
 * ============================================================================
 * Stage 3 Engine Bridge: Biological Input Assembler & Baseline Anchor
 * ============================================================================
 * 
 * Plain-English Purpose:
 * Connects Stage 1 & Stage 2 outputs to the Stage 3 Continuous-Time State Space Engine.
 * 
 * Exact Responsibilities:
 * 1. Establishes the User's Biological Baseline State (X_baseline) across the 7 axes
 *    (derived from user skin type: Oily, Dry, Combination, Sensitive, Normal).
 * 2. Assembles all clinical tickets across the user's historical log entries:
 *    - Resolves Question 1 Skin Map tickets (fast-track scaled by severity).
 *    - Resolves standard unaltered question tickets (fast-track pre-calibrated).
 *    - Ingests custom user questions and free-form notes via Stage 2 AI worker.
 * 3. Sorts all tickets chronologically by exact timestamp (Rule 4) so the engine
 *    evaluates time transitions continuously without chronological jitter.
 * 4. Produces a clean, airtight payload for the Stage 3 Continuous State Space Engine.
 */

import { Stage1DailyLog } from './stage1RawDataRules';
import {
  ClinicalTriggerTicket,
  SkinAxisCategory,
  resolveSkinMapTickets,
  resolveDefaultQuestionTicket,
  requiresAiIngestion,
} from './stage2IngestionBridge';
import { ingestCustomItemWithAi } from './stage2AiIngestionWorker';
import { QuestionDef } from '@/store/journalStore';

/**
 * 7-Axis Vector Representation (State Space Vector X)
 */
export type SkinStateVector = Record<SkinAxisCategory, number>;

/**
 * User Baseline Profile Contract
 */
export interface UserSkinBaselineProfile {
  skinType: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  baselineVector: SkinStateVector;
}

/**
 * Clean Payload Delivered to Stage 3 Engine
 */
export interface Stage3EngineInputPayload {
  baselineProfile: UserSkinBaselineProfile;
  chronologicalTickets: ClinicalTriggerTicket[];
  currentTime: number;
}

/**
 * ============================================================================
 * PART 1: Physiological Baseline Archetypes
 * ============================================================================
 * Establishes where the user's skin rests naturally when no acute stressors
 * or interventions are active. Normalized between 0.0 (calm/healthy) and 1.0 (elevated).
 */
export const DEFAULT_BASELINE_VECTORS: Record<
  UserSkinBaselineProfile['skinType'],
  SkinStateVector
> = {
  normal: {
    hydration: 0.75,
    barrier: 0.8,
    inflammation: 0.1,
    sebum: 0.35,
    turnover: 0.7,
    pigmentation: 0.1,
    edema: 0.05,
  },
  oily: {
    hydration: 0.65,
    barrier: 0.7,
    inflammation: 0.25,
    sebum: 0.75, // Naturally elevated sebogenesis
    turnover: 0.6,
    pigmentation: 0.15,
    edema: 0.05,
  },
  dry: {
    hydration: 0.35, // Low natural moisture
    barrier: 0.45,   // Permeable stratum corneum
    inflammation: 0.2,
    sebum: 0.15,
    turnover: 0.4,
    pigmentation: 0.1,
    edema: 0.05,
  },
  combination: {
    hydration: 0.55,
    barrier: 0.65,
    inflammation: 0.2,
    sebum: 0.55,
    turnover: 0.6,
    pigmentation: 0.15,
    edema: 0.05,
  },
  sensitive: {
    hydration: 0.5,
    barrier: 0.4,   // High reactivity / compromised barrier
    inflammation: 0.35, // Heightened neurovascular / cytokine reactivity
    sebum: 0.3,
    turnover: 0.5,
    pigmentation: 0.2,
    edema: 0.1,
  },
};

/**
 * Resolves the user baseline profile safely with fallback to normal
 */
export function resolveUserSkinBaseline(rawSkinType?: string): UserSkinBaselineProfile {
  const normalized = (rawSkinType || '').toLowerCase().trim();
  let skinType: UserSkinBaselineProfile['skinType'] = 'normal';

  if (normalized.includes('oil')) skinType = 'oily';
  else if (normalized.includes('dry')) skinType = 'dry';
  else if (normalized.includes('combo') || normalized.includes('combination')) skinType = 'combination';
  else if (normalized.includes('sensit')) skinType = 'sensitive';

  return {
    skinType,
    baselineVector: { ...DEFAULT_BASELINE_VECTORS[skinType] },
  };
}

/**
 * ============================================================================
 * PART 2: Chronological Ticket Assembler
 * ============================================================================
 * Ingests all daily logs produced by Stage 1, processes each answer through
 * the Stage 2 Bridge (fast-track table or AI worker), and orders all resulting
 * clinical tickets chronologically from oldest to newest.
 */
export async function assembleStage3EnginePayload(
  dailyLogs: Stage1DailyLog[],
  allKnownQuestions: QuestionDef[] = [],
  rawSkinType?: string,
  abortSignal?: AbortSignal
): Promise<Stage3EngineInputPayload> {
  const now = Date.now();
  const baselineProfile = resolveUserSkinBaseline(rawSkinType);
  const collectedTickets: ClinicalTriggerTicket[] = [];

  for (const dayLog of dailyLogs) {
    // 1. Resolve Question 1 Skin Map tickets
    // If Question 1 has its own specific answeredTimestamp, use it; otherwise use recordTimestamp
    const skinMapTimestamp = (dayLog as any).answeredTimestamps?.['q_skin_map'] || dayLog.recordTimestamp || now;
    const skinMapHoursAgo = Math.max(0, (now - skinMapTimestamp) / (1000 * 60 * 60));

    if (dayLog.hasSkinMap && dayLog.skinMapData) {
      const skinMapTickets = resolveSkinMapTickets(
        dayLog.skinMapData,
        skinMapTimestamp,
        skinMapHoursAgo
      );
      collectedTickets.push(...skinMapTickets);
    }

    // 2. Resolve daily answered questions
    for (const answer of dayLog.sanitizedAnswers) {
      // Use the exact per-question answeredAt / hoursAgo computed in Stage 1
      if (requiresAiIngestion(answer, allKnownQuestions)) {
        try {
          const aiTicket = await ingestCustomItemWithAi(answer, abortSignal);
          collectedTickets.push(aiTicket);
        } catch {
          // Worker already has internal offline fallback, but guard against unhandled rejection
        }
      } else {
        // Fast-track pre-calibrated code table (0ms, Zero AI)
        const fastTrackTicket = resolveDefaultQuestionTicket(answer);
        if (fastTrackTicket) {
          collectedTickets.push(fastTrackTicket);
        }
      }
    }
  }

  // 3. Sort all tickets chronologically: oldest event to newest event
  // This is mandatory for continuous-time state space modeling (t_0 -> t_1 -> t_now)
  collectedTickets.sort((a, b) => a.loggedAt - b.loggedAt);

  return {
    baselineProfile,
    chronologicalTickets: collectedTickets,
    currentTime: now,
  };
}
