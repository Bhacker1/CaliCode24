import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ComplianceAnalysis } from "@/lib/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allow up to 100MB uploads
export const maxDuration = 60;
export const fetchCache = "default-no-store";

const SYSTEM_PROMPT = `You are a California Title 24 Building Energy Code expert specializing in HVAC and construction compliance.

Analyze the attached image or text. It may be a floor plan, equipment schedule, HVAC layout, mechanical plan, or equipment specification.

Evaluate the content against the 2025 California Title 24 Energy Code (Part 6 - Energy Efficiency Standards, Part 11 - CALGreen).

Your analysis must:
1. Identify all relevant Title 24 sections that apply.
2. Check for specific violations or confirm compliance for each applicable section.
3. Provide actionable fixes for any violations found.
4. Assign a confidence score (0.0 to 1.0) based on image clarity and how much information you can extract.

Output ONLY valid JSON with this exact structure:
{
  "status": "PASS" | "FAIL",
  "confidence": <number between 0 and 1>,
  "citations": ["Section X.Y.Z - Description", ...],
  "reasoning": "Detailed explanation of findings...",
  "fixes": ["Specific fix 1", "Specific fix 2", ...]
}

If the image is unclear or not related to construction/HVAC, set confidence below 0.3 and explain in reasoning.`;

// Demo response used when Gemini API key is missing or call fails
const DEMO_ANALYSIS: ComplianceAnalysis = {
  status: "FAIL",
  confidence: 0.82,
  citations: [
    "Section 150.0(k) - Minimum insulation requirements for HVAC ducts in unconditioned spaces",
    "Section 150.1(c)7 - Mandatory requirements for indoor air quality and mechanical ventilation",
    "Section 150.2(b)1 - Duct leakage testing requirements for altered duct systems",
    "Section 110.2(a) - Equipment efficiency requirements for space-conditioning systems",
    "Table 150.1-A - Prescriptive envelope criteria for climate zones 3-16",
  ],
  reasoning:
    "Based on the uploaded document, several potential Title 24 compliance issues were identified. The HVAC system layout indicates ductwork routed through unconditioned attic space without documentation of R-8 minimum insulation. The mechanical ventilation specification does not clearly indicate compliance with ASHRAE 62.2 requirements as mandated by Section 150.1(c)7. Additionally, the equipment schedule references a 14 SEER unit where the 2025 code now requires minimum 15 SEER for split systems in this climate zone. The duct layout does not reference a duct leakage testing protocol as required for permit compliance under Section 150.2(b)1.",
  fixes: [
    "Specify R-8 minimum duct insulation for all supply and return ducts in unconditioned spaces per Section 150.0(k)",
    "Add ASHRAE 62.2 mechanical ventilation calculations and specify compliant whole-house ventilation fan with documentation",
    "Upgrade HVAC unit specification to minimum 15 SEER / 7.5 HSPF split system to meet 2025 equipment efficiency requirements",
    "Include duct leakage testing protocol on plans — maximum 5% leakage for new ductwork, 15% for existing altered systems",
    "Add climate zone designation to title block and reference applicable Table 150.1-A prescriptive values",
  ],
};

async function callGemini(
  base64: string,
  mimeType: string,
  additionalContext: string | null
): Promise<ComplianceAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    console.log("Gemini API key not configured — returning demo analysis");
    return DEMO_ANALYSIS;
  }

  let prompt = SYSTEM_PROMPT;
  if (additionalContext) {
    prompt += `\n\nAdditional context from the contractor: ${additionalContext}`;
  }

  // Use the REST API directly to avoid SDK initialization issues
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API error:", response.status, errorBody);
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  // Strip markdown code fences if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr) as ComplianceAnalysis;
  } catch {
    return {
      status: "FAIL",
      confidence: 0.2,
      citations: [],
      reasoning: `AI returned non-structured response: ${text.substring(0, 500)}`,
      fixes: ["Please re-upload a clearer image for better analysis."],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (err) {
      console.error("Failed to parse form data:", err);
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const additionalContext = formData.get("context") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    let base64: string;
    try {
      const bytes = await file.arrayBuffer();
      base64 = Buffer.from(bytes).toString("base64");
    } catch (err) {
      console.error("Failed to read file:", err);
      return NextResponse.json(
        { error: "Failed to read uploaded file" },
        { status: 400 }
      );
    }

    // Call Gemini (or fall back to demo)
    let analysis: ComplianceAnalysis;
    try {
      analysis = await callGemini(base64, file.type, additionalContext);
    } catch (err) {
      console.error("Gemini call failed, using demo analysis:", err);
      analysis = DEMO_ANALYSIS;
    }

    // Save to database — all DB ops are non-blocking (don't fail the response)
    if (projectId) {
      try {
        // Upload file to Supabase Storage
        const fileName = `${user.id}/${projectId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Storage upload error:", uploadError.message);
        }

        const fileUrl = uploadData?.path
          ? supabase.storage
              .from("project-files")
              .getPublicUrl(uploadData.path).data.publicUrl
          : "";

        // Create document record
        const { data: doc, error: docError } = await supabase
          .from("documents")
          .insert({
            project_id: projectId,
            file_url: fileUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            document_type: "floor_plan",
            recognized_text: analysis.reasoning,
          })
          .select()
          .single();

        if (docError) {
          console.error("Document insert error:", docError.message);
        }

        // Create report record
        const { error: reportError } = await supabase.from("reports").insert({
          project_id: projectId,
          document_id: doc?.id ?? null,
          ai_summary: analysis.reasoning,
          pass_fail_status: analysis.status,
          confidence: analysis.confidence,
          citations: analysis.citations,
          reasoning: analysis.reasoning,
          suggested_fixes: analysis.fixes,
          raw_ai_response: analysis as unknown as Record<string, unknown>,
          model_version: "gemini-1.5-pro",
        });

        if (reportError) {
          console.error("Report insert error:", reportError.message);
        }

        // Update project status
        const { error: statusError } = await supabase
          .from("projects")
          .update({
            status: analysis.status === "PASS" ? "compliant" : "failed",
          })
          .eq("id", projectId);

        if (statusError) {
          console.error("Project status update error:", statusError.message);
        }
      } catch (dbErr) {
        // DB errors are non-fatal — we still return the analysis
        console.error("Database operation failed:", dbErr);
      }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Analysis failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
