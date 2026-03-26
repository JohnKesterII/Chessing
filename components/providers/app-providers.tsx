"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster
        theme="dark"
        richColors
        toastOptions={{
          classNames: {
            toast: "!border-line !bg-surface !text-text"
          }
        }}
      />
    </QueryProvider>
  );
}
