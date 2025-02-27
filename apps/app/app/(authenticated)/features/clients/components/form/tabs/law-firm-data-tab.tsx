'use client';

import { Card, CardContent } from '@repo/design-system/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { CompletedClientFormData } from '../../../validation/schema-factory';
import { getLawyers } from '../../../../lawyers/actions/lawyer-actions';
import { LawyerCombobox, type LawyerOption } from '../lawyer-combobox';

interface LawFirmDataTabProps {
  form: UseFormReturn<CompletedClientFormData>;
}

export function LawFirmDataTab({ form }: LawFirmDataTabProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerOption | null>(
    null
  );
  const leadLawyerId = form.watch('leadLawyerId');

  // Fetch lawyer details when the ID changes
  useEffect(() => {
    if (leadLawyerId) {
      const fetchLawyerDetails = async () => {
        try {
          const response = await getLawyers();
          if (response.status === 'success' && response.data) {
            const lawyer = response.data.find((l) => l.id === leadLawyerId);
            if (lawyer) {
              setSelectedLawyer({
                id: lawyer.id,
                name: lawyer.name,
                lastName: lawyer.lastName,
                maternalLastName: lawyer.maternalLastName,
                practiceArea: lawyer.practiceArea,
                isLeadLawyer: lawyer.isLeadLawyer,
              });
            }
          }
        } catch (_error) {
          // Error handling without console.error
        }
      };

      fetchLawyerDetails();
    } else {
      setSelectedLawyer(null);
    }
  }, [leadLawyerId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Asignación de Abogado Principal</h3>
            
            <FormDescription>
              Asigna un abogado principal que será responsable de este cliente.
            </FormDescription>
            
            <FormField
              control={form.control}
              name="leadLawyerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abogado Principal</FormLabel>
                  <FormControl>
                    <div className="relative w-full" style={{ position: 'relative', zIndex: 50 }}>
                      <LawyerCombobox
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecciona un abogado principal"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedLawyer && (
              <div className="rounded-md border bg-muted p-4">
                <div>
                  <h4 className="font-medium">
                    {selectedLawyer.name} {selectedLawyer.lastName} {selectedLawyer.maternalLastName || ''}
                  </h4>
                  {selectedLawyer.practiceArea && (
                    <p className="text-muted-foreground text-sm">
                      Especialidad: {selectedLawyer.practiceArea}
                    </p>
                  )}
                  {selectedLawyer.isLeadLawyer && (
                    <p className="mt-1 text-primary text-sm">
                      Abogado Principal de la Firma
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}