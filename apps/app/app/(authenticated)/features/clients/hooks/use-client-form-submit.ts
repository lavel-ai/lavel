'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { createClientAction, updateClientAction } from '../actions/create-client-actions';
import { CompletedClientFormData } from '../validation/schema-factory';

interface UseClientFormSubmitOptions {
  clientId?: string;
  onSuccess?: () => void;
}

export function useClientFormSubmit({
  clientId,
  onSuccess,
}: UseClientFormSubmitOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const submitForm = async (formData: CompletedClientFormData) => {
    console.log('Starting form submission with data:', formData);
    setIsSubmitting(true);
    try {
      if (clientId) {
        // Update existing client
        console.log('Updating existing client with ID:', clientId);
        const result = await updateClientAction(clientId, formData);
        console.log('Update client result:', result);
        if (result.status === 'error') {
          throw new Error(result.message || 'Failed to update client');
        }
        
        toast({
          title: 'Client updated',
          description: `${formData.legalName || 'Client'} has been updated successfully.`,
        });
      } else {
        // Create new client
        console.log('Creating new client');
        const result = await createClientAction(formData);
        console.log('Create client result:', result);
        if (result.status === 'error') {
          // If we have field errors, we can display them in a more user-friendly way
          if (result.errors) {
            const errorMessages = Object.entries(result.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('\n');
            throw new Error(`Validation errors:\n${errorMessages}`);
          }
          throw new Error(result.message || 'Failed to create client');
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

  return {
    submitForm,
    isSubmitting,
  };
}