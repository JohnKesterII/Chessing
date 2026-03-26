import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reviewSaveSchema } from "@/lib/validators/chess";

export async function POST(request: Request) {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await request.json();
  const parsed = reviewSaveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("game_reviews")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", context.user.id)
    .gte("created_at", today.toISOString());

  if ((count ?? 0) >= context.planLimits.reviewQuotaDaily) {
    return NextResponse.json({ error: "Daily review quota reached." }, { status: 403 });
  }

  const { error } = await supabase.from("game_reviews").upsert({
    user_id: context.user.id,
    game_id: parsed.data.gameId,
    summary: parsed.data.summary,
    move_reviews: parsed.data.moves
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase
    .from("games")
    .update({
      reviewed: true,
      white_accuracy: parsed.data.summary.whiteAccuracy,
      black_accuracy: parsed.data.summary.blackAccuracy,
      opening_name: parsed.data.summary.openingName
    })
    .eq("id", parsed.data.gameId);

  return NextResponse.json({ success: true });
}
