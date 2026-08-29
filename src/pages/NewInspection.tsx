import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoProducts, generateInspectionId, generateMockComplianceResult } from "@/lib/demo-data";
import type { ProductInfo, ComplianceResult, ExtractedField, Violation, InspectionStatus } from "@/lib/types";
import {
  Upload,
  Camera,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  FileText,
  Shield,
  Search,
  RotateCcw,
  Edit3,
  Save,
  Download,
  ChevronRight,
  Sparkles,
  Target,
  Info,
} from "lucide-react";

type Step = 1 | 2 | 3;

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  compliant: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
  "review-required": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  "non-compliant": { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
};

const steps = [
  { num: 1, label: "Product Info" },
  { num: 2, label: "Upload Label" },
  { num: 3, label: "AI Inspection" },
];

export default function NewInspection() {
  const navigate = useNavigate();
  const location = useLocation();
  const demoIndex = (location.state as { demoIndex?: number })?.demoIndex;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    productName: "", manufacturer: "", brand: "", category: "",
    batchNumber: "", mrp: "", inspectorId: "INS-LM-042",
    location: "", dateTime: new Date().toISOString().slice(0, 16),
  });
  const [images, setImages] = useState<string[]>([]);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const inspectionId = useRef(generateInspectionId());

  // Load demo product if specified
  useEffect(() => {
    if (demoIndex !== undefined && demoProducts[demoIndex]) {
      const demo = demoProducts[demoIndex];
      setProductInfo({
        productName: demo.name.split(" — ")[0].replace("Product [A-C] — ", ""),
        manufacturer: "Demo Manufacturer Pvt Ltd",
        brand: "Demo Brand",
        category: "Food",
        batchNumber: "B240812",
        mrp: "₹120",
        inspectorId: "INS-LM-042",
        location: "Delhi Central Market",
        dateTime: new Date().toISOString().slice(0, 16),
      });
      setImages(["demo-label-image"]);
      setStep(3);
      runAIInspection(demo.result);
    }
  }, [demoIndex]);

  const updateField = (field: keyof ProductInfo, value: string) => {
    setProductInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        newImages.push(url);
      }
    });
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const runAIInspection = async (overrideResult?: ComplianceResult) => {
    setStep(3);
    setIsProcessing(true);
    const stages = [
      "Initializing image pre-processing...",
      "Running OCR text extraction...",
      "Detecting label fields...",
      "Extracting declarations...",
      "Running compliance rule engine...",
      "Generating risk score...",
    ];
    for (const stage of stages) {
      setProcessingStage(stage);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    }
    const res = overrideResult || generateMockComplianceResult(productInfo.productName || "Sample Product");
    setResult(res);
    setIsProcessing(false);
  };

  const handleFieldEdit = (fieldId: string, value: string) => {
    setEditingFields((prev) => ({ ...prev, [fieldId]: value }));
  };

  const saveFieldEdit = (fieldId: string) => {
    if (result) {
      const updatedFields = result.fields.map((f) =>
        f.id === fieldId ? { ...f, value: editingFields[fieldId] || f.value } : f
      );
      setResult({ ...result, fields: updatedFields });
    }
    setEditingId(null);
  };

  const canProceedStep1 = productInfo.productName.trim() !== "";
  const canProceedStep2 = images.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-gray-500">New Inspection</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          {step === 3 && result ? "AI Inspection Results" : `Step ${step}: ${steps[step - 1].label}`}
        </h1>
      </div>

      {/* Step indicator */}
      {!isProcessing && !result && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      step >= s.num
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-gray-900" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full ${step > s.num ? "bg-blue-500" : "bg-gray-100"}`} />
                )}
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
              {
                label: "Product Category", field: "category" as const, placeholder: "Select category",
                type: "select" as const,
                options: ["Food", "Cosmetics", "Packaged Water", "Household Products", "Electronics", "Other"],
              },
              { label: "Batch/Lot Number", field: "batchNumber" as const, placeholder: "e.g., BN-2026-08-12" },
              { label: "MRP (Expected)", field: "mrp" as const, placeholder: "e.g., ₹120" },
              { label: "Inspector ID", field: "inspectorId" as const, placeholder: "e.g., INS-LM-042" },
              { label: "Inspection Location", field: "location" as const, placeholder: "e.g., Central Market, Delhi" },
              { label: "Date & Time", field: "dateTime" as const, type: "datetime-local" },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={productInfo[f.field]}
                    onChange={(e) => updateField(f.field, e.target.value)}
                    className="w-full h-10 px-3 rounded-xl text-sm glass-input border border-white/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none bg-white/50"
                  >
                    <option value="">Select category</option>
                    {f.options!.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={f.type || "text"}
                    value={productInfo[f.field]}
                    onChange={(e) => updateField(f.field, e.target.value)}
                    placeholder={f.placeholder}
                    className="glass-input h-10"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20"
            >
              Next: Upload Label
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Upload Label */}
      {step === 2 && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Upload Product Label</h2>
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
            className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 mx-auto group-hover:bg-blue-100 transition-colors">
              <Upload className="h-6 w-6 text-blue-500" />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-700">Drag & drop label images here</p>
            <p className="mt-1 text-xs text-gray-400">or click to browse • JPG, PNG, WEBP • Multiple files supported</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <Upload className="h-3 w-3" />
                Browse Files
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                <Camera className="h-3 w-3" />
                Use Camera
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          {/* Uploaded images */}
          {images.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-3">{images.length} image(s) uploaded</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-white/50 bg-white/50">
                    {img === "demo-label-image" ? (
                      <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                        <div className="text-center">
                          <FileText className="h-10 w-10 text-blue-300 mx-auto" />
                          <p className="text-xs font-medium text-blue-600 mt-2">Demo Label Image</p>
                          <p className="text-[10px] text-gray-400 mt-1">Simulated product label</p>
                        </div>
                      </div>
                    ) : (
                      <img src={img} alt="Label" className="w-full aspect-[4/3] object-cover" />
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => runAIInspection()}
              disabled={!canProceedStep2}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start AI Inspection
            </Button>
          </div>
        </div>
      )}

      {/* Processing animation */}
      {isProcessing && (
        <div className="glass-card rounded-2xl p-10 sm:p-16 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">AI Analysis in Progress</p>
            <p className="mt-2 text-sm text-gray-500">{processingStage}</p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {/* Step 3: AI Inspection Results */}
      {step === 3 && result && !isProcessing && (
        <>
          {/* Compliance Score Banner */}
          <div className={`glass-card rounded-2xl p-6 border ${
            result.status === "compliant" ? "border-green-200" : result.status === "non-compliant" ? "border-red-200" : "border-amber-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Score circle */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.92 0.01 240)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={result.status === "compliant" ? "#22c55e" : result.status === "non-compliant" ? "#ef4444" : "#f59e0b"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 314} 314`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900">{result.score}</span>
                  <span className="text-[10px] text-gray-400 font-medium">/100</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Compliance Risk Score</p>
                <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start">
                  {(() => {
                    const cfg = statusConfig[result.status];
                    const Icon = cfg.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <Icon className="h-3 w-3" />
                        {result.status === "compliant" ? "COMPLIANT" : result.status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED"}
                      </span>
                    );
                  })()}
                </div>
                <p className="mt-2 text-xs text-gray-500 max-w-lg">{result.explanation}</p>
              </div>
              <div className="sm:ml-auto flex gap-2">
                <Button variant="outline" onClick={() => setShowReport(true)} className="rounded-xl text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  View Report
                </Button>
                <Button
                  onClick={() => { setStep(1); setResult(null); setImages([]); setEditingFields({}); }}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  New Inspection
                </Button>
              </div>
            </div>
          </div>

          {/* Split view: Image + Fields */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Image with overlays */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Product Label</h3>
              </div>
              <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden border border-white/50">
                {/* Simulated label with bounding boxes */}
                <div className="absolute inset-0 p-6">
                  <div className="w-full h-full bg-white rounded-lg shadow-inner p-4 relative">
                    <p className="text-xs font-bold text-gray-800 mb-1">{productInfo.productName || "Product Name"}</p>
                    <p className="text-[10px] text-gray-500 mb-3">{productInfo.manufacturer || "Manufacturer Name"}</p>
                    <div className="space-y-2">
                      {result.fields.filter(f => f.value).slice(0, 6).map((field) => (
                        <div
                          key={field.id}
                          className={`p-1.5 rounded border text-[10px] transition-all ${
                            field.status === "compliant"
                              ? "border-green-300 bg-green-50/50"
                              : field.status === "review-required"
                                ? "border-amber-300 bg-amber-50/50"
                                : "border-red-300 bg-red-50/50"
                          }`}
                        >
                          <span className="font-semibold text-gray-700">{field.fieldName}:</span>{" "}
                          <span className="text-gray-600">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Overlay bounding boxes */}
                {result.fields.filter(f => f.boundingBox).map((field) => (
                  <div
                    key={`box-${field.id}`}
                    className={`absolute border-2 rounded pointer-events-none transition-all ${
                      field.status === "compliant"
                        ? "border-green-400/60"
                        : field.status === "review-required"
                          ? "border-amber-400/60"
                          : "border-red-400/60"
                    }`}
                    style={{
                      left: `${(field.boundingBox!.x / 300) * 100}%`,
                      top: `${(field.boundingBox!.y / 160) * 100}%`,
                      width: `${(field.boundingBox!.width / 300) * 100}%`,
                      height: `${(field.boundingBox!.height / 160) * 100}%`,
                    }}
                  >
                    <div className={`absolute -top-5 left-0 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      field.status === "compliant"
                        ? "bg-green-500 text-white"
                        : field.status === "review-required"
                          ? "bg-amber-500 text-white"
                          : "bg-red-500 text-white"
                    }`}>
                      {field.fieldName} {field.confidence}%
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-gray-400 text-center">
                Bounding boxes show detected fields with confidence scores • Demo Simulation Mode
              </p>
            </div>

            {/* Right: Extracted fields */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Extracted Declarations</h3>
              </div>
              <div className="space-y-2">
                {result.fields.map((field) => (
                  <div key={field.id} className={`p-3 rounded-xl border transition-all ${
                    field.status === "compliant" ? "bg-green-50/40 border-green-200/50"
                      : field.status === "review-required" ? "bg-amber-50/40 border-amber-200/50"
                        : "bg-red-50/40 border-red-200/50"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{field.fieldName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          field.confidence >= 80 ? "bg-green-100 text-green-700"
                            : field.confidence >= 60 ? "bg-amber-100 text-amber-700"
                              : field.confidence > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {field.confidence > 0 ? `${field.confidence}%` : "N/A"}
                        </span>
                        {(() => {
                          const cfg = statusConfig[field.status];
                          const Icon = cfg.icon;
                          return <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />;
                        })()}
                      </div>
                    </div>
                    {editingId === field.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingFields[field.id] ?? field.value}
                          onChange={(e) => handleFieldEdit(field.id, e.target.value)}
                          className="h-7 text-xs glass-input"
                        />
                        <button onClick={() => saveFieldEdit(field.id)} className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-200">
                          <Save className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-700 font-medium">
                          {field.value || <span className="italic text-gray-400">Not detected</span>}
                        </p>
                        <button
                          onClick={() => { setEditingId(field.id); setEditingFields((p) => ({ ...p, [field.id]: field.value })); }}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg text-xs flex-1">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Re-run OCR
                </Button>
                <Button size="sm" className="rounded-lg text-xs flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Confirm Data
                </Button>
              </div>
            </div>
          </div>

          {/* Category Scores */}
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
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.score / cat.maxScore >= 0.8 ? "bg-green-500"
                          : cat.score / cat.maxScore >= 0.5 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Violations */}
          {result.violations.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-bold text-gray-900">Violations ({result.violations.length})</h3>
              </div>
              <div className="space-y-3">
                {result.violations.map((v, i) => {
                  const cfg = statusConfig["non-compliant"];
                  return (
                    <div key={v.id} className={`rounded-xl border ${cfg.border} overflow-hidden`}>
                      <button
                        onClick={() => setSelectedViolation(selectedViolation === v.id ? null : v.id)}
                        className="w-full p-4 text-left flex items-center gap-3 hover:bg-red-50/30 transition-colors"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          v.severity === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">#{String(i + 1).padStart(2, "0")}</span>
                            <p className="text-sm font-bold text-gray-900">{v.title}</p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">{v.field} • {v.severity.toUpperCase()} severity</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${selectedViolation === v.id ? "rotate-90" : ""}`} />
                      </button>
                      {selectedViolation === v.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-red-100 pt-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-white/50">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Expected</p>
                              <p className="text-xs text-gray-700 mt-1">{v.expected}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/50">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Detected</p>
                              <p className="text-xs text-gray-700 mt-1">{v.detected}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                            <div className="flex items-start gap-2">
                              <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-blue-700 uppercase">Why was this flagged?</p>
                                <p className="text-xs text-blue-600 mt-1">{v.explanation}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-700 uppercase">Recommendation</p>
                            <p className="text-xs text-amber-700 mt-1">{v.recommendation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No violations */}
          {result.violations.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <p className="mt-3 text-sm font-bold text-gray-900">No Violations Detected</p>
              <p className="mt-1 text-xs text-gray-500">All mandatory declarations appear compliant.</p>
            </div>
          )}

          {/* Back button */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setStep(1); setResult(null); setImages([]); }} className="rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start New Inspection
            </Button>
            <Button onClick={() => setShowReport(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 rounded-xl shadow-lg shadow-blue-500/20">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </>
      )}

      {/* Report Modal */}
      {showReport && result && (
        <ReportModal
          result={result}
          productInfo={productInfo}
          inspectionId={inspectionId.current}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function ReportModal({ result, productInfo, inspectionId, onClose }: {
  result: ComplianceResult;
  productInfo: ProductInfo;
  inspectionId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Inspection Report</h2>
            <p className="text-xs text-gray-500">{inspectionId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/50 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center py-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">MetrologyAI</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">AI-Assisted Legal Metrology Inspection Report</p>
        </div>

        {/* Product Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/40">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Product</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{productInfo.productName || "N/A"}</p>
            <p className="text-xs text-gray-500">{productInfo.manufacturer}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/40">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Inspector</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{productInfo.inspectorId}</p>
            <p className="text-xs text-gray-500">{productInfo.location || "N/A"}</p>
          </div>
        </div>

        {/* Score */}
        <div className={`p-4 rounded-xl border ${
          result.status === "compliant" ? "bg-green-50/50 border-green-200" : result.status === "non-compliant" ? "bg-red-50/50 border-red-200" : "bg-amber-50/50 border-amber-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Compliance Score</p>
              <p className="text-2xl font-extrabold text-gray-900">{result.score} / 100</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              result.status === "compliant" ? "bg-green-100 text-green-700" : result.status === "non-compliant" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}>
              {result.status === "compliant" ? "COMPLIANT" : result.status === "non-compliant" ? "NON-COMPLIANT" : "REVIEW REQUIRED"}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Extracted Declarations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-semibold text-gray-500">Field</th>
                  <th className="text-left py-2 font-semibold text-gray-500">Value</th>
                  <th className="text-left py-2 font-semibold text-gray-500">Confidence</th>
                  <th className="text-left py-2 font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.fields.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-700">{f.fieldName}</td>
                    <td className="py-2 text-gray-600">{f.value || "—"}</td>
                    <td className="py-2 text-gray-600">{f.confidence > 0 ? `${f.confidence}%` : "—"}</td>
                    <td className="py-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        f.status === "compliant" ? "bg-green-100 text-green-700" : f.status === "review-required" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {f.status === "compliant" ? "OK" : f.status === "review-required" ? "REVIEW" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations */}
        {result.violations.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Violations</h3>
            <div className="space-y-2">
              {result.violations.map((v) => (
                <div key={v.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <p className="text-xs font-bold text-red-800">{v.title}</p>
                  <p className="text-[10px] text-red-600 mt-1">{v.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              This report is generated using AI-assisted extraction and rule-based analysis. Final verification and enforcement decisions remain with the authorized inspector.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs">Close</Button>
          <Button className="rounded-xl text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <Download className="mr-1 h-3 w-3" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
