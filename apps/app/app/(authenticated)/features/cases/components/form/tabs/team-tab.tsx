import { Button } from "@repo/design-system/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { CaseFormData } from "../../schemas";
import { Plus, Trash2 } from "lucide-react";

export function TeamTab() {
  const form = useFormContext<CaseFormData>();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Assign team members to this case.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="leadAttorney"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead Attorney</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead attorney" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Fetch from API */}
                  <SelectItem value="1">John Smith</SelectItem>
                  <SelectItem value="2">Jane Doe</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responsiblePartner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsible Partner</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible partner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* TODO: Fetch from API */}
                  <SelectItem value="1">Michael Johnson</SelectItem>
                  <SelectItem value="2">Sarah Williams</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Team Members</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ userId: "", role: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name={`teamMembers.${index}.userId`}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* TODO: Fetch from API */}
                          <SelectItem value="1">Alex Brown</SelectItem>
                          <SelectItem value="2">Emily Davis</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`teamMembers.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="associate">Associate</SelectItem>
                          <SelectItem value="paralegal">Paralegal</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
