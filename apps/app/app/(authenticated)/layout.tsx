// apps/app/app/(authenticated)/layout.tsx

import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
import { fetchUserOrganization } from '@repo/database/src/main-app/queries/organization-queries';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';


type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  if (!user) {
    return redirectToSignIn();
  }


  // Get hostname to determine if we're on main domain
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '');
    const isMainDomain = hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';


  if (isMainDomain) {
    // Only do organization lookup and redirect on main domain
    const orgInfo = await fetchUserOrganization(userId);

    if (orgInfo?.slug) {
      // Redirect to tenant subdomain
        const protocol = env.NEXT_PUBLIC_APP_URL?.startsWith('https') ? 'https' : 'http';
        const tenantUrl = `${protocol}://${orgInfo.slug}.${env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}`;
        console.log("Redirecting to:", tenantUrl); //  Log for debugging
        redirect(tenantUrl);
    } else {
      // If no org found, could redirect to onboarding or show error
      console.log("No organization found, redirecting to /onboarding"); // Log for debugging
      redirect('/onboarding');  // You'll need to create this route
    }
  }else {
    console.log("NOT on main domain"); // Log when NOT on main domain
  }
    const betaFeature = await showBetaFeature();


  return (
    <NotificationsProvider userId={user.id}>
      <SidebarProvider>
        <GlobalSidebar>
           {betaFeature && (
            <div className="m-4 rounded-full bg-success p-1.5 text-center text-sm text-success-foreground">
              Beta feature now available
            </div>
          )}
          {children}
        </GlobalSidebar>
        <PostHogIdentifier />
      </SidebarProvider>
    </NotificationsProvider>
  );
};

export default AppLayout;