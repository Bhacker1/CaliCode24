"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Skip if Supabase isn't configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    try {
      const supabase = createClient();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED"
        ) {
          router.refresh();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Supabase not configured yet
    }
  }, [router]);

  return <>{children}</>;
}
