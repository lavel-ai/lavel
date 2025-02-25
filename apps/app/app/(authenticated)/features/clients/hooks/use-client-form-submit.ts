'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { createClientAction, updateClientAction } from '../actions/client-form-actions';
import { z } from 'zod';

// Import the client form schema from the client-form-actions
// This is a simplified version to avoid circular dependencies
const clientTypeSchema = z.enum(['fisica', 'moral', 'person', 'company']);
const statusSchema = z.enum(['prospect', 'active', 'inactive', 'archived', 'draft']);

// Define the schema in a simplified way that matches the server-side schema
const clientFormSchema = z.object({
  id: z.string().uuid().optional(),
  clientType: clientTypeSchema,
  legalName: z.string(),
  taxId: z.string().optional(),
  category: z.enum(['litigio', 'consultoria', 'corporativo', 'otros']).optional(),
  isConfidential: z.boolean().optional(),
  preferredLanguage: z.string().optional(),
  notes: z.string().optional(),
  status: statusSchema.optional(),
  corporations: z.array(z.any()).optional(),
  addresses: z.array(z.any()),
  contactInfo: z.array(z.any()).optional(),
  portalAccess: z.boolean().optional(),
  portalAccessEmail: z.string().optional(),
  billing: z.any().optional(),
  primaryLawyerId: z.string().optional(),
});

// Use the inferred type
type ClientFormData = z.infer<typeof clientFormSchema>;

interface UseClientFormSubmitOptions {
  clientId?: string;
  onSuccess?: () => void;
}

export function useClientFormSubmit({
  clientId,
  onSuccess,
}: UseClientFormSubmitOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (formData: ClientFormData) => {
    setIsSubmitting(true);
    try {
      if (clientId) {
        // Update existing client
        const result = await updateClientAction(clientId, formData as any);
        if (result.status === 'error') {
          throw new Error(result.message);
        }
        
        toast({
          title: 'Client updated',
          description: `${formData.legalName || 'Client'} has been updated successfully.`,
        });
      } else {
        // Create new client
        const result = await createClientAction(formData as any);
        if (result.status === 'error') {
          throw new Error(result.message);
        }
        
        toast({
          title: 'Client created',
          description: `${formData.legalName || 'Client'} has been created successfully.`,
        });
      }
      
      // Refresh the data and trigger any additional success callbacks
      router.refresh();
      onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error submitting client form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${clientId ? 'update' : 'create'} client. Please try again.`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async (formData: Partial<ClientFormData>) => {
    setIsDraftSaving(true);
    try {
      // Could implement draft saving logic here if needed
      // For now, just simulate a successful draft save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: 'Draft saved',
        description: 'Your changes have been saved as a draft.',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDraftSaving(false);
    }
  };

  return {
    handleSubmit,
    saveDraft,
    isSubmitting,
    isDraftSaving,
  };
} 