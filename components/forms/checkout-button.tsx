"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CheckoutButton({ interval }: { interval: "monthly" | "yearly" }) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not open Stripe checkout.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <Button className="w-full" onClick={() => void startCheckout()} disabled={loading}>
      {loading ? "Opening checkout..." : interval === "monthly" ? "Choose monthly" : "Choose yearly"}
    </Button>
  );
}
