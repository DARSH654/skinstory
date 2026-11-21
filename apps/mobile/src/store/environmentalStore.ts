import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runEnvironmentalSync, EnvironmentalSynthesisResult } from '@/services/environmentalDefenseService';

interface EnvironmentalState {
  title: string;
  advice: string;
  cityName: string | null;
  temp_c: number | null;
  uv: number | null;
  lastUpdated: number | null;
  isUpdating: boolean;
  savedLocation: string; // 'auto:ip' or city name
  skinType: string;

  // Actions
  refreshEnvironmentalData: (force?: boolean) => Promise<void>;
  setLocation: (location: string) => Promise<void>;
  setSkinType: (type: string) => Promise<void>;
}

export const useEnvironmentalStore = create<EnvironmentalState>()(
  persist(
    (set, get) => ({
      title: 'Climate Defense',
      advice: 'Live UV index, humidity, and pollution defense. Tap Update Now to refresh for your area.',
      cityName: null,
      temp_c: null,
      uv: null,
      lastUpdated: null,
      isUpdating: false,
      savedLocation: 'auto:ip',
      skinType: 'Combination',

      refreshEnvironmentalData: async (force = false) => {
        const { lastUpdated, isUpdating, savedLocation, skinType } = get();
        if (isUpdating) return;

        // Auto-refresh once a day (if within last 20 hours and not forced, skip)
        if (!force && lastUpdated) {
          const TWENTY_HOURS_MS = 20 * 60 * 60 * 1000;
          if (Date.now() - lastUpdated < TWENTY_HOURS_MS) {
            console.log('[ENV_STORE] ℹ️ Environmental data is already fresh for today. Skipping auto-fetch.');
            return;
          }
        }

        set({ isUpdating: true });
        try {
          const result: EnvironmentalSynthesisResult = await runEnvironmentalSync(savedLocation, skinType);
          set({
            title: result.title,
            advice: result.advice,
            cityName: result.cityName,
            temp_c: result.temp_c,
            uv: result.uv,
            lastUpdated: result.lastUpdated,
            isUpdating: false,
          });
        } catch (error) {
          console.warn('[ENV_STORE] ⚠️ Failed to refresh environmental data:', error);
          set({ isUpdating: false });
        }
      },

      setLocation: async (newLocation: string) => {
        const cleaned = newLocation.trim();
        if (!cleaned) return;
        set({ savedLocation: cleaned });
        await get().refreshEnvironmentalData(true);
      },

      setSkinType: async (newType: string) => {
        set({ skinType: newType });
        await get().refreshEnvironmentalData(true);
      },
    }),
    {
      name: 'skinstory_environmental_defense_store_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        title: state.title,
        advice: state.advice,
        cityName: state.cityName,
        temp_c: state.temp_c,
        uv: state.uv,
        lastUpdated: state.lastUpdated,
        savedLocation: state.savedLocation,
        skinType: state.skinType,
      }),
    }
  )
);
