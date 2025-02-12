"use client";

// apps/app/app/(authenticated)/dashboard/components/kpi/advisory-cases-kpi.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { useAdvisoryCasesCount } from "@repo/hooks";
import { Scale } from "lucide-react";

export function AdvisoryCasesKPI() {
  const { data: count, isLoading, error } = useAdvisoryCasesCount();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Advisory Cases
        </CardTitle>
        <Scale className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Failed to load</div>
        ) : (
          <>
            <div className="text-2xl font-bold">{count}</div>
            <p className="text-xs text-muted-foreground">
              Active advisory cases
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}