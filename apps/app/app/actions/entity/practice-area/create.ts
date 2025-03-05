// apps/app/app/actions/entity/practice-area/create.ts
'use server';

import { createFormAction } from '../../form/create';
import { withAuth } from '../../../utils/with-auth';
import { createPracticeArea } from '@repo/database/src/tenant-app/operations/practice-area';

/**
 * Server action for creating a new practice area
 * 
 * This action:
 * 1. Validates the input using the practiceArea schema
 * 2. Normalizes the data (trims strings, applies title case to name)
 * 3. Persists the data to the database
 * 4. Tracks analytics events
 * 5. Handles errors and validation failures
 */
export const createPracticeAreaAction = withAuth ( await(   
  createFormAction({
    entityType: 'practiceArea',
    dbOperation: createPracticeArea,
    revalidatePaths: ['/admin/practice-areas'],
    successRedirect: '/admin/practice-areas',
  }))
);