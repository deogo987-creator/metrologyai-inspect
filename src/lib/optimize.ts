import type { ImageQualityIssue, RecaptureRecommendation } from "./types";

/**
 * Compress and resize an image for optimal Gemini API performance.
 * Resizes to max 1200px width and compresses to JPEG quality 82.
 */
export function compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        // Also cap height
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Failed to get canvas context")); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        // Verify the result is valid and not too large (Gemini limit ~4MB)
        const base64Part = dataUrl.split(",")[1] || "";
        if (base64Part.length > 5_000_000) {
          // Too large, re-compress with lower quality
          resolve(canvas.toDataURL("image/jpeg", 0.5));
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        reject(new Error(`Image compression failed: ${err instanceof Error ? err.message : String(err)}`));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: read the file as base64 directly
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (result && result.startsWith("data:image")) {
          resolve(result);
        } else {
          reject(new Error("Failed to process image file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

/**
 * Feature 4: Analyze image quality and generate recapture recommendations.
 */
export function analyzeImageQuality(file: File): Promise<{ issues: ImageQualityIssue[]; recommendations: RecaptureRecommendation[] }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const issues: ImageQualityIssue[] = [];
      const recommendations: RecaptureRecommendation[] = [];

      // Check resolution
      if (img.width < 500 || img.height < 500) {
        issues.push("low-resolution");
        recommendations.push({
          issue: "low-resolution",
          severity: "warning",
          message: "Image resolution is low. Move closer to capture clearer text detail.",
          affectedFields: ["all"],
        });
      }

      // Check aspect ratio (extreme ratios suggest bad framing)
      const ratio = Math.max(img.width, img.height) / Math.min(img.width, img.height);
      if (ratio > 3) {
        issues.push("perspective-distortion");
        recommendations.push({
          issue: "perspective-distortion",
          severity: "warning",
          message: "Image appears to be at an extreme angle. Capture head-on for better text extraction.",
          affectedFields: ["all"],
        });
      }

      // Canvas-based analysis for blur detection
      const canvas = document.createElement("canvas");
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Simple blur detection via variance of Laplacian
        let sum = 0;
        let sumSq = 0;
        const grayValues: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          grayValues.push(gray);
          sum += gray;
          sumSq += gray * gray;
        }
        const mean = sum / grayValues.length;
        const variance = sumSq / grayValues.length - mean * mean;
        const stddev = Math.sqrt(variance);

        // Low variance = flat image = possible blur or blank
        if (stddev < 30) {
          issues.push("blur");
          recommendations.push({
            issue: "blur",
            severity: "critical",
            message: "Image appears blurred or lacks detail. Hold the camera steady and capture again.",
            affectedFields: ["all"],
          });
        }

        // Check brightness (low lighting)
        if (mean < 60) {
          issues.push("low-lighting");
          recommendations.push({
            issue: "low-lighting",
            severity: "warning",
            message: "Image appears dark. Improve lighting and recapture.",
            affectedFields: ["all"],
          });
        }

        // Check for potential glare (very high brightness patches)
        let brightPixels = 0;
        for (let i = 0; i < grayValues.length; i++) {
          if (grayValues[i] > 240) brightPixels++;
        }
        const brightRatio = brightPixels / grayValues.length;
        if (brightRatio > 0.3) {
          issues.push("glare");
          recommendations.push({
            issue: "glare",
            severity: "warning",
            message: "Reflection or glare detected. Change the camera angle to reduce reflections.",
            affectedFields: ["mrp", "netQuantity"],
          });
        }
      }

      resolve({ issues, recommendations: issues.length > 0 ? recommendations : [] });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ issues: [], recommendations: [] });
    };
    img.src = url;
  });
}

/**
 * Feature 3: Classify field detection status based on confidence and image quality.
 */
export function classifyDetectionStatus(
  confidence: number,
  hasValue: boolean,
  imageQualityIssues: ImageQualityIssue[]
): "detected" | "uncertain" | "not-detected" | "image-insufficient" {
  if (!hasValue || confidence === 0) {
    if (imageQualityIssues.length > 0) return "image-insufficient";
    return "not-detected";
  }
  if (confidence >= 70) return "detected";
  if (confidence >= 40) return "uncertain";
  if (imageQualityIssues.length > 0) return "image-insufficient";
  return "uncertain";
}

/**
 * Feature 8: Calculate AI Risk Priority Score.
 */
export function calculateRiskPriority(
  score: number,
  fields: { status: string; confidence: number }[],
  anomalies: { confidence: number }[],
  hasHistoricalChanges: boolean
): { score: number; level: "low" | "medium" | "high"; factors: { factor: string; contribution: number; description: string }[] } {
  const factors: { factor: string; contribution: number; description: string }[] = [];
  let riskScore = 0;

  // Low compliance score adds risk
  if (score < 50) {
    const contribution = 30;
    riskScore += contribution;
    factors.push({ factor: "Low Compliance Score", contribution, description: `Score of ${score}/100 indicates significant compliance gaps.` });
  } else if (score < 70) {
    const contribution = 20;
    riskScore += contribution;
    factors.push({ factor: "Moderate Compliance Score", contribution, description: `Score of ${score}/100 suggests areas requiring attention.` });
  }

  // Missing mandatory fields
  const missingCount = fields.filter(f => f.status === "non-compliant").length;
  if (missingCount > 0) {
    const contribution = Math.min(missingCount * 12, 25);
    riskScore += contribution;
    factors.push({ factor: "Missing Declarations", contribution, description: `${missingCount} declaration(s) could not be verified.` });
  }

  // Low OCR confidence
  const lowConfFields = fields.filter(f => f.confidence > 0 && f.confidence < 60).length;
  if (lowConfFields > 0) {
    const contribution = Math.min(lowConfFields * 8, 15);
    riskScore += contribution;
    factors.push({ factor: "Low OCR Confidence", contribution, description: `${lowConfFields} field(s) have confidence below 60%.` });
  }

  // Historical changes
  if (hasHistoricalChanges) {
    const contribution = 20;
    riskScore += contribution;
    factors.push({ factor: "Previous Finding", contribution, description: "Historical data shows changes from previous inspections." });
  }

  // Label anomalies
  if (anomalies.length > 0) {
    const contribution = Math.min(anomalies.length * 7, 14);
    riskScore += contribution;
    factors.push({ factor: "Label Anomaly", contribution, description: `${anomalies.length} potential visual anomaly/anomalies detected.` });
  }

  riskScore = Math.min(riskScore, 100);

  let level: "low" | "medium" | "high";
  if (riskScore >= 60) level = "high";
  else if (riskScore >= 30) level = "medium";
  else level = "low";

  return { score: riskScore, level, factors };
}

/**
 * Feature 13: Build Confidence Matrix from fields.
 */
export function buildConfidenceMatrix(
  fields: { fieldName: string; confidence: number; status: string }[]
): { confidenceLevel: string; complianceStatus: string; displayStatus: string; fields: string[] }[] {
  return [
    {
      confidenceLevel: "high",
      complianceStatus: "compliant",
      displayStatus: "verified",
      fields: fields.filter(f => f.confidence >= 70 && f.status === "compliant").map(f => f.fieldName),
    },
    {
      confidenceLevel: "high",
      complianceStatus: "non-compliant",
      displayStatus: "finding",
      fields: fields.filter(f => f.confidence >= 70 && f.status === "non-compliant").map(f => f.fieldName),
    },
    {
      confidenceLevel: "low",
      complianceStatus: "compliant",
      displayStatus: "review",
      fields: fields.filter(f => f.confidence < 70 && f.confidence > 0 && f.status === "compliant").map(f => f.fieldName),
    },
    {
      confidenceLevel: "low",
      complianceStatus: "non-compliant",
      displayStatus: "recapture",
      fields: fields.filter(f => f.confidence < 70 && f.confidence > 0 && f.status === "non-compliant").map(f => f.fieldName),
    },
  ];
}
