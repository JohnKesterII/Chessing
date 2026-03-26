import { Crown } from "lucide-react";

import { CheckoutButton } from "@/components/forms/checkout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PLAN_COPY, PLAN_FEATURES } from "@/lib/constants/plans";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge>Billing</Badge>
          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-text">Free for play. Pro for deeper review.</h1>
          <p className="mt-4 text-lg text-muted">
            Subscriptions are managed through Stripe and mirrored to your Supabase profile with webhook verification.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="p-8">
            <div className="text-2xl font-semibold text-text">{PLAN_FEATURES.free.name}</div>
            <div className="mt-3 text-4xl font-semibold text-text">{PLAN_FEATURES.free.priceMonthly}</div>
            <div className="mt-6 space-y-3">
              {PLAN_COPY.free.map((feature) => (
                <div key={feature} className="rounded-2xl border border-line bg-surface2 px-4 py-3 text-sm text-muted">
                  {feature}
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-accent/30 p-8 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold text-text">{PLAN_FEATURES.pro.name}</div>
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <div className="mt-3 text-4xl font-semibold text-text">{PLAN_FEATURES.pro.priceMonthly}</div>
            <div className="mt-1 text-sm text-muted">or {PLAN_FEATURES.pro.priceYearly}/year</div>
            <div className="mt-6 space-y-3">
              {PLAN_COPY.pro.map((feature) => (
                <div key={feature} className="rounded-2xl border border-line bg-surface2 px-4 py-3 text-sm text-muted">
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CheckoutButton interval="monthly" />
              <CheckoutButton interval="yearly" />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
