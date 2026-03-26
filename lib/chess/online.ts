export type OnlineRoomState = {
  gameId: string;
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  timeControl: string;
  rated: boolean;
  drawOfferedBy: "white" | "black" | null;
  reconnectGraceMs: number;
};

export const ONLINE_ROOM_DEFAULTS = {
  reconnectGraceMs: 20_000
} as const;

export function nextClockSnapshot({
  white,
  black,
  turn,
  elapsedMs,
  incrementSeconds
}: {
  white: number;
  black: number;
  turn: "w" | "b";
  elapsedMs: number;
  incrementSeconds: number;
}) {
  const elapsed = Math.ceil(elapsedMs / 1000);

  if (turn === "w") {
    return {
      white: Math.max(0, white - elapsed + incrementSeconds),
      black
    };
  }

  return {
    white,
    black: Math.max(0, black - elapsed + incrementSeconds)
  };
}
