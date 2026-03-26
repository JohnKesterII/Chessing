"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildRedirect, slugifyUsername } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailPasswordSchema, profileSettingsSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/session";

export type ActionState = {
  error?: string;
  success?: string;
};

async function clientMeta() {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const { ip, userAgent } = await clientMeta();

  try {
    await enforceRateLimit({
      bucket: "auth_signin",
      identifier: `${parsed.data.email}:${ip}`,
      limit: 10,
      windowMinutes: 15
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Too many attempts." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabaseAdmin.from("user_sessions_log").insert({
      user_id: data.user.id,
      event_type: "signin_password",
      ip_address: ip,
      user_agent: userAgent,
      metadata: { email: parsed.data.email }
    });
  }

  redirect("/dashboard");
}

export async function signUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = emailPasswordSchema
    .extend({
      username: emailPasswordSchema.shape.email.transform((email) => slugifyUsername(email.split("@")[0]))
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password")
    });

  if (!parsed.success) {
    return { error: "Use a valid email and a password with at least 8 characters." };
  }

  const { ip } = await clientMeta();

  try {
    await enforceRateLimit({
      bucket: "auth_signup",
      identifier: `${parsed.data.email}:${ip}`,
      limit: 6,
      windowMinutes: 20
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Too many attempts." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: buildRedirect("/auth/callback?next=/dashboard"),
      data: {
        username: parsed.data.username
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Check your inbox for the verification link or use the code flow on the verify page."
  };
}

export async function requestPasswordResetAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const { ip } = await clientMeta();

  try {
    await enforceRateLimit({
      bucket: "auth_reset",
      identifier: `${parsed.data.email}:${ip}`,
      limit: 5,
      windowMinutes: 30
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Too many reset attempts." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: buildRedirect("/auth/callback?next=/settings?reset=1")
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Password reset instructions have been sent."
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signOutEverywhereAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

export async function updatePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated." };
}

export async function updateProfileSettingsAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  const context = await requireUser();
  const parsed = profileSettingsSchema.safeParse({
    username: formData.get("username"),
    fullName: formData.get("fullName"),
    bio: formData.get("bio"),
    countryCode: formData.get("countryCode"),
    boardTheme: formData.get("boardTheme"),
    pieceTheme: formData.get("pieceTheme"),
    soundEnabled: formData.get("soundEnabled") === "on"
  });

  if (!parsed.success) {
    return { error: "Please correct the highlighted profile fields." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      full_name: parsed.data.fullName || null,
      bio: parsed.data.bio || null,
      country_code: parsed.data.countryCode || null
    })
    .eq("id", context.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: settingsError } = await supabase
    .from("user_settings")
    .upsert({
      user_id: context.user.id,
      board_theme: parsed.data.boardTheme,
      piece_theme: parsed.data.pieceTheme,
      sound_enabled: parsed.data.soundEnabled
    });

  if (settingsError) {
    return { error: settingsError.message };
  }

  return { success: "Settings saved." };
}
