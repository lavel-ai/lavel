'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Plus } from 'lucide-react';
import { PracticeAreaDialog } from './practice-area-dialog';
import { useAnalytics } from '@repo/analytics/posthog/client';
import { PracticeAreaOption } from '../actions/practice-area-actions';

export function NewPracticeAreaButton() {
  const [open, setOpen] = useState(false);
  const analytics = useAnalytics();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (isOpen) {
      analytics?.capture('entity_action_initiated', {
        action_type: 'create',
        entity_type: 'practice_area',
      });
    } else {
      analytics?.capture('entity_action_cancelled', {
        action_type: 'create',
        entity_type: 'practice_area',
      });
    }
  };

  const handleSuccess = (practiceArea: PracticeAreaOption) => {
    setOpen(false);
    
    analytics?.capture('entity_action_completed', {
      action_type: 'create',
      entity_type: 'practice_area',
      entity_id: practiceArea.id,
      entity_name: practiceArea.name,
    });
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Área de Práctica
      </Button>

      <PracticeAreaDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Nueva Área de Práctica"
        description="Cree una nueva área de práctica para su bufete."
        onSuccess={handleSuccess}
      />
    </>
  );
}