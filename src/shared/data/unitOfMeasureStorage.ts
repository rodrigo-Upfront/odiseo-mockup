// Catálogo de unidades de medida - Consolidado desde PRODUCT_CATALOGS
// Única fuente de verdad: PRODUCT_CATALOGS.unidadDeMedida
// Valores oficiales del Excel: G, KG, ML, L, OZ, UNI
import { PRODUCT_CATALOGS } from "./productCatalogs";

export type UnitOfMeasure = "G" | "KG" | "ML" | "L" | "OZ" | "UNI";

export const UNITS_OF_MEASURE: UnitOfMeasure[] = (
  PRODUCT_CATALOGS.unidadDeMedida as unknown as Array<{ code: string; label: string }>
).map(item => item.code as UnitOfMeasure);

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  G: "Gramos (G)",
  KG: "Kilogramos (KG)",
  ML: "Mililitros (ML)",
  L: "Litros (L)",
  OZ: "Onzas (OZ)",
  UNI: "Unidades (UNI)",
};

// Mapa de normalización para variantes de unidades
export const UNIT_NORMALIZATION_MAP: Record<string, UnitOfMeasure> = {
  "gramos": "G",
  "gramo": "G",
  "g": "G",
  "G": "G",
  "kilogramos": "KG",
  "kilogramo": "KG",
  "kg": "KG",
  "KG": "KG",
  "mililitros": "ML",
  "mililitro": "ML",
  "ml": "ML",
  "ML": "ML",
  "litros": "L",
  "litro": "L",
  "l": "L",
  "L": "L",
  "onzas": "OZ",
  "onza": "OZ",
  "oz": "OZ",
  "OZ": "OZ",
  "unidades": "UNI",
  "unidad": "UNI",
  "uni": "UNI",
  "UNI": "UNI",
};

export function isValidUnit(unit: string): unit is UnitOfMeasure {
  return UNITS_OF_MEASURE.includes(unit as UnitOfMeasure);
}

export function getUnitLabel(unit: UnitOfMeasure): string {
  return UNIT_LABELS[unit];
}

export function normalizeUnit(value: string): string {
  const normalized = String(value ?? "").trim();
  const normalized_upper = normalized.toUpperCase();
  return (UNIT_NORMALIZATION_MAP[normalized_upper] || UNIT_NORMALIZATION_MAP[normalized] || normalized_upper) as string;
}
