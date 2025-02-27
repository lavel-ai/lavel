'use client';

import { UseFormReturn } from 'react-hook-form';
import { CompletedClientFormData } from '../../../validation/schema-factory';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';

interface BillingInfoTabProps {
  form: UseFormReturn<CompletedClientFormData>;
}

export function BillingInfoTab({ form }: BillingInfoTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="billing.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Name</FormLabel>
                  <FormDescription>
                    Name to appear on invoices (defaults to client legal name if left empty)
                  </FormDescription>
                  <FormControl>
                    <Input 
                      placeholder="Enter billing name" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing.rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC</FormLabel>
                  <FormDescription>
                    Tax ID for billing purposes (defaults to client RFC if left empty)
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Enter RFC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billing.rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing RFC</FormLabel>
                  <FormDescription>
                    Tax ID for billing purposes (defaults to client RFC if left empty)
                  </FormDescription>
                  <FormControl>
                    <Input 
                      placeholder="Enter billing RFC" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing.billingCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing.billingTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="billing.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Email</FormLabel>
                  <FormDescription>
                    Email address for sending invoices
                  </FormDescription>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="billing@example.com" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}