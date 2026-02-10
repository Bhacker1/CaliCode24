"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeButtonProps {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeButton({
  size = "default",
  variant = "default",
  className,
  children,
}: UpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        // Not logged in — send to signup
        router.push("/signup");
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
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : children ? null : (
        <Sparkles className="size-3.5" />
      )}
      {children ?? "Upgrade to Pro"}
      {!children && !loading && <ArrowRight className="size-3.5" />}
    </Button>
  );
}
