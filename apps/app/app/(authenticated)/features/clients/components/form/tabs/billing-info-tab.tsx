'use client';

import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';

export function BillingInfoTab({ form }) {
  const { register } = form;

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Billing Name</Label>
        <Input {...register('billing.name')} placeholder="Billing Name" />
      </div>
      <div>
        <Label>Payment Terms</Label>
        <Select {...register('billing.billingTerms')}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Net 30">Net 30</SelectItem>
            <SelectItem value="Net 60">Net 60</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Currency</Label>
        <Select {...register('billing.billingCurrency')}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MXN">MXN</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}