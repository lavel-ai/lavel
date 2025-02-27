'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  clientFormSchema, 
  defaultFormValues, 
  CompletedClientFormData 
} from '../validation/schema-factory';

export type TabValidation = {
  isComplete: boolean;
  hasErrors: boolean;
};

export type TabStatus = Record<string, TabValidation>;

export function useClientForm(initialValues?: Partial<CompletedClientFormData>) {
  // Define the tabs for the form
  const tabs = ['general', 'lawFirm', 'contact', 'billing'];
  const [currentTab, setCurrentTab] = useState('general');

  // Initialize the form with default values and zod validation
  const form = useForm<CompletedClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialValues ? { ...defaultFormValues, ...initialValues } as CompletedClientFormData : defaultFormValues,
    mode: 'onBlur', // Changed from onSubmit to onBlur for more immediate feedback
    reValidateMode: 'onChange',
    criteriaMode: 'all', // Show all errors instead of just the first one
    shouldFocusError: true,
    shouldUnregister: false, // Keep fields registered even when they're removed from the DOM
  });

  const { formState } = form;

  // Log form state changes for debugging
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(`Form field changed: ${name} (${type})`, value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Log validation errors whenever they change
  useEffect(() => {
    console.log('Form validation errors:', form.formState.errors);
  }, [form.formState.errors]);

  // Function to check if a tab is complete and if it has errors
  const getTabStatus = useCallback(
    (tab: string): TabValidation => {
      const { errors } = formState;
      
      // Define which fields belong to each tab
      const tabFields: Record<string, Array<keyof CompletedClientFormData | string>> = {
        general: ['clientType', 'legalName', 'category', 'status', 'isConfidential', 'preferredLanguage', 'notes'],
        lawFirm: ['leadLawyerId'], 
        contact: ['contactInfo'],
        billing: ['billing', 'taxId'],
      };

      // Check if the tab has any errors
      const hasTabErrors = Object.keys(errors).some((fieldName) => {
        // For nested fields like billing.name, check if the parent field is in the tab
        const parentField = fieldName.split('.')[0];
        return tabFields[tab].includes(parentField);
      });

      // Check if the tab is complete (all required fields are filled)
      let isTabComplete = false;
      
      // Only consider a tab complete if it has been visited/edited
      let hasBeenVisited = false;
      try {
        // Try to access the first field of the tab to check if it's been visited
        const firstField = tabFields[tab][0];
        if (firstField in form.getValues()) {
          hasBeenVisited = true;
        }
      } catch (e) {
        console.log(`Error checking if tab ${tab} has been visited:`, e);
        // If we can't access the field, assume it hasn't been visited
        hasBeenVisited = false;
      }
      
      if (hasBeenVisited) {
        // For the general tab, only require legalName
        if (tab === 'general') {
          try {
            const legalName = form.getValues('legalName');
            isTabComplete = !!legalName;
          } catch (e) {
            console.log('Error checking if general tab is complete:', e);
            isTabComplete = false;
          }
        } 
        // For other tabs, no fields are strictly required
        else {
          isTabComplete = true;
        }
      }

      return {
        isComplete: isTabComplete,
        hasErrors: hasTabErrors,
      };
    },
    [formState, form]
  );

  // Handle form submission
  const handleSubmit = form.handleSubmit;

  return {
    form,
    currentTab,
    setCurrentTab,
    tabs,
    getTabStatus,
    handleSubmit,
  };
}