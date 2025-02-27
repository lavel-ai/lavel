'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { 
  CompletedClientFormData,
  defaultFormValues
} from '../validation/schema-factory';

type ClientDataState = {
  client: CompletedClientFormData | null;
  isLoading: boolean;
  error: string | null;
};

export function useClientData() {
  const [state, setState] = useState<ClientDataState>({
    client: null,
    isLoading: false,
    error: null
  });
  const { toast } = useToast();

  const fetchClientById = useCallback(async (clientId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // In a real implementation, we would make an API call here
      // For now, we'll simulate a response with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This is where you would call your client fetching action
      // const result = await getClientByIdAction(clientId);
      
      // For now, we're returning a mock response
      const mockClient: CompletedClientFormData = {
        ...defaultFormValues,
        id: clientId,
        legalName: "Example Client",
        clientType: "moral",
        status: "activo", // Use the correct UI enum value
        // Add other required fields here
      } as CompletedClientFormData;
      
      setState({
        client: mockClient,
        isLoading: false,
        error: null
      });
      
      return mockClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client data';
      
      setState({
        client: null,
        isLoading: false,
        error: errorMessage
      });
      
      toast({
        title: 'Error fetching client',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [toast]);

  const transformClientToFormData = useCallback((clientData: any): CompletedClientFormData => {
    // Here we transform API/DB data to form data structure
    // Start with default values and override with actual data
    const formData: Partial<CompletedClientFormData> = {
      ...defaultFormValues,
      // Basic client info
      id: clientData.id,
      legalName: clientData.legalName || '',
      clientType: (clientData.clientType as 'fisica' | 'moral') || 'fisica',
      taxId: clientData.taxId || '',
      category: (clientData.category as 'litigio' | 'consultoria' | 'corporativo' | 'otros') || 'otros',
      status: clientData.status || 'activo', // Use status directly
      isConfidential: Boolean(clientData.isConfidential),
      preferredLanguage: clientData.preferredLanguage || 'es-MX',
      notes: clientData.notes || '',
      
      // Relationships
      addresses: Array.isArray(clientData.addresses) 
        ? clientData.addresses.map((addr: any) => ({
            ...addr,
            id: addr.id || undefined
          }))
        : [],
      contactInfo: Array.isArray(clientData.contacts)
        ? clientData.contacts.map((contact: any) => ({
            ...contact,
            id: contact.id || undefined
          }))
        : [],
      
      // Access
      portalAccess: Boolean(clientData.portalAccess),
      portalAccessEmail: clientData.portalAccessEmail || '',
      
      // Billing
      billing: {
        name: clientData.billingName || clientData.legalName || '',
        rfc: clientData.taxId || '',
        billingCurrency: clientData.billingCurrency || 'MXN',
        billingTerms: clientData.billingTerms || 'Net 30',
        email: clientData.billingEmail || '',
      },
      
      // Reference
      leadLawyerId: clientData.leadLawyerId || null,
    };
    
    // Handle corporations separately (if it exists in the schema)
    if (Array.isArray(clientData.corporations)) {
      // Note: This is a type assertion since we're not sure if corporations
      // is part of the CompletedClientFormData type
      (formData as any).corporations = clientData.corporations;
    }
    
    return formData as CompletedClientFormData;
  }, []);

  return {
    ...state,
    fetchClientById,
    transformClientToFormData
  };
} 