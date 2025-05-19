import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserState, UserPreferences, Language, ThemeType } from "@/types/user";

// Default preferences
const defaultPreferences: UserPreferences = {
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
