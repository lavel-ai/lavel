import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";
import { useFormContext } from "react-hook-form";
import type { CaseFormData } from "../../../schemas";

export function AuthorityTab() {
  const form = useFormContext<CaseFormData>();
  const caseType = form.watch("type");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Authority Information</h3>
        <p className="text-sm text-muted-foreground">
          {caseType === "litigation" 
            ? "Enter the court and judge information for this case."
            : "Enter the relevant authority information for this case."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {caseType === "litigation" ? (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter court name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courtLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select court level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="district">District Court</SelectItem>
                      <SelectItem value="appellate">Appellate Court</SelectItem>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="judgeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judge Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter judge name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter case number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="authorityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authority Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter authority name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authority Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authority type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="regulatory">Regulatory Body</SelectItem>
                      <SelectItem value="government">Government Agency</SelectItem>
                      <SelectItem value="administrative">Administrative Body</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="authorityReference"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter reference number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
