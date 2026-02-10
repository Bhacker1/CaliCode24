// ============================================================
// CaliCode 24 — TypeScript Types
// ============================================================

export type SubscriptionTier = "free" | "pro" | "enterprise";
export type ProjectStatus = "draft" | "processing" | "compliant" | "failed";
export type DocumentType = "floor_plan" | "equipment_list" | "photo" | "other";
export type PassFail = "PASS" | "FAIL" | "PENDING";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  document_type: DocumentType;
  recognized_text: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  document_id: string | null;
  ai_summary: string;
  pass_fail_status: PassFail;
  confidence: number | null;
  citations: string[];
  reasoning: string | null;
  suggested_fixes: string[];
  raw_ai_response: Record<string, unknown> | null;
  model_version: string | null;
  created_at: string;
}

// API response from Gemini analysis
export interface ComplianceAnalysis {
  status: "PASS" | "FAIL";
  confidence: number;
  citations: string[];
  reasoning: string;
  fixes: string[];
}

// Project with its related documents and reports
export interface ProjectWithDetails extends Project {
  documents: Document[];
  reports: Report[];
}
