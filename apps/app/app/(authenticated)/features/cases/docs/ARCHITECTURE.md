# Case Management System Architecture

## 📁 Directory Structure

```
features/cases/
├── actions/
│   ├── create-case.ts       # Server actions for case creation
│   ├── get-document.ts      # Document retrieval actions
│   └── upload-document.ts   # Document upload handling
├── components/
│   ├── case-form.tsx        # Main form container
│   ├── form-navigation.tsx  # Tab navigation component
│   ├── upload/
│   │   └── upload-progress.tsx  # Upload progress tracking
│   └── tabs/
│       ├── case-type-tab.tsx    # Case type selection
│       ├── basic-info-tab.tsx   # Basic case information
│       ├── authority-tab.tsx    # Court/authority details
│       ├── location-tab.tsx     # Location information
│       ├── team-tab.tsx         # Team assignment
│       ├── documents-tab.tsx    # Document management
│       └── events-tab.tsx       # Event management
├── hooks/
│   └── use-case-form.ts     # Form state management
├── schemas/
│   └── case-form-schema.ts  # Zod validation schemas
└── validation/
    └── index.ts             # Business validation rules
```

## 🏛️ Architecture Overview

### 1. Form Architecture
The case management system follows a layered architecture:

```
┌─────────────────┐
│    UI Layer     │ Components & Forms
├─────────────────┤
│   Hook Layer    │ State Management
├─────────────────┤
│ Validation Layer│ Schema & Business Rules
├─────────────────┤
│  Action Layer   │ Server Actions
├─────────────────┤
│ Database Layer  │ Multi-tenant Storage
└─────────────────┘
```

### 2. Component Hierarchy

```
CaseForm
├── ProgressIndicator
├── FormNavigation
└── Tabs
    ├── CaseTypeTab
    ├── BasicInfoTab
    ├── AuthorityTab
    ├── LocationTab
    ├── TeamTab
    ├── DocumentsTab
    └── EventsTab
```

## 📄 File Descriptions

### Components

1. **case-form.tsx**
   - Main container component
   - Manages tab switching
   - Handles form submission
   - Integrates progress indicator

2. **form-navigation.tsx**
   - Handles tab navigation
   - Previous/Next buttons
   - Submit button on last tab
   - Dynamic tab visibility

### Tabs

1. **case-type-tab.tsx**
   - Case type selection (Advisory/Litigation)
   - Determines available tabs
   - Additional notes field

2. **basic-info-tab.tsx**
   - Title, risk level, status
   - Law branch selection
   - Start/end dates
   - Basic case metadata

3. **authority-tab.tsx**
   - Dynamic fields based on case type
   - Court information for litigation
   - Authority details for advisory
   - Reference numbers

4. **location-tab.tsx**
   - Country/State/City selection
   - Jurisdiction handling
   - Venue details
   - Postal code

5. **team-tab.tsx**
   - Lead attorney assignment
   - Responsible partner
   - Dynamic team member addition
   - Role assignment

6. **documents-tab.tsx**
   - File upload interface
   - Document metadata
   - Progress tracking
   - Version management

7. **events-tab.tsx**
   - Event creation and management
   - Date/time handling
   - Attendee management
   - Reminder settings

### State Management

1. **use-case-form.ts**
   ```typescript
   interface CaseFormState {
     activeTab: string;
     tabsState: TabsState;
     isSubmitting: boolean;
     businessErrors: ValidationResult[];
   }
   ```
   - Form state management
   - Tab completion tracking
   - Validation state
   - Error handling

### Validation

1. **case-form-schema.ts**
   - Zod schemas for form validation
   - Type definitions
   - Field constraints
   - Conditional validation

2. **validation/index.ts**
   - Business validation rules
   - Cross-field validation
   - Custom validation logic

## 🔄 Data Flow

1. **Form Submission Flow**
   ```mermaid
   graph TD
     A[User Input] --> B[Form State]
     B --> C[Schema Validation]
     C --> D[Business Validation]
     D --> E[Server Action]
     E --> F[Database]
     F --> G[Response]
     G --> H[UI Update]
   ```

2. **Document Upload Flow**
   ```mermaid
   graph TD
     A[File Selection] --> B[Client Validation]
     B --> C[Create DB Record]
     C --> D[Get Signed URL]
     D --> E[Upload to GCS]
     E --> F[Update Status]
     F --> G[UI Progress]
   ```

## 🔐 Security

1. **Multi-tenant Isolation**
   - Database per tenant
   - Storage isolation
   - Access control

2. **File Security**
   - Signed URLs
   - File validation
   - Virus scanning
   - Access logging

## 🎯 Features

1. **Case Management**
   - Multi-step form
   - Progress tracking
   - Dynamic validation
   - Error handling

2. **Document Management**
   - Secure file upload
   - Version control
   - Progress tracking
   - Type validation

3. **Event Management**
   - Calendar integration
   - Reminders
   - Attendee management
   - Type categorization

4. **Team Management**
   - Role assignment
   - Dynamic member addition
   - Responsibility tracking

## 🔄 State Management Patterns

1. **Form State**
   - React Hook Form for form state
   - Custom hooks for business logic
   - Context for shared state
   - Local state for UI

2. **Upload State**
   - Progress tracking
   - Status management
   - Error handling
   - Visual feedback

## 📡 API Integration

1. **Server Actions**
   - Database operations
   - File handling
   - Validation
   - Error handling

2. **External Services**
   - Google Cloud Storage
   - Calendar integration
   - Authentication
   - Notifications

## 🔍 Validation Strategy

1. **Client-side**
   - Form validation (Zod)
   - File type/size
   - Required fields
   - Cross-field validation

2. **Server-side**
   - Business rules
   - Security checks
   - Data integrity
   - Permissions

## 📈 Future Improvements

1. **Performance**
   - Form field caching
   - Lazy loading
   - API optimization
   - Bundle size reduction

2. **Features**
   - Batch operations
   - Advanced search
   - Reporting
   - Analytics

3. **UX Enhancements**
   - Keyboard shortcuts
   - Drag-and-drop
   - Bulk actions
   - Quick actions

## 📝 Last Updated
2025-02-21 18:14 PST
