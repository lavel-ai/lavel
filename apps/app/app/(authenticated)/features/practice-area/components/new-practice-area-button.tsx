'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Plus } from 'lucide-react';
import { PracticeAreaDialog } from './practice-area-dialog';

export function NewPracticeAreaButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Área de Práctica
      </Button>

      <PracticeAreaDialog
        open={open}
        onOpenChange={setOpen}
        title="Nueva Área de Práctica"
        description="Cree una nueva área de práctica para su bufete."
      />
    </>
  );
} 