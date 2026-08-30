import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    inspections: defineTable({
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
      fields: v.string(), // JSON stringified ExtractedField[]
      violations: v.string(), // JSON stringified Violation[]
      categories: v.string(), // JSON stringified ComplianceCategory[]
      explanation: v.string(),
      rawOcrText: v.string(),
      recaptureRecommendations: v.string(), // JSON
      anomalies: v.string(), // JSON
      nextBestActions: v.string(), // JSON
      inspectionSummary: v.string(), // JSON
      declarationMap: v.string(), // JSON
      auditTrail: v.string(), // JSON
      corrections: v.string(), // JSON
      revalidations: v.string(), // JSON
      imageUrl: v.optional(v.string()),
    })
      .index("by_inspectionId", ["inspectionId"])
      .index("by_status", ["status"])
      .index("by_date", ["dateTime"])
      .index("by_risk", ["riskLevel"]),

    // E-Commerce comparisons
    ecommerceComparisons: defineTable({
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
      discrepancies: v.string(), // JSON
      imageUrl: v.optional(v.string()),
      dateTime: v.string(),
    }).index("by_inspectionId", ["inspectionId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
