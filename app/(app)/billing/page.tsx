import Link from "next/link";

import { PortalButton } from "@/components/forms/portal-button";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export default async function BillingPage() {
  const context = await requireUser();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="text-2xl font-semibold text-text">Billing</div>
        <div className="mt-3 text-sm text-muted">
          Plan: <span className="text-text">{context.subscription?.plan ?? "free"}</span>
        </div>
        <div className="mt-2 text-sm text-muted">
          Status: <span className="text-text">{context.subscription?.status ?? "inactive"}</span>
        </div>
        <div className="mt-2 text-sm text-muted">
          Renewal: <span className="text-text">{context.subscription?.current_period_end ?? "N/A"}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/pricing" className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
            Upgrade or change plan
          </Link>
          <PortalButton />
        </div>
      </Card>
      <Card>
        <div className="text-2xl font-semibold text-text">Plan enforcement</div>
        <div className="mt-3 text-sm leading-7 text-muted">
          Premium access is derived from the server-synced subscription record, not from client flags. Stripe
          webhooks update the `subscriptions` table and the app reads plan status from there before enabling
          deeper analysis or review quotas.
        </div>
      </Card>
    </div>
  );
}
