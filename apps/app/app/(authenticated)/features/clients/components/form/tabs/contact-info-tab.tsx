'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CompletedClientFormData } from '../../../validation/schema-factory';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@repo/design-system/components/ui/card';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { Switch } from '@repo/design-system/components/ui/switch';

interface ContactInfoTabProps {
  form: UseFormReturn<CompletedClientFormData>;
}

export function ContactInfoTab({ form }: ContactInfoTabProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contactInfo',
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Persons</h3>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="text-lg">Contact {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`contactInfo.${index}.contactName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contact Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`contactInfo.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Mail className="h-4 w-4" />
                          </span>
                          <Input
                            className="rounded-l-none"
                            type="email"
                            placeholder="email@example.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contactInfo.${index}.primaryPhone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Telefono Principal
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            <Phone className="h-4 w-4" />
                          </span>
                          <Input
                            className="rounded-l-none"
                            placeholder="+1 (555) 123-4567"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`contactInfo.${index}.secondaryPhone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contactInfo.${index}.extension`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extension</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`contactInfo.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puesto</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CEO, Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`contactInfo.${index}.department`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Legal, Finance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`contactInfo.${index}.isPrimary`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Contacto Principal</FormLabel>
                      <FormDescription>
                        Marca este contacto como el principal para este cliente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onChange={(checked) => {
                          form.setValue(
                            `contactInfo.${index}.isPrimary`,
                            checked
                          );
                          if (checked) {
                            // If this contact is set as primary, set all others to not primary
                            fields.forEach((_, i) => {
                              if (i !== index) {
                                form.setValue(
                                  `contactInfo.${i}.isPrimary`,
                                  false
                                );
                              }
                            });
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  // Check if this is a primary contact before removing
                  const isPrimary = form.getValues(
                    `contactInfo.${index}.isPrimary`
                  );
                  remove(index);
                  if (isPrimary && fields.length > 1) {
                    // If removing the primary contact, make the first remaining contact primary
                    form.setValue(`contactInfo.0.isPrimary`, true);
                  }
                }}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Contact
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              contactName: '',
              email: '',
              primaryPhone: '',
              secondaryPhone: '',
              extension: '',
              department: '',
              role: '',
              isPrimary: false,
              createdBy: '',
              updatedBy: '',
              clientId: '',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Contact
        </Button>
      </div>
    </div>
  );
}