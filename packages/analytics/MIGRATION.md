# Analytics Package Migration Guide

This guide outlines the steps to migrate from the existing analytics implementation to our new provider-agnostic analytics architecture. Since we're still in development, we can directly migrate to the new implementation.

## Migration Action Plan

### Step 1: Update Application Analytics Provider

The root `AnalyticsProvider` component in your application needs to be updated:

```tsx
// app/(authenticated)/layout.tsx or wherever you implement AnalyticsProvider
import { AnalyticsProvider } from '@repo/analytics';

// The updated provider accepts additional properties:
<AnalyticsProvider 
  userId={user?.id}
  userProperties={{
    email: user?.email,
    // other user properties
  }}
  tenantId={tenant?.id}
>
  {children}
</AnalyticsProvider>
```

### Step 2: Update Form Analytics Imports

Replace all form tracking imports:

```tsx
// BEFORE:
import { trackFormSubmission, trackFormSuccess, trackFormError } from '@repo/analytics/posthog/actions/client-actions';
import { trackFormAbandonment } from '@repo/analytics/posthog/actions/client-actions';

// AFTER:
import { 
  trackFormSubmission, 
  trackFormSuccess, 
  trackFormError,
  trackFormAbandonment
} from '@repo/analytics';
```

### Step 3: Update Server-Side Analytics Imports

Replace all server-side tracking imports:

```tsx
// BEFORE:
import { 
  trackEntityCreated, 
  trackEntityUpdated, 
  trackErrorEvent 
} from '@repo/analytics/posthog/actions/server-actions';

// AFTER:
import { 
  trackEntityCreated, 
  trackEntityUpdated, 
  trackErrorEvent 
} from '@repo/analytics/server';
```

### Step 4: Update Client-Side Hooks & Components

Update the `useFormAnalytics` hook implementation in your application:

```tsx
// BEFORE:
import { useFormAnalytics } from './analytics/use-form-analytics';

// AFTER:
import { useFormAnalytics } from '@repo/analytics';
```

Replace `PageViewTracker` component imports:

```tsx
// BEFORE:
import { PageViewTracker } from '@repo/analytics/posthog/components/page-view-tracker';

// AFTER:
// No need to import separately - PageViewTracker is now included in AnalyticsProvider
```

### Step 5: Update Error Tracking

Update error tracking calls:

```tsx
// BEFORE:
import { trackErrorEvent } from '@repo/analytics/posthog/actions/server-actions';

// AFTER:
import { trackErrorEvent } from '@repo/analytics/server';
```

### Step 6: Update Feature Flag Integration

Update feature flag analytics integration:

```tsx
// BEFORE:
import { analytics } from '@repo/analytics/posthog/server';

// AFTER:
import { analytics } from '@repo/analytics/server';
```

## Benefits of Migration

By adopting the new analytics architecture, you'll gain:

1. **Provider-agnostic tracking**: Easily switch between analytics providers
2. **Enhanced type safety**: Comprehensive TypeScript interfaces for all events
3. **Improved performance**: Optimized tracking with reduced overhead
4. **Better analytics coverage**: Track more events with less code
5. **Standardized naming**: Consistent event names and properties

## Tips for a Smooth Migration

1. Update the most critical components first
2. Test thoroughly after each update
3. Use the TypeScript compiler to catch missing imports
4. Check analytics dashboards to ensure events are still being tracked correctly

## New Analytics System Summary

We've successfully implemented a complete restructuring of the analytics package with a clean, provider-agnostic architecture. This document outlines the changes made and how to use the new system.

### Changes Made

1. **New Architecture Implemented**:
   - Provider-agnostic architecture with PostHog as the initial provider
   - Strong typing system for all events
   - Separation of client and server tracking
   - Comprehensive event categorization

2. **Import Changes**:
   - Updated all imports throughout the codebase to use the new paths
   - Old paths like `@repo/analytics/posthog/...` now redirect to the new implementation

3. **Components Updated**:
   - `AnalyticsProvider` now includes Google Analytics and Vercel Analytics
   - `PageViewTracker` is automatically included in the provider

### Using the New Analytics System

#### Client-Side Tracking

```tsx
// Import from the main package
import { 
  trackFormSubmission, 
  trackFormSuccess,
  trackFormError,
  trackFormAbandonment,
  useFormAnalytics
} from '@repo/analytics';

// Use the form analytics hook
const { trackFieldInteraction, trackFormStarted } = useFormAnalytics({
  formId: 'contact-form',
  formType: 'contact',
  totalFields: 5
});

// Track a form submission
trackFormSubmission({
  formId: 'contact-form',
  formType: 'contact',
  formStep: 'submit'
});
```

#### Server-Side Tracking

```tsx
// Import from the server subpackage
import { 
  trackEntityCreated,
  trackEntityUpdated,
  trackErrorEvent
} from '@repo/analytics/server';

// Track entity creation
trackEntityCreated({
  entityId: '123',
  entityType: 'user',
  tenantId: 'tenant-1'
});

// Track errors
trackErrorEvent({
  errorType: 'validation',
  errorCode: 'invalid-input',
  context: { field: 'email' }
});
```

#### Provider Configuration

The `AnalyticsProvider` component now accepts additional properties for better user and tenant tracking:

```tsx
<AnalyticsProvider 
  userId={user?.id}
  userProperties={{
    email: user?.email,
    role: user?.role
  }}
  tenantId={tenant?.id}
>
  {children}
</AnalyticsProvider>
```

## Benefits of the New System

1. **Flexibility**: Easily switch between analytics providers without changing your tracking code
2. **Type Safety**: Comprehensive TypeScript interfaces for all events
3. **Performance**: Optimized tracking with reduced overhead
4. **Coverage**: More comprehensive event tracking across the application
5. **Maintainability**: Consistent event naming and structures
