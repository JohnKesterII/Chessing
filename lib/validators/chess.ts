import { z } from "zod";

export const saveGameSchema = z.object({
  mode: z.enum(["self", "bot", "online"]),
  pgn: z.string().min(1),
  fen: z.string().min(1),
  result: z.enum(["white", "black", "draw", "ongoing", "aborted"]),
  timeControl: z.string().min(1),
  userColor: z.enum(["white", "black"]).optional(),
  whitePlayerId: z.string().uuid().optional().nullable(),
  blackPlayerId: z.string().uuid().optional().nullable(),
  openingName: z.string().optional().nullable(),
  reviewed: z.boolean().default(false)
});

export const analysisRequestSchema = z.object({
  fen: z.string().min(1),
  moves: z.array(z.string()).default([]),
  mode: z.enum(["analysis", "review", "bot"]).default("analysis")
});

export const reviewSaveSchema = z.object({
  gameId: z.string().uuid(),
  summary: z.object({
    whiteAccuracy: z.number(),
    blackAccuracy: z.number(),
    openingName: z.string().nullable(),
    resultLabel: z.string()
  }),
  moves: z.array(
    z.object({
      ply: z.number(),
      san: z.string(),
      category: z.string(),
      evaluation: z.number().nullable(),
      bestMove: z.string().nullable(),
      explanation: z.string()
    })
  )
});
