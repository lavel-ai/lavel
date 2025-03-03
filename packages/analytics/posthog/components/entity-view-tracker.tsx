// packages/analytics/components/entity-view-tracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAnalytics } from '../client';

interface EntityViewTrackerProps {
  entityType: string;
  entityId: string;
  properties?: Record<string, any>;
}

export function EntityViewTracker({ 
  entityType, 
  entityId, 
  properties = {} 
}: EntityViewTrackerProps) {
  const posthog = useAnalytics();
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    // Track entity view
    posthog.capture('entity_viewed', {
      entity_type: entityType,
      entity_id: entityId,
      ...properties
    });
    
    // Track view duration on cleanup
    return () => {
      const viewDuration = Date.now() - startTimeRef.current;
      
      // Only track if they spent more than 2 seconds viewing
      if (viewDuration > 2000) {
        posthog.capture('entity_view_completed', {
          entity_type: entityType,
          entity_id: entityId,
          time_spent: viewDuration,
          ...properties
        });
      }
    };
  }, [entityType, entityId, posthog, properties]);
  
  return null; // This component doesn't render anything
}