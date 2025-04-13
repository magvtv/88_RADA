export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeType = 'light' | 'dark' | 'system';
export type Language = 'en' | 'sw' ;

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  theme: ThemeType;
  language: Language;
  notifications: {
    enabled: boolean;
    alerts: boolean;
    forecasts: boolean;
    chat: boolean;
  };
  defaultLocation?: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface UserState {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;

  // Actions
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setTheme: (theme: ThemeType) => void;
  setLanguage: (language: Language) => void;
  setNotificationPreference: (
    type: "enabled" | "alerts" | "forecasts" | "chat",
    value: boolean
  ) => void;
  setDefaultLocation: (name: string, latitude: number, longitude: number) => void;
  clearDefaultLocation: () => void;
  resetPreferences: () => void;
}
