"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PricingUpgradeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    };
    check();
  }, []);

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/signup");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(false);
      }
    } catch {
      console.error("Network error during checkout");
      setLoading(false);
    }
  };

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : null}
      {isLoggedIn ? "Upgrade to Pro" : "Start Pro Trial"}
      {!loading && <ArrowRight className="size-4" />}
    </Button>
  );
}
