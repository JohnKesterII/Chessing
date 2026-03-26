import type Stripe from "stripe";

import { getServerEnv } from "@/lib/config/env";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

const env = getServerEnv();

export async function getOrCreateStripeCustomer({
  userId,
  email,
  name
}: {
  userId: string;
  email: string | undefined;
  name: string | null | undefined;
}) {
  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: {
      userId
    }
  });

  await supabaseAdmin
    .from("subscriptions")
    .upsert({ user_id: userId, stripe_customer_id: customer.id, plan: "free", status: "inactive" });

  return customer.id;
}

export function getPriceId(interval: "monthly" | "yearly") {
  return interval === "monthly" ? env.STRIPE_PRICE_PRO_MONTHLY : env.STRIPE_PRICE_PRO_YEARLY;
}

export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const metadataUserId = subscription.metadata.userId;
  const userId = existing?.user_id ?? metadataUserId;

  if (!userId) {
    throw new Error("Missing userId for subscription sync.");
  }

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id ?? null,
    plan: subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free",
    status: subscription.status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end
  });

  await supabaseAdmin.from("user_sessions_log").insert({
    user_id: userId,
    event_type: "subscription_sync",
    metadata: {
      subscriptionId: subscription.id,
      status: subscription.status
    }
  });
}

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    return;
  }

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id:
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
    stripe_subscription_id:
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
    stripe_price_id: session.metadata?.priceId ?? null,
    plan: "pro",
    status: "active"
  });

  await supabaseAdmin.from("user_sessions_log").insert({
    user_id: userId,
    event_type: "checkout_completed",
    metadata: {
      sessionId: session.id
    }
  });
}
