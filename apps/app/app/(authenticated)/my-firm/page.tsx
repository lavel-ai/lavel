import { getTeams } from '../features/teams/actions/team-actions';
import { getLawyers } from '../features/lawyers/actions/lawyer-actions';
import { getClients } from '../features/clients/actions/get-client-actions';
import { Header } from '@/app/(authenticated)/components/header';
import { MyFirmContent } from './my-firm-content';

export default async function MyFirmPage() {
  // Fetch data using server actions
  const [teamsResult, lawyersResult, clientsResult] = await Promise.all([
    getTeams(),
    getLawyers(),
    getClients()
  ]);

  return (
    <>
      <Header pages={['Mi Despacho']} page="My Firm" />
      <MyFirmContent 
        initialTeams={teamsResult.data || []}
        initialLawyers={lawyersResult.data || []}
        initialClients={clientsResult.data || []}
      />
    </>
  );
}