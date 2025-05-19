'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component
const ForecastPageSkeleton = () => (
  <div className="space-y-6">
    {/* Chart skeleton */}
    <Card><CardContent className="p-6"><Skeleton className="h-[400px] w-full rounded-lg" /></CardContent></Card>
    
    {/* Card skeletons */}
    <div>
      <h2 className="text-xl font-semibold mb-4">Daily Forecasts</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px] rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

// Simple dynamic import 
const ForecastPageClient = dynamic(
  () => import('./ForecastPageClient'),
  { loading: () => <ForecastPageSkeleton /> }
);

export default function ForecastPageClientWrapper() {
  return (
    <Suspense fallback={<ForecastPageSkeleton />}>
      <ForecastPageClient />
    </Suspense>
  );
} 