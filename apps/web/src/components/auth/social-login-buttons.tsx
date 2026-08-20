"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleIcon, GithubIcon, AppleIcon } from "./brand-icons";

const PROVIDERS = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "github", label: "GitHub", Icon: GithubIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
] as const;

export function SocialLoginButtons() {
  const [pending, setPending] = useState<string | null>(null);

  async function signInWith(provider: "google" | "github" | "apple") {
    const supabase = createClient();
    if (!supabase) return;
    setPending(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setPending(null);
      throw error;
    }
  }

  return (
    <div className="grid gap-2">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          disabled={!!pending}
          onClick={() => void signInWith(id)}
          className="w-full gap-2.5"
        >
          <Icon className="h-4 w-4 shrink-0" />
          {pending === id ? "Redirecionando..." : `Continuar com ${label}`}
        </Button>
      ))}
    </div>
  );
}