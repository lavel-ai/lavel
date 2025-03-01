# Introduction
This guide outlines the architectural patterns and best practices for creating new forms and components in the Lavel AI platform. Following these guidelines ensures consistency, maintainability, and adherence to our established architecture.

## Core Architectural Principles
- Layered Architecture: Follow the platform's layered approach with clear separation of concerns
- Server-Centric Data Fetching: Fetch initial data on the server using Server Components and Server Actions
- Client-Side Interactivity: Use React Query for client-side data management
- Tenant Isolation: Ensure all data operations respect tenant boundaries
- Type Safety: Maintain TypeScript types throughout the entire data flow
- Multi-level Caching: Implement appropriate caching strategies

## Form Creation Checklist
When creating a new form, follow these steps in order:

### 1. Database Layer Setup
- [ ] Define database schema types in @repo/database/schema/[entity].ts
- [ ] Create database query functions in @repo/database/queries/[entity]-queries.ts
- [ ] Implement normalization pipeline in @repo/schema/pipeline/[entity]-pipeline.ts

### 2. Server-Side Implementation
- [ ] Create Server Actions in features/[feature]/actions/[action-name].ts
- [ ] Implement proper authentication and tenant isolation
- [ ] Handle data validation and sanitization
- [ ] Return structured responses with proper error handling

### 3. Client-Side Implementation
- [ ] Create custom hooks in features/[feature]/hooks/use-[entity].ts
- [ ] Implement React Query integration with proper caching strategy
- [ ] Create form component with optimistic updates
- [ ] Implement proper loading and error states
- [ ] Add analytics tracking for important user interactions

### 4. Integration with Server Components
- [ ] Create Server Component for initial page rendering
- [ ] Fetch initial data using Server Actions
- [ ] Pass data as props to Client Components
- [ ] Implement Suspense for loading states

## Component Patterns

### Server Component Pattern
```tsx
// app/(authenticated)/[tenant]/[feature]/page.tsx
import { Suspense } from 'react';
import { getEntityData } from '../features/[feature]/actions/get-entity-data';
import { EntityComponent } from '../features/[feature]/components/entity-component';
import { EntitySkeleton } from '../features/[feature]/components/skeletons';

export default async function EntityPage({ params }) {
  // Fetch initial data using Server Action
  const response = await getEntityData({});
  
  const initialData = response.status === 'success' 
    ? response.data 
    : [];
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Entity Title</h1>
        <NewEntityButton tenant={params.tenant} />
      </div>
      
      <Suspense fallback={<EntitySkeleton />}>
        {/* Pass initial data to Client Component */}
        <EntityComponent initialData={initialData} tenant={params.tenant} />
      </Suspense>
    </div>
  );
}
```

### Server Action Pattern
```tsx
// features/[feature]/actions/[action-name].ts
'use server'

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { entityQuery } from '@repo/database/queries/entity-queries';
import { normalizeEntity } from '@repo/database/utils/normalize/entity';
import { captureError } from '@repo/observability/error';

export async function getEntityData(filters = {}) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    if (!userId) {
      return { status: 'error', message: 'Unauthorized' };
    }
    
    // 2. Get tenant database connection
    const db = await getTenantDbClientUtil();
    
    // 3. Execute query with tenant isolation
    const data = await entityQuery.getEntities(db, userId, filters);
    
    // 4. Normalize data
    const normalizedData = data.map(item => normalizeEntity(item));
    
    return { status: 'success', data: normalizedData };
  } catch (error) {
    // Capture error for monitoring
    captureError(error, {
      context: 'getEntityData',
      filters
    });
    
    return { 
      status: 'error', 
      message: 'Failed to load data'
    };
  }
}
```

### Custom Hook Pattern
```tsx
// features/[feature]/hooks/use-entity.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEntity, getEntityData, updateEntity } from '../actions/entity-actions';
import { useToast } from '@repo/design-system/components/ui/toast';

export function useEntity(filters = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching data
  const query = useQuery({
    queryKey: ['entity', filters],
    queryFn: async () => {
      const response = await getEntityData(filters);
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      return response.data;
    }
  });
  
  // Mutation for creating entity
  const createMutation = useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Entity created successfully",
      });
      queryClient.invalidateQueries(['entity']);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create entity",
      });
    }
  });
  
  // Mutation for updating entity
  const updateMutation = useMutation({
    mutationFn: updateEntity,
    // Implement optimistic updates
    onMutate: async (data) => {
      // ... optimistic update logic
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Entity updated successfully",
      });
      queryClient.invalidateQueries(['entity']);
    },
    onError: (error, variables, context) => {
      // ... roll back on error
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update entity",
      });
    }
  });
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createEntity: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateEntity: updateMutation.mutate,
    isUpdating: updateMutation.isLoading
  };
}
```

### Form Component Pattern
```tsx
'use client'
// features/[feature]/components/new-entity-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/components/ui/toast';
import { useEntity } from '../hooks/use-entity';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  // ... other fields
});

export function NewEntityForm() {
  const { createEntity, isCreating } = useEntity();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    // ... other fields
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      // Transform ZOD errors to form errors
      const fieldErrors = {};
      result.error.errors.forEach(error => {
        fieldErrors[error.path[0]] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Create form data for submission
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });
    
    // Submit the form
    await createEntity(formDataObj);
    
    // Navigate on success
    router.push(`/entities`);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isCreating}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>
      
      {/* Add other form fields */}
      
      <Button 
        type="submit" 
        disabled={isCreating}
        className="w-full"
      >
        {isCreating ? "Creating..." : "Create Entity"}
      </Button>
    </form>
  );
}
```

## Best Practices for Forms
- Validate Early and Often: Client-side validation with zod and server-side validation in Server Actions
- Optimize for User Experience: Implement optimistic updates and proper loading states
- Provide Feedback: Use toast notifications for operation feedback
- Maintain Type Safety: Use TypeScript throughout for type safety
- Handle Errors Gracefully: Implement comprehensive error handling
- Use Proper Form Components: Leverage design system components for consistent UI
- Implement Analytics: Track important user interactions with analytics

## Form Requirements for Shadcn/UI Components
For forms that use the LawyerCombobox or similar complex components:

- Modal Property: Add modal={true} to the Popover component
- Positioning Properties: Add align="start" and sideOffset={5} to PopoverContent
- Z-Index Management: Add z-index: 100 for proper stacking
- Overflow Handling: Add overflow-hidden to Command component
- Wrapper Divs: Wrap with position: relative and z-index: 50 for proper layering

## Spanish-First Approach
- Default to Spanish UI Text: Use Spanish as the primary language for user-facing text
- Support Bilingual Fields: Allow both Spanish and English where appropriate
- Maintain Consistent Terminology: Use established Spanish legal terminology