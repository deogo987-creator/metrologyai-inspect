import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Save a new inspection
export const saveInspection = mutation({
  args: {
    inspectionId: v.string(),
    productName: v.string(),
    manufacturer: v.string(),
    brand: v.string(),
    category: v.string(),
    batchNumber: v.string(),
    mrp: v.string(),
    inspectorId: v.string(),
    location: v.string(),
    dateTime: v.string(),
    score: v.number(),
    status: v.string(),
    riskLevel: v.string(),
    riskScore: v.number(),
    fields: v.string(),
    violations: v.string(),
    categories: v.string(),
    explanation: v.string(),
    rawOcrText: v.string(),
    recaptureRecommendations: v.string(),
    anomalies: v.string(),
    nextBestActions: v.string(),
    inspectionSummary: v.string(),
    declarationMap: v.string(),
    auditTrail: v.string(),
    corrections: v.string(),
    revalidations: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("inspections", args);
  },
});

// Get all inspections
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const inspections = await ctx.db.query("inspections").order("desc").collect();
    return inspections.map((i) => ({
      ...i,
      fieldsParsed: JSON.parse(i.fields || "[]"),
      violationsParsed: JSON.parse(i.violations || "[]"),
    }));
  },
});

// Get recent inspections (limit)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const inspections = await ctx.db.query("inspections").order("desc").take(limit);
    return inspections.map((i) => ({
      ...i,
      fieldsParsed: JSON.parse(i.fields || "[]"),
      violationsParsed: JSON.parse(i.violations || "[]"),
    }));
  },
});

// Get inspection by ID
export const getById = query({
  args: { inspectionId: v.string() },
  handler: async (ctx, args) => {
    const inspection = await ctx.db
      .query("inspections")
      .withIndex("by_inspectionId", (q) => q.eq("inspectionId", args.inspectionId))
      .first();
    if (!inspection) return null;
    return {
      ...inspection,
      fieldsParsed: JSON.parse(inspection.fields || "[]"),
      violationsParsed: JSON.parse(inspection.violations || "[]"),
      categoriesParsed: JSON.parse(inspection.categories || "[]"),
      recaptureRecommendationsParsed: JSON.parse(inspection.recaptureRecommendations || "[]"),
      anomaliesParsed: JSON.parse(inspection.anomalies || "[]"),
      nextBestActionsParsed: JSON.parse(inspection.nextBestActions || "[]"),
      inspectionSummaryParsed: JSON.parse(inspection.inspectionSummary || "{}"),
      declarationMapParsed: JSON.parse(inspection.declarationMap || "[]"),
      auditTrailParsed: JSON.parse(inspection.auditTrail || "[]"),
      correctionsParsed: JSON.parse(inspection.corrections || "[]"),
      revalidationsParsed: JSON.parse(inspection.revalidations || "[]"),
    };
  },
});

// Get stats for dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("inspections").collect();
    const total = all.length;
    const compliant = all.filter((i) => i.status === "compliant").length;
    const nonCompliant = all.filter((i) => i.status === "non-compliant").length;
    const reviewRequired = all.filter((i) => i.status === "review-required").length;
    const avgScore = total > 0 ? Math.round(all.reduce((s, i) => s + i.score, 0) / total) : 0;
    const highRisk = all.filter((i) => i.riskLevel === "high").length;
    const mediumRisk = all.filter((i) => i.riskLevel === "medium").length;
    const lowRisk = all.filter((i) => i.riskLevel === "low").length;

    return { total, compliant, nonCompliant, reviewRequired, avgScore, highRisk, mediumRisk, lowRisk };
  },
});

// Search inspections
export const search = query({
  args: {
    query: v.string(),
    status: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let inspections = await ctx.db.query("inspections").order("desc").collect();

    if (args.query) {
      const q = args.query.toLowerCase();
      inspections = inspections.filter(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.manufacturer.toLowerCase().includes(q) ||
          i.inspectionId.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          i.riskLevel.toLowerCase().includes(q)
      );
    }

    if (args.status) {
      inspections = inspections.filter((i) => i.status === args.status);
    }
    if (args.riskLevel) {
      inspections = inspections.filter((i) => i.riskLevel === args.riskLevel);
    }

    return inspections.map((i) => ({
      id: i._id,
      inspectionId: i.inspectionId,
      productName: i.productName,
      manufacturer: i.manufacturer,
      date: i.dateTime,
      score: i.score,
      status: i.status,
      riskLevel: i.riskLevel,
      category: i.category,
    }));
  },
});

// Update inspection with corrections
export const addCorrection = mutation({
  args: {
    inspectionId: v.string(),
    corrections: v.string(),
    revalidations: v.string(),
    fields: v.string(),
    score: v.number(),
    status: v.string(),
    auditTrail: v.string(),
  },
  handler: async (ctx, args) => {
    const inspection = await ctx.db
      .query("inspections")
      .withIndex("by_inspectionId", (q) => q.eq("inspectionId", args.inspectionId))
      .first();
    if (inspection) {
      await ctx.db.patch(inspection._id, {
        corrections: args.corrections,
        revalidations: args.revalidations,
        fields: args.fields,
        score: args.score,
        status: args.status,
        auditTrail: args.auditTrail,
      });
    }
  },
});

// Save e-commerce comparison
export const saveComparison = mutation({
  args: {
    inspectionId: v.string(),
    physicalMrp: v.string(),
    onlineMrp: v.string(),
    physicalQty: v.string(),
    onlineQty: v.string(),
    physicalManufacturer: v.string(),
    onlineManufacturer: v.string(),
    physicalProductName: v.string(),
    onlineProductName: v.string(),
    matchStatus: v.string(),
    discrepancies: v.string(),
    imageUrl: v.optional(v.string()),
    dateTime: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ecommerceComparisons", args);
  },
});

// Get comparisons for an inspection
export const getComparisons = query({
  args: { inspectionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ecommerceComparisons")
      .withIndex("by_inspectionId", (q) => q.eq("inspectionId", args.inspectionId))
      .collect();
  },
});

// Delete inspection
export const deleteInspection = mutation({
  args: { inspectionId: v.string() },
  handler: async (ctx, args) => {
    const inspection = await ctx.db
      .query("inspections")
      .withIndex("by_inspectionId", (q) => q.eq("inspectionId", args.inspectionId))
      .first();
    if (inspection) {
      await ctx.db.delete(inspection._id);
    }
  },
});
