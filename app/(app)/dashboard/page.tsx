import { Crown } from "lucide-react";

import { HistoryTable, type GameRow } from "@/components/history/history-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDashboardData, getRecentGamesForUser } from "@/lib/db/queries";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const context = await requireUser();
  const [dashboard, games] = await Promise.all([
    getDashboardData(context.user.id),
    getRecentGamesForUser(context.user.id, 12)
  ]);

  const statCards = [
    { label: "Games played", value: dashboard.stats?.games_played ?? 0 },
    { label: "Wins", value: dashboard.stats?.wins ?? 0 },
    { label: "Saved analyses", value: dashboard.analysisCount },
    { label: "Saved reviews", value: dashboard.reviewCount }
  ];

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge className="border-accent2/30 bg-accent2/10 text-accent2">Dashboard</Badge>
          <h1 className="mt-4 font-display text-4xl font-semibold text-text">
            Welcome back, @{context.profile?.username}
          </h1>
          <p className="mt-3 text-sm text-muted">
            Current plan: <span className="text-text">{context.plan}</span>
          </p>
        </div>
        {context.plan === "pro" ? (
          <div className="flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-accent">
            <Crown className="h-4 w-4" />
            Pro analysis enabled
          </div>
        ) : null}
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="text-sm text-muted">{card.label}</div>
            <div className="mt-2 text-3xl font-semibold text-text">{card.value}</div>
          </Card>
        ))}
      </div>
      <HistoryTable games={games as GameRow[]} />
    </div>
  );
}
