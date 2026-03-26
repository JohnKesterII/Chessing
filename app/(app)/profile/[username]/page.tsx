import { notFound } from "next/navigation";

import { HistoryTable, type GameRow } from "@/components/history/history-table";
import { ProfileSummary } from "@/components/profile/profile-summary";
import { getPublicProfile } from "@/lib/db/queries";

export default async function ProfilePage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getPublicProfile(username);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ProfileSummary
        profile={data.profile}
        stats={data.stats}
        plan={data.subscription?.plan === "pro" && data.subscription?.status === "active" ? "Pro member" : "Free member"}
      />
      <HistoryTable games={data.recentGames as GameRow[]} />
    </div>
  );
}
