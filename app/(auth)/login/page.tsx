import { SiteHeader } from "@/components/layout/site-header";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="max-w-xl">
          <div className="text-sm uppercase tracking-[0.2em] text-accent2">Secure access</div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-text">
            Sign in to keep your games, reviews, and billing in one place.
          </h1>
          <p className="mt-6 text-lg text-muted">
            KnightShift uses Supabase Auth with password, OTP, Google, and Apple entry points.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
