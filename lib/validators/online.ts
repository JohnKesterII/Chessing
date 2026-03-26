import { z } from "zod";

export const onlineRoomCreateSchema = z.object({
  timeControl: z.string().min(1),
  rated: z.boolean().default(false)
});

export const onlineMoveSchema = z.object({
  gameId: z.string().uuid(),
  uci: z.string().min(4).max(5),
  fen: z.string().min(1)
});

export const onlinePresenceSchema = z.object({
  gameId: z.string().uuid(),
  status: z.enum(["connected", "reconnecting", "left"])
});
