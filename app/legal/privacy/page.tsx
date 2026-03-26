import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="space-y-6">
          <h1 className="font-display text-4xl font-semibold text-text">Privacy Policy</h1>
          <p className="text-sm leading-7 text-muted">
            KnightShift stores account, billing mirror, game, review, and settings data necessary to operate
            the service. Authentication is handled through Supabase Auth. Billing is processed by Stripe. We
            collect audit logs around auth and subscription events to protect the platform and support abuse
            investigation.
          </p>
          <p className="text-sm leading-7 text-muted">
            Profile information can be public where configured. Private settings, saved reviews, subscriptions,
            and session logs are protected with row-level security. We do not expose service keys or trust
            client-submitted plan state.
          </p>
        </Card>
      </section>
    </main>
  );
}
