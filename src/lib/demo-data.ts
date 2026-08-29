import type {
  Inspection,
  DashboardStats,
  Rule,
  ComplianceResult,
  Violation,
  ExtractedField,
  ComplianceCategory,
} from "./types";

export const dashboardStats: DashboardStats = {
  totalInspections: 1248,
  compliant: 873,
  nonCompliant: 291,
  pendingReview: 84,
  avgCompliance: 82,
};

export const rules: Rule[] = [
  { id: "LM-001", declaration: "Product Identity", requirement: "Product name must be clearly declared on the label", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-002", declaration: "Manufacturer Details", requirement: "Name and address of manufacturer/prepacker/importer must be declared", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-003", declaration: "Net Quantity", requirement: "Net quantity must be declared in standard SI units", validationType: "ocr-format", severity: "high", status: "active", category: "Quantity" },
  { id: "LM-004", declaration: "MRP Declaration", requirement: "Maximum Retail Price must be declared in ₹ with '(Inclusive of all taxes)'", validationType: "ocr-format", severity: "high", status: "active", category: "Price" },
  { id: "LM-005", declaration: "Consumer Care Details", requirement: "Consumer care contact information (phone/email) must be present", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-006", declaration: "Date Declaration", requirement: "Manufacturing/packing date and expiry/use-before date must be declared", validationType: "ocr-format", severity: "high", status: "active", category: "Date" },
  { id: "LM-007", declaration: "Country of Origin", requirement: "Country of origin must be declared on the package", validationType: "ocr-presence", severity: "medium", status: "active", category: "Mandatory" },
  { id: "LM-008", declaration: "Batch/Lot Number", requirement: "Batch or lot number must be clearly marked", validationType: "presence", severity: "medium", status: "active", category: "Mandatory" },
  { id: "LM-009", declaration: "Vegetarian/Non-Veg Mark", requirement: "Mandatory vegetarian/non-vegetarian declaration symbol", validationType: "presence", severity: "medium", status: "active", category: "Food" },
  { id: "LM-010", declaration: "FSSAI License", requirement: "FSSAI license number for food products", validationType: "ocr-format", severity: "high", status: "active", category: "Food" },
  { id: "LM-011", declaration: "MRP Prefix", requirement: "MRP must be prefixed with '₹' symbol", validationType: "ocr-format", severity: "low", status: "active", category: "Price" },
  { id: "LM-012", declaration: "Date Format", requirement: "Dates must follow DD/MM/YYYY or MMM/YYYY format", validationType: "ocr-format", severity: "low", status: "active", category: "Date" },
];

export const inspectionHistory: Inspection[] = [
  { id: "INS-2026-00128", productName: "Premium Biscuit Pack", manufacturer: "Britannia Industries Ltd", date: "2026-08-28", inspector: "INS-LM-042", score: 92, status: "compliant", productCategory: "Food" },
  { id: "INS-2026-00127", productName: "Organic Honey 500g", manufacturer: "Dabur India Ltd", date: "2026-08-27", inspector: "INS-LM-042", score: 94, status: "compliant", productCategory: "Food" },
  { id: "INS-2026-00126", productName: "Shampoo Sachet 6ml", manufacturer: "Hindustan Unilever Ltd", date: "2026-08-27", inspector: "INS-LM-038", score: 61, status: "non-compliant", productCategory: "Cosmetics" },
  { id: "INS-2026-00125", productName: "Packaged Drinking Water 1L", manufacturer: "Bisleri International", date: "2026-08-26", inspector: "INS-LM-042", score: 78, status: "review-required", productCategory: "Packaged Water" },
  { id: "INS-2026-00124", productName: "Floor Cleaner 1L", manufacturer: "Reckitt Benckiser", date: "2026-08-26", inspector: "INS-LM-035", score: 88, status: "compliant", productCategory: "Household" },
  { id: "INS-2026-00123", productName: "LED Bulb 9W", manufacturer: "Philips India Ltd", date: "2026-08-25", inspector: "INS-LM-042", score: 72, status: "review-required", productCategory: "Electronics" },
  { id: "INS-2026-00122", productName: "Cooking Oil 1L", manufacturer: "Fortune Foods", date: "2026-08-25", inspector: "INS-LM-038", score: 95, status: "compliant", productCategory: "Food" },
  { id: "INS-2026-00121", productName: "Face Cream 50g", manufacturer: "Emami Ltd", date: "2026-08-24", inspector: "INS-LM-042", score: 56, status: "non-compliant", productCategory: "Cosmetics" },
  { id: "INS-2026-00120", productName: "Batteries 4-pack", manufacturer: "Eveready Industries", date: "2026-08-24", inspector: "INS-LM-035", score: 83, status: "compliant", productCategory: "Electronics" },
  { id: "INS-2026-00119", productName: "Masala Mix 100g", manufacturer: "MDH Spices", date: "2026-08-23", inspector: "INS-LM-042", score: 67, status: "non-compliant", productCategory: "Food" },
];

export const demoProducts: { name: string; result: ComplianceResult }[] = [
  {
    name: "Product A — Compliant (Premium Biscuit Pack)",
    result: {
      score: 94,
      status: "compliant",
      fields: [
        { id: "f1", fieldName: "Product Name", value: "Premium Biscuit Pack — Choco Delight", confidence: 97, status: "compliant", boundingBox: { x: 10, y: 8, width: 180, height: 30 } },
        { id: "f2", fieldName: "Manufacturer", value: "Britannia Industries Ltd, Bangalore 560001", confidence: 94, status: "compliant", boundingBox: { x: 10, y: 42, width: 200, height: 20 } },
        { id: "f3", fieldName: "Net Quantity", value: "200 g", confidence: 98, status: "compliant", boundingBox: { x: 10, y: 66, width: 80, height: 18 } },
        { id: "f4", fieldName: "MRP", value: "₹35.00 (Inclusive of all taxes)", confidence: 99, status: "compliant", boundingBox: { x: 100, y: 66, width: 120, height: 18 } },
        { id: "f5", fieldName: "Batch Number", value: "BN-2026-08-12", confidence: 96, status: "compliant", boundingBox: { x: 10, y: 88, width: 110, height: 16 } },
        { id: "f6", fieldName: "Packing Date", value: "08/2026", confidence: 91, status: "compliant", boundingBox: { x: 130, y: 88, width: 70, height: 16 } },
        { id: "f7", fieldName: "Expiry Date", value: "02/2027", confidence: 93, status: "compliant", boundingBox: { x: 210, y: 88, width: 65, height: 16 } },
        { id: "f8", fieldName: "Consumer Care", value: "1800-103-0007 | care@britannia.co.in", confidence: 88, status: "compliant", boundingBox: { x: 10, y: 108, width: 180, height: 16 } },
        { id: "f9", fieldName: "Country of Origin", value: "Made in India", confidence: 92, status: "compliant", boundingBox: { x: 10, y: 128, width: 90, height: 16 } },
      ],
      violations: [],
      categories: [
        { name: "Mandatory Declarations", score: 18, maxScore: 20 },
        { name: "Quantity Declaration", score: 12, maxScore: 12 },
        { name: "Price Declaration", score: 13, maxScore: 14 },
        { name: "Manufacturer Details", score: 10, maxScore: 10 },
        { name: "Date Information", score: 13, maxScore: 14 },
        { name: "Consumer Information", score: 10, maxScore: 10 },
        { name: "OCR Confidence", score: 18, maxScore: 20 },
      ],
      explanation: "All mandatory declarations have been detected with high confidence. The product label includes all required information per Legal Metrology compliance rules.",
    },
  },
  {
    name: "Product B — Non-Compliant (Shampoo Sachet 6ml)",
    result: {
      score: 43,
      status: "non-compliant",
      fields: [
        { id: "f1", fieldName: "Product Name", value: "Silk Shine Shampoo", confidence: 95, status: "compliant", boundingBox: { x: 10, y: 8, width: 160, height: 24 } },
        { id: "f2", fieldName: "Manufacturer", value: "HUL Pvt Ltd", confidence: 89, status: "compliant", boundingBox: { x: 10, y: 36, width: 140, height: 18 } },
        { id: "f3", fieldName: "Net Quantity", value: "6 ml", confidence: 92, status: "compliant", boundingBox: { x: 10, y: 58, width: 50, height: 16 } },
        { id: "f4", fieldName: "MRP", value: "2.00", confidence: 71, status: "review-required", boundingBox: { x: 70, y: 58, width: 60, height: 16 } },
        { id: "f5", fieldName: "Consumer Care", value: "", confidence: 0, status: "non-compliant" },
        { id: "f6", fieldName: "Country of Origin", value: "", confidence: 0, status: "non-compliant" },
        { id: "f7", fieldName: "Expiry Date", value: "EXP 03/27", confidence: 65, status: "review-required", boundingBox: { x: 10, y: 78, width: 80, height: 16 } },
      ],
      violations: [
        {
          id: "v1", ruleId: "LM-005", title: "Missing Consumer Care Details", severity: "high", field: "Consumer Care Details",
          expected: "Consumer care/contact information must be present", detected: "Not found on label",
          evidence: "The region where consumer care details are typically placed was scanned but no contact information was detected.",
          explanation: "Legal Metrology Rules require that every pre-packaged commodity must bear the name, address, and telephone number of the manufacturer or consumer care contact. This information was not detected anywhere on the label.",
          recommendation: "Mark for Inspector Review — Verify if consumer care details exist on the physical label in small print or alternate locations."
        },
        {
          id: "v2", ruleId: "LM-007", title: "Missing Country of Origin", severity: "high", field: "Country of Origin",
          expected: "Country of Origin declaration must be present", detected: "Not found on label",
          evidence: "The system scanned the entire visible label area and did not detect a country of origin declaration.",
          explanation: "Country of origin is a mandatory declaration under Legal Metrology regulations. The AI system could not find this information on the detected label regions.",
          recommendation: "Verify physically whether the country of origin is printed on the product. Check packaging back or bottom panel."
        },
        {
          id: "v3", ruleId: "LM-004", title: "MRP Format Issue", severity: "medium", field: "MRP Declaration",
          expected: "MRP must be in format '₹XX.XX (Inclusive of all taxes)'", detected: "2.00 — missing ₹ symbol and tax inclusion text",
          evidence: "The extracted MRP text shows '2.00' without the ₹ prefix or the mandatory '(Inclusive of all taxes)' suffix.",
          explanation: "While a price was detected, it does not conform to the required MRP declaration format. The ₹ symbol and tax inclusion statement are mandatory.",
          recommendation: "Manually verify the MRP declaration format on the physical product."
        },
        {
          id: "v4", ruleId: "LM-012", title: "Low Confidence Date Extraction", severity: "medium", field: "Expiry Date",
          expected: "Date in DD/MM/YYYY or MMM/YYYY format", detected: "EXP 03/27 — partial format detected (65% confidence)",
          evidence: "The date was partially extracted but OCR confidence is below the review threshold.",
          explanation: "The system detected date-like text but the OCR confidence is below the 80% threshold required for automated validation. This could be due to small font size, poor contrast, or image quality.",
          recommendation: "Manually verify the expiry date on the physical product."
        },
      ],
      categories: [
        { name: "Mandatory Declarations", score: 4, maxScore: 20 },
        { name: "Quantity Declaration", score: 12, maxScore: 12 },
        { name: "Price Declaration", score: 6, maxScore: 14 },
        { name: "Manufacturer Details", score: 10, maxScore: 10 },
        { name: "Date Information", score: 6, maxScore: 14 },
        { name: "Consumer Information", score: 0, maxScore: 10 },
        { name: "OCR Confidence", score: 5, maxScore: 20 },
      ],
      explanation: "This product has multiple critical compliance issues. Two mandatory declarations (Consumer Care Details and Country of Origin) were not found on the label. Additionally, the MRP declaration format is non-standard and the expiry date has low OCR confidence. These issues require immediate inspector attention.",
    },
  },
  {
    name: "Product C — Review Required (Packaged Drinking Water 1L)",
    result: {
      score: 71,
      status: "review-required",
      fields: [
        { id: "f1", fieldName: "Product Name", value: "Pure Life Drinking Water", confidence: 94, status: "compliant", boundingBox: { x: 10, y: 8, width: 170, height: 22 } },
        { id: "f2", fieldName: "Manufacturer", value: "Bisleri International Pvt Ltd", confidence: 91, status: "compliant", boundingBox: { x: 10, y: 34, width: 190, height: 18 } },
        { id: "f3", fieldName: "Net Quantity", value: "1 L", confidence: 96, status: "compliant", boundingBox: { x: 10, y: 56, width: 40, height: 16 } },
        { id: "f4", fieldName: "MRP", value: "₹20.00 (Inclusive of all taxes)", confidence: 97, status: "compliant", boundingBox: { x: 60, y: 56, width: 140, height: 16 } },
        { id: "f5", fieldName: "Batch Number", value: "BW-2026-0789", confidence: 84, status: "compliant", boundingBox: { x: 10, y: 76, width: 100, height: 16 } },
        { id: "f6", fieldName: "Packing Date", value: "JUL 2026", confidence: 82, status: "review-required", boundingBox: { x: 120, y: 76, width: 70, height: 16 } },
        { id: "f7", fieldName: "Consumer Care", value: "1800-22-0001", confidence: 76, status: "review-required", boundingBox: { x: 10, y: 96, width: 110, height: 16 } },
        { id: "f8", fieldName: "Country of Origin", value: "India", confidence: 63, status: "review-required", boundingBox: { x: 10, y: 116, width: 50, height: 16 } },
      ],
      violations: [
        {
          id: "v1", ruleId: "LM-006", title: "Date Declaration — Low Confidence", severity: "medium", field: "Packing Date",
          expected: "Clear date in standard format", detected: "JUL 2026 — 82% confidence",
          evidence: "The packing date was detected but OCR confidence is near the threshold. The date format may be partially obscured.",
          explanation: "The packing date was extracted with 82% confidence, which is above the minimum threshold but below the confidence level for automated approval. The date format 'JUL 2026' lacks a specific day, which is acceptable for some product categories but should be verified.",
          recommendation: "Inspector should verify the packing date matches the physical label and confirm the format is acceptable for this product category."
        },
        {
          id: "v2", ruleId: "LM-005", title: "Consumer Care — Partial Detection", severity: "medium", field: "Consumer Care Details",
          expected: "Complete consumer care contact details", detected: "Phone number found, email/website not detected",
          evidence: "Only a phone number (1800-22-0001) was detected. Email address or website information was not found in the expected region.",
          explanation: "Consumer care details were partially detected. While a phone number is present, the full contact information (email/website) could not be reliably extracted from the label. This may be due to image resolution or text clarity issues.",
          recommendation: "Manually verify whether complete consumer care details are present on the physical product label."
        },
        {
          id: "v3", ruleId: "LM-007", title: "Country of Origin — Low Confidence", severity: "medium", field: "Country of Origin",
          expected: "Clear country of origin declaration", detected: "India — 63% confidence",
          evidence: "The text 'India' was detected but with significantly low OCR confidence (63%). The text may be partially obscured or in a small font.",
          explanation: "While the text 'India' was detected in the expected region, the OCR confidence is below the 80% review threshold. This could indicate the text is in a small font, has low contrast, or is partially obscured.",
          recommendation: "Inspector should manually verify the country of origin declaration on the physical product."
        },
      ],
      categories: [
        { name: "Mandatory Declarations", score: 14, maxScore: 20 },
        { name: "Quantity Declaration", score: 12, maxScore: 12 },
        { name: "Price Declaration", score: 13, maxScore: 14 },
        { name: "Manufacturer Details", score: 10, maxScore: 10 },
        { name: "Date Information", score: 8, maxScore: 14 },
        { name: "Consumer Information", score: 5, maxScore: 10 },
        { name: "OCR Confidence", score: 9, maxScore: 20 },
      ],
      explanation: "This product has most mandatory declarations present, but several fields have OCR confidence below the automated approval threshold. The consumer care details appear incomplete, and the country of origin has low detection confidence. Inspector manual review is recommended before final compliance determination.",
    },
  },
];

export const monthlyInspections = [
  { month: "Mar", inspections: 145, compliant: 102, nonCompliant: 31, review: 12 },
  { month: "Apr", inspections: 168, compliant: 118, nonCompliant: 38, review: 12 },
  { month: "May", inspections: 152, compliant: 110, nonCompliant: 30, review: 12 },
  { month: "Jun", inspections: 198, compliant: 142, nonCompliant: 42, review: 14 },
  { month: "Jul", inspections: 210, compliant: 155, nonCompliant: 40, review: 15 },
  { month: "Aug", inspections: 175, compliant: 128, nonCompliant: 35, review: 12 },
];

export const commonViolations = [
  { type: "Missing consumer care details", count: 89 },
  { type: "Quantity declaration issue", count: 67 },
  { type: "Date declaration missing", count: 54 },
  { type: "Low OCR confidence", count: 48 },
  { type: "MRP format non-compliance", count: 38 },
  { type: "Country of origin missing", count: 32 },
  { type: "Batch number unclear", count: 24 },
  { type: "FSSAI license missing", count: 18 },
];

export const categoryBreakdown = [
  { name: "Food", value: 512 },
  { name: "Cosmetics", value: 234 },
  { name: "Packaged Water", value: 189 },
  { name: "Household", value: 156 },
  { name: "Electronics", value: 98 },
  { name: "Other", value: 59 },
];

export const ocrConfidenceDistribution = [
  { range: "90-100%", count: 420 },
  { range: "80-89%", count: 356 },
  { range: "70-79%", count: 268 },
  { range: "60-69%", count: 132 },
  { range: "Below 60%", count: 72 },
];

export function generateInspectionId(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `INS-2026-${num}`;
}

export function generateMockComplianceResult(productName: string): ComplianceResult {
  const score = Math.floor(Math.random() * 45) + 55;
  const status: ComplianceResult["status"] = score >= 85 ? "compliant" : score >= 65 ? "review-required" : "non-compliant";

  const fields: ExtractedField[] = [
    { id: "f1", fieldName: "Product Name", value: productName || "Product", confidence: 90 + Math.random() * 9, status: "compliant" },
    { id: "f2", fieldName: "Manufacturer", value: "Manufacturing Co. Pvt Ltd", confidence: 88 + Math.random() * 10, status: "compliant" },
    { id: "f3", fieldName: "Net Quantity", value: "500 g", confidence: 92 + Math.random() * 7, status: "compliant" },
    { id: "f4", fieldName: "MRP", value: "₹120.00 (Inclusive of all taxes)", confidence: 94 + Math.random() * 5, status: "compliant" },
    { id: "f5", fieldName: "Batch Number", value: "B240812", confidence: 85 + Math.random() * 12, status: "compliant" },
    { id: "f6", fieldName: "Packing Date", value: "08/2026", confidence: 80 + Math.random() * 15, status: score > 70 ? "compliant" : "review-required" },
    { id: "f7", fieldName: "Consumer Care", value: score > 60 ? "1800-XXX-XXXX" : "", confidence: score > 60 ? 75 + Math.random() * 20 : 0, status: score > 60 ? (score > 80 ? "compliant" : "review-required") : "non-compliant" },
    { id: "f8", fieldName: "Country of Origin", value: score > 55 ? "India" : "", confidence: score > 55 ? 60 + Math.random() * 30 : 0, status: score > 75 ? "compliant" : score > 55 ? "review-required" : "non-compliant" },
  ];

  const violations: Violation[] = [];
  if (score < 80) {
    violations.push({
      id: "v1", ruleId: "LM-005", title: "Consumer Care — Low Confidence", severity: "medium", field: "Consumer Care Details",
      expected: "Complete consumer care contact details", detected: "Partial information detected",
      evidence: "Consumer care region detected but full details not confirmed.",
      explanation: "The system detected partial consumer care information. Full verification required.",
      recommendation: "Inspector should manually verify consumer care details on the physical label."
    });
  }
  if (score < 65) {
    violations.push({
      id: "v2", ruleId: "LM-007", title: "Country of Origin — Missing", severity: "high", field: "Country of Origin",
      expected: "Country of Origin declaration", detected: "Not found",
      evidence: "Country of origin region scanned but no declaration detected.",
      explanation: "Required country of origin declaration was not found on the label.",
      recommendation: "Verify physical product for country of origin declaration."
    });
  }

  const categories: ComplianceCategory[] = [
    { name: "Mandatory Declarations", score: Math.round(score * 0.2), maxScore: 20 },
    { name: "Quantity Declaration", score: Math.min(12, Math.round(score * 0.13)), maxScore: 12 },
    { name: "Price Declaration", score: Math.min(14, Math.round(score * 0.15)), maxScore: 14 },
    { name: "Manufacturer Details", score: Math.min(10, Math.round(score * 0.1)), maxScore: 10 },
    { name: "Date Information", score: Math.min(14, Math.round(score * 0.14)), maxScore: 14 },
    { name: "Consumer Information", score: Math.min(10, Math.round(score * 0.1)), maxScore: 10 },
    { name: "OCR Confidence", score: Math.min(20, Math.round(score * 0.2)), maxScore: 20 },
  ];

  return {
    score,
    status,
    fields,
    violations,
    categories,
    explanation: score >= 85
      ? "All mandatory declarations detected with high confidence. Product appears compliant."
      : score >= 65
        ? "Several fields have OCR confidence below automated approval threshold. Manual review recommended."
        : "Multiple critical compliance issues detected. Immediate inspector attention required.",
  };
}
