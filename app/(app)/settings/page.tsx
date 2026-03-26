import { IdentityLinker } from "@/components/forms/identity-linker";
import { PasswordForm } from "@/components/forms/password-form";
import { SettingsForm } from "@/components/forms/settings-form";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const context = await requireUser();
  const { reset } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", context.user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <SettingsForm
        defaults={{
          username: context.profile?.username ?? "",
          fullName: context.profile?.full_name ?? "",
          bio: context.profile?.bio ?? "",
          countryCode: context.profile?.country_code ?? "",
          boardTheme: settings?.board_theme ?? "midnight",
          pieceTheme: settings?.piece_theme ?? "classic",
          soundEnabled: settings?.sound_enabled ?? true,
          email: context.user.email ?? ""
        }}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <PasswordForm resetMode={reset === "1"} />
        <IdentityLinker />
      </div>
    </div>
  );
}
