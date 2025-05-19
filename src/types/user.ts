export type ThemeType = 'light' | 'dark' | 'system';
export type Language = 'en' | 'sw' ;

export interface UserPreferences {
  theme: ThemeType;
  language: Language;
  notifications: {
    enabled: boolean;
    alerts: boolean;
    forecasts: boolean;
    chat: boolean;
  };
}

export interface UserState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;

  // Actions
  setTheme: (theme: ThemeType) => void;
  setLanguage: (language: Language) => void;
  setNotificationPreference: (
    type: "enabled" | "alerts" | "forecasts" | "chat",
    value: boolean
  ) => void;
  resetPreferences: () => void;
}
