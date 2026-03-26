import { SiteHeader } from "@/components/layout/site-header";
import { OtpAuthCard } from "@/components/forms/otp-auth-card";

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-start lg:px-8">
        <div className="max-w-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-accent2">Verification</div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-text">
            Confirm your access and finish account setup.
          </h1>
          <p className="mt-6 text-lg text-muted">
            Use this page for email OTP, phone OTP, and confirmation callback troubleshooting.
          </p>
          {error ? <div className="mt-6 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{decodeURIComponent(error)}</div> : null}
        </div>
        <OtpAuthCard />
      </section>
    </main>
  );
}
