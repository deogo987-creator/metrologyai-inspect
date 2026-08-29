"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// Compliance rules for Legal Metrology
const COMPLIANCE_RULES = [
  { id: "LM-001", declaration: "Product Identity", field: "productName", severity: "high" as const, requirement: "Product name must be clearly declared on the label" },
  { id: "LM-002", declaration: "Manufacturer Details", field: "manufacturer", severity: "high" as const, requirement: "Name and address of manufacturer/prepacker/importer must be declared" },
  { id: "LM-003", declaration: "Net Quantity", field: "netQuantity", severity: "high" as const, requirement: "Net quantity must be declared in standard SI units" },
  { id: "LM-004", declaration: "MRP Declaration", field: "mrp", severity: "high" as const, requirement: "Maximum Retail Price must be declared in ₹ with tax inclusion" },
  { id: "LM-005", declaration: "Consumer Care Details", field: "consumerCare", severity: "high" as const, requirement: "Consumer care contact information (phone/email) must be present" },
  { id: "LM-006", declaration: "Date Declaration", field: "manufacturingDate", severity: "high" as const, requirement: "Manufacturing/packing date and expiry/use-before date must be declared" },
  { id: "LM-007", declaration: "Country of Origin", field: "countryOfOrigin", severity: "medium" as const, requirement: "Country of origin must be declared on the package" },
  { id: "LM-008", declaration: "Batch/Lot Number", field: "batchNumber", severity: "medium" as const, requirement: "Batch or lot number must be clearly marked" },
  { id: "LM-009", declaration: "Vegetarian/Non-Veg Mark", field: "vegNonVeg", severity: "medium" as const, requirement: "Mandatory vegetarian/non-vegetarian declaration symbol" },
  { id: "LM-010", declaration: "FSSAI License", field: "fssaiLicense", severity: "high" as const, requirement: "FSSAI license number for food products" },
];

const EXTRACTION_PROMPT = `Analyze this Indian product label image for Legal Metrology compliance.

Extract these fields as JSON (use "" and 0 if not found):
{
  "fields": {
    "productName": {"value":"","confidence":0,"boundingBox":{"x":0,"y":0,"width":0,"height":0}},
    "manufacturer": {"value":"","confidence":0,"boundingBox":{"x":0,"y":0,"width":0,"height":0}},
    "netQuantity": {"value":"","confidence":0,"boundingBox":{"x":0,"y":0,"width":0,"height":0}},
    "mrp": {"value":"","confidence":0,"boundingBox":{"x":0,"y":0,"width":0,"height":0}},
    "consumerCare": {"value":"","confidence":0,"boundingBox":null},
    "manufacturingDate": {"value":"","confidence":0,"boundingBox":null},
    "expiryDate": {"value":"","confidence":0,"boundingBox":null},
    "countryOfOrigin": {"value":"","confidence":0,"boundingBox":null},
    "batchNumber": {"value":"","confidence":0,"boundingBox":null},
    "vegNonVeg": {"value":"","confidence":0,"boundingBox":null},
    "fssaiLicense": {"value":"","confidence":0,"boundingBox":null},
    "additionalInfo": {"value":"","confidence":0,"boundingBox":null}
  },
  "rawText": "all text on label",
  "imageQuality": "good|fair|poor"
}

Rules:
- Extract EXACT text, do not paraphrase
- Include ₹ symbol for MRP
- Preserve date formats exactly
- Bounding boxes as % of image (0-100)
- Respond ONLY with valid JSON, no markdown`;

interface ExtractedFieldValue {
  value: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
}

interface ExtractionResult {
  fields: Record<string, ExtractedFieldValue>;
  rawText: string;
  imageQuality: string;
}

interface FieldStatus {
  fieldName: string;
  ruleId: string;
  value: string;
  confidence: number;
  status: "compliant" | "review-required" | "non-compliant";
  boundingBox?: { x: number; y: number; width: number; height: number };
}

interface ViolationData {
  ruleId: string;
  title: string;
  severity: "high" | "medium" | "low";
  field: string;
  expected: string;
  detected: string;
  evidence: string;
  explanation: string;
  recommendation: string;
}

interface ComplianceCategory {
  name: string;
  score: number;
  maxScore: number;
}

interface ComplianceAnalysisResult {
  score: number;
  status: "compliant" | "review-required" | "non-compliant";
  fields: FieldStatus[];
  violations: ViolationData[];
  categories: ComplianceCategory[];
  explanation: string;
  rawOcrText: string;
  imageQuality: string;
  mode: "live";
}

// Direct REST API call to Gemini — more reliable than SDK
async function callGeminiVision(apiKey: string, imageBase64: string, mimeType: string): Promise<string> {
  // Try multiple models in order
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"];
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [{
        parts: [
          { text: EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Retry on 503 (overload) — wait 2s and try same model once
        if (response.status === 503) {
          await new Promise((r) => setTimeout(r, 2000));
          const retry = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
          if (retry.ok) {
            const retryData = await retry.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (retryText) return retryText;
          }
        }
        lastError = `${model}: HTTP ${response.status} - ${errorText.substring(0, 200)}`;
        continue;
      }

      const data = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = `${model}: No text in response`;
        continue;
      }

      return text;
    } catch (err) {
      lastError = `${model}: ${err instanceof Error ? err.message : String(err)}`;
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

function evaluateField(
  fieldName: string,
  ruleId: string,
  extracted: ExtractedFieldValue,
  requirement: string
): { field: FieldStatus; violation: ViolationData | null } {
  const hasValue = extracted.value && extracted.value.trim().length > 0;
  const confidence = extracted.confidence;

  let status: "compliant" | "review-required" | "non-compliant";
  if (!hasValue || confidence === 0) {
    status = "non-compliant";
  } else if (confidence < 85) {
    status = "review-required";
  } else {
    status = "compliant";
  }

  if (fieldName === "mrp" && hasValue) {
    const hasRupee = extracted.value.includes("₹") || extracted.value.includes("Rs") || extracted.value.includes("INR");
    if (!hasRupee) status = "review-required";
  }

  if ((fieldName === "manufacturingDate" || fieldName === "expiryDate") && hasValue) {
    const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*\d{2,4}/i;
    if (!datePattern.test(extracted.value)) status = "review-required";
  }

  const field: FieldStatus = {
    fieldName,
    ruleId,
    value: extracted.value,
    confidence,
    status,
    ...(extracted.boundingBox ? { boundingBox: extracted.boundingBox } : {}),
  };

  let violation: ViolationData | null = null;

  if (status === "non-compliant") {
    violation = {
      ruleId,
      title: `Missing ${requirement.split(" must")[0] || fieldName}`,
      severity: "high",
      field: fieldName,
      expected: requirement,
      detected: "Not found on label",
      evidence: `The AI vision model scanned the label but could not detect ${fieldName} in any visible region.`,
      explanation: `Legal Metrology regulations require ${requirement}. The AI system analyzed the product label image but could not reliably identify this declaration. This could be due to missing text, poor print quality, small font size, or the information being on a different part of the packaging not visible in the uploaded image.`,
      recommendation: "Inspector should verify physically whether this declaration exists on the product packaging. Check all visible sides and panels of the product.",
    };
  } else if (status === "review-required") {
    violation = {
      ruleId,
      title: `Low Confidence: ${fieldName}`,
      severity: confidence < 50 ? "high" : "medium",
      field: fieldName,
      expected: requirement,
      detected: `${extracted.value} — ${confidence}% confidence`,
      evidence: `The text was detected but OCR confidence is below the automated approval threshold of 85%.`,
      explanation: `The system detected text resembling ${fieldName} but with ${confidence}% confidence, which is below the 85% threshold for automated validation. This could be due to image quality, small font, low contrast, partial obstruction, or text being at an angle.`,
      recommendation: "Inspector should manually verify this field against the physical product label.",
    };
  }

  return { field, violation };
}

function calculateCompliance(fields: FieldStatus[], violations: ViolationData[]): {
  score: number;
  status: "compliant" | "review-required" | "non-compliant";
  categories: ComplianceCategory[];
  explanation: string;
} {
  const categoryScores: ComplianceCategory[] = [
    { name: "Mandatory Declarations", score: 0, maxScore: 20 },
    { name: "Quantity Declaration", score: 0, maxScore: 12 },
    { name: "Price Declaration", score: 0, maxScore: 14 },
    { name: "Manufacturer Details", score: 0, maxScore: 10 },
    { name: "Date Information", score: 0, maxScore: 14 },
    { name: "Consumer Information", score: 0, maxScore: 10 },
    { name: "OCR Confidence", score: 0, maxScore: 20 },
  ];

  const fieldWeights: Record<string, { category: string; weight: number }> = {
    productName: { category: "Mandatory Declarations", weight: 5 },
    manufacturer: { category: "Manufacturer Details", weight: 10 },
    netQuantity: { category: "Quantity Declaration", weight: 12 },
    mrp: { category: "Price Declaration", weight: 14 },
    consumerCare: { category: "Consumer Information", weight: 10 },
    manufacturingDate: { category: "Date Information", weight: 7 },
    expiryDate: { category: "Date Information", weight: 7 },
    countryOfOrigin: { category: "Mandatory Declarations", weight: 5 },
    batchNumber: { category: "Mandatory Declarations", weight: 5 },
    vegNonVeg: { category: "Mandatory Declarations", weight: 5 },
    fssaiLicense: { category: "Mandatory Declarations", weight: 0 },
  };

  for (const field of fields) {
    const mapping = fieldWeights[field.fieldName];
    if (!mapping) continue;
    const cat = categoryScores.find((c) => c.name === mapping.category);
    if (!cat) continue;
    let points = 0;
    if (field.status === "compliant") points = mapping.weight;
    else if (field.status === "review-required") points = Math.round(mapping.weight * (field.confidence / 100) * 0.7);
    cat.score += points;
  }

  const avgConfidence = fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length;
  const ocrCat = categoryScores.find((c) => c.name === "OCR Confidence");
  if (ocrCat) ocrCat.score = Math.round((avgConfidence / 100) * ocrCat.maxScore);

  const totalScore = categoryScores.reduce((sum, c) => sum + c.score, 0);
  const maxTotal = categoryScores.reduce((sum, c) => sum + c.maxScore, 0);
  const score = Math.round((totalScore / maxTotal) * 100);

  const hasMissingFields = violations.filter((v) => v.severity === "high" && v.title.includes("Missing")).length > 0;

  let status: "compliant" | "review-required" | "non-compliant";
  if (score >= 85 && !hasMissingFields) status = "compliant";
  else if (hasMissingFields || score < 50) status = "non-compliant";
  else status = "review-required";

  const missingFields = fields.filter((f) => f.status === "non-compliant").map((f) => f.fieldName);
  const lowConfFields = fields.filter((f) => f.status === "review-required").map((f) => f.fieldName);
  const compliantFields = fields.filter((f) => f.status === "compliant").map((f) => f.fieldName);

  let explanation = "";
  if (status === "compliant") {
    explanation = `All ${compliantFields.length} mandatory declarations have been detected with high confidence. The product label appears to meet Legal Metrology compliance requirements.`;
  } else if (status === "non-compliant") {
    explanation = `Critical compliance issues detected. ${missingFields.length > 0 ? `Missing declarations: ${missingFields.join(", ")}. ` : ""}${lowConfFields.length > 0 ? `Fields requiring review: ${lowConfFields.join(", ")}. ` : ""}Immediate inspector attention recommended.`;
  } else {
    explanation = `The label has most required declarations but several fields have OCR confidence below the automated approval threshold. ${lowConfFields.length > 0 ? `Fields needing review: ${lowConfFields.join(", ")}. ` : ""}Inspector manual verification is recommended.`;
  }

  return { score, status, categories: categoryScores, explanation };
}

export const analyzeLabel = action({
  args: {
    imageBase64: v.string(),
    productInfo: v.object({
      productName: v.string(),
      manufacturer: v.string(),
      brand: v.string(),
      category: v.string(),
      batchNumber: v.string(),
      mrp: v.string(),
      inspectorId: v.string(),
      location: v.string(),
      dateTime: v.string(),
    }),
  },
  handler: async (_ctx, args): Promise<ComplianceAnalysisResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in the project's Keys/API keys settings.");
    }

    // Extract base64 data and mime type from the data URL
    let imageData = args.imageBase64;
    let mimeType = "image/jpeg";

    if (imageData.startsWith("data:")) {
      const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageData = match[2];
      }
    }

    // Call Gemini via direct REST API
    const responseText = await callGeminiVision(apiKey, imageData, mimeType);

    // Parse JSON from response
    let extraction: ExtractionResult;
    try {
      const cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      extraction = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse AI response. Please try again with a clearer label image.");
    }

    // Run compliance evaluation
    const fieldResults: FieldStatus[] = [];
    const allViolations: ViolationData[] = [];

    for (const rule of COMPLIANCE_RULES) {
      const extractedField = extraction.fields[rule.field] || { value: "", confidence: 0, boundingBox: null };
      const { field, violation } = evaluateField(rule.field, rule.id, extractedField, rule.requirement);
      fieldResults.push(field);
      if (violation) allViolations.push(violation);
    }

    const { score, status, categories, explanation } = calculateCompliance(fieldResults, allViolations);

    return {
      score,
      status,
      fields: fieldResults,
      violations: allViolations,
      categories,
      explanation,
      rawOcrText: extraction.rawText || "",
      imageQuality: extraction.imageQuality || "unknown",
      mode: "live",
    };
  },
});
