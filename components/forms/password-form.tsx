"use client";

import { useActionState } from "react";

import { updatePasswordAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function PasswordForm({ resetMode }: { resetMode?: boolean }) {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <Card>
      <div className="text-xl font-semibold text-text">
        {resetMode ? "Complete password reset" : "Change password"}
      </div>
      <div className="mt-2 text-sm text-muted">
        {resetMode
          ? "You arrived from a password reset link. Set a new password to finish the flow."
          : "Update your current password for future sign-ins."}
      </div>
      <form action={formAction} className="mt-5 space-y-4">
        <Input name="password" type="password" placeholder="New password" required />
        <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />
        {state.error ? <div className="text-sm text-danger">{state.error}</div> : null}
        {state.success ? <div className="text-sm text-accent">{state.success}</div> : null}
        <Button disabled={pending}>{pending ? "Updating..." : "Update password"}</Button>
      </form>
    </Card>
  );
}
