// apps/app/(authenticated)/features/shared/progress/progress-indicator.tsx
import { cn } from "@repo/design-system/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface TabValidation {
  hasError: boolean;
  isComplete: boolean;
  label: string;
}

interface ProgressIndicatorProps {
  tabs: Record<string, TabValidation>;
  currentTab: string;
}

export function ProgressIndicator({ tabs, currentTab }: ProgressIndicatorProps) {
  const totalSteps = Object.keys(tabs).length;
  const completedSteps = Object.values(tabs).filter(tab => tab.isComplete).length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="mt-2 mb-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Progress
        </div>
        <div className="text-sm text-muted-foreground">
          {completedSteps} of {totalSteps} completed
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Tab Status Map */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {Object.entries(tabs).map(([key, tab]) => (
          <div
            key={key}
            className={cn(
              "flex items-center space-x-2 p-2 rounded-md transition-colors",
              currentTab === key && "bg-muted",
              tab.hasError && "text-destructive",
              tab.isComplete && "text-primary"
            )}
          >
            {tab.hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
            ) : tab.isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
            )}
            <span className="text-sm font-medium">
              {tab.label}
            </span>
            {tab.hasError && (
              <span className="text-xs text-destructive ml-auto">Required</span>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {Object.values(tabs).some(tab => tab.hasError) && (
        <div className="flex items-center mt-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          Please complete all required fields
        </div>
      )}
    </div>
  );
} 