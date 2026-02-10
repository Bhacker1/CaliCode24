"use client";

import {
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Wrench,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComplianceStatusBadge } from "@/components/ComplianceStatusBadge";
import { Separator } from "@/components/ui/separator";
import type { ComplianceAnalysis } from "@/lib/types";

interface ReportCardProps {
  analysis: ComplianceAnalysis;
}

export function ReportCard({ analysis }: ReportCardProps) {
  const confidencePercent = Math.round(analysis.confidence * 100);

  return (
    <Card className="gap-0 overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/30 py-4">
        <div className="flex items-center gap-3">
          {analysis.status === "PASS" ? (
            <div className="flex size-10 items-center justify-center rounded-full bg-pass/10">
              <CheckCircle2 className="size-5 text-pass" />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-full bg-fail/10">
              <AlertTriangle className="size-5 text-fail" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">
              Title 24 Compliance Report
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Confidence: {confidencePercent}%
            </p>
          </div>
        </div>
        <ComplianceStatusBadge status={analysis.status} size="lg" />
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Reasoning */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Analysis Summary</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.reasoning}
          </p>
        </div>

        <Separator />

        {/* Citations */}
        {analysis.citations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                Code Citations ({analysis.citations.length})
              </h3>
            </div>
            <ul className="space-y-1.5">
              {analysis.citations.map((citation, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blueprint-dark font-mono text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs leading-relaxed">
                    {citation}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Fixes */}
        {analysis.fixes.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="size-4 text-safety-orange" />
                <h3 className="text-sm font-semibold">Suggested Fixes</h3>
              </div>
              <ul className="space-y-1.5">
                {analysis.fixes.map((fix, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-safety-orange/20 bg-safety-orange/5 px-3 py-2"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-safety-orange/20 text-safety-orange font-mono text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs leading-relaxed">
                      {fix}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Confidence bar */}
        <Separator />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">
              AI Confidence
            </span>
            <span className="font-mono text-xs font-bold">
              {confidencePercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${confidencePercent}%`,
                backgroundColor:
                  confidencePercent >= 70
                    ? "var(--color-pass)"
                    : confidencePercent >= 40
                      ? "var(--color-pending)"
                      : "var(--color-fail)",
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
