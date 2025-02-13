"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { useWeeklyTimeEntries } from "@/app/hook/src/time-entries";
import { Clock } from "lucide-react";

export function WeeklyTimeKPI() {
  const { data, isLoading, error } = useWeeklyTimeEntries();
  const totalHours = data?.totalHours ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Weekly Hours
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Failed to load</div>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Hours logged this week
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
} 