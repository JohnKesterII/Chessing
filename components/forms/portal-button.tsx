"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const response = await fetch("/api/stripe/portal", { method: "POST" });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not open billing portal.");
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <Button variant="secondary" onClick={() => void openPortal()} disabled={loading}>
      {loading ? "Opening portal..." : "Manage billing in Stripe"}
    </Button>
  );
}
