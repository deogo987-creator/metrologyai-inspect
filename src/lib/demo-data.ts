import type { Rule } from "./types";

export const rules: Rule[] = [
  { id: "LM-001", declaration: "Product Identity", requirement: "Product name must be clearly declared on the label", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-002", declaration: "Manufacturer Details", requirement: "Name and address of manufacturer/prepacker/importer must be declared", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-003", declaration: "Net Quantity", requirement: "Net quantity must be declared in standard SI units", validationType: "ocr-format", severity: "high", status: "active", category: "Quantity" },
  { id: "LM-004", declaration: "MRP Declaration", requirement: "Maximum Retail Price must be declared in ₹ with tax inclusion", validationType: "ocr-format", severity: "high", status: "active", category: "Price" },
  { id: "LM-005", declaration: "Consumer Care Details", requirement: "Consumer care contact information (phone/email) must be present", validationType: "presence", severity: "high", status: "active", category: "Mandatory" },
  { id: "LM-006", declaration: "Date Declaration", requirement: "Manufacturing/packing date and expiry/use-before date must be declared", validationType: "ocr-format", severity: "high", status: "active", category: "Date" },
  { id: "LM-007", declaration: "Country of Origin", requirement: "Country of origin must be declared on the package", validationType: "ocr-presence", severity: "medium", status: "active", category: "Mandatory" },
  { id: "LM-008", declaration: "Batch/Lot Number", requirement: "Batch or lot number must be clearly marked", validationType: "presence", severity: "medium", status: "active", category: "Mandatory" },
  { id: "LM-009", declaration: "Vegetarian/Non-Veg Mark", requirement: "Mandatory vegetarian/non-vegetarian declaration symbol", validationType: "presence", severity: "medium", status: "active", category: "Food" },
  { id: "LM-010", declaration: "FSSAI License", requirement: "FSSAI license number for food products", validationType: "ocr-format", severity: "high", status: "active", category: "Food" },
  { id: "LM-011", declaration: "MRP Prefix", requirement: "MRP must be prefixed with '₹' symbol", validationType: "ocr-format", severity: "low", status: "active", category: "Price" },
  { id: "LM-012", declaration: "Date Format", requirement: "Dates must follow DD/MM/YYYY or MMM/YYYY format", validationType: "ocr-format", severity: "low", status: "active", category: "Date" },
];

export function generateInspectionId(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `INS-2026-${num}`;
}
