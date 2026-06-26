// src/shared/data/dimensionRestrictionRules.ts

export type DimensionField = "width" | "length" | "gussetWidth";

export type DimensionRange = {
  min: number;
  max: number;
};

export type DimensionRestriction = Partial<Record<DimensionField, DimensionRange>>;

export const DIMENSION_RESTRICTIONS_BY_FORMAT: Record<string, DimensionRestriction> = {
  GENERICA: {
    width: { min: 38, max: 2390 },
    length: { min: 0, max: 961 },
    gussetWidth: { min: 0, max: 0 },
  },

  TISSUE: {
    width: { min: 37, max: 2344 },
    length: { min: 0, max: 990 },
    gussetWidth: { min: 0, max: 2 },
  },

  FOOD: {
    length: { min: 0, max: 1000 },
    gussetWidth: { min: 0, max: 5 },
  },

  WICKET: {
    width: { min: 143, max: 3950 },
    length: { min: 203, max: 900 },
    gussetWidth: { min: 0, max: 5 },
  },

  "SELLO DE FONDO\\SIN FUELLE LATERAL": {
    width: { min: 200, max: 965 },
    length: { min: 0, max: 1651 },
    gussetWidth: { min: 0, max: 5 },
  },

  "SELLO DE FONDO\\CON FUELLE LATERAL": {
    width: { min: 115, max: 1015 },
    length: { min: 0, max: 1400 },
    gussetWidth: { min: 0, max: 10 },
  },

  "SELLO LATERAL\\PESTAÑA\\CON FUELLE FONDO": {
    width: { min: 165, max: 600 },
    length: { min: 202, max: 1010 },
    gussetWidth: { min: 0, max: 5 },
  },

  "SELLO LATERAL\\PESTAÑA\\SIN FUELLE FONDO": {
    width: { min: 115, max: 644 },
    length: { min: 190, max: 1010 },
    gussetWidth: { min: 0, max: 5 },
  },

  "SELLO LATERAL\\CORTE\\CON FUELLE FONDO": {
    width: { min: 95, max: 720 },
    length: { min: 162.5, max: 850 },
    gussetWidth: { min: 0, max: 5 },
  },

  "SELLO LATERAL\\CORTE\\SIN FUELLE FONDO": {
    width: { min: 100, max: 600 },
    length: { min: 145, max: 1010 },
    gussetWidth: { min: 0, max: 2 },
  },

  HOJAS: {
    width: { min: 250, max: 2020 },
    length: { min: 0, max: 3000 },
    gussetWidth: { min: 0, max: 2 },
  },

  "POUCH PLANO\\DOS SELLOS": {
    width: { min: 60, max: 400 },
    length: { min: 90, max: 590 },
    gussetWidth: { min: 0, max: 0 },
  },

  "POUCH PLANO\\TRES SELLOS": {
    width: { min: 48, max: 700 },
    length: { min: 80, max: 1200 },
    gussetWidth: { min: 0, max: 2 },
  },

  "POUCH C/SELLO EN FUELLE\\TIPO 1-1": {
    length: { min: 180, max: 1026 },
    gussetWidth: { min: 0, max: 0 },
  },

  "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE INSERTADO": {
    width: { min: 80, max: 230 },
    length: { min: 134, max: 340 },
    gussetWidth: { min: 0, max: 3 },
  },

  "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE PROPIO": {
    width: { min: 80, max: 419 },
    length: { min: 130, max: 525 },
    gussetWidth: { min: 0, max: 2 },
  },

  "POUCH STAND UP\\TIPO K\\FUELLE PROPIO": {
    width: { min: 135, max: 270 },
    length: { min: 205, max: 320 },
    gussetWidth: { min: 0, max: 2 },
  },

  "POUCH STAND UP\\NORMAL\\FUELLE PROPIO": {
    width: { min: 155, max: 560 },
    length: { min: 190, max: 440 },
    gussetWidth: { min: 0, max: 5 },
  },

  "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE": {
    width: { min: 67, max: 620 },
    length: { min: 145, max: 990 },
    gussetWidth: { min: 0, max: 5 },
  },

  "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE": {
    width: { min: 70, max: 1210 },
    length: { min: 170, max: 1050 },
    gussetWidth: { min: 0, max: 5 },
  },

  "POUCH C/SELLO EN FUELLE\\TIPO 4-1\\FUELLE PROPIO": {
    width: { min: 118, max: 190 },
    length: { min: 330, max: 410 },
    gussetWidth: { min: 0, max: 0 },
  },

  "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE (PE-PE/PE)": {
    width: { min: 67, max: 620 },
    length: { min: 145, max: 990 },
    gussetWidth: { min: 0, max: 5 },
  },

  "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE (PE-PE/PE)": {
    width: { min: 70, max: 1210 },
    length: { min: 170, max: 1050 },
    gussetWidth: { min: 0, max: 5 },
  },

  "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE PROPIO": {
    width: { min: 80, max: 419 },
    length: { min: 130, max: 525 },
    gussetWidth: { min: 0, max: 2 },
  },

  "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE INSERTADO": {
    width: { min: 80, max: 230 },
    length: { min: 134, max: 340 },
    gussetWidth: { min: 0, max: 3 },
  },
};

export function normalizeFormatPlan(value: any): string {
  return String(value || "").trim().toUpperCase();
}

export function getDimensionRestrictionsByFormat(
  formatPlan: any
): DimensionRestriction {
  const normalized = normalizeFormatPlan(formatPlan);
  return DIMENSION_RESTRICTIONS_BY_FORMAT[normalized] || {};
}

export function isDimensionValueInRange(
  value: any,
  range?: DimensionRange
): boolean {
  if (!range) return true;

  const numericValue = Number(String(value).replace(",", "."));

  if (Number.isNaN(numericValue)) return false;

  return numericValue >= range.min && numericValue <= range.max;
}

export function formatDimensionRange(range?: DimensionRange): string {
  if (!range) return "";

  if (range.min === range.max) {
    return `Debe ser ${range.min} mm`;
  }

  return `Rango permitido: ${range.min} mm a ${range.max} mm`;
}
