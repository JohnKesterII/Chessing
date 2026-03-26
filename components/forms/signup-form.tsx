"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type ActionState } from "@/app/actions/auth";
import { OAuthButtons } from "@/components/forms/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <Card className="w-full max-w-xl">
      <div className="mb-6">
        <div className="text-2xl font-semibold text-text">Create your KnightShift account</div>
        <div className="mt-2 text-sm text-muted">
          Verified accounts unlock saved history, billing, review storage, and protected settings.
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Create password" required />
        {state.error ? <div className="text-sm text-danger">{state.error}</div> : null}
        {state.success ? <div className="text-sm text-accent">{state.success}</div> : null}
        <Button className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="my-6 h-px bg-line" />
      <OAuthButtons />
      <div className="mt-6 text-sm text-muted">
        Prefer OTP? Continue on the <Link href="/verify" className="text-text underline">verification page</Link>.
      </div>
    </Card>
  );
}
