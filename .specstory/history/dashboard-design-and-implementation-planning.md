## SpecStory

## Dashboard Design and Implementation Planning (2/17/2025, 3:42:33 PM)

_**User**_

I want to create a dashboard where users will be able to visualize information as soon as they log in. 

this dashboard will contain information from (i will mention them and first we will plan what we need to do): 

top area
1. Total amount of cases type advisory  
2. Total amount of trials type litigation
3. total amount of hours worked in the week
Bottom 
4. Tasks: Overdue tasks and next tasks
5. Next events

## Functionalities of the components
- users will be able to drag the components, the location has to persist we have this table that we created @kpi-order-schema.ts 
- here are some guidelines for the data flow @data-flow.mdc 
- we might need to use a bento layout not sure about this need advice here. 
- we have this component we created lets check if it works @base-kpi.tsx 

Lets first desing and plan so later on we can implemenet

---

_**Assistant**_

Okay, let's design and plan the dashboard implementation, step by step. We'll address the error you mentioned, clarify the requirements, and then outline the architecture and implementation plan.

**1. Understanding the Requirements and Addressing Potential Issues**

*   **KPIs (Top Area):**
    *   Advisory Cases Count:  We'll fetch the total number of cases with `type = 'advisory'`.
    *   Litigation Cases Count: We'll fetch the total number of cases with `type = 'litigation'`.
    *   Weekly Hours Worked: We'll sum the `duration` of time entries within the current week.
*   **Tasks (Bottom Area):**
    *   Overdue Tasks: Fetch tasks where `dueDate` is in the past and `completed` is false.
    *   Next Tasks: Fetch tasks where `dueDate` is in the future, ordered by `dueDate` ascending, and `completed` is false.  We'll likely limit this to a reasonable number (e.g., the next 5 tasks).
*   **Events (Bottom Area):**
    *   Next Events: Fetch events where `startDate` is in the future, ordered by `startDate` ascending. Again, we'll limit this.
*   **Draggability and Persistence:**
    *   We'll use a drag-and-drop library (likely `dnd-kit`, as it's already in your codebase).
    *   We'll use the `kpi_order` table to store the order of the components.  The `kpiId` will correspond to an identifier for each KPI/component (e.g., "advisory-cases", "litigation-cases", "weekly-hours", "tasks", "events"). The `userId` will link the order to the specific user.
*   **Bento Layout vs. Grid:**
    *   **Bento Layout:** A Bento layout is a grid-based layout where components can span multiple rows and columns, creating a more visually diverse and less rigid structure.  This is good for dashboards with varying content sizes and visual importance.
    *   **Simple Grid:** A simple grid has fixed rows and columns.  This is easier to implement but less flexible.
    *   **Recommendation:** Given the requirement for draggability and the different types of content (KPIs, tasks, events), a **grid layout with `dnd-kit` is the most suitable approach.**  `dnd-kit` provides excellent support for sortable grids, and we can easily persist the order.  A full Bento layout (with variable spanning) would add significant complexity for minimal gain in this specific scenario. We'll use a standard grid layout where each component occupies one grid cell.

*   **`BaseKPI` Component:** The provided `BaseKPI` component is almost perfect. The key change is to remove `"use client"` to make it a Server Component, which aligns with our data-fetching rules. We also ensured that the `icon` prop is handled correctly by renaming it to `Icon` and rendering it as a component.

**2. Architecture and Implementation Plan**

Here's a detailed plan, broken down by component and data flow:

**2.1. Folder Structure (Confirmation)**

```
apps/app/
├── app/
│   ├── (authenticated)/
│   │   ├── page.tsx          (Dashboard page - Server Component)
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── advisory-cases-kpi.tsx   (Server Component)
│   │   │   │   ├── litigation-cases-kpi.tsx  (Server Component)
│   │   │   │   ├── weekly-time-kpi.tsx     (Server Component)
│   │   │   │   ├── tasks-kpi.tsx           (Server Component)
│   │   │   │   ├── events-kpi.tsx          (Server Component)
│   │   │   │   └── dashboard-grid.tsx      (Client Component - Handles DND)
│   │   │   └── shared/
│   │   │       └── base-kpi.tsx            (Server Component)
│   │   ├── actions/
│   │   │   ├── cases-actions.ts
│   │   │   ├── time-entries-actions.ts
│   │   │   ├── tasks-actions.ts
│   │   │   ├── events-actions.ts
│   │   │   └── components/
│   │   │       └── kpi-actions.ts  (For updating KPI order)
│   ├── api/
│   │   ├── ... (API routes for each action)
└── packages/
    └── database/
        └── src/
            └── tenant-app/
                ├── queries/
                │   ├── cases-queries.ts
                │   ├── time-entries-queries.ts
                │   ├── tasks-queries.ts
                │   └── events-queries.ts
                └── schema/
                    ├── ...
                    └── kpi-order-schema.ts
```

**2.2. Data Flow (Detailed)**

*   **Advisory Cases KPI:**
    1.  **`AdvisoryCasesKPI` (Server Component):**
        *   Calls `getAdvisoryCasesKPI` (Server Action).
    2.  **`getAdvisoryCasesKPI` (Server Action):**
        *   Gets `tenantDb` using `getTenantDbClientUtil()`.
        *   Calls `getAdvisoryCasesCount` (query function).
        *   Returns the count.
    3.  **`getAdvisoryCasesCount` (Query Function):**
        *   Takes `tenantDb` as input.
        *   Queries the `cases` table: `SELECT COUNT(*) FROM cases WHERE type = 'advisory' AND is_active = TRUE`.
        *   Returns the count.
    4.  **`AdvisoryCasesKPI`:**
        *   Receives the count and passes it to `BaseKPI`.

*   **Litigation Cases KPI:** (Same pattern as Advisory Cases, but with `type = 'litigation'`)

*   **Weekly Time KPI:**
    1.  **`WeeklyTimeKPI` (Server Component):**
        *   Calls `getWeeklyTimeEntriesKPI` (Server Action), passing the `userId`.
    2.  **`getWeeklyTimeEntriesKPI` (Server Action):**
        *   Gets `tenantDb` using `getTenantDbClientUtil()`.
        *   Calls `getWeeklyTimeEntriesForUser` (query function), passing `tenantDb` and `userId`.
        *   Returns the total hours.
    3.  **`getWeeklyTimeEntriesForUser` (Query Function):**
        *   Takes `tenantDb` and `userId` as input.
        *   Queries the `time_entries` table:
            ```sql
            SELECT SUM(duration)
            FROM time_entries
            WHERE user_id = $1
            AND start_time >= date_trunc('week', CURRENT_DATE)
            AND start_time < date_trunc('week', CURRENT_DATE) + interval '1 week';
            ```
        *   Returns the total duration (sum).
    4.  **`WeeklyTimeKPI`:**
        *   Receives the total hours and passes it to `BaseKPI`.

*   **Tasks KPI:**
    1.  **`TasksKPI` (Server Component):**
        *   Calls `getTasksKPI` (Server Action), passing the `userId`.
    2.  **`getTasksKPI` (Server Action):**
        *   Gets `tenantDb`.
        *   Calls `getOverdueTasks` and `getNextTasks` (query functions).
        *   Returns the tasks.
    3.  **`getOverdueTasks` and `getNextTasks` (Query Functions):**
        *   Query the `tasks` table with appropriate `WHERE` clauses (see requirements above).
    4.  **`TasksKPI`:**
        *   Receives the tasks and renders them.

*   **Events KPI:** (Similar pattern to Tasks KPI)

*   **Dashboard Grid (Drag-and-Drop):**
    1.  **`DashboardGrid` (Client Component):**
        *   Receives the initial KPI order and data as props from `page.tsx`.
        *   Uses `dnd-kit` to handle drag-and-drop.
        *   On drag end:
            *   Updates the local state with the new order.
            *   Calls `updateKPIOrder` (Server Action) to persist the order.
    2.  **`updateKPIOrder` (Server Action):**
        *   Gets `tenantDb`.
        *   Updates the `kpi_order` table with the new order for the given user.  This will likely involve deleting existing entries for the user and inserting the new ones.
    3. **`page.tsx` (Server Component):**
        *   Fetches the initial KPI order using `getKPIOrder` (Server Action).
        *   Combines the order with the KPI data (component, title, etc.).
        *   Passes the ordered KPI data to `DashboardGrid`.

**2.3. Code Implementation (High-Level)**

1.  **Create Query Functions:** Implement the query functions in `@repo/database` for each KPI and data element (cases, time entries, tasks, events).
2.  **Create Server Actions:** Implement the Server Actions in `app/actions`.
3.  **Create KPI Components:** Implement the individual KPI components (e.g., `AdvisoryCasesKPI`, `LitigationCasesKPI`, etc.). These will be Server Components.
4.  **Create `DashboardGrid`:** Implement the `DashboardGrid` component (Client Component) to handle drag-and-drop using `dnd-kit`.
5.  **Update `page.tsx`:** Fetch the initial KPI order and render the `DashboardGrid` with the ordered KPI data.

**3. Step-by-Step Implementation (Starting Point)**

Let's start with the `AdvisoryCasesKPI` and `LitigationCasesKPI` to demonstrate the complete flow.

**3.1. Query Functions**

```typescript:packages/database/src/tenant-app/queries/cases-queries.ts
// packages/database/src/tenant-app/queries/cases-queries.ts
import { and, eq, sql } from 'drizzle-orm';
import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { cases } from '../../schema/cases-schema'; // Import your cases schema
import { combinedSchema } from '../../schema';

export async function getAdvisoryCasesCount(
  tenantDb: PostgresJsDatabase<typeof combinedSchema>,
): Promise<number> {
  const result = await tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(
      and(
        eq(cases.type, 'advisory'),
        eq(cases.isActive, true), // Assuming you have an isActive field
      ),
    )
    .execute();

  return result[0].count;
}

export async function getLitigationCasesCount(
    tenantDb: PostgresJsDatabase<typeof combinedSchema>,
  ): Promise<number> {
    const result = await tenantDb
      .select({ count: sql<number>`count(*)` })
      .from(cases)
      .where(
        and(
          eq(cases.type, 'litigation'),
          eq(cases.isActive, true), // Assuming you have an isActive field
        ),
      )
      .execute();

    return result[0].count;
  }

```

**3.2. Server Actions**

```typescript:apps/app/app/actions/cases/cases-actions.ts
// apps/app/app/actions/cases/cases-actions.ts
'use server';

import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
import {
  getAdvisoryCasesCount,
  getLitigationCasesCount,
} from '@repo/database/src/tenant-app/queries/cases-queries';
import { auth } from '@repo/auth/server';


export async function getAdvisoryCasesKPI() {
  try {
    const { userId } = await auth();
    if (!userId) {
        return {
            status: 'error',
            message: 'Unauthorized',
        }
    }
    const tenantDb = await getTenantDbClientUtil();
    const count = await getAdvisoryCasesCount(tenantDb);
    return {
      status: 'success',
      data: { count },
      message: 'Advisory cases count retrieved successfully',
    };
  } catch (error) {
    console.error('Error in getAdvisoryCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get advisory cases count',
    };
  }
}

export async function getLitigationCasesKPI() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                status: 'error',
                message: 'Unauthorized',
            }
        }
      const tenantDb = await getTenantDbClientUtil();
      const count = await getLitigationCasesCount(tenantDb);
      return { status: 'success', message: 'Litigation cases count retrieved', data: { count } };
    } catch (error) {
      console.error('Error in getLitigationCasesKPI:', error);
      return { status: 'error', message: 'Failed to get litigation cases count' };
    }
  }
```

**3.3. KPI Components**

```typescript:apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
import { Scale } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getAdvisoryCasesKPI } from '@/app/actions/cases/cases-actions';

const AdvisoryCasesKPI = async () => {
  const { data, status, message } = await getAdvisoryCasesKPI();
  const totalCases = data?.count ?? 0;
  const error = status === 'error' ? message : undefined;

  return (
    <BaseKPI
      title="Advisory Cases"
      icon={Scale}
      value={totalCases}
      isLoading={status !== 'error' && !data}
      error={error}
    />
  );
};

export default AdvisoryCasesKPI;
```

```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { Gavel } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getLitigationCasesKPI } from '@/app/actions/cases/cases-actions';

const LitigationCasesKPI = async () => {
  const { data, status, message } = await getLitigationCasesKPI();
  const totalCases = data?.count ?? 0;
  const error = status === 'error' ? message : undefined;

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      value={totalCases}
      isLoading={status !== 'error' && !data}
      error={error}
    />
  );
};

export default LitigationCasesKPI;
```

**3.4. Dashboard Grid (dnd-kit)**

```typescript:apps/app/app/(authenticated)/components/dashboard/dashboard-grid.tsx
// apps/app/app/(authenticated)/components/dashboard/dashboard-grid.tsx
'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { updateKPIOrder } from '@/app/actions/components/kpi-actions'; // Import the Server Action
import LitigationCasesKPI from "./litigation-cases-kpi"; // Import the KPI components
import AdvisoryCasesKPI from "./advisory-cases-kpi";
import { setComponentSettings, getAllComponentSettings, deleteComponentSettings } from "@/app/actions/component-settings-actions";
import { v4 as uuidv4 } from 'uuid';

type KPI = {
  id: string;
  component: string;
  title: string;
  order: number;
};

type Props = {
  kpis: KPI[];
};

const SortableKPI = ({ kpi }: { kpi: KPI }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

    // Add an instanceId prop
    const [instanceId, setInstanceId] = useState<string>("");

    // Generate a unique instance ID when the component mounts
    useEffect(() => {
        setInstanceId(uuidv4());
    }, []);

  const renderKPIComponent = () => {
    switch (kpi.component) {
      case "LitigationCasesKPI":
        return <LitigationCasesKPI instanceId={instanceId}/>; // Pass instanceId
      case "AdvisoryCasesKPI":
        return <AdvisoryCasesKPI instanceId={instanceId}/>; // Pass instanceId
      // Add other cases for other KPIs
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab"
    >
      {renderKPIComponent()}
    </div>
  );
};

const DashboardGrid = ({ kpis: initialKPIs }: Props) => {
  const [kpis, setKPIs] = useState(initialKPIs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px before dragging starts
      },
    })
  );

    useEffect(() => {
        setKPIs(initialKPIs);
    }, [initialKPIs]);


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setKPIs((kpis) => {
        const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
        const newIndex = kpis.findIndex((kpi) => kpi.id === over?.id);
        return arrayMove(kpis, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Update local state (already done in handleDragOver)

      // Persist the new order to the database
      const newOrder = kpis.map((kpi, index) => ({
        kpiId: kpi.id,
        order: index,
      }));
      await updateKPIOrder(newOrder); // Call the Server Action
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={kpis.map((kpi) => kpi.id)}
        strategy={sortableKeyboardCoordinates}
      >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <SortableKPI key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-4 rounded-md shadow-lg">
            {/* You might want to render a preview of the active KPI here */}
            {kpis.find(kpi=> kpi.id === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardGrid;
```

**3.5. Server Action for Updating KPI Order**

```typescript:apps/app/app/actions/components/kpi-actions.ts
// apps/app/app/actions/components/kpi-actions.ts
'use server';

import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
import { kpiOrder } from '@repo/database/src/tenant-app/schema/kpi-order-schema';
import { auth } from '@repo/auth/server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateKPIOrder(newOrder: { kpiId: string; order: number }[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const tenantDb = await getTenantDbClientUtil();

  try {
    // Start a transaction
    await tenantDb.transaction(async (tx) => {
        // First, delete existing order entries for the user
        await tx.delete(kpiOrder).where(eq(kpiOrder.userId, userId));

        // Then, insert the new order entries
        for (const entry of newOrder) {
            await tx.insert(kpiOrder).values({
            userId: userId,
            kpiId: entry.kpiId,
            order: entry.order,
            });
        }
    });

    revalidatePath('/(authenticated)'); // Revalidate the dashboard page

    return { status: 'success', message: 'KPI order updated successfully' };
  } catch (error) {
    console.error('Error updating KPI order:', error);
    return { status: 'error', message: 'Failed to update KPI order' };
  }
}

export async function getKPIOrder() {
    const { userId } = await auth();
    if (!userId) {
      return []; // Return an empty array if not authenticated
    }

    const tenantDb = await getTenantDbClientUtil();

    try {
      const order = await tenantDb
        .select()
        .from(kpiOrder)
        .where(eq(kpiOrder.userId, userId))
        .orderBy(kpiOrder.order);

      return order;
    } catch (error) {
      console.error('Error fetching KPI order:', error);
      return []; // Return an empty array on error
    }
  }
```

**3.6. Update `page.tsx`**

```typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import { TestUserId } from './components/test-user-id';
import { getKPIOrder } from '../actions/components/kpi-actions';
import DashboardGrid from './components/dashboard/dashboard-grid';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  // Fetch initial KPI order
  const initialKPIOrder = await getKPIOrder();

  // Define KPI data (including IDs and initial order)
  const kpis = [
    { id: 'litigation-cases', component: 'LitigationCasesKPI', title: 'Litigation Cases' },
    { id: 'advisory-cases', component: 'AdvisoryCasesKPI', title: 'Advisory Cases' },
    // Add other KPIs here
  ];

    // Combine initial order from the database with the KPI data
    const orderedKPIs = kpis.map(kpi => {
        const orderEntry = initialKPIOrder.find(entry => entry.kpiId === kpi.id);
        return {
            ...kpi,
            order: orderEntry ? orderEntry.order : Infinity, // Default to end if not found
        };
    }).sort((a, b) => a.order - b.order); // Sort by order


  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <TestUserId />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Pass KPI data and initial order to DashboardGrid */}
        <DashboardGrid kpis={orderedKPIs} />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
};

export default App;
```

This comprehensive setup covers the core functionality of your dashboard: fetching data for KPIs, displaying them, and allowing users to reorder them with persistent storage.  You can now extend this pattern to add the `WeeklyTimeKPI`, `TasksKPI`, and `EventsKPI`. Remember to create the necessary query functions, server actions, and components for each.


---

_**User**_

For now we need to simplify we will make our components static no need to drag

---

_**Assistant**_



---



---

