import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import DashboardGrid from './components/dashboard/dashboard-grid';
import { getKPIOrder } from '@/app/actions/components/kpi-actions';
// import DashboardGrid from './components/dashboard/dashboard-grid';
// import { getKPIOrder } from '@/app/actions/components/kpi-actions';
// import { getTenantDbClientUtil } from '@/app/utils/tenant-db'; // Import the utility
// import { cases } from '@repo/database/src/tenant-app/schema'; // Example: Import your schema

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

  // Example of fetching data in a Server Component (replace with your actual query)
  // const tenantDb = await getTenantDbClientUtil();
  // const allCases = await tenantDb.select().from(cases);
  // console.log(allCases);

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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Pass KPI data and initial order to DashboardGrid */}
        <DashboardGrid kpis={orderedKPIs} />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
};

export default App;