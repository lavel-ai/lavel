# Case Management Components

## 🎯 Component Overview

Each component in the case management system is designed with specific responsibilities and follows these principles:
- Single Responsibility
- Reusability
- Type Safety
- Error Handling
- Accessibility

## 📦 Core Components

### 1. CaseForm
**Purpose**: Main container component that orchestrates the entire form experience.
```typescript
interface CaseFormProps {
  initialData?: Partial<CaseFormData>;
  onSubmit?: (data: CaseFormData) => Promise<void>;
}
```
**Features**:
- Tab management
- Form state coordination
- Progress tracking
- Error boundary
- Loading states

### 2. FormNavigation
**Purpose**: Handles navigation between form tabs.
```typescript
interface FormNavigationProps {
  tabs: TabsState;
  currentTab: string;
  onTabChange: (tab: string) => void;
  isSubmitting?: boolean;
  onSubmit?: () => void;
}
```
**Features**:
- Previous/Next navigation
- Submit button on last tab
- Disabled states
- Loading indicators

### 3. ProgressIndicator
**Purpose**: Visual representation of form completion status.
```typescript
interface ProgressIndicatorProps {
  tabs: Record<string, TabValidation>;
  currentTab: string;
}
```
**Features**:
- Progress bar
- Tab status indicators
- Error states
- Completion tracking

## 📝 Form Tabs

### 1. CaseTypeTab
**Purpose**: Initial case type selection that determines form flow.
**Fields**:
- Case Type (Advisory/Litigation)
- Description
- Notes

### 2. BasicInfoTab
**Purpose**: Core case information collection.
**Fields**:
- Title
- Risk Level
- Status
- Law Branch
- Start/End Dates

### 3. AuthorityTab
**Purpose**: Authority or court information based on case type.
**Fields**:
- Court Name (Litigation)
- Court Level (Litigation)
- Authority Name (Advisory)
- Authority Type (Advisory)
- Reference Numbers

### 4. LocationTab
**Purpose**: Geographic and jurisdictional information.
**Fields**:
- Country
- State/Province
- City
- Jurisdiction
- Postal Code
- Venue Details

### 5. TeamTab
**Purpose**: Team assignment and management.
**Fields**:
- Lead Attorney
- Responsible Partner
- Team Members
  - Member Selection
  - Role Assignment

### 6. DocumentsTab
**Purpose**: Document upload and management.
**Features**:
- File Upload
- Progress Tracking
- Metadata Collection
- Version Management
```typescript
interface DocumentMetadata {
  title: string;
  documentType: string;
  isCourtDocument: boolean;
  typeOfCourtDocument?: string;
  description?: string;
}
```

### 7. EventsTab
**Purpose**: Event creation and management.
**Features**:
- Event Creation
- Date/Time Selection
- Attendee Management
- Reminders
```typescript
interface EventData {
  title: string;
  type: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  attendees: string[];
  reminder: boolean;
  reminderBefore: string;
}
```

## 🔄 State Management

### 1. useCaseForm Hook
**Purpose**: Centralized form state management.
```typescript
interface UseCaseFormReturn {
  form: UseFormReturn<CaseFormData>;
  tabs: TabsState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSubmitting: boolean;
  onSubmit: (data: CaseFormData) => Promise<void>;
}
```
**Features**:
- Form state
- Validation
- Tab management
- Error handling
- Submission logic

### 2. Upload Progress
**Purpose**: File upload state management.
```typescript
interface UploadState {
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}
```
**Features**:
- Progress tracking
- Status management
- Error handling
- Visual feedback

## 🎨 UI Components

### 1. FileUpload
**Purpose**: Reusable file upload component.
```typescript
interface FileUploadProps {
  value?: File;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
}
```
**Features**:
- Drag and drop
- File selection
- Preview
- Validation

### 2. DateTimePicker
**Purpose**: Date and time selection component.
```typescript
interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}
```
**Features**:
- Date selection
- Time selection
- Range validation
- Format handling

## 🔍 Validation Components

### 1. FormField
**Purpose**: Form field wrapper with validation.
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  validation?: ValidationRule[];
}
```
**Features**:
- Error display
- Required field handling
- Custom validation
- Accessibility

### 2. FormMessage
**Purpose**: Error message display.
```typescript
interface FormMessageProps {
  error?: string;
  className?: string;
}
```
**Features**:
- Error formatting
- Accessibility
- Animation
- Style variants

## 🎯 Best Practices

1. **Component Organization**
   - Logical grouping
   - Clear naming
   - Consistent structure
   - Documentation

2. **State Management**
   - Single source of truth
   - Predictable updates
   - Performance optimization
   - Error handling

3. **Validation**
   - Client-side validation
   - Server validation
   - Error messages
   - User feedback

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support

## 📝 Last Updated
2025-02-21 18:14 PST
