'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@repo/database';
import { profiles } from '@repo/database/src/tenant-app/schema/profiles-schema';
import { ApiResponse } from '../../law-branches/actions/practice-area-actions';
import { updateProfilePracticeAreas } from './profile-practice-areas-actions';

// Define the form schema
export const profileFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  lastName: z.string().min(1, { message: 'El apellido paterno es requerido' }),
  maternalLastName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  seniority: z.string().optional().nullable(),
  isLeadLawyer: z.boolean().default(false),
  practiceAreaIds: z.array(z.number()).default([]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Creates or updates a profile
 */
export async function upsertProfile(
  data: ProfileFormValues,
  profileId?: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return {
        status: 'error',
        message: 'No authenticated user',
      };
    }

    let id = profileId;

    // Extract practice area IDs
    const { practiceAreaIds, ...profileData } = data;
    
    // Format dates
    const formattedData = {
      ...profileData,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      seniority: data.seniority ? new Date(data.seniority) : null,
    };

    if (profileId) {
      // Update existing profile
      await db
        .update(profiles)
        .set({
          ...formattedData,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(({ id }) => id.equals(profileId));
    } else {
      // Create new profile
      const result = await db.insert(profiles).values({
        ...formattedData,
        userId,
        createdBy: userId,
        updatedBy: userId,
      }).returning({ id: profiles.id });
      
      id = result[0].id;
    }

    if (id) {
      // Update practice areas
      await updateProfilePracticeAreas(id, practiceAreaIds, userId);
    }

    revalidatePath('/profiles');
    
    return {
      status: 'success',
      data: { id: id! },
    };
  } catch (error) {
    console.error('Error upserting profile:', error);
    return {
      status: 'error',
      message: 'Error creating or updating profile',
    };
  }
} 