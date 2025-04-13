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
  getForecastByLocation,
  getForecastTrends
} from "@/services/forecastService";

interface ForecastState {
  weeklyForecast: WeeklyForecast | null;
  todayForecast: DailyForecast | null;
  trendsData: ForecastChartData[] | CombinedForecastChartData[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchWeeklyForecast: () => Promise<void>;
  fetchTodayForecast: () => Promise<void>;
  fetchForecastByLocation: (
    latitude: number,
    longitude: number
  ) => Promise<void>;
  fetchForecastTrends: (
    type?: string,
    days?: number
  ) => Promise<void>;
}

export const useForecastStore = create<ForecastState>((set) => ({
  weeklyForecast: null,
  todayForecast: null,
  trendsData: [],
  loading: false,
  error: null,

  // Actions
  fetchWeeklyForecast: async () => {
    set({loading: true})
    try {
      set({ loading: true, error: null });
      const data = await getWeeklyForecast();
      set({ weeklyForecast: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch weekly forecast:", error);
      set({
        error: "Failed to fetch weekly forecast data",
        loading: false
      });
    }
  },

  fetchTodayForecast: async () => {
    set({ loading: true });
    try {
      set({ loading: true, error: null });
      const data = await getTodayForecast();
      set({ todayForecast: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch today's forecast:", error);
      set({
        error: "Failed to fetch today's forecast data",
        loading: false
      });
    }
  },

  fetchForecastByLocation: async (latitude, longitude) => {
    try {
      set({ loading: true, error: null });
      const data = await getForecastByLocation(latitude, longitude);
      set({ weeklyForecast: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch location forecast:", error);
      set({
        error: "Failed to fetch location forecast data",
        loading: false
      });
    }
  },

  fetchForecastTrends: async (type = "drought", days = 7) => {
    set({ loading: true });
    try {
      set({ loading: true, error: null });
      const data = await getForecastTrends(type, days);
      set({ trendsData: data, loading: false });
    } catch (error) {
      console.error("Failed to fetch forecast trends:", error);
      set({
        error: "Failed to fetch forecast trend data",
        loading: false
      });
    }
  },
}));
