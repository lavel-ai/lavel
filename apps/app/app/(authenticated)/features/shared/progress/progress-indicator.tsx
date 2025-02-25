// apps/app/(authenticated)/features/shared/progress/progress-indicator.tsx
'use client';

import { cn } from "@repo/design-system/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface TabValidation {
  isComplete: boolean;
  hasErrors: boolean;
}

interface ProgressIndicatorProps {
  tabs: Record<string, TabValidation>;
}

export function ProgressIndicator({ tabs }: ProgressIndicatorProps) {
  const tabKeys = Object.keys(tabs);
  const totalSteps = tabKeys.length;
  const completedSteps = tabKeys.filter(tab => tabs[tab].isComplete && !tabs[tab].hasErrors).length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            progress === 100 ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {tabKeys.map((tab, index) => {
          const status = tabs[tab];
          return (
            <div key={tab} className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full",
                  status.hasErrors ? "bg-red-500" : 
                  status.isComplete ? "bg-green-500" : 
                  "bg-muted-foreground/30"
                )}
              />
              <span className="text-xs mt-1 text-muted-foreground">
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 