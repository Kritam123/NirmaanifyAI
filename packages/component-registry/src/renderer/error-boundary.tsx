'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@nirmaanify/ui';

interface Props {
  nodeId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 space-y-2 text-xs my-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="font-bold">Render Error in Component</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
              className="h-6 text-[10px]"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            {this.state.error?.message || 'Unknown render failure'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
