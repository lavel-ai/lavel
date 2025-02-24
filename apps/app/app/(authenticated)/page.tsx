import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import { TestUserId } from './components/test-user-id';


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
        {/* Render KPI components directly */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">

          {/* <CaseForm /> */}
          {/* Add other KPI components here as you create them */}
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
};

export default App;