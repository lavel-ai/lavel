'use client';

import { Controller } from 'react-hook-form';
import { LawyerCombobox } from '../lawyer-combobox';
import { FormControl } from '@repo/design-system/components/ui/form';
import { Control } from 'react-hook-form';

export function LawyerSelection({ control }: { control: Control }) {
  return (
    <Controller
      name="leadLawyerId"
      control={control}
      render={({ field }) => (
        <FormControl>
          <div className="relative w-full" style={{ position: 'relative', zIndex: 50 }}>
            <LawyerCombobox
              value={field.value}
              onChange={field.onChange}
              placeholder="Selecciona un abogado"
            />
          </div>
        </FormControl>
      )}
    />
  );
}