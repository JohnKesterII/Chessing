import { PLAN_FEATURES, type PlanName } from "@/lib/constants/plans";

export function getPlanPolicy(plan: PlanName) {
  return PLAN_FEATURES[plan];
}
