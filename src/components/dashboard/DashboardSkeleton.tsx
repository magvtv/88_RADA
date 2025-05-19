import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <>
      {/* Today's Forecast Skeleton */}
      <div className="grid md:mx-6 sm:mx-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Baringo Disaster Forecast</CardTitle>
            <CardDescription>Current disaster conditions and outlook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-[125px] w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts Skeleton */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Loading alerts...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-[80px] w-full rounded-lg" />
              <Skeleton className="h-[80px] w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disaster Trend Chart Skeleton */}
      <div className="md:mx-6 sm:mx-2">
        <Card>
          <CardHeader>
            <CardTitle>Disaster Trend</CardTitle>
            <CardDescription>7-day disaster forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Forecast Preview Skeleton */}
      <div className="md:mx-6 sm:mx-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Weekly Forecast</CardTitle>
            <CardDescription>Next 7 days outlook</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-[150px] w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 