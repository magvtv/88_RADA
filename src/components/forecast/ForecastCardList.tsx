"use client";

import { memo } from 'react';
import { ForecastCard } from './ForecastCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { WeeklyForecast } from '@/types/forecast';

interface ForecastCardListProps {
  weeklyForecast: WeeklyForecast | null;
  loading: boolean;
  highlightToday?: boolean;
  title?: string;
}

// Memoize the component to avoid unnecessary re-renders
function ForecastCardListComponent({
  weeklyForecast,
  loading,
  highlightToday = false,
  title = "Daily Forecasts"
}: ForecastCardListProps) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };
  
  const todayDate = getTodayDate();
  
  return (
    <div>
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          // Show skeletons while loading
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-lg" />
          ))
        ) : weeklyForecast && weeklyForecast.forecasts && weeklyForecast.forecasts.length > 0 ? (
          // Show actual data
          weeklyForecast.forecasts.map((day) => (
            <ForecastCard 
              key={day.date} 
              forecast={day} 
              isHighlighted={highlightToday && day.date === todayDate}
            />
          ))
        ) : (
          // Show empty state
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No forecast data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the memoized component
export const ForecastCardList = memo(ForecastCardListComponent); 