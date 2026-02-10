"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Clock,
  Loader2,
  Search,
  HardHat,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpgradeButton } from "@/components/UpgradeButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { ComplianceStatusBadge } from "@/components/ComplianceStatusBadge";
import { createClient } from "@/lib/supabase/client";
import { TIER_LIMITS, canCreateProject, getProjectsRemaining } from "@/lib/tiers";
import type { Project, SubscriptionTier } from "@/lib/types";

interface DashboardClientProps {
  user: { email: string };
  projects: Project[];
  tier: SubscriptionTier;
  projectsThisMonth: number;
}

export function DashboardClient({
  user,
  projects,
  tier,
  projectsThisMonth,
}: DashboardClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const tierConfig = TIER_LIMITS[tier];
  const canCreate = canCreateProject(tier, projectsThisMonth);
  const remaining = getProjectsRemaining(tier, projectsThisMonth);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!title.trim() || !canCreate) return;
    setCreating(true);

    const supabase = createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({ title: title.trim(), user_id: currentUser.id })
      .select()
      .single();

    if (!error && data) {
      router.push(`/project/${data.id}`);
    }

    setCreating(false);
  };

  const stats = {
    total: projects.length,
    pass: projects.filter((p) => p.status === "compliant").length,
    fail: projects.filter((p) => p.status === "failed").length,
  };

  // Dialog content for creating a project — shared between desktop button and mobile FAB
  const createProjectDialog = (
    <>
      <DialogHeader>
        <DialogTitle>New Compliance Check</DialogTitle>
        <DialogDescription>
          Give your project a name, then upload your plans on the next screen.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2 py-2">
        <label htmlFor="project-title" className="text-sm font-medium">
          Project Name
        </label>
        <Input
          id="project-title"
          placeholder='e.g. "123 Main St HVAC Retrofit"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleCreateProject}
          disabled={!title.trim() || creating}
        >
          {creating && <Loader2 className="size-4 animate-spin" />}
          Create & Upload Plans
        </Button>
      </DialogFooter>
    </>
  );

  // Upgrade upsell dialog content
  const upgradeLimitDialog = (
    <>
      <DialogHeader>
        <DialogTitle>Monthly Limit Reached</DialogTitle>
        <DialogDescription>
          You&apos;ve used your {tierConfig.projectsPerMonth} free project this
          month. Upgrade to Pro for unlimited compliance checks.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border border-safety-orange/20 bg-safety-orange/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-safety-orange" />
          <span className="text-sm font-semibold">Pro Plan — $99/mo</span>
        </div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-pass">&#10003;</span> Unlimited projects
          </li>
          <li className="flex items-center gap-2">
            <span className="text-pass">&#10003;</span> PDF report generation
          </li>
          <li className="flex items-center gap-2">
            <span className="text-pass">&#10003;</span> Detailed code citations
          </li>
          <li className="flex items-center gap-2">
            <span className="text-pass">&#10003;</span> Priority support
          </li>
        </ul>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Maybe Later</Button>
        </DialogClose>
        <UpgradeButton />
      </DialogFooter>
    </>
  );

  return (
    <div className="min-h-screen bg-blueprint">
      <Navbar user={user} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Tier banner */}
        <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 items-center justify-center rounded-full ${
                tier === "free"
                  ? "bg-muted"
                  : "bg-safety-orange/10"
              }`}
            >
              {tier === "free" ? (
                <HardHat className="size-4.5 text-muted-foreground" />
              ) : (
                <Sparkles className="size-4.5 text-safety-orange" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{tierConfig.label}</span>
                {tier === "free" && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Current Plan
                  </span>
                )}
              </div>
              {tier === "free" ? (
                <p className="text-xs text-muted-foreground">
                  {remaining !== null && remaining > 0
                    ? `${remaining} project remaining this month`
                    : remaining === 0
                      ? "0 projects remaining this month"
                      : ""}
                  {" · "}
                  Basic citations · No PDF export
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Unlimited projects · PDF export · Priority support
                </p>
              )}
            </div>
          </div>
          {tier === "free" && (
            <UpgradeButton size="sm" />
          )}
        </div>

        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Your Projects</h1>
            <p className="text-sm text-muted-foreground">
              Manage and review your Title 24 compliance checks.
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={false}>
                {canCreate ? (
                  <Plus className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
                New Inspection
              </Button>
            </DialogTrigger>
            <DialogContent>
              {canCreate ? createProjectDialog : upgradeLimitDialog}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blueprint-dark">
                <FolderOpen className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-pass/10">
                <HardHat className="size-5 text-pass" />
              </div>
              <div>
                <p className="text-2xl font-bold text-pass">{stats.pass}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-fail/10">
                <HardHat className="size-5 text-fail" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fail">{stats.fail}</p>
                <p className="text-xs text-muted-foreground">Requires Review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage bar for free tier */}
        {tier === "free" && (
          <div className="mt-4 rounded-lg border bg-card px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium">Monthly Usage</span>
              <span className="font-mono text-xs text-muted-foreground">
                {projectsThisMonth} / {tierConfig.projectsPerMonth} projects
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (projectsThisMonth / tierConfig.projectsPerMonth) * 100)}%`,
                  backgroundColor:
                    projectsThisMonth >= tierConfig.projectsPerMonth
                      ? "var(--color-fail)"
                      : "var(--color-safety-orange)",
                }}
              />
            </div>
          </div>
        )}

        {/* Search and Table */}
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <CardDescription>{filtered.length} projects</CardDescription>
            </div>
            <div className="relative w-full max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
                  <FolderOpen className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">No projects yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first compliance check to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.title}
                        </TableCell>
                        <TableCell>
                          <ComplianceStatusBadge
                            status={project.status}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(project.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/project/${project.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile FAB */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-safety-orange text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:hidden"
            aria-label="New Inspection"
          >
            {canCreate ? (
              <Plus className="size-6" />
            ) : (
              <Lock className="size-6" />
            )}
          </button>
        </DialogTrigger>
        <DialogContent>
          {canCreate ? createProjectDialog : upgradeLimitDialog}
        </DialogContent>
      </Dialog>
    </div>
  );
}
