"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WalletProvider>
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          expand={true}
          duration={5000}
          gap={12}
          offset={16}
          toastOptions={{
            classNames: {
              toast: "toast-custom",
              title: "toast-title",
              description: "toast-description",
              actionButton: "toast-action-button",
              cancelButton: "toast-cancel-button",
              closeButton: "toast-close-button",
              error: "toast-error",
              success: "toast-success",
              warning: "toast-warning",
              info: "toast-info",
            },
          }}
        />
      </WalletProvider>
    </Provider>
  );
}


