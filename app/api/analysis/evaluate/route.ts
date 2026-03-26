import { createHash } from "crypto";
import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { analysisRequestSchema } from "@/lib/validators/chess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await request.json();
  const parsed = analysisRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analysis request." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from(parsed.data.mode === "review" ? "game_reviews" : "analysis_cache")
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.user.id)
    .gte("created_at", today.toISOString());

  const quota =
    parsed.data.mode === "review"
      ? context.planLimits.reviewQuotaDaily
      : context.planLimits.analysisQuotaDaily;

  if ((count ?? 0) >= quota) {
    return NextResponse.json(
      { error: "Daily analysis quota reached for your current plan." },
      { status: 403 }
    );
  }

  const fenHash = createHash("sha256").update(parsed.data.fen).digest("hex");
  const { data: cached } = await supabase
    .from("analysis_cache")
    .select("*")
    .eq("user_id", context.user.id)
    .eq("fen_hash", fenHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    policy: {
      depth: context.planLimits.analysisDepth,
      multiPv: context.planLimits.multiPv
    },
    cached: cached?.evaluation ?? null
  });
}

export async function PUT(request: Request) {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await request.json();

  const fen = String(body.fen ?? "");
  const evaluation = body.evaluation;
  const mode = String(body.mode ?? "analysis");

  if (!fen || !evaluation) {
    return NextResponse.json({ error: "Missing evaluation payload." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const fenHash = createHash("sha256").update(fen).digest("hex");

  const { error } = await supabase.from("analysis_cache").insert({
    user_id: context.user.id,
    fen,
    fen_hash: fenHash,
    mode,
    evaluation,
    plan_required: context.plan
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
