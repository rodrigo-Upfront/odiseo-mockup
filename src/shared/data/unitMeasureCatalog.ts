export type UnitMeasureCode = "G" | "KG" | "ML" | "L" | "OZ" | "UNI";

export interface UnitMeasureCatalogRecord {
  TbUniMedPk: number;
  TbUniMedCod: UnitMeasureCode;
  TbUniMedNom: string;
  TbUniMedOrd: number;
  TbUniMedActi: boolean;
}

export interface CatalogOption {
  value: string;
  label: string;
}

export interface UnitMeasureOption extends CatalogOption {
  id: number;
  code: UnitMeasureCode;
}

export const TABUNIMEDODISEO_INITIAL_DATA: UnitMeasureCatalogRecord[] = [
  {
    TbUniMedPk: 1,
    TbUniMedCod: "G",
    TbUniMedNom: "Gramos (G)",
    TbUniMedOrd: 1,
    TbUniMedActi: true,
  },
  {
    TbUniMedPk: 2,
    TbUniMedCod: "KG",
    TbUniMedNom: "Kilogramos (KG)",
    TbUniMedOrd: 2,
    TbUniMedActi: true,
  },
  {
    TbUniMedPk: 3,
    TbUniMedCod: "ML",
    TbUniMedNom: "Mililitros (ML)",
    TbUniMedOrd: 3,
    TbUniMedActi: true,
  },
  {
    TbUniMedPk: 4,
    TbUniMedCod: "L",
    TbUniMedNom: "Litros (L)",
    TbUniMedOrd: 4,
    TbUniMedActi: true,
  },
  {
    TbUniMedPk: 5,
    TbUniMedCod: "OZ",
    TbUniMedNom: "Onzas (OZ)",
    TbUniMedOrd: 5,
    TbUniMedActi: true,
  },
  {
    TbUniMedPk: 6,
    TbUniMedCod: "UNI",
    TbUniMedNom: "Unidades (UNI)",
    TbUniMedOrd: 6,
    TbUniMedActi: true,
  },
];

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUnitMeasureCode(
  value: unknown,
): UnitMeasureCode | "" {
  const normalized = normalizeText(value);

  if (!normalized) return "";

  const codeMap: Record<string, UnitMeasureCode> = {
    "g": "G",
    "gramo": "G",
    "gramos": "G",
    "gramos (g)": "G",

    "kg": "KG",
    "kgs": "KG",
    "kilogramo": "KG",
    "kilogramos": "KG",
    "kilogramos (kg)": "KG",

    "ml": "ML",
    "mililitro": "ML",
    "mililitros": "ML",
    "mililitros (ml)": "ML",

    "l": "L",
    "litro": "L",
    "litros": "L",
    "litros (l)": "L",

    "oz": "OZ",
    "onza": "OZ",
    "onzas": "OZ",
    "onzas (oz)": "OZ",

    "uni": "UNI",
    "unidad": "UNI",
    "unidades": "UNI",
    "unidades (uni)": "UNI",
  };

  const mapped = codeMap[normalized];
  if (mapped) return mapped;

  return "";
}

export function getActiveUnitMeasureRecords(): UnitMeasureCatalogRecord[] {
  return TABUNIMEDODISEO_INITIAL_DATA
    .filter((record) => record.TbUniMedActi)
    .sort((a, b) => a.TbUniMedOrd - b.TbUniMedOrd);
}

export function getActiveUnitMeasureOptions(): CatalogOption[] {
  return getActiveUnitMeasureRecords().map((record) => ({
    value: record.TbUniMedCod,
    label: record.TbUniMedNom,
  }));
}

export function findUnitMeasureByCode(
  code: unknown,
): UnitMeasureCatalogRecord | null {
  const normalized = normalizeUnitMeasureCode(code);

  if (!normalized) return null;

  return (
    getActiveUnitMeasureRecords().find(
      (record) => record.TbUniMedCod === normalized,
    ) || null
  );
}

export function findUnitMeasureByName(
  name: unknown,
): UnitMeasureCatalogRecord | null {
  const normalizedName = normalizeText(name);

  if (!normalizedName) return null;

  return (
    getActiveUnitMeasureRecords().find((record) =>
      normalizeText(record.TbUniMedNom).includes(normalizedName),
    ) || null
  );
}

export function resolveUnitMeasureCodeToCatalog(value: unknown): UnitMeasureCode | "" {
  const normalized = normalizeUnitMeasureCode(value);
  if (normalized) return normalized;

  const record = findUnitMeasureByName(value);
  if (record) return record.TbUniMedCod;

  return "";
}

export function getUnitMeasureLabel(code: unknown): string {
  const normalized = normalizeUnitMeasureCode(code);
  if (!normalized) return String(code ?? "").trim();

  const record = findUnitMeasureByCode(normalized);
  return record?.TbUniMedNom || normalized;
}

export function isValidUnitMeasureCode(code: unknown): code is UnitMeasureCode {
  const normalized = normalizeUnitMeasureCode(code);
  return normalized !== "";
}
