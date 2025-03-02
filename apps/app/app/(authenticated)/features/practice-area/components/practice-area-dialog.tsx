'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@repo/design-system/components/ui/dialog';
import { PracticeAreaForm } from './practice-area-form';
import { PracticeAreaOption } from '../actions/practice-area-actions';
import { Dispatch, SetStateAction } from 'react';

// Extending the PracticeAreaOption to match what's expected in PracticeAreaForm
export type PracticeAreaFormData = PracticeAreaOption & { 
  description?: string | null;
  active?: boolean;
};

export interface PracticeAreaDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  title: string;
  description?: string;
  practiceArea?: PracticeAreaOption;
  onSuccess?: (practiceArea: PracticeAreaOption) => void;
}

export function PracticeAreaDialog({
  open,
  onOpenChange,
  title,
  description,
  practiceArea,
  onSuccess
}: PracticeAreaDialogProps) {
  const handleSuccess = (data: PracticeAreaOption) => {
    if (onSuccess) {
      onSuccess(data);
    } else {
      onOpenChange(false);
    }
  };

  // Transform the practiceArea to match the expected type
  const formData: PracticeAreaFormData | undefined = practiceArea
    ? {
        ...practiceArea,
        description: practiceArea.description || null,
        active: practiceArea.active ?? true,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <PracticeAreaForm 
          practiceArea={formData}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
