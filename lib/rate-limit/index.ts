import { subMinutes } from "date-fns";

import { supabaseAdmin } from "@/lib/supabase/admin";

type RateLimitOptions = {
  bucket: string;
  identifier: string;
  limit: number;
  windowMinutes: number;
};

export async function enforceRateLimit({
  bucket,
  identifier,
  limit,
  windowMinutes
}: RateLimitOptions) {
  const windowStart = subMinutes(new Date(), windowMinutes).toISOString();

  const { count, error } = await supabaseAdmin
    .from("security_events")
    .select("*", { head: true, count: "exact" })
    .eq("bucket", bucket)
    .eq("identifier", identifier)
    .gte("created_at", windowStart);

  if (error) {
    throw error;
  }

  if ((count ?? 0) >= limit) {
    throw new Error("Too many attempts. Please wait a few minutes and try again.");
  }

  const { error: insertError } = await supabaseAdmin.from("security_events").insert({
    bucket,
    identifier
  });

  if (insertError) {
    throw insertError;
  }
}
