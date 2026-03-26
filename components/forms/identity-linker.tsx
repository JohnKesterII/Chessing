"use client";

import { Apple, Chrome, Link2 } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function IdentityLinker() {
  async function connect(provider: "google" | "apple") {
    const supabase = createSupabaseBrowserClient();

    const linkIdentity = (supabase.auth as {
      linkIdentity?: (options: { provider: "google" | "apple"; options?: { redirectTo?: string } }) => Promise<{ error: Error | null }>;
    }).linkIdentity;

    if (!linkIdentity) {
      toast.error("Identity linking is not available in this Supabase client version.");
      return;
    }

    const { error } = await linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`
      }
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Continue to link your ${provider} account.`);
  }

  return (
    <Card>
      <div className="flex items-center gap-2 text-xl font-semibold text-text">
        <Link2 className="h-5 w-5 text-accent2" />
        Linked identities
      </div>
      <div className="mt-2 text-sm text-muted">
        Connect Google or Apple to the current account so returning sign-in methods map to the same profile.
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" onClick={() => void connect("google")}>
          <Chrome className="mr-2 h-4 w-4" />
          Link Google
        </Button>
        <Button variant="secondary" onClick={() => void connect("apple")}>
          <Apple className="mr-2 h-4 w-4" />
          Link Apple
        </Button>
      </div>
    </Card>
  );
}
