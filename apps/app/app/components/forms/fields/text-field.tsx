'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

export interface TextFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Standardized text input field component for forms
 */
export function TextField({
  form,
  name,
  label,
  placeholder,
  description,
  required = false,
  disabled = false,
}: TextFieldProps) {
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
            <Input 
              placeholder={placeholder} 
              {...field} 
              value={field.value || ''}
              disabled={disabled}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
