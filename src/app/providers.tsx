"use client";

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { AdSettingsProvider } from '@/contexts/AdSettingsContext';
import { AIProfileProvider } from '@/contexts/AIProfileContext';
import { GlobalStatusProvider } from '@/contexts/GlobalStatusContext';
import { AIMediaAssetsProvider } from '@/contexts/AIMediaAssetsContext';

// const queryClient = new QueryClient(); // Example if needed

export function Providers({ children }: { children: React.ReactNode }) {
  // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>; // Example
  return (
    <>
      <AdSettingsProvider>
        <AIProfileProvider>
          <GlobalStatusProvider>
            <AIMediaAssetsProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </AIMediaAssetsProvider>
          </GlobalStatusProvider>
        </AIProfileProvider>
      </AdSettingsProvider>
    </>
  );
}