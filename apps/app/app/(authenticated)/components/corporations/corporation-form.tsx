        'use client';

        import { useState, useTransition } from 'react';
        import { useForm } from 'react-hook-form';
        import { zodResolver } from '@hookform/resolvers/zod';
        import * as z from 'zod';
        import {
          Form,
          FormControl,
          FormField,
          FormItem,
          FormLabel,
          FormMessage,
        } from '@repo/design-system/components/ui/form';
        import { Input } from '@repo/design-system/components/ui/input';
        import { Button } from '@repo/design-system/components/ui/button';
        import { corporationInsertSchema } from '@repo/database/src/tenant-app/schema/corporations-schema';
        import { createCorporation } from '@/app/actions/corporations/corporations-actions';
        import { useRouter } from 'next/navigation';

        interface CorporationFormProps {
          closeDialog: () => void;
          tempClientId: string | null; // Add this prop
        }

        const CorporationForm: React.FC<CorporationFormProps> = ({ closeDialog, tempClientId }) => { // Receive prop
          const [isPending, startTransition] = useTransition();
          const [submissionError, setSubmissionError] = useState<string | null>(null);
          const router = useRouter();

          const form = useForm<z.infer<typeof corporationInsertSchema>>({
            resolver: zodResolver(corporationInsertSchema),
            // Add default values if needed
          });

          async function onSubmit(data: z.infer<typeof corporationInsertSchema>) {
            setSubmissionError(null);
            startTransition(async () => {
              try {
                if (!tempClientId) { // Check for tempClientId
                  setSubmissionError('No temporary client ID available.');
                  return;
                }

                const corporationData = {
                  ...data,
                  clientId: tempClientId, // Use the tempClientId
                };

                const response = await createCorporation(corporationData);
                if (response?.status === 'error') {
                  setSubmissionError(response.message);
                } else {
                  closeDialog();
                  router.refresh();
                }
              } catch (error) {
                setSubmissionError('An unexpected error occurred.');
                console.error(error);
              }
            });
          }

          return (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Sociedad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingrese el nombre" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Add other corporation fields here (RFC, constitutionDate, etc.) */}
                {submissionError && <div className="text-red-500">{submissionError}</div>}
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creando...' : 'Crear Sociedad'}
                </Button>
              </form>
            </Form>
          );
        };

        export default CorporationForm;