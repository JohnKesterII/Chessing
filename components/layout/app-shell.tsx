import type { ReactNode } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanName } from "@/lib/constants/plans";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/play", label: "Play" },
  { href: "/bot", label: "Bot" },
  { href: "/analysis", label: "Analysis" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({
  children,
  username,
  plan
}: {
  children: ReactNode;
  username?: string | null;
  plan: PlanName;
}) {
  return (
    <main className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-muted transition hover:text-text">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {plan === "pro" ? (
              <Badge className="border-accent/30 bg-accent/10 text-accent">
                <Crown className="mr-1 h-3 w-3" />
                Pro
              </Badge>
            ) : null}
            {username ? (
              <Link href={`/profile/${username}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                @{username}
              </Link>
            ) : (
              <Link href="/login" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
