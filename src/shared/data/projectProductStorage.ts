/**
 * ALMACENAMIENTO DE PRODUCTOS PRELIMINARES - MÓDULO DE PROYECTOS ODISEO
 *
 * Este archivo gestiona el ciclo de vida de los Productos Preliminares:
 * - Productos Base: creados desde un proyecto validado (P2), con toda la estructura técnica
 * - Variaciones: derivadas de un producto base, con campos técnicos bloqueados
 *
 * Estados: Registrado, En Cotización, Aprobado, Desestimado, Alta (5 estados simples de negocio)
 * NO incluye estados del Sistema Integral (SI).
 */

import type {
  PreliminaryProductStatus,
  PreliminaryProductType,
} from "./projectProductWorkflow";

const STORAGE_KEY = "odiseo_project_products";

/**
 * Producto Preliminar: ficha técnica de producto antes de envío a SI
 */
export type ProjectPreliminaryProductRecord = {
  id: string;
  projectCode: string;
  preliminaryProductCode: string; // PP-{projectCode}-{000}

  name: string;
  description?: string;

  productType: PreliminaryProductType; // "Base" | "Variación"
  status: PreliminaryProductStatus; // Registrado | En Cotización | Aprobado | Desestimado | Alta

  // Indicadores de tipo
  isBaseProduct?: boolean;
  isDerived?: boolean;

  // Jerarquía
  parentProductId?: string;
  rootProductId?: string;
  generationLevel?: number;
  baseProductId?: string;
  baseProductName?: string;

  // Bloqueos por tipo
  structureLocked?: boolean;
  formatLocked?: boolean;
  printTypeLocked?: boolean;
  layersLocked?: boolean;

  // Estructura técnica (bloqueada en variaciones)
  structureType?: string;
  blueprintFormat?: string;
  printType?: string;
  printClass?: string;

  // Capas (bloqueadas en variaciones)
  layer1Material?: string;
  layer1Micron?: string | number;
  layer1Grammage?: string | number;

  layer2Material?: string;
  layer2Micron?: string | number;
  layer2Grammage?: string | number;

  layer3Material?: string;
  layer3Micron?: string | number;
  layer3Grammage?: string | number;

  layer4Material?: string;
  layer4Micron?: string | number;
  layer4Grammage?: string | number;

  grammage?: string | number;
  grammageTolerance?: string | number;
  referenceEmCode?: string;
  referenceEmVersion?: string;

  // Editables en variaciones
  width?: string | number;
  customerPackingCode?: string;
  estimatedVolume?: string | number;
  unitOfMeasure?: string;

  hasZipper?: string;
  zipperType?: string;

  hasValve?: string;
  valveType?: string;

  hasReinforcement?: string;
  reinforcementThickness?: string | number;
  reinforcementWidth?: string | number;

  hasRoundedCorners?: string;
  roundedCornersType?: string;

  hasPerforation?: string;
  perforationLocation?: string;

  hasPreCut?: string;
  preCutType?: string;

  accessories?: string[];
  targetPrice?: string | number;
  currencyType?: string;
  commercialComments?: string;

  // Objetivo de color (moved from project to product)
  colorObjective?: string[];
  objetivoColor?: string[]; // alias para compatibilidad
  colorObjectiveComment?: string;
  comentarioObjetivoColor?: string; // alias para compatibilidad

  // Campos de producto (moved from project to product)
  technicalApplication?: string;
  aplicacionTecnica?: string; // alias para compatibilidad
  peruvianProductLogo?: "Sí" | "No";
  logoProductoPeruano?: "Sí" | "No"; // alias para compatibilidad
  printingFooter?: "Sí" | "No";
  pieImprenta?: "Sí" | "No"; // alias para compatibilidad

  // Cotización extendida
  saleScope?: "Nacional" | "Internacional";
  incoterm?: string;
  destinationCountry?: string;

  // Indicadores de selección para cotización
  selectedForQuote?: boolean;
  selectedForQuoteAt?: string;

  // Timestamps de transición
  quoteCompletedAt?: string;
  clientApprovedAt?: string;
  quoteRequestedAt?: string;

  // Desestimación
  destimarReason?: string;
  destimarAt?: string;

  // Auditoría
  createdAt: string;
  updatedAt: string;
  createdBy?: string;

  // Trazabilidad de Productos Modificados
  sourceProjectClassification?: "Nuevo" | "Modificado";
  approvedProductId?: string;
  approvedProductSku?: string;
  approvedProductVersion?: string;
  approvedProductName?: string;
  motivoModificacion?: string;
  baseApprovedProductSnapshot?: any;
  sourceBaselineVersion?: number;

  // === COMPATIBILIDAD LEGACY (serán removidos en PASO 6-7) ===
  // Aliases de campo para componentes antiguos
  productName?: string; // alias de 'name'
  productDescription?: string; // alias de 'description'
  productRequestCode?: string; // alias de 'preliminaryProductCode'
  format?: string; // alias de 'blueprintFormat'
  structure?: string; // alias de 'structureType'
  micron?: string | number; // alias de 'layer1Micron' o principal
  gusset?: string | number; // no existe en nuevo modelo
  length?: string | number; // no existe en nuevo modelo
  requiresDesign?: boolean; // no existe en nuevo modelo
  requiresSample?: boolean; // no existe en nuevo modelo
  requiresNewStructure?: boolean; // no existe en nuevo modelo
  targetPriceMin?: string | number; // parte de 'targetPrice' (mín)
  targetPriceMax?: string | number; // parte de 'targetPrice' (máx)
  commercialFinanceComment?: string; // alias de 'commercialComments'
  agValidationStatus?: string; // no aplica en nuevo modelo
  rdValidationStatus?: string; // no aplica en nuevo modelo
  agObservation?: string; // no aplica en nuevo modelo
  rdObservation?: string; // no aplica en nuevo modelo
  siProductCode?: string; // no aplica en ODISEO
  siSku?: string; // no aplica en ODISEO
};

// ============================================================================
// UTILITARIOS
// ============================================================================

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readStorageArray<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function writeStorageArray<T>(key: string, records: T[]) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(records));
}

// ============================================================================
// GENERACIÓN DE CÓDIGOS
// ============================================================================

/**
 * Genera código de Producto Preliminar: PP-{projectCode}-{numero}
 * Busca el siguiente número disponible para el proyecto
 */
export function generatePreliminaryProductCode(projectCode: string): string {
  const products = getPreliminaryProducts(projectCode);
  const codes = products
    .map((p) => {
      const match = p.preliminaryProductCode.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => !isNaN(num));

  const nextNumber = (Math.max(0, ...codes) + 1).toString().padStart(3, "0");
  return `PP-${projectCode}-${nextNumber}`;
}

// ============================================================================
// CREACIÓN DE PRODUCTOS
// ============================================================================

/**
 * Crea el Producto Preliminar Base desde un proyecto validado
 * Copia toda la estructura técnica del proyecto
 * Status="Registrado", ProductType="Base", todos los locks=true
 */
export function createBasePreliminaryProduct(
  projectCode: string,
  project: any
): ProjectPreliminaryProductRecord {
  const now = new Date().toISOString();

  const product: ProjectPreliminaryProductRecord = {
    id: `PPB-${projectCode}-${Date.now()}`,
    projectCode,
    preliminaryProductCode: generatePreliminaryProductCode(projectCode),

    name: project.projectName || `Producto Base ${projectCode}`,
    description: `Producto preliminar base para proyecto ${projectCode}`,

    productType: "Base",
    status: "Registrado",

    isBaseProduct: true,
    isDerived: false,

    // Copiar estructura técnica del proyecto
    structureType: project.structureType,
    blueprintFormat: project.blueprintFormat,
    printType: project.printType,
    printClass: project.printClass,

    // Copiar capas
    layer1Material: project.layer1Material,
    layer1Micron: project.layer1Micron,
    layer1Grammage: project.layer1Grammage,

    layer2Material: project.layer2Material,
    layer2Micron: project.layer2Micron,
    layer2Grammage: project.layer2Grammage,

    layer3Material: project.layer3Material,
    layer3Micron: project.layer3Micron,
    layer3Grammage: project.layer3Grammage,

    layer4Material: project.layer4Material,
    layer4Micron: project.layer4Micron,
    layer4Grammage: project.layer4Grammage,

    grammage: project.grammage,
    grammageTolerance: project.grammageTolerance,
    referenceEmCode: project.referenceEmCode,
    referenceEmVersion: project.referenceEmVersion,

    // Copiar dimensiones y accesorios
    width: project.width,
    customerPackingCode: project.customerPackingCode,
    estimatedVolume: project.estimatedVolume,
    unitOfMeasure: project.unitOfMeasure,

    hasZipper: project.hasZipper,
    zipperType: project.zipperType,

    hasValve: project.hasValve,
    valveType: project.valveType,

    hasReinforcement: project.hasReinforcement,
    reinforcementThickness: project.reinforcementThickness,
    reinforcementWidth: project.reinforcementWidth,

    hasRoundedCorners: project.hasRoundedCorners,
    roundedCornersType: project.roundedCornersType,

    hasPerforation: project.hasPerforation,
    perforationLocation: project.perforationLocation,

    hasPreCut: project.hasPreCut,
    preCutType: project.preCutType,

    // Bloqueos activados para producto base
    structureLocked: true,
    formatLocked: true,
    printTypeLocked: true,
    layersLocked: true,

    // Trazabilidad si es proyecto modificado
    sourceProjectClassification: project.classification,
    approvedProductId: project.approvedProductId,
    approvedProductSku: project.approvedProductCode || project.approvedProductSku,
    approvedProductVersion: project.approvedProductVersion,
    approvedProductName: project.approvedProductName,
    motivoModificacion: project.motivoModificacion || project.modificationReason,
    baseApprovedProductSnapshot: project.approvedProductSnapshot,
    sourceBaselineVersion: project.baselineVersion,

    createdAt: now,
    updatedAt: now,
  };

  // Compatibilidad legacy - asignar después de crear el objeto
  product.productName = product.name;
  product.productDescription = product.description;
  product.productRequestCode = product.preliminaryProductCode;
  product.format = product.blueprintFormat;
  product.structure = product.structureType;
  product.commercialFinanceComment = product.commercialComments;

  return savePreliminaryProduct(product);
}

/**
 * Crea una variación desde un producto base
 * Copia estructura técnica, bloquea campos técnicos
 */
export function createVariationFromProduct(
  baseProductId: string,
  data: Partial<ProjectPreliminaryProductRecord>
): ProjectPreliminaryProductRecord {
  const baseProduct = getPreliminaryProductById(baseProductId);
  if (!baseProduct) {
    throw new Error(`Base product ${baseProductId} not found`);
  }

  const now = new Date().toISOString();
  const projectCode = baseProduct.projectCode;

  const variation: ProjectPreliminaryProductRecord = {
    id: `PPV-${projectCode}-${Date.now()}`,
    projectCode,
    preliminaryProductCode: generatePreliminaryProductCode(projectCode),

    name: data.name || `Variación de ${baseProduct.name}`,
    description:
      data.description || `Variación del producto base ${baseProduct.preliminaryProductCode}`,

    productType: "Variación",
    status: "Registrado",

    isBaseProduct: false,
    isDerived: true,

    // Jerarquía
    parentProductId: baseProductId,
    rootProductId: baseProduct.rootProductId || baseProductId,
    generationLevel: (baseProduct.generationLevel || 1) + 1,
    baseProductId,
    baseProductName: baseProduct.name,

    // Copiar estructura técnica bloqueada del producto base
    structureType: baseProduct.structureType,
    blueprintFormat: baseProduct.blueprintFormat,
    printType: baseProduct.printType,
    printClass: baseProduct.printClass,

    layer1Material: baseProduct.layer1Material,
    layer1Micron: baseProduct.layer1Micron,
    layer1Grammage: baseProduct.layer1Grammage,

    layer2Material: baseProduct.layer2Material,
    layer2Micron: baseProduct.layer2Micron,
    layer2Grammage: baseProduct.layer2Grammage,

    layer3Material: baseProduct.layer3Material,
    layer3Micron: baseProduct.layer3Micron,
    layer3Grammage: baseProduct.layer3Grammage,

    layer4Material: baseProduct.layer4Material,
    layer4Micron: baseProduct.layer4Micron,
    layer4Grammage: baseProduct.layer4Grammage,

    grammage: baseProduct.grammage,
    grammageTolerance: baseProduct.grammageTolerance,
    referenceEmCode: baseProduct.referenceEmCode,
    referenceEmVersion: baseProduct.referenceEmVersion,

    // Permitir sobrescribir campos editables
    width: data.width !== undefined ? data.width : baseProduct.width,
    customerPackingCode:
      data.customerPackingCode || baseProduct.customerPackingCode,
    estimatedVolume:
      data.estimatedVolume !== undefined
        ? data.estimatedVolume
        : baseProduct.estimatedVolume,
    unitOfMeasure: data.unitOfMeasure || baseProduct.unitOfMeasure,

    hasZipper: data.hasZipper !== undefined ? data.hasZipper : baseProduct.hasZipper,
    zipperType: data.zipperType || baseProduct.zipperType,

    hasValve: data.hasValve !== undefined ? data.hasValve : baseProduct.hasValve,
    valveType: data.valveType || baseProduct.valveType,

    hasReinforcement:
      data.hasReinforcement !== undefined
        ? data.hasReinforcement
        : baseProduct.hasReinforcement,
    reinforcementThickness:
      data.reinforcementThickness || baseProduct.reinforcementThickness,
    reinforcementWidth:
      data.reinforcementWidth || baseProduct.reinforcementWidth,

    hasRoundedCorners:
      data.hasRoundedCorners !== undefined
        ? data.hasRoundedCorners
        : baseProduct.hasRoundedCorners,
    roundedCornersType:
      data.roundedCornersType || baseProduct.roundedCornersType,

    hasPerforation:
      data.hasPerforation !== undefined
        ? data.hasPerforation
        : baseProduct.hasPerforation,
    perforationLocation:
      data.perforationLocation || baseProduct.perforationLocation,

    hasPreCut:
      data.hasPreCut !== undefined ? data.hasPreCut : baseProduct.hasPreCut,
    preCutType: data.preCutType || baseProduct.preCutType,

    accessories: data.accessories || baseProduct.accessories,
    targetPrice:
      data.targetPrice !== undefined ? data.targetPrice : baseProduct.targetPrice,
    currencyType: data.currencyType || baseProduct.currencyType,
    commercialComments:
      data.commercialComments || baseProduct.commercialComments,

    // Bloqueos activados para variación
    structureLocked: true,
    formatLocked: true,
    printTypeLocked: true,
    layersLocked: true,

    // Heredar trazabilidad de producto modificado si aplica
    sourceProjectClassification: baseProduct.sourceProjectClassification,
    approvedProductId: baseProduct.approvedProductId,
    approvedProductSku: baseProduct.approvedProductSku,
    approvedProductVersion: baseProduct.approvedProductVersion,
    approvedProductName: baseProduct.approvedProductName,
    motivoModificacion: baseProduct.motivoModificacion,
    baseApprovedProductSnapshot: baseProduct.baseApprovedProductSnapshot,
    sourceBaselineVersion: baseProduct.sourceBaselineVersion,

    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy,
  };

  // Compatibilidad legacy - asignar después de crear el objeto
  variation.productName = variation.name;
  variation.productDescription = variation.description;
  variation.productRequestCode = variation.preliminaryProductCode;
  variation.format = variation.blueprintFormat;
  variation.structure = variation.structureType;
  variation.commercialFinanceComment = variation.commercialComments;

  return savePreliminaryProduct(variation);
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

/**
 * Campos que están bloqueados en variaciones (no pueden cambiar del producto base)
 */
const LOCKED_FIELDS = [
  "structureType",
  "blueprintFormat",
  "printType",
  "printClass",
  "layer1Material",
  "layer1Micron",
  "layer1Grammage",
  "layer2Material",
  "layer2Micron",
  "layer2Grammage",
  "layer3Material",
  "layer3Micron",
  "layer3Grammage",
  "layer4Material",
  "layer4Micron",
  "layer4Grammage",
  "grammage",
  "grammageTolerance",
  "referenceEmCode",
  "referenceEmVersion",
];

/**
 * Valida que una variación no cambia campos bloqueados
 * Retorna lista de campos violados (vacía = OK)
 */
export function validateVariationLockedFields(
  original: ProjectPreliminaryProductRecord,
  proposed: Partial<ProjectPreliminaryProductRecord>
): string[] {
  const violations: string[] = [];

  for (const field of LOCKED_FIELDS) {
    const key = field as keyof ProjectPreliminaryProductRecord;
    const originalValue = original[key];
    const proposedValue = proposed[key];

    if (proposedValue !== undefined && originalValue !== proposedValue) {
      violations.push(field);
    }
  }

  return violations;
}

// ============================================================================
// CRUD BÁSICO
// ============================================================================

export function getPreliminaryProducts(
  projectCode: string
): ProjectPreliminaryProductRecord[] {
  const all = readStorageArray<ProjectPreliminaryProductRecord>(STORAGE_KEY);
  return all.filter((p) => p.projectCode === projectCode);
}

export function getPreliminaryProductById(
  id: string
): ProjectPreliminaryProductRecord | null {
  const all = readStorageArray<ProjectPreliminaryProductRecord>(STORAGE_KEY);
  return all.find((p) => p.id === id) || null;
}

export function getBasePreliminaryProduct(
  projectCode: string
): ProjectPreliminaryProductRecord | null {
  const products = getPreliminaryProducts(projectCode);
  return products.find((p) => p.isBaseProduct) || null;
}

export function savePreliminaryProduct(
  product: ProjectPreliminaryProductRecord
): ProjectPreliminaryProductRecord {
  const all = readStorageArray<ProjectPreliminaryProductRecord>(STORAGE_KEY);
  const filtered = all.filter((p) => p.id !== product.id);

  const normalized: ProjectPreliminaryProductRecord = {
    ...product,
    updatedAt: new Date().toISOString(),
    // Mantener sincronizados los campos legacy
    productName: product.productName || product.name,
    productDescription: product.productDescription || product.description,
    productRequestCode: product.productRequestCode || product.preliminaryProductCode,
    format: product.format || product.blueprintFormat,
    structure: product.structure || product.structureType,
    commercialFinanceComment: product.commercialFinanceComment || product.commercialComments,
  };

  writeStorageArray(STORAGE_KEY, [normalized, ...filtered]);
  return normalized;
}

export function updatePreliminaryProductStatus(
  id: string,
  status: PreliminaryProductStatus
): ProjectPreliminaryProductRecord {
  const product = getPreliminaryProductById(id);
  if (!product) {
    throw new Error(`Product ${id} not found`);
  }

  return savePreliminaryProduct({
    ...product,
    status,
  });
}

export function destimarPreliminaryProduct(
  id: string,
  reason?: string
): ProjectPreliminaryProductRecord {
  const product = getPreliminaryProductById(id);
  if (!product) {
    throw new Error(`Product ${id} not found`);
  }

  return savePreliminaryProduct({
    ...product,
    status: "Desestimado",
    destimarReason: reason,
    destimarAt: new Date().toISOString(),
  });
}

// ============================================================================
// UTILIDADES LEGACY (para compatibilidad temporal)
// ============================================================================

/**
 * @deprecated Será reemplazado cuando migremos completamente a ProjectPreliminaryProductRecord
 * Obtiene todos los productos de un proyecto (compat. con código antiguo)
 */
export function getProjectProducts(
  projectCode: string
): ProjectPreliminaryProductRecord[] {
  return getPreliminaryProducts(projectCode);
}

/**
 * @deprecated Será reemplazado en PASO 6
 * Para compatibilidad con ProjectProductsPanel
 */
export type ProjectProductRecord = ProjectPreliminaryProductRecord;

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function createProjectProductFromProject(
  projectCode: string,
  data: Partial<ProjectPreliminaryProductRecord>
): ProjectPreliminaryProductRecord {
  return createBasePreliminaryProduct(projectCode, data);
}

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function createProjectProductFromApprovedProduct(
  projectCode: string,
  baseProductId: string,
  data: Partial<ProjectPreliminaryProductRecord>
): ProjectPreliminaryProductRecord {
  return createVariationFromProduct(baseProductId, data);
}

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function saveProjectProduct(
  product: ProjectPreliminaryProductRecord
): ProjectPreliminaryProductRecord {
  return savePreliminaryProduct(product);
}

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function getProjectProductById(
  id: string
): ProjectPreliminaryProductRecord | null {
  return getPreliminaryProductById(id);
}

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function destimarProjectProduct(
  id: string,
  reason?: string
): ProjectPreliminaryProductRecord {
  return destimarPreliminaryProduct(id, reason);
}

/**
 * @deprecated Será reemplazado en PASO 6
 */
export function toggleProductSelectedForQuote(
  id: string
): ProjectPreliminaryProductRecord {
  const product = getPreliminaryProductById(id);
  if (!product) {
    throw new Error(`Product ${id} not found`);
  }

  return savePreliminaryProduct({
    ...product,
    selectedForQuote: !product.selectedForQuote,
    selectedForQuoteAt: !product.selectedForQuote
      ? new Date().toISOString()
      : undefined,
  });
}

/**
 * @deprecated Será reemplazado en PASO 3
 */
export function getProductStatusMeaning(status: PreliminaryProductStatus): string {
  const meanings: Record<PreliminaryProductStatus, string> = {
    Registrado: "Producto registrado en el proyecto",
    "Listo para cotizar": "Listo para ser incluido en solicitud de cotización",
    "En Cotización": "Incluido en solicitud de cotización",
    Cotizado: "Cotización recibida",
    "Aprobado por Cliente": "Aprobado por cliente",
    Desestimado: "Desestimado",
    Alta: "Dado de alta en el sistema",
  };
  return meanings[status] || "Estado desconocido";
}

/**
 * @deprecated Será reemplazado en PASO 3
 */
export function getProductStatusDefinition(status: PreliminaryProductStatus) {
  return null; // Placeholder
}

/**
 * @deprecated Limpia el almacenamiento de productos
 */
export function clearProjectProductStorage(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
