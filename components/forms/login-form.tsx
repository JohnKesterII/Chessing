"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { requestPasswordResetAction, signInAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/forms/oauth-buttons";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordResetAction, initialState);
  const [showReset, setShowReset] = useState(false);

  return (
    <Card className="w-full max-w-xl">
      <div className="mb-6">
        <div className="text-2xl font-semibold text-text">Welcome back</div>
        <div className="mt-2 text-sm text-muted">
          Use your password, a one-time code, or a connected identity provider.
        </div>
      </div>
      <form action={formAction} className="space-y-4">
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required />
        {state.error ? <div className="text-sm text-danger">{state.error}</div> : null}
        <Button className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="my-6 h-px bg-line" />
      <OAuthButtons />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" className="text-muted transition hover:text-text" onClick={() => setShowReset((value) => !value)}>
          Forgot password?
        </button>
        <Link href="/verify" className="text-muted transition hover:text-text">
          Use email or phone code
        </Link>
      </div>
      {showReset ? (
        <form action={resetAction} className="mt-4 space-y-3 rounded-2xl border border-line bg-surface2 p-4">
          <Input name="email" type="email" placeholder="Email for reset instructions" required />
          {resetState.error ? <div className="text-sm text-danger">{resetState.error}</div> : null}
          {resetState.success ? <div className="text-sm text-accent">{resetState.success}</div> : null}
          <Button variant="secondary" className="w-full" disabled={resetPending}>
            {resetPending ? "Sending..." : "Send reset email"}
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
