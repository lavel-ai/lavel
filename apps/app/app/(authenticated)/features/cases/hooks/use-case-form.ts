import { useForm as useReactForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { type CaseFormData, caseFormSchema, type TabsState, type ValidationResult } from '../schemas';
import { validation } from '../validation';
import { createCase, uploadDocument } from '../actions';

export function useCaseForm() {
  // Form state
  const [businessErrors, setBusinessErrors] = useState<ValidationResult[]>([]);
  const [activeTab, setActiveTab] = useState('caseType');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab completion state
  const [tabsState, setTabsState] = useState<TabsState>({
    caseType: { isComplete: false, hasError: false, label: 'Case Type' },
    basicInfo: { isComplete: false, hasError: false, label: 'Basic Info' },
    authority: { isComplete: false, hasError: false, label: 'Authority' },
    location: { isComplete: false, hasError: false, label: 'Location' },
    team: { isComplete: false, hasError: false, label: 'Team' },
    documents: { isComplete: false, hasError: false, label: 'Documents' },
    events: { isComplete: false, hasError: false, label: 'Events' },
  });

  // Initialize form
  const form = useReactForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    mode: 'onChange',
  });

  // Watch case type to show/hide litigation tab
  const caseType = form.watch('type');

  // Compute available tabs based on case type
  const tabs = useMemo(() => {
    const baseTabs = { ...tabsState };
    
    if (caseType === 'litigation') {
      return {
        ...baseTabs,
        litigation: { isComplete: false, hasError: false, label: 'Litigation Details' },
      };
    }

    return baseTabs;
  }, [caseType, tabsState]);

  // Handle validation errors
  const handleValidationErrors = useCallback((results: ValidationResult[]) => {
    setBusinessErrors(results);
    
    // Update tab error states
    setTabsState(current => {
      const newState = { ...current };
      // Reset all error states
      Object.keys(newState).forEach(key => {
        if (newState[key as keyof TabsState]) {
          newState[key as keyof TabsState].hasError = false;
        }
      });
      
      // Set new error states
      results.forEach(result => {
        if (result.field) {
          // Map field to tab and set error
          const tab = mapFieldToTab(result.field);
          if (tab && newState[tab]) {
            newState[tab].hasError = true;
          }
        }
      });
      
      return newState;
    });
  }, []);

  // Handle form submission
  const onSubmit = async (data: CaseFormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate business rules
      const validationResults = validation.validateForm(data);
      if (validationResults.length > 0) {
        handleValidationErrors(validationResults);
        return false;
      }

      // Create case
      const newCase = await createCase(data);

      // Upload documents if any
      if (data.documents?.length) {
        await Promise.all(
          data.documents.map(doc => 
            doc.file && uploadDocument({
              file: doc.file,
              caseId: newCase.id,
              metadata: {
                title: doc.title,
                documentType: doc.documentType,
                isCourtDocument: doc.isCourtDocument,
                typeOfCourtDocument: doc.typeOfCourtDocument,
              },
            })
          )
        );
      }

      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to map fields to tabs
  const mapFieldToTab = (field: string): keyof TabsState | null => {
    const fieldToTabMap: Record<string, keyof TabsState> = {
      type: 'caseType',
      title: 'basicInfo',
      riskLevel: 'basicInfo',
      // Add more field mappings
    };
    
    return fieldToTabMap[field] || null;
  };

  return {
    form,
    tabs,
    activeTab,
    setActiveTab,
    isSubmitting,
    businessErrors,
    onSubmit: form.handleSubmit(onSubmit),
    isLitigation: caseType === 'litigation',
  };
}
