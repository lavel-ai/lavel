'use client';

import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";

export function DepartmentsListSkeleton() {
  // Create 4 skeleton cards
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DepartmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

function DepartmentCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border h-[140px] flex flex-col">
      <div className="h-1 bg-muted w-full"></div>
      
      <CardHeader className="pb-1 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-1 px-3 flex flex-col justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}
