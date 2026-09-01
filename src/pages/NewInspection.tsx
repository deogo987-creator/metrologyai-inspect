import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInspectionId } from "@/lib/demo-data";
import { compressImage } from "@/lib/optimize";
import type {
  ProductInfo,
  ComplianceResult,
  FieldDetectionStatus,
  ProductView,
  ExtractedField,
  Violation,
  RecaptureRecommendation,
  LabelAnomaly,
  RiskPriority,
  NextBestAction,
  InspectionSummary,
  DeclarationMapEntry,
  AuditEntry,
  ConfidenceMatrixEntry,
} from "@/lib/types";
import {
  Upload,
  Camera,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  FileText,
  Shield,
  RotateCcw,
  Edit3,
  Save,
  Download,
  ChevronRight,
  Sparkles,
  Target,
  Info,
  Zap,
  Clock,
  Search,
  Layers,
  Scan,
  TrendingUp,
  AlertOctagon,
  CameraIcon,
  GitBranch,
  User,
  RefreshCw,
  BarChart3,
  Map,
  ShieldCheck,
  MessageSquare,
Scale,
Tag,} from "lucide-react";

type Step = 1 | 2 | 3;

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  compliant: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
  "review-required": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  "non-compliant": { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
};

const riskColors = { low: "text-green-600 bg-green-50 border-green-200", medium: "text-amber-600 bg-amber-50 border-amber-200", high: "text-red-600 bg-red-50 border-red-200" };
const anomalySeverityColors = { high: "bg-red-50 border-red-200 text-red-700", medium: "bg-amber-50 border-amber-200 text-amber-700", low: "bg-blue-50 border-blue-200 text-blue-700" };
const detectionStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  detected: { label: "Detected", color: "text-green-700", bg: "bg-green-50" },
  uncertain: { label: "Uncertain", color: "text-amber-700", bg: "bg-amber-50" },
  "not-detected": { label: "Not Detected", color: "text-red-700", bg: "bg-red-50" },
  "image-insufficient": { label: "Image Insufficient", color: "text-orange-700", bg: "bg-orange-50" },
};

const steps = [
  { num: 1, label: "Product Info" },
  { num: 2, label: "Upload Label" },
  { num: 3, label: "AI Inspection" },
];

const compressedCache: Record<string, string> = {};

const viewLabels: Record<string, string> = { front: "Front", back: "Back", left: "Left", right: "Right", top: "Top", bottom: "Bottom", other: "Other" };

export default function NewInspection() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeLabel = useAction(api.analyzeLabel.analyzeLabel);
  const saveInspection = useMutation(api.inspections.saveInspection);
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "true";
  const isEcommerceMode = searchParams.get("ecommerce") === "true";

  // Demo mode: pre-fill product info
  useEffect(() => {
    if (isDemoMode) {
      setProductInfo({
        productName: "Britannia Good Day Biscuit",
        manufacturer: "Britannia Industries Ltd",
        brand: "Good Day",
        category: "Food",
        batchNumber: "BN-2026-08-12",
        mrp: "₹35",
        inspectorId: "INS-LM-042",
        location: "Central Market, Delhi",
        dateTime: new Date().toISOString().slice(0, 16),
      });
    }
  }, [isDemoMode]);

  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    productName: "", manufacturer: "", brand: "", category: "",
    batchNumber: "", mrp: "", inspectorId: "",
    location: "", dateTime: new Date().toISOString().slice(0, 16),
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageViews, setContentViews] = useState<ProductView[]>(["front"]);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [rawOcrText, setRawOcrText] = useState("");
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [corrections, setCorrections] = useState<{ field: string; original: string; corrected: string; time: string }[]>([]);
  const [revalidations, setRevalidations] = useState<{ field: string; from: string; to: string; time: string }[]>([]);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "evidence" | "risk" | "graph">("overview");
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);
  const inspectionId = useRef(generateInspectionId());

  const addAuditEntry = useCallback((action: string, details: string, type: "system" | "inspector" | "ai" = "system") => {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
      actor: type === "ai" ? "Gemini AI" : type === "inspector" ? productInfo.inspectorId || "Inspector" : "System",
      type,
    };
    setAuditTrail((prev) => [...prev, entry]);
  }, [productInfo.inspectorId]);

  const updateField = (field: keyof ProductInfo, value: string) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const newViews: ProductView[] = [];
    const existingViews = imageViews;

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        newFiles.push(file);
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
        // Auto-assign views
        const viewOrder: ProductView[] = ["front", "back", "left", "right", "top", "bottom"];
        const nextView = viewOrder.find((v) => !existingViews.includes(v) && !newViews.includes(v)) || "other";
        newViews.push(nextView);
        // Try to pre-compress for faster analysis, but don't block upload
        compressImage(file).then((compressed) => {
          compressedCache[preview] = compressed;
        }).catch(() => {
          // Compression failed, will use FileReader fallback during analysis
        });
      }
    }

    setImageFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setContentViews((prev) => [...prev, ...newViews]);
  }, [imageViews]);

  const removeImage = (index: number) => {
    setImageFiles((prev) => {
      const removed = prev[index];
      if (removed) {
        const cacheKey = `${removed.name}-${removed.size}-${removed.lastModified}`;
        delete compressedCache[cacheKey];
      }
      return prev.filter((_, i) => i !== index);
    });
    setImagePreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setContentViews((prev) => prev.filter((_, i) => i !== index));
  };

  const runAIInspection = async () => {
    if (imageFiles.length === 0) return;
    setStep(3);
    setIsProcessing(true);
    setError(null);

    const stages = [
      "Analyzing image quality...",
      "Sending to Gemini AI Vision...",
      "Extracting label fields & declarations...",
      "Running compliance rule engine...",
      "Calculating risk score & anomalies...",
      "Building evidence chain...",
    ];

    let stageIndex = 0;
    const stageTimer = setInterval(() => {
      if (stageIndex < stages.length) { setProcessingStage(stages[stageIndex]); stageIndex++; }
    }, 700);

    try {
      addAuditEntry("Inspection Started", `Analyzing ${productInfo.productName}`, "system");

      // Build multi-view image array
      setProcessingStage("Preparing images for analysis...");
      const images = await Promise.all(
        imageFiles.map(async (file, i) => {
          // Validate file before reading
          if (!file || file.size === 0) {
            throw new Error(`Image ${i + 1} is empty. Please upload a valid image.`);
          }
          if (file.size > 20 * 1024 * 1024) {
            throw new Error(`Image ${i + 1} is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 20MB.`);
          }
          // Try compressed version first (faster upload, smaller payload)
          const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
          const cached = compressedCache[cacheKey];
          if (cached) {
            return { base64: cached, view: imageViews[i] || "front" };
          }
          // Try compression
          try {
            const compressed = await compressImage(file);
            compressedCache[cacheKey] = compressed;
            return { base64: compressed, view: imageViews[i] || "front" };
          } catch {
            // Compression failed, fall back to direct read
          }
          // Fallback: read file directly as base64 with timeout
          return new Promise<{ base64: string; view: string }>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error(`Image ${i + 1} took too long to read. The file may be corrupted.`)), 15000);
            const reader = new FileReader();
            reader.onload = () => {
              clearTimeout(timeout);
              const result = reader.result as string;
              if (result && result.startsWith("data:image") && result.length > 200) {
                resolve({ base64: result, view: imageViews[i] || "front" });
              } else {
                reject(new Error(`Image ${i + 1} could not be read. Please try a different image.`));
              }
            };
            reader.onerror = () => {
              clearTimeout(timeout);
              reject(new Error(`Image ${i + 1} failed to load. Please try a different image or format (JPEG/PNG recommended).`));
            };
            reader.readAsDataURL(file);
          });
        })
      );

      setProcessingStage("Sending to Gemini AI Vision...");
      addAuditEntry("Images Uploaded", `${images.length} view(s) prepared for analysis`, "system");

      const aiResult = await analyzeLabel({
        images,
        productInfo: {
          productName: productInfo.productName,
          manufacturer: productInfo.manufacturer,
          brand: productInfo.brand,
          category: productInfo.category,
          batchNumber: productInfo.batchNumber,
          mrp: productInfo.mrp,
          inspectorId: productInfo.inspectorId,
          location: productInfo.location,
          dateTime: productInfo.dateTime,
        },
      });

      addAuditEntry("AI Analysis Complete", `Score: ${aiResult.score}/100 — ${aiResult.status}`, "ai");

      const mappedResult: ComplianceResult = {
        score: aiResult.score,
        status: aiResult.status,
        fields: aiResult.fields.map((f: { fieldName: string; value: string; confidence: number; status: "compliant" | "review-required" | "non-compliant"; boundingBox?: { x: number; y: number; width: number; height: number } | null; complianceReason?: string; detectionStatus?: string; sourceView?: string }, i: number) => ({
          id: `f${i + 1}`, fieldName: f.fieldName, value: f.value, confidence: f.confidence,
          status: f.status, boundingBox: f.boundingBox ?? undefined,
          complianceReason: f.complianceReason || "",
          detectionStatus: (f.detectionStatus || "detected") as FieldDetectionStatus,
          sourceView: (f.sourceView || "front") as ProductView,
        })),
        deepRuleResults: (aiResult.deepRuleResults || []).map((d, i) => ({...d, id: `deep-${i}`})),
        commodityInfo: aiResult.commodityInfo || undefined,
        mrpCurrency: aiResult.mrpCurrency || undefined,
        violations: aiResult.violations.map((v: { ruleId: string; ruleReference?: string; title: string; severity: "high" | "medium" | "low"; field: string; expected: string; detected: string; evidence: string; explanation: string; recommendation: string; legalReference?: string }, i: number) => ({
          id: `v${i + 1}`,
          ruleReference: v.ruleReference || v.ruleId,
          legalReference: v.legalReference || v.ruleId,
          ...v,
        })),
        categories: aiResult.categories,
        explanation: aiResult.explanation,
        rawOcrText: aiResult.rawOcrText || "",
        mode: "live" as const,
        imageQualityIssues: (aiResult.imageQualityIssues || []) as any,
        recaptureRecommendations: (aiResult.recaptureRecommendations || []) as any,
        anomalies: (aiResult.anomalies || []) as any,
        riskPriority: { score: aiResult.riskPriority?.score || 0, level: (aiResult.riskPriority?.level || "low") as "low" | "medium" | "high", factors: aiResult.riskPriority?.factors || [] },
        nextBestActions: (aiResult.nextBestActions || []) as any,
        inspectionSummary: aiResult.inspectionSummary || { overallStatus: "", keyFindings: [], recommendedActions: [], riskLevel: "" },
        declarationMap: (aiResult.declarationMap || []) as any,
      };

      setRawOcrText(aiResult.rawOcrText || "");
      setResult(mappedResult);
      addAuditEntry("Findings Generated", `${aiResult.violations.length} violation(s), Risk: ${aiResult.riskPriority?.level || "low"}`, "ai");
      toast.success("Analysis complete", { description: `Score: ${aiResult.score}/100 — ${aiResult.status.replace("-", " ")}` });

      // Save to database
      try {
        await saveInspection({
          inspectionId: inspectionId.current,
          productName: productInfo.productName,
          manufacturer: productInfo.manufacturer,
          brand: productInfo.brand,
          category: productInfo.category,
          batchNumber: productInfo.batchNumber,
          mrp: productInfo.mrp,
          inspectorId: productInfo.inspectorId,
          location: productInfo.location,
          dateTime: productInfo.dateTime,
          score: aiResult.score,
          status: aiResult.status,
          riskLevel: aiResult.riskPriority?.level || "low",
          riskScore: aiResult.riskPriority?.score || 0,
          fields: JSON.stringify(mappedResult.fields),
          violations: JSON.stringify(mappedResult.violations),
          categories: JSON.stringify(mappedResult.categories),
          explanation: mappedResult.explanation,
          rawOcrText: aiResult.rawOcrText || "",
          recaptureRecommendations: JSON.stringify(mappedResult.recaptureRecommendations),
          anomalies: JSON.stringify(mappedResult.anomalies),
          nextBestActions: JSON.stringify(mappedResult.nextBestActions),
          inspectionSummary: JSON.stringify(mappedResult.inspectionSummary),
          declarationMap: JSON.stringify(mappedResult.declarationMap),
          auditTrail: JSON.stringify(auditTrail),
          corrections: JSON.stringify(corrections),
          revalidations: JSON.stringify(revalidations),
        });
        addAuditEntry("Inspection Saved", `ID: ${inspectionId.current}`, "system");
        toast.success("Inspection saved successfully", { description: `ID: ${inspectionId.current}` });
      } catch (saveErr) {
        console.warn("Failed to save inspection:", saveErr);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed.";
      setError(message);
      setStep(2);
      addAuditEntry("Analysis Failed", message, "system");
      toast.error("Analysis failed", { description: message });
    } finally {
      clearInterval(stageTimer);
      setIsProcessing(false);
    }
  };

  const handleInspectorCorrection = (fieldId: string, field: string, original: string, corrected: string) => {
    if (!result) return;
    const updatedFields = result.fields.map((f) => f.id === fieldId ? { ...f, value: corrected } : f);
    setResult({ ...result, fields: updatedFields });

    const corr = { field, original, corrected, time: new Date().toLocaleTimeString() };
    setCorrections((prev) => [...prev, corr]);
    addAuditEntry("Inspector Correction", `${field}: "${original}" → "${corrected}"`, "inspector");

    // Smart revalidation — check if compliance status changed
    const updatedField = updatedFields.find((f) => f.id === fieldId);
    if (updatedField && corrected.trim().length > 0 && (original === "" || original === "Not detected")) {
      const oldStatus = updatedField.status;
      const newStatus = corrected.trim().length > 3 ? "compliant" : "review-required";
      if (oldStatus !== newStatus) {
        setRevalidations((prev) => [...prev, { field, from: oldStatus, to: newStatus, time: new Date().toLocaleTimeString() }]);
        addAuditEntry("Smart Revalidation", `${field}: ${oldStatus} → ${newStatus} after correction`, "system");
        const rescored = updatedFields.map((f) => f.id === fieldId ? { ...f, status: newStatus as "compliant" | "review-required" | "non-compliant" } : f);
        setResult({ ...result, fields: rescored });
      }
    }
  };

  const resetInspection = useCallback(() => {
    setStep(1); setResult(null); setImageFiles([]); setImagePreviews([]);
    setContentViews(["front"]); setEditingFields({}); setRawOcrText("");
    setError(null); setAuditTrail([]); setCorrections([]); setRevalidations([]);
    inspectionId.current = generateInspectionId();
  }, []);

  const canProceedStep1 = useMemo(() => productInfo.productName.trim() !== "", [productInfo.productName]);
  const canProceedStep2 = imageFiles.length > 0;

  // Confidence Matrix (Feature 13)
  const confidenceMatrix = useMemo(() => {
    if (!result) return [];
    const matrix: ConfidenceMatrixEntry[] = [];
    for (const conf of ["high", "low"] as const) {
      for (const comp of ["compliant", "non-compliant", "missing"] as const) {
        const fields = result.fields.filter((f) => {
          const isHigh = f.confidence >= 70;
          const confMatch = conf === "high" ? isHigh : !isHigh;
          let compMatch = false;
          if (comp === "compliant") compMatch = f.status === "compliant";
          else if (comp === "non-compliant") compMatch = f.status === "non-compliant";
          else compMatch = f.status === "non-compliant" && f.detectionStatus === "not-detected";
          return confMatch && compMatch;
        });
        let displayStatus: ConfidenceMatrixEntry["displayStatus"] = "review";
        if (conf === "high" && comp === "compliant") displayStatus = "verified";
        else if (conf === "high" && comp === "non-compliant") displayStatus = "finding";
        else if (conf === "low" && comp === "missing") displayStatus = "recapture";
        matrix.push({ confidenceLevel: conf, complianceStatus: comp, displayStatus, fields: fields.map((f) => f.fieldName) });
      }
    }
    return matrix;
  }, [result]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-500">New Inspection</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {step === 3 && result ? "AI Inspection Results" : `Step ${step}: ${steps[step - 1].label}`}
        </h1>
      </div>

      {error && (
        <div className="glass-card rounded-2xl p-4 border border-red-200 bg-red-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Analysis Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button onClick={() => setError(null)} className="mt-2 text-xs font-semibold text-red-700 underline">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {!isProcessing && !result && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition-all ${step >= s.num ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20" : "bg-gray-100 text-gray-400"}`}>
                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 rounded-full ${step > s.num ? "bg-blue-500" : "bg-gray-100"}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Product Info */}
      {step === 1 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Product Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Product Name *", field: "productName" as const, placeholder: "e.g., Premium Biscuit Pack" },
              { label: "Manufacturer", field: "manufacturer" as const, placeholder: "e.g., Britannia Industries Ltd" },
              { label: "Brand", field: "brand" as const, placeholder: "e.g., Good Day" },
              { label: "Product Category", field: "category" as const, placeholder: "Select category", type: "select" as const, options: ["Food", "Cosmetics", "Packaged Water", "Household Products", "Electronics", "Other"] },
              { label: "Batch/Lot Number", field: "batchNumber" as const, placeholder: "e.g., BN-2026-08-12" },
              { label: "MRP (Expected)", field: "mrp" as const, placeholder: "e.g., ₹120" },
              { label: "Inspector ID", field: "inspectorId" as const, placeholder: "e.g., INS-LM-042" },
              { label: "Inspection Location", field: "location" as const, placeholder: "e.g., Central Market, Delhi" },
              { label: "Date & Time", field: "dateTime" as const, type: "datetime-local" },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                {f.type === "select" ? (
                  <select value={productInfo[f.field]} onChange={(e) => updateField(f.field, e.target.value)} className="w-full h-10 px-3 rounded-xl text-sm glass-input border border-white/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none bg-white/50">
                    <option value="">Select category</option>
                    {f.options!.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <Input type={f.type || "text"} value={productInfo[f.field]} onChange={(e) => updateField(f.field, e.target.value)} placeholder={f.placeholder} className="glass-input h-10" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20">
              Next: Upload Label <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Multi-View Upload (Feature 2) */}
      {step === 2 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Upload Product Label Images</h2>
          </div>
          <p className="text-xs text-gray-500">Upload multiple views for comprehensive package analysis. The AI will combine all views into one unified inspection.</p>

          <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }} className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 mx-auto group-hover:bg-blue-100 transition-colors">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700">Drag & drop label images here</p>
            <p className="mt-1 text-xs text-gray-400">Front, Back, Side views recommended • JPG, PNG, WEBP</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5">
                <Upload className="h-3 w-3" /> Browse Files
              </button>
              <button onClick={(e) => { e.stopPropagation(); }} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                <Camera className="h-3 w-3" /> Use Camera
              </button>
            </div>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" />

          {imagePreviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3">{imagePreviews.length} image(s) uploaded</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-white/50 bg-white/50">
                    <img src={img} alt={`Label ${viewLabels[imageViews[i]] || i + 1}`} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute top-2 left-2">
                      <select
                        value={imageViews[i]}
                        onChange={(e) => { const nv = [...imageViews]; nv[i] = e.target.value as ProductView; setContentViews(nv); }}
                        className="text-[9px] font-bold px-2 py-1 rounded-lg bg-black/60 text-white border-0 outline-none cursor-pointer"
                      >
                        {(["front", "back", "left", "right", "top", "bottom", "other"] as const).map((v) => (
                          <option key={v} value={v}>{viewLabels[v]}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => removeImage(i)} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={runAIInspection} disabled={!canProceedStep2 || isProcessing} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20">
              <Sparkles className="mr-2 h-4 w-4" /> Start AI Inspection
            </Button>
          </div>
        </div>
      )}

      {/* Processing */}
      {isProcessing && (
        <div className="glass-card rounded-2xl p-10 sm:p-16 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-6 w-6 text-blue-600 animate-pulse" /></div>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">AI Analysis in Progress</p>
            <p className="mt-2 text-sm text-gray-500">{processingStage}</p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
          <p className="text-[10px] text-gray-400">Powered by Google Gemini AI</p>
        </div>
      )}

      {/* RESULTS */}
      {step === 3 && result && !isProcessing && (
        <>
          {/* Feature 20: One-Glance Inspection Status */}
          <div className={`glass-card rounded-2xl p-5 border-2 ${result.status === "compliant" ? "border-green-300 bg-green-50/30" : result.status === "non-compliant" ? "border-red-300 bg-red-50/30" : "border-amber-300 bg-amber-50/30"}`}>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.92 0.01 240)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={result.status === "compliant" ? "#22c55e" : result.status === "non-compliant" ? "#ef4444" : "#f59e0b"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(result.score / 100) * 314} 314`} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-gray-900">{result.score}</span>
                  <span className="text-[9px] text-gray-400 font-medium">/100</span>
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Inspection Status</p>
                {(() => { const cfg = statusConfig[result.status]; const Icon = cfg.icon; return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    <Icon className="h-3 w-3" />
                    {result.status === "compliant" ? "COMPLIANT" : result.status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED"}
                  </span>
                ); })()}
                <p className="mt-2 text-xs text-gray-500 max-w-lg">{result.inspectionSummary?.keyFindings?.[0] || result.explanation}</p>
              </div>
              <div className="flex flex-col gap-2 text-center">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${riskColors[result.riskPriority.level as keyof typeof riskColors]}`}>
                  Risk: {result.riskPriority.level.toUpperCase()} ({result.riskPriority.score}/100)
                </div>
                <div className="flex gap-1.5">
                  {result.violations.length > 0 && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">{result.violations.length} Finding(s)</span>}
                  {result.anomalies.length > 0 && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">{result.anomalies.length} Anomaly</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowReport(true)} className="rounded-xl text-xs"><FileText className="mr-1 h-3 w-3" /> Report</Button>
                <Button onClick={resetInspection} variant="outline" className="rounded-xl text-xs"><RotateCcw className="mr-1 h-3 w-3" /> New</Button>
              </div>
            </div>
          </div>

          {/* Feature 15: Inspection Summary */}
          {result.inspectionSummary && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Inspection Summary</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Key Findings</p>
                  <ul className="space-y-1.5">
                    {result.inspectionSummary.keyFindings.map((f, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-[8px] font-bold text-blue-600 shrink-0 mt-0.5">{i + 1}</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Recommended Actions</p>
                  <ul className="space-y-1.5">
                    {result.inspectionSummary.recommendedActions.map((a, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <RefreshCw className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Feature 19: Next Best Action */}
          {result.nextBestActions.filter((a) => a.type !== "no-action").length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-blue-200 bg-blue-50/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Next Best Action</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.nextBestActions.filter((a) => a.type !== "no-action").sort((a, b) => a.priority - b.priority).map((action) => (
                  <div key={action.id} className="flex items-start gap-2 p-3 rounded-xl bg-white/50 border border-white/60 flex-1 min-w-[200px]">
                    <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      {action.type === "recapture" ? <CameraIcon className="h-3 w-3 text-blue-600" /> :
                       action.type === "verify-mrp" ? <Search className="h-3 w-3 text-blue-600" /> :
                       <Scan className="h-3 w-3 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{action.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 4: Recapture Recommendations */}
          {result.recaptureRecommendations.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-amber-200 bg-amber-50/20">
              <div className="flex items-center gap-2 mb-3">
                <CameraIcon className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Adaptive Recapture Recommendations</h3>
              </div>
              <div className="space-y-2">
                {result.recaptureRecommendations.map((rec: RecaptureRecommendation, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-white/50 border border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rec.severity === "critical" ? "bg-red-100 text-red-700" : rec.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {rec.severity.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-500">{rec.issue}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{rec.message}</p>
                    {rec.improvement && (
                      <div className="mt-2 flex items-center gap-2 text-[10px]">
                        <span className="text-red-600 font-bold">Before: {rec.improvement.beforeConfidence}%</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-green-600 font-bold">After: {rec.improvement.afterConfidence}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 7: Label Anomaly Detection */}
          {result.anomalies.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-orange-200 bg-orange-50/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-bold text-gray-900">Label Anomaly Detection</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 font-bold">EXPERIMENTAL</span>
              </div>
              <div className="space-y-2">
                {result.anomalies.map((anomaly: LabelAnomaly) => (
                  <div key={anomaly.id} className={`p-3 rounded-xl border cursor-pointer ${anomalySeverityColors[anomaly.severity as keyof typeof anomalySeverityColors]}`} onClick={() => setExpandedAnomaly(expandedAnomaly === anomaly.id ? null : anomaly.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase">{anomaly.type.replace(/-/g, " ")}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/50">{anomaly.confidence}% confidence</span>
                      </div>
                      <ChevronRight className={`h-3 w-3 transition-transform ${expandedAnomaly === anomaly.id ? "rotate-90" : ""}`} />
                    </div>
                    {expandedAnomaly === anomaly.id && (
                      <div className="mt-2 pt-2 border-t border-current/10">
                        <p className="text-xs">{anomaly.description}</p>
                        <p className="text-[10px] mt-1 opacity-70">Potential anomaly — manual verification required. Not definitive fraud detection.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live AI Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 w-fit">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Live AI Analysis</span>
          </div>

          {/* Main Results Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Image with Bounding Boxes */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Product Label</h3>
              </div>
              <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl overflow-hidden border border-white/50">
                {imagePreviews.length > 0 ? (
                  <div className="relative">
                    <img src={imagePreviews[0]} alt="Product Label" className="w-full object-contain max-h-[500px]" />
                    {result.fields.filter((f) => f.boundingBox).map((field) => (
                      <div key={`box-${field.id}`} className={`absolute border-2 rounded pointer-events-none transition-all ${field.status === "compliant" ? "border-green-400/80" : field.status === "review-required" ? "border-amber-400/80" : "border-red-400/80"}`} style={{ left: `${field.boundingBox!.x}%`, top: `${field.boundingBox!.y}%`, width: `${field.boundingBox!.width}%`, height: `${field.boundingBox!.height}%` }}>
                        <div className={`absolute -top-5 left-0 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${field.status === "compliant" ? "bg-green-500 text-white" : field.status === "review-required" ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}>
                          {field.fieldName} {field.confidence > 0 ? `${field.confidence}%` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center"><p className="text-xs text-gray-400">No image available</p></div>
                )}
              </div>
              <p className="mt-3 text-[10px] text-gray-400 text-center">Bounding boxes show detected fields with confidence scores</p>
              {rawOcrText && (
                <div className="mt-4 p-3 rounded-xl bg-white/40 border border-white/50">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Raw OCR Text</p>
                  <pre className="text-[10px] text-gray-600 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">{rawOcrText}</pre>
                </div>
              )}
            </div>

            {/* Extracted Declarations */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Extracted Declarations</h3>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {result.fields.map((field) => {
                  const detCfg = detectionStatusConfig[field.detectionStatus] || detectionStatusConfig.detected;
                  return (
                    <div key={field.id} className={`p-3 rounded-xl border transition-all ${field.status === "compliant" ? "bg-green-50/40 border-green-200/50" : field.status === "review-required" ? "bg-amber-50/40 border-amber-200/50" : "bg-red-50/40 border-red-200/50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{field.fieldName}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${detCfg.bg} ${detCfg.color}`}>{detCfg.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${field.confidence >= 80 ? "bg-green-100 text-green-700" : field.confidence >= 60 ? "bg-amber-100 text-amber-700" : field.confidence > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                            {field.confidence > 0 ? `${field.confidence}%` : "N/A"}
                          </span>
                          {(() => { const cfg = statusConfig[field.status]; const Icon = cfg.icon; return <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />; })()}
                        </div>
                      </div>
                      {editingId === field.id ? (
                        <div className="flex items-center gap-2">
                          <Input value={editingFields[field.id] ?? field.value} onChange={(e) => setEditingFields((p) => ({ ...p, [field.id]: e.target.value }))} className="h-7 text-xs glass-input" />
                          <button onClick={() => {
                            const corrected = editingFields[field.id] || field.value;
                            handleInspectorCorrection(field.id, field.fieldName, field.value, corrected);
                            setEditingId(null);
                          }} className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200"><Save className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-700 font-medium">{field.value || <span className="italic text-gray-400">Not detected</span>}</p>
                          <button onClick={() => { setEditingId(field.id); setEditingFields((p) => ({ ...p, [field.id]: field.value })); }} className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit3 className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={runAIInspection} className="rounded-lg text-xs flex-1"><RotateCcw className="mr-1 h-3 w-3" /> Re-run Analysis</Button>
                <Button size="sm" onClick={() => setShowReport(true)} className="rounded-lg text-xs flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"><FileText className="mr-1 h-3 w-3" /> Generate Report</Button>
              </div>
            </div>
          </div>

          {/* Feature 8: Risk Priority Panel */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">AI-Assisted Inspection Risk Priority</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border ${riskColors[result.riskPriority.level as keyof typeof riskColors]}`}>
                <span className="text-2xl font-extrabold">{result.riskPriority.score}</span>
                <span className="text-[8px] font-bold uppercase">/100</span>
              </div>
              <div className="flex-1 space-y-1.5">
                {result.riskPriority.factors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-32 shrink-0 font-medium text-gray-700">{factor.factor}</div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full" style={{ width: `${(factor.contribution / 30) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-8 text-right">+{factor.contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Category Breakdown</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {result.categories.map((cat) => (
                <div key={cat.name} className="p-3 rounded-xl bg-white/40 border border-white/50">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{cat.name}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-lg font-extrabold text-gray-900">{cat.score}</span>
                    <span className="text-xs text-gray-400 mb-0.5">/ {cat.maxScore}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${cat.score / cat.maxScore >= 0.8 ? "bg-green-500" : cat.score / cat.maxScore >= 0.5 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${(cat.score / cat.maxScore) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 1: Evidence Chain (Enhanced Violations) */}
          {result.violations.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-bold text-gray-900">Evidence Chain — {result.violations.length} Finding(s)</h3>
              </div>
              <div className="space-y-3">
                {result.violations.map((v: Violation, i: number) => (
                  <div key={v.id} className={`rounded-xl border overflow-hidden ${v.severity === "high" ? "border-red-200" : "border-amber-200"}`}>
                    <button onClick={() => setSelectedViolation(selectedViolation === v.id ? null : v.id)} className="w-full p-4 text-left flex items-center gap-3 hover:bg-white/30 transition-colors">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${v.severity === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400">#{String(i + 1).padStart(2, "0")}</span>
                          <p className="text-sm font-bold text-gray-900">{v.title}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Rule {v.ruleId} • {v.severity.toUpperCase()} severity</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${selectedViolation === v.id ? "rotate-90" : ""}`} />
                    </button>
                    {selectedViolation === v.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                        {/* Evidence Chain Steps */}
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 overflow-x-auto pb-1">
                          {["Product Image", "Detected Region", "OCR Text", "Extracted Field", "Applicable Rule", "Validation", "Finding"].map((step, si) => (
                            <span key={si} className="flex items-center gap-1 shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">{step}</span>
                              {si < 6 && <span className="text-gray-300">→</span>}
                            </span>
                          ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-white/50"><p className="text-[10px] font-bold text-gray-500 uppercase">Expected</p><p className="text-xs text-gray-700 mt-1">{v.expected}</p></div>
                          <div className="p-3 rounded-lg bg-white/50"><p className="text-[10px] font-bold text-gray-500 uppercase">Detected</p><p className="text-xs text-gray-700 mt-1">{v.detected}</p></div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                          <div className="flex items-start gap-2">
                            <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <div><p className="text-[10px] font-bold text-blue-700 uppercase">AI Evidence</p><p className="text-xs text-blue-600 mt-1">{v.evidence}</p></div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                          <p className="text-[10px] font-bold text-amber-700 uppercase">Why was this flagged?</p>
                          <p className="text-xs text-amber-700 mt-1">{v.explanation}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50/50 border border-green-100">
                          <p className="text-[10px] font-bold text-green-700 uppercase">Recommendation</p>
                          <p className="text-xs text-green-700 mt-1">{v.recommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.violations.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <p className="mt-3 text-sm font-bold text-gray-900">No Violations Detected</p>
              <p className="mt-1 text-xs text-gray-500">All mandatory declarations appear compliant.</p>
            </div>
          )}

          {/* Commodity-Aware Rule Engine */}
          {result.commodityInfo && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-gray-900">Commodity Identification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="rounded-lg bg-indigo-50/80 border border-indigo-100 p-3">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase">Detected Category</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{result.commodityInfo.displayName}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{result.commodityInfo.description}</p>
                  </div>
                  {result.commodityInfo.exemptionsApplied.length > 0 && (
                    <div className="rounded-lg bg-amber-50/80 border border-amber-100 p-3">
                      <p className="text-[10px] font-bold text-amber-600 uppercase">Exceptions Applied</p>
                      {result.commodityInfo.exemptionsApplied.map((ex, i) => (
                        <p key={i} className="text-[10px] text-amber-700 mt-1">Rule {ex.ruleId}: {ex.reason}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Rules Checked</p>
                  <div className="flex flex-wrap gap-1">
                    {result.commodityInfo.applicableRuleIds.map(ruleId => (
                      <span key={ruleId} className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-mono">R{ruleId}</span>
                    ))}
                  </div>
                  {result.commodityInfo.skippedRules.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">Skipped (Not Applicable)</p>
                      <div className="flex flex-wrap gap-1">
                        {result.commodityInfo.skippedRules.map(ruleId => (
                          <span key={ruleId} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[9px] font-mono line-through">R{ruleId}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MRP Currency Validation */}
          {result.mrpCurrency && !result.mrpCurrency.detected && result.mrpCurrency.issue && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">MRP Currency Notation Issue</h3>
              </div>
              <div className="rounded-lg bg-amber-50/80 border border-amber-100 p-3">
                <p className="text-xs text-amber-700">{result.mrpCurrency.issue}</p>
                <p className="text-[10px] text-gray-500 mt-1">Rule 6(1)(e) requires explicit currency notation on the price declaration.</p>
              </div>
            </div>
          )}

          {/* Deep Rule Compliance (Rule 6,7,8,9,12,13) */}
          {result.deepRuleResults && result.deepRuleResults.length > 0 && (() => {
            const nonPass = result.deepRuleResults!.filter(d => d.status !== "PASS");
            if (nonPass.length === 0) return null;
            return (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-bold text-gray-900">Deep Rule Compliance — {nonPass.length} Advanced Check(s)</h3>
                </div>
                <div className="space-y-2">
                  {nonPass.map((d) => {
                    const statusColors: Record<string, string> = {
                      VIOLATION: "bg-red-100 text-red-700 border-red-200",
                      REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
                      INFO: "bg-blue-100 text-blue-700 border-blue-200",
                    };
                    const badgeColors: Record<string, string> = {
                      VIOLATION: "bg-red-500 text-white",
                      REVIEW: "bg-amber-500 text-white",
                      INFO: "bg-blue-500 text-white",
                    };
                    return (
                      <div key={d.id || d.ruleId} className={statusColors[d.status] || "bg-gray-50 border-gray-200"}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={badgeColors[d.status] || "bg-gray-400 text-white"}>{d.status}</span>
                          <span className="text-[10px] font-bold text-gray-400">{d.ruleReference}</span>
                          {d.severity === "high" && <span className="px-1.5 py-0.5 rounded bg-red-200 text-red-800 text-[8px] font-bold">HIGH</span>}
                          {d.severity === "medium" && <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 text-[8px] font-bold">MEDIUM</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{d.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{d.message}</p>
                        {d.remediation && <p className="text-[10px] text-gray-500 mt-2 italic">Remediation: {d.remediation}</p>}
                        {d.deemedManufacturer && <p className="text-[10px] text-blue-600 mt-1 font-bold">Deemed Manufacturer: {d.deemedManufacturer}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Feature 12: Declaration Knowledge Graph */}
          {result.declarationMap.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Map className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Declaration Knowledge Graph</h3>
              </div>
              <div className="space-y-2">
                {result.declarationMap.map((entry: DeclarationMapEntry, i: number) => {
                  const cfg = statusConfig[entry.status as keyof typeof statusConfig] || statusConfig["review-required"];
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="p-3 rounded-xl bg-white/40 border border-white/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
                          <span className="text-xs font-bold text-gray-800">{entry.fieldName}</span>
                          <span className="text-[9px] text-gray-400">→ Rule {entry.ruleId}</span>
                          <span className="text-[9px] text-gray-400">→ {entry.ruleName}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{Math.round(entry.overallConfidence)}%</span>
                      </div>
                      {entry.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.sources.map((src, si) => (
                            <span key={si} className="text-[8px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">
                              {viewLabels[src.view]}: "{src.ocrText.slice(0, 30)}{src.ocrText.length > 30 ? "..." : ""}" ({src.confidence}%)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feature 13: Confidence Matrix */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Scan className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Inspection Confidence Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-[10px] font-bold text-gray-500 uppercase"></th>
                    <th className="text-center py-2 px-3 text-[10px] font-bold text-gray-500 uppercase bg-green-50 rounded-tl-lg">High Confidence</th>
                    <th className="text-center py-2 px-3 text-[10px] font-bold text-gray-500 uppercase bg-amber-50 rounded-tr-lg">Low Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(["compliant", "non-compliant", "missing"] as const).map((row) => (
                    <tr key={row}>
                      <td className="py-2 px-3 text-[10px] font-bold text-gray-600 uppercase">{row === "missing" ? "Not Detected" : row}</td>
                      {(["high", "low"] as const).map((conf) => {
                        const cell = confidenceMatrix.find((c) => c.confidenceLevel === conf && c.complianceStatus === row);
                        const displayMap: Record<string, { label: string; color: string; bg: string }> = {
                          verified: { label: "✅ Verified", color: "text-green-700", bg: "bg-green-50" },
                          finding: { label: "🔴 Finding", color: "text-red-700", bg: "bg-red-50" },
                          review: { label: "🟡 Review", color: "text-amber-700", bg: "bg-amber-50" },
                          recapture: { label: "📸 Recapture", color: "text-orange-700", bg: "bg-orange-50" },
                        };
                        const dm = displayMap[cell?.displayStatus || "review"];
                        return (
                          <td key={conf} className={`py-2 px-3 text-center ${conf === "high" ? "bg-green-50/30" : "bg-amber-50/30"}`}>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${dm.bg} ${dm.color}`}>{dm.label}</span>
                            {cell && cell.fields.length > 0 && (
                              <p className="text-[8px] text-gray-500 mt-1">{cell.fields.join(", ")}</p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature 9: Inspector Corrections Feedback Log */}
          {corrections.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">AI Feedback Log</h3>
              </div>
              <div className="space-y-2">
                {corrections.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-blue-50/30 border border-blue-100">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3 text-blue-500" />
                      <span className="font-bold text-gray-800">{c.field}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-red-600 line-through">{c.original || "empty"}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-green-600 font-bold">{c.corrected}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 10: Revalidation Log */}
          {revalidations.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-green-200 bg-green-50/20">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-bold text-gray-900">Smart Revalidation Results</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2">Compliance analysis updated after inspector corrections.</p>
              <div className="space-y-1.5">
                {revalidations.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-800">{r.field}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${(statusConfig[r.from]?.bg || "bg-gray-100")} ${statusConfig[r.from]?.color || "text-gray-600"}`}>{r.from}</span>
                    <ArrowRight className="h-3 w-3 text-green-500" />
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${(statusConfig[r.to]?.bg || "bg-gray-100")} ${statusConfig[r.to]?.color || "text-gray-600"}`}>{r.to}</span>
                    <span className="text-[9px] text-gray-400 ml-auto">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 17: Audit Trail */}
          {auditTrail.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Audit Trail</h3>
              </div>
              <div className="relative pl-4 space-y-3">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-blue-100 rounded-full" />
                {auditTrail.map((entry) => (
                  <div key={entry.id} className="relative flex items-start gap-3">
                    <div className={`absolute -left-4 w-2.5 h-2.5 rounded-full border-2 border-white mt-1.5 ${entry.type === "ai" ? "bg-blue-500" : entry.type === "inspector" ? "bg-green-500" : "bg-gray-400"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500">{entry.timestamp}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${entry.type === "ai" ? "bg-blue-100 text-blue-600" : entry.type === "inspector" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>{entry.actor}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-0.5">{entry.action}</p>
                      <p className="text-[10px] text-gray-500">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetInspection} className="rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" /> Start New Inspection</Button>
            <Button onClick={() => setShowReport(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20"><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
          </div>
        </>
      )}

      {/* Report Modal */}
      {showReport && result && (
        <ReportModal result={result} productInfo={productInfo} inspectionId={inspectionId.current} auditTrail={auditTrail} corrections={corrections} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

/* ============================================================
   Report Modal (Feature 16: Evidence-First Report)
   ============================================================ */
function ReportModal({ result, productInfo, inspectionId, auditTrail, corrections, onClose }: {
  result: ComplianceResult;
  productInfo: ProductInfo;
  inspectionId: string;
  auditTrail: AuditEntry[];
  corrections: { field: string; original: string; corrected: string; time: string }[];
  onClose: () => void;
}) {
  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const statusLabel = result.status === "compliant" ? "COMPLIANT" : result.status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED";
    const statusColor = result.status === "compliant" ? "#16a34a" : result.status === "non-compliant" ? "#dc2626" : "#d97706";
    const fieldsHtml = result.fields.map((f) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151">${f.fieldName}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#4b5563">${f.value || "—"}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;text-align:center">${f.confidence > 0 ? f.confidence + "%" : "—"}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center"><span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;background:${f.status === "compliant" ? "#dcfce7" : f.status === "review-required" ? "#fef3c7" : "#fee2e2"};color:${f.status === "compliant" ? "#16a34a" : f.status === "review-required" ? "#d97706" : "#dc2626"}">${f.status === "compliant" ? "OK" : f.status === "review-required" ? "REVIEW" : "FAIL"}</span></td></tr>`).join("");
    const violationsHtml = result.violations.length > 0 ? `<h3 style="font-size:14px;font-weight:700;color:#111827;margin:20px 0 10px">Findings (${result.violations.length})</h3>${result.violations.map((v) => `<div style="padding:10px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;margin-bottom:8px"><p style="font-size:12px;font-weight:700;color:#991b1b">${v.title}</p><p style="font-size:11px;color:#b91c1c;margin-top:4px"><strong>Evidence:</strong> ${v.evidence}</p><p style="font-size:11px;color:#b91c1c;margin-top:2px"><strong>Explanation:</strong> ${v.explanation}</p><p style="font-size:10px;color:#9ca3af;margin-top:4px">Recommendation: ${v.recommendation}</p></div>`).join("")}` : `<p style="color:#16a34a;font-weight:700">No violations detected.</p>`;
    const correctionsHtml = corrections.length > 0 ? `<h3 style="font-size:14px;font-weight:700;color:#111827;margin:20px 0 10px">Inspector Corrections (${corrections.length})</h3><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="border-bottom:2px solid #e5e7eb"><th style="text-align:left;padding:6px;color:#6b7280">Field</th><th style="text-align:left;padding:6px;color:#6b7280">AI Value</th><th style="text-align:left;padding:6px;color:#6b7280">Corrected</th><th style="text-align:left;padding:6px;color:#6b7280">Time</th></tr></thead><tbody>${corrections.map((c) => `<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;font-weight:600">${c.field}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#dc2626;text-decoration:line-through">${c.original || "empty"}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#16a34a;font-weight:700">${c.corrected}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;color:#9ca3af">${c.time}</td></tr>`).join("")}</tbody></table>` : "";
    const riskHtml = `<div style="padding:12px;border-radius:8px;border:2px solid ${statusColor}20;background:${statusColor}08;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><div><p style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0">AI Compliance Risk Score</p><p style="font-size:24px;font-weight:800;margin:4px 0 0">${result.score} / 100</p></div><div style="text-align:right"><span style="padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;background:${statusColor}18;color:${statusColor}">${statusLabel}</span><p style="font-size:10px;color:#6b7280;margin-top:4px">Risk: ${result.riskPriority.level.toUpperCase()} (${result.riskPriority.score}/100)</p></div></div>`;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Inspection Report - ${inspectionId}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:40px;color:#111827}@media print{body{margin:20px}}</style></head><body>
      <div style="text-align:center;margin-bottom:20px"><h1 style="font-size:20px;font-weight:800;margin:0">MetrologyAI</h1><p style="font-size:11px;color:#6b7280;margin:4px 0 0">AI-Assisted Legal Metrology Inspection Report — Evidence-First</p></div>
      <div style="border-top:2px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:12px 0;margin-bottom:16px;display:flex;justify-content:space-between"><span style="font-size:12px;color:#6b7280">Inspection ID: <strong>${inspectionId}</strong></span><span style="font-size:12px;color:#6b7280">Date: <strong>${productInfo.dateTime || new Date().toLocaleDateString()}</strong></span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px"><div style="padding:10px;border-radius:8px;background:#f9fafb"><p style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0">Product</p><p style="font-size:13px;font-weight:600;margin:4px 0 0">${productInfo.productName || "N/A"}</p><p style="font-size:11px;color:#6b7280;margin:2px 0 0">${productInfo.manufacturer || ""}</p></div><div style="padding:10px;border-radius:8px;background:#f9fafb"><p style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:0">Inspector</p><p style="font-size:13px;font-weight:600;margin:4px 0 0">${productInfo.inspectorId || "N/A"}</p><p style="font-size:11px;color:#6b7280;margin:2px 0 0">${productInfo.location || ""}</p></div></div>
      ${riskHtml}
      <h3 style="font-size:14px;font-weight:700;color:#111827;margin:20px 0 10px">Extracted Declarations (Evidence Chain)</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:2px solid #e5e7eb"><th style="text-align:left;padding:8px;font-weight:700;color:#6b7280;font-size:10px;text-transform:uppercase">Field</th><th style="text-align:left;padding:8px;font-weight:700;color:#6b7280;font-size:10px;text-transform:uppercase">Value</th><th style="text-align:center;padding:8px;font-weight:700;color:#6b7280;font-size:10px;text-transform:uppercase">Confidence</th><th style="text-align:center;padding:8px;font-weight:700;color:#6b7280;font-size:10px;text-transform:uppercase">Status</th></tr></thead><tbody>${fieldsHtml}</tbody></table>
      ${violationsHtml}${correctionsHtml}
      <div style="margin-top:24px;padding:12px;border-radius:8px;background:#eff6ff;border:1px solid #bfdbfe"><p style="font-size:10px;color:#1d4ed8;line-height:1.6;margin:0"><strong>AI Assistance Notice:</strong> This report is generated using AI-assisted extraction and rule-based analysis. Final verification and enforcement decisions remain with the authorized inspector.</p></div>
      <div style="margin-top:16px;text-align:center;font-size:9px;color:#9ca3af"><p style="margin:0">MetrologyAI — AI-Assisted Legal Metrology Inspection System</p><p style="margin:2px 0 0">Generated on ${new Date().toLocaleString()}</p></div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const Icons = {
    X: (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Shield: (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
  };
  const statusLabel = result.status === "compliant" ? "COMPLIANT" : result.status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Inspection Report</h2>
            <p className="text-xs text-gray-500">{inspectionId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/50 text-gray-400 hover:text-gray-600"><Icons.X className="h-5 w-5" /></button>
        </div>

        <div className="text-center py-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Icons.Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">MetrologyAI</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Evidence-First Inspection Report</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/40">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Product</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{productInfo.productName || "N/A"}</p>
            <p className="text-xs text-gray-500">{productInfo.manufacturer}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/40">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Inspector</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{productInfo.inspectorId || "N/A"}</p>
            <p className="text-xs text-gray-500">{productInfo.location || "N/A"}</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${result.status === "compliant" ? "bg-green-50/50 border-green-200" : result.status === "non-compliant" ? "bg-red-50/50 border-red-200" : "bg-amber-50/50 border-amber-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Compliance Score</p>
              <p className="text-2xl font-extrabold text-gray-900">{result.score} / 100</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.status === "compliant" ? "bg-green-100 text-green-700" : result.status === "non-compliant" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                {statusLabel}
              </span>
              <p className="text-[10px] text-gray-500 mt-1">Risk: {result.riskPriority.level.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Extracted Declarations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100"><th className="text-left py-2 font-semibold text-gray-500">Field</th><th className="text-left py-2 font-semibold text-gray-500">Value</th><th className="text-left py-2 font-semibold text-gray-500">Confidence</th><th className="text-left py-2 font-semibold text-gray-500">Status</th></tr></thead>
              <tbody>
                {result.fields.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-700">{f.fieldName}</td>
                    <td className="py-2 text-gray-600">{f.value || "—"}</td>
                    <td className="py-2 text-gray-600">{f.confidence > 0 ? `${f.confidence}%` : "—"}</td>
                    <td className="py-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${f.status === "compliant" ? "bg-green-100 text-green-700" : f.status === "review-required" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{f.status === "compliant" ? "OK" : f.status === "review-required" ? "REVIEW" : "FAIL"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {result.violations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Findings ({result.violations.length})</h3>
            <div className="space-y-2">
              {result.violations.map((v) => (
                <div key={v.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <p className="text-xs font-bold text-red-800">{v.title}</p>
                  <p className="text-[10px] text-red-600 mt-1"><strong>Evidence:</strong> {v.evidence}</p>
                  <p className="text-[10px] text-red-600 mt-1"><strong>Why:</strong> {v.explanation}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Recommendation: {v.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {corrections.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Inspector Corrections</h3>
            <div className="space-y-1">
              {corrections.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-blue-50/30">
                  <span className="font-bold">{c.field}</span>
                  <span className="text-red-600 line-through">{c.original || "empty"}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-bold">{c.corrected}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
          <p className="text-[10px] text-blue-800 line-height-1.6"><strong>AI Assistance Notice:</strong> This report is generated using AI-assisted extraction and rule-based analysis. Final verification and enforcement decisions remain with the authorized inspector.</p>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">Close</Button>
          <Button onClick={handleDownloadPDF} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl text-xs"><Download className="mr-2 h-3 w-3" /> Download PDF</Button>
        </div>
      </div>
    </div>
  );
}
