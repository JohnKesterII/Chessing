import { SiteHeader } from "@/components/layout/site-header";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-accent">Account system</div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-text">
            Create an account built for play, analysis, and paid upgrades.
          </h1>
          <p className="mt-6 text-lg text-muted">
            Email verification, phone OTP, linked social providers, and session-safe billing all start here.
          </p>
        </div>
        <SignupForm />
      </section>
    </main>
  );
}
