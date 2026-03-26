import Link from "next/link";
import { ArrowRight, Bot, Crown, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLAN_COPY } from "@/lib/constants/plans";
import { BRAND } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "Play with focus",
    body: "Board-first sessions for self-play and engine sparring without clutter."
  },
  {
    title: "Analyze deeply",
    body: "Stockfish-backed candidate lines, evaluation tracking, move tree review, and quota-aware caching."
  },
  {
    title: "Upgrade cleanly",
    body: "Stripe-backed subscriptions sync directly into Supabase and never trust client plan state."
  }
];

const pillars = [
  { icon: Sparkles, title: "Premium dark interface", copy: "Bold typography, dense signal, and responsive board layouts." },
  { icon: Bot, title: "Playable bot ladder", copy: "Difficulty settings map to real engine limits instead of fake labels." },
  { icon: ShieldCheck, title: "Protected backend", copy: "RLS, webhook verification, rate limits, and server-only secrets by default." },
  { icon: TimerReset, title: "Fast review loops", copy: "Open a game, review the mistakes, and step directly into deeper analysis." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-grid bg-hero-grid opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div>
            <Badge>Original chess platform</Badge>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-text md:text-7xl">
              {BRAND.name} is built for players who care what the engine actually says.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Play, review, and upgrade inside one system designed around analysis quality, fast interaction,
              and production-safe backend boundaries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/analysis" className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}>
                Open analysis board
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <Card key={item.title} className="p-5">
                  <div className="text-base font-semibold text-text">{item.title}</div>
                  <div className="mt-2 text-sm leading-6 text-muted">{item.body}</div>
                </Card>
              ))}
            </div>
          </div>
          <Card className="glass-panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-accent2">Pro plan</div>
                <div className="mt-2 text-3xl font-semibold text-text">$12<span className="text-base text-muted">/month</span></div>
              </div>
              <Crown className="h-8 w-8 text-accent" />
            </div>
            <div className="mt-6 space-y-3">
              {PLAN_COPY.pro.map((feature) => (
                <div key={feature} className="rounded-2xl border border-line bg-surface2 px-4 py-3 text-sm text-muted">
                  {feature}
                </div>
              ))}
            </div>
            <Link href="/pricing" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-6 w-full")}>
              See pricing
            </Link>
          </Card>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="p-6">
              <pillar.icon className="h-6 w-6 text-accent" />
              <div className="mt-4 text-lg font-semibold text-text">{pillar.title}</div>
              <p className="mt-2 text-sm leading-6 text-muted">{pillar.copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
