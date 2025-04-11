import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserState, UserPreferences, Language, TemperatureUnit, ThemeType } from "@/types/user";

// Default preferences
const defaultPreferences: UserPreferences = {
  temperatureUnit: "celsius",
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    alerts: true,
    forecasts: true,
    chat: false,
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      loading: false,
      error: null,

      // Actions
      setTemperatureUnit: (unit: TemperatureUnit) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            temperatureUnit: unit,
          },
        })),

      setTheme: (theme: ThemeType) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            theme,
          },
        })),

      setLanguage: (language: Language) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            language,
          },
        })),

      setNotificationPreference: (
        type: "enabled" | "alerts" | "forecasts" | "chat",
        value: boolean
      ) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...state.preferences.notifications,
              [type]: value,
            },
          },
        })),

      setDefaultLocation: (name: string, latitude: number, longitude: number) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            defaultLocation: {
              name,
              coordinates: {
                latitude,
                longitude,
              },
            },
          },
        })),

      clearDefaultLocation: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            defaultLocation: undefined,
          },
        })),

      resetPreferences: () =>
        set(() => ({
          preferences: defaultPreferences,
        })),
    }),
    {
      name: "rada-user-preferences",
      skipHydration: true,
    }
  )
);
