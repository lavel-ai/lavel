## SpecStory

## Build Error Analysis for Server-Only Module (3/2/2025, 5:13:32 PM)

_**User**_

ok we are getting this error and i think is in the @observability @analytics 
my gues is that in the @utils.ts since we use the @error.ts that uses the @server.ts 

Build Error

Ecmascript file had an error

./packages/analytics/posthog/server.ts (1:1)

Ecmascript file had an error
> 1 | import 'server-only';
    | ^^^^^^^^^^^^^^^^^^^^^
  2 | import { PostHog } from 'posthog-node';
  3 | import { keys } from '../keys';
  4 |

---

_**Assistant**_

<think>Let's analyze this error. The build is failing when trying to process the file `./packages/analytics/posthog/server.ts`, specifically at line 1 where it imports the 'server-only' package. This package is typically used in Next.js applications to mark modules that should only be executed on the server side.

The error suggests there might be an issue with how this module is being used or that there's a conflict somewhere. Here are potential issues:

1. The 'server-only' package might not be installed
2. There could be an issue with accessing server components from client components
3. There could be a compatibility issue with how the modules are structured
4. There might be circular dependencies

Let's first look at the files in more detail to understand the structure:

1. `packages/observability/error.ts` - Contains a `captureError` function that uses Sentry, logging, and analytics
2. `packages/design-system/lib/utils.ts` - Has a `handleError` function that calls `captureError`
3. `packages/analytics/posthog/server.ts` - Sets up PostHog analytics for server-side use with 'server-only' import

The error is specifically in the `server.ts` file's import of 'server-only'. 

Looking at the dependencies:
- `utils.ts` depends on `error.ts`
- `error.ts` depends on `analytics/posthog/server.ts`
- `server.ts` uses 'server-only' which is failing

Let's check if we need to look at more files to get a better understanding:
1. We should check if the 'server-only' package is listed in the package.json dependencies
2. We should understand where and how `utils.ts` is being used - is it used in client components?
3. We might need to look at the file structure of the Next.js application

Based on what we can see, I think the issue might be that the server-only PostHog analytics instance is being imported in places where it shouldn't be (like client components). The 'server-only' package is specifically designed to prevent server-only code from being accidentally used in client components.

My next step would be to suggest checking how these modules are being used and potentially creating separate client and server versions of the analytics functionality.</think>I'll help you resolve this build error. The issue appears to be related to importing a server-only module in places where it shouldn't be used.

Let's first examine the key files to better understand the problem:

---

_****_

Read file: packages/analytics/posthog/server.ts

---

_****_

Read file: packages/observability/error.ts

---

_****_

<details>
            <summary>Listed directory packages/analytics/posthog • **4** results</summary>
        
| Name |
|-------|
| 📄 `server.ts` |
| 📁 `components` |
| 📁 `actions` |
| 📄 `client.tsx` |

</details>

---

_****_

Read file: packages/analytics/posthog/client.tsx

---

_****_

Read file: packages/design-system/lib/utils.ts

---

_****_

Read file: packages/analytics/package.json

---

_****_



I've identified the issue. The problem is with how server-only code is being used in the application. Let's fix it by creating a proper client/server separation for the analytics module.

Here's what's happening:
1. `packages/analytics/posthog/server.ts` uses the 'server-only' package to prevent it from being used in client components
2. However, `packages/observability/error.ts` is importing the server-specific analytics module
3. Then `packages/design-system/lib/utils.ts` is using the `captureError` function
4. The `utils.ts` file is likely being imported in client components, causing the build error

Let's solve this by creating a solution that works in both client and server contexts:

---

_****_

```diff
  import { keys } from '../keys';
  
+ /**
+  * Server-side PostHog client
+  * IMPORTANT: This module can ONLY be imported in server components or server actions
+  * For client-side analytics, use the client.tsx module instead
+  */
  export const analytics = new PostHog(keys().NEXT_PUBLIC_POSTHOG_KEY, {
    host: keys().NEXT_PUBLIC_POSTHOG_HOST,
```

---

_****_



Now I'll create a new file to provide an isomorphic (works in both client and server) error capture function:

---

_****_

```diff
- 
+ import { captureException } from '@sentry/nextjs';
+ import { log } from './log';
+ 
+ /**
+  * Isomorphic error capture function that works in both client and server environments
+  * This doesn't use the server-only PostHog analytics directly
+  */
+ export const captureErrorBase = async (error: unknown, context: Record<string, any> = {}): Promise<string> => {
+   let message = 'An error occurred';
+ 
+   if (error instanceof Error) {
+     message = error.message;
+   } else if (error && typeof error === 'object' && 'message' in error) {
+     message = error.message as string;
+   } else {
+     message = String(error);
+   }
+ 
+   try {
+     // Track in Sentry (works in both client and server)
+     captureException(error, { extra: context });
+     
+     // Log the error
+     log.error(`Error captured: ${message}`, { ...context, error });
+   } catch (newError) {
+     console.error('Error capturing error:', newError);
+   }
+ 
+   return message;
+ }; 
```

---

_****_



Now let's modify the original error.ts file to properly separate the server logic:

---

_****_

```diff
  import { log } from './log';
  import { analytics } from '@repo/analytics/posthog/server';
- 
- export const captureError = async (error: unknown, context: Record<string, any> = {}) => {
-   let message = 'An error occurred';
- 
-   if (error instanceof Error) {
-     message = error.message;
-   } else if (error && typeof error === 'object' && 'message' in error) {
-     message = error.message as string;
-   } else {
-     message = String(error);
-   }
- 
+ import { captureErrorBase } from './error-capture';
+ 
+ /**
+  * Server-side error capture with analytics
+  * IMPORTANT: This function should only be used in server components or server actions
+  */
+ export const captureServerError = async (error: unknown, context: Record<string, any> = {}) => {
+   const message = await captureErrorBase(error, context);
+   
    try {
      // Track in Sentry
      log.error(`Error captured: ${message}`, { ...context, error });
      
-     // Track in analytics if userId is provided
+     // Track in analytics if userId is provided (server-side only)
      if (context.userId) {
        await analytics.capture({
      }
    } catch (newError) {
-     console.error('Error capturing error:', newError);
+     console.error('Error capturing error in analytics:', newError);
    }
  
    return message;
  };
+ 
+ /**
+  * Isomorphic error capture function that works in both client and server environments
+  * This is a safe function to use anywhere in your application
+  */
+ export const captureError = async (error: unknown, context: Record<string, any> = {}) => {
+   // We're using a simple approach to detect if code is running on server or client
+   // For client-side: window is defined
+   // For server-side: window is undefined
+   if (typeof window === 'undefined') {
+     // Server-side: use the full version with analytics
+     return captureServerError(error, context);
+   } else {
+     // Client-side: use the base version without server-only dependencies
+     return captureErrorBase(error, context);
+   }
+ };
```

---

_****_





Finally, let's make sure the design system utils.ts is using our updated error handling approach:

---

_****_

```diff
    str.charAt(0).toUpperCase() + str.slice(1);
  
- export const handleError = (error: unknown): void => {
-   const message = captureError(error);
- 
+ export const handleError = async (error: unknown): Promise<void> => {
+   const message = await captureError(error);
    toast.error(message);
  };
```

---

_****_



Now that we've made these changes, let's try to build the application to see if the error is resolved:

---

_****_

Cancelled

---

_****_



---

_**User**_

ok the error persists, where else could we doing it wrong, perhaps in the middleware @middleware.ts 

---

_**Assistant**_

<think>I see that we still have the issue, even after our changes. Let's examine the middleware.ts file since you mentioned it as a potential problem area. I need to see what's happening in the middleware that might be causing the server-only import error.

Looking at the middleware file, I can see it's importing `recordRequestMetrics` from the observability package. Let's check that file to see if it's also using the server-only analytics:

- apps/app/middleware.ts is importing `recordRequestMetrics` from '@repo/observability/instrumentation'
- We need to see if instrumentation.ts is also importing the server-side analytics

Let's also look for other places where the server-only module might be getting imported in a client-side context. I need to check:

1. The instrumentation.ts file
2. Any other middleware or client-side files that might be importing server-only modules
3. How middleware.ts is being used

The build error occurs specifically with the `import 'server-only';` line in server.ts, which indicates that this module is being included in client-side code. Middleware runs on the server, but in Next.js it sometimes has access to both client and server code in its build process.</think>You're right to look at the middleware. The Next.js middleware runs in a special environment that has different restrictions than regular server components. Let's examine the instrumentation file that's being imported in the middleware:

---

_****_

Read file: packages/observability/instrumentation.ts

---

_****_



Now let's check how the middleware file is using this and see if there are any analytics imports in there:

---

_****_

Read file: apps/app/middleware.ts

---

_****_



Let's check if there's any indirect usage of the server-only analytics module. Let's check the log.ts file as it's imported in the middleware:

---

_****_

Read file: packages/observability/log.ts

---

_****_



Now I need to see if the error-capture.ts has any imports that could be triggering the server-only error. Let's check its imports in detail:

---

_****_

<details>
            <summary>Grep search for "import.*from.*posthog" • **28** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L183 | `import { useAnalytics } from '../posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L296 | `import { useAnalytics } from '../posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L782 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L845 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/clerk/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/analytics.mdx` | L31 | `import posthog from 'posthog-js';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/lib/query-client.ts` | L3 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L11 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L13 | `import { PageViewTracker } from '@repo/analytics/posthog/components/page-view-tracker';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/components/posthog-identifier.tsx` | L2 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/components/error-boundary.tsx` | L4 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/features/practice-area/components/new-practice-area-button.tsx` | L6 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/features/practice-area/hooks/use-practice-areas.ts` | L5 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/features/practice-area/components/practice-area-form.tsx` | L23 | `import { TrackedForm } from '@repo/analytics/posthog/components/tracked-form';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/features/practice-area/components/practice-area-form.tsx` | L24 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/features/practice-area/components/practice-area-dashboard.tsx` | L27 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/events.ts` | L2 | `import { analytics } from './posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/posthog/client.tsx` | L2 | `import posthog, { type PostHog } from 'posthog-js';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/posthog/client.tsx` | L3 | `import { PostHogProvider as PostHogProviderRaw } from 'posthog-js/react';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/posthog/server.ts` | L1 | `import { PostHog } from 'posthog-node';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/index.tsx` | L3 | `import { PostHogProvider } from './posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L21 | `2 | import { PostHog } from 'posthog-node';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L108 | `<summary>Grep search for "import.*from.*analytics/posthog/server" • **4** files</summary>` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L112 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L113 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/clerk/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L114 | `| `file:///Users/dmgpro/Desktop/lavel-t/packages/feature-flags/lib/create-flag.ts` | Lundefined | `import { analytics } from '@repo/analytics/posthog/server';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L115 | `| `file:///Users/dmgpro/Desktop/lavel-t/packages/observability/error.ts` | L3 | `import { analytics } from '@repo/analytics/posthog/server';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L331 | `<summary>Grep search for "import.*from.*analytics/posthog/server" • **0** files</summary>` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L357 | `<summary>Grep search for "import.*from.*analytics/posthog/server" • **0** files</summary>` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L830 | `./packages/feature-flags/lib/create-flag.ts:import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L831 | `./packages/observability/error.ts:import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L832 | `./apps/api/app/webhooks/clerk/route.ts:import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L833 | `./apps/api/app/webhooks/stripe/route.ts:import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_17-13-untitled.md` | L18 | `2 | import { PostHog } from 'posthog-node';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L814 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L1199 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L3449 | `import posthog from 'posthog-js';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1339 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1409 | `*   `import { PostHogIdentifier } from './components/posthog-identifier';`: Imports `PostHogIdentifier`, probably for analytics integration. **Analytics component, seems okay.**` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1685 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/feature-flags/lib/create-flag.ts` | Lundefined | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/observability/error.ts` | L3 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L11 | `import { PostHogIdentifier } from './components/posthog-identifier';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L13 | `import { PageViewTracker } from '@repo/analytics/posthog/components/page-view-tracker';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/events.ts` | L2 | `import { analytics } from './posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/hooks/use-monitoring.ts` | L3 | `import { useAnalytics } from '@repo/analytics/posthog/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/observability/error.ts` | L3 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/analytics/posthog/server.ts` | L1 | `import { PostHog } from 'posthog-node';` |

</details>

---

_****_





I found the issue! The critical problem area is in the feature-flags package. Let's check that file which is importing the server-side analytics:

---

_****_

Read file: packages/feature-flags/lib/create-flag.ts

---

_****_





Now I understand the issue. Next.js builds applications in a way that bundles all dependencies, and since the feature flags code is using server-only PostHog analytics but might be accessed during build time, it's causing the error. 

Let's fix both the feature flags and finalize our error handling solution:

---

_****_

```diff
- import { analytics } from '@repo/analytics/posthog/server';
  import { auth } from '@repo/auth/server';
  import { flag } from '@vercel/flags/next';
+ 
+ // Safe access to the analytics module
+ let analytics: any = null;
+ 
+ // Dynamically import the server-only module at runtime
+ if (typeof window === 'undefined') {
+   // This will only be executed on the server
+   // The import() is called at runtime, not during build
+   import('@repo/analytics/posthog/server').then(module => {
+     analytics = module.analytics;
+   }).catch(error => {
+     console.error('Failed to import analytics module:', error);
+   });
+ }
  
  export const createFlag = (key: string) =>
      defaultValue: false,
      async decide() {
-       const { userId } = await auth();
+       try {
+         const { userId } = await auth();
  
-       if (!userId) {
-         return this.defaultValue as boolean;
-       }
+         if (!userId) {
+           return this.defaultValue as boolean;
+         }
+ 
+         // Safe check in case analytics wasn't loaded
+         if (!analytics) {
+           return this.defaultValue as boolean;
+         }
  
-       const isEnabled = await analytics.isFeatureEnabled(key, userId);
- 
-       return isEnabled ?? (this.defaultValue as boolean);
+         const isEnabled = await analytics.isFeatureEnabled(key, userId);
+         return isEnabled ?? (this.defaultValue as boolean);
+       } catch (error) {
+         console.error(`Error checking feature flag ${key}:`, error);
+         return this.defaultValue as boolean;
+       }
      },
    });
```

---

_****_





Now let's also look at the analytics/events.ts file which is also importing from the server package:

---

_****_

Read file: packages/analytics/events.ts

---

_****_





This file is correctly using 'server-only' at the beginning, so that part is appropriate. Let's create a client-safe version of the observability/error.ts file we fixed earlier:

---

_****_

```diff
  import { captureException } from '@sentry/nextjs';
  import { log } from './log';
- import { analytics } from '@repo/analytics/posthog/server';
  import { captureErrorBase } from './error-capture';
+ 
+ // Safe analytics access
+ let analytics: any = null;
+ 
+ // Dynamically import analytics at runtime on the server only
+ if (typeof window === 'undefined') {
+   import('@repo/analytics/posthog/server').then(module => {
+     analytics = module.analytics;
+   }).catch(error => {
+     console.error('Failed to import analytics module:', error);
+   });
+ }
  
  /**
      log.error(`Error captured: ${message}`, { ...context, error });
      
+     // Only attempt to use analytics if we're on the server and it was loaded successfully
+     if (typeof window === 'undefined' && analytics && context.userId) {
        // Track in analytics if userId is provided (server-side only)
-     if (context.userId) {
        await analytics.capture({
          distinctId: context.userId,
```

---

_****_







Let's run a build to see if we've fixed the issue:

---

_****_

Cancelled

---

_****_



---

_**User**_

i think i might have found where we are causing conflict @utils.ts in here we use to import the parese error but we updated that file this one is used i think across the app the cn thing that not sure what is it for 

---

_**Assistant**_

<think>You're right! I see the issue now. In the `packages/design-system/lib/utils.ts` file, we have a linter error about an import:

```
1   | import { parseError } from '@repo/observability/error';
Err | Module '"@repo/observability/error"' has no exported member 'parseError'.
```

The file is trying to import `parseError` from our observability package, but we've changed that file and don't have a function called `parseError` anymore. We renamed/reorganized the error handling functionality, and now we have `captureError` and `captureErrorBase` but not `parseError`.

This mismatch is causing a build issue. Let's fix the utils.ts file to use our updated error handling functions.</think>You're absolutely right! I spotted the issue in the linter errors. The `packages/design-system/lib/utils.ts` file is importing a function called `parseError` from our observability package, but that function doesn't exist anymore after our changes. 

Here's what's happening:
1. The utils.ts file is trying to import `parseError` from '@repo/observability/error'
2. But we've refactored that file to use `captureError` and `captureErrorBase` instead
3. This mismatch is causing the build to fail

Let's fix the utils.ts file to use our new error handling function:

---

_****_

```diff
- import { parseError } from '@repo/observability/error';
+ import { captureError } from '@repo/observability/error';
  import { clsx } from 'clsx';
  import type { ClassValue } from 'clsx';
    str.charAt(0).toUpperCase() + str.slice(1);
  
- export const handleError = (error: unknown): void => {
-   const message = parseError(error);
- 
+ export const handleError = async (error: unknown): Promise<void> => {
+   const message = await captureError(error);
    toast.error(message);
  };
```

---

_****_





Now let's check if there are any other files that might still be using `parseError` to make sure we catch all the issues:

---

_****_

<details>
            <summary>Grep search for "parseError" • **7** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/with-auth.ts` | L3 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/with-auth.ts` | L29 | `parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/contact/actions/contact.tsx` | L5 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/contact/actions/contact.tsx` | L43 | `const errorMessage = parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L3 | `// import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L40 | `//     const message = parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L48 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L84 | `const message = parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L18 | `2. The main export is a function called `parseError` that:` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L45 | `## The `parseError` Function` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L212 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L225 | `parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L259 | `- New version: Uses the `parseError` utility function from `@repo/observability/error` to handle errors` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L283 | `- Now uses `parseError` from your observability package instead of just `console.error`` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L416 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L443 | `parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L872 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L3 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L873 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/contact/actions/contact.tsx` | L5 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L874 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L3 | `// import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L875 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L48 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L881 | `| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/with-auth.ts` | L3 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L884 | `| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L212 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L885 | `⟪ 112 characters skipped ⟫.md` | L259 | `- New version: Uses the `parseError` utility function from `@repo/observability/error` to handle errors` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L886 | `| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L416 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_16-54-next-js-server-component-error-troubleshooting.md` | L887 | `⟪ 107 characters skipped ⟫plementation-plan.md` | L96 | `import { parseError } from '@repo/observability/error';` |` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-07_15-15-multitenant-login-middleware-implementation-plan.md` | L96 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-07_15-15-multitenant-login-middleware-implementation-plan.md` | L141 | `const message = parseError(error);` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-10_13-33-environment-variable-loading-error-troubleshooting.md` | L356 | `at cn.parseErrorMessage (file:///Users/dmgpro/Desktop/lavel-t/node_modules/.pnpm/@neondatabase+serverles` |

</details>

---

_****_





Now let's fix the identified files that are still using `parseError`. Let's start with `with-auth.ts`:

---

_****_

Read file: apps/app/app/utils/with-auth.ts

---

_****_





Let's fix the `with-auth.ts` file:

---

_****_

```diff
  import { auth } from '@repo/auth/server';
  import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
- import { parseError } from '@repo/observability/error';
+ import { captureError } from '@repo/observability/error';
  
  export function withAuth(actionFn: (...args: any[]) => Promise<any>) {
        return actionFn({ db, user, userId }, ...args);
      } catch (error) {
-       parseError(error);
+       await captureError(error, { userId });
        
        return { status: 'error', message: 'An error occurred' };
```

---

_****_







Let's fix the linter error:

---

_****_

```diff
  export function withAuth(actionFn: (...args: any[]) => Promise<any>) {
    return async function(...args: any[]) {
+     let authUserId: string | null = null;
+     
      try {
        // Authentication check
        const { userId } = await auth();
+       authUserId = userId;
+       
        if (!userId) {
          return { status: 'error', message: 'Unauthorized' };
        return actionFn({ db, user, userId }, ...args);
      } catch (error) {
-       await captureError(error, { userId });
+       // Pass the userId in the context if we have it
+       await captureError(error, authUserId ? { userId: authUserId } : {});
        
        return { status: 'error', message: 'An error occurred' };
```

---

_****_







Now let's fix the contact actions file:

---

_****_

Read file: apps/web/app/contact/actions/contact.tsx

---

_****_







Let's fix the contact action:

---

_****_

```diff
  import { resend } from '@repo/email';
  import { ContactTemplate } from '@repo/email/templates/contact';
- import { parseError } from '@repo/observability/error';
+ import { captureError } from '@repo/observability/error';
  import { createRateLimiter, slidingWindow } from '@repo/rate-limit';
  import { headers } from 'next/headers';
      return {};
    } catch (error) {
-     const errorMessage = parseError(error);
+     const errorMessage = await captureError(error, { 
+       component: 'ContactForm',
+       email: email 
+     });
  
      return { error: errorMessage };
```

---

_****_









Now let's check if there are any other files that need fixing:

---

_****_

Read file: apps/web/middleware.ts

---

_****_









Let's fix the web middleware:

---

_****_

```diff
  // apps/web/middleware.ts
  import { env } from '@/env';
- import { parseError } from '@repo/observability/error';
+ import { captureError } from '@repo/observability/error';
  import { secure } from '@repo/security';
  import {
      return securityHeaders();
    } catch (error) {
-     const message = parseError(error);
+     // Middleware errors are handled differently since we can't await async functions here
+     // We'll synchronously get the error message and handle analytics separately
+     let message = 'Access denied';
+     
+     try {
+       if (error instanceof Error) {
+         message = error.message;
+       } else if (typeof error === 'string') {
+         message = error;
+       }
+       
+       // Fire and forget error capturing - can't await in middleware response path
+       captureError(error, {
+         component: 'WebMiddleware',
+         path: request.url
+       });
+     } catch (captureErr) {
+       console.error('Failed to capture middleware error:', captureErr);
+     }
+     
      return NextResponse.json({ error: message }, { status: 403 });
    }
```

---

_****_









Now let's run a build to see if we've fixed the issue:

---

_****_

Cancelled

---

_****_



---

_**User**_

lets test this form @department-form.tsx  in this page @practice-area.ts 

---

_**Assistant**_

I notice that we have some linter errors in the department form and we need to adapt it to work with the practice area schema. Let me analyze both files and create a proper integration.

The main issues I see are:
1. The department form has linter errors with `TrackedForm`, `NormalizedTextInput`, and `NormalizedTextarea` components
2. We need to adapt the form to use the practice area schema validation and normalization
3. The form needs to properly handle the practice area data structure

Let's fix these issues:

---

_****_

Read file: packages/analytics/posthog/components/tracked-form.tsx

---

_****_

Read file: packages/design-system/components/form/normalized-text-input.tsx

---

_****_



Let's create a new practice area form component that properly integrates with our schema and components:

---

_****_



---

_****_



---



---

