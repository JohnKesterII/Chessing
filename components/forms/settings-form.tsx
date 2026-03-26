"use client";

import { useActionState } from "react";

import { signOutAction, signOutEverywhereAction, updateProfileSettingsAction, type ActionState } from "@/app/actions/auth";
import { BOARD_THEMES, PIECE_THEMES } from "@/lib/constants/chess";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function SettingsForm({
  defaults
}: {
  defaults: {
    username: string;
    fullName: string;
    bio: string;
    countryCode: string;
    boardTheme: string;
    pieceTheme: string;
    soundEnabled: boolean;
    email: string;
  };
}) {
  const [state, formAction, pending] = useActionState(updateProfileSettingsAction, initialState);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <div className="mb-6">
          <div className="text-2xl font-semibold text-text">Profile and board settings</div>
          <div className="mt-2 text-sm text-muted">
            Update your public identity and local board preferences. Subscription state is enforced elsewhere.
          </div>
        </div>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted">
              Username
              <Input name="username" defaultValue={defaults.username} required />
            </label>
            <label className="space-y-2 text-sm text-muted">
              Full name
              <Input name="fullName" defaultValue={defaults.fullName} />
            </label>
          </div>
          <label className="space-y-2 text-sm text-muted">
            Bio
            <Textarea name="bio" defaultValue={defaults.bio} />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-muted">
              Country
              <Input name="countryCode" defaultValue={defaults.countryCode} maxLength={2} />
            </label>
            <label className="space-y-2 text-sm text-muted">
              Board theme
              <select
                name="boardTheme"
                defaultValue={defaults.boardTheme}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
              >
                {Object.entries(BOARD_THEMES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-muted">
              Piece theme
              <select
                name="pieceTheme"
                defaultValue={defaults.pieceTheme}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
              >
                {Object.entries(PIECE_THEMES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface2 px-4 py-3 text-sm text-muted">
            <input type="checkbox" name="soundEnabled" defaultChecked={defaults.soundEnabled} className="h-4 w-4" />
            Enable move sounds
          </label>
          {state.error ? <div className="text-sm text-danger">{state.error}</div> : null}
          {state.success ? <div className="text-sm text-accent">{state.success}</div> : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Save settings"}</Button>
        </form>
      </Card>
      <div className="space-y-6">
        <Card>
          <div className="text-lg font-semibold text-text">Session</div>
          <div className="mt-2 text-sm text-muted">{defaults.email}</div>
          <form action={signOutAction} className="mt-4">
            <Button variant="secondary" className="w-full">
              Sign out
            </Button>
          </form>
          <form action={signOutEverywhereAction} className="mt-3">
            <Button variant="danger" className="w-full">
              Sign out on all devices
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
