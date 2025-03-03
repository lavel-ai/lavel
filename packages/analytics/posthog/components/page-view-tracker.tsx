// packages/analytics/components/page-view-tracker.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAnalytics } from '../client';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = useAnalytics();
  
  useEffect(() => {
    if (pathname) {
      // Construct the full URL
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      
      // Capture page view
      posthog.capture('$pageview', {
        $current_url: url,
        page_title: document.title
      });
    }
  }, [pathname, searchParams, posthog]);
  
  return null; // This component doesn't render anything
}