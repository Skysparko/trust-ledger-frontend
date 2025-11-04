"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { WalletProvider } from "@/components/wallet/WalletProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletProvider>{children}</WalletProvider>
    </Provider>
  );
}


