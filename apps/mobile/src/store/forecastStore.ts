import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  runFullSkinForecastingPipeline,
  SkinForecastSynthesis,
  ForecastHeroCardData,
  UserSkinProfile,
  buildDeterministicSynthesis,
} from '@/services/stage4SynthesisEngine';
import {
  JournalHistoryRecord,
  QuestionDef,
  useJournalStore,
} from '@/store/journalStore';
import { extractStage1HistoryLogs, Stage1DailyLog } from '@/services/stage1RawDataRules';
import {
  resolveUserSkinBaseline,
  SkinStateVector,
} from '@/services/stage3EngineBridge';
import {
  runStage3ForecastEngine,
  Stage3ForecastResult,
} from '@/services/stage3SkinForecastEngine';
import {
  ClinicalTriggerTicket,
  resolveDefaultQuestionTicket,
  resolveSkinMapTickets,
} from '@/services/stage2IngestionBridge';

/**
 * Multi-week calendar sequence synchronization
 * Matches index.tsx multi-week calendar setup (-4 to +4 weeks = 9 weeks total)
 */
export type { ForecastHeroCardData, SkinForecastSynthesis };

export const CALENDAR_WEEKS_RANGE = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
export const INITIAL_WEEK_INDEX = 4; // index of week offset 0 (Current Week)

export function getTodayIdx(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // 0=Mon..6=Sun
}

export function getInitialDayGlobalIndex(): number {
  return INITIAL_WEEK_INDEX * 7 + getTodayIdx();
}

/**
 * Converts a global day index (0..62) to the exact local calendar Date at midnight.
 */
export function getDateForGlobalIndex(globalIdx: number): Date {
  const weekIdx = Math.floor(globalIdx / 7);
  const dayIdx = globalIdx % 7;
  const weekOffset = CALENDAR_WEEKS_RANGE[weekIdx] ?? 0;

  const todayDate = new Date();
  const currentDayVal = todayDate.getDay();
  const distanceToMon = currentDayVal === 0 ? -6 : 1 - currentDayVal;

  const targetDate = new Date(todayDate);
  targetDate.setDate(todayDate.getDate() + distanceToMon + weekOffset * 7 + dayIdx);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
}

/**
 * Returns formatted calendar key: 'YYYY-MM-DD'
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Resolves record timestamp or isoDate to a clean midnight Date object.
 */
export function resolveRecordDate(record: JournalHistoryRecord): Date {
  if (record.dateStr?.toLowerCase() === 'today' || record.id === 'rec-1') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (record.dateStr?.toLowerCase() === 'yesterday' || record.id === 'rec-2') {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (record.isoDate) {
    const parts = record.isoDate.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const DEFAULT_HERO_CARD: ForecastHeroCardData = {
  prefix: 'Optimal barrier recovery expected in',
  highlight: 'Tomorrow morning',
  suffix: undefined,
  meta: 'Based on your recent skin history',
  logDays: 7,
};

/**
 * 0ms Synchronous Deterministic Synthesis Engine.
 * Computes an instant, mathematically sound forecast from raw history records
 * with ZERO loading states, ZERO delay, and ZERO empty cards.
 */
export function computeDeterministicInstantSynthesis(
  historyRecords: JournalHistoryRecord[],
  questions: QuestionDef[],
  userProfile?: UserSkinProfile
): SkinForecastSynthesis {
  const stage1Logs: Stage1DailyLog[] = extractStage1HistoryLogs(historyRecords, questions);
  const baselineProfile = resolveUserSkinBaseline(userProfile?.skinType || 'combination');
  const collectedTickets: ClinicalTriggerTicket[] = [];
  const now = Date.now();

  for (const dayLog of stage1Logs) {
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

    for (const answer of dayLog.sanitizedAnswers) {
      const fastTrackTicket = resolveDefaultQuestionTicket(answer);
      if (fastTrackTicket) {
        collectedTickets.push(fastTrackTicket);
      }
    }
  }

  collectedTickets.sort((a, b) => a.loggedAt - b.loggedAt);

  const stage3Payload = {
    baselineProfile,
    chronologicalTickets: collectedTickets,
    currentTime: now,
  };

  const stage3Result: Stage3ForecastResult = runStage3ForecastEngine(stage3Payload);
  return buildDeterministicSynthesis(stage3Result, userProfile);
}

/**
 * Helper to determine data freshness and format the transparent basis label:
 * "Based on your log from [Date]"
 */
function deriveBasisInfo(
  historyRecords: JournalHistoryRecord[],
  isToday: boolean
): { basisLabel: string; logDays: number } {
  const todayRecord = historyRecords.find(
    (r) => r.dateStr?.toLowerCase() === 'today' || r.id === 'rec-1'
  );
  const hasTodayAnswers = Boolean(todayRecord && Object.keys(todayRecord.answers || {}).length > 0);

  if (isToday) {
    if (hasTodayAnswers) {
      return {
        basisLabel: "Based on today's log",
        logDays: Math.min(14, historyRecords.filter((r) => Object.keys(r.answers || {}).length > 0).length || 1),
      };
    }
    // Today not yet logged: find the most recent prior logged record
    const lastLogged = historyRecords.find(
      (r) => r.id !== todayRecord?.id && Object.keys(r.answers || {}).length > 0
    );
    const dateName = lastLogged ? (lastLogged.dateStr || lastLogged.isoDate || 'recent logs') : 'past 7 days';
    return {
      basisLabel: `Based on your log from ${dateName}`,
      logDays: Math.min(14, historyRecords.filter((r) => Object.keys(r.answers || {}).length > 0).length || 5),
    };
  }

  return {
    basisLabel: 'Based on your logs',
    logDays: Math.min(14, historyRecords.length || 7),
  };
}

export interface ForecastState {
  todaySynthesis: SkinForecastSynthesis | null;
  frozenPastSyntheses: Record<string, SkinForecastSynthesis>;
  forecastCardsByDay: Record<number, ForecastHeroCardData>;
  basisLabelsByDay: Record<number, string>;
  isCalculating: boolean;
  lastCalculatedAt: number;
  lastHistoryFingerprint: string;
  isJournalSheetActive: boolean;
  setJournalSheetActive: (active: boolean) => void;

  // Actions
  init: (
    questions: QuestionDef[],
    historyRecords: JournalHistoryRecord[],
    userProfile?: UserSkinProfile
  ) => Promise<void>;
  getForecastForDay: (globalIndex: number) => ForecastHeroCardData;
  getBasisLabelForDay: (globalIndex: number) => string;
  ensureForecastForDay: (
    globalIndex: number,
    questions: QuestionDef[],
    historyRecords: JournalHistoryRecord[],
    userProfile?: UserSkinProfile
  ) => Promise<void>;
  recalculateToday: (
    questions: QuestionDef[],
    historyRecords: JournalHistoryRecord[],
    userProfile?: UserSkinProfile,
    options?: { forceAiRefresh?: boolean }
  ) => Promise<void>;
  handleJournalRecordsChanged: (
    updatedRecords: JournalHistoryRecord[],
    questions: QuestionDef[],
    userProfile?: UserSkinProfile
  ) => Promise<void>;
}

export const useForecastStore = create<ForecastState>()(
  persist(
    (set, get) => ({
      todaySynthesis: null,
      frozenPastSyntheses: {},
      forecastCardsByDay: {},
      basisLabelsByDay: {},
      isCalculating: false,
      lastCalculatedAt: 0,
      lastHistoryFingerprint: '',
      isJournalSheetActive: false,
      setJournalSheetActive: (active: boolean) => set({ isJournalSheetActive: active }),

      /**
       * Primary Initialization.
       * 1. Checks day rollover (freezes yesterday's live forecast permanently).
       * 2. Synchronously ensures today's card is never empty.
       * 3. Silently launches background async forecast pipeline.
       */
      init: async (questions, historyRecords, userProfile) => {
        const todayDate = new Date();
        const todayKey = toDateKey(todayDate);
        const todayGlobalIdx = getInitialDayGlobalIndex();

        // Check day rollover: If todaySynthesis exists from a past date, freeze it permanently!
        const existingToday = get().todaySynthesis;
        if (existingToday) {
          const synthesisDate = new Date(existingToday.computedAt);
          const synthesisKey = toDateKey(synthesisDate);
          if (synthesisKey !== todayKey && synthesisKey < todayKey) {
            const frozen = { ...get().frozenPastSyntheses };
            frozen[synthesisKey] = existingToday;
            set({ frozenPastSyntheses: frozen });
          }
        }

        // Build instant 0ms deterministic card for today if missing so screen is NEVER blank
        const currentCards = { ...get().forecastCardsByDay };
        const currentLabels = { ...get().basisLabelsByDay };

        if (!currentCards[todayGlobalIdx]) {
          const instant = computeDeterministicInstantSynthesis(historyRecords, questions, userProfile);
          const { basisLabel, logDays } = deriveBasisInfo(historyRecords, true);
          instant.heroCard.meta = basisLabel;
          instant.heroCard.logDays = logDays;

          currentCards[todayGlobalIdx] = instant.heroCard;
          currentLabels[todayGlobalIdx] = basisLabel;
          set({
            todaySynthesis: instant,
            forecastCardsByDay: currentCards,
            basisLabelsByDay: currentLabels,
          });
        }
      },

      /**
       * Synchronous selector for the Home screen card.
       * Guarantees an immediate valid card object.
       */
      getForecastForDay: (globalIndex: number) => {
        const state = get();
        if (state.forecastCardsByDay[globalIndex]) {
          return state.forecastCardsByDay[globalIndex];
        }

        const todayGlobalIdx = getInitialDayGlobalIndex();
        if (globalIndex === todayGlobalIdx && state.todaySynthesis) {
          return state.todaySynthesis.heroCard;
        }

        const targetDate = getDateForGlobalIndex(globalIndex);
        const targetKey = toDateKey(targetDate);

        // Check if frozen past forecast exists
        if (state.frozenPastSyntheses[targetKey]) {
          return state.frozenPastSyntheses[targetKey].heroCard;
        }

        return DEFAULT_HERO_CARD;
      },

      /**
       * Returns the freshness basis label for a specific day.
       */
      getBasisLabelForDay: (globalIndex: number) => {
        const state = get();
        if (state.basisLabelsByDay[globalIndex]) {
          return state.basisLabelsByDay[globalIndex];
        }
        return 'Based on your logs';
      },

      /**
       * Ensures a forecast exists for any past day viewed by the user.
       * If already frozen, DOES NOTHING (freeze rule).
       * If first time viewing, computes, freezes permanently, and persists.
       */
      ensureForecastForDay: async (globalIndex, questions, historyRecords, userProfile) => {
        const state = get();
        const todayGlobalIdx = getInitialDayGlobalIndex();

        // Future days are locked — do not compute
        if (globalIndex > todayGlobalIdx) {
          return;
        }

        // Today is live
        if (globalIndex === todayGlobalIdx) {
          if (!state.todaySynthesis) {
            await get().recalculateToday(questions, historyRecords, userProfile);
          }
          return;
        }

        // Past Day: Check if already frozen
        const targetDate = getDateForGlobalIndex(globalIndex);
        const targetKey = toDateKey(targetDate);

        if (state.frozenPastSyntheses[targetKey]) {
          // Already frozen permanently — do nothing!
          if (!state.forecastCardsByDay[globalIndex]) {
            set((prev) => ({
              forecastCardsByDay: {
                ...prev.forecastCardsByDay,
                [globalIndex]: state.frozenPastSyntheses[targetKey].heroCard,
              },
            }));
          }
          return;
        }

        // Check if user actually logged data for this past day
        const hasLogsForDate = historyRecords.some((r) => {
          if (r.isoDate && r.isoDate === targetKey) return Object.keys(r.answers || {}).length > 0;
          if (r.dateStr) {
            const d = resolveRecordDate(r);
            if (toDateKey(d) === targetKey) return Object.keys(r.answers || {}).length > 0;
          }
          return false;
        });

        if (!hasLogsForDate) {
          // No logs recorded for this past day — do not generate a fake forecast
          return;
        }

        // First time viewing this past day: compute and FREEZE forever
        const pastRecords = historyRecords.filter((r) => {
          if (r.isoDate) return r.isoDate <= targetKey;
          if (r.dateStr?.toLowerCase() === 'today') return false;
          return true;
        });

        const pastSynthesis = await runFullSkinForecastingPipeline(
          pastRecords,
          questions,
          userProfile
        );

        const pastDateDisplay = `${targetDate.getDate()} ${targetDate.toLocaleDateString('en-US', { month: 'short' })}`;
        pastSynthesis.heroCard.meta = `Based on your log from ${pastDateDisplay}`;

        set((prev) => ({
          frozenPastSyntheses: {
            ...prev.frozenPastSyntheses,
            [targetKey]: pastSynthesis,
          },
          forecastCardsByDay: {
            ...prev.forecastCardsByDay,
            [globalIndex]: pastSynthesis.heroCard,
          },
          basisLabelsByDay: {
            ...prev.basisLabelsByDay,
            [globalIndex]: `Based on your log from ${pastDateDisplay}`,
          },
        }));
      },

      /**
       * Recalculates today's live forecast silently in the background.
       */
      recalculateToday: async (questions, historyRecords, userProfile, options) => {
        if (get().isCalculating) {
          console.log('[FORECAST] ⚠️ Recalculation already in progress, skipping duplicate request.');
          return;
        }
        set({ isCalculating: true });
        const startTotal = Date.now();
        console.log('[FORECAST] 🚀 === STARTING 4-STAGE SKIN FORECASTING PIPELINE ===');
        console.log(`[FORECAST] Input records: ${historyRecords.length}, Questions: ${questions.length}, Force AI Refresh: ${Boolean(options?.forceAiRefresh)}`);

        try {
          const todayGlobalIdx = getInitialDayGlobalIndex();
          const synthesis = await runFullSkinForecastingPipeline(
            historyRecords,
            questions,
            userProfile,
            options
          );

          const { basisLabel, logDays } = deriveBasisInfo(historyRecords, true);
          synthesis.heroCard.meta = basisLabel;
          synthesis.heroCard.logDays = logDays;

          const fingerprint = JSON.stringify(
            historyRecords.map((r) => ({ id: r.id, answers: r.answers }))
          );

          set((prev) => ({
            todaySynthesis: synthesis,
            forecastCardsByDay: {
              ...prev.forecastCardsByDay,
              [todayGlobalIdx]: synthesis.heroCard,
            },
            basisLabelsByDay: {
              ...prev.basisLabelsByDay,
              [todayGlobalIdx]: basisLabel,
            },
            lastCalculatedAt: Date.now(),
            lastHistoryFingerprint: fingerprint,
            isCalculating: false,
          }));

          const totalElapsed = Date.now() - startTotal;
          console.log(`[FORECAST] ✅ === PIPELINE COMPLETE IN ${totalElapsed}ms ===`);
          console.log(`[FORECAST] 🏆 Forecast Card: "${synthesis.heroCard.prefix} ${synthesis.heroCard.highlight}" (Source: ${synthesis.source})`);
          console.log(`[FORECAST] 📋 Clinical Insight: "${synthesis.clinicalInsight.title}"`);
        } catch (e: any) {
          console.error('[FORECAST] ❌ Pipeline execution failed with error:', e);
          set({ isCalculating: false });
        }
      },

      /**
       * RULE 3: Past Journal Entry Edit Handler.
       * Only recalculates if the edited entry falls within the 14-day window.
       * If older than 14 days, completely ignores it (too old to alter forecast).
       */
      handleJournalRecordsChanged: async (updatedRecords, questions, userProfile) => {
        const state = get();
        const currentFingerprint = JSON.stringify(
          updatedRecords.map((r) => ({ id: r.id, answers: r.answers }))
        );

        if (currentFingerprint === state.lastHistoryFingerprint) {
          return;
        }

        // Find which record was edited or added
        let editedRecord: JournalHistoryRecord | null = null;
        for (const rec of updatedRecords) {
          const prevAnswerStr = (state as any)._previousAnswersMap?.[rec.id];
          const currAnswerStr = JSON.stringify(rec.answers || {});
          if (prevAnswerStr !== currAnswerStr) {
            editedRecord = rec;
            break;
          }
        }

        // Cache answers map for future comparisons
        const answersMap: Record<string, string> = {};
        for (const r of updatedRecords) {
          answersMap[r.id] = JSON.stringify(r.answers || {});
        }
        (set as any)({ _previousAnswersMap: answersMap });

        if (!editedRecord) {
          // If no specific single record identified, silently refresh today
          await get().recalculateToday(questions, updatedRecords, userProfile);
          return;
        }

        // Calculate age of edited record
        const recordDate = resolveRecordDate(editedRecord);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffMs = today.getTime() - recordDate.getTime();
        const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // 7-14 DAY RULE: If edit is older than 14 days, ignore completely!
        if (daysAgo > 14) {
          return;
        }

        // Edited record is within the 14-day window:
        // 1. Recalculate today's forecast
        await get().recalculateToday(questions, updatedRecords, userProfile);

        // 2. If it was a past record that has a frozen forecast, refresh that frozen snapshot
        const editedKey = toDateKey(recordDate);
        if (state.frozenPastSyntheses[editedKey]) {
          const pastRecords = updatedRecords.filter((r) => {
            if (r.isoDate) return r.isoDate <= editedKey;
            if (r.dateStr?.toLowerCase() === 'today') return false;
            return true;
          });

          const updatedPastSynthesis = await runFullSkinForecastingPipeline(
            pastRecords,
            questions,
            userProfile
          );
          const pastDateDisplay = `${recordDate.getDate()} ${recordDate.toLocaleDateString('en-US', { month: 'short' })}`;
          updatedPastSynthesis.heroCard.meta = `Based on your log from ${pastDateDisplay}`;

          set((prev) => ({
            frozenPastSyntheses: {
              ...prev.frozenPastSyntheses,
              [editedKey]: updatedPastSynthesis,
            },
          }));
        }
      },
    }),
    {
      name: 'skinstory-forecast-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        frozenPastSyntheses: state.frozenPastSyntheses,
        todaySynthesis: state.todaySynthesis,
        forecastCardsByDay: state.forecastCardsByDay,
        basisLabelsByDay: state.basisLabelsByDay,
        lastCalculatedAt: state.lastCalculatedAt,
        lastHistoryFingerprint: state.lastHistoryFingerprint,
      }),
    }
  )
);

/**
 * Global subscriber that links useJournalStore directly to useForecastStore.
 * Guarantees that any journal entry created or edited from ANY screen
 * triggers silent background recalculation adhering to the 14-day rule.
 */
let isJournalSyncAttached = false;

export function initJournalForecastSync() {
  if (isJournalSyncAttached) return;
  isJournalSyncAttached = true;

  useJournalStore.subscribe((journalState) => {
    if (useForecastStore.getState().isJournalSheetActive) {
      console.log('[FORECAST_SYNC] ⏸️ Journal sheet is open. Forecast calculation stays quiet and deferred until sheet close.');
      return;
    }
    useForecastStore
      .getState()
      .handleJournalRecordsChanged(journalState.historyRecords, journalState.questions);
  });
}
