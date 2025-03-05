'use client';

import { practiceAreaSchema } from '@repo/schema/src/entities/practice-area';
import { z } from 'zod';
import { createPracticeAreaAction } from '../../../app/actions/entity/practice-area/create';
import { EntityForm } from './entity-form';
import { TextField, TextareaField, SwitchField } from './fields';

// Create a client-side validation schema
const formSchema = practiceAreaSchema;
type FormValues = z.infer<typeof formSchema>;

export function PracticeAreaForm() {
  return (
    <EntityForm<FormValues>
      schema={formSchema}
      defaultValues={{
        name: '',
        description: '',
        active: true,
      }}
      action={createPracticeAreaAction}
      successMessage={(data) => `Successfully created practice area: ${data.name}`}
      errorMessage="Error creating practice area"
      submitLabel="Create Practice Area"
      entityType="practiceArea"
    >
      <TextField
        name="name"
        label="Name"
        placeholder="Enter practice area name"
        description="The name of the practice area."
        required
      />
      
      <TextareaField
        name="description"
        label="Description"
        placeholder="Enter a description of this practice area"
        description="Optional description of the practice area."
      />
      
      <SwitchField
        name="active"
        label="Active"
        description="Whether this practice area is currently active."
      />
    </EntityForm>
  );
}
