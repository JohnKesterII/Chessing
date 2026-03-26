export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type PlanStatus = "free" | "pro";
export type GameOutcome = "white" | "black" | "draw" | "ongoing" | "aborted";
export type ReviewCategory =
  | "book"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "brilliant";

export type ProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country_code: string | null;
  blitz_rating: number;
  rapid_rating: number;
  bullet_rating: number;
  classical_rating: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanStatus;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
      };
      subscriptions: {
        Row: SubscriptionRow;
      };
    };
  };
};
