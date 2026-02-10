import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import type { Project, SubscriptionTier } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile for subscription tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier: SubscriptionTier = (profile?.subscription_tier as SubscriptionTier) ?? "free";

  // Fetch all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Count projects created this calendar month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: projectsThisMonth } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStart);

  return (
    <DashboardClient
      user={{ email: user.email ?? "" }}
      projects={(projects as Project[]) ?? []}
      tier={tier}
      projectsThisMonth={projectsThisMonth ?? 0}
    />
  );
}
