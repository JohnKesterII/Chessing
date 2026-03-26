"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function OtpAuthCard() {
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function requestCode() {
    setSending(true);
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, value })
    });

    const payload = await response.json();
    setSending(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not send the code.");
      return;
    }

    toast.success(`A verification code was sent to your ${channel}.`);
  }

  async function verifyCode() {
    setVerifying(true);
    const response = await fetch("/api/auth/otp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, value, code })
    });
    const payload = await response.json();
    setVerifying(false);

    if (!response.ok) {
      toast.error(payload.error ?? "Could not verify the code.");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <Card className="w-full max-w-xl">
      <div className="mb-6">
        <div className="text-2xl font-semibold text-text">Verify with a one-time code</div>
        <div className="mt-2 text-sm text-muted">
          Email and phone codes are rate limited and verified server-side before a session is created.
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface2 p-1">
        {(["email", "phone"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setChannel(option)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              channel === option ? "bg-accent text-black" : "text-muted hover:text-text"
            }`}
          >
            {option === "email" ? "Email OTP" : "Phone OTP"}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          type={channel === "email" ? "email" : "tel"}
          placeholder={channel === "email" ? "Email address" : "Phone number with country code"}
        />
        <Button variant="secondary" className="w-full" onClick={() => void requestCode()} disabled={sending}>
          {sending ? "Sending..." : "Send code"}
        </Button>
        <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter 6-digit code" />
        <Button className="w-full" onClick={() => void verifyCode()} disabled={verifying}>
          {verifying ? "Verifying..." : "Verify and continue"}
        </Button>
      </div>
    </Card>
  );
}
