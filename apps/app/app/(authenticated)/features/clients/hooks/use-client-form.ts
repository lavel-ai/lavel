'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, type ClientFormData } from '../validation/schemas';

export function useClientForm() {
  const [currentTab, setCurrentTab] = useState('general');

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientType: 'fisica',
      legalName: '',
      addresses: [],
      primaryLawyerId: '',
      contactInfo: [],
      billing: { billingCurrency: 'MXN', billingTerms: 'Net 30' },
    },
    mode: 'onChange',
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control: form.control,
    name: 'addresses',
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: 'contactInfo',
  });

  const tabs = ['general', 'lawFirm', 'contact', 'billing'];

  const getTabStatus = (tab: string) => {
    const errors = form.formState.errors;
    const values = form.getValues();
    switch (tab) {
      case 'general':
        return {
          isComplete: !!values.clientType && !!values.legalName && values.addresses.length > 0,
          hasErrors: !!errors.clientType || !!errors.legalName || !!errors.addresses,
        };
      case 'lawFirm':
        return {
          isComplete: !!values.category && !!values.status,
          hasErrors: !!errors.category || !!errors.primaryLawyerId || !!errors.status,
        };
      case 'contact':
        return {
          isComplete: values.contactInfo.length > 0,
          hasErrors: !!errors.contactInfo,
        };
      case 'billing':
        return {
          isComplete: !!values.billing?.name,
          hasErrors: !!errors.billing,
        };
      default:
        return { isComplete: false, hasErrors: false };
    }
  };

  return {
    form,
    currentTab,
    setCurrentTab,
    tabs,
    getTabStatus,
    addressFields,
    appendAddress,
    removeAddress,
    contactFields,
    appendContact,
    removeContact,
  };
}