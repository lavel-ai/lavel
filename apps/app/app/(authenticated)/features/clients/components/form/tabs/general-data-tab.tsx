'use client';

import { useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Button } from '@repo/design-system/components/ui/button';
import { AddressInput } from './address-input';

export function GeneralDataTab({ form }) {
  const { register, watch, control } = form;
  const clientType = watch('clientType');
  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' });

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Client Type</Label>
        <Select {...register('clientType')}>
          <SelectTrigger>
            <SelectValue placeholder="Select client type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fisica">Persona Física</SelectItem>
            <SelectItem value="moral">Persona Moral</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{clientType === 'fisica' ? 'Full Name' : 'Legal Name'}</Label>
        <Input {...register('legalName')} placeholder={clientType === 'fisica' ? 'e.g., Juan Pérez' : 'e.g., Empresa SA de CV'} />
      </div>
      <div>
        <Label>Addresses</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2 mb-2">
            <AddressInput index={index} control={control} />
            <Button type="button" variant="destructive" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ street: '', city: '', state: '', zipCode: '', country: 'Mexico' })}>
          Add Address
        </Button>
      </div>
    </div>
  );
}