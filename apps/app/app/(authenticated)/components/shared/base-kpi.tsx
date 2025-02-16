// apps/app/app/(authenticated)/components/shared/base-kpi.tsx
// REMOVE "use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { cn } from "@repo/design-system/lib/utils";
import { type LucideIcon } from "lucide-react"

type Props = {
  title: string;
  value: number | string;
  isLoading: boolean;
  icon?: LucideIcon; // Icon is now a component type
  diff?: number;
  description?: string;
  error?: string | null;
};

export const BaseKPI = ({
  title,
  value,
  isLoading,
  icon: Icon, // Use a different name for the prop, like 'IconComponent'
  diff,
  description,
  error,
}: Props) => {

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon />} {/* Render the icon directly */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {diff && (
          <div
            className={cn("text-sm", {
              "text-destructive": diff < 0,
              "text-emerald-500": diff > 0,
            })}
          >
            {diff > 0 ? "+" : ""}
            {diff}%
          </div>
        )}
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};