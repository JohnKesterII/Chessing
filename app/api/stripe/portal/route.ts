import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/session";
import { buildRedirect } from "@/lib/utils";
import { stripe } from "@/lib/stripe/client";

export async function POST() {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!context.subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer record exists yet." }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: context.subscription.stripe_customer_id,
    return_url: buildRedirect("/billing")
  });

  return NextResponse.json({ url: session.url });
}
