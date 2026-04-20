'use client';

import React, { ReactNode, ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-red-200 dark:border-red-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500">
            <CardHeader className="bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle 
                  className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" 
                  aria-hidden="true"
                />
                <CardTitle 
                  id="error-title"
                  className="text-red-600 dark:text-red-400"
                >
                  Something went wrong
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent 
              className="pt-6 space-y-4"
              role="alert"
              aria-labelledby="error-title"
              aria-describedby="error-message"
            >
              <div 
                id="error-message"
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-700 dark:text-red-300 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={this.resetError}
                  className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label="Try again to recover from error"
                >
                  Try again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  aria-label="Go to home page"
                >
                  Go home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
