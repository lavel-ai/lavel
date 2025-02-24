# Storage Architecture

## 🗄️ Overview

The case management system uses a multi-tenant storage architecture with Google Cloud Storage (GCS) as the primary storage solution for documents and files.

## 📁 Storage Structure

```
gs://lavel-case-documents/
└── tenants/
    └── {tenant-id}/
        └── cases/
            └── {case-id}/
                └── documents/
                    ├── {document-id}/
                    │   ├── versions/
                    │   │   ├── v1_filename.pdf
                    │   │   └── v2_filename.pdf
                    │   └── metadata.json
                    └── {document-id-2}/
                        └── ...
```

## 🔐 Security Model

### 1. Access Control
```typescript
interface StorageAccess {
  tenantId: string;
  caseId: string;
  documentId: string;
  permissions: string[];
}
```

### 2. Signed URLs
- Time-limited access
- Operation-specific (read/write)
- IP restrictions
- Content validation

## 📦 Document Structure

### 1. Document Metadata
```typescript
interface DocumentMetadata {
  id: string;
  title: string;
  description: string;
  documentType: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  createdBy: string;
  versions: Version[];
  tags: string[];
  isCourtDocument: boolean;
}
```

### 2. Version Information
```typescript
interface Version {
  versionId: string;
  fileName: string;
  size: number;
  createdAt: Date;
  createdBy: string;
  comment: string;
}
```

## 🔄 Upload Flow

1. **Client-side**
   ```typescript
   interface UploadRequest {
     file: File;
     metadata: DocumentMetadata;
     onProgress: (progress: number) => void;
   }
   ```

2. **Server-side**
   ```typescript
   interface UploadResponse {
     documentId: string;
     versionId: string;
     url: string;
     metadata: DocumentMetadata;
   }
   ```

## 📥 Download Flow

1. **Request**
   ```typescript
   interface DownloadRequest {
     documentId: string;
     versionId?: string;
   }
   ```

2. **Response**
   ```typescript
   interface DownloadResponse {
     url: string;
     metadata: DocumentMetadata;
     expiresAt: Date;
   }
   ```

## 🔍 Search & Indexing

### 1. Metadata Index
```typescript
interface SearchIndex {
  documentId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  lastModified: Date;
}
```

### 2. Search Query
```typescript
interface SearchQuery {
  term: string;
  filters: {
    documentType?: string[];
    dateRange?: DateRange;
    tags?: string[];
  };
  sort?: SortOptions;
}
```

## 🔄 Versioning

### 1. Version Control
- Automatic versioning
- Version metadata
- Diff tracking
- Restore capability

### 2. Version Lifecycle
```typescript
enum VersionStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived"
}
```

## 📊 Storage Monitoring

### 1. Metrics
```typescript
interface StorageMetrics {
  totalSize: number;
  documentCount: number;
  versionCount: number;
  lastBackup: Date;
  usageByTenant: Record<string, number>;
}
```

### 2. Alerts
- Storage quota
- Upload failures
- Access violations
- Backup status

## 🔒 Security Features

1. **Encryption**
   - At-rest encryption
   - In-transit encryption
   - Key management

2. **Access Control**
   - Role-based access
   - Tenant isolation
   - Audit logging

3. **Compliance**
   - Data retention
   - Legal holds
   - Audit trails

## 🔄 Backup Strategy

1. **Backup Types**
   - Full backups
   - Incremental backups
   - Metadata backups

2. **Recovery**
   - Point-in-time recovery
   - Version restoration
   - Metadata recovery

## 📈 Performance

1. **Optimization**
   - Caching
   - Compression
   - CDN integration
   - Lazy loading

2. **Scalability**
   - Auto-scaling
   - Load balancing
   - Storage sharding

## 🚀 Implementation

### 1. Storage Service
```typescript
interface StorageService {
  uploadDocument(req: UploadRequest): Promise<UploadResponse>;
  downloadDocument(req: DownloadRequest): Promise<DownloadResponse>;
  listDocuments(caseId: string): Promise<DocumentMetadata[]>;
  deleteDocument(documentId: string): Promise<void>;
  getMetadata(documentId: string): Promise<DocumentMetadata>;
}
```

### 2. Error Handling
```typescript
interface StorageError {
  code: string;
  message: string;
  details: any;
  retryable: boolean;
}
```

## 📝 Last Updated
2025-02-21 18:14 PST
