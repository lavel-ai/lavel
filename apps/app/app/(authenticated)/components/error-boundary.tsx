// app/components/error-boundary.tsx
'use client';
import { Component, ReactNode } from 'react';
import { parseError } from '@repo/observability/error';
import { useAnalytics } from '@repo/analytics/posthog/client';

interface ErrorBoundaryProps {
  componentName: string;
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error in observability system
    parseError(error);
    
    // Try to track in analytics
    try {
      const analytics = useAnalytics();
      analytics.capture('error_boundary_triggered', {
        component: this.props.componentName,
        error_message: error.message,
        error_type: error.name
      });
    } catch (analyticsError) {
      // Silently fail
      console.error('Failed to track error in analytics', analyticsError);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? 
        this.props.fallback(this.state.error as Error) : 
        (
          <div className="p-6 bg-red-50 text-red-700 rounded">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="mt-2">{this.state.error?.message}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        );
    }

    return this.props.children;
  }
}