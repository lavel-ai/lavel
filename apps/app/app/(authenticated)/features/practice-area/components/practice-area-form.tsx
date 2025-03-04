// apps/app/(authenticated)/features/practice-area/components/practice-area-form.tsx
'use client';

import { useFormProcessor } from '@/app/hooks/use-form-processor';
import { NormalizedInput, NormalizedTextarea } from '@repo/design-system/components/form';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { createPracticeArea } from '../actions/create-practice-area';

export function PracticeAreaFormSimplified() {
  const {
    formAction,
    isPending,
    actionState,
    isError,
    error,
    changes,
  } = useFormProcessor({
    entityType: 'practiceArea',
    serverAction: createPracticeArea,
    analytics: {
      formType: 'practice_area_creation',
    },
    onSuccess: () => {
      // You could show a success toast here
    },
  });
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Practice Area</CardTitle>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="space-y-4">
          <NormalizedInput
            name="name"
            label="Name"
            normalize="titleCase"
            placeholder="e.g. Corporate Law"
            required
            error={actionState?.fieldErrors?.name}
          />
          
          <NormalizedTextarea
            name="description"
            label="Description"
            normalize="trim"
            placeholder="Describe this practice area..."
            rows={4}
            error={actionState?.fieldErrors?.description}
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Practice Area'}
          </Button>
        </CardFooter>
      </form>
      
      {isError && (
        <div className="px-6 pb-4 text-destructive text-sm">
          {error}
        </div>
      )}
      
      {changes && changes.length > 0 && (
        <div className="px-6 pb-4 text-muted-foreground text-sm">
          <p>The following fields were normalized:</p>
          <ul className="list-disc pl-5">
            {changes.map((change: any, index: number) => (
              <li key={index}>
                <strong>{change.field}:</strong> "{change.original}" → "{change.normalized}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}