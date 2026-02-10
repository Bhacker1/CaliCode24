"use client";

import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus, PassFail } from "@/lib/types";

interface ComplianceStatusBadgeProps {
  status: ProjectStatus | PassFail;
  size?: "sm" | "md" | "lg";
}

const config: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  PASS: {
    label: "Pass",
    className: "bg-pass/10 text-pass border-pass/20",
    icon: CheckCircle2,
  },
  compliant: {
    label: "Pass",
    className: "bg-pass/10 text-pass border-pass/20",
    icon: CheckCircle2,
  },
  FAIL: {
    label: "Requires Review",
    className: "bg-fail/10 text-fail border-fail/20",
    icon: XCircle,
  },
  failed: {
    label: "Requires Review",
    className: "bg-fail/10 text-fail border-fail/20",
    icon: XCircle,
  },
  PENDING: {
    label: "Pending",
    className: "bg-pending/10 text-pending border-pending/20",
    icon: Clock,
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    className: "bg-pending/10 text-pending border-pending/20",
    icon: Loader2,
  },
};

const sizes = {
  sm: "px-2 py-0.5 text-xs gap-1 [&_svg]:size-3",
  md: "px-2.5 py-1 text-xs gap-1.5 [&_svg]:size-3.5",
  lg: "px-3 py-1.5 text-sm gap-2 [&_svg]:size-4",
};

export function ComplianceStatusBadge({
  status,
  size = "md",
}: ComplianceStatusBadgeProps) {
  const c = config[status] ?? config.PENDING;
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
        c.className,
        sizes[size]
      )}
    >
      <Icon
        className={cn(status === "processing" && "animate-spin")}
      />
      {c.label}
    </span>
  );
}
