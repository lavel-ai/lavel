'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ClientFormData } from '../../../validation/schemas';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';

interface ContactInfoTabProps {
  form: UseFormReturn<ClientFormData>;
}

export function ContactInfoTab({ form }: ContactInfoTabProps) {
  // Set up field array for contacts
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contactInfo',
  });

  // Set up field array for addresses
  const addressesArray = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Persons</h3>
        
        {fields.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No contacts added yet.</p>
                <Button 
                  type="button" 
                  onClick={() => append({ 
                    contactName: '',
                    email: '',
                    primaryPhone: '',
                    secondaryPhone: '',
                    extension: '',
                    department: '',
                    role: '',
                    isPrimary: fields.length === 0, // First contact is primary by default
                    createdBy: '',
                    updatedBy: '',
                    clientId: '',
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact Person
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => (
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
                      <FormLabel>Contact Name</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Primary Phone</FormLabel>
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
                        <FormLabel>Secondary Phone</FormLabel>
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
                        <FormLabel>Role</FormLabel>
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
                      <FormLabel>Department</FormLabel>
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
                        <FormLabel>Primary Contact</FormLabel>
                        <FormDescription>
                          Mark this as the primary contact for this client
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            // If this contact is being set as primary, unset all others
                            if (checked) {
                              fields.forEach((_, i) => {
                                if (i !== index) {
                                  form.setValue(`contactInfo.${i}.isPrimary`, false);
                                }
                              });
                            }
                            field.onChange(checked);
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
                    // If removing the primary contact, make the first remaining contact primary
                    const isPrimary = form.getValues(`contactInfo.${index}.isPrimary`);
                    remove(index);
                    if (isPrimary && fields.length > 1) {
                      const newIndex = index === 0 ? 0 : index - 1;
                      form.setValue(`contactInfo.${newIndex}.isPrimary`, true);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Contact
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
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Contact
          </Button>
        )}
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium">Addresses</h3>
        
        {addressesArray.fields.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No addresses added yet.</p>
                <Button 
                  type="button" 
                  onClick={() => addressesArray.append({ 
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Mexico',
                    addressType: 'office',
                    isPrimary: true,
                    isBilling: true,
                    createdBy: '',
                    updatedBy: '',
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          addressesArray.fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader>
                <CardTitle className="text-lg">Address {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`addresses.${index}.addressType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select address type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="shipping">Shipping</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addresses.${index}.street`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address, building, suite, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.state`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.zipCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal/Zip Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input defaultValue="Mexico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.isPrimary`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Primary Address</FormLabel>
                          <FormDescription>
                            Mark as primary address
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              // If this address is being set as primary, unset all others
                              if (checked) {
                                addressesArray.fields.forEach((_, i) => {
                                  if (i !== index) {
                                    form.setValue(`addresses.${i}.isPrimary`, false);
                                  }
                                });
                              }
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`addresses.${index}.isBilling`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Billing Address</FormLabel>
                          <FormDescription>
                            Use for billing purposes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    // If removing the primary address, make the first remaining address primary
                    const isPrimary = form.getValues(`addresses.${index}.isPrimary`);
                    addressesArray.remove(index);
                    if (isPrimary && addressesArray.fields.length > 1) {
                      const newIndex = index === 0 ? 0 : index - 1;
                      form.setValue(`addresses.${newIndex}.isPrimary`, true);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Address
                </Button>
              </CardFooter>
            </Card>
          ))
        )}

        {addressesArray.fields.length > 0 && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => addressesArray.append({ 
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'Mexico',
              addressType: 'office',
              isPrimary: false,
              isBilling: false,
              createdBy: '',
              updatedBy: '',
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Address
          </Button>
        )}
      </div>

      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-medium">Portal Access</h3>
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="portalAccess"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Client Portal Access</FormLabel>
                    <FormDescription>
                      Enable access to the client portal
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('portalAccess') && (
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="portalAccessEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portal Access Email</FormLabel>
                      <FormDescription>
                        The client will use this email to access the portal
                      </FormDescription>
                      <FormControl>
                        <Input type="email" placeholder="client@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 