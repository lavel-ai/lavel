//packages/design-system/index.ts
"use client";

import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';
import { ReactQueryProvider } from './providers/react-query';

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
            {children}
            <Toaster />
          </TooltipProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </ReactQueryProvider>
  </ThemeProvider>
);

