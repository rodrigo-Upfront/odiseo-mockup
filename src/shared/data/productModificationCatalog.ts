export type ProductClassification =
  | "Producto Nuevo"
  | "Producto Modificado";

export interface ProductModificationCatalogRecord {
  TbModProdPk: number;
  TbModProdCod: string;
  TbModProdClas: ProductClassification;
  TbModProdNom: string;
  TbModProdOrd: number;
  TbModProdActi: boolean;
}

export interface CatalogOption {
  value: string;
  label: string;
}

export interface ProductModificationOption extends CatalogOption {
  id: number;
  code: string;
  classification: ProductClassification;
}

export const TABMODPRODODISEO_INITIAL_DATA: ProductModificationCatalogRecord[] = [
  {
    TbModProdPk: 1,
    TbModProdCod: "MOD-PN-001",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Nueva estructura",
    TbModProdOrd: 1,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 2,
    TbModProdCod: "MOD-PN-002",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Nuevos insumos",
    TbModProdOrd: 2,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 3,
    TbModProdCod: "MOD-PN-003",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Nuevo formato de envasado",
    TbModProdOrd: 3,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 4,
    TbModProdCod: "MOD-PN-004",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Diseño nuevo",
    TbModProdOrd: 4,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 5,
    TbModProdCod: "MOD-PN-005",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Extensión de Línea",
    TbModProdOrd: 5,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 6,
    TbModProdCod: "MOD-PN-006",
    TbModProdClas: "Producto Nuevo",
    TbModProdNom: "Nuevo equipamiento / proceso / temperatura",
    TbModProdOrd: 6,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 7,
    TbModProdCod: "MOD-PM-001",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Modifica Dimensiones",
    TbModProdOrd: 1,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 8,
    TbModProdCod: "MOD-PM-002",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Modifica Propiedades",
    TbModProdOrd: 2,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 9,
    TbModProdCod: "MOD-PM-003",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Cambia Estructura",
    TbModProdOrd: 3,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 10,
    TbModProdCod: "MOD-PM-004",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Cambia Materia Prima",
    TbModProdOrd: 4,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 11,
    TbModProdCod: "MOD-PM-005",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Cambia Diseño",
    TbModProdOrd: 5,
    TbModProdActi: true,
  },
  {
    TbModProdPk: 12,
    TbModProdCod: "MOD-PM-006",
    TbModProdClas: "Producto Modificado",
    TbModProdNom: "Portafolio Estándar",
    TbModProdOrd: 6,
    TbModProdActi: true,
  },
];

export function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeProductClassificationToCatalog(
  value: unknown,
): ProductClassification | "" {
  const normalized = normalizeText(value);

  if (!normalized) return "";

  if (
    normalized === "producto nuevo" ||
    normalized === "nuevo" ||
    normalized.includes("producto nuevo")
  ) {
    return "Producto Nuevo";
  }

  if (
    normalized === "producto modificado" ||
    normalized === "modificado" ||
    normalized.includes("producto modificado")
  ) {
    return "Producto Modificado";
  }

  return "";
}

export function isProductoNuevoCatalog(value: unknown): boolean {
  return normalizeProductClassificationToCatalog(value) === "Producto Nuevo";
}

export function isProductoModificadoCatalog(value: unknown): boolean {
  return normalizeProductClassificationToCatalog(value) === "Producto Modificado";
}

export function getActiveProductModificationRecords(): ProductModificationCatalogRecord[] {
  return TABMODPRODODISEO_INITIAL_DATA
    .filter((record) => record.TbModProdActi)
    .sort((a, b) => {
      const classificationCompare = a.TbModProdClas.localeCompare(
        b.TbModProdClas,
        "es",
      );

      if (classificationCompare !== 0) return classificationCompare;

      return a.TbModProdOrd - b.TbModProdOrd;
    });
}

export function getActiveProductClassificationOptions(): CatalogOption[] {
  const seen = new Set<ProductClassification>();

  return getActiveProductModificationRecords()
    .filter((record) => {
      if (seen.has(record.TbModProdClas)) return false;
      seen.add(record.TbModProdClas);
      return true;
    })
    .map((record) => ({
      value: record.TbModProdClas,
      label: record.TbModProdClas,
    }));
}

export function getActiveModificationOptionsByClassification(
  classification: unknown,
): ProductModificationOption[] {
  const catalogClassification =
    normalizeProductClassificationToCatalog(classification);

  if (!catalogClassification) return [];

  return getActiveProductModificationRecords()
    .filter((record) => record.TbModProdClas === catalogClassification)
    .sort((a, b) => a.TbModProdOrd - b.TbModProdOrd)
    .map((record) => ({
      id: record.TbModProdPk,
      value: record.TbModProdNom,
      label: record.TbModProdNom,
      code: record.TbModProdCod,
      classification: record.TbModProdClas,
    }));
}

export function findProductModificationById(
  id: unknown,
): ProductModificationCatalogRecord | null {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) return null;

  return (
    getActiveProductModificationRecords().find(
      (record) => record.TbModProdPk === numericId,
    ) || null
  );
}

export function findProductModificationByName(
  name: unknown,
  classification?: unknown,
): ProductModificationCatalogRecord | null {
  const normalizedName = normalizeText(name);
  const catalogClassification =
    normalizeProductClassificationToCatalog(classification);

  if (!normalizedName) return null;

  return (
    getActiveProductModificationRecords().find((record) => {
      const sameName = normalizeText(record.TbModProdNom) === normalizedName;

      const sameClassification = catalogClassification
        ? record.TbModProdClas === catalogClassification
        : true;

      return sameName && sameClassification;
    }) || null
  );
}

export function resolveModificationNameToCatalog(value: unknown): string {
  const normalized = normalizeText(value);

  if (!normalized) return "";

  const aliasMap: Record<string, string> = {
    "nuevo diseno": "Diseño nuevo",
    "diseno nuevo": "Diseño nuevo",
    "diseño nuevo": "Diseño nuevo",

    "modifica dimensiones": "Modifica Dimensiones",
    "modifica propiedades": "Modifica Propiedades",

    "cambia estructura": "Cambia Estructura",
    "cambia materia prima": "Cambia Materia Prima",
    "cambia diseno": "Cambia Diseño",
    "cambia diseño": "Cambia Diseño",

    "extension de linea": "Extensión de Línea",
    "extensión de linea": "Extensión de Línea",
    "extensión de línea": "Extensión de Línea",

    "portafolio estandar": "Portafolio Estándar",
    "portafolio estándar": "Portafolio Estándar",
  };

  const aliasValue = aliasMap[normalized];

  if (aliasValue) return aliasValue;

  const record = getActiveProductModificationRecords().find(
    (item) => normalizeText(item.TbModProdNom) === normalized,
  );

  return record?.TbModProdNom || String(value ?? "").trim();
}

export function resolveProductModificationForCreate(params: {
  classification: unknown;
  modificationName: unknown;
}): ProductModificationCatalogRecord | null {
  const catalogClassification = normalizeProductClassificationToCatalog(
    params.classification,
  );

  const catalogModificationName = resolveModificationNameToCatalog(
    params.modificationName,
  );

  if (!catalogClassification || !catalogModificationName) return null;

  return findProductModificationByName(
    catalogModificationName,
    catalogClassification,
  );
}