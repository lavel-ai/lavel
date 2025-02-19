'use client';

import {
  createClient,
  createTemporaryClient,
} from '@/app/actions/clients/clients-actions';
import { getInternalUserId } from '@/app/actions/users/user-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  clientInsertSchema,
} from '@repo/database/src/tenant-app/schema/clients-schema';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import CorporationCombobox from '../comboboxes/corporation-combobox';
import BillingInfoForm from './billing-info-form';
import CompanyForm from './company-form';
import ContactInfoForm from './contact-info-form';
// Import the sub-components
import PersonForm from './person-form';

// --- Zod Schema ---
// Removed the inline schema definitions.  Use the imported ones.

const combinedClientSchema = clientInsertSchema.extend({
  clientType: z.enum(['person', 'company']),
  // contactInfo and billingInfo are already part of clientInsertSchema
  referredBy: z.string().optional(),
  corporationId: z.string().uuid().optional(),
});

type ClientFormValues = z.infer<typeof combinedClientSchema>;

// --- Main ClientForm Component ---

interface ClientFormProps {
  closeDialog: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ closeDialog }) => {
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const router = useRouter();
  const [tempClientId, setTempClientId] = useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(combinedClientSchema),
    defaultValues: {
      clientType: 'person',
      contactInfo: [], // Should still default to an empty array
      isActive: true,
      billingAddress: undefined, // Initialize billingAddress
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = form;
  const clientType = watch('clientType');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contactInfo',
  });

  // Create temporary client on component mount
  useEffect(() => {
    const createTempClient = async () => {
      const tempClientResponse = await createTemporaryClient();
      if (tempClientResponse?.status === 'success') {
        setTempClientId(tempClientResponse.data?.client.id ?? null);
      } else {
        setSubmissionError('Failed to create temporary client.');
      }
    };
    createTempClient();
  }, []);

  async function onSubmit(data: ClientFormValues) {
    setSubmissionError(null);
    const internalUserId = await getInternalUserId();

    if (!internalUserId) {
      setSubmissionError('User not authenticated or not found in tenant DB');
      return;
    }

    startTransition(async () => {
      try {
        const clientDataToSubmit = {
          ...data,
          id: tempClientId || undefined,
          isActive: true,
          createdBy: internalUserId,
          updatedBy: internalUserId,
        };

        // No need for FormData, send directly as JSON
        const response = await createClient(clientDataToSubmit);

        if (response?.status === 'error') {
          setSubmissionError(response.message);
        } else {
          router.push('/clients');
          router.refresh();
          closeDialog();
        }
      } catch (error) {
        setSubmissionError('An unexpected error occurred.');
        console.error(error);
      }
    });
  }

    // --- Helper Functions for Address and Contact Management ---

  const handleBillingAddressChange = (address: any) => {
    setValue('billingAddress', address);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Información de Contacto</TabsTrigger>
            <TabsTrigger value="billing">Información de Facturación</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="min-h-[400px] space-y-4">
            <FormField
              control={control}
              name="clientType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="person">Física</SelectItem>
                        <SelectItem value="company">Moral</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="corporationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sociedades</FormLabel>
                  <FormControl>
                    <CorporationCombobox
                      onSelect={(corporationId: string) =>
                        field.onChange(corporationId)
                      }
                      tempClientId={tempClientId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Conditional Forms (Person/Company) */}
            {clientType === 'person' && (
              <PersonForm
                control={control}
                register={form.register}
                errors={errors}
                tempClientId={tempClientId}
              />
            )}
            {clientType === 'company' && (
              <CompanyForm control={control} register={form.register} />
            )}
          </TabsContent>
          <TabsContent value="contact" className="min-h-[400px] space-y-6">
            {/* Multiple Contact Forms */}
            {fields.map((field, index) => (
              <ContactInfoForm
                key={field.id}
                control={control}
                index={index}
                remove={remove}
              />
            ))}
            <Button type="button" onClick={() => append({})}>
              Add Contact
            </Button>
          </TabsContent>
          <TabsContent value="billing" className="min-h-[400px] space-y-6">
            {/* Pass handleBillingAddressChange to BillingInfoForm */}
            <BillingInfoForm control={control} onAddressChange={handleBillingAddressChange} />
          </TabsContent>
        </Tabs>

        {submissionError && (
          <div className="text-red-500">{submissionError}</div>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creando Cliente...' : 'Crear Cliente'}
        </Button>
      </form>
    </Form>
  );
};

export default ClientForm;
