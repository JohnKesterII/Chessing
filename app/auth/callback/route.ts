import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(new URL(`/verify?error=${encodeURIComponent(errorDescription)}`, url.origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin));
    }

    if (data.user) {
      await supabaseAdmin.from("user_sessions_log").insert({
        user_id: data.user.id,
        event_type: "auth_callback",
        ip_address: request.headers.get("x-forwarded-for") ?? "unknown",
        user_agent: request.headers.get("user-agent") ?? "unknown",
        metadata: {
          provider: data.user.app_metadata?.provider ?? "unknown"
        }
      });
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
