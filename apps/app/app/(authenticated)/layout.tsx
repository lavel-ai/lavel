// apps/app/app/(authenticated)/layout.tsx

import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
import { fetchUserOrganization } from '@repo/database/src/main-app/queries/organization-queries';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';
import { PageViewTracker } from '@repo/analytics';
/**
 * Properties for the AppLayout component.
 */
type AppLayoutProperties = {
  /** The child components to be rendered within the layout */
  readonly children: ReactNode;
};

/**
 * AppLayout is the main layout component for authenticated sections of the application.
 * It handles authentication, tenant routing, and provides various context providers
 * for features like notifications, sidebar management, and tenant database access.
 *
 * Key responsibilities:
 * 1. Authentication verification
 * 2. Domain-based tenant routing
 * 3. Provider context management
 *
 * Authentication Flow:
 * - Verifies user authentication status
 * - Redirects to sign-in if user is not authenticated
 * - Retrieves current user information
 *
 * Tenant Routing Logic:
 * - On main domain:
 *   - Looks up user's organization
 *   - Redirects to tenant subdomain if organization exists
 *   - Redirects to onboarding if no organization found
 * - On tenant subdomains:
 *   - Proceeds with normal rendering
 *
 * Provider Structure:
 * - NotificationsProvider: Handles user notifications
 * - SidebarProvider: Manages sidebar state and behavior
 *
 * @param {AppLayoutProperties} props - The component properties
 * @returns {Promise<JSX.Element>} The rendered layout component
 */
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
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ''
  );
  const isMainDomain =
    hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';

  if (isMainDomain) {
    // Only do organization lookup and redirect on main domain
    const orgInfo = await fetchUserOrganization(userId);
    if (orgInfo?.slug) {
      // Redirect to tenant subdomain
      const protocol = env.NEXT_PUBLIC_APP_URL?.startsWith('https')
        ? 'https'
        : 'http';
      const tenantUrl = `${protocol}://${orgInfo.slug}.${env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}`;
      redirect(tenantUrl);
    } else {
      // If no org found, redirect to onboarding
      redirect('/onboarding');
    }
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
          <PageViewTracker />
        </SidebarProvider>
      </NotificationsProvider>
  );
};

export default AppLayout;
