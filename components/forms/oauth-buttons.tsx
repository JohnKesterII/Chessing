"use client";

import { Apple, Chrome } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  async function signIn(provider: "google" | "apple") {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
      }
    });

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button type="button" variant="secondary" onClick={() => void signIn("google")}>
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button type="button" variant="secondary" onClick={() => void signIn("apple")}>
        <Apple className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>
    </div>
  );
}
