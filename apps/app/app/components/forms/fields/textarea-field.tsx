'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

export interface TextareaFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

/**
 * Standardized textarea field component for forms
 */
export function TextareaField({
  form,
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea 
              placeholder={placeholder} 
              {...field} 
              value={field.value || ''}
              disabled={disabled}
              rows={rows}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
