import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = otpRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid OTP request." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  try {
    await enforceRateLimit({
      bucket: `otp_${parsed.data.channel}`,
      identifier: `${parsed.data.value}:${ip}`,
      limit: 5,
      windowMinutes: 15
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Too many attempts." },
      { status: 429 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } =
    parsed.data.channel === "email"
      ? await supabase.auth.signInWithOtp({
          email: parsed.data.value,
          options: {
            emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`
          }
        })
      : await supabase.auth.signInWithOtp({
          phone: parsed.data.value
        });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = otpVerifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp(
    parsed.data.channel === "email"
      ? {
          email: parsed.data.value,
          token: parsed.data.code,
          type: "email"
        }
      : {
          phone: parsed.data.value,
          token: parsed.data.code,
          type: "sms"
        }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
