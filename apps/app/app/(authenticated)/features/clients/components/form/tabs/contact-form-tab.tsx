'use client';

import { Controller } from 'react-hook-form';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';

export function ContactForm({ index, control }) {
  return (
    <div className="space-y-2">
      <Controller
        name={`contactInfo.${index}.contactName`}
        control={control}
        render={({ field }) => <Input {...field} placeholder="Contact Name" />}
      />
      <Controller
        name={`contactInfo.${index}.email`}
        control={control}
        render={({ field }) => <Input {...field} placeholder="Email" />}
      />
      <Controller
        name={`contactInfo.${index}.primaryPhone`}
        control={control}
        render={({ field }) => <Input {...field} placeholder="Phone" />}
      />
    </div>
  );
}