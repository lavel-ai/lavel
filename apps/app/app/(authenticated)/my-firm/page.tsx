// apps/app/app/(authenticated)/my-firm/page.tsx
import { Suspense } from 'react';
import { auth } from '@repo/auth/server';
import { getLawyers } from '../features/lawyers/actions/lawyer-actions';
import { getClients } from '../features/clients/actions/get-client-actions';
import { Header } from '@/app/(authenticated)/components/header';
import { MyFirmContent } from './my-firm-content';
import { getTeams } from '../features/teams/actions/team-actions';

export default async function MyFirmPage() {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>Please log in to view your firm details.</p>
      </div>
    );
  }

  // Fetch data using server actions
  const [teamsResult, lawyersResult, clientsResult] = await Promise.all([
    getTeams(),
    getLawyers(),
    getClients()
  ]);

  return (
    <>
      <Header pages={['Mi Despacho']} page="My Firm" />
      <div className="container mx-auto p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <MyFirmContent 
            initialTeams={teamsResult.status === 'success' ? teamsResult.data || [] : []}
            initialLawyers={lawyersResult.status === 'success' ? lawyersResult.data || [] : []}
            initialClients={clientsResult.status === 'success' ? clientsResult.data || [] : []}
          />
        </Suspense>
      </div>
    </>
  );
}