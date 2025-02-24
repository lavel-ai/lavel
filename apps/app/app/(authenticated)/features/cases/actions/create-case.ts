"use server"

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { cases, documents, events } from '@repo/database/src/tenant-app/schema';
import type { CaseFormData } from '../schemas/case-form-schema';
import { getInternalUserId } from '@/app/actions/users/user-actions';

export async function createCase(data: CaseFormData) {
  try {
    const db = await getTenantDbClientUtil();
    const userId = await getInternalUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return await db.transaction(async (tx) => {
      // 1. Create the case
      const [newCase] = await tx.insert(cases).values({
        title: data.title,
        description: data.description,
        type: data.type,
        riskLevel: data.riskLevel,
        status: data.status,
        startDate: data.startDate,
        estimatedEndDate: data.estimatedEndDate,
        caseLawBranchId: data.caseLawBranchId,
        stateId: data.stateId,
        cityId: data.cityId,
        courthouseId: data.courthouseId,
        leadAttorneyId: data.leadAttorneyId,
        assignedTeamId: data.assignedTeamId,
        lastActivityById: userId,
        lastActivityType: 'created',
        createdBy: userId,
        updatedBy: userId,
      }).returning();

      // 2. Create documents if any
      if (data.documents?.length) {
        await tx.insert(documents).values(
          data.documents.map(doc => ({
            title: doc.title,
            documentType: doc.documentType,
            isCourtDocument: doc.isCourtDocument,
            typeOfCourtDocument: doc.typeOfCourtDocument,
            language: doc.language,
            caseId: newCase.id,
            createdBy: userId,
            updatedBy: userId,
          }))
        );
      }

      // 3. Create events if any
      if (data.events?.length) {
        await tx.insert(events).values(
          data.events.map(event => ({
            title: event.title,
            description: event.description,
            startTime: event.startTime,
            endTime: event.endTime,
            isAllDay: event.isAllDay,
            location: event.location,
            status: event.status,
            eventType: event.eventType,
            timezone: event.timezone,
            caseId: newCase.id,
            organizerId: userId,
            createdBy: userId,
            updatedBy: userId,
          }))
        );
      }

      return newCase;
    });
  } catch (error) {
    console.error('Error creating case:', error);
    throw new Error('Failed to create case');
  }
}
