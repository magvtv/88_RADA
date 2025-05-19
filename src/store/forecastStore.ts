import { create } from "zustand";
import type {
  WeeklyForecast,
  DailyForecast,
  ForecastChartData,
  CombinedForecastChartData
} from "@/types/forecast";
import {
  getWeeklyForecast,
  getTodayForecast,
  getForecastTrends,
  getNormalPredictions,
  triggerPredictions
} from "@/services/forecastService";

interface LoadingState {
  weekly: boolean;
  normal: boolean;
  today: boolean;
  trends: boolean;
  trigger: boolean;
}

interface ErrorState {
  weekly: string | null;
  normal: string | null;
  today: string | null;
  trends: string | null;
  trigger: string | null;
}

interface ForecastState {
  weeklyForecast: WeeklyForecast | null;
  normalForecast: WeeklyForecast | null;
  todayForecast: DailyForecast | null;
  trendsData: ForecastChartData[] | CombinedForecastChartData[];
  loading: LoadingState;
  error: ErrorState;
  lastTriggered: Date | null;

  // Actions
  fetchWeeklyForecast: () => Promise<void>;
  fetchNormalPredictions: () => Promise<void>;
  fetchTodayForecast: () => Promise<void>;
  fetchForecastTrends: (type?: string, days?: number) => Promise<void>;
  triggerNewPredictions: () => Promise<void>;
  clearErrors: () => void;
}

const initialLoadingState: LoadingState = {
  weekly: false,
  normal: false,
  today: false,
  trends: false,
  trigger: false
};

const initialErrorState: ErrorState = {
  weekly: null,
  normal: null,
  today: null,
  trends: null,
  trigger: null
};

export const useForecastStore = create<ForecastState>((set) => ({
  weeklyForecast: null,
  normalForecast: null,
  todayForecast: null,
  trendsData: [],
  loading: initialLoadingState,
  error: initialErrorState,
  lastTriggered: null,

  // Actions
  fetchWeeklyForecast: async () => {
    set(state => ({ loading: { ...state.loading, weekly: true } }));
    try {
      set(state => ({ error: { ...state.error, weekly: null } }));
      const data = await getWeeklyForecast();
      set(state => ({ 
        weeklyForecast: data, 
        loading: { ...state.loading, weekly: false }
      }));
    } catch (error) {
      console.error("Failed to fetch weekly forecast:", error);
      set(state => ({
        error: { ...state.error, weekly: "Failed to fetch weekly forecast data" },
        loading: { ...state.loading, weekly: false }
      }));
    }
  },

  fetchNormalPredictions: async () => {
    set(state => ({ loading: { ...state.loading, normal: true } }));
    try {
      set(state => ({ error: { ...state.error, normal: null } }));
      const data = await getNormalPredictions();
      set(state => ({ 
        normalForecast: data, 
        loading: { ...state.loading, normal: false }
      }));
    } catch (error) {
      console.error("Failed to fetch normal predictions:", error);
      set(state => ({
        error: { ...state.error, normal: "Failed to fetch normal predictions data" },
        loading: { ...state.loading, normal: false }
      }));
    }
  },

  fetchTodayForecast: async () => {
    set(state => ({ loading: { ...state.loading, today: true } }));
    try {
      set(state => ({ error: { ...state.error, today: null } }));
      const data = await getTodayForecast();
      set(state => ({ 
        todayForecast: data, 
        loading: { ...state.loading, today: false }
      }));
    } catch (error) {
      console.error("Failed to fetch today's forecast:", error);
      set(state => ({
        error: { ...state.error, today: "Failed to fetch today's forecast data" },
        loading: { ...state.loading, today: false }
      }));
    }
  },

  fetchForecastTrends: async (type = "drought", days = 7) => {
    set(state => ({ loading: { ...state.loading, trends: true } }));
    try {
      set(state => ({ error: { ...state.error, trends: null } }));
      const data = await getForecastTrends(type, days);
      set(state => ({ 
        trendsData: data, 
        loading: { ...state.loading, trends: false }
      }));
    } catch (error) {
      console.error("Failed to fetch forecast trends:", error);
      set(state => ({
        error: { ...state.error, trends: "Failed to fetch forecast trend data" },
        loading: { ...state.loading, trends: false }
      }));
    }
  },

  triggerNewPredictions: async () => {
    set(state => ({ loading: { ...state.loading, trigger: true } }));
    try {
      set(state => ({ error: { ...state.error, trigger: null } }));
      await triggerPredictions();
      
      // Store the current state to access actions
      const currentState = useForecastStore.getState();
      
      set(state => ({ 
        lastTriggered: new Date(),
        loading: { ...state.loading, trigger: false }
      }));

      // Fetch new predictions after triggering
      await Promise.all([
        currentState.fetchWeeklyForecast(),
        currentState.fetchNormalPredictions()
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to trigger new predictions";
      console.error("Failed to trigger predictions:", error);
      set(state => ({
        error: { ...state.error, trigger: errorMessage },
        loading: { ...state.loading, trigger: false }
      }));
    }
  },

  clearErrors: () => set(state => ({ 
    error: {
      weekly: null,
      normal: null,
      today: null,
      trends: null,
      trigger: null
    }
  })),
}));
