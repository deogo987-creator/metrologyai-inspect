"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const EXTRACTION_PROMPT = `You are an expert Legal Metrology compliance inspector for India. 
Analyze this product label image and perform TWO tasks:

TASK 1: Extract all visible text and identify these mandatory declaration fields:
- productName: Product name/title
- manufacturer: Manufacturer/prepacker/importer name and address
- netQuantity: Net quantity with unit (e.g., "500 g", "1 L")
- mrp: Maximum Retail Price (must include ₹ symbol and "(Inclusive of all taxes)" or similar)
- consumerCare: Consumer care contact (phone/email/address)
- manufacturingDate: Manufacturing or packing date
- expiryDate: Expiry or "use before" date
- countryOfOrigin: Country of origin
- batchNumber: Batch or lot number
- vegNonVeg: Vegetarian/non-vegetarian mark
- fssaiLicense: FSSAI license number (required for food products)

TASK 2: For EACH field, verify compliance against these Legal Metrology rules:
1. Product name must be clearly visible and unambiguous
2. Manufacturer must include full name AND address (not just name)
3. Net quantity must use SI units (g, kg, ml, L) — not vague terms
4. MRP MUST include ₹ symbol AND "(Inclusive of all taxes)" text — missing either is a violation
5. Consumer care must include at least a phone number or email — missing entirely is HIGH severity
6. Manufacturing date must be in DD/MM/YYYY or MMM/YYYY format
7. Expiry date must be present for perishable goods
8. Country of origin must say "Made in India" or "Country of Origin: India" or similar
9. Batch number must be alphanumeric
10. For food products: FSSAI license number must be present (14-digit number)
11. Veg/Non-veg mark must be present (green dot = veg, brown dot = non-veg)

For each field, provide:
- value: the exact extracted text (or "" if not found)
- confidence: 0-100
- boundingBox: {x, y, width, height} as percentage of image (or null)
- complianceStatus: "compliant" | "violation" | "warning"
- complianceReason: specific explanation of why it complies or violates
- ruleId: the rule number (1-11) that applies

Respond with ONLY valid JSON:
{
  "fields": {
    "productName": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":1},
    "manufacturer": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":2},
    "netQuantity": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":3},
    "mrp": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":4},
    "consumerCare": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":5},
    "manufacturingDate": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":6},
    "expiryDate": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":7},
    "countryOfOrigin": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":8},
    "batchNumber": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":9},
    "vegNonVeg": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":10},
    "fssaiLicense": {"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":"","ruleId":11}
  },
  "rawText": "all visible text on label",
  "imageQuality": "good|fair|poor",
  "isFoodProduct": true|false,
  "overallAssessment": "brief summary of compliance status"
}

Rules for extraction:
- Extract EXACT text, do not paraphrase
- Include ₹ symbol for MRP
- Preserve date formats exactly
- Bounding boxes as % of image (0-100)
- Respond ONLY with valid JSON, no markdown`;

interface ExtractedFieldValue {
  value: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  complianceStatus: string;
  complianceReason: string;
  ruleId: number;
}

interface ExtractionResult {
  fields: Record<string, ExtractedFieldValue>;
  rawText: string;
  imageQuality: string;
  isFoodProduct: boolean;
  overallAssessment: string;
}

interface FieldStatus {
  fieldName: string;
  ruleId: string;
  value: string;
  confidence: number;
  status: "compliant" | "review-required" | "non-compliant";
  boundingBox?: { x: number; y: number; width: number; height: number };
  complianceReason: string;
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

const RULE_REQUIREMENTS: Record<number, { declaration: string; requirement: string; severity: "high" | "medium" | "low" }> = {
  1: { declaration: "Product Identity", requirement: "Product name must be clearly visible and unambiguous", severity: "high" },
  2: { declaration: "Manufacturer Details", requirement: "Must include full name AND complete address", severity: "high" },
  3: { declaration: "Net Quantity", requirement: "Must use SI units (g, kg, ml, L)", severity: "high" },
  4: { declaration: "MRP Declaration", requirement: "Must include ₹ symbol AND '(Inclusive of all taxes)' text", severity: "high" },
  5: { declaration: "Consumer Care Details", requirement: "Must include phone number or email address", severity: "high" },
  6: { declaration: "Date Declaration", requirement: "Must be in DD/MM/YYYY or MMM/YYYY format", severity: "high" },
  7: { declaration: "Expiry Date", requirement: "Required for perishable products", severity: "high" },
  8: { declaration: "Country of Origin", requirement: "Must clearly state country of origin", severity: "medium" },
  9: { declaration: "Batch/Lot Number", requirement: "Must be alphanumeric batch identifier", severity: "medium" },
  10: { declaration: "Veg/Non-Veg Mark", requirement: "Must have green (veg) or brown (non-veg) dot symbol", severity: "medium" },
  11: { declaration: "FSSAI License", requirement: "Required for food products — 14-digit license number", severity: "high" },
};

async function callGeminiVision(apiKey: string, imageBase64: string, mimeType: string): Promise<string> {
  const models = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"];
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: imageBase64 } }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
    };

    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!response.ok) {
        const errorText = await response.text();
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

      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) { lastError = `${model}: No text in response`; continue; }
      return text;
    } catch (err) {
      lastError = `${model}: ${err instanceof Error ? err.message : String(err)}`;
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

function normalizeFieldName(key: string): string {
  const map: Record<string, string> = {
    product_name: "productName", productname: "productName", product: "productName",
    manufacturer_name: "manufacturer", manufacturername: "manufacturer", maker: "manufacturer",
    net_quantity: "netQuantity", netquantity: "netQuantity", quantity: "netQuantity", weight: "netQuantity",
    mrp_price: "mrp", mrpprice: "mrp", price: "mrp", maximumretailprice: "mrp",
    consumer_care: "consumerCare", consumercare: "consumerCare", contact: "consumerCare", care: "consumerCare",
    manufacturing_date: "manufacturingDate", manufacturingdate: "manufacturingDate", packeddate: "manufacturingDate", mfg: "manufacturingDate",
    expiry_date: "expiryDate", expirydate: "expiryDate", usebefore: "expiryDate", exp: "expiryDate", bestbefore: "expiryDate",
    country_of_origin: "countryOfOrigin", countryoforigin: "countryOfOrigin", origin: "countryOfOrigin", madein: "countryOfOrigin",
    batch_number: "batchNumber", batchnumber: "batchNumber", lot: "batchNumber", lotnumber: "batchNumber",
    veg_non_veg: "vegNonVeg", vegnonveg: "vegNonVeg", vegetarian: "vegNonVeg", veg: "vegNonVeg",
    fssai: "fssaiLicense", fssailicense: "fssaiLicense", license: "fssaiLicense", foodlicense: "fssaiLicense",
  };
  const clean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
  return map[clean] || map[key.toLowerCase()] || key;
}

function evaluateField(fieldName: string, extracted: ExtractedFieldValue, ruleId: number): FieldStatus {
  const rule = RULE_REQUIREMENTS[ruleId];
  const hasValue = extracted.value && extracted.value.trim().length > 0;
  const confidence = extracted.confidence || 0;
  const aiCompliance = extracted.complianceStatus;

  let status: "compliant" | "review-required" | "non-compliant";

  // Trust Gemini's compliance verdict if available and confidence is reasonable
  if (aiCompliance === "violation" && confidence > 30) {
    status = "non-compliant";
  } else if (aiCompliance === "warning" && confidence > 30) {
    status = "review-required";
  } else if (aiCompliance === "compliant" && confidence >= 70) {
    status = "compliant";
  } else if (!hasValue || confidence === 0) {
    status = "non-compliant";
  } else if (confidence < 70) {
    status = "review-required";
  } else {
    status = "compliant";
  }

  return {
    fieldName,
    ruleId: String(ruleId),
    value: extracted.value || "",
    confidence,
    status,
    ...(extracted.boundingBox ? { boundingBox: extracted.boundingBox } : {}),
    complianceReason: extracted.complianceReason || "",
  };
}

function generateViolations(fields: FieldStatus[]): ViolationData[] {
  const violations: ViolationData[] = [];

  for (const field of fields) {
    const ruleId = Number(field.ruleId);
    const rule = RULE_REQUIREMENTS[ruleId];
    if (!rule) continue;

    if (field.status === "non-compliant") {
      violations.push({
        ruleId: field.ruleId,
        title: `Missing: ${rule.declaration}`,
        severity: rule.severity,
        field: field.fieldName,
        expected: rule.requirement,
        detected: field.value || "Not found on label",
        evidence: field.complianceReason || `The AI vision model scanned the label but could not find ${rule.declaration}.`,
        explanation: field.complianceReason || `Legal Metrology rules require ${rule.requirement}. This declaration was not found or could not be verified on the product label.`,
        recommendation: `Inspector should physically verify whether ${rule.declaration.toLowerCase()} exists on the product packaging.`,
      });
    } else if (field.status === "review-required") {
      violations.push({
        ruleId: field.ruleId,
        title: `Review: ${rule.declaration}`,
        severity: field.confidence < 50 ? "high" : "medium",
        field: field.fieldName,
        expected: rule.requirement,
        detected: `${field.value} — ${field.confidence}% confidence`,
        evidence: field.complianceReason || `Field detected but below automated verification threshold.`,
        explanation: field.complianceReason || `The system detected this field but with ${field.confidence}% confidence. Manual verification recommended.`,
        recommendation: `Inspector should manually verify ${rule.declaration.toLowerCase()} against the physical product label.`,
      });
    }
  }

  return violations;
}

function calculateScore(fields: FieldStatus[], isFoodProduct: boolean): {
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

    if (field.status === "compliant") {
      cat.score += mapping.weight;
    } else if (field.status === "review-required") {
      cat.score += Math.round(mapping.weight * (field.confidence / 100) * 0.6);
    }
  }

  // FSSAI bonus for food products
  if (isFoodProduct) {
    const fssai = fields.find((f) => f.fieldName === "fssaiLicense");
    if (fssai && fssai.status === "compliant") {
      const mandCat = categoryScores.find((c) => c.name === "Mandatory Declarations");
      if (mandCat) mandCat.score += 5;
    }
  }

  const avgConfidence = fields.length > 0 ? fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length : 0;
  const ocrCat = categoryScores.find((c) => c.name === "OCR Confidence");
  if (ocrCat) ocrCat.score = Math.round((avgConfidence / 100) * ocrCat.maxScore);

  const totalScore = categoryScores.reduce((sum, c) => sum + c.score, 0);
  const maxTotal = categoryScores.reduce((sum, c) => sum + c.maxScore, 0);
  const score = Math.min(100, Math.round((totalScore / maxTotal) * 100));

  const highMissing = fields.filter((f) => f.status === "non-compliant" && Number(f.ruleId) <= 7);
  let status: "compliant" | "review-required" | "non-compliant";
  if (score >= 80 && highMissing.length === 0) status = "compliant";
  else if (highMissing.length >= 2 || score < 40) status = "non-compliant";
  else status = "review-required";

  const missingFields = fields.filter((f) => f.status === "non-compliant").map((f) => f.fieldName);
  const reviewFields = fields.filter((f) => f.status === "review-required").map((f) => f.fieldName);
  const okFields = fields.filter((f) => f.status === "compliant").map((f) => f.fieldName);

  let explanation = "";
  if (status === "compliant") {
    explanation = `${okFields.length} of ${fields.length} declarations verified as compliant. Product label meets Legal Metrology requirements.`;
  } else if (status === "non-compliant") {
    explanation = `${missingFields.length} critical declaration(s) missing or non-compliant: ${missingFields.join(", ")}. ${reviewFields.length > 0 ? `Additionally, ${reviewFields.length} field(s) need manual review: ${reviewFields.join(", ")}.` : ""} Immediate inspector attention required.`;
  } else {
    explanation = `${okFields.length} declarations compliant, but ${reviewFields.length} field(s) need manual verification: ${reviewFields.join(", ")}. ${missingFields.length > 0 ? `${missingFields.length} field(s) missing: ${missingFields.join(", ")}.` : ""} Inspector review recommended.`;
  }

  return { score, status, categories: categoryScores, explanation };
}

export const analyzeLabel = action({
  args: {
    imageBase64: v.string(),
    productInfo: v.object({
      productName: v.string(), manufacturer: v.string(), brand: v.string(),
      category: v.string(), batchNumber: v.string(), mrp: v.string(),
      inspectorId: v.string(), location: v.string(), dateTime: v.string(),
    }),
  },
  handler: async (_ctx, args): Promise<ComplianceAnalysisResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    let imageData = args.imageBase64;
    let mimeType = "image/jpeg";
    if (imageData.startsWith("data:")) {
      const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) { mimeType = match[1]; imageData = match[2]; }
    }

    const responseText = await callGeminiVision(apiKey, imageData, mimeType);

    // Parse JSON
    let extraction: ExtractionResult;
    try {
      let cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      extraction = JSON.parse(cleaned.trim());
    } catch {
      extraction = { fields: {}, rawText: responseText.substring(0, 2000), imageQuality: "unknown", isFoodProduct: false, overallAssessment: "Could not parse AI response" };
    }

    // Normalize field names
    if (extraction.fields) {
      const normalized: Record<string, ExtractedFieldValue> = {};
      for (const [key, val] of Object.entries(extraction.fields)) {
        if (typeof val !== "object" || val === null) continue;
        const normKey = normalizeFieldName(key);
        const existing = normalized[normKey];
        if (!existing || ((val as ExtractedFieldValue).confidence || 0) > (existing.confidence || 0)) {
          normalized[normKey] = val as ExtractedFieldValue;
        }
      }
      extraction.fields = normalized;
    }

    // Evaluate each rule
    const fieldResults: FieldStatus[] = [];
    for (const [ruleNum] of Object.entries(RULE_REQUIREMENTS)) {
      const ruleId = Number(ruleNum);
      const fieldName = Object.entries({ 1: "productName", 2: "manufacturer", 3: "netQuantity", 4: "mrp", 5: "consumerCare", 6: "manufacturingDate", 7: "expiryDate", 8: "countryOfOrigin", 9: "batchNumber", 10: "vegNonVeg", 11: "fssaiLicense" }).find(([, v]) => true)?.[1] || "";
      // Map rule ID to field name
      const ruleToField: Record<number, string> = { 1: "productName", 2: "manufacturer", 3: "netQuantity", 4: "mrp", 5: "consumerCare", 6: "manufacturingDate", 7: "expiryDate", 8: "countryOfOrigin", 9: "batchNumber", 10: "vegNonVeg", 11: "fssaiLicense" };
      const fn = ruleToField[ruleId];
      if (!fn) continue;

      const extracted = extraction.fields[fn] || { value: "", confidence: 0, boundingBox: null, complianceStatus: "violation", complianceReason: "Field not detected", ruleId };
      fieldResults.push(evaluateField(fn, extracted as ExtractedFieldValue, ruleId));
    }

    const violations = generateViolations(fieldResults);
    const { score, status, categories, explanation } = calculateScore(fieldResults, extraction.isFoodProduct || false);

    return {
      score, status, fields: fieldResults, violations, categories,
      explanation: extraction.overallAssessment ? `${extraction.overallAssessment} ${explanation}` : explanation,
      rawOcrText: extraction.rawText || "", imageQuality: extraction.imageQuality || "unknown", mode: "live",
    };
  },
});
