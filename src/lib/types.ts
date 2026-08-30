// ============================================================
// MetrologyAI — Complete Type System
// Supports 20 unique inspection intelligence features
// ============================================================

// === Core Enums ===
export type InspectionStatus = "compliant" | "non-compliant" | "review-required" | "pending";
export type Severity = "high" | "medium" | "low";
export type ValidationType = "presence" | "format" | "ocr-presence" | "ocr-format" | "semantic";
export type RuleStatus = "active" | "inactive" | "archived";

// === Feature 3: Missing vs Unreadable Intelligence ===
export type FieldDetectionStatus =
  | "detected"       // Confidently identified
  | "uncertain"      // Possible declaration, low confidence
  | "not-detected"   // No reliable declaration found
  | "image-insufficient"; // Can't determine if present

// === Feature 4: Adaptive Recapture ===
export type ImageQualityIssue =
  | "blur"
  | "glare"
  | "low-lighting"
  | "perspective-distortion"
  | "small-text"
  | "low-resolution"
  | "occlusion"
  | "none";

// === Feature 2: Multi-View ===
export type ProductView = "front" | "back" | "left" | "right" | "top" | "bottom" | "other";
export type ViewAnalysisStatus = "analyzed" | "processing" | "needs-review" | "failed" | "pending";

// === Product Info ===
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

// === Feature 2: Multi-View Image ===
export interface ProductImage {
  id: string;
  file: File;
  previewUrl: string;
  view: ProductView;
  compressedBase64?: string;
  analysisStatus: ViewAnalysisStatus;
  rawOcrText?: string;
  fields: ExtractedField[];
}

// === Feature 1: AI Evidence Chain ===
export interface EvidenceChain {
  productId: string;
  detectedRegion: { x: number; y: number; width: number; height: number } | null;
  ocrText: string;
  extractedField: string;
  ruleId: string;
  ruleName: string;
  validation: string;
  finding: "compliant" | "violation" | "warning";
  findingExplanation: string;
  inspectorDecision?: InspectorDecision;
  imageId: string;
}

// === Feature 9: Human-in-the-Loop Correction ===
export interface InspectorDecision {
  type: "accept" | "edit" | "dismiss" | "request-recapture";
  originalValue: string;
  correctedValue?: string;
  inspectorId: string;
  timestamp: string;
  reason?: string;
}

// === Feature 9 & 10: AI Feedback + Revalidation ===
export interface AIFieldCorrection {
  id: string;
  field: string;
  originalAiValue: string;
  inspectorCorrectedValue: string;
  inspectorId: string;
  timestamp: string;
  reason: string;
  ruleId: string;
}

// === Feature 10: Revalidation Record ===
export interface RevalidationRecord {
  id: string;
  field: string;
  previousStatus: "compliant" | "review-required" | "non-compliant";
  newStatus: "compliant" | "review-required" | "non-compliant";
  previousScore: number;
  newScore: number;
  timestamp: string;
  reason: string;
}

// === Core Field & Violation Types ===
export interface ExtractedField {
  id: string;
  fieldName: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  status: "compliant" | "review-required" | "non-compliant";
  complianceReason?: string;
  detectionStatus: FieldDetectionStatus;
  sourceView: ProductView;
  imageId?: string;
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
  evidenceChain?: EvidenceChain;
}

// === Compliance Result (Enhanced) ===
export interface ComplianceResult {
  score: number;
  status: InspectionStatus;
  fields: ExtractedField[];
  violations: Violation[];
  categories: ComplianceCategory[];
  explanation: string;
  rawOcrText: string;
  mode: "live";
  // Feature 4
  imageQualityIssues: ImageQualityIssue[];
  recaptureRecommendations: RecaptureRecommendation[];
  // Feature 7
  anomalies: LabelAnomaly[];
  // Feature 8
  riskPriority: RiskPriority;
  // Feature 19
  nextBestActions: NextBestAction[];
  // Feature 15
  inspectionSummary: InspectionSummary;
  // Feature 12
  declarationMap: DeclarationMapEntry[];
}

export interface ComplianceCategory {
  name: string;
  score: number;
  maxScore: number;
}

// === Feature 4: Adaptive Recapture ===
export interface RecaptureRecommendation {
  issue: ImageQualityIssue;
  severity: "critical" | "warning" | "info";
  message: string;
  affectedFields: string[];
  view?: ProductView;
  improvement?: {
    beforeConfidence: number;
    afterConfidence: number;
  };
}

// === Feature 7: Label Anomaly Detection ===
export interface LabelAnomaly {
  id: string;
  type: "sticker-overlay" | "covered-text" | "unusual-patch" | "typography-inconsistency" | "altered-mrp" | "image-manipulation" | "inconsistent-structure";
  confidence: number;
  region: { x: number; y: number; width: number; height: number };
  description: string;
  severity: "high" | "medium" | "low";
  status: "detected" | "reviewed" | "dismissed";
}

// === Feature 8: Risk Prioritization ===
export interface RiskPriority {
  score: number;
  level: "low" | "medium" | "high";
  factors: RiskFactor[];
}

export interface RiskFactor {
  factor: string;
  contribution: number;
  description: string;
}

// === Feature 19: Next Best Action ===
export interface NextBestAction {
  id: string;
  type: "recapture" | "verify-mrp" | "review-field" | "compare-online" | "no-action";
  priority: number;
  title: string;
  description: string;
  affectedField?: string;
  view?: ProductView;
}

// === Feature 15: Inspection Summary ===
export interface InspectionSummary {
  overallStatus: string;
  keyFindings: string[];
  recommendedActions: string[];
  riskLevel: string;
}

// === Feature 12: Declaration Knowledge Graph ===
export interface DeclarationMapEntry {
  fieldName: string;
  ruleId: string;
  ruleName: string;
  sources: DeclarationSource[];
  status: "compliant" | "review-required" | "non-compliant" | "not-evaluated";
  overallConfidence: number;
}

export interface DeclarationSource {
  view: ProductView;
  imageId: string;
  ocrText: string;
  confidence: number;
}

// === Feature 5: E-Commerce Comparison ===
export interface ECommerceListing {
  id: string;
  platform: string;
  url: string;
  imageUrl?: string;
  imageBase64?: string;
  extractedFields: ECommerceField[];
}

export interface ECommerceField {
  fieldName: string;
  value: string;
  confidence: number;
}

export interface CrossSourceComparison {
  id: string;
  field: string;
  physicalValue: string;
  onlineValue: string;
  matchStatus: "match" | "mismatch" | "partial" | "unknown";
  physicalConfidence: number;
  onlineConfidence: number;
}

// === Feature 6: Historical Consistency ===
export interface HistoricalRecord {
  id: string;
  inspectionId: string;
  date: string;
  field: string;
  value: string;
  score: number;
}

export interface HistoricalChange {
  field: string;
  timeline: { date: string; value: string }[];
  changeDetected: boolean;
  description: string;
}

// === Feature 11: Versioned Rules ===
export interface Rule {
  id: string;
  declaration: string;
  requirement: string;
  validationType: ValidationType;
  severity: Severity;
  status: RuleStatus;
  category: string;
  // Feature 11 additions
  version: string;
  effectiveDate: string;
  description: string;
  validationLogic: string;
  previousVersions?: { version: string; status: RuleStatus; effectiveDate: string }[];
}

// === Feature 17: Audit Trail ===
export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  actor: string;
  type: "system" | "inspector" | "ai";
}

// === Feature 14: Smart Search ===
export interface SearchFilter {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  status?: InspectionStatus;
  category?: string;
  manufacturer?: string;
  riskLevel?: "low" | "medium" | "high";
}

// === Feature 18: AI vs Inspector Analytics ===
export interface AIAnalytics {
  totalExtractions: number;
  inspectorCorrections: number;
  correctionRate: number;
  mostCorrectedFields: { field: string; count: number }[];
  avgConfidenceByField: { field: string; avgConfidence: number }[];
  recaptureSuccess: { before: number; after: number };
}

// === Inspection Record ===
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
  // Enhanced fields
  images?: ProductImage[];
  result?: ComplianceResult;
  auditTrail?: AuditEntry[];
  corrections?: AIFieldCorrection[];
  revalidations?: RevalidationRecord[];
  crossSourceComparison?: CrossSourceComparison[];
  historicalChanges?: HistoricalChange[];
}

// === Dashboard Stats ===
export interface DashboardStats {
  totalInspections: number;
  compliant: number;
  nonCompliant: number;
  pendingReview: number;
  avgCompliance: number;
}

// === Feature 13: Confidence Matrix Entry ===
export interface ConfidenceMatrixEntry {
  confidenceLevel: "high" | "low";
  complianceStatus: "compliant" | "non-compliant" | "missing";
  displayStatus: "verified" | "review" | "finding" | "recapture";
  fields: string[];
}
