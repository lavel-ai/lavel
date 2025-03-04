// apps/app/(authenticated)/features/practice-area/actions/simplified-actions.ts
'use server';

import { createFormAction } from '@/app/actions/form/create-form-action';
import { withFormAuth } from '@/app/utils/with-auth-form';

// Create practice area server action
export const createPracticeArea = withFormAuth(
  createFormAction({
    entityType: 'practiceArea',
    dbOperation: async (db, data, user) => {
      // Insert into database
      return db.insert(db.practiceAreas).values({
        ...(data as any),
        createdBy: user.id
      });
    },
    analyticsEventType: 'created',
    // Redirect to practice area page after creation
    successRedirect: (result) => `/my-firm`,
    // Revalidate the practice area list page
    revalidatePaths: ['/my-firm'],
  })
);

// Update practice area server action
export const updatePracticeArea = withFormAuth(
  createFormAction({
    entityType: 'practiceArea',
    dbOperation: async (db, data, user) => {
      const id = (data as any).id;
      
      // Remove id from data to be updated
      const { id: _, ...updateData } = data as any;
      
      // Update in database
      return db.update(db.practiceAreas)
        .set({
          ...updateData,
          updatedBy: user.id,
          updatedAt: new Date()
        })
        .where(db.eq(db.practiceAreas.id, id));
    },
    analyticsEventType: 'updated',
    // Redirect to practice area page after update
    successRedirect: `/my-firm`,
    // Revalidate the practice area list and detail pages
    revalidatePaths: ['/my-firm'],
  })
);