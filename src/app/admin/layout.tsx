'use client';
import { AIProfileProvider } from '@/contexts/AIProfileContext';
import { AdSettingsProvider } from '@/contexts/AdSettingsContext';
import { AIMediaAssetsProvider } from '@/contexts/AIMediaAssetsContext';
import { GlobalStatusProvider } from '@/contexts/GlobalStatusContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AIProfileProvider>
      <AdSettingsProvider>
        <AIMediaAssetsProvider>
          <GlobalStatusProvider>
            {children}
          </GlobalStatusProvider>
        </AIMediaAssetsProvider>
      </AdSettingsProvider>
    </AIProfileProvider>
  );
}
