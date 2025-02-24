import { Button } from "@repo/design-system/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { CaseFormData } from "../../schemas";
import { DateTimePicker } from "@repo/design-system/components/ui/date-time-picker";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Textarea } from "@repo/design-system/components/ui/textarea";

export function EventsTab() {
  const form = useFormContext<CaseFormData>();
  const caseType = form.watch("type");
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "events",
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Case Events</h3>
        <p className="text-sm text-muted-foreground">
          Add important events and deadlines related to this case.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Events</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              title: "",
              type: "",
              startDate: new Date(),
              endDate: new Date(),
              location: "",
              description: "",
              attendees: [],
              reminder: false,
              reminderBefore: "30",
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Event {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`events.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter event title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`events.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseType === "litigation" ? (
                          <>
                            <SelectItem value="hearing">Hearing</SelectItem>
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="deposition">Deposition</SelectItem>
                            <SelectItem value="filing">Filing Deadline</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="deadline">Deadline</SelectItem>
                            <SelectItem value="review">Document Review</SelectItem>
                          </>
                        )}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`events.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`events.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        minDate={form.watch(`events.${index}.startDate`)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`events.${index}.location`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`events.${index}.reminderBefore`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reminder time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                        <SelectItem value="1440">1 day before</SelectItem>
                        <SelectItem value="10080">1 week before</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`events.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter event description"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`events.${index}.attendees`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attendees</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => {
                        const currentValues = field.value || [];
                        if (!currentValues.includes(value)) {
                          field.onChange([...currentValues, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add attendees" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: Fetch from API */}
                        <SelectItem value="1">John Smith</SelectItem>
                        <SelectItem value="2">Jane Doe</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((attendeeId) => (
                        <div
                          key={attendeeId}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                        >
                          <span className="text-sm">
                            {/* TODO: Get name from ID */}
                            {attendeeId === "1" ? "John Smith" : "Jane Doe"}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 hover:bg-transparent hover:text-destructive"
                            onClick={() => {
                              field.onChange(
                                field.value?.filter((id) => id !== attendeeId)
                              );
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
