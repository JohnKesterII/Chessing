import { BotRoom } from "@/components/chess/bot-room";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BotPage() {
  const context = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", context.user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Card>
        <div className="text-2xl font-semibold text-text">Bot arena</div>
        <div className="mt-2 text-sm text-muted">
          Difficulty maps to engine depth. Lower levels respond faster and less accurately. Pro accounts unlock deeper bot search.
        </div>
      </Card>
      <BotRoom
        boardTheme={(settings?.board_theme as "midnight" | "ember" | "slate") ?? "midnight"}
        pieceTheme={(settings?.piece_theme as "classic" | "neon") ?? "classic"}
        soundEnabled={settings?.sound_enabled ?? true}
        planBotDepth={context.planLimits.botDepth}
      />
    </div>
  );
}
