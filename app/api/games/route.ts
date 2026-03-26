import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { buildReplayFromPgn } from "@/lib/chess/replay";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveGameSchema } from "@/lib/validators/chess";

export async function GET() {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .or(`white_player_id.eq.${context.user.id},black_player_id.eq.${context.user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ games: data });
}

export async function POST(request: Request) {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await request.json();
  const parsed = saveGameSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid game payload." }, { status: 400 });
  }

  const replay = buildReplayFromPgn(parsed.data.pgn);
  const supabase = await createSupabaseServerClient();
  const whitePlayerId =
    parsed.data.mode === "bot"
      ? parsed.data.userColor === "black"
        ? null
        : context.user.id
      : parsed.data.whitePlayerId ?? context.user.id;
  const blackPlayerId =
    parsed.data.mode === "bot"
      ? parsed.data.userColor === "black"
        ? context.user.id
        : null
      : parsed.data.mode === "self"
        ? null
        : parsed.data.blackPlayerId;

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      white_player_id: whitePlayerId,
      black_player_id: blackPlayerId,
      mode: parsed.data.mode,
      time_control: parsed.data.timeControl,
      pgn: parsed.data.pgn,
      current_fen: parsed.data.fen,
      result: parsed.data.result,
      opening_name: parsed.data.openingName ?? replay.openingName,
      reviewed: parsed.data.reviewed,
      finished_at: parsed.data.result === "ongoing" ? null : new Date().toISOString()
    })
    .select("*")
    .single();

  if (error || !game) {
    return NextResponse.json({ error: error?.message ?? "Could not save game." }, { status: 400 });
  }

  const { error: movesError } = await supabase.from("game_moves").insert(
    replay.moves.map((move) => ({
      game_id: game.id,
      ply: move.ply,
      move_number: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen_after: move.fenAfter
    }))
  );

  if (movesError) {
    return NextResponse.json({ error: movesError.message }, { status: 400 });
  }

  const userIsWhite = whitePlayerId === context.user.id;
  const userIsBlack = blackPlayerId === context.user.id;
  const userWon =
    (userIsWhite && parsed.data.result === "white") || (userIsBlack && parsed.data.result === "black");
  const userDrew = parsed.data.result === "draw";

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (stats) {
    await supabase
      .from("user_stats")
      .update({
        games_played: stats.games_played + 1,
        wins: stats.wins + (userWon ? 1 : 0),
        losses:
          stats.losses +
          (!userWon && !userDrew && parsed.data.result !== "ongoing" && parsed.data.result !== "aborted" ? 1 : 0),
        draws: stats.draws + (userDrew ? 1 : 0),
        bot_games: stats.bot_games + (parsed.data.mode === "bot" ? 1 : 0)
      })
      .eq("user_id", context.user.id);
  }

  return NextResponse.json({ gameId: game.id });
}
