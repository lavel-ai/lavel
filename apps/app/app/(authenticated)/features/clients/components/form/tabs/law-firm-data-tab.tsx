'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ClientFormData } from '../../../validation/schemas';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@repo/design-system/components/ui/textarea';

interface LawFirmDataTabProps {
  form: UseFormReturn<ClientFormData>;
}

export function LawFirmDataTab({ form }: LawFirmDataTabProps) {
  const clientType = form.watch('clientType');
  
  // Only show corporation fields for moral clients
  if (clientType !== 'moral') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>This section is only applicable for "Persona Moral" clients.</p>
              <p className="text-sm mt-2">Please select "Persona Moral" in the General tab if this is a company.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Set up field array for corporations
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'corporations',
  });

  return (
    <div className="space-y-6">
      {fields.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No corporation information added yet.</p>
              <Button 
                type="button" 
                onClick={() => append({ 
                  name: form.getValues('legalName') || '', 
                  constitutionDate: '', 
                  notaryNumber: null,
                  notaryState: '',
                  instrumentNumber: '',
                  notes: '',
                  createdBy: '',
                  updatedBy: '',
                  clientId: '',
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Corporation Information
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader>
              <CardTitle className="text-lg">Corporation Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`corporations.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corporation Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`corporations.${index}.constitutionDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Constitution Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`corporations.${index}.notaryNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notary Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`corporations.${index}.notaryState`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notary State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`corporations.${index}.instrumentNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrument Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`corporations.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the corporation"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Corporation
              </Button>
            </CardFooter>
          </Card>
        ))
      )}

      {fields.length > 0 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => append({ 
            name: '', 
            constitutionDate: '', 
            notaryNumber: null,
            notaryState: '',
            instrumentNumber: '',
            notes: '',
            createdBy: '',
            updatedBy: '',
            clientId: '',
          })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Corporation
        </Button>
      )}
    </div>
  );
}