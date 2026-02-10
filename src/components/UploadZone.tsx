"use client";

import { useCallback, useState } from "react";
import { Upload, Camera, FileImage, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadZone({
  onFileSelect,
  disabled = false,
  accept = "image/*,.pdf",
  maxSizeMB = 100,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be under ${maxSizeMB}MB`);
        return;
      }

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a JPG, PNG, WebP, HEIC, or PDF file.");
        return;
      }

      setFileName(file.name);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
  };

  // File selected state
  if (fileName) {
    return (
      <div className="relative rounded-lg border-2 border-dashed border-blueprint-line bg-white p-6">
        <button
          onClick={clearFile}
          className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Remove file"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-4">
          {preview ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md border bg-muted">
              <FileText className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for compliance check
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={disabled ? undefined : handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer",
        isDragOver
          ? "border-safety-orange bg-safety-orange/5 animate-pulse-glow"
          : "border-blueprint-line bg-white hover:border-safety-orange/50 hover:bg-blueprint/50",
        disabled && "opacity-50 cursor-not-allowed",
        error && "border-fail"
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label="Upload file"
      />

      <div className="flex size-16 items-center justify-center rounded-full bg-blueprint">
        {isDragOver ? (
          <FileImage className="size-7 text-safety-orange" />
        ) : (
          <Upload className="size-7 text-muted-foreground" />
        )}
      </div>

      <div className="text-center">
        <p className="font-semibold text-sm">
          {isDragOver ? "Drop your file here" : "Drag & drop your plans here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG, WebP, HEIC, or PDF up to {maxSizeMB}MB
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-none"
        >
          <Upload className="size-3.5" />
          Browse Files
        </Button>

        {/* Mobile camera button */}
        <div className="relative sm:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-none"
          >
            <Camera className="size-3.5" />
            Take Photo
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            aria-label="Take photo"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-fail">{error}</p>
      )}
    </div>
  );
}
