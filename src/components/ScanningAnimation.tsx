"use client";

import { Loader2, ScanLine } from "lucide-react";

const steps = [
  "Uploading document...",
  "Extracting plan details...",
  "Checking Title 24 requirements...",
  "Analyzing HVAC specifications...",
  "Generating compliance report...",
];

interface ScanningAnimationProps {
  currentStep?: number;
}

export function ScanningAnimation({ currentStep = 0 }: ScanningAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Animated scanner graphic */}
      <div className="relative flex size-32 items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blueprint-line" />
        {/* Spinning ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-safety-orange" style={{ animationDuration: "2s" }} />
        {/* Inner content */}
        <div className="flex flex-col items-center gap-1">
          <ScanLine className="size-8 text-safety-orange animate-scan" />
          <span className="font-mono text-[10px] font-bold text-safety-orange">
            SCANNING
          </span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="w-full max-w-xs space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5"
          >
            {i < currentStep ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pass/10">
                <svg className="size-3 text-pass" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ) : i === currentStep ? (
              <Loader2 className="size-5 shrink-0 animate-spin text-safety-orange" />
            ) : (
              <div className="size-5 shrink-0 rounded-full border border-blueprint-line" />
            )}
            <span
              className={`text-xs ${
                i <= currentStep
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground max-w-[280px]">
        This typically takes 10-30 seconds depending on document complexity.
      </p>
    </div>
  );
}
