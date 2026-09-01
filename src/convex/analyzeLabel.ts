"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

// ─── EXTRACTION PROMPT — ENHANCED FOR LEGAL METROLOGY RULES ────────────────
// Based on Legal Metrology (Packaged Commodities) Rules, 2011 — Rules 6 to 13

const EXTRACTION_PROMPT = `You are a Legal Metrology label inspector. Extract ALL text from this product label image and identify every declaration field required under the Legal Metrology (Packaged Commodities) Rules, 2011.

EXTRACT THESE FIELDS (use "" if not visible on label):

1. productName: Common or generic name of the commodity. Must be unambiguous.
2. manufacturerName: Actual corporate name or business name of manufacturer/packer/importer.
3. manufacturerAddress: Complete postal address — street, city, state, PIN code. Must be full address, not just city.
4. netQuantity: Net quantity with standard SI unit. Use: g, kg, ml, L, cm, m, cm², m², or number (N/U). Include exact value and unit.
5. mrp: Maximum Retail Price. Must include ₹ symbol. Check for "(Inclusive of all taxes)" or "inclusive of all taxes" text. Note the exact text around the price.
6. consumerCareName: Name of person/office for consumer complaints.
7. consumerCareContact: Phone number and/or email address for consumer complaints. Check for both.
8. consumerCareAddress: Address of consumer care contact (if different from manufacturer).
9. manufacturingDate: Month and year of manufacture or packing. Format: MMM/YYYY or DD/MM/YYYY. Note if only month or full date.
10. expiryDate: Expiry or "use before" date if product is perishable. "No expiry" or "Shelf life" is acceptable for non-perishables.
11. countryOfOrigin: Country where product was manufactured or assembled.
12. batchNumber: Batch, lot, or serial number for traceability.
13. vegNonVeg: Vegetarian (green dot/square) or non-vegetarian (brown dot/square) symbol. Describe what you see.
14. fssaiLicense: FSSAI license/registration number for food products. Must be 14 digits. Note exact number.
15. Dimensions: Physical dimensions of product if visible (e.g., "25cm x 10cm"). Only if clearly printed.
16. MRPTextColor: Is the MRP printed in a color that contrasts with the background? Answer: "contrasting" or "not-contrasting" or "unclear".
17. DeclarationLegibility: Are all declarations legible and prominent? Answer: "legible", "partially-legible", or "illegible".
18. StickerAlterations: Are there stickers that alter or cover any declaration? Note which declarations are covered.
19. UnitOfMeasure: What unit system is used for net quantity? "SI" (g/kg/ml/L), "non-SI" (oz/lb/gal), or "mixed".
20. QuantityQualifiers: Are there qualifying words near quantity like "minimum", "not less than", "about", "approximately", "average"? List any found.

For each field, provide:
- value: exact text found on label
- confidence: 0-100 (how certain you are about the extraction)
- boundingBox: null
- complianceStatus: "compliant" | "violation" | "warning"
- complianceReason: specific explanation of why it passes or fails

COMPLIANCE RULES TO APPLY DURING EXTRACTION:
- MRP: VIOLATION if missing ₹ symbol. WARNING if "(Inclusive of all taxes)" text is absent.
- Net Quantity: VIOLATION if using non-SI units (oz, lb, gal). WARNING if qualifying words found.
- Consumer Care: VIOLATION if no phone/email found. WARNING if only name/address without contact.
- Manufacturer: VIOLATION if only name without complete address. WARNING if address incomplete (missing PIN/city).
- Dates: VIOLATION if date format is unrecognizable. WARNING if only month without year.
- FSSAI: VIOLATION if present but not 14 digits. WARNING if food product but FSSAI not found.
- Legibility: WARNING if text is partially readable.
- Sticker: WARNING if stickers cover any required declaration.

Detect anomalies: sticker overlays covering declarations, covered/obscured text, altered MRP patches, typography inconsistencies, image manipulation.

Respond with ONLY valid JSON (no markdown):
{"fields":{"productName":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"manufacturerName":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"manufacturerAddress":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"netQuantity":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"mrp":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"consumerCareName":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"consumerCareContact":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"consumerCareAddress":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"manufacturingDate":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"expiryDate":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"countryOfOrigin":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"batchNumber":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"vegNonVeg":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"fssaiLicense":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"dimensions":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"mrpTextColor":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"declarationLegibility":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"stickerAlterations":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"unitOfMeasure":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""},"quantityQualifiers":{"value":"","confidence":0,"boundingBox":null,"complianceStatus":"compliant","complianceReason":""}},"rawText":"","imageQuality":"good","isFoodProduct":false,"anomalies":[],"overallAssessment":""}`;

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
  ruleReference: string;
  title: string;
  severity: "high" | "medium" | "low";
  field: string;
  expected: string;
  detected: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  legalReference: string;
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
  declarationMap: { fieldName: string; ruleId: string; ruleName: string; ruleReference: string; sources: { view: string; imageId: string; ocrText: string; confidence: number }[]; status: string; overallConfidence: number }[];
}

// ─── ACTUAL LEGAL METROLOGY RULES (Packaged Commodities Rules, 2011) ────────
// Rules 6 through 13 — each mapped to a specific legal provision

interface LegalRule {
  id: number;
  ruleReference: string;
  declaration: string;
  requirement: string;
  legalText: string;
  severity: "high" | "medium" | "low";
  category: string;
  exemptions: string[];
}

const LEGAL_RULES: Record<number, LegalRule> = {
  1: {
    id: 1,
    ruleReference: "Rule 6(1)(a)",
    declaration: "Manufacturer/Packer/Importer Name & Address",
    requirement: "Name and complete address of manufacturer, or manufacturer + packer, or importer (for imported goods) must be declared. Address must include street, city, state, and PIN code.",
    legalText: "Every package shall bear the name and address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and packer and for any imported package the name and address of the importer. 'Complete address' means postal address including street, city, state and PIN code.",
    severity: "high",
    category: "Mandatory Declarations",
    exemptions: ["Packages of capacity 5 cubic cm or less — a mark/inscription enabling identification is sufficient"],
  },
  2: {
    id: 2,
    ruleReference: "Rule 6(1)(b)",
    declaration: "Product Identity (Common/Generic Name)",
    requirement: "The common or generic name of the commodity must be declared. For multi-product packages, name and quantity of each product must be mentioned.",
    legalText: "The common or generic names of the commodity contained in the package and in case of packages with more than one product, the name and number or quantity of each product shall be mentioned on the package.",
    severity: "high",
    category: "Mandatory Declarations",
    exemptions: [],
  },
  3: {
    id: 3,
    ruleReference: "Rule 6(1)(c) + Rule 11 + Rule 12",
    declaration: "Net Quantity Declaration",
    requirement: "Net quantity must be declared in standard SI units: mass (g/kg) for solids, volume (ml/L) for liquids, length (cm/m) for linear, area (cm²/m²) for area, or number (N/U) for count. Must not use qualifying words like 'minimum', 'about', 'approximately'.",
    legalText: "The net quantity, in terms of the standard unit of weight or measure, of the commodity contained in the package shall be mentioned. The declaration of quantity shall not contain any word or expression which tends to create an exaggerated, misleading or inadequate impression as to the quantity — e.g., 'minimum', 'not less than', 'average', 'about', 'approximately'.",
    severity: "high",
    category: "Quantity Declaration",
    exemptions: ["Commodities in Third Schedule may use 'when packed' qualifier"],
  },
  4: {
    id: 4,
    ruleReference: "Rule 6(1)(d) + Rule 6(1)(g)(B)",
    declaration: "Manufacturing/Packing Date",
    requirement: "Month and year of manufacture, packing, or import must be declared. Can be in words, numerals, or both. For food products with 'best before' ≤ 90 days, packaging material from previous month cannot be reused.",
    legalText: "The month and year in which the commodity is manufactured or pre-packed or imported shall be mentioned in the package. The month and year may be expressed either in words, or by numerals indicating the month and the year, or by both.",
    severity: "high",
    category: "Date Declarations",
    exemptions: [
      "Bidis or incense sticks — no date declaration required",
      "Domestic LPG cylinders (14.2kg or 5kg) bottled by public sector undertakings",
    ],
  },
  5: {
    id: 5,
    ruleReference: "Rule 6(1)(e)",
    declaration: "Retail Sale Price (MRP)",
    requirement: "The retail sale price must be declared on the package. MRP must include ₹ symbol and '(Inclusive of all taxes)' text. A sticker reducing MRP is permitted but must not cover original MRP.",
    legalText: "The retail sale price of the package shall be mentioned. For reducing the Maximum Retail Price (MRP), a sticker with the revised lower MRP (inclusive of all taxes) may be affixed and the same shall not cover the MRP declaration made by the manufacturer or the packer.",
    severity: "high",
    category: "Price Declaration",
    exemptions: [
      "Bidis — no retail sale price required",
      "Domestic LPG cylinders under Administrative Price Mechanism",
      "Alcoholic beverages — governed by State Excise Laws; if state laws don't require RSP declaration, these rules apply",
    ],
  },
  6: {
    id: 6,
    ruleReference: "Rule 6(2)",
    declaration: "Consumer Care Contact Details",
    requirement: "Name, address, telephone number, and email address (if available) of the person/office to be contacted for consumer complaints must be declared.",
    legalText: "Every package shall bear the name, address, telephone number, e-mail address, if available, of the person who can be or the office which can be, contacted, in case of consumer complaints.",
    severity: "high",
    category: "Consumer Information",
    exemptions: [],
  },
  7: {
    id: 7,
    ruleReference: "Rule 6(3) + Rule 6(4)",
    declaration: "No Unauthorized Sticker Alterations",
    requirement: "Individual stickers shall NOT be used to alter or make declarations required under these rules. Exception: MRP reduction sticker is permitted (must not cover original MRP). Stickers may be used for non-mandatory declarations.",
    legalText: "It shall not be permissible to affix individual stickers on the package for altering or making declaration required under these rules: Provided that for reducing the Maximum Retail Price (MRP), a sticker with the revised lower MRP (inclusive of all taxes) may be affixed.",
    severity: "medium",
    category: "Label Integrity",
    exemptions: ["MRP reduction stickers are permitted"],
  },
  8: {
    id: 8,
    ruleReference: "Rule 9(1)(a) + Rule 9(1)(b)",
    declaration: "Declaration Legibility & Contrast",
    requirement: "All declarations must be legible and prominent. Numerals for retail sale price and net quantity must be printed in a color that contrasts conspicuously with the background. Minimum letter height: 1mm (2mm when blown/molded).",
    legalText: "Every declaration shall be legible and prominent; numerals of the retail sale price and net quantity declaration shall be printed, painted or inscribed on the package in a colour that contrasts conspicuously with the background of the label.",
    severity: "medium",
    category: "Label Quality",
    exemptions: [
      "Glass/plastic with blown/formed/molded information need not use contrasting colour",
    ],
  },
  9: {
    id: 9,
    ruleReference: "Rule 9(4)",
    declaration: "Language of Declaration",
    requirement: "Declarations must be in Hindi (Devanagari script) or English. Other languages may be used in addition to Hindi or English.",
    legalText: "The particulars of the declarations required to be specified under this rule on a package shall either be in Hindi in Devnagri script or in English: Provided that nothing contained in this sub-rule shall prevent the use of any other language in addition to Hindi or English language.",
    severity: "medium",
    category: "Label Quality",
    exemptions: [],
  },
  10: {
    id: 10,
    ruleReference: "Rule 12(6)",
    declaration: "No Misleading Quantity Qualifiers",
    requirement: "The declaration of quantity shall NOT contain any word or expression which tends to create an exaggerated, misleading or inadequate impression — e.g., 'minimum', 'not less than', 'average', 'about', 'approximately'.",
    legalText: "The declaration of quantity under these Rules shall not contain any word or expression of any sort, whatsoever, which tends to create or likely to create an exaggerated, misleading or inadequate expression as to the quantity of the commodity contained in the package.",
    severity: "high",
    category: "Quantity Declaration",
    exemptions: [],
  },
  11: {
    id: 11,
    ruleReference: "Rule 13",
    declaration: "Correct SI Unit Usage",
    requirement: "Units must follow SI standards: mass in g (under 1kg) or kg (1kg+); volume in ml (under 1L) or L (1L+); length in cm (under 1m) or m (1m+). Dozen, score, gross etc. are prohibited. Items sold by number must use 'N' or 'U'.",
    legalText: "The units of weight or measure or number shall be specified in accordance with SI units. No system of units other than the International System of Units shall be used. No number called the dozen, score, gross, great gross or the like shall be specified.",
    severity: "high",
    category: "Quantity Declaration",
    exemptions: ["Fourth Schedule commodities have specific unit requirements"],
  },
  12: {
    id: 12,
    ruleReference: "Rule 7",
    declaration: "Principal Display Panel Requirements",
    requirement: "Declarations must appear on the principal display panel. Quantity declaration area must have clearance: space equal to numeral height above/below, and twice numeral height left/right. Min numeral height per Table-I and Table-II.",
    legalText: "Every declaration required to be made under these rules shall appear on the principal display panel. The area surrounding the quantity declaration shall be free from printed information — above and below by a space equal to at least the height of the numeral, and to the left and right by a space at least twice the height.",
    severity: "medium",
    category: "Label Quality",
    exemptions: ["Packages ≤ 5 cubic cm may use affixed card/tape"],
  },
  13: {
    id: 13,
    ruleReference: "Rule 6(1)(f)",
    declaration: "Dimensions (When Relevant)",
    requirement: "Where the sizes of the commodity are relevant, the dimensions must be declared. If different pieces have different dimensions, each must be mentioned separately.",
    legalText: "Where the sizes of the commodity contained in the package are relevant, the dimensions of the commodity contained in the package and if the dimensions of the different pieces are different, the dimensions of each such different piece shall be mentioned.",
    severity: "medium",
    category: "Mandatory Declarations",
    exemptions: [],
  },
  14: {
    id: 14,
    ruleReference: "Rule 6(1)(d) + FSSAI",
    declaration: "Expiry / Best Before Date",
    requirement: "For products with limited shelf life, expiry date or 'best before'/'use before' date must be declared. For food products with shelf life ≤ 90 days from manufacture, special packaging rules apply.",
    legalText: "For packages containing food articles, the provisions of the Prevention of Food Adulteration Act, 1954 and the rules made there under shall apply. Products with limited shelf life must declare expiry or 'use before' date.",
    severity: "high",
    category: "Date Declarations",
    exemptions: ["Products without shelf life (non-perishable) may state 'No expiry' or similar"],
  },
};

// Map rule IDs to internal field names used by the extraction
const RULE_TO_FIELDS: Record<number, string[]> = {
  1: ["manufacturerName", "manufacturerAddress"],
  2: ["productName"],
  3: ["netQuantity", "unitOfMeasure", "quantityQualifiers"],
  4: ["manufacturingDate"],
  5: ["mrp", "mrpTextColor"],
  6: ["consumerCareName", "consumerCareContact", "consumerCareAddress"],
  7: ["stickerAlterations"],
  8: ["declarationLegibility"],
  9: [], // language check — applied to all text
  10: ["quantityQualifiers"],
  11: ["unitOfMeasure"],
  12: ["declarationLegibility"],
  13: ["dimensions"],
  14: ["expiryDate"],
};

// ─── POST-PROCESSING VALIDATORS ─────────────────────────────────────────────
// Regex-based validators that catch AI mistakes after extraction
// Each validator checks compliance against the actual Legal Metrology rule

const validators: Record<string, (value: string) => { valid: boolean; corrected: string; note: string; violationType?: string }> = {
  mrp: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "MRP not found on label", violationType: "missing" };
    const trimmed = value.trim();
    // Rule 6(1)(e): Must contain ₹ or Rs
    if (!/[₹Rs]/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "MRP missing ₹ symbol — Rule 6(1)(e) requires retail sale price declaration", violationType: "format" };
    }
    // Must contain a numeric value
    if (!/\d/.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "MRP missing numeric value", violationType: "format" };
    }
    // Rule 6(3): Check for "(Inclusive of all taxes)" text
    const hasTaxes = /inclusive.*all.*tax|incl.*all.*tax/i.test(trimmed);
    if (!hasTaxes) {
      return { valid: true, corrected: trimmed, note: "MRP present but '(Inclusive of all taxes)' text not found — Rule 6(1)(e) requires tax inclusion", violationType: "warning" };
    }
    return { valid: true, corrected: trimmed, note: "" };
  },

  fssaiLicense: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "FSSAI license not found — required for food products", violationType: "missing" };
    const digits = value.replace(/\D/g, "");
    if (digits.length === 14) return { valid: true, corrected: digits, note: "" };
    if (digits.length > 0 && digits.length !== 14) {
      return { valid: false, corrected: digits, note: `FSSAI has ${digits.length} digits (expected 14) — invalid license format`, violationType: "format" };
    }
    return { valid: false, corrected: value.trim(), note: "FSSAI contains no valid digits", violationType: "format" };
  },

  netQuantity: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Net quantity not found on label", violationType: "missing" };
    const trimmed = value.trim();
    // Rule 13: Must use SI units
    if (/\b\d+\.?\d*\s*(g|kg|ml|l|gm|kgs|ltr|litre|liter|liters)\b/i.test(trimmed)) {
      // Rule 12(6): Check for misleading qualifiers
      const hasQualifiers = /\b(minimum|min\.|not\s*less\s*than|about|approximately|approx\.|average|avg\.|nearly|circa)\b/i.test(trimmed);
      if (hasQualifiers) {
        return { valid: false, corrected: trimmed, note: "Net quantity contains misleading qualifier word — Rule 12(6) prohibits 'minimum', 'about', 'approximately' etc.", violationType: "qualifier" };
      }
      return { valid: true, corrected: trimmed, note: "" };
    }
    // Check for count-based units (Rule 12(2)(e))
    if (/\d+\s*(pcs|pieces|count|nos?|units?|n\b|u\b)/i.test(trimmed)) {
      return { valid: true, corrected: trimmed, note: "Count-based unit — Rule 12(2)(e) permits number declaration" };
    }
    // Rule 11: Non-SI units
    if (/\d+\s*(oz|oz\.|lb|lbs|gal|gallon|pound|ounce)/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "Non-SI units detected (oz/lb/gal) — Rule 13 requires International System of Units", violationType: "non-si" };
    }
    // Rule 13: Prohibited units
    if (/\b(doz|dozen|score|gross|great\s*gross)\b/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "Prohibited counting unit (dozen/score/gross) — Rule 13(4) prohibits these", violationType: "prohibited-unit" };
    }
    return { valid: false, corrected: trimmed, note: "Net quantity missing standard SI units (g, kg, ml, L)", violationType: "format" };
  },

  consumerCareContact: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Consumer care contact not found — Rule 6(2) requires phone/email", violationType: "missing" };
    const trimmed = value.trim();
    const digits = trimmed.replace(/[\s\-\(\)]/g, "");
    const hasPhone = /\d{10,}/.test(digits);
    const hasEmail = /[\w.]+@[\w.]+\.\w+/.test(trimmed);
    if (hasPhone || hasEmail) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Consumer care missing phone number or email — Rule 6(2) requires contact details", violationType: "incomplete" };
  },

  manufacturingDate: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Manufacturing/packing date not found — Rule 6(1)(d) requires month and year", violationType: "missing" };
    const trimmed = value.trim();
    // DD/MM/YYYY or DD-MM-YYYY
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    // MMM/YYYY or Month YYYY
    if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\/\-\.]*\d{2,4}/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    // YYYY-MM-DD (ISO)
    if (/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    // Month only without year
    if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed) && !/\d{4}/.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "Date has month but missing year — Rule 6(1)(d) requires both month and year", violationType: "incomplete" };
    }
    return { valid: false, corrected: trimmed, note: "Date format not recognized — must be DD/MM/YYYY or MMM/YYYY per Rule 6(1)(d)", violationType: "format" };
  },

  expiryDate: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Expiry/best-before date not found — required for perishable products", violationType: "missing" };
    const trimmed = value.trim();
    if (/no\s*exp|not\s*applicable|na|shelf\s*life|long\s*life|no\s*expiry|nil/i.test(trimmed)) {
      return { valid: true, corrected: trimmed, note: "Marked as not applicable — acceptable for non-perishable products" };
    }
    // Same date validation
    if (/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\/\-\.]*\d{2,4}/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Expiry date format not recognized", violationType: "format" };
  },

  manufacturerAddress: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Manufacturer address not found — Rule 6(1)(a) requires complete address", violationType: "missing" };
    const trimmed = value.trim();
    // Check for complete address: should have city, state, or PIN
    const hasPin = /\b\d{6}\b/.test(trimmed);
    const hasState = /\b(andhra|arunachal|assam|bihar|chhattisgarh|goa|gujarat|haryana|himachal|jharkhand|karnataka|kerala|madhya|maharashtra|manipur|meghalaya|mizoram|nagaland|odisha|orissa|punjab|rajasthan|sikkim|tamil|telangana|tripura|uttar|uttarakhand|west\s*bengal|delhi|chandigarh|puducherry|jammu|kashmir|ladakh|india)\b/i.test(trimmed);
    if (hasPin || hasState) return { valid: true, corrected: trimmed, note: "" };
    return { valid: true, corrected: trimmed, note: "Address may be incomplete — Rule 6(1)(a) requires complete postal address with PIN code" };
  },

  batchNumber: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Batch/lot number not found", violationType: "missing" };
    const trimmed = value.trim();
    if (/^[A-Za-z0-9\-\/\.]+$/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: true, corrected: trimmed, note: "Batch number contains non-standard characters" };
  },

  countryOfOrigin: (value: string) => {
    if (!value || !value.trim()) return { valid: false, corrected: "", note: "Country of origin not found", violationType: "missing" };
    const trimmed = value.trim();
    if (/india|bharat/i.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    if (/\w+/.test(trimmed)) return { valid: true, corrected: trimmed, note: "" };
    return { valid: false, corrected: trimmed, note: "Country of origin unclear" };
  },

  stickerAlterations: (value: string) => {
    if (!value || !value.trim()) return { valid: true, corrected: "", note: "" };
    const trimmed = value.trim();
    // Rule 6(3): Stickers altering declarations are not permitted (except MRP reduction)
    if (/sticker|label\s*over|cover|alter|paste|affix/i.test(trimmed)) {
      if (/mrp|price|reduc/i.test(trimmed)) {
        return { valid: true, corrected: trimmed, note: "MRP reduction sticker — permitted under Rule 6(3) proviso" };
      }
      return { valid: false, corrected: trimmed, note: "Sticker altering declaration detected — Rule 6(3) prohibits stickers on mandatory declarations", violationType: "sticker" };
    }
    return { valid: true, corrected: trimmed, note: "" };
  },

  declarationLegibility: (value: string) => {
    if (!value || !value.trim()) return { valid: true, corrected: "", note: "" };
    const trimmed = value.toLowerCase();
    if (/illegible|not\s*readable|cannot\s*read|blur|unclear/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "Declarations not legible — Rule 9(1)(a) requires all declarations to be legible and prominent", violationType: "illegible" };
    }
    if (/partially/i.test(trimmed)) {
      return { valid: false, corrected: trimmed, note: "Partially legible declarations — Rule 9(1)(a) requires all to be legible", violationType: "partially-illegible" };
    }
    return { valid: true, corrected: trimmed, note: "" };
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
        complianceStatus: result.violationType === "sticker" || result.violationType === "illegible" || result.violationType === "partially-illegible" ? "warning" : "violation",
        complianceReason: result.note || field.complianceReason,
      };
    } else if (result.note && result.violationType === "warning" && field.complianceStatus === "compliant") {
      validated[fieldName] = {
        ...field,
        complianceStatus: "warning",
        complianceReason: field.complianceReason ? `${field.complianceReason} [Rule: ${result.note}]` : `[Rule: ${result.note}]`,
      };
    }
  }
  return validated;
}

// ─── CROSS-VIEW VALIDATION ──────────────────────────────────────────────────

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
        if (value.confidence > existing.confidence) {
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

// ─── FIELD NORMALIZATION ────────────────────────────────────────────────────

function normalizeFieldName(key: string): string {
  const map: Record<string, string> = {
    product_name: "productName", productname: "productName", product: "productName", commodity: "productName",
    manufacturer_name: "manufacturerName", manufacturername: "manufacturerName", maker: "manufacturerName", manufacturer: "manufacturerName",
    manufacturer_address: "manufacturerAddress", manufactureraddress: "manufacturerAddress", address: "manufacturerAddress", mfgaddress: "manufacturerAddress",
    net_quantity: "netQuantity", netquantity: "netQuantity", quantity: "netQuantity", weight: "netQuantity", netweight: "netQuantity",
    mrp_price: "mrp", mrpprice: "mrp", price: "mrp", maximumretailprice: "mrp", mrp: "mrp", retailsaleprice: "mrp",
    consumer_care_name: "consumerCareName", consumercarename: "consumerCareName", carename: "consumerCareName",
    consumer_care_contact: "consumerCareContact", consumercarecontact: "consumerCareContact", contact: "consumerCareContact", phone: "consumerCareContact", email: "consumerCareContact",
    consumer_care_address: "consumerCareAddress", consumercareaddress: "consumerCareAddress",
    consumer_care: "consumerCareContact", consumercare: "consumerCareContact", care: "consumerCareContact",
    manufacturing_date: "manufacturingDate", manufacturingdate: "manufacturingDate", packeddate: "manufacturingDate", mfg: "manufacturingDate", mfgdate: "manufacturingDate", dateofmanufacture: "manufacturingDate",
    expiry_date: "expiryDate", expirydate: "expiryDate", usebefore: "expiryDate", exp: "expiryDate", bestbefore: "expiryDate", useby: "expiryDate", shelflife: "expiryDate",
    country_of_origin: "countryOfOrigin", countryoforigin: "countryOfOrigin", origin: "countryOfOrigin", madein: "countryOfOrigin", country: "countryOfOrigin",
    batch_number: "batchNumber", batchnumber: "batchNumber", lot: "batchNumber", lotnumber: "batchNumber", batch: "batchNumber", lotno: "batchNumber",
    veg_non_veg: "vegNonVeg", vegnonveg: "vegNonVeg", vegetarian: "vegNonVeg", veg: "vegNonVeg", nonveg: "vegNonVeg",
    fssai: "fssaiLicense", fssailicense: "fssaiLicense", license: "fssaiLicense", foodlicense: "fssaiLicense", fssaino: "fssaiLicense",
    dimensions: "dimensions", size: "dimensions", dimensionsize: "dimensions",
    mrp_text_color: "mrpTextColor", mrptextcolor: "mrpTextColor", textcontrast: "mrpTextColor", color: "mrpTextColor",
    declaration_legibility: "declarationLegibility", declarationlegibility: "declarationLegibility", legibility: "declarationLegibility", readable: "declarationLegibility",
    sticker_alterations: "stickerAlterations", stickeralterations: "stickerAlterations", stickers: "stickerAlterations", sticker: "stickerAlterations",
    unit_of_measure: "unitOfMeasure", unitofmeasure: "unitOfMeasure", unit: "unitOfMeasure", unitsystem: "unitOfMeasure",
    quantity_qualifiers: "quantityQualifiers", quantityqualifiers: "quantityQualifiers", qualifiers: "quantityQualifiers", qualifierwords: "quantityQualifiers",
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

// ─── RULE EVALUATION ENGINE ─────────────────────────────────────────────────
// Each rule is evaluated against actual Legal Metrology provisions

function evaluateField(fieldName: string, extracted: ExtractedFieldValue, ruleId: number, imageQuality: string): FieldStatus {
  const hasValue = extracted.value ? extracted.value.trim().length > 0 : false;
  const confidence = extracted.confidence || 0;
  const aiCompliance = extracted.complianceStatus;

  let status: "compliant" | "review-required" | "non-compliant";

  // Rule-specific evaluation logic
  switch (ruleId) {
    case 1: // Rule 6(1)(a) — Manufacturer name AND address required
      if (fieldName === "manufacturerName" && hasValue && confidence >= 70) {
        // Check if address is also present
        status = aiCompliance === "violation" ? "non-compliant" : "compliant";
      } else if (fieldName === "manufacturerAddress" && hasValue && confidence >= 70) {
        // Check for complete address (PIN code, state)
        const hasPin = /\b\d{6}\b/.test(extracted.value);
        const hasState = /\b(andhra|bihar|delhi|goa|gujarat|haryana|karnataka|kerala|maharashtra|rajasthan|tamil|telangana|up|uttar|west\s*bengal|mp|chhattisgarh|jharkhand|odisha|punjab|himachal|uk|assam|meghalaya|manipur|nagaland|sikkim|arunachal|mizoram|tripura|goa|chandigarh|puducherry|jammu|kashmir|ladakh|india)\b/i.test(extracted.value);
        if (!hasPin && !hasState && confidence < 85) {
          status = "review-required";
        } else {
          status = aiCompliance === "violation" ? "non-compliant" : "compliant";
        }
      } else {
        status = !hasValue ? "non-compliant" : confidence < 70 ? "review-required" : "compliant";
      }
      break;

    case 3: // Rule 6(1)(c) + Rule 11 + Rule 12 — Net quantity in SI units
      if (hasValue) {
        const val = extracted.value.toLowerCase();
        // Rule 13: Non-SI units = violation
        if (/\b(oz|oz\.|lb|lbs|gal|gallon|pound|ounce)\b/.test(val)) {
          status = "non-compliant";
        }
        // Rule 12(6): Misleading qualifiers = violation
        else if (/\b(minimum|min\.|not\s*less\s*than|about|approximately|approx\.|average|avg\.|nearly)\b/.test(val)) {
          status = "non-compliant";
        }
        // Rule 13: Prohibited counting units
        else if (/\b(doz|dozen|score|gross|great\s*gross)\b/.test(val)) {
          status = "non-compliant";
        }
        else {
          status = aiCompliance === "violation" ? "non-compliant" : "compliant";
        }
      } else {
        status = "non-compliant";
      }
      break;

    case 5: // Rule 6(1)(e) — MRP with ₹ and inclusive text
      if (hasValue) {
        const val = extracted.value;
        const hasRupee = /[₹Rs]/i.test(val);
        const hasTaxes = /inclusive.*all.*tax|incl.*all.*tax/i.test(val);
        if (!hasRupee) {
          status = "non-compliant"; // Rule 6(1)(e) violation
        } else if (!hasTaxes) {
          status = "review-required"; // Warning — present but missing tax text
        } else {
          status = "compliant";
        }
      } else {
        status = "non-compliant";
      }
      break;

    case 6: // Rule 6(2) — Consumer care: name, address, phone, email
      if (hasValue) {
        const val = extracted.value;
        const hasPhone = /\d{10,}/.test(val.replace(/[\s\-\(\)]/g, ""));
        const hasEmail = /[\w.]+@[\w.]+\.\w+/.test(val);
        if (!hasPhone && !hasEmail) {
          status = "non-compliant"; // Rule 6(2) requires phone/email
        } else {
          status = "compliant";
        }
      } else {
        status = "non-compliant";
      }
      break;

    case 7: // Rule 6(3) — No sticker alterations (except MRP reduction)
      if (hasValue && /sticker|cover|alter|paste|affix/i.test(extracted.value) && !/mrp|price|reduc/i.test(extracted.value)) {
        status = "review-required"; // Flagged for inspector review
      } else {
        status = "compliant";
      }
      break;

    case 8: // Rule 9(1)(a) — Legibility
      if (hasValue && /illegible|not\s*readable|cannot\s*read|blur|unclear/i.test(extracted.value)) {
        status = "non-compliant";
      } else if (hasValue && /partially/i.test(extracted.value)) {
        status = "review-required";
      } else {
        status = "compliant";
      }
      break;

    case 10: // Rule 12(6) — No misleading quantity qualifiers
      if (hasValue && /\b(minimum|min\.|not\s*less\s*than|about|approximately|approx\.|average|avg\.|nearly|circa)\b/i.test(extracted.value)) {
        status = "non-compliant";
      } else {
        status = "compliant";
      }
      break;

    case 11: // Rule 13 — Correct SI units
      if (hasValue) {
        const val = extracted.value.toLowerCase();
        if (/\b(oz|oz\.|lb|lbs|gal|gallon|pound|ounce)\b/.test(val)) {
          status = "non-compliant";
        } else if (/\b(doz|dozen|score|gross|great\s*gross)\b/.test(val)) {
          status = "non-compliant";
        } else {
          status = "compliant";
        }
      } else {
        status = "non-compliant";
      }
      break;

    default: // Generic evaluation for other rules
      if (aiCompliance === "violation" && confidence > 30) {
        status = "non-compliant";
      } else if (aiCompliance === "warning" && confidence > 30) {
        status = "review-required";
      } else if (!hasValue || confidence === 0) {
        status = "non-compliant";
      } else if (confidence < 70) {
        status = "review-required";
      } else {
        status = "compliant";
      }
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

// ─── VIOLATION GENERATION — WITH LEGAL REFERENCES ───────────────────────────

function generateViolations(fields: FieldStatus[]): ViolationData[] {
  const violations: ViolationData[] = [];
  for (const field of fields) {
    const ruleId = Number(field.ruleId);
    const rule = LEGAL_RULES[ruleId];
    if (!rule) continue;

    if (field.status === "non-compliant") {
      const detectionNote = field.detectionStatus === "image-insufficient"
        ? "Image quality was insufficient to verify this declaration."
        : "";
      violations.push({
        ruleId: field.ruleId,
        ruleReference: rule.ruleReference,
        title: field.detectionStatus === "image-insufficient"
          ? `Unable to Verify: ${rule.declaration}`
          : `Violation: ${rule.declaration}`,
        severity: rule.severity,
        field: field.fieldName,
        expected: rule.requirement,
        detected: field.value || "Not found on label",
        evidence: field.complianceReason || `The AI vision model scanned the label but could not verify ${rule.declaration}. ${detectionNote}`,
        explanation: field.complianceReason || `${rule.legalText} This declaration was not found or could not be verified on the label. ${detectionNote}`,
        recommendation: field.detectionStatus === "image-insufficient"
          ? `Capture a clearer image of the area where ${rule.declaration.toLowerCase()} is expected.`
          : `Inspector should physically verify whether ${rule.declaration.toLowerCase()} exists on the product packaging and complies with ${rule.ruleReference}.`,
        legalReference: `${rule.ruleReference} — ${rule.declaration}`,
      });
    } else if (field.status === "review-required") {
      violations.push({
        ruleId: field.ruleId,
        ruleReference: rule.ruleReference,
        title: `Review Required: ${rule.declaration}`,
        severity: field.confidence < 50 ? "high" : "medium",
        field: field.fieldName,
        expected: rule.requirement,
        detected: `${field.value} — ${field.confidence}% confidence`,
        evidence: field.complianceReason || `Field detected but below automated verification threshold.`,
        explanation: field.complianceReason || `The system detected this field with ${field.confidence}% confidence. ${field.detectionStatus === "uncertain" ? "The extracted text is possible but not confirmed." : "Image quality may be affecting extraction accuracy."} Per ${rule.ruleReference}: ${rule.requirement}`,
        recommendation: field.detectionStatus === "uncertain"
          ? `Inspector should manually verify ${rule.declaration.toLowerCase()} against the physical product label per ${rule.ruleReference}.`
          : `Capture a clearer image and re-analyze for improved confidence.`,
        legalReference: `${rule.ruleReference} — ${rule.declaration}`,
      });
    }
  }
  return violations;
}

// ─── SCORING ENGINE — WEIGHTED BY RULE SEVERITY ─────────────────────────────

function calculateScore(fields: FieldStatus[], isFoodProduct: boolean): {
  score: number; status: "compliant" | "review-required" | "non-compliant";
  categories: ComplianceCategory[]; explanation: string;
} {
  const categoryScores: ComplianceCategory[] = [
    { name: "Mandatory Declarations", score: 0, maxScore: 25 },
    { name: "Quantity Declaration", score: 0, maxScore: 15 },
    { name: "Price Declaration", score: 0, maxScore: 15 },
    { name: "Manufacturer Details", score: 0, maxScore: 15 },
    { name: "Date Declarations", score: 0, maxScore: 10 },
    { name: "Consumer Information", score: 0, maxScore: 10 },
    { name: "Label Quality", score: 0, maxScore: 10 },
  ];

  // Weight mapping: ruleId → category + weight
  const ruleWeights: Record<number, { category: string; weight: number }> = {
    1: { category: "Manufacturer Details", weight: 15 },  // Rule 6(1)(a)
    2: { category: "Mandatory Declarations", weight: 10 },  // Rule 6(1)(b)
    3: { category: "Quantity Declaration", weight: 15 },  // Rule 6(1)(c) + 11 + 12
    4: { category: "Date Declarations", weight: 5 },  // Rule 6(1)(d)
    5: { category: "Price Declaration", weight: 15 },  // Rule 6(1)(e)
    6: { category: "Consumer Information", weight: 10 },  // Rule 6(2)
    7: { category: "Label Quality", weight: 5 },  // Rule 6(3)
    8: { category: "Label Quality", weight: 5 },  // Rule 9(1)
    9: { category: "Label Quality", weight: 0 },  // Rule 9(4) — informational
    10: { category: "Quantity Declaration", weight: 0 },  // Rule 12(6) — covered by rule 3
    11: { category: "Quantity Declaration", weight: 0 },  // Rule 13 — covered by rule 3
    12: { category: "Label Quality", weight: 0 },  // Rule 7 — covered by rule 8
    13: { category: "Mandatory Declarations", weight: 5 },  // Rule 6(1)(f)
    14: { category: "Date Declarations", weight: 5 },  // Rule 6(1)(d) — expiry
  };

  for (const field of fields) {
    const ruleId = Number(field.ruleId);
    const mapping = ruleWeights[ruleId];
    if (!mapping || mapping.weight === 0) continue;
    const cat = categoryScores.find(c => c.name === mapping.category);
    if (!cat) continue;
    if (field.status === "compliant") cat.score += mapping.weight;
    else if (field.status === "review-required") cat.score += Math.round(mapping.weight * (field.confidence / 100) * 0.5);
    // non-compliant: 0 points
  }

  // FSSAI bonus for food products
  if (isFoodProduct) {
    const fssai = fields.find(f => f.fieldName === "fssaiLicense");
    if (fssai && fssai.status === "compliant") {
      const mandCat = categoryScores.find(c => c.name === "Mandatory Declarations");
      if (mandCat) mandCat.score += 5;
    }
  }

  const totalScore = categoryScores.reduce((s, c) => s + c.score, 0);
  const maxTotal = categoryScores.reduce((s, c) => s + c.maxScore, 0);
  const score = Math.min(100, Math.round((totalScore / maxTotal) * 100));

  // Overall status based on violations and score
  const highSeverityViolations = fields.filter(f => f.status === "non-compliant" && LEGAL_RULES[Number(f.ruleId)]?.severity === "high");
  let status: "compliant" | "review-required" | "non-compliant";
  if (score >= 80 && highSeverityViolations.length === 0) status = "compliant";
  else if (highSeverityViolations.length >= 2 || score < 40) status = "non-compliant";
  else status = "review-required";

  const missingFields = fields.filter(f => f.status === "non-compliant").map(f => f.fieldName);
  const reviewFields = fields.filter(f => f.status === "review-required").map(f => f.fieldName);
  const okFields = fields.filter(f => f.status === "compliant").map(f => f.fieldName);

  let explanation = "";
  if (status === "compliant") {
    explanation = `${okFields.length} of ${fields.length} declarations verified as compliant. Product label meets Legal Metrology (Packaged Commodities) Rules, 2011 requirements.`;
  } else if (status === "non-compliant") {
    explanation = `${missingFields.length} declaration(s) violate Legal Metrology rules: ${missingFields.join(", ")}. ${reviewFields.length > 0 ? `${reviewFields.length} field(s) need manual review: ${reviewFields.join(", ")}.` : ""}`;
  } else {
    explanation = `${okFields.length} declarations compliant, but ${reviewFields.length} field(s) need manual verification: ${reviewFields.join(", ")}. ${missingFields.length > 0 ? `${missingFields.length} field(s) missing or non-compliant: ${missingFields.join(", ")}.` : ""}`;
  }

  return { score, status, categories: categoryScores, explanation };
}

// ─── RISK PRIORITY CALCULATION ──────────────────────────────────────────────

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

  const highViolations = fields.filter(f => f.status === "non-compliant" && LEGAL_RULES[Number(f.ruleId)]?.severity === "high");
  if (highViolations.length > 0) {
    const c = Math.min(highViolations.length * 15, 30); riskScore += c;
    factors.push({ factor: "High-Severity Violations", contribution: c, description: `${highViolations.length} high-severity rule violation(s) — e.g., ${highViolations[0].fieldName}.` });
  }

  const mediumViolations = fields.filter(f => f.status === "non-compliant" && LEGAL_RULES[Number(f.ruleId)]?.severity === "medium");
  if (mediumViolations.length > 0) {
    const c = Math.min(mediumViolations.length * 8, 15); riskScore += c;
    factors.push({ factor: "Medium-Severity Violations", contribution: c, description: `${mediumViolations.length} medium-severity rule violation(s).` });
  }

  const lowConf = fields.filter(f => f.confidence > 0 && f.confidence < 60).length;
  if (lowConf > 0) {
    const c = Math.min(lowConf * 5, 12); riskScore += c;
    factors.push({ factor: "Low OCR Confidence", contribution: c, description: `${lowConf} field(s) below 60% confidence.` });
  }

  if (anomalies.length > 0) {
    const c = Math.min(anomalies.length * 6, 12); riskScore += c;
    factors.push({ factor: "Label Anomaly Detected", contribution: c, description: `${anomalies.length} potential anomaly/anomalies detected.` });
  }

  riskScore = Math.min(riskScore, 100);
  const level = riskScore >= 60 ? "high" : riskScore >= 30 ? "medium" : "low";
  return { score: riskScore, level, factors };
}

// ─── NEXT BEST ACTIONS ──────────────────────────────────────────────────────

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

  const highViolations = violations.filter(v => v.severity === "high");
  for (const v of highViolations.slice(0, 3)) {
    actions.push({
      id: `action-${priority}`, type: "verify-violation", priority,
      title: `Address ${v.ruleReference} violation`,
      description: `${v.title}: ${v.expected}`,
      affectedField: v.field,
    });
    priority++;
  }

  const needsReview = fields.filter(f => f.status === "review-required");
  for (const f of needsReview.slice(0, 2)) {
    const rule = LEGAL_RULES[Number(f.ruleId)];
    actions.push({
      id: `action-${priority}`, type: "review-field", priority,
      title: `Verify ${rule?.declaration || f.fieldName} (${rule?.ruleReference || ""})`,
      description: `OCR confidence is ${f.confidence}%. Manual verification recommended per ${rule?.ruleReference || "applicable rules"}.`,
      affectedField: f.fieldName,
    });
    priority++;
  }

  if (actions.length === 0) {
    actions.push({
      id: "action-1", type: "no-action", priority: 1,
      title: "No additional action required",
      description: "All declarations verified as compliant with Legal Metrology Rules.",
    });
  }

  return actions;
}

// ─── SUMMARY GENERATION ─────────────────────────────────────────────────────

function generateSummary(
  status: string, _score: number, fields: FieldStatus[], violations: ViolationData[], riskLevel: string
) {
  const keyFindings: string[] = [];
  const recommendedActions: string[] = [];

  const compliant = fields.filter(f => f.status === "compliant");
  const review = fields.filter(f => f.status === "review-required");
  const missing = fields.filter(f => f.status === "non-compliant");

  if (compliant.length > 0) {
    keyFindings.push(`${compliant.length} declaration(s) verified as compliant.`);
  }
  if (review.length > 0) {
    keyFindings.push(`${review.length} declaration(s) require manual verification.`);
    recommendedActions.push(`Review: ${review.map(f => `${f.fieldName} (${LEGAL_RULES[Number(f.ruleId)]?.ruleReference || ""})`).join(", ")}.`);
  }
  if (missing.length > 0) {
    keyFindings.push(`${missing.length} declaration(s) missing or non-compliant.`);
    recommendedActions.push(`Physically verify: ${missing.map(f => `${f.fieldName} (${LEGAL_RULES[Number(f.ruleId)]?.ruleReference || ""})`).join(", ")}.`);
  }

  const imageInsufficient = fields.filter(f => f.detectionStatus === "image-insufficient");
  if (imageInsufficient.length > 0) {
    keyFindings.push(`Image quality insufficient for ${imageInsufficient.length} field(s).`);
    recommendedActions.push("Recapture with improved image quality.");
  }

  const highSev = violations.filter(v => v.severity === "high");
  if (highSev.length > 0) {
    recommendedActions.push(`Address ${highSev.length} high-severity Legal Metrology violation(s) immediately.`);
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

async function callGeminiVision(apiKey: string, imageBase64: string, mimeType: string): Promise<string> {
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

function parseGeminiResponse(responseText: string): ExtractionResult {
  try {
    let cleaned = responseText.replace(/```json\s*/gi, "").replace(/```\s*/gi, "");
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleaned.trim());
  } catch {
    return { fields: {}, rawText: responseText.substring(0, 2000), imageQuality: "unknown", isFoodProduct: false, anomalies: [], overallAssessment: "Could not parse AI response" };
  }
}

// ─── MULTI-VIEW — PARALLEL + CROSS-VALIDATION ───────────────────────────────

async function analyzeMultiView(
  apiKey: string,
  images: { base64: string; mimeType: string; view: string }[]
): Promise<{ mergedFields: Record<string, ExtractedFieldValue>; mergedRawText: string; imageQuality: string; isFoodProduct: boolean; anomalies: AnomalyRaw[]; crossViewMismatches: string[] }> {
  const qualityOrder: Record<string, number> = { good: 3, fair: 2, poor: 1, unknown: 0 };

  const responses = await Promise.all(
    images.map(img => callGeminiVision(apiKey, img.base64, img.mimeType).catch(err => {
      console.error(`Failed to analyze ${img.view}: ${err}`);
      return null;
    }))
  );

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

  const { mismatches, fieldBest } = crossValidateViews(viewResults);

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

    // Run post-processing validators
    if (extraction.fields) {
      extraction.fields = runPostProcessingValidators(extraction.fields);
    }

    // Evaluate each rule against extracted fields
    const fieldResults: FieldStatus[] = [];
    for (const [ruleIdStr, rule] of Object.entries(LEGAL_RULES)) {
      const ruleId = Number(ruleIdStr);
      const fieldNames = RULE_TO_FIELDS[ruleId] || [];

      // For rules that map to multiple fields, evaluate the most relevant one
      // For rules 9, 10, 11, 12 — these are format/quality checks on existing fields
      if (ruleId === 9 || ruleId === 10 || ruleId === 11 || ruleId === 12) {
        // These are checked via validators above; skip duplicate evaluation
        continue;
      }

      if (fieldNames.length === 0) continue;

      // For rule 6 (consumer care), evaluate the contact field specifically
      const primaryField = ruleId === 6 ? "consumerCareContact"
        : ruleId === 1 ? "manufacturerName"
        : fieldNames[0];

      const extracted = extraction.fields[primaryField] || { value: "", confidence: 0, boundingBox: null, complianceStatus: "violation", complianceReason: "Field not detected" };
      fieldResults.push(evaluateField(primaryField, extracted as ExtractedFieldValue, ruleId, extraction.imageQuality || "unknown"));
    }

    // Add manufacturer address as a separate check if available
    const mfgAddr = extraction.fields?.manufacturerAddress;
    if (mfgAddr && mfgAddr.value && mfgAddr.confidence >= 70) {
      const hasCompleteAddress = /\b\d{6}\b/.test(mfgAddr.value) || /\b(andhra|bihar|delhi|goa|gujarat|haryana|karnataka|kerala|maharashtra|rajasthan|tamil|telangana|up|uttar|west\s*bengal|mp|chhattisgarh|jharkhand|odisha|punjab|himachal|uk|assam|meghalaya|manipur|nagaland|sikkim|arunachal|mizoram|tripura|goa|chandigarh|puducherry|jammu|kashmir|ladakh|india)\b/i.test(mfgAddr.value);
      if (!hasCompleteAddress) {
        // Find existing manufacturer name field and downgrade if address is incomplete
        const existingMfg = fieldResults.find(f => f.fieldName === "manufacturerName");
        if (existingMfg && existingMfg.status === "compliant") {
          existingMfg.status = "review-required";
          existingMfg.complianceReason = `Manufacturer name found, but address may be incomplete — Rule 6(1)(a) requires complete postal address with PIN code`;
        }
      }
    }

    const violations = generateViolations(fieldResults);
    const { score, status, categories, explanation } = calculateScore(fieldResults, extraction.isFoodProduct || false);

    // Image quality issues
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
    const anomalies = (extraction.anomalies || []).filter(a => a && typeof a === "object").map((a, i) => ({
      id: `anomaly-${i + 1}`,
      type: String(a.type || "unknown").replace(/[^a-z0-9\-]/g, "-").substring(0, 50),
      confidence: a.confidence || 50,
      region: a.region || { x: 0, y: 0, width: 0, height: 0 },
      description: a.description || `Potential ${String(a.type || "unknown").replace(/-/g, " ")} detected`,
      severity: (a.confidence || 50) >= 70 ? "high" : (a.confidence || 50) >= 40 ? "medium" : "low",
      status: "detected" as const,
    }));

    const riskPriority = calculateRiskPriority(score, fieldResults, extraction.anomalies || []);
    const nextBestActions = generateNextBestActions(fieldResults, violations, extraction.imageQuality || "unknown");
    const inspectionSummary = generateSummary(status, score, fieldResults, violations, riskPriority.level);

    // Declaration Map with legal references
    const declarationMap = fieldResults.map(f => {
      const rule = LEGAL_RULES[Number(f.ruleId)];
      return {
        fieldName: f.fieldName,
        ruleId: f.ruleId,
        ruleName: rule?.declaration || "",
        ruleReference: rule?.ruleReference || "",
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
