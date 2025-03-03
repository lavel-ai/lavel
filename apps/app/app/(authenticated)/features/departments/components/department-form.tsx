'use client'

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createDepartment, updateDepartment } from '../actions/department-actions';
import { TrackedForm } from '@repo/analytics/posthog/components/tracked-form';
import { NormalizedTextInput } from '@repo/design-system/components/form/normalized-text-input';
import { NormalizedTextarea } from '@repo/design-system/components/form/normalized-text-area-input';
import { Button } from '@repo/design-system/components/ui/button';
import { Department } from '@repo/database/src/tenant-app/schema/departments-schema';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, InfoIcon } from 'lucide-react';

interface DepartmentFormProps {
  initialData?: Partial<Department>;
  isEditing?: boolean;
}

// Initial state type
interface FormState {
  success: boolean;
  error: string | null;
  fieldErrors?: Record<string, string>;
  changes: Array<{
    field: string;
    original: string;
    normalized: string;
  }>;
  data: any;
  code?: string;
}

export function DepartmentForm({ initialData = {}, isEditing = false }: DepartmentFormProps) {
  // Form state with useActionState
  const [state, formAction] = useActionState<FormState, any>(
    isEditing ? updateDepartment : createDepartment, 
    { 
      success: false, 
      error: null, 
      fieldErrors: {}, 
      changes: [], 
      data: null 
    }
  );

  // Track form abandonment
  const [formTouched, setFormTouched] = useState(false);
  
  // Form field states
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  
  // Document title
  const title = isEditing ? `Edit ${initialData.name || 'Department'}` : 'Create New Department';
  
  // Handle form abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formTouched && !state.success) {
        // Form analytics tracking for abandonment happens in TrackedForm
        // This is just to confirm with the user
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formTouched, state.success]);

  // Handle input changes
  const handleInputChange = () => {
    if (!formTouched) {
      setFormTouched(true);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    // Ensure the latest state is included in the form data
    formData.set('name', name);
    formData.set('description', description);
    
    // Let the action handle the rest
    return formAction(formData);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Document metadata */}
      <title>{title} | Lavel AI</title>
      <meta name="description" content={`${isEditing ? 'Edit' : 'Create'} a department in Lavel AI`} />
      
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      
      {/* Use TrackedForm for analytics */}
      <TrackedForm 
        formType={isEditing ? 'department_update' : 'department_creation'}
        entityType="department"
        entityId={isEditing ? initialData.id : undefined}
        properties={{
          form_version: '1.0'
        }}
        action={handleSubmit}
      >
        {isEditing && <input type="hidden" name="id" value={initialData.id} />}
        
        <div className="space-y-6">
          {/* Name field */}
          <div>
            <NormalizedTextInput
              label="Name"
              value={name}
              onChange={(value: string) => {
                setName(value);
                handleInputChange();
              }}
              required
              placeholder="Engineering, Marketing, Sales, etc."
              error={state.fieldErrors?.name}
            />
            <p className="text-sm text-gray-500 mt-1">
              Department name will be used across the platform.
            </p>
          </div>
          
          {/* Description field */}
          <div>
            <NormalizedTextarea
              label="Description"
              value={description}
              onChange={(value: string) => {
                setDescription(value);
                handleInputChange();
              }}
              placeholder="Brief description of this department's purpose and responsibilities..."
              error={state.fieldErrors?.description}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional. Provide additional context about this department.
            </p>
          </div>
          
          {/* Submit button with form status */}
          <div className="pt-4 flex justify-end">
            <SubmitButton isEditing={isEditing} />
          </div>
        </div>
        
        {/* Error message */}
        {state.error && (
          <div className="p-4 mt-6 bg-red-50 border border-red-200 text-red-700 rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Error</h4>
              <p>{state.error}</p>
              {state.code && (
                <p className="text-sm text-red-500 mt-1">
                  Error code: {state.code}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Success message */}
        {state.success && (
          <div className="p-4 mt-6 bg-green-50 border border-green-200 text-green-700 rounded flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Success</h4>
              <p>Department {isEditing ? 'updated' : 'created'} successfully!</p>
            </div>
          </div>
        )}
        
        {/* Normalization feedback */}
        {state.success && state.changes && state.changes.length > 0 && (
          <div className="p-4 mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Data Normalization</h4>
              <p>The following fields were automatically formatted:</p>
              <ul className="mt-2 list-disc pl-5">
                {state.changes.map((change, index) => (
                  <li key={index}>
                    <strong>{change.field}:</strong> {change.original} → {change.normalized}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </TrackedForm>
    </div>
  );
}

// Form button with useFormStatus
function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
    >
      {pending ? 'Saving...' : isEditing ? 'Update Department' : 'Create Department'}
    </Button>
  );
}
