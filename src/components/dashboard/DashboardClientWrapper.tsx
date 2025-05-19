'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

// Import the DashboardClient component
const DashboardClient = dynamic(
  () => import('./DashboardClient'),
  { loading: () => <DashboardSkeleton /> }
);

export default function DashboardClientWrapper() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
} 