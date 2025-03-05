'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Switch } from '@repo/design-system/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';

export interface SwitchFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Standardized switch field component for forms
 */
export function SwitchField({
  form,
  name,
  label,
  description,
  disabled = false,
}: SwitchFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
