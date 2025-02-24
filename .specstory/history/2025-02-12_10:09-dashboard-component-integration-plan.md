## SpecStory

## Dashboard Component Integration Plan (2/12/2025, 10:09:40 AM)

_**User**_

I created this set of components using V0, that we now need to replciate for our app. @app we need to do the following: 
1. we need to first understand the design. 
2. understand the components and do a break down of the ones that we will reuse across our app. 
3. make a plan on what we need to incorporate following our rules data-flow.mdc 
4. desing the architecture of where we are gonna store the components, if we might reuse some of them.

This will be for our dashboard page @page.tsx 
Here is the project i created @lawyer-dashboard 


---

_**Assistant**_

Okay, let's break down the Lawyer Dashboard components, plan for integration into your main app, and consider reusability and data flow.

**1. Design Understanding**

The Lawyer Dashboard design is a clean, modern dashboard interface with the following key features:

*   **KPI Cards:**  Quick, glanceable metrics (Total Cases, Win Rate, etc.) with trend indicators.
*   **Draggable Cards:**  A grid of cards that can be rearranged using `react-beautiful-dnd`. This allows users to customize their dashboard layout.
*   **Notifications:**  A card displaying recent notifications with icons and timestamps.
*   **Active Tasks:**  A card listing tasks with priority badges and "Complete" buttons.
*   **Upcoming Events:**  Similar to Active Tasks, but focused on events.
*   **Case Status Graph:**  A bar chart (using `recharts`) showing the distribution of cases across different statuses.
*   **AI Insights (Placeholder):** A card reserved for future AI-powered recommendations.
*   **Recent Cases Table:** A table listing recent cases with key details and a "View" action.
*   **Dark/Light Mode Toggle:**  Uses `next-themes` for theme switching.
*   **Standard UI Components:** Leverages a custom UI library (likely built with Radix UI and Tailwind CSS) for elements like buttons, cards, dropdowns, alerts, etc.

**2. Component Breakdown and Reusability**

Here's a breakdown of the components, categorized by their potential for reuse in your main application:

*   **Highly Reusable (Generic UI Components):**  These should *definitely* go into your existing design system (`@repo/design-system`).  They are likely already present, but double-check for any missing pieces or inconsistencies.

    *   `components/ui/button.tsx`:  A versatile button component with variants (primary, secondary, destructive, outline, ghost, link) and sizes.
    *   `components/ui/card.tsx`:  A card component with header, title, content, and footer sections.  *Important: The `lawyer-dashboard` version is simpler than what you likely have.  You'll need to reconcile these.*
    *   `components/ui/dropdown-menu.tsx`:  A dropdown menu (likely based on Radix UI).
    *   `components/ui/alert.tsx`:  Alert messages with different variants.
    *   `components/ui/alert-dialog.tsx`:  A more complex alert with a confirmation dialog.
    *   `components/ui/avatar.tsx`:  Avatar component, likely already in your design system.
    *   `components/ui/badge.tsx`:  Small badges for displaying status, priority, etc.
    *   `components/ui/calendar.tsx`:  A date picker component.
    *   `components/ui/carousel.tsx`:  A carousel component (based on `embla-carousel-react`).
    *   `components/ui/chart.tsx`:  Wrappers and utilities for `recharts`. *This is a good candidate for inclusion in your design system, but needs careful consideration of how you want to handle charting across the app.*
    *   `components/ui/checkbox.tsx`
        *   `components/ui/collapsible.tsx`
        *   `components/ui/command.tsx`
        *   `components/ui/dialog.tsx`
        *   `components/ui/form.tsx`
        *   `components/ui/hover-card.tsx`
        *   `components/ui/input.tsx`
        *   `components/ui/label.tsx`
        *   `components/ui/popover.tsx`
        *   `components/ui/progress.tsx`
        *   `components/ui/radio-group.tsx`
        *   `components/ui/scroll-area.tsx`
        *   `components/ui/select.tsx`
        *   `components/ui/separator.tsx`
        *   `components/ui/sheet.tsx`
        *   `components/ui/skeleton.tsx`
        *   `components/ui/slider.tsx`
        *   `components/ui/switch.tsx`
        *   `components/ui/table.tsx`:  A basic table component.
        *   `components/ui/tabs.tsx`
        *   `components/ui/textarea.tsx`
        *   `components/ui/toast.tsx`
        *   `components/ui/toaster.tsx`
        *   `components/ui/tooltip.tsx`
        *   `components/ui/use-toast.tsx`
    *   `components/ui/breadcrumb.tsx`:  Breadcrumb navigation.
    *   `components/ui/aspect-ratio.tsx`:  Maintains aspect ratios for images/videos.
    *   `lib/utils.tsx`:  Likely contains the `cn` function for Tailwind class merging (confirm it's the same as yours).
    *   `components/mode-toggle.tsx`:  The dark/light mode switcher. *This should be part of your design system, and integrated with your theming solution.*
    *   `components/theme-provider.tsx`:  The theme provider using `next-themes`. *Integrate this with your existing theming setup.*

*   **Potentially Reusable (with modifications):**

    *   `components/animated-card.tsx`:  A card with hover/tap animations using Framer Motion.  This could be added to your design system as a variant of your base `Card` component.
    *   `components/draggable-card.tsx`:  The draggable card wrapper.  The drag-and-drop logic is specific to the dashboard, but the styling (with the grip icon) could be a reusable `Card` variant.

*   **Dashboard-Specific Components:**

    *   `components/notifications.tsx`:  Fetches and displays notifications.
    *   `components/active-tasks.tsx`:  Fetches and displays active tasks.
    *   `components/upcoming-events.tsx`:  Fetches and displays upcoming events.
    *   `components/case-status-graph.tsx`:  The `recharts` bar chart.
    *   `components/kpi-cards.tsx`:  Displays the KPI cards.
    *   `components/recent-cases-table.tsx`: Displays the recent cases table.
    *   `app/dashboard/page.tsx`:  The main dashboard page, orchestrating the layout and drag-and-drop functionality.

**3. Integration Plan and Data Flow**

Here's a plan, following the principles of `data-flow.mdc`:

1.  **UI Components:**
    *   Move all the "Highly Reusable" components into `@repo/design-system/components/ui`.  Ensure they are consistent with your existing components.  If there are conflicts (like with `Card`), resolve them by either merging functionality or creating variants.
    *   Add `animated-card.tsx` as a variant to your `Card` component in the design system.
    *   Consider adding a "draggable" variant to your `Card` component, incorporating the grip icon styling from `draggable-card.tsx`.

2.  **Dashboard Page (`app/(authenticated)/dashboard/page.tsx`):**

    *   Create a new route: `app/(authenticated)/dashboard/page.tsx`.
    *   Import the necessary UI components from `@repo/design-system`.
    *   Implement the drag-and-drop functionality using `react-beautiful-dnd`, mirroring the `lawyer-dashboard` example.

3.  **Data Fetching:**

    *   **Create Server Actions:**  For each data-driven component (Notifications, Active Tasks, Upcoming Events, Case Status Graph, KPI Cards, Recent Cases), create corresponding server actions in `app/actions`.  These actions will be responsible for:
        *   Authenticating the user (`auth()`).
        *   Retrieving the relevant data from the database (using your Prisma client, and tenant-specific queries as needed).
        *   Returning the data.
        *   Example:
            ```typescript:app/actions/dashboard.ts
            // app/actions/dashboard.ts
            'use server';

            import { auth } from '@repo/auth/server';
            import { getTenantDbClient } from '@/app/utils/tenant-db'; // Or your equivalent
            import { getAllCases } from '@repo/database/src/tenant-app/queries/cases-queries'; // Example
            import type { NextRequest } from 'next/server';

            export async function getDashboardData(request: NextRequest) {
              const { userId } = await auth();
              if (!userId) {
                throw new Error('Unauthorized');
              }

              const tenantDb = await getTenantDbClient(request);

              // Example: Fetch cases for KPI card
              const cases = await getAllCases(tenantDb);
              const totalCases = cases.length;
              const winRate = /* Calculate win rate */;

              // Fetch other data (notifications, tasks, events, etc.) similarly

              return {
                totalCases,
                winRate,
                // ... other data
              };
            }

            // Separate actions for specific components if needed:
            export async function getNotifications(request: NextRequest) { /* ... */ }
            export async function getActiveTasks(request: NextRequest) { /* ... */ }
            // ...
            ```

    *   **Use Hooks:**  In your dashboard-specific components (e.g., `Notifications`, `ActiveTasks`), use custom hooks (e.g., `useNotifications`, `useActiveTasks`) to fetch data using the server actions.  These hooks should:
        *   Call the appropriate server action.
        *   Handle loading and error states.
        *   Return the data.
        *   Example:
            ```typescript:hooks/useDashboardData.ts
            // hooks/useDashboardData.ts
            'use client';
            import { getDashboardData } from '@/app/actions/dashboard';
            import { useEffect, useState } from 'react';
            import { useSearchParams } from 'next/navigation';
            import type { NextRequest } from 'next/server';

            export function useDashboardData() {
              const [data, setData] = useState<any>(null); // Replace `any` with a proper type
              const [isLoading, setIsLoading] = useState(true);
              const [error, setError] = useState<Error | null>(null);
              const searchParams = useSearchParams();

              useEffect(() => {
                const fetchData = async () => {
                  try {
                    // You might need to construct a mock NextRequest object here
                    // since useSearchParams only gives you the parameters, not the full request.
                    const mockRequest: Partial<NextRequest> = {
                        nextUrl: {
                            searchParams: searchParams,
                            // ... other necessary properties, like headers if needed
                        }
                    };

                    const dashboardData = await getDashboardData(mockRequest as NextRequest);
                    setData(dashboardData);
                  } catch (err: any) {
                    setError(err);
                  } finally {
                    setIsLoading(false);
                  }
                };

                fetchData();
              }, [searchParams]);

              return { data, isLoading, error };
            }
            ```
            ```typescript:app/(authenticated)/components/notifications.tsx
            // app/(authenticated)/components/Notifications.tsx (updated)
            'use client';

            import { useNotifications } from '@/hooks/useNotifications'; // Your custom hook
            import { CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
            import { Bell } from 'lucide-react';
            import { motion } from 'framer-motion';

            export function Notifications() {
              const { data: notifications, isLoading, error } = useNotifications();

              if (isLoading) return <div>Loading notifications...</div>;
              if (error) return <div>Error: {error.message}</div>;
              if (!notifications) return <div>No notifications</div>

              return (
                <>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-4"
                        >
                          <Bell className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </>
              );
            }

            ```

4.  **Component Composition:**

    *   In `app/(authenticated)/dashboard/page.tsx`, use the data hooks to fetch the necessary data and pass it down to the individual components (Notifications, ActiveTasks, etc.) as props.

**4. Architecture and File Structure**

```
apps/app/
├── app/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   │   └── page.tsx  <- Main dashboard page
│   │   ├── components/
│   │   │   ├── notifications.tsx  <- Dashboard-specific components
│   │   │   ├── active-tasks.tsx
│   │   │   ├── upcoming-events.tsx
│   │   │   ├── case-status-graph.tsx
│   │   │   ├── kpi-cards.tsx
│   │   │   └── recent-cases-table.tsx
│   ├── actions/
│   │   └── dashboard.ts  <- Server actions for dashboard data
│   └── hooks/
│       ├── useDashboardData.ts
│       ├── useNotifications.ts   <- Custom hooks for fetching data
│       ├── useActiveTasks.ts
│       └── ...
└── ...

packages/
├── design-system/
│   └── components/
│       └── ui/
│           ├── button.tsx
│           ├── card.tsx      <- AnimatedCard variant added
│           ├── ... (all other reusable UI components)
└── ...
```

**Key Considerations:**

*   **Error Handling:** Implement robust error handling in your server actions and hooks. Display user-friendly error messages in the UI.
*   **Loading States:**  Use loading indicators (skeletons or spinners) while data is being fetched. The `useDashboardData` and component-specific hooks should manage loading states.
*   **Type Safety:**  Use TypeScript throughout to ensure type safety. Define interfaces for your data (notifications, tasks, cases, etc.).
*   **`useSearchParams` and Mock `NextRequest`:** Because you need the full `NextRequest` object for `getTenantDbClient`, and you're fetching data on the client-side with `useSearchParams`, you'll likely need to create a mock `NextRequest` object within your `useEffect` hook. This mock object should contain the necessary properties (like `nextUrl.searchParams`) that `getTenantDbClient` relies on. This is a workaround because `useSearchParams` doesn't provide the full request.
*   **Recharts Integration:** Decide how you want to handle charting across your application. You could create a dedicated charting library within your design system or keep it more localized. The `lawyer-dashboard`'s `chart.tsx` provides a good starting point.
* **Testing:** Ensure to write tests for your server actions, hooks, and components.

This detailed plan provides a solid foundation for integrating the Lawyer Dashboard components into your main application while adhering to best practices for reusability, data flow, and maintainability. Remember to adapt the code snippets to your specific database schema and data structures.


---



---

