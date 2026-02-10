"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  RotateCcw,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { UploadZone } from "@/components/UploadZone";
import { ScanningAnimation } from "@/components/ScanningAnimation";
import { ReportCard } from "@/components/ReportCard";
import { ComplianceStatusBadge } from "@/components/ComplianceStatusBadge";
import { UpgradeButton } from "@/components/UpgradeButton";
import { TIER_LIMITS } from "@/lib/tiers";
import type {
  Project,
  Document,
  Report,
  ComplianceAnalysis,
  SubscriptionTier,
} from "@/lib/types";

type WorkflowStep = "upload" | "scanning" | "result";

interface ProjectWorkspaceProps {
  user: { email: string };
  project: Project;
  initialDocuments: Document[];
  initialReports: Report[];
  tier: SubscriptionTier;
}

export function ProjectWorkspace({
  user,
  project,
  initialDocuments,
  initialReports,
  tier,
}: ProjectWorkspaceProps) {
  const hasExistingReport = initialReports.length > 0;
  const latestReport = initialReports[0];
  const latestDoc = initialDocuments[0];
  const tierConfig = TIER_LIMITS[tier];

  const [step, setStep] = useState<WorkflowStep>(
    hasExistingReport ? "result" : "upload"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(
    latestReport
      ? {
          status: latestReport.pass_fail_status as "PASS" | "FAIL",
          confidence: latestReport.confidence ?? 0,
          citations: latestReport.citations ?? [],
          reasoning: latestReport.reasoning ?? latestReport.ai_summary,
          fixes: latestReport.suggested_fixes ?? [],
        }
      : null
  );
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  const existingDocPreview = latestDoc?.file_url || null;

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep("scanning");
    setScanStep(0);
    setError(null);

    const stepTimers = [800, 1500, 2500, 3500];
    stepTimers.forEach((ms, i) => {
      setTimeout(() => setScanStep(i + 1), ms);
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("projectId", project.id);
      if (context.trim()) {
        formData.append("context", context.trim());
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await response.json();
      await new Promise((r) => setTimeout(r, 500));
      setScanStep(5);
      await new Promise((r) => setTimeout(r, 600));

      setAnalysis(data.analysis);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("upload");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setFilePreview(null);
    setAnalysis(null);
    setContext("");
    setError(null);
    setScanStep(0);
  };

  useEffect(() => {
    if (step === "scanning") {
      const interval = setInterval(() => {
        setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-blueprint">
      <Navbar user={user} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb / header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-lg font-bold truncate">{project.title}</h1>
            <ComplianceStatusBadge status={project.status} size="sm" />
          </div>
        </div>

        {/* STEP: Upload */}
        {step === "upload" && (
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Upload Plans for Compliance Check</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a floor plan, equipment schedule, or HVAC layout to
                  check against California Title 24 Energy Code.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <UploadZone onFileSelect={handleFileSelect} />

                {selectedFile && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Additional Context{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <Input
                        placeholder='e.g. "This is a 2-story commercial HVAC retrofit in Climate Zone 12"'
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="rounded-md border border-fail/20 bg-fail/5 px-4 py-3">
                        <p className="text-sm text-fail font-medium">{error}</p>
                      </div>
                    )}

                    <Button className="w-full h-11" onClick={handleAnalyze}>
                      Check Compliance Now
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: Scanning */}
        {step === "scanning" && (
          <div className="mx-auto max-w-md">
            <Card>
              <CardContent>
                <ScanningAnimation currentStep={scanStep} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP: Result — Split View */}
        {step === "result" && analysis && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Uploaded document */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4" />
                  Uploaded Document
                </h2>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="size-3.5" />
                  New Check
                </Button>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {filePreview ? (
                    <div className="relative aspect-[4/3] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={filePreview}
                        alt="Uploaded plan"
                        className="size-full object-contain"
                      />
                    </div>
                  ) : existingDocPreview ? (
                    <div className="relative aspect-[4/3] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={existingDocPreview}
                        alt="Uploaded plan"
                        className="size-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center bg-muted text-muted-foreground">
                      <FileText className="mb-2 size-10" />
                      <p className="text-sm font-medium">
                        {selectedFile?.name ??
                          latestDoc?.file_name ??
                          "Document"}
                      </p>
                      <p className="text-xs">PDF document uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md bg-card border px-3 py-2">
                  <p className="text-muted-foreground">File</p>
                  <p className="font-medium truncate">
                    {selectedFile?.name ?? latestDoc?.file_name ?? "—"}
                  </p>
                </div>
                <div className="rounded-md bg-card border px-3 py-2">
                  <p className="text-muted-foreground">Analyzed</p>
                  <p className="font-medium">
                    {latestReport
                      ? new Date(latestReport.created_at).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Report */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4" />
                  Compliance Report
                </h2>

                {tierConfig.pdfExport ? (
                  <Button variant="outline" size="sm">
                    <Download className="size-3.5" />
                    Export PDF
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lock className="size-3.5" />
                        Export PDF
                        <span className="ml-1 rounded bg-safety-orange/10 px-1 py-0.5 text-[10px] font-bold text-safety-orange">
                          PRO
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>PDF Export is a Pro Feature</DialogTitle>
                        <DialogDescription>
                          Upgrade to Pro to export compliance reports as
                          professional PDFs you can share with inspectors and
                          clients.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-lg border border-safety-orange/20 bg-safety-orange/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-safety-orange" />
                          <span className="text-sm font-semibold">
                            Pro Plan — $99/mo
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <span className="text-pass">&#10003;</span>{" "}
                            Unlimited projects
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-pass">&#10003;</span>{" "}
                            PDF report generation
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-pass">&#10003;</span>{" "}
                            Detailed code citations
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-pass">&#10003;</span>{" "}
                            Priority support
                          </li>
                        </ul>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Maybe Later</Button>
                        </DialogClose>
                        <UpgradeButton />
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <ReportCard analysis={analysis} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
