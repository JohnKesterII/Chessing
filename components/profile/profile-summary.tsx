import { Card } from "@/components/ui/card";

export function ProfileSummary({
  profile,
  stats,
  plan
}: {
  profile: {
    username: string;
    full_name: string | null;
    bio: string | null;
    country_code: string | null;
    blitz_rating: number;
    rapid_rating: number;
    bullet_rating: number;
    classical_rating: number;
  };
  stats: {
    games_played: number;
    wins: number;
    losses: number;
    draws: number;
  } | null;
  plan: string;
}) {
  const ratingCards = [
    { label: "Blitz", value: profile.blitz_rating },
    { label: "Rapid", value: profile.rapid_rating },
    { label: "Bullet", value: profile.bullet_rating },
    { label: "Classical", value: profile.classical_rating }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <div className="text-sm uppercase tracking-[0.2em] text-accent2">{plan}</div>
        <h1 className="mt-4 font-display text-5xl font-semibold text-text">@{profile.username}</h1>
        <div className="mt-3 text-lg text-muted">{profile.full_name ?? "KnightShift player"}</div>
        <div className="mt-6 text-sm leading-7 text-muted">{profile.bio ?? "No bio yet."}</div>
        <div className="mt-4 text-sm text-muted">{profile.country_code ? `Country: ${profile.country_code}` : "Country hidden"}</div>
      </Card>
      <Card>
        <div className="text-lg font-semibold text-text">Results</div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted">Games</div>
            <div className="text-2xl font-semibold text-text">{stats?.games_played ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted">Wins</div>
            <div className="text-2xl font-semibold text-text">{stats?.wins ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted">Losses</div>
            <div className="text-2xl font-semibold text-text">{stats?.losses ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted">Draws</div>
            <div className="text-2xl font-semibold text-text">{stats?.draws ?? 0}</div>
          </div>
        </div>
      </Card>
      <div className="xl:col-span-2 grid gap-4 md:grid-cols-4">
        {ratingCards.map((rating) => (
          <Card key={rating.label} className="p-5">
            <div className="text-sm text-muted">{rating.label}</div>
            <div className="mt-2 text-3xl font-semibold text-text">{rating.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
