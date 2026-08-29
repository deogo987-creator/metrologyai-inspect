export type InspectionStatus = "compliant" | "non-compliant" | "review-required" | "pending";
export type Severity = "high" | "medium" | "low";
export type ValidationType = "presence" | "format" | "ocr-presence" | "ocr-format";
export type RuleStatus = "active" | "inactive";

export interface ProductInfo {
  productName: string;
  manufacturer: string;
  brand: string;
  category: string;
  batchNumber: string;
  mrp: string;
  inspectorId: string;
  location: string;
  dateTime: string;
}

export interface ExtractedField {
  id: string;
  fieldName: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  status: "compliant" | "review-required" | "non-compliant";
}

export interface Violation {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  field: string;
  expected: string;
  detected: string;
  evidence: string;
  explanation: string;
  recommendation: string;
}

export interface ComplianceResult {
  score: number;
  status: InspectionStatus;
  fields: ExtractedField[];
  violations: Violation[];
  categories: ComplianceCategory[];
  explanation: string;
}

export interface ComplianceCategory {
  name: string;
  score: number;
  maxScore: number;
}

export interface Rule {
  id: string;
  declaration: string;
  requirement: string;
  validationType: ValidationType;
  severity: Severity;
  status: RuleStatus;
  category: string;
}

export interface Inspection {
  id: string;
  productName: string;
  manufacturer: string;
  date: string;
  inspector: string;
  score: number;
  status: InspectionStatus;
  productCategory: string;
  imageUrl?: string;
  extractedFields?: ExtractedField[];
  violations?: Violation[];
  productInfo?: ProductInfo;
}

export interface DashboardStats {
  totalInspections: number;
  compliant: number;
  nonCompliant: number;
  pendingReview: number;
  avgCompliance: number;
}
