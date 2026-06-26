/* ============================================================================
   DEFINICIONES DE WORKFLOW - MÓDULO DE PROYECTOS ODISEO

   Este archivo centraliza toda la lógica de estados, etapas, validaciones
   y transiciones del flujo de proyectos en ODISEO.
   ============================================================================ */

export type ProjectStage =
  | "P1_FICHA_PROYECTO"
  | "P2_VIABILIDAD_TECNICA"
  | "P3_GESTION_PRODUCTOS_PRELIMINARES"
  | "P4_APROBACION_CLIENTE";

export type ProjectStatus =
  | "Registrado"
  | "En Preparación"
  | "Ficha Completa"
  | "En validación"
  | "Observado"
  | "Validado"
  | "Productos preliminares"
  | "En Cotización"
  | "Cotización Completa"
  | "Aprobado por Cliente"
  | "Validación Tesorería"
  | "Alta Producto"
  | "Desestimado";

export type ProductStatus =
  | "Registrado"
  | "En Preparación"
  | "Completado"
  | "Dado de alta";

export type SkuLifecycleCode = "A" | "E" | "B" | "P";

export type SkuLifecycleLabel = "Aprobado" | "Preliminar" | "Base" | "Portafolio estándar";

export type GraphicArtsValidationStatus =
  | "Sin solicitar"
  | "En Revisión"
  | "Observado"
  | "Validado"
  | "Aprobado automático";

export type TechnicalValidationStatus =
  | "Sin solicitar"
  | "En Revisión"
  | "Observado"
  | "Validado"
  | "Aprobado automático";

export type CurrentValidationStep =
  | "Artes Gráficas"
  | "R&D Área Técnica"
  | "R&D Desarrollo"
  | null;

export type ResponsibleArea =
  | "Comercial"
  | "Artes Gráficas"
  | "R&D Área Técnica"
  | "R&D Desarrollo"
  | "Commercial Finance"
  | "Tesorería"
  | "Master Data"
  | "Sin área asignada";

export type TechnicalComplexity = "Baja" | "Alta";
export type TechnicalSubArea = "R&D Área Técnica" | "R&D Desarrollo";

// ============================================================================
// ALIASES PARA COMPATIBILIDAD
// ============================================================================

export type WorkflowProjectStatus = ProjectStatus;
export type WorkflowProjectStage = ProjectStage;
export type AreaValidationStatus = GraphicArtsValidationStatus;
export type ProjectResponsibleArea = ResponsibleArea;

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

export function resolveProjectStage(status: ProjectStatus): ProjectStage {
  switch (status) {
    case "Registrado":
    case "En Preparación":
    case "Ficha Completa":
    case "Observado":
      return "P1_FICHA_PROYECTO";

    case "En validación":
      return "P2_VIABILIDAD_TECNICA";

    case "Validado":
    case "Productos preliminares":
    case "En Cotización":
    case "Cotización Completa":
      return "P3_GESTION_PRODUCTOS_PRELIMINARES";

    case "Aprobado por Cliente":
    case "Validación Tesorería":
    case "Alta Producto":
    case "Desestimado":
      return "P4_APROBACION_CLIENTE";

    default:
      return "P1_FICHA_PROYECTO";
  }
}

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  P1_FICHA_PROYECTO: "P1. Ficha del Proyecto",
  P2_VIABILIDAD_TECNICA: "P2. Viabilidad Técnica",
  P3_GESTION_PRODUCTOS_PRELIMINARES: "P3. Gestión de Productos Preliminares",
  P4_APROBACION_CLIENTE: "P4. Aprobación del Cliente",
};

export function normalizeGraphicArtsStatus(value: any): GraphicArtsValidationStatus {
  const raw = String(value || "").trim();

  if (
    raw === "Pendiente" ||
    raw === "Pendiente revisión manual" ||
    raw === "Revisión manual" ||
    raw === "En revisión" ||
    raw === "En Revisión"
  ) {
    return "En Revisión";
  }

  if (raw === "Validada" || raw === "Aprobada") return "Validado";
  if (raw === "Observada") return "Observado";

  if (
    raw === "Sin solicitar" ||
    raw === "Observado" ||
    raw === "Validado" ||
    raw === "Aprobado automático"
  ) {
    return raw as GraphicArtsValidationStatus;
  }

  return "Sin solicitar";
}

export function normalizeTechnicalStatus(value: any): TechnicalValidationStatus {
  const raw = String(value || "").trim();

  if (
    raw === "Pendiente" ||
    raw === "Pendiente revisión manual" ||
    raw === "Revisión manual" ||
    raw === "En revisión" ||
    raw === "En Revisión"
  ) {
    return "En Revisión";
  }

  if (raw === "Validada" || raw === "Aprobada") return "Validado";
  if (raw === "Observada") return "Observado";

  if (
    raw === "Sin solicitar" ||
    raw === "Observado" ||
    raw === "Validado" ||
    raw === "Aprobado automático"
  ) {
    return raw as TechnicalValidationStatus;
  }

  return "Sin solicitar";
}

export function normalizeValidationArea(value: any): CurrentValidationStep {
  const raw = String(value || "").trim();

  if (
    raw === "Artes Gráficas" ||
    raw === "Artes Graficas" ||
    raw === "Ártes Gráficas" ||
    raw === "Ártes Graficas"
  ) {
    return "Artes Gráficas";
  }

  if (
    raw === "R&D Técnica" ||
    raw === "Área Técnica" ||
    raw === "Area Técnica" ||
    raw === "Area Tecnica" ||
    raw === "R&D Área Técnica"
  ) {
    return "R&D Área Técnica";
  }

  if (
    raw === "Desarrollo R&D" ||
    raw === "Desarrollo_RD" ||
    raw === "Desarrollo RD" ||
    raw === "R&D Desarrollo"
  ) {
    return "R&D Desarrollo";
  }

  return null;
}

export function getResponsibleAreaForProject(project: any): ResponsibleArea {
  const status = project.status as ProjectStatus;
  const currentStep = normalizeValidationArea(project.currentValidationStep);

  if (
    status === "Registrado" ||
    status === "En Preparación" ||
    status === "Ficha Completa" ||
    status === "Observado" ||
    status === "Validado" ||
    status === "Productos preliminares" ||
    status === "Cotización Completa" ||
    status === "Aprobado por Cliente" ||
    status === "Desestimado"
  ) {
    return "Comercial";
  }

  if (status === "En validación") {
    if (currentStep === "Artes Gráficas") return "Artes Gráficas";
    if (currentStep === "R&D Área Técnica") return "R&D Área Técnica";
    if (currentStep === "R&D Desarrollo") return "R&D Desarrollo";
    return "Sin área asignada";
  }

  if (status === "En Cotización") return "Commercial Finance";
  if (status === "Validación Tesorería") return "Tesorería";
  if (status === "Alta Producto") return "Master Data";

  return "Comercial";
}

export function getCurrentActionLabel(project: any): string {
  const status = project.status as ProjectStatus;
  const currentStep = normalizeValidationArea(project.currentValidationStep);

  if (status === "Registrado") return "Completar ficha";
  if (status === "En Preparación") return "Completar información";
  if (status === "Ficha Completa") return "Completar información";

  if (status === "En validación") {
    if (currentStep === "Artes Gráficas") return "En Revisión por Artes Gráficas";
    if (currentStep === "R&D Área Técnica") return "En Revisión por R&D Área Técnica";
    if (currentStep === "R&D Desarrollo") return "En Revisión por R&D Desarrollo";
    return "En Revisión";
  }

  if (status === "Observado") return "Corregir observaciones";
  if (status === "Validado") return "Crear productos preliminares";
  if (status === "Productos preliminares") return "Completar productos preliminares";
  if (status === "En Cotización") return "Cotización en curso";
  if (status === "Cotización Completa") return "Revisar aprobación cliente";
  if (status === "Aprobado por Cliente") return "Validar condición comercial / Tesorería";
  if (status === "Validación Tesorería") return "Revisión Tesorería";
  if (status === "Alta Producto") return "Alta completada";
  if (status === "Desestimado") return "Cerrado";

  return "—";
}

export function resolveProjectStatusFromProducts(project: any, products: any[]): ProjectStatus {
  if (project.status === "Desestimado") return "Desestimado";

  if (!products || products.length === 0) {
    return project.status;
  }

  const activeProducts = products.filter(p => p.status !== "Desestimado");

  if (activeProducts.length === 0) {
    return "Desestimado";
  }

  if (activeProducts.every(p => p.status === "Alta")) {
    return "Alta Producto";
  }

  if (activeProducts.some(p => p.status === "Aprobado por Cliente" || p.status === "Alta")) {
    return "Aprobado por Cliente";
  }

  if (activeProducts.every(p => p.status === "Cotizado")) {
    return "Cotización Completa";
  }

  if (activeProducts.some(p => p.status === "En Cotización" || p.status === "Cotizado")) {
    return "En Cotización";
  }

  if (activeProducts.length > 0) {
    return "Productos preliminares";
  }

  return project.status;
}

export function normalizeProjectStatus(rawStatus?: string): ProjectStatus {
  if (!rawStatus) return "Registrado";

  const status = String(rawStatus).trim();

  switch (status) {
    case "Registrado":
      return "Registrado";
    case "En Curso":
    case "En preparación":
    case "En Preparación":
      return "En Preparación";
    case "Ficha completa":
    case "Ficha Completa":
      return "Ficha Completa";
    case "En Validación":
    case "En validación":
    case "En Evaluación":
    case "En evaluación":
      return "En validación";
    case "Observada":
    case "Observado":
      return "Observado";
    case "Lista para RFQ":
    case "Validado":
      return "Validado";
    case "Productos preliminares":
      return "Productos preliminares";
    case "En Cotización":
      return "En Cotización";
    case "Cotización Completa":
    case "Cotización completa":
    case "Cotización Enviada":
      return "Cotización Completa";
    case "Aprobado por Cliente":
      return "Aprobado por Cliente";
    case "Validación Tesorería":
      return "Validación Tesorería";
    case "Alta Producto":
      return "Alta Producto";
    case "Desestimado":
    case "Rechazado":
    case "Cancelado":
      return "Desestimado";
    default:
      return "Registrado";
  }
}

export function normalizeProductStatus(rawStatus?: string): ProductStatus {
  if (!rawStatus) return "Registrado";

  const status = String(rawStatus).trim();

  switch (status) {
    case "Registrado":
      return "Registrado";
    case "En Preparación":
    case "En Curso":
    case "En preparación":
    case "Ficha Completa":
    case "Ficha completa":
    case "En Validación":
    case "En validación":
    case "En Evaluación":
    case "En evaluación":
    case "Observada":
    case "Observado":
    case "Productos preliminares":
    case "En Cotización":
      return "En Preparación";
    case "Validado":
    case "Lista para RFQ":
    case "Cotización Completa":
    case "Cotización completa":
    case "Cotización Enviada":
    case "Aprobado por Cliente":
    case "Validación Tesorería":
    case "Alta Producto":
      return "Completado";
    case "Desestimado":
    case "Rechazado":
    case "Cancelado":
      return "Registrado";
    default:
      return "Registrado";
  }
}

export function normalizeSkuLifecycleCode(rawCode?: string): SkuLifecycleCode | null {
  if (!rawCode) return null;

  const code = String(rawCode).trim().toUpperCase();

  if (code === "A" || code === "APROBADO") return "A";
  if (code === "E" || code === "MUESTRA") return "E";
  if (code === "B" || code === "BASE") return "B";

  return null;
}

export function getSkuLifecycleLabel(code: SkuLifecycleCode): SkuLifecycleLabel {
  switch (code) {
    case "A":
      return "Aprobado";
    case "E":
      return "Preliminar";
    case "B":
      return "Base";
  }
}

export function getProductOdiseoStatus(product: any): ProductStatus {
  if (!product) return "Registrado";

  // Si tiene código del Sistema Integral = "Dado de alta"
  const siProductCode = String(product.siProductCode || "").trim();
  if (siProductCode) {
    return "Dado de alta";
  }

  // Obtener stage/paso actual
  const stage = String(product.stage || "").trim();
  const rawStatus = String(product.status || "").trim().toLowerCase();

  // P1 completado = "Registrado"
  if (!stage || stage === "P1_FICHA_PROYECTO" || stage === "P1_PREPARACION_FICHA_PROYECTO") {
    return "Registrado";
  }

  // P2-P4: depende de si está completado
  // Si el status indica completado, retornar "Completado"
  if (rawStatus.includes("validado") ||
      rawStatus.includes("ficha completa") ||
      rawStatus.includes("aprobado") ||
      rawStatus.includes("completado")) {
    return "Completado";
  }

  // Cualquier otro estado en P2-P4 = "En Preparación"
  if (stage.startsWith("P2_") || stage.startsWith("P3_") || stage.startsWith("P4_")) {
    return "En Preparación";
  }

  return "Registrado";
}

export function resolveTechnicalSubAreaBySubclassification(
  subclassification?: string
): TechnicalSubArea | null {
  if (!subclassification) return null;

  const value = subclassification.trim();

  if (
    value === "Área_Técnica" ||
    value === "Area_Tecnica" ||
    value === "Área Técnica" ||
    value === "Area Tecnica" ||
    value === "R&D Técnica" ||
    value === "R&D Área Técnica"
  ) {
    return "R&D Área Técnica";
  }

  if (
    value === "Desarrollo_RD" ||
    value === "Desarrollo R&D" ||
    value === "Desarrollo RD" ||
    value === "R&D Desarrollo"
  ) {
    return "R&D Desarrollo";
  }

  return null;
}

export function resolveTechnicalSubAreaByProjectType(
  projectType?: string
): TechnicalSubArea | null {
  if (!projectType) return null;

  const type = projectType.trim();

  const rdDesarrolloTypes = [
    "Producto nuevo",
    "Nuevo equipamiento de envasado",
    "Nuevos insumos",
    "Nueva estructura",
    "Nuevo formato de envasado",
    "Nuevos accesorios",
    "Nuevos procesos por el lado del cliente",
    "Nuevas temperaturas de envasado y almacenaje",
  ];

  const rdTecnicaTypes = [
    "Extensión de línea por familia (EM de referencia)",
    "Modifica Dimensiones",
    "Modifica Propiedades",
    "Portafolio Estándar",
    "ICO (Intercompany), BCP (Business Continous Production)",
  ];

  if (rdDesarrolloTypes.includes(type)) {
    return "R&D Desarrollo";
  }

  if (rdTecnicaTypes.includes(type)) {
    return "R&D Área Técnica";
  }

  return null;
}

export function normalizeProjectWorkflow(project: any): any {
  const rawStatus = project.status || "Registrado";
  let status = normalizeProjectStatus(rawStatus);

  let technicalSubArea: TechnicalSubArea | null =
    resolveTechnicalSubAreaBySubclassification(project.technicalSubArea) ||
    resolveTechnicalSubAreaByProjectType(project.projectType || project.tipoProyecto) ||
    resolveTechnicalSubAreaBySubclassification(
      project.subClassification ||
        project.subseccionClasificacion ||
        project.subsectionClassification ||
        project.technicalSubclassification
    );

  let technicalValidationStatus = normalizeTechnicalStatus(project.technicalValidationStatus);
  let graphicArtsValidationStatus = normalizeGraphicArtsStatus(project.graphicArtsValidationStatus);
  let currentValidationStep = normalizeValidationArea(project.currentValidationStep);

  const hasTechnicalArea =
    technicalSubArea === "R&D Área Técnica" ||
    technicalSubArea === "R&D Desarrollo";

  // Defensa: Si status es validado pero technicalValidationStatus no
  if (
    status === "Validado" &&
    hasTechnicalArea &&
    technicalValidationStatus !== "Validado"
  ) {
    status = "En validación";
    currentValidationStep = technicalSubArea as CurrentValidationStep;
    technicalValidationStatus = "En Revisión";
  }

  if (
    status === "En validación" &&
    !currentValidationStep &&
    hasTechnicalArea &&
    technicalValidationStatus !== "Validado"
  ) {
    currentValidationStep = technicalSubArea as CurrentValidationStep;
  }

  if (
    status === "En validación" &&
    !currentValidationStep &&
    graphicArtsValidationStatus === "En Revisión"
  ) {
    currentValidationStep = "Artes Gráficas";
  }

  const stage = resolveProjectStage(status);

  return {
    ...project,
    status,
    stage,
    completionPercentage: project.completionPercentage ?? 0,
    graphicArtsValidationStatus,
    technicalValidationStatus,
    currentValidationStep,
    technicalSubArea,
    validationRound: project.validationRound ?? 0,
    hasBasePreliminaryProduct: project.hasBasePreliminaryProduct ?? false,
    preliminaryProductIds: project.preliminaryProductIds ?? [],
    statusUpdatedAt: project.statusUpdatedAt ?? null,
    stageUpdatedAt: project.stageUpdatedAt ?? null,
    quoteStartedAt: project.quoteStartedAt ?? null,
    quoteCompletedAt: project.quoteCompletedAt ?? null,
    clientApprovedAt: project.clientApprovedAt ?? null,
    desestimatedAt: project.desestimatedAt ?? null,
    desestimatedReason: project.desestimatedReason ?? null,
  };
}

export function canProjectBeValidated(project: any): boolean {
  const graphicArtsOk =
    project.graphicArtsValidationStatus === "Validado" ||
    project.graphicArtsValidationStatus === "Aprobado automático";

  const technicalOk = project.technicalValidationStatus === "Validado";

  return graphicArtsOk && technicalOk;
}

function hasValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export function hasAnyEditableSection2To6Data(project: any): boolean {
  const section2EditableFields = [
    "classification",
    "subClassification",
    "projectType",
    "blueprintFormat",
    "technicalApplication",
    "customerPackingCode",
  ];

  const section3EditableFields = [
    "hasEdagReference",
    "requiresDesignWork",
    "printType",
    "printClass",
    "specialDesignComments",
    "designPlanFiles",
    "edagCode",
    "edagVersion",
    "referenceEdagCode",
    "referenceEdagVersion",
  ];

  const section4EditableFields = [
    "hasReferenceStructure",
    "referenceEmCode",
    "referenceEmVersion",
    "structureType",
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
    "grammageTolerance",
    "grammage",
    "specialStructureSpecs",
  ];

  const section5EditableFields = [
    "estimatedVolume",
    "unitOfMeasure",
    "targetPrice",
    "currencyType",
    "saleType",
    "incoterm",
    "destinationCountry",
    "customerAdditionalInfo",
  ];

  const section6EditableFields = [
    "designPlanFiles",
    "deliveryAddress",
    "additionalComment",
    "licitacion",
    "codigoRFQ",
  ];

  const allEditableFields = [
    ...section2EditableFields,
    ...section3EditableFields,
    ...section4EditableFields,
    ...section5EditableFields,
    ...section6EditableFields,
  ];

  return allEditableFields.some((field) => hasValue(project[field]));
}

export function hasAnySection2To6Data(project: any): boolean {
  if (hasValue(project.portfolioCode) || hasValue(project.portfolioName)) return true;
  if (
    hasValue(project.routeDescription) ||
    hasValue(project.designPath) ||
    hasValue(project.blueprintFormat) ||
    hasValue(project.printType) ||
    hasValue(project.colorSpecification) ||
    hasValue(project.colorSpecificationDetails) ||
    hasValue(project.coatings) ||
    hasValue(project.printingSpecifications)
  ) return true;
  if (
    hasValue(project.width) ||
    hasValue(project.height) ||
    hasValue(project.depth) ||
    hasValue(project.structureType) ||
    hasValue(project.structureDescription) ||
    hasValue(project.materialType) ||
    hasValue(project.thicknessValue) ||
    hasValue(project.thicknessUnit) ||
    hasValue(project.flute) ||
    hasValue(project.liners) ||
    hasValue(project.density)
  ) return true;
  if (
    hasValue(project.estimatedVolume) ||
    hasValue(project.unitOfMeasure) ||
    hasValue(project.targetPrice) ||
    hasValue(project.currencyType) ||
    hasValue(project.accessories) ||
    hasValue(project.specialRequirements) ||
    hasValue(project.technicalComplexity) ||
    hasValue(project.requiresDesignWork)
  ) return true;
  if (
    hasValue(project.observations) ||
    hasValue(project.additionalNotes) ||
    hasValue(project.closureMechanism) ||
    hasValue(project.printPosition) ||
    hasValue(project.dieCutSpecifications) ||
    hasValue(project.environmentalRequirements)
  ) return true;

  return false;
}

export function computeProjectPreparationStatus(params: {
  project: any;
  completionPercentage: number;
  currentStatus?: ProjectStatus;
}): ProjectStatus {
  const { project, completionPercentage, currentStatus } = params;

  const advancedStatuses: ProjectStatus[] = [
    "En validación",
    "Observado",
    "Validado",
    "Productos preliminares",
    "En Cotización",
    "Cotización Completa",
    "Aprobado por Cliente",
    "Validación Tesorería",
    "Alta Producto",
    "Desestimado",
  ];

  if (currentStatus && advancedStatuses.includes(currentStatus)) {
    return currentStatus;
  }

  if (completionPercentage === 100) {
    return "Ficha Completa";
  }

  if (hasAnyEditableSection2To6Data(project)) {
    return "En Preparación";
  }

  return "Registrado";
}

function isNoAplica(value: unknown): boolean {
  return String(value || "").trim().toLowerCase() === "no aplica";
}

export function requiresManualGraphicArtsValidation(project: any): boolean {
  const specialSpecs =
    project.especificacionesEspeciales ||
    project.specialSpecifications ||
    project.specialDesignSpecs ||
    project.designSpecialSpecs ||
    "";

  return !isNoAplica(specialSpecs);
}

export {
  computeProjectProductSummaryStatus,
  getActionsForProductStatus,
  canCreateVariation,
  isLockedField,
  normalizePreliminaryProductStatus,
} from "./projectProductWorkflow";
