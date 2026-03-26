import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/auth/session";
import { buildRedirect } from "@/lib/utils";
import { stripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer, getPriceId } from "@/lib/stripe/service";

const schema = z.object({
  interval: z.enum(["monthly", "yearly"])
});

export async function POST(request: Request) {
  let context;
  try {
    context = await requireApiUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid billing interval." }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer({
    userId: context.user.id,
    email: context.user.email,
    name: context.profile?.full_name ?? context.profile?.username
  });

  const priceId = getPriceId(parsed.data.interval);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: buildRedirect("/billing?checkout=success"),
    cancel_url: buildRedirect("/pricing?checkout=cancelled"),
    allow_promotion_codes: true,
    metadata: {
      userId: context.user.id,
      priceId
    },
    subscription_data: {
      metadata: {
        userId: context.user.id
      }
    }
  });

  return NextResponse.json({ url: session.url });
}
