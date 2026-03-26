import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserContext } from "@/lib/auth/session";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const context = await getCurrentUserContext();

  return (
    <AppShell username={context.profile?.username} plan={context.plan}>
      {children}
    </AppShell>
  );
}
