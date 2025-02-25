'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, defaultFormValues, ClientFormData } from '../validation/schemas';

export type TabValidation = {
  isComplete: boolean;
  hasErrors: boolean;
};

export type TabStatus = Record<string, TabValidation>;

export function useClientForm() {
  // Define the tabs for the form
  const tabs = ['general', 'lawFirm', 'contact', 'billing'];
  const [currentTab, setCurrentTab] = useState('general');

  // Initialize the form with default values and zod validation
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultFormValues as any,
    mode: 'onChange',
  });

  const { formState } = form;

  // Function to check if a tab is complete and if it has errors
  const getTabStatus = useCallback(
    (tab: string): TabValidation => {
      const { errors, touchedFields, dirtyFields } = formState;
      
      // Define which fields belong to each tab
      const tabFields: Record<string, string[]> = {
        general: ['clientType', 'legalName', 'taxId', 'category', 'status', 'isConfidential', 'preferredLanguage', 'notes'],
        lawFirm: ['corporations'],
        contact: ['addresses', 'contactInfo', 'portalAccess', 'portalAccessEmail'],
        billing: ['billing'],
      };

      // Check if the tab has any errors
      const hasTabErrors = Object.keys(errors).some((fieldName) => {
        // For nested fields like billing.name, check if the parent field is in the tab
        const parentField = fieldName.split('.')[0];
        return tabFields[tab].includes(parentField);
      });

      // Check if the tab is complete (all required fields are filled)
      const isTabComplete = tabFields[tab].every((field) => {
        // For arrays like addresses, check if there's at least one item
        if (field === 'addresses') {
          const addresses = form.getValues('addresses');
          return addresses && addresses.length > 0;
        }
        if (field === 'contactInfo') {
          const contactInfo = form.getValues('contactInfo');
          return contactInfo && contactInfo.length > 0;
        }
        if (field === 'corporations') {
          const clientType = form.getValues('clientType');
          const corporations = form.getValues('corporations');
          
          if (clientType === 'moral') {
            return corporations && corporations.length > 0;
          }
          return true; // Not required for fisica
        }
        
        // For regular fields, check if they have a value
        const value = form.getValues(field as any);
        return value !== undefined && value !== '';
      });

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