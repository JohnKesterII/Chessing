import { z } from "zod";

export const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const otpRequestSchema = z.object({
  channel: z.enum(["email", "phone"]),
  value: z.string().min(4).max(255)
});

export const otpVerifySchema = z.object({
  channel: z.enum(["email", "phone"]),
  value: z.string().min(4).max(255),
  code: z.string().min(6).max(6)
});

export const resetPasswordSchema = z.object({
  email: z.string().email()
});

export const profileSettingsSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  fullName: z.string().max(60).optional().or(z.literal("")),
  bio: z.string().max(280).optional().or(z.literal("")),
  countryCode: z.string().max(2).optional().or(z.literal("")),
  boardTheme: z.string().min(1),
  pieceTheme: z.string().min(1),
  soundEnabled: z.boolean()
});
