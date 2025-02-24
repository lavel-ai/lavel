import { Storage } from "@google-cloud/storage";
import { z } from "zod";

export const documentMetadataSchema = z.object({
  title: z.string(),
  documentType: z.string(),
  isCourtDocument: z.boolean().default(false),
  typeOfCourtDocument: z.string().optional(),
  description: z.string().optional(),
  contentType: z.string(),
  size: z.number(),
  originalName: z.string(),
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;

interface StorageOptions {
  tenantId: string;
  caseId?: string;
  documentId?: string;
}

interface UploadOptions extends StorageOptions {
  file: File;
  metadata: DocumentMetadata;
}

interface SignedUrlOptions extends StorageOptions {
  fileName: string;
  contentType: string;
  operation: "read" | "write";
  expiresIn?: number; // Seconds
}

export class GCSStorageService {
  private storage: Storage;
  private bucket: string;
  private tenantId: string;

  constructor(tenantId: string, bucketName = process.env.GCS_BUCKET_NAME) {
    if (!bucketName) {
      throw new Error("GCS_BUCKET_NAME environment variable is not set");
    }

    this.tenantId = tenantId;
    this.bucket = bucketName;
    this.storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILE,
    });
  }

  private getTenantPath(options: StorageOptions) {
    const parts = ["tenants", options.tenantId];
    
    if (options.caseId) {
      parts.push("cases", options.caseId);
    }
    
    if (options.documentId) {
      parts.push("documents", options.documentId);
    }
    
    return parts.join("/");
  }

  private async generateSignedUrl(options: SignedUrlOptions): Promise<string> {
    const path = `${this.getTenantPath(options)}/${options.fileName}`;
    const file = this.storage.bucket(this.bucket).file(path);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: options.operation === "read" ? "read" : "write",
      expires: Date.now() + (options.expiresIn || 15 * 60) * 1000, // Default 15 minutes
      contentType: options.operation === "write" ? options.contentType : undefined,
    });

    return url;
  }

  async getUploadUrl(options: SignedUrlOptions): Promise<string> {
    return this.generateSignedUrl({ ...options, operation: "write" });
  }

  async getDownloadUrl(options: SignedUrlOptions): Promise<string> {
    return this.generateSignedUrl({ ...options, operation: "read" });
  }

  async uploadDocument(options: UploadOptions): Promise<void> {
    const path = this.getTenantPath(options);
    const file = this.storage.bucket(this.bucket).file(`${path}/original/${options.metadata.originalName}`);

    // Upload file
    await file.save(options.file, {
      metadata: {
        contentType: options.metadata.contentType,
        metadata: {
          ...options.metadata,
          tenantId: this.tenantId,
          caseId: options.caseId,
          documentId: options.documentId,
        },
      },
    });

    // Save metadata
    const metadataFile = this.storage.bucket(this.bucket).file(`${path}/metadata.json`);
    await metadataFile.save(JSON.stringify(options.metadata), {
      contentType: "application/json",
    });
  }

  async deleteDocument(options: StorageOptions): Promise<void> {
    const path = this.getTenantPath(options);
    await this.storage.bucket(this.bucket).deleteFiles({
      prefix: path,
    });
  }

  async listDocuments(options: StorageOptions): Promise<string[]> {
    const path = this.getTenantPath(options);
    const [files] = await this.storage.bucket(this.bucket).getFiles({
      prefix: path,
    });
    return files.map(file => file.name);
  }

  async createVersion(
    options: StorageOptions & { 
      fileName: string;
      versionId: string;
      file: File;
      metadata: DocumentMetadata;
    }
  ): Promise<void> {
    const path = this.getTenantPath(options);
    const file = this.storage.bucket(this.bucket).file(
      `${path}/versions/${options.versionId}/${options.fileName}`
    );

    await file.save(options.file, {
      metadata: {
        contentType: options.metadata.contentType,
        metadata: {
          ...options.metadata,
          tenantId: this.tenantId,
          caseId: options.caseId,
          documentId: options.documentId,
          versionId: options.versionId,
        },
      },
    });
  }

  async getVersions(options: StorageOptions): Promise<string[]> {
    const path = `${this.getTenantPath(options)}/versions`;
    const [files] = await this.storage.bucket(this.bucket).getFiles({
      prefix: path,
    });
    return files.map(file => file.name);
  }
}
