// // apps/app/app/(authenticated)/my-firm/page.tsx
// import { getTeams } from '../features/teams/actions/team-actions';
// import { getLawyers } from '../features/lawyers/actions/lawyer-actions';
// import { getClients } from '../features/clients/actions/get-client-actions';
// import { getDepartments } from '../features/department/actions/get-departments';
// import { Header } from '@/app/(authenticated)/components/header';
// import { MyFirmContent } from './my-firm-content';

// export default async function MyFirmPage() {
//   // Fetch data using server actions
//   const [teamsResult, lawyersResult, clientsResult, departmentsResult] = await Promise.all([
//     getTeams(),
//     getLawyers(),
//     getClients(),
//     getDepartments()
//   ]);

//   return (
//     <>
//       <Header pages={['Mi Despacho']} page="My Firm" />
//       <MyFirmContent 
//         initialTeams={teamsResult.data || []}
//         initialLawyers={lawyersResult.data || []}
//         initialClients={clientsResult.data || []}
//         initialDepartments={departmentsResult.data || []}
//       />
//     </>
//   );
// }