"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { useLitigationCasesCount } from "@/app/hook/src/cases";
import { Gavel } from "lucide-react";

export function LitigationCasesKPI() {
  const { data: count, isLoading, error } = useLitigationCasesCount();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Litigation Cases
        </CardTitle>
        <Gavel className="h-4 w-4 text-muted-foreground" />
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
              Active litigation cases
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
} 