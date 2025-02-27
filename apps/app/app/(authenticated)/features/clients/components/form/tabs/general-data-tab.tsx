'use client';

import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { CompletedClientFormData } from '../../../validation/schema-factory';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@repo/design-system/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface GeneralDataTabProps {
  form: UseFormReturn<CompletedClientFormData>;
}

export function GeneralDataTab({ form }: GeneralDataTabProps) {
  const clientType = form.watch('clientType');
  
  // Set up field array for addresses
  const addressesArray = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="clientType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fisica" id="fisica" />
                        <label htmlFor="fisica" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Persona Física
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moral" id="moral" />
                        <label htmlFor="moral" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Persona Moral
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa el nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="litigio">Litigio</SelectItem>
                        <SelectItem value="consultoria">Consultoría</SelectItem>
                        <SelectItem value="corporativo">Corporativo</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="prospecto">Prospecto</SelectItem>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="archivado">Archivado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <FormField
              control={form.control}
              name="isConfidential"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Cliente Confidencial</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Marca este cliente como confidencial
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega notas adicionales sobre este cliente"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dirección</h3>
        
        {addressesArray.fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="text-lg">Dirección {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`addresses.${index}.addressType`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Direccion</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="casa">Casa</SelectItem>
                        <SelectItem value="facturación">Facturación</SelectItem>
                        <SelectItem value="envío">Envío</SelectItem>
                        <SelectItem value="sucursal">Sucursal</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="bodega">Bodega</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
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
                    <FormLabel>Calle</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle, edificio, suite, etc." {...field} />
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
                      <FormLabel>Ciudad</FormLabel>
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
                      <FormLabel>Estado</FormLabel>
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
                      <FormLabel>Código Postal</FormLabel>
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
                      <FormLabel>Pais</FormLabel>
                      <FormControl>
                        <Input value={field.value || "Mexico"} onChange={field.onChange} />
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
                        <FormLabel>Dirección Principal</FormLabel>
                        <FormDescription>
                          Marca esta dirección como principal
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
            {addressesArray.fields.length > 1 && (
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
                  Eliminar Direccion
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}

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
    </div>
  );
}