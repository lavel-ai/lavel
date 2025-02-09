'use client';

import { useUser } from '@clerk/nextjs';

export const ClerkContextTest = () => {
  const { user, isSignedIn, isLoading } = useUser();
  console.log(user)
  console.log(isSignedIn)

  if (isLoading) {
    return <p>Loading Clerk context...</p>;
  }

  if (isSignedIn) {
    return <p>Clerk context is working in root layout. User ID: {user?.id}</p>;
  }

  return <p>Clerk context is working in root layout, but user is not signed in (as expected here).</p>;
}; 