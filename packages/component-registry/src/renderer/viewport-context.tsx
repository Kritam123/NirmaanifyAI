import React, { createContext, useContext } from 'react';
import { ViewportMode } from '@nirmaanify/types';

export interface ViewportContextValue {
  viewport: ViewportMode;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const defaultViewportContext: ViewportContextValue = {
  viewport: 'desktop',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
};

export const ViewportContext = createContext<ViewportContextValue>(defaultViewportContext);

export function ViewportProvider({
  viewport = 'desktop',
  children,
}: {
  viewport?: ViewportMode;
  children?: React.ReactNode;
}) {
  const value: ViewportContextValue = {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
  };

  return (
    <ViewportContext.Provider value={value}>
      {children}
    </ViewportContext.Provider>
  );
}

export function useViewport(): ViewportContextValue {
  return useContext(ViewportContext);
}
