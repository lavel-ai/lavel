"use server"

import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { documents } from '@repo/database/src/tenant-app/schema';
import { getInternalUserId } from '@/app/actions/users/user-actions';
import { GCSStorageService, type DocumentMetadata } from '@repo/storage/src/gcs-storage';
import { getTenantId } from '@/app/utils/get-tenant-id';
import { eq } from 'drizzle-orm';

interface UploadDocumentParams {
  file: File;
  caseId: string;
  metadata: DocumentMetadata;
}

export async function uploadDocument({ file, caseId, metadata }: UploadDocumentParams) {
  try {
    const db = await getTenantDbClientUtil();
    const userId = await getInternalUserId();
    const tenantId = await getTenantId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!tenantId) {
      throw new Error('Tenant context not found');
    }

    // Create document record in database first
    const [document] = await db.insert(documents).values({
      title: metadata.title,
      documentType: metadata.documentType,
      isCourtDocument: metadata.isCourtDocument,
      typeOfCourtDocument: metadata.typeOfCourtDocument,
      description: metadata.description,
      caseId,
      contentType: metadata.contentType,
      size: metadata.size,
      uploadStatus: 'pending',
      // Audit fields
      createdBy: userId,
      updatedBy: userId,
    }).returning();

    try {
      // Initialize storage service with tenant context
      const storage = new GCSStorageService(tenantId);

      // Get signed URL for upload
      const uploadUrl = await storage.getUploadUrl({
        tenantId,
        caseId,
        documentId: document.id,
        fileName: metadata.originalName,
        contentType: metadata.contentType,
        operation: 'write',
        expiresIn: 15 * 60 // 15 minutes
      });

      // Upload the file
      await storage.uploadDocument({
        tenantId,
        caseId,
        documentId: document.id,
        file,
        metadata: {
          ...metadata,
          title: document.title,
        },
      });

      // Update document status
      await db.update(documents)
        .set({
          uploadStatus: 'completed',
          updatedBy: userId,
        })
        .where(eq(documents.id, document.id));

      return {
        document,
        uploadUrl,
      };
    } catch (error) {
      // If storage upload fails, mark document as failed
      await db.update(documents)
        .set({
          uploadStatus: 'failed',
          updatedBy: userId,
        })
        .where(eq(documents.id, document.id));

      throw error;
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
}

export async function getDocumentDownloadUrl(documentId: string) {
  try {
    const db = await getTenantDbClientUtil();
    const tenantId = await getTenantId();
    const userId = await getInternalUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!tenantId) {
      throw new Error('Tenant context not found');
    }

    // Get document from database
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Initialize storage service
    const storage = new GCSStorageService(tenantId);

    // Get signed URL for download
    const downloadUrl = await storage.getDownloadUrl({
      tenantId,
      caseId: document.caseId,
      documentId: document.id,
      fileName: document.title,
      contentType: document.contentType,
      operation: 'read',
      expiresIn: 15 * 60 // 15 minutes
    });

    return {
      document,
      downloadUrl,
    };
  } catch (error) {
    console.error('Error getting document download URL:', error);
    throw new Error('Failed to get document download URL');
  }
}
