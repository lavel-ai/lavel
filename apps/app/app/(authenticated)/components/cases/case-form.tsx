'use client';

import { useState, useTransition } from 'react';
import {
  Input,
} from '@repo/design-system/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Button } from '@repo/design-system/components/ui/button';
import {
  InsertCaseSchema,
} from '@repo/database/src/tenant-app/schema/case-schema';
import {
  litigationDetailsInsertSchema
} from '@repo/database/src/tenant-app/schema/litigation-details-schema';

import { createCase } from '@/app/actions/cases/cases-actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { getInternalUserId } from '@/app/actions/users/user-actions';
import { cn } from '@repo/design-system/lib/utils';

// Combine the schemas for validation within the form
const CombinedSchema = InsertCaseSchema.extend({
    litigationDetails: litigationDetailsInsertSchema.optional(),
});

type CombinedSchemaType = z.infer<typeof CombinedSchema>;

const CaseForm = () => {
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
    const router = useRouter();

  const form = useForm<CombinedSchemaType>({
    resolver: zodResolver(CombinedSchema),
    defaultValues: {
      type: 'advisory', // Default to advisory
      isActive: true,
      status: 'pending',
      riskLevel: 'low',
    },
  });

  const { handleSubmit, watch, formState } = form;
  const caseType = watch('type'); // Watch the 'type' field

  async function onSubmit(data: CombinedSchemaType) {

    setSubmissionError(null); // Clear any previous errors
    const internalUserId = await getInternalUserId(); // Get internal user ID

    if (!internalUserId) {
        setSubmissionError("User not authenticated or not found in tenant DB");
        return;
    }

    startTransition(async () => {
      try {
        // Separate case and litigation data
        const { litigationDetails, ...caseData } = data;
        const caseDataToSubmit = {
            ...caseData,
            leadAttorneyId: internalUserId,
            createdBy: internalUserId,
            updatedBy: internalUserId,
        }

        // Prepare the data for the server action
        let formData = new FormData();
        for (const key in caseDataToSubmit) {
            formData.append(key, (caseDataToSubmit as any)[key]);
        }

        // If it's a litigation case, also append litigation details
        if (data.type === 'litigation' && litigationDetails) {
          for (const key in litigationDetails) {
            formData.append(key, (litigationDetails as any)[key]);
          }
        }

        // Call the server action
        const response = await createCase(formData);

        if (response?.status === 'error') {
          setSubmissionError(response.message);
        } else {
          // Handle success (e.g., redirect, show a message, etc.)
          router.push('/'); // Redirect to the dashboard or a case list page
          router.refresh();
        }
      } catch (error) {
        setSubmissionError('An unexpected error occurred.');
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* --- Core Case Fields --- */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter case description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="litigation">Litigation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                {/* Replace with a date picker component */}
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="riskLevel"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Risk Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />

        {/* --- Conditional Litigation Fields --- */}
        {caseType === 'litigation' && (
          <>
            {/* Add all litigation-specific fields here, using the same pattern as above */}
            {/* Example: */}
            <FormField
              control={form.control}
              name="litigationDetails.filingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filing Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter filing number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="litigationDetails.filingDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Filing Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="litigationDetails.claimAmount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Claim Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="Enter claim amount" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            {/* ... other litigation fields ... */}
          </>
        )}

        {submissionError && <div className="text-red-500">{submissionError}</div>}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating Case...' : 'Create Case'}
        </Button>
      </form>
    </Form>
  );
};

export default CaseForm; 