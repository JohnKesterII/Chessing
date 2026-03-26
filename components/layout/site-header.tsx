import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/play", label: "Play" },
  { href: "/analysis", label: "Analysis" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted transition hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted transition hover:text-text">
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "primary", size: "md" }))}>
            Create account
          </Link>
        </div>
      </div>
    </header>
  );
}
