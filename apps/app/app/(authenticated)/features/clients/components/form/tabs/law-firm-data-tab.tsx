'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Label } from '@repo/design-system/components/ui/label';
import { LawyerSelection } from '../../shared/components/lawyer-selection';

export function LawFirmDataTab({ form }) {
  const { register, control } = form;

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Category</Label>
        <Select {...register('category')}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="litigation">Litigation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Primary Lawyer</Label>
        <LawyerSelection control={control} />
      </div>
      <div>
        <Label>Status</Label>
        <Select {...register('status')}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}