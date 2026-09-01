import re

with open("src/convex/analyzeLabel.ts", "r") as f:
    content = f.read()

# 1. Add commodityCategory to ExtractionResult
old_extract = '''  stickerDetection?: {
    isStickerPresent: boolean;
    stickerCount: number;
    stickerTypes: string[];
    isCoveringOriginal: boolean;
    dualMRP: { detected: boolean; allMRPValues: string[]; originalMRP: string; stickerMRP: string };
    confidence: number;
    visualEvidence: string;
  };
}'''

new_extract = '''  stickerDetection?: {
    isStickerPresent: boolean;
    stickerCount: number;
    stickerTypes: string[];
    isCoveringOriginal: boolean;
    dualMRP: { detected: boolean; allMRPValues: string[]; originalMRP: string; stickerMRP: string };
    confidence: number;
    visualEvidence: string;
  };
  // Commodity identification
  commodityCategory?: string;
  commoditySubCategory?: string;
}'''

if old_extract in content and "commodityCategory" not in content:
    content = content.replace(old_extract, new_extract, 1)
    print("Updated ExtractionResult with commodityCategory")

# 2. Add commodityInfo and mrpCurrency to ComplianceAnalysisResult
old_result = '''  deepRuleResults?: { ruleId: string; ruleReference: string; title: string; severity: string; status: string; message: string; remediation?: string; deemedManufacturer?: string }[];
}'''

new_result = '''  deepRuleResults?: { ruleId: string; ruleReference: string; title: string; severity: string; status: string; message: string; remediation?: string; deemedManufacturer?: string }[];
  commodityInfo?: {
    category: string;
    displayName: string;
    description: string;
    applicableRuleIds: number[];
    exemptionsApplied: { ruleId: number; reason: string }[];
    skippedRules: number[];
    additionalFields: string[];
  };
  mrpCurrency?: { detected: boolean; notation: string; issue?: string; confidence: number };
}'''

if old_result in content and "commodityInfo" not in content:
    content = content.replace(old_result, new_result, 1)
    print("Updated ComplianceAnalysisResult with commodityInfo and mrpCurrency")

# 3. Add commodity system before MAIN ACTION
commodity_code = """
// ─── COMMODITY TYPES & CATEGORIES ──────────────────────────────────────────
// Commodity-aware rule engine: different packages have different legal requirements

type CommodityType = "food" | "cosmetics" | "household" | "electronics" | "seeds" | "beverages" | "pharmaceuticals" | "textiles" | "other";

interface CommodityCategoryConfig {
  displayName: string;
  description: string;
  baseRuleIds: number[];
  additionalRuleIds: number[];
  exemptions: { ruleId: number; reason: string }[];
  additionalFields: string[];
}

const COMMODITY_CATEGORIES: Record<CommodityType, CommodityCategoryConfig> = {
  food: {
    displayName: "Food & Food Products",
    description: "Packaged food items, snacks, dairy, grains, spices, edible oils",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [9, 10, 11, 12],
    exemptions: [],
    additionalFields: ["fssaiLicense", "vegNonVeg", "expiryDate"],
  },
  beverages: {
    displayName: "Beverages",
    description: "Drinks, juices, water, soft drinks, alcoholic beverages",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [9, 10, 11, 12],
    exemptions: [
      { ruleId: 5, reason: "For alcoholic beverages, State Excise Laws may apply for RSP declaration (Rule 6(1)(e) proviso)" },
    ],
    additionalFields: ["fssaiLicense", "vegNonVeg"],
  },
  cosmetics: {
    displayName: "Cosmetics & Personal Care",
    description: "Soaps, shampoos, skincare, makeup, toiletries",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [9, 10, 11, 12],
    exemptions: [
      { ruleId: 4, reason: "Cosmetics governed by Drugs & Cosmetics Rules, 1945 for date declarations (Rule 6(1)(d) proviso)" },
    ],
    additionalFields: [],
  },
  household: {
    displayName: "Household & Consumer Products",
    description: "Cleaning agents, detergents, candles, kitchenware, utensils",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [8, 10, 11, 12],
    exemptions: [],
    additionalFields: [],
  },
  electronics: {
    displayName: "Electronics & Mobile Phones",
    description: "Phones, laptops, accessories, batteries, chargers, appliances",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 15, 16],
    additionalRuleIds: [8, 10, 12],
    exemptions: [],
    additionalFields: ["dimensions"],
  },
  seeds: {
    displayName: "Seeds & Agricultural Products",
    description: "Certified seeds, fertilizers, pesticides, agricultural inputs",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 13, 15, 16],
    additionalRuleIds: [],
    exemptions: [
      { ruleId: 4, reason: "Seeds certified under Seeds Act, 1966 are exempt from date declaration (Rule 6(1)(d) proviso)" },
    ],
    additionalFields: [],
  },
  pharmaceuticals: {
    displayName: "Pharmaceuticals & Medicines",
    description: "OTC medicines, supplements, Ayurvedic products, medical devices",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [9, 10, 11, 12],
    exemptions: [],
    additionalFields: [],
  },
  textiles: {
    displayName: "Textiles & Clothing",
    description: "Fabrics, garments, home textiles, accessories",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 15, 16],
    additionalRuleIds: [8, 12],
    exemptions: [],
    additionalFields: ["dimensions"],
  },
  other: {
    displayName: "Other Packaged Commodities",
    description: "General consumer packaged commodities not in other categories",
    baseRuleIds: [1, 2, 3, 4, 5, 6, 7, 13, 14, 15, 16],
    additionalRuleIds: [8, 9, 10, 11, 12],
    exemptions: [],
    additionalFields: [],
  },
};

// ─── COMMODITY IDENTIFICATION - from extracted fields ───────────────────────

function identifyCommodity(extraction: ExtractionResult): CommodityType {
  const fields = extraction.fields || {};
  const rawText = (extraction.rawText || "").toLowerCase();
  const productName = (fields.productName?.value || "").toLowerCase();

  // Food indicators
  const foodKeywords = ["food", "snack", "biscuit", "chocolate", "candy", "cereal", "rice", "wheat", "flour", "oil", "ghee", "butter", "milk", "cheese", "yogurt", "dairy", "spice", "masala", "salt", "sugar", "honey", "jam", "sauce", "pickle", "namkeen", "chips", "noodle", "pasta", "bread", "cake", "cookie", "nut", "dry fruit", "fruit", "vegetable", "meat", "fish", "chicken", "egg", "paneer", "atta", "maida", "sooji"];
  const hasFssai = !!(fields.fssaiLicense?.value && fields.fssaiLicense.value !== '""');
  const hasVegNonVeg = !!(fields.vegNonVeg?.value && fields.vegNonVeg.value !== '""');
  const hasExpiry = !!(fields.expiryDate?.value && fields.expiryDate.value !== '""');

  if (hasFssai || hasVegNonVeg || foodKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "food";
  }

  // Beverage indicators
  const beverageKeywords = ["juice", "water", "drink", "beverage", "soda", "tea", "coffee", "cola", "beer", "wine", "whisky", "rum", "vodka", "lassi", "sharbat", "smoothie", "energy drink", "sports drink"];
  if (beverageKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "beverages";
  }

  // Cosmetics
  const cosmeticKeywords = ["shampoo", "soap", "cream", "lotion", "moisturizer", "face wash", "toothpaste", "deodorant", "perfume", "makeup", "foundation", "lipstick", "kajal", "mehandi", "henna", "hair oil", "conditioner", "sunscreen"];
  if (cosmeticKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "cosmetics";
  }

  // Electronics
  const electronicsKeywords = ["mobile", "phone", "laptop", "tablet", "charger", "battery", "headphone", "earphone", "speaker", "camera", "watch", "tv", "monitor", "keyboard", "mouse", "usb", "cable", "adapter", "power bank", "router"];
  if (electronicsKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "electronics";
  }

  // Seeds
  const seedKeywords = ["seed", "fertilizer", "pesticide", "insecticide", "herbicide", "fungicide", "crop", "agriculture", "horticulture", "hybrid", "germination"];
  if (seedKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "seeds";
  }

  // Pharmaceuticals
  const pharmaKeywords = ["tablet", "capsule", "syrup", "ointment", "drops", "injection", "medicines", "drug", "ayurvedic", "supplement", "vitamin", "mineral", "antibiotic", "paracetamol", "ibuprofen", "cough", "cold", "fever", "pain"];
  if (pharmaKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "pharmaceuticals";
  }

  // Textiles
  const textileKeywords = ["shirt", "pant", "trouser", "saree", "suit", "dress", "fabric", "cotton", "silk", "polyester", "nylon", "wool", "denim", "jeans", "jacket", "kurta", "lehenga", "dupatta"];
  if (textileKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "textiles";
  }

  // Household
  const householdKeywords = ["detergent", "cleaner", "wash", "bleach", "dishwash", "mop", "broom", "candle", "incense", "agarbatti", "utensil", "container", "bottle", "plastic", "steel", "aluminium", "tawa", "kadhai"];
  if (householdKeywords.some(k => rawText.includes(k) || productName.includes(k))) {
    return "household";
  }

  return "other";
}

// ─── APPLICABLE RULE SELECTION - based on commodity ─────────────────────────

function selectApplicableRules(
  commodityType: CommodityType,
  extraction: ExtractionResult,
): {
  applicableRuleIds: number[];
  exemptionsApplied: { ruleId: number; reason: string }[];
  skippedRules: number[];
} {
  const config = COMMODITY_CATEGORIES[commodityType] || COMMODITY_CATEGORIES.other;
  const allRuleIds = [...new Set([...config.baseRuleIds, ...config.additionalRuleIds])];

  // Apply exemptions
  const exemptionsApplied: { ruleId: number; reason: string }[] = [];
  const skippedRules: number[] = [];

  for (const exemption of config.exemptions) {
    if (allRuleIds.includes(exemption.ruleId)) {
      exemptionsApplied.push({ ruleId: exemption.ruleId, reason: exemption.reason });
      skippedRules.push(exemption.ruleId);
    }
  }

  // Check Rule 16 (Dimensions) - only if dimensions field has data
  if (allRuleIds.includes(16)) {
    const dimValue = extraction.fields?.dimensions?.value;
    if (!dimValue || dimValue === '""' || dimValue.trim() === "") {
      skippedRules.push(16);
    }
  }

  const applicableRuleIds = allRuleIds.filter(id => !skippedRules.includes(id));
  return { applicableRuleIds, exemptionsApplied, skippedRules };
}

// ─── MRP CURRENCY VALIDATION - detect Rs/Rs. notation ─────────────────────

function validateMRPCurrency(mrpValue: string): { detected: boolean; notation: string; issue?: string; confidence: number } {
  if (!mrpValue || mrpValue === '""' || mrpValue.trim() === "") {
    return { detected: false, notation: "", issue: "MRP value not detected", confidence: 0 };
  }

  const hasRupeeSymbol = /\\u20B9/.test(mrpValue);
  const hasRsDot = /Rs\\.?\\s*/.test(mrpValue);
  const hasINR = /\\bINR\\b/.test(mrpValue);

  if (hasRupeeSymbol) {
    return { detected: true, notation: "\\u20B9", confidence: 95 };
  }
  if (hasRsDot) {
    return { detected: true, notation: "Rs.", confidence: 90 };
  }
  if (hasINR) {
    return { detected: true, notation: "INR", confidence: 85 };
  }

  // MRP exists but no currency notation detected
  const numericOnly = mrpValue.replace(/[^\\d.,]/g, "").trim();
  if (numericOnly && numericOnly.length > 0) {
    return {
      detected: false,
      notation: "",
      issue: `MRP value "${mrpValue}" has no currency notation - Rule 6(1)(e) requires explicit price declaration`,
      confidence: 70,
    };
  }

  return { detected: false, notation: "", issue: "MRP value format not recognized", confidence: 30 };
}

"""

if "// ─── MAIN ACTION" in content and "COMMODITY TYPES" not in content:
    content = content.replace("// ─── MAIN ACTION", commodity_code + "// ─── MAIN ACTION", 1)
    print("Inserted commodity system before MAIN ACTION")

with open("src/convex/analyzeLabel.ts", "w") as f:
    f.write(content)

print("All changes applied successfully")
