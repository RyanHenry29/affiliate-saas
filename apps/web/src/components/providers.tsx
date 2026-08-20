"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SWRConfig
        value={{
          dedupingInterval: 10_000,
          focusThrottleInterval: 15_000,
          errorRetryCount: 2,
          errorRetryInterval: 4_000,
          keepPreviousData: true,
          revalidateOnFocus: false,
        }}
      >
        {children}
      </SWRConfig>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(18 21 26)",
            border: "1px solid rgb(42 47 55)",
            color: "rgb(231 233 236)",
          },
          classNames: {
            error: "text-destructive",
            success: "text-success",
          },
        }}
      />
    </AuthProvider>
  );
}