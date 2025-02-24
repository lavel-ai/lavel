import { Button } from "@repo/design-system/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TabsState } from "../../schemas/case-form-schema";

interface FormNavigationProps {
  tabs: TabsState;
  currentTab: keyof TabsState;
  onTabChange: (tab: keyof TabsState) => void;
  isSubmitting?: boolean;
  onSubmit?: () => void;
}

export function FormNavigation({
  tabs,
  currentTab,
  onTabChange,
  isSubmitting,
  onSubmit,
}: FormNavigationProps) {
  const tabKeys = Object.keys(tabs) as (keyof TabsState)[];
  const currentIndex = tabKeys.indexOf(currentTab);
  const isFirstTab = currentIndex === 0;
  const isLastTab = currentIndex === tabKeys.length - 1;

  const handleNext = () => {
    if (!isLastTab) {
      onTabChange(tabKeys[currentIndex + 1]);
    } else if (onSubmit) {
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (!isFirstTab) {
      onTabChange(tabKeys[currentIndex - 1]);
    }
  };

  return (
    <div className="flex justify-between mt-6 pt-6 border-t">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={isFirstTab || isSubmitting}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="flex gap-2">
        {!isLastTab ? (
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Case..." : "Create Case"}
          </Button>
        )}
      </div>
    </div>
  );
}
