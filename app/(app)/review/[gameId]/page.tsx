import { notFound } from "next/navigation";

import { ReviewStudio } from "@/components/chess/review-studio";
import { requireUser } from "@/lib/auth/session";
import { getGameById } from "@/lib/db/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SavedReview = {
  summary: {
    whiteAccuracy: number;
    blackAccuracy: number;
    openingName: string | null;
    resultLabel: string;
  };
  moves: Array<{
    ply: number;
    san: string;
    category: string;
    evaluation: number | null;
    bestMove: string | null;
    explanation: string;
  }>;
};

export default async function ReviewPage({
  params
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const context = await requireUser();
  const data = await getGameById(gameId);

  if (!data.game) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", context.user.id)
    .maybeSingle();

  return (
    <ReviewStudio
      gameId={gameId}
      pgn={data.game.pgn}
      boardTheme={(settings?.board_theme as "midnight" | "ember" | "slate") ?? "midnight"}
      pieceTheme={(settings?.piece_theme as "classic" | "neon") ?? "classic"}
      soundEnabled={settings?.sound_enabled ?? true}
      planDepth={context.planLimits.analysisDepth}
      multiPv={context.planLimits.multiPv}
      existingReview={
        data.review
          ? ({
              summary: data.review.summary as SavedReview["summary"],
              moves: data.review.move_reviews as SavedReview["moves"]
            } as SavedReview)
          : null
      }
    />
  );
}
