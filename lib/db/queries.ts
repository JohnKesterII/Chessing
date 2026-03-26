import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getRecentGamesForUser(userId: string, limit = 8) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("games")
    .select("*")
    .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getDashboardData(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [{ data: stats }, { data: reviews }, { data: analyses }] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("game_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("analysis_cache")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  return {
    stats,
    reviewCount: reviews.count ?? 0,
    analysisCount: analyses.count ?? 0
  };
}

export async function getPublicProfile(username: string) {
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();

  if (!profile) {
    return null;
  }

  const [{ data: stats }, { data: recentGames }, { data: subscription }] = await Promise.all([
    supabase.from("user_stats").select("*").eq("user_id", profile.id).maybeSingle(),
    supabase
      .from("games")
      .select("*")
      .or(`white_player_id.eq.${profile.id},black_player_id.eq.${profile.id}`)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("subscriptions").select("plan,status").eq("user_id", profile.id).maybeSingle()
  ]);

  return {
    profile,
    stats,
    recentGames: recentGames ?? [],
    subscription
  };
}

export async function getGameById(gameId: string) {
  const supabase = await createSupabaseServerClient();
  const [{ data: game }, { data: moves }, { data: review }] = await Promise.all([
    supabase.from("games").select("*").eq("id", gameId).maybeSingle(),
    supabase.from("game_moves").select("*").eq("game_id", gameId).order("ply", { ascending: true }),
    supabase.from("game_reviews").select("*").eq("game_id", gameId).maybeSingle()
  ]);

  return {
    game,
    moves: moves ?? [],
    review
  };
}
