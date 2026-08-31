"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// ─── OPTIMIZED PROMPT (shorter = faster, same accuracy) ─────────────────────
const EXTRACTION_PROMPT = `Extract text from this product label and identify Legal Metrology fields.

Extract these fields (use "" if not found):
- productName: Product name/title
- manufacturer: Manufacturer name AND full address
- netQuantity: Net quantity with SI unit (e.g., "500 g", "1 L")
- mrp: MRP with ₹ and "(Inclusive of all taxes)"
- consumerCare: Phone or email
- manufacturingDate: Manufacturing/packing date
- expiryDate: Expiry or "use before" date
- countryOfOrigin: Country of origin
- batchNumber: Batch/lot number
- vegNonVeg: Vegetarian/non-vegetarian indicator
- fssaiLicense: FSSAI 14-digit license (food products only)

For each field provide: value, confidence (0-100), boundingBox (null if unsure), complianceStatus ("compliant"|"violation"|"warning"), complianceReason.

Rules: MRP needs ₹+taxes text. Consumer care needs phone/email. Dates in DD/MM/YYYY or MMM/YYYY. FSSAI must be 14 digits.

Also detect: sticker overlays, covered text, altered MRP, typography issues, image manipulation.

Respond with ONLY valid JSON:
{"fields":{"productName":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"manufacturer":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"netQuantity":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"mrp":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"consumerCare":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"manufacturingDate":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"expiryDate":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"countryOfOrigin":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"batchNumber":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"vegNonVeg":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"fssaiLicense":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""}},"rawText":"","imageQuality":"good","isFoodProduct":true,"anomalies":[],"overallAssessment":""}`;

// ─── POST-PROCESSING VALIDATORS ─────────────────────────────────────────────
// Regex-based validators that catch AI mistakes after extraction

const validators: Record<string, (value: string) => { valid: boolean; corrected: string; note: string }> = {
  mrp: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "MRP not found" };
    const trimmed = value.trim();
    // Must contain ₹ or Rs
    if (!/[₹Rs]/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "MRP missing ₹ symbol" };
    }
    // Must contain a numeric value
    if (!/\d/.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "MRP missing numeric value" };
    }
    // Bonus: check for "inclusive of all taxes" mention
    const hasTaxes = /inclusive.*tax|incl.*tax|all.*tax/i.test(trimmed);
    return { valid: true, corrected: trimmed, note: hasTaxes ? "" : "MRP present but 'inclusive of all taxes' text not found in value" };
  },

  fssaiLicense: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "FSSAI not found" };
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) return { valid: true, corrected: digits, note: "" };
    if (digits.length > 0 && digits.length !== 14) {
      return { valid: false, corrected: digits, note: `FSSAI has ${digits.length} digits (expected 14)` };
    }
    return { valid: false, corrected: value.trim(), note: "FSSAI contains no valid digits" };
  },

  netQuantity: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Net quantity not found" };
    const trimmed = value.trim();
    // Must contain SI units
    if (/\b\d+\s*(g|kg|ml|l|gm|kgs|ltr|litre|liter|liters|oz|oz)\b/i.test(trimmed)) {
      return { valid: true, corrected: trimmed, note: "" };
    }
    // Check for common non-SI units that need conversion
    if (/\d+\s*(pcs|pieces|count|nos|units)/i.test(trimmed)) {
      return { valid: true, corrected: trimmed, note: "Uses count-based units (acceptable for multi-piece packs)" };
    }
    return { valid: false, corrected: trimmed, note: "Net quantity missing SI units (g, kg, ml, L)" };
  },

  consumerCare: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Consumer care contact not found" };
    const trimmed = value.trim();
    const hasPhone = /\d{10,}/.test(trimmed.replace(/[\s\-\(\)]/g, ""));
    const hasEmail = /[\w.]+@[\w.]+\.\w+/.test(trimmed);
    if (hasPhone || hasEmail) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Consumer care missing phone number or email" };
  },

  manufacturingDate: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Manufacturing date not found" };
    const trimmed = value.trim();
    // DD/MM/YYYY or DD-MM-YYYY
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    // MMM/YYYY or Month YYYY
    if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\/\-\.]*\d{2,4}/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    // YYYY-MM-DD (ISO)
    if (/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Date format not in DD/MM/YYYY or MMM/YYYY" };
  },

  expiryDate: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Expiry date not found" };
    const trimmed = value.trim();
    if (/no\s*exp|not\s*applicable|na|shelf\s*life|long\s*life/i.test(trimmed)) {
      return { valid: true, corrected: trimmed, note: "Marked as not applicable (shelf-stable product)" };
    }
    // Same date validation as manufacturingDate
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\/\-\.]*\d{2,4}/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Expiry date format not recognized" };
  },

  batchNumber: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Batch number not found" };
    const trimmed = value.trim();
    if (/^[A-Za-z0-9\-\/\.]+$/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: true, corrected: trimmed, note: "Batch number contains non-standard characters" };
  },

  countryOfOrigin: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Country of origin not found" };
    const trimmed = value.trim();
    if (/india|bharat/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/\w+/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Country of origin unclear" };
  },
};

function runPostProcessingValidators(fields: Record<string, ExtractedFieldValue>): Record<string, ExtractedFieldValue> {
  const validated = { ...fields };
  for (const [fieldName, validator] of Object.entries(validators)) {
    const field = validated[fieldName];
    if (!field || !field.value || !field.value.trim()) continue;
    const result = validator(field.value);
    if (!result.valid && field.complianceStatus === "compliant") {
      // Downgrade: AI said compliant but validator disagrees
      validated[fieldName] = {
        ...field,
        complianceStatus: "violation",
        complianceReason: result.note || field.complianceReason,
      };
    } else if (result.note && field.complianceStatus === "compliant") {
      // Add validator note to reason
      validated[fieldName] = {
        ...field,
        complianceReason: field.complianceReason ? `${field.complianceReason} [Validator: ${result.note}]` : `[Validator: ${result.note}]`,
      };
    }
  }
  return validated;
}

// ─── CROSS-VIEW VALIDATION ──────────────────────────────────────────────────
// When multiple views show the same field, cross-validate the values

function crossValidateViews(
  viewResults: Array<{ view: string; fields: Record<string, ExtractedFieldValue> }>
): { mismatches: string[]; fieldBest: Record<string, ExtractedFieldValue & { sourceView: string }> } {
  const fieldBest: Record<string, ExtractedFieldValue & { sourceView: string }> = {};
  const mismatches: string[] = [];

  for (const result of viewResults) {
    for (const [field, value] of Object.entries(result.fields)) {
      if (!value || typeof value !== "object" || !value.value) continue;
      const existing = fieldBest[field];
      if (!existing) {
        fieldBest[field] = { ...value, sourceView: result.view };
      } else {
        // Keep highest confidence, but flag mismatches
        if (value.confidence > existing.confidence) {
          // Check if values differ significantly
          const a = existing.value.toLowerCase().trim();
          const b = value.value.toLowerCase().trim();
          if (a !== b && a.length > 2 && b.length > 2) {
            mismatches.push(`${field}: "${existing.value}" (${existing.sourceView}) vs "${value.value}" (${result.view})`);
          }
          fieldBest[field] = { ...value, sourceView: result.view };
        }
      }
    }
  }
  return { mismatches, fieldBest };
}

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface ExtractedFieldValue {
  value: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  complianceStatus: string;
  complianceReason: string;
}

interface AnomalyRaw {
  type: string;
  confidence: number;
  region: { x: number; y: number; width: number; height: number };
  description: string;
}

interface ExtractionResult {
  fields: Record<string, ExtractedFieldValue>;
  rawText: string;
  imageQuality: string;
  isFoodProduct: boolean;
  anomalies: AnomalyRaw[];
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
  detectionStatus: "detected" | "uncertain" | "not-detected" | "image-insufficient";
  sourceView: string;
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

interface RiskFactor {
  factor: string;
  contribution: number;
  description: string;
}

interface NextBestAction {
  id: string;
  type: string;
  priority: number;
  title: string;
  description: string;
  affectedField?: string;
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
  imageQualityIssues: string[];
  recaptureRecommendations: { issue: string; severity: string; message: string; affectedFields: string[] }[];
  anomalies: { id: string; type: string; confidence: number; region: { x: number; y: number; width: number; height: number }; description: string; severity: string; status: string }[];
  riskPriority: { score: number; level: string; factors: RiskFactor[] };
  nextBestActions: NextBestAction[];
  inspectionSummary: { overallStatus: string; keyFindings: string[]; recommendedActions: string[]; riskLevel: string };
  declarationMap: { fieldName: string; ruleId: string; ruleName: string; sources: { view: string; imageId: string; ocrText: string; confidence: number }[]; status: string; overallConfidence: number }[];
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

const RULE_TO_FIELD: Record<number, string> = {
  1: "productName", 2: "manufacturer", 3: "netQuantity", 4: "mrp",
  5: "consumerCare", 6: "manufacturingDate", 7: "expiryDate",
  8: "countryOfOrigin", 9: "batchNumber", 10: "vegNonVeg", 11: "fssaiLicense",
};

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

function classifyDetection(confidence: number, hasValue: boolean, imageQuality: string): FieldStatus["detectionStatus"] {
  if (!hasValue || confidence === 0) {
    return imageQuality === "poor" ? "image-insufficient" : "not-detected";
  }
  if (confidence >= 70) return "detected";
  if (imageQuality === "poor" && confidence < 50) return "image-insufficient";
  return "uncertain";
}

function evaluateField(fieldName: string, extracted: ExtractedFieldValue, ruleId: number, imageQuality: string): FieldStatus {
  const hasValue = extracted.value ? extracted.value.trim().length > 0 : false;
  const confidence = extracted.confidence || 0;
  const aiCompliance = extracted.complianceStatus;

  let status: "compliant" | "review-required" | "non-compliant";
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
    detectionStatus: classifyDetection(confidence, hasValue, imageQuality),
    sourceView: "front",
  };
}

function generateViolations(fields: FieldStatus[]): ViolationData[] {
  const violations: ViolationData[] = [];
  for (const field of fields) {
    const ruleId = Number(field.ruleId);
    const rule = RULE_REQUIREMENTS[ruleId];
    if (!rule) continue;

    if (field.status === "non-compliant") {
      const detectionNote = field.detectionStatus === "image-insufficient"
        ? "Image quality was insufficient to verify this declaration."
        : "";
      violations.push({
        ruleId: field.ruleId,
        title: field.detectionStatus === "image-insufficient"
          ? `Unable to Verify: ${rule.declaration}`
          : `Missing: ${rule.declaration}`,
        severity: rule.severity,
        field: field.fieldName,
        expected: rule.requirement,
        detected: field.value || "Not found on label",
        evidence: field.complianceReason || `The AI vision model scanned the label but could not find ${rule.declaration}. ${detectionNote}`,
        explanation: field.complianceReason || `Legal Metrology rules require ${rule.requirement}. This declaration was not found or could not be verified. ${detectionNote}`,
        recommendation: field.detectionStatus === "image-insufficient"
          ? `Capture a clearer image of the area where ${rule.declaration.toLowerCase()} is expected.`
          : `Inspector should physically verify whether ${rule.declaration.toLowerCase()} exists on the product packaging.`,
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
        explanation: field.complianceReason || `The system detected this field with ${field.confidence}% confidence. ${field.detectionStatus === "uncertain" ? "The extracted text is possible but not confirmed." : "Image quality may be affecting extraction accuracy."}`,
        recommendation: field.detectionStatus === "uncertain"
          ? `Inspector should manually verify ${rule.declaration.toLowerCase()} against the physical product label.`
          : `Capture a clearer image and re-analyze for improved confidence.`,
      });
    }
  }
  return violations;
}

function calculateScore(fields: FieldStatus[], isFoodProduct: boolean): {
  score: number; status: "compliant" | "review-required" | "non-compliant";
  categories: ComplianceCategory[]; explanation: string;
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
    const cat = categoryScores.find(c => c.name === mapping.category);
    if (!cat) continue;
    if (field.status === "compliant") cat.score += mapping.weight;
    else if (field.status === "review-required") cat.score += Math.round(mapping.weight * (field.confidence / 100) * 0.6);
  }

  if (isFoodProduct) {
    const fssai = fields.find(f => f.fieldName === "fssaiLicense");
    if (fssai && fssai.status === "compliant") {
      const mandCat = categoryScores.find(c => c.name === "Mandatory Declarations");
      if (mandCat) mandCat.score += 5;
    }
  }

  const avgConfidence = fields.length > 0 ? fields.reduce((s, f) => s + f.confidence, 0) / fields.length : 0;
  const ocrCat = categoryScores.find(c => c.name === "OCR Confidence");
  if (ocrCat) ocrCat.score = Math.round((avgConfidence / 100) * ocrCat.maxScore);

  const totalScore = categoryScores.reduce((s, c) => s + c.score, 0);
  const maxTotal = categoryScores.reduce((s, c) => s + c.maxScore, 0);
  const score = Math.min(100, Math.round((totalScore / maxTotal) * 100));

  const highMissing = fields.filter(f => f.status === "non-compliant" && Number(f.ruleId) <= 7);
  let status: "compliant" | "review-required" | "non-compliant";
  if (score >= 80 && highMissing.length === 0) status = "compliant";
  else if (highMissing.length >= 2 || score < 40) status = "non-compliant";
  else status = "review-required";

  const missingFields = fields.filter(f => f.status === "non-compliant").map(f => f.fieldName);
  const reviewFields = fields.filter(f => f.status === "review-required").map(f => f.fieldName);
  const okFields = fields.filter(f => f.status === "compliant").map(f => f.fieldName);

  let explanation = "";
  if (status === "compliant") {
    explanation = `${okFields.length} of ${fields.length} declarations verified as compliant. Product label meets Legal Metrology requirements.`;
  } else if (status === "non-compliant") {
    explanation = `${missingFields.length} critical declaration(s) missing or non-compliant: ${missingFields.join(", ")}. ${reviewFields.length > 0 ? `${reviewFields.length} field(s) need review: ${reviewFields.join(", ")}.` : ""}`;
  } else {
    explanation = `${okFields.length} declarations compliant, but ${reviewFields.length} field(s) need manual verification: ${reviewFields.join(", ")}. ${missingFields.length > 0 ? `${missingFields.length} field(s) missing: ${missingFields.join(", ")}.` : ""}`;
  }

  return { score, status, categories: categoryScores, explanation };
}

function calculateRiskPriority(
  score: number, fields: FieldStatus[], anomalies: AnomalyRaw[]
): { score: number; level: string; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];
  let riskScore = 0;

  if (score < 50) {
    const c = 30; riskScore += c;
    factors.push({ factor: "Low Compliance Score", contribution: c, description: `Score ${score}/100 — significant compliance gaps.` });
  } else if (score < 70) {
    const c = 20; riskScore += c;
    factors.push({ factor: "Moderate Score", contribution: c, description: `Score ${score}/100 — areas need attention.` });
  }

  const missingCount = fields.filter(f => f.status === "non-compliant").length;
  if (missingCount > 0) {
    const c = Math.min(missingCount * 12, 25); riskScore += c;
    factors.push({ factor: "Missing Declarations", contribution: c, description: `${missingCount} declaration(s) not verified.` });
  }

  const lowConf = fields.filter(f => f.confidence > 0 && f.confidence < 60).length;
  if (lowConf > 0) {
    const c = Math.min(lowConf * 8, 15); riskScore += c;
    factors.push({ factor: "Low OCR Confidence", contribution: c, description: `${lowConf} field(s) below 60% confidence.` });
  }

  if (anomalies.length > 0) {
    const c = Math.min(anomalies.length * 7, 14); riskScore += c;
    factors.push({ factor: "Label Anomaly", contribution: c, description: `${anomalies.length} potential anomaly/anomalies detected.` });
  }

  riskScore = Math.min(riskScore, 100);
  const level = riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low";
  return { score: riskScore, level, factors };
}

function generateNextBestActions(
  fields: FieldStatus[], violations: ViolationData[], _imageQuality: string
): NextBestAction[] {
  const actions: NextBestAction[] = [];
  let priority = 1;

  const imageInsufficient = fields.filter(f => f.detectionStatus === "image-insufficient");
  if (imageInsufficient.length > 0) {
    actions.push({
      id: `action-${priority}`, type: "recapture", priority,
      title: "Capture clearer images",
      description: `${imageInsufficient.length} field(s) could not be verified due to image quality. Recapture recommended.`,
      affectedField: imageInsufficient[0].fieldName,
    });
    priority++;
  }

  const needsReview = fields.filter(f => f.status === "review-required");
  for (const f of needsReview.slice(0, 2)) {
    const rule = RULE_REQUIREMENTS[Number(f.ruleId)];
    actions.push({
      id: `action-${priority}`, type: "review-field", priority,
      title: `Verify ${rule?.declaration || f.fieldName}`,
      description: `OCR confidence is ${f.confidence}%. Manual verification recommended.`,
      affectedField: f.fieldName,
    });
    priority++;
  }

  const nonCompliant = fields.filter(f => f.status === "non-compliant");
  for (const f of nonCompliant.slice(0, 2)) {
    const rule = RULE_REQUIREMENTS[Number(f.ruleId)];
    actions.push({
      id: `action-${priority}`, type: "verify-mrp", priority,
      title: `Review ${rule?.declaration || f.fieldName}`,
      description: `Declaration is missing or non-compliant. Physical inspection required.`,
      affectedField: f.fieldName,
    });
    priority++;
  }

  if (actions.length === 0) {
    actions.push({
      id: "action-1", type: "no-action", priority: 1,
      title: "No additional action required",
      description: "All declarations verified with high confidence.",
    });
  }

  return actions;
}

function generateSummary(
  status: string, _score: number, fields: FieldStatus[], violations: ViolationData[], riskLevel: string
) {
  const keyFindings: string[] = [];
  const recommendedActions: string[] = [];

  const compliant = fields.filter(f => f.status === "compliant");
  const review = fields.filter(f => f.status === "review-required");
  const missing = fields.filter(f => f.status === "non-compliant");

  if (compliant.length > 0) {
    keyFindings.push(`${compliant.length} declaration(s) verified with high confidence.`);
  }
  if (review.length > 0) {
    keyFindings.push(`${review.length} declaration(s) require manual verification.`);
    recommendedActions.push(`Review ${review.map(f => f.fieldName).join(", ")}.`);
  }
  if (missing.length > 0) {
    keyFindings.push(`${missing.length} declaration(s) could not be found on the label.`);
    recommendedActions.push(`Physically verify ${missing.map(f => f.fieldName).join(", ")}.`);
  }

  const imageInsufficient = fields.filter(f => f.detectionStatus === "image-insufficient");
  if (imageInsufficient.length > 0) {
    keyFindings.push(`Image quality insufficient for ${imageInsufficient.length} field(s).`);
    recommendedActions.push("Recapture with improved image quality.");
  }

  if (violations.length > 0) {
    const highSev = violations.filter(v => v.severity === "high");
    if (highSev.length > 0) {
      recommendedActions.push(`Address ${highSev.length} high-severity issue(s) immediately.`);
    }
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push("No additional actions required. Product appears compliant.");
  }

  return {
    overallStatus: status === "compliant" ? "COMPLIANT" : status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED",
    keyFindings,
    recommendedActions,
    riskLevel: riskLevel.toUpperCase(),
  };
}

// ─── GEMINI CALL — SPEED OPTIMIZED ──────────────────────────────────────────
// Model order: fastest first. JSON mode enabled. Temperature 0 for consistency.

async function callGeminiVision(apiKey: string, imageBase64: string, mimeType: string): Promise<string> {
  // Currently available Gemini models (as of Aug 2026)
  // gemini-2.0-flash: SHUT DOWN
  // gemini-2.5-flash/pro: no longer available to new users
  // Only use 3.x models which are GA and available to all users
  const models = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"];
  const bodyBase = {
    contents: [{ parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: imageBase64 } }] }],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  };
  let lastError = "";

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = bodyBase;

    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!response.ok) {
        const errorText = await response.text();
        // Retry on 503 (overloaded)
        if (response.status === 503) {
          await new Promise(r => setTimeout(r, 1500));
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

// ─── PARSE GEMINI RESPONSE ──────────────────────────────────────────────────
// Handles both JSON mode (raw) and markdown-wrapped responses

function parseGeminiResponse(responseText: string): ExtractionResult {
  try {
    // JSON mode returns raw JSON; older models may wrap in markdown
    let cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleaned.trim());
  } catch {
    return { fields: {}, rawText: responseText.substring(0, 2000), imageQuality: "unknown", isFoodProduct: false, anomalies: [], overallAssessment: "Could not parse AI response" };
  }
}

// ─── MULTI-VIEW — PARALLEL (SPEED) + CROSS-VALIDATION (ACCURACY) ────────────

async function analyzeMultiView(
  apiKey: string,
  images: { base64: string; mimeType: string; view: string }[]
): Promise<{ mergedFields: Record<string, ExtractedFieldValue>; mergedRawText: string; imageQuality: string; isFoodProduct: boolean; anomalies: AnomalyRaw[]; crossViewMismatches: string[] }> {
  const qualityOrder: Record<string, number> = { good: 3, fair: 2, poor: 1, unknown: 0 };

  // SPEED: Send all images in parallel instead of sequentially
  const responses = await Promise.all(
    images.map(img => callGeminiVision(apiKey, img.base64, img.mimeType).catch(err => {
      console.error(`Failed to analyze ${img.view}: ${err}`);
      return null;
    }))
  );

  // Process all results
  const viewResults: Array<{ view: string; fields: Record<string, ExtractedFieldValue> }> = [];
  let allRawText = "";
  let worstQuality = "good";
  let isFood = false;
  const allAnomalies: AnomalyRaw[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const responseText = responses[i];
    if (!responseText) continue;

    const extraction = parseGeminiResponse(responseText);

    // Normalize field names within this view
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
      viewResults.push({ view: img.view, fields: normalized });
    }

    allRawText += `\n--- ${img.view.toUpperCase()} VIEW ---\n${extraction.rawText || ""}`;
    if (qualityOrder[extraction.imageQuality || "unknown"] < qualityOrder[worstQuality]) {
      worstQuality = extraction.imageQuality || "unknown";
    }
    if (extraction.isFoodProduct) isFood = true;
    if (extraction.anomalies) allAnomalies.push(...extraction.anomalies);
  }

  // ACCURACY: Cross-validate across views
  const { mismatches, fieldBest } = crossValidateViews(viewResults);

  // Convert back to ExtractionResult format
  const mergedFields: Record<string, ExtractedFieldValue> = {};
  for (const [field, best] of Object.entries(fieldBest)) {
    mergedFields[field] = {
      value: best.value,
      confidence: best.confidence,
      boundingBox: best.boundingBox,
      complianceStatus: best.complianceStatus,
      complianceReason: best.complianceReason,
    };
  }

  return { mergedFields, mergedRawText: allRawText.trim(), imageQuality: worstQuality, isFoodProduct: isFood, anomalies: allAnomalies, crossViewMismatches: mismatches };
}

// ─── MAIN ACTION ────────────────────────────────────────────────────────────

export const analyzeLabel = action({
  args: {
    images: v.array(v.object({
      base64: v.string(),
      view: v.string(),
    })),
    productInfo: v.object({
      productName: v.string(), manufacturer: v.string(), brand: v.string(),
      category: v.string(), batchNumber: v.string(), mrp: v.string(),
      inspectorId: v.string(), location: v.string(), dateTime: v.string(),
    }),
  },
  handler: async (_ctx, args): Promise<ComplianceAnalysisResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    // Prepare images
    const preparedImages = args.images.map(img => {
      let imageData = img.base64;
      let mimeType = "image/jpeg";
      if (imageData.startsWith("data:")) {
        const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (match) { mimeType = match[1]; imageData = match[2]; }
      }
      if (!imageData || imageData.length < 100) {
        throw new Error("Image data is empty or too small. Please upload a valid image.");
      }
      return { base64: imageData, mimeType, view: img.view };
    });

    // Multi-view or single-view analysis
    let extraction: ExtractionResult;
    if (preparedImages.length > 1) {
      const merged = await analyzeMultiView(apiKey, preparedImages);
      extraction = {
        fields: merged.mergedFields,
        rawText: merged.mergedRawText,
        imageQuality: merged.imageQuality,
        isFoodProduct: merged.isFoodProduct,
        anomalies: merged.anomalies,
        overallAssessment: `Multi-view analysis of ${preparedImages.length} images completed.${merged.crossViewMismatches.length > 0 ? ` Cross-view mismatches found: ${merged.crossViewMismatches.join("; ")}` : ""}`,
      };
    } else {
      const responseText = await callGeminiVision(apiKey, preparedImages[0].base64, preparedImages[0].mimeType);
      extraction = parseGeminiResponse(responseText);
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

    // ACCURACY: Run post-processing validators on extracted fields
    if (extraction.fields) {
      extraction.fields = runPostProcessingValidators(extraction.fields);
    }

    // Evaluate each rule
    const fieldResults: FieldStatus[] = [];
    for (const [ruleNum] of Object.entries(RULE_REQUIREMENTS)) {
      const ruleId = Number(ruleNum);
      const fn = RULE_TO_FIELD[ruleId];
      if (!fn) continue;
      const extracted = extraction.fields[fn] || { value: "", confidence: 0, boundingBox: null, complianceStatus: "violation", complianceReason: "Field not detected" };
      fieldResults.push(evaluateField(fn, extracted as ExtractedFieldValue, ruleId, extraction.imageQuality || "unknown"));
    }

    const violations = generateViolations(fieldResults);
    const { score, status, categories, explanation } = calculateScore(fieldResults, extraction.isFoodProduct || false);

    // Image quality issues & recapture recommendations
    const imageQualityIssues: string[] = [];
    const recaptureRecommendations: ComplianceAnalysisResult["recaptureRecommendations"] = [];
    if (extraction.imageQuality === "poor") {
      imageQualityIssues.push("low-lighting", "blur");
      recaptureRecommendations.push(
        { issue: "blur", severity: "critical", message: "Image appears blurred. Hold the camera steady and capture again.", affectedFields: ["all"] },
        { issue: "low-lighting", severity: "warning", message: "Image appears dark. Improve lighting and recapture.", affectedFields: ["all"] }
      );
    } else if (extraction.imageQuality === "fair") {
      imageQualityIssues.push("low-resolution");
      recaptureRecommendations.push(
        { issue: "small-text", severity: "warning", message: "Move closer to capture small declaration text.", affectedFields: fieldResults.filter(f => f.confidence < 70).map(f => f.fieldName) }
      );
    }

    // Anomalies
    const anomalies = (extraction.anomalies || []).map((a, i) => ({
      id: `anomaly-${i + 1}`,
      type: a.type,
      confidence: a.confidence || 50,
      region: a.region || { x: 0, y: 0, width: 0, height: 0 },
      description: a.description || `Potential ${a.type.replace(/-/g, " ")} detected`,
      severity: (a.confidence || 50) >= 70 ? "high" : (a.confidence || 50) >= 40 ? "medium" : "low",
      status: "detected" as const,
    }));

    // Risk Priority
    const riskPriority = calculateRiskPriority(score, fieldResults, extraction.anomalies || []);

    // Next Best Actions
    const nextBestActions = generateNextBestActions(fieldResults, violations, extraction.imageQuality || "unknown");

    // Inspection Summary
    const inspectionSummary = generateSummary(status, score, fieldResults, violations, riskPriority.level);

    // Declaration Map
    const declarationMap = fieldResults.map(f => {
      const rule = RULE_REQUIREMENTS[Number(f.ruleId)];
      return {
        fieldName: f.fieldName,
        ruleId: f.ruleId,
        ruleName: rule?.declaration || "",
        sources: [{
          view: f.sourceView || "front",
          imageId: "img-1",
          ocrText: f.value,
          confidence: f.confidence,
        }],
        status: f.status,
        overallConfidence: f.confidence,
      };
    });

    return {
      score, status, fields: fieldResults, violations, categories,
      explanation: extraction.overallAssessment ? `${extraction.overallAssessment} ${explanation}` : explanation,
      rawOcrText: extraction.rawText || "", imageQuality: extraction.imageQuality || "unknown", mode: "live",
      imageQualityIssues, recaptureRecommendations, anomalies, riskPriority, nextBestActions, inspectionSummary, declarationMap,
    };
  },
});
