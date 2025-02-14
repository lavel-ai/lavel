import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { LucideIcon } from "lucide-react";

interface BaseKPIProps {
  title: string;
  icon: LucideIcon;
  isLoading?: boolean;
  error?: Error | null;
  value: string | number;
  description?: string;
}

export function BaseKPI({
  title,
  icon: Icon,
  isLoading,
  error,
  value,
  description,
}: BaseKPIProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">
          {title}
        </CardTitle>
        <div className="pl-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        {isLoading ? (
          <div className="animate-pulse text-center font-bold text-2xl">
            Loading...
          </div>
        ) : error ? (
          <div className="text-center text-destructive text-sm">
            Failed to load
          </div>
        ) : (
          <>
            <div className="text-center font-bold text-3xl">{value}</div>
            {description && (
              <p className="mt-1 text-center text-muted-foreground text-xs">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}