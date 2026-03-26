import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="space-y-6">
          <h1 className="font-display text-4xl font-semibold text-text">Terms of Service</h1>
          <p className="text-sm leading-7 text-muted">
            You are responsible for account security, lawful use of the platform, and any content you submit.
            Paid access renews according to the Stripe subscription you select unless cancelled. We may limit
            or suspend access in response to abuse, fraud, or platform risk.
          </p>
          <p className="text-sm leading-7 text-muted">
            KnightShift is provided without guarantee of uninterrupted service. Analysis, bot play, and review
            tooling are informational features and do not create a professional coaching relationship.
          </p>
        </Card>
      </section>
    </main>
  );
}
