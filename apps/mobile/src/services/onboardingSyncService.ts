import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useJournalStore, JournalHistoryRecord } from '@/store/journalStore';
import { useForecastStore, toDateKey } from '@/store/forecastStore';

/**
 * Bridges user inputs gathered across onboarding steps (skin zones, sleep,
 * hydration, name) into the daily journal and user profile stores.
 * 
 * Guarantees that day-1 onboarding data is permanently recorded as Today's log,
 * kicking off the continuous skin forecasting pipeline seamlessly.
 */
export async function commitOnboardingToJournalAndProfile(): Promise<void> {
  try {
    const { name, answers } = useOnboardingStore.getState();
    const todayDate = new Date();
    const todayIso = toDateKey(todayDate);
    const todayDayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
    const now = Date.now();

    // 1. Save user profile
    const trimmedName = name?.trim() || 'Friend';
    const profile = {
      name: trimmedName,
      firstName: trimmedName,
      avatarUri: null,
    };
    await AsyncStorage.setItem('user_profile', JSON.stringify(profile));

    // 2. Map onboarding answers to journal questions
    const mappedAnswers: Record<string, string> = {};
    const timestamps: Record<string, number> = {};

    // 2a. Skin Map (q3_skinZones and q3_skinZoneConcerns)
    const selectedZones: string[] = answers['q3_skinZones'] || [];
    const zoneConcerns: Record<string, string[]> = answers['q3_skinZoneConcerns'] || {};

    if (selectedZones.length > 0) {
      const zones = selectedZones.map((zId) => ({
        id: zId,
        name: zId.charAt(0).toUpperCase() + zId.slice(1),
        conditions: zoneConcerns[zId] && zoneConcerns[zId].length > 0 ? zoneConcerns[zId] : ['Normal'],
        severity: 3,
      }));
      mappedAnswers['q_skin_map'] = JSON.stringify({ zones, maxSeverityScale: 5 });
      timestamps['q_skin_map'] = now;
    }

    // 2b. Sleep (q5_sleepHours or ambient_level)
    const rawSleep = String(answers['q5_sleepHours'] || answers['ambient_level'] || '');
    if (rawSleep) {
      if (rawSleep.includes('Under 5') || rawSleep.includes('Exhausted')) {
        mappedAnswers['q_sleep'] = '1 - Less than 5 hrs (very poor)';
      } else if (rawSleep.includes('5 – 6') || rawSleep.includes('5-6')) {
        mappedAnswers['q_sleep'] = '2 - 5–6 hrs, restless';
      } else if (rawSleep.includes('6 – 7') || rawSleep.includes('6-7')) {
        mappedAnswers['q_sleep'] = '3 - 6–7 hrs, fair';
      } else if (rawSleep.includes('7 – 8') || rawSleep.includes('7-8') || rawSleep.includes('Good rest')) {
        mappedAnswers['q_sleep'] = '4 - 7–8 hrs, good';
      } else {
        mappedAnswers['q_sleep'] = '5 - 8+ hrs, deep and refreshing';
      }
      timestamps['q_sleep'] = now;
    }

    // 2c. Hydration (q6_hydration or hydration_level)
    const rawWater = String(answers['q6_hydration'] || answers['hydration_level'] || '');
    if (rawWater) {
      if (rawWater.includes('Under 2')) mappedAnswers['q_water'] = '2 glasses';
      else if (rawWater.includes('2 – 3') || rawWater.includes('2-3')) mappedAnswers['q_water'] = '3 glasses';
      else if (rawWater.includes('3 – 4') || rawWater.includes('3-4')) mappedAnswers['q_water'] = '4 glasses';
      else if (rawWater.includes('4 – 5') || rawWater.includes('4-5')) mappedAnswers['q_water'] = '5 glasses';
      else if (rawWater.includes('6 – 7') || rawWater.includes('6-7')) mappedAnswers['q_water'] = '7 glasses';
      else if (rawWater.includes('7 – 8') || rawWater.includes('7-8') || rawWater.includes('2L')) mappedAnswers['q_water'] = '8 glasses';
      else if (rawWater.includes('8+')) mappedAnswers['q_water'] = '10 glasses';
      else mappedAnswers['q_water'] = '6 glasses';
      timestamps['q_water'] = now;
    }

    // 2d. Routine
    mappedAnswers['q_routine'] = 'Morning & Evening';
    timestamps['q_routine'] = now;

    // 3. Commit into useJournalStore historyRecords
    const currentRecords = useJournalStore.getState().historyRecords;
    let foundToday = false;

    const updatedRecords = currentRecords.map((r) => {
      if (r.isoDate === todayIso || r.dateStr?.toLowerCase() === 'today') {
        foundToday = true;
        return {
          ...r,
          dateStr: 'Today',
          dayName: todayDayName,
          isoDate: todayIso,
          answers: { ...r.answers, ...mappedAnswers },
          answeredTimestamps: { ...r.answeredTimestamps, ...timestamps },
        };
      }
      return r;
    });

    if (!foundToday) {
      const todayRecord: JournalHistoryRecord = {
        id: `rec-${todayIso}`,
        dateStr: 'Today',
        dayName: todayDayName,
        isoDate: todayIso,
        answers: mappedAnswers,
        answeredTimestamps: timestamps,
      };
      updatedRecords.unshift(todayRecord);
    }

    useJournalStore.getState().setHistoryRecords(updatedRecords);

    // 4. Mark onboarding finished
    await AsyncStorage.setItem('has_completed_onboarding', 'true');

    // 5. Trigger immediate forecast recalculation
    const questions = useJournalStore.getState().questions;
    useForecastStore.getState().recalculateToday(
      questions,
      updatedRecords,
      { firstName: trimmedName },
      { forceAiRefresh: true }
    );
  } catch (e) {
    console.warn('[ONBOARDING_SYNC] ⚠️ Error committing onboarding data to journal:', e);
  }
}
