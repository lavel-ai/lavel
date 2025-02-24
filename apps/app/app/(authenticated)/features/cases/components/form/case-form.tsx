import { Form } from "@repo/design-system/components/ui/form";
import { ProgressIndicator } from "../../../shared/progress/progress-indicator";
import { CaseTypeTab } from "./tabs/case-type-tab";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { FormNavigation } from "./form-navigation";
import { useCaseForm } from "../../hooks/use-case-form";
import { TabsState } from "../../schemas/case-form-schema";

export function CaseForm() {
  const {
    form,
    tabs,
    activeTab,
    setActiveTab,
    isSubmitting,
    onSubmit,
  } = useCaseForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ProgressIndicator
          tabs={tabs}
          currentTab={activeTab}
        />

        <div className="space-y-8">
          {activeTab === "caseType" && <CaseTypeTab />}
          {activeTab === "basicInfo" && <BasicInfoTab />}
          {/* Add other tab components here */}
        </div>

        <FormNavigation
          tabs={tabs}
          currentTab={activeTab as keyof TabsState}
          onTabChange={setActiveTab}
          isSubmitting={isSubmitting}
          onSubmit={form.handleSubmit(onSubmit)}
        />
      </form>
    </Form>
  );
}
