'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { getWagmiConfigInstance } from '@/lib/wallet';

// Create query client outside component to avoid recreating it
const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: ReactNode }) {
  // Lazy-load wagmi config only on client-side to avoid SSR issues
  const config = useMemo(() => {
    return getWagmiConfigInstance();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

