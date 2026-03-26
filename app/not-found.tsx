import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <Card className="text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-accent2">404</div>
          <h1 className="mt-4 font-display text-5xl font-semibold text-text">Position not found</h1>
          <p className="mt-4 text-sm text-muted">
            The page, game, or profile you requested does not exist or is not visible with your current access.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-8 inline-flex")}>
            Return home
          </Link>
        </Card>
      </section>
    </main>
  );
}
