import { AnalysisStudio } from "@/components/chess/analysis-studio";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AnalysisPage({
  searchParams
}: {
  searchParams: Promise<{ gameId?: string }>;
}) {
  const context = await requireUser();
  const { gameId } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", context.user.id)
    .maybeSingle();
  const gameResponse = gameId
    ? await supabase.from("games").select("pgn,current_fen").eq("id", gameId).maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-2xl font-semibold text-text">Analysis board</div>
        <div className="mt-2 text-sm text-muted">
          Import FEN or PGN, inspect engine lines, and work within plan-enforced depth and daily quotas.
        </div>
      </Card>
      <AnalysisStudio
        boardTheme={(settings?.board_theme as "midnight" | "ember" | "slate") ?? "midnight"}
        pieceTheme={(settings?.piece_theme as "classic" | "neon") ?? "classic"}
        soundEnabled={settings?.sound_enabled ?? true}
        gameSeed={gameResponse?.data ? { pgn: gameResponse.data.pgn, fen: gameResponse.data.current_fen } : null}
      />
    </div>
  );
}
