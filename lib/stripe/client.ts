import Stripe from "stripe";

import { getServerEnv } from "@/lib/config/env";

const env = getServerEnv();

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia"
});
