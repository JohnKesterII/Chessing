import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PLAN_FEATURES, type PlanName } from "@/lib/constants/plans";

export async function getCurrentUserContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      subscription: null,
      plan: "free" as PlanName,
      planLimits: PLAN_FEATURES.free
    };
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()
  ]);

  const plan = subscription?.plan === "pro" && subscription?.status === "active" ? "pro" : "free";

  return {
    user,
    profile,
    subscription,
    plan,
    planLimits: PLAN_FEATURES[plan]
  };
}

export async function requireUser() {
  const context = await getCurrentUserContext();

  if (!context.user) {
    redirect("/login");
  }

  return context;
}

export async function requireApiUser() {
  const context = await getCurrentUserContext();

  if (!context.user) {
    throw new Error("UNAUTHORIZED");
  }

  return context;
}
