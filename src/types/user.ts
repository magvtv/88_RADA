export type ThemeType = 'light' | 'dark' | 'system';
export type Language = 'en' | 'sw' ;
export type UserType = 'farmer' | 'pastoralist' | 'aid_organization' | 'general';

export interface UserPreferences {
  theme: ThemeType;
  language: Language;
  userType: UserType;
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
  setUserType: (userType: UserType) => void;
  setNotificationPreference: (
    type: "enabled" | "alerts" | "forecasts" | "chat",
    value: boolean
  ) => void;
  resetPreferences: () => void;
}
