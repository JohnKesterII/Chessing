import { PlayRoom } from "@/components/chess/play-room";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlayPage() {
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
        <div className="text-2xl font-semibold text-text">Play</div>
        <div className="mt-2 text-sm text-muted">
          Self-play is fully functional. Online rooms are scaffolded through the shared data model and move API.
        </div>
      </Card>
      <PlayRoom
        boardTheme={(settings?.board_theme as "midnight" | "ember" | "slate") ?? "midnight"}
        pieceTheme={(settings?.piece_theme as "classic" | "neon") ?? "classic"}
        soundEnabled={settings?.sound_enabled ?? true}
      />
    </div>
  );
}
