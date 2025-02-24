//packages/design-system/index.ts
"use client";

import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';
import { ReactQueryProvider } from './providers/react-query';
import { MobileProvider } from './providers/mobile';

type DesignSystemProviderProps = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProps) => (
  <ThemeProvider {...properties}>
    <ReactQueryProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <TooltipProvider>
            <MobileProvider>
              {children}
              <Toaster />
            </MobileProvider>
          </TooltipProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ReactQueryProvider>
  </ThemeProvider>
);

// Re-export hooks and components
export { useToast } from './hooks/use-toast';
export { useIsMobile } from './hooks/use-mobile';
