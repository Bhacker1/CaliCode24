import type { SubscriptionTier } from "./types";

export const TIER_LIMITS: Record<
  SubscriptionTier,
  {
    label: string;
    projectsPerMonth: number; // -1 = unlimited
    pdfExport: boolean;
    detailedCitations: boolean;
    prioritySupport: boolean;
  }
> = {
  free: {
    label: "Free Tier",
    projectsPerMonth: 1,
    pdfExport: false,
    detailedCitations: false,
    prioritySupport: false,
  },
  pro: {
    label: "Pro",
    projectsPerMonth: -1,
    pdfExport: true,
    detailedCitations: true,
    prioritySupport: true,
  },
  enterprise: {
    label: "Enterprise",
    projectsPerMonth: -1,
    pdfExport: true,
    detailedCitations: true,
    prioritySupport: true,
  },
};

export function canCreateProject(
  tier: SubscriptionTier,
  projectsThisMonth: number
): boolean {
  const limit = TIER_LIMITS[tier].projectsPerMonth;
  if (limit === -1) return true;
  return projectsThisMonth < limit;
}

export function getProjectsRemaining(
  tier: SubscriptionTier,
  projectsThisMonth: number
): number | null {
  const limit = TIER_LIMITS[tier].projectsPerMonth;
  if (limit === -1) return null; // unlimited
  return Math.max(0, limit - projectsThisMonth);
}
