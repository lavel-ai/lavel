import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@repo/design-system/components/ui/radio-group";
import { useFormContext } from "react-hook-form";
import type { CaseFormData } from "../../schemas";

export function CaseTypeTab() {
  const form = useFormContext<CaseFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Case Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of case you want to create. This will determine the additional information required.
        </p>
      </div>

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4"
              >
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="advisory" id="advisory" />
                      <label
                        htmlFor="advisory"
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">Advisory</span>
                        <span className="text-sm text-muted-foreground">
                          Legal consultation and advice
                        </span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="litigation" id="litigation" />
                      <label
                        htmlFor="litigation"
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="font-medium">Litigation</span>
                        <span className="text-sm text-muted-foreground">
                          Court proceedings and legal action
                        </span>
                      </label>
                    </div>
                  </FormControl>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <textarea
                {...field}
                className="w-full min-h-[100px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add any additional notes about the case type selection..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
