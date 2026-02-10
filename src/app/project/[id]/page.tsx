import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectWorkspace } from "./ProjectWorkspace";
import type { Project, Document, Report, SubscriptionTier } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  const tier: SubscriptionTier =
    (profile?.subscription_tier as SubscriptionTier) ?? "free";

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) redirect("/dashboard");

  const [{ data: documents }, { data: reports }] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <ProjectWorkspace
      user={{ email: user.email ?? "" }}
      project={project as Project}
      initialDocuments={(documents as Document[]) ?? []}
      initialReports={(reports as Report[]) ?? []}
      tier={tier}
    />
  );
}
