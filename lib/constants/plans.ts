export type PlanName = "free" | "pro";

export const PLAN_FEATURES = {
  free: {
    name: "Free",
    priceMonthly: "$0",
    priceYearly: "$0",
    analysisDepth: 12,
    multiPv: 1,
    reviewQuotaDaily: 2,
    analysisQuotaDaily: 20,
    botDepth: 8,
    storedAnalysesDaily: 10
  },
  pro: {
    name: "Pro",
    priceMonthly: "$12",
    priceYearly: "$96",
    analysisDepth: 20,
    multiPv: 3,
    reviewQuotaDaily: 100,
    analysisQuotaDaily: 500,
    botDepth: 16,
    storedAnalysesDaily: 250
  }
} as const;

export const PLAN_COPY = {
  free: [
    "Unlimited self-play and saved history",
    "Bot games with practical difficulty caps",
    "Analysis board with daily limits",
    "Partial post-game review"
  ],
  pro: [
    "Deeper multi-line engine analysis",
    "Full review sessions with richer labels",
    "Expanded daily analysis and storage quotas",
    "Priority engine cadence and premium visuals"
  ]
} as const;
