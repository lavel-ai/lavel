// packages/analytics/components/tracked-form.tsx
'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../client';

interface TrackedFormProps {
  formType: string;
  entityType?: string;
  entityId?: string;
  children: ReactNode;
  action?: any;
  onSubmit?: (e: FormEvent) => void;
  properties?: Record<string, any>;
}

export function TrackedForm({ 
  formType, 
  entityType,
  entityId,
  children, 
  action, 
  onSubmit,
  properties = {}
}: TrackedFormProps) {
  const posthog = useAnalytics();
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  
  // Calculate completed fields
  const getCompletedFields = () => {
    if (!formRef.current) return 0;
    
    const formData = new FormData(formRef.current);
    let count = 0;
    formData.forEach((value) => {
      if (value && String(value).trim() !== '') count++;
    });
    
    return count;
  };
  
  // Get device type
  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };
  
  // Track form view
  useEffect(() => {
    posthog.capture('form_viewed', { 
      form_type: formType,
      entity_type: entityType,
      entity_id: entityId,
      device_type: getDeviceType(),
      ...properties
    });
    
    // Track abandonment on cleanup
    return () => {
      if (!submitted) {
        const fieldsCompleted = getCompletedFields();
        posthog.capture('form_abandoned', { 
          form_type: formType,
          entity_type: entityType,
          entity_id: entityId,
          time_spent: Date.now() - startTimeRef.current,
          fields_completed: fieldsCompleted,
          device_type: getDeviceType(),
          ...properties
        });
      }
    };
  }, [formType, entityType, entityId, posthog, properties, submitted]);
  
  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    if (!submitted) {
      setSubmitted(true);
      
      // Count completed fields
      const fieldsCompleted = getCompletedFields();
      
      posthog.capture('form_submitted', { 
        form_type: formType,
        entity_type: entityType,
        entity_id: entityId,
        time_spent: Date.now() - startTimeRef.current,
        fields_completed: fieldsCompleted,
        device_type: getDeviceType(),
        ...properties
      });
    }
    
    if (onSubmit) {
      onSubmit(e);
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit} action={action}>
      {children}
    </form>
  );
}