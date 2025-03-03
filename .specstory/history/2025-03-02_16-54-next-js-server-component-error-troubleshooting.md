## SpecStory

## Next.js Server Component Error Troubleshooting (3/2/2025, 4:54:55 PM)

_**User**_

im getting this error, where might the problem be ?

Request metrics {
  path: '/',
  method: 'GET',
  status: 200,
  duration: 0,
  tenant: undefined
}
 ○ Compiling / ...
 ✓ Compiled / in 3.7s
 ⨯ ./packages/analytics/posthog/server.ts:1:1
Ecmascript file had an error
> 1 | import 'server-only';
    | ^^^^^^^^^^^^^^^^^^^^^
  2 | import { PostHog } from 'posthog-node';
  3 | import { keys } from '../keys';
  4 |

You're importing a component that needs "server-only". That only works in a Server Component which is not supported in the pages/ directory. Read more: https://nextjs.org/docs/app/building-your-application/rendering/server-components

---

_**Assistant**_

I'll help you troubleshoot this error. The issue appears to be related to using server-only components in a Next.js pages directory.

Let me first check the file that's causing the error to understand the context better.

---

_****_

Read file: packages/analytics/posthog/server.ts

---

_****_



Now let's check if there's a client-side version of this file and understand the project structure better.

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



Let's also check the keys file that's being imported:

---

_****_

Read file: packages/analytics/keys.ts

---

_****_



Let's also check the client-side version of the PostHog implementation:

---

_****_

Read file: packages/analytics/posthog/client.tsx

---

_****_





Now, let's check how this analytics package is being used in the project. Let's look for imports of the server.ts file:

---

_****_

<details>
            <summary>Grep search for "import.*from.*analytics/posthog/server" • **4** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/clerk/route.ts` | L1 | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/feature-flags/lib/create-flag.ts` | Lundefined | `import { analytics } from '@repo/analytics/posthog/server';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/observability/error.ts` | L3 | `import { analytics } from '@repo/analytics/posthog/server';` |

</details>

---

_****_





Let's also check if there are any pages that might be importing this server-only component:

---

_****_

<details>
            <summary>Listed current directory • **25** results</summary>
        
| Name |
|-------|
| 📁 `node_modules` |
| 📄 `pnpm-lock.yaml` |
| 📁 `.turbo` |
| 📁 `.git` |
| 📄 `tsconfig.json` |
| 📄 `package.json` |
| 📁 `packages` |
| 📄 `.DS_Store` |
| 📄 `README.md` |
| 📁 `rules` |
| 📁 `.cursor` |
| 📄 `.windsurfrules` |
| 📁 `.specstory` |
| 📁 `.next` |
| 📄 `turbo.json` |
| 📁 `apps` |
| 📄 `.gitignore` |
| 📁 `.github` |
| 📄 `next-env.d.ts` |
| 📁 `turbo` |
| 📁 `scripts` |
| 📁 `.vscode` |
| 📄 `biome.json` |
| 📄 `pnpm-workspace.yaml` |
| 📄 `tsup.config.ts` |

</details>

---

_****_





Let's check the apps directory to see what applications are in the project:

---

_****_

<details>
            <summary>Listed directory apps • **6** results</summary>
        
| Name |
|-------|
| 📁 `app` |
| 📁 `email` |
| 📁 `docs` |
| 📁 `web` |
| 📁 `api` |
| 📁 `storybook` |

</details>

---

_****_







Let's check if there are any pages directories in the apps:

---

_****_

<details>
            <summary>Grep search for "pages" • **0** files</summary>
        
No results found
</details>

---

_****_







Let's try a different approach to find pages directories:

---

_****_

<details>
            <summary>Searched codebase "pages" • **10** results</summary>
        
| File |
|------|
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |

</details>

---

_****_









Let's check if there are any pages directories (not app router pages):

---

_****_

<details>
            <summary>Searched codebase "pages/" • **10** results</summary>
        
| File |
|------|
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |
| `undefined` |

</details>

---

_****_









Let's try a more specific search for pages directories:

---

_****_

<details>
            <summary>Grep search for "directory" • **0** files</summary>
        
No results found
</details>

---

_****_











Let's check if there are any imports of the analytics server module in any pages:

---

_****_

<details>
            <summary>Grep search for "import.*from.*analytics/posthog/server" • **0** files</summary>
        
No results found
</details>

---

_****_











Let's check if there are any imports of the analytics server module in any page files:

---

_****_

<details>
            <summary>Grep search for "import.*from.*analytics/posthog/server" • **0** files</summary>
        
No results found
</details>

---

_****_













Let's check the root directory for a pages directory:

---

_****_

Could not resolve URI: Error: Unable to resolve nonexistent file '/Users/dmgpro/Desktop/lavel-t/pages'

---

_****_













Let's check the apps/app directory structure:

---

_****_

<details>
            <summary>Listed directory apps/app • **21** results</summary>
        
| Name |
|-------|
| 📁 `.next` |
| 📄 `middleware.ts` |
| 📁 `app` |
| 📁 `lib` |
| 📁 `.turbo` |
| 📁 `node_modules` |
| 📄 `package.json` |
| 📄 `tsconfig.json` |
| 📄 `next.config.ts` |
| 📄 `.env.local` |
| 📄 `next-env.d.ts` |
| 📁 `__tests__` |
| 📄 `.env.example` |
| 📄 `.gitignore` |
| 📄 `env.ts` |
| 📄 `instrumentation.ts` |
| 📄 `liveblocks.config.ts` |
| 📄 `postcss.config.mjs` |
| 📄 `sentry.client.config.ts` |
| 📄 `tailwind.config.ts` |
| 📄 `vitest.config.ts` |

</details>

---

_****_















Let's check if there's a pages directory in the app application:

---

_****_

Could not resolve URI: Error: Unable to resolve nonexistent file '/Users/dmgpro/Desktop/lavel-t/apps/app/pages'

---

_****_

















Let's check the web app structure:

---

_****_

<details>
            <summary>Listed directory apps/web • **19** results</summary>
        
| Name |
|-------|
| 📁 `node_modules` |
| 📄 `package.json` |
| 📁 `.next` |
| 📄 `.env.local` |
| 📁 `app` |
| 📄 `middleware.ts` |
| 📄 `next-env.d.ts` |
| 📁 `.turbo` |
| 📁 `components` |
| 📁 `.well-known` |
| 📄 `.env.example` |
| 📄 `.gitignore` |
| 📄 `env.ts` |
| 📄 `instrumentation.ts` |
| 📄 `next.config.ts` |
| 📄 `postcss.config.mjs` |
| 📄 `tailwind.config.ts` |
| 📄 `tsconfig.json` |
| 📄 `vercel.json` |

</details>

---

_****_



















Let's check if there's a pages directory in the web application:

---

_****_

Could not resolve URI: Error: Unable to resolve nonexistent file '/Users/dmgpro/Desktop/lavel-t/apps/web/pages'

---

_****_





















Let's check the middleware files since they might be importing the server-only component:

---

_****_

Read file: apps/app/middleware.ts

---

_****_























Let's check the web middleware:

---

_****_

Read file: apps/web/middleware.ts

---

_****_



























Let's check the observability/instrumentation file that's being imported in the middleware:

---

_****_

Read file: packages/observability/instrumentation.ts

---

_****_





























Let's check the observability/error.ts file since it imports the analytics server module:

---

_****_

Read file: packages/observability/error.ts

---

_****_































Let's check the feature-flags/lib/create-flag.ts file since it also imports the analytics server module:

---

_****_

Read file: packages/feature-flags/lib/create-flag.ts

---

_****_



Based on my investigation, I've identified the issue. The error message is quite clear:

```
You're importing a component that needs "server-only". That only works in a Server Component which is not supported in the pages/ directory.
```

The problem is that you're using the `server-only` package in your `packages/analytics/posthog/server.ts` file, which is designed to ensure that the code only runs on the server. However, it seems that this file is being imported in a component that's being used in a Next.js pages directory (the older Pages Router) rather than the newer App Router.

Here's what's happening:

1. Your `packages/analytics/posthog/server.ts` file imports `server-only`, which is a Next.js package that ensures the code only runs on the server.
2. This file is being imported in several places, including:
   - `packages/observability/error.ts`
   - `packages/feature-flags/lib/create-flag.ts`
   - `apps/api/app/webhooks/stripe/route.ts`
   - `apps/api/app/webhooks/clerk/route.ts`

3. The error suggests that one of these imports is being used in a component that's rendered in a pages directory, which doesn't support Server Components.

To fix this issue, you have a few options:

1. **Create a separate client-side version** of the analytics functionality that doesn't use `server-only` for use in pages directory components.

2. **Move the component using this import to the App Router** (app directory) where Server Components are supported.

3. **Refactor the code** to avoid using `server-only` in components that need to be used in the pages directory.

Let's check if there are any pages directories in your project that might be importing this module indirectly:

---

_****_

```bash
find . -type d -name "pages" | grep -v "node_modules" | cat
```

```
dmgpro@Daniels-MacBook-Pro-2 lavel-t % find . -type d -name "pages" | grep -v "node_modules" | cat         f
ind . -type d -name "pages" | grep -v "node_modules" | cat
./apps/app/.next/server/pages
./apps/app/.next/static/chunks/pages
./apps/web/.next/server/pages
./apps/web/.next/static/chunks/pages
./apps/api/.next/server/pages
./apps/api/.next/static/chunks/pages
dmgpro@Daniels-MacBook-Pro-2 lavel-t %
```

---

_****_



The search results show that there are no actual pages directories in your source code, only in the `.next` build directories. This suggests that you might be using the App Router throughout your applications.

Let's check if there are any pages files that might be importing this module:

---

_****_

```bash
find . -path "*/pages/*.js" -o -path "*/pages/*.jsx" -o -path "*/pages/*.ts" -o -path "*/pages/*.tsx" | grep -v "node_modules" | grep -v ".next" | cat
```

```
dmgpro@Daniels-MacBook-Pro-2 lavel-t % 

```

---

_****_





No pages files were found. Let's check if there are any files in the project that might be importing the analytics server module and also importing components from the pages directory:

---

_****_

```bash
grep -r "from '@repo/analytics/posthog/server'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "node_modules" | grep -v ".next" | cat
```

```
<" . | grep -v "node_modules" | grep -v ".next" | cat
./packages/feature-flags/lib/create-flag.ts:import { analytics } from '@repo/analytics/posthog/server';
./packages/observability/error.ts:import { analytics } from '@repo/analytics/posthog/server';
./apps/api/app/webhooks/clerk/route.ts:import { analytics } from '@repo/analytics/posthog/server';
./apps/api/app/webhooks/stripe/route.ts:import { analytics } from '@repo/analytics/posthog/server';
dmgpro@Daniels-MacBook-Pro-2 lavel-t %
```

---

_****_





---

_**User**_

continue 



---

_**Assistant**_

Let's continue investigating the issue. The error message indicates that a component using `server-only` is being imported in a pages directory, but our search didn't find any direct imports in pages directories. Let's check if any of the modules that import the server analytics are themselves being imported in pages directories or client components.

Let's first check how the observability/error.ts module is being used:

---

_****_

<details>
            <summary>Grep search for "from.*observability/error" • **21** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/data-flow/server-side.mdx` | L63 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/data-flow/cross-cutting-concerns.mdx` | L21 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L3 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/contact/actions/contact.tsx` | L5 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L3 | `// import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/middleware.ts` | L48 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/caching.mdx` | L30 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L552 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L844 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/decisions/observability.mdx` | L62 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/design-system/lib/utils.ts` | Lundefined | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/with-auth.ts` | L3 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/components/error-boundary.tsx` | L3 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/monitoring-server.ts` | L4 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L212 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L259 | `- New version: Uses the `parseError` utility function from `@repo/observability/error` to handle errors` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-03-02_07-20-understanding-error-handling-in-code.md` | L416 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-07_15-15-multitenant-login-middleware-implementation-plan.md` | L96 | `import { parseError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L1093 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L2726 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L4073 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/decisions/observability.mdx` | L62 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/lib/query-client.ts` | L2 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/hooks/use-monitoring.ts` | L4 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/utils/monitoring-server.ts` | L4 | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/design-system/lib/utils.ts` | Lundefined | `import { captureError } from '@repo/observability/error';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/api/app/webhooks/stripe/route.ts` | L3 | `import { captureError } from '@repo/observability/error';` |

</details>

---

_****_



Now let's check how the feature-flags module is being used:

---

_****_

<details>
            <summary>Grep search for "from.*feature-flags" • **19** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/data-flow/cross-cutting-concerns.mdx` | L514 | `import { FeatureFlagContext } from '../context/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/env.ts` | L2 | `import { keys as flags } from '@repo/feature-flags/keys';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/next.config.ts` | L2 | `import { withToolbar } from '@repo/feature-flags/lib/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/guides/forms-guides.mdx` | L602 | `import { FeatureFlagContext } from '@/app/context/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/.well-known/vercel/flags/route.ts` | Lundefined | `import { getFlags } from '@repo/feature-flags/access';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/flags.mdx` | L223 | `import { evaluateFlag } from '@repo/feature-flags/evaluator';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/layout.tsx` | L7 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/%28home%29/page.tsx` | Lundefined | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/next.config.ts` | L1 | `import { withToolbar } from '@repo/feature-flags/lib/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/env.ts` | L5 | `import { keys as flags } from '@repo/feature-flags/keys';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L6 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/layout.tsx` | L3 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/.well-known/vercel/flags/route.ts` | Lundefined | `import { getFlags } from '@repo/feature-flags/access';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L812 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L1197 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-12_12-42-dashboard-component-analysis-and-architecture.md` | L2497 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-12_12-42-dashboard-component-analysis-and-architecture.md` | L2823 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L1363 | `import { useFeatureFlag } from '@repo/feature-flags/client';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-28_18-01-scalability-analysis-of-feature-architecture.md` | L3369 | `import { evaluateFlag } from '@repo/feature-flags/evaluator';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L167 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L262 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L539 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1242 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1267 | `*   `import { Toolbar } from '@repo/feature-flags/components/toolbar';`: Imports a `Toolbar` component, probably for feature flag management or debugging. This is likely a non-essential UI element. **Seems okay, not directly` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1337 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1407 | `*   `import { showBetaFeature } from '@repo/feature-flags';`: Imports `showBetaFeature` for feature flag logic. **Feature flag logic, seems okay.**` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1683 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-23_13-12-team-creation-form-improvement-plan.md` | L4655 | `import { Toolbar } from '@repo/feature-flags/components/toolbar';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L6 | `import { showBetaFeature } from '@repo/feature-flags';` |

</details>

---

_****_





Let's check for specific imports of the feature-flags/lib/create-flag module:

---

_****_

<details>
            <summary>Grep search for "from.*feature-flags/lib/create-flag" • **0** files</summary>
        
No results found
</details>

---

_****_







Let's check for imports of the feature-flags index file, which might be re-exporting the create-flag module:

---

_****_

Read file: packages/feature-flags/index.ts

---

_****_









Now let's check where the showBetaFeature flag is being used:

---

_****_

<details>
            <summary>Grep search for "showBetaFeature" • **8** files</summary>
        
| File | Line | Match |
|------|------|-------|
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/%28home%29/page.tsx` | Lundefined | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/web/app/%28home%29/page.tsx` | L20 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/flags.mdx` | L41 | `const showBetaFeature = evaluateFlag('beta-feature', {` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/docs/architecture/flags.mdx` | L72 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L6 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L91 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/packages/feature-flags/index.ts` | L2 | `export const showBetaFeature = createFlag('showBetaFeature');` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-12_12-42-dashboard-component-analysis-and-architecture.md` | L1354 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L812 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L858 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L1197 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-13_08-17-designing-user-id-management-in-multi-tenant-app.md` | L1243 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1337 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1375 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1407 | `*   `import { showBetaFeature } from '@repo/feature-flags';`: Imports `showBetaFeature` for feature flag logic. **Feature flag logic, seems okay.**` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1451 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1683 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/.specstory/history/2025-02-08_15-04-debugging-clerk-authentication-middleware-issues.md` | L1731 | `const betaFeature = await showBetaFeature();` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L6 | `import { showBetaFeature } from '@repo/feature-flags';` |
| `file:///Users/dmgpro/Desktop/lavel-t/apps/app/app/%28authenticated%29/layout.tsx` | L91 | `const betaFeature = await showBetaFeature();` |

</details>

---

_****_



---



---

