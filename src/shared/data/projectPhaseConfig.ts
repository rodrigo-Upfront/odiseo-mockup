import type { ProjectStage } from "./projectStageConfig";

export type PhaseRole = "Comercial" | "ArteGraficas" | "RyD" | "CF" | "Credito";

/**
 * Legacy stage type - para compatibilidad con código antiguo
 * @deprecated Usar ProjectStage en su lugar
 */
export type LegacyStage = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8" | "P9";

/**
 * Type que acepta tanto etapas nuevas como legacy
 * @deprecated Usar ProjectStage directamente
 */
export type AnyStage = ProjectStage | LegacyStage | string;

export interface PhaseField {
  name: string;
  label: string;
  section: string;
  required: boolean;
  editableByRoles: PhaseRole[];
  visibleInPhases: AnyStage[];
}

export interface ProjectPhaseConfig {
  stage: AnyStage;
  name: string;
  description: string;
  primaryRole: PhaseRole;
  allowedRoles: PhaseRole[];
  fields: PhaseField[];
  allowedTransitions: AnyStage[];
}

// P1 - Commercial Phase: Initial project registration with commercial data
const P1_FIELDS: PhaseField[] = [
  // Section 1: General Information
  { name: "portfolioCode", label: "Portfolio Base", section: "1", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "executiveId", label: "Ejecutivo Comercial", section: "1", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "siUserId", label: "Usuario Sistema Integral", section: "1", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "projectName", label: "Nombre del Proyecto", section: "1", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "projectDescription", label: "Descripción del Proyecto", section: "1", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "classification", label: "Clasificación", section: "1", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "subClassification", label: "Subclasificación", section: "1", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "projectType", label: "Tipo de Proyecto", section: "1", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "salesforceAction", label: "Acción Salesforce", section: "1", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },

  // Section 3: Commercial Product Data
  { name: "blueprintFormat", label: "Formato de Plano", section: "3", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "technicalApplication", label: "Aplicación Técnica", section: "3", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "estimatedVolume", label: "Volumen Estimado", section: "3", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "unitOfMeasure", label: "Unidad de Medida", section: "3", required: true, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "customerPackingCode", label: "Código de Empaque Cliente", section: "3", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },

  // Section 7: Financial/Commercial (partial - pricing in P4)
  { name: "saleType", label: "Venta Nacional/Internacional", section: "7", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "incoterm", label: "Incoterm", section: "7", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "destinationCountry", label: "País Destino", section: "7", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
  { name: "customerAdditionalInfo", label: "Información Adicional Cliente", section: "7", required: false, editableByRoles: ["Comercial"], visibleInPhases: ["P1", "P2", "P3", "P4", "P5", "P6"] },
];

// P2 - Graphic Arts Phase: Design validation
const P2_FIELDS: PhaseField[] = [
  ...P1_FIELDS,

  // Section 2: Responsible parties
  { name: "graphicResponsible", label: "Responsable Artes Gráficas", section: "2", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "graphicComments", label: "Comentarios AG", section: "2", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },

  // Section 4: Design Specifications
  { name: "designRoute", label: "Ruta de Diseño", section: "4", required: true, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "printClass", label: "Clase de Impresión", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "printType", label: "Tipo de Impresión", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "isPreviousDesign", label: "¿Diseño ya trabajado?", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "previousEdagCode", label: "Cód. EDAG", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "previousEdagVersion", label: "Versión EDAG", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "specialDesignSpecs", label: "Especificaciones de Diseño", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "specialDesignComments", label: "Comentarios de Diseño", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "hasDigitalFiles", label: "¿Tiene archivos digitales?", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "artworkFileType", label: "Tipo Archivo Arte", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "artworkAttachments", label: "Archivos adjuntos", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
  { name: "requiresDesignWork", label: "¿Requiere trabajo de diseño?", section: "4", required: false, editableByRoles: ["ArteGraficas"], visibleInPhases: ["P2", "P3", "P4", "P5", "P6"] },
];

// P3 - R&D Phase: Structure and technical validation
const P3_FIELDS: PhaseField[] = [
  ...P2_FIELDS,

  // Section 2: R&D Responsible
  { name: "rdResponsible", label: "Responsable R&D", section: "2", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "rdComments", label: "Comentarios R&D", section: "2", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },

  // Section 5: Structure Specifications
  { name: "hasReferenceStructure", label: "¿Estructura de referencia?", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "referenceEmCode", label: "Código E/M Referencia", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "referenceEmVersion", label: "Versión E/M", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "structureType", label: "Tipo de Estructura", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasCustomerTechnicalSpec", label: "¿Especificación técnica cliente?", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "customerTechnicalSpecAttachment", label: "Adjunto especificación técnica", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer1Material", label: "Material Capa 1", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer1Micron", label: "Micraje Capa 1", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer1Grammage", label: "Gramaje Capa 1", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer2Material", label: "Material Capa 2", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer2Micron", label: "Micraje Capa 2", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer2Grammage", label: "Gramaje Capa 2", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer3Material", label: "Material Capa 3", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer3Micron", label: "Micraje Capa 3", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer3Grammage", label: "Gramaje Capa 3", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer4Material", label: "Material Capa 4", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer4Micron", label: "Micraje Capa 4", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "layer4Grammage", label: "Gramaje Capa 4", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "grammage", label: "Gramaje Total", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "grammageTolerance", label: "Tolerancia de Gramaje", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "specialStructureSpecs", label: "Especificaciones Especiales de Estructura / Comentarios", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "sampleRequest", label: "Solicitud de Muestra", section: "5", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },

  // Section 6: Dimensions and Accessories
  { name: "width", label: "Ancho", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "length", label: "Largo", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "repetition", label: "Repetición", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "doyPackBase", label: "Base Doy Pack", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "gussetWidth", label: "Ancho Fuelle", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasZipper", label: "Zipper", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "zipperType", label: "Tipo de Zipper", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasTinTie", label: "Tin-Tie", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasValve", label: "Válvula", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "valveType", label: "Tipo de Válvula", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasDieCutHandle", label: "Asa Troquelada", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasReinforcement", label: "Refuerzo", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "reinforcementThickness", label: "Espesor Refuerzo", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "reinforcementWidth", label: "Ancho Refuerzo", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasAngularCut", label: "Corte Angular", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasRoundedCorners", label: "Esquinas Redondas", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "roundedCornersType", label: "Tipo Esquinas Redondas", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasNotch", label: "Muesca", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasPerforation", label: "Perforación", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "pouchPerforationType", label: "Tipo Perforación Pouch", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "bagPerforationType", label: "Tipo Perforación Bolsa", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "perforationLocation", label: "Ubicación Perforaciones", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "hasPreCut", label: "Pre-Corte", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "preCutType", label: "Tipo de Pre-Corte", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
  { name: "otherAccessories", label: "Otros Accesorios", section: "6", required: false, editableByRoles: ["RyD"], visibleInPhases: ["P3", "P4", "P5", "P6"] },
];

// P4 - Commercial Finance Phase: Final pricing and core specifications
const P4_FIELDS: PhaseField[] = [
  ...P3_FIELDS,

  // Section 2: Commercial Finance Responsible
  { name: "commercialFinanceResponsible", label: "Responsable Commercial Finance", section: "2", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },

  // Section 7: Financial (pricing and core specs - editable in P4)
  { name: "targetPrice", label: "Precio Objetivo", section: "7", required: true, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "salePrice", label: "Precio de Venta", section: "7", required: true, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "currencyType", label: "Tipo de Moneda", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "paymentTerms", label: "Condiciones de Pago", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "coreMaterial", label: "Material de Tuco/Core", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "coreDiameter", label: "Diámetro de Tuco", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "externalDiameter", label: "Diámetro Exterior", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "externalVariationPlus", label: "Variación Exterior (+)", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "externalVariationMinus", label: "Variación Exterior (-)", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
  { name: "maxRollWeight", label: "Peso máximo de bobina", section: "7", required: false, editableByRoles: ["CF"], visibleInPhases: ["P4", "P5", "P6"] },
];

// P5 - Final / Credit Closure Phase: Final data completion
const P5_FIELDS: PhaseField[] = [
  ...P4_FIELDS,

  // Section 7: Final non-quotation fields
  { name: "peruvianProductLogo", label: "Logo Producto Peruano", section: "7", required: false, editableByRoles: ["Credito"], visibleInPhases: ["P5", "P6"] },
  { name: "printingFooter", label: "Pie de Imprenta", section: "7", required: false, editableByRoles: ["Credito"], visibleInPhases: ["P5", "P6"] },
];

// Phase configurations
export const PHASE_CONFIGS: Record<string, ProjectPhaseConfig> = {
  P1: {
    stage: "P1",
    name: "P1 - Comercial",
    description: "Registro inicial del proyecto. Solo el comercial llena la información.",
    primaryRole: "Comercial",
    allowedRoles: ["Comercial"],
    fields: P1_FIELDS,
    allowedTransitions: ["P2", "P3"],
  },
  P2: {
    stage: "P2",
    name: "P2 - Artes Gráficas",
    description: "Validación de especificaciones de diseño.",
    primaryRole: "ArteGraficas",
    allowedRoles: ["ArteGraficas", "Comercial"],
    fields: P2_FIELDS,
    allowedTransitions: ["P3", "P1"],
  },
  P3: {
    stage: "P3",
    name: "P3 - R&D",
    description: "Validación de estructura y especificaciones técnicas.",
    primaryRole: "RyD",
    allowedRoles: ["RyD", "ArteGraficas", "Comercial"],
    fields: P3_FIELDS,
    allowedTransitions: ["P4", "P2"],
  },
  P4: {
    stage: "P4",
    name: "P4 - Commercial Finance",
    description: "Finalización de precios y especificaciones comerciales.",
    primaryRole: "CF",
    allowedRoles: ["CF", "RyD", "ArteGraficas", "Comercial"],
    fields: P4_FIELDS,
    allowedTransitions: ["P5", "P3"],
  },
  P5: {
    stage: "P5",
    name: "P5 - Crédito / Cierre",
    description: "Finalización de Otros no necesarios para cotización.",
    primaryRole: "Credito",
    allowedRoles: ["Credito", "CF", "RyD", "ArteGraficas", "Comercial"],
    fields: P5_FIELDS,
    allowedTransitions: ["P6", "P4"],
  },
  P6: {
    stage: "P6",
    name: "P6 - Sistema Integral (Completado)",
    description: "Proyecto registrado en Sistema Integral.",
    primaryRole: "Comercial",
    allowedRoles: ["Comercial", "ArteGraficas", "RyD", "CF", "Credito"],
    fields: P5_FIELDS,
    allowedTransitions: ["P7"],
  },
  P7: {
    stage: "P7",
    name: "P7 - Producción",
    description: "Proyecto en fase de producción en Sistema Integral.",
    primaryRole: "Comercial",
    allowedRoles: ["Comercial", "ArteGraficas", "RyD", "CF", "Credito"],
    fields: P5_FIELDS,
    allowedTransitions: ["P8"],
  },
  P8: {
    stage: "P8",
    name: "P8 - Seguimiento",
    description: "Seguimiento y monitoreo en Sistema Integral.",
    primaryRole: "Comercial",
    allowedRoles: ["Comercial", "ArteGraficas", "RyD", "CF", "Credito"],
    fields: P5_FIELDS,
    allowedTransitions: ["P9"],
  },
  P9: {
    stage: "P9",
    name: "P9 - Cierre",
    description: "Cierre final en Sistema Integral.",
    primaryRole: "Comercial",
    allowedRoles: ["Comercial", "ArteGraficas", "RyD", "CF", "Credito"],
    fields: P5_FIELDS,
    allowedTransitions: [],
  },
};

export function getPhaseConfig(stage: ProjectStage): ProjectPhaseConfig {
  return PHASE_CONFIGS[stage];
}

export function getEditableFields(stage: ProjectStage, userRole: PhaseRole): PhaseField[] {
  const config = getPhaseConfig(stage);
  return config.fields.filter(field => field.editableByRoles.includes(userRole));
}

export function getVisibleFields(stage: ProjectStage): PhaseField[] {
  const config = getPhaseConfig(stage);
  return config.fields.filter(field => field.visibleInPhases.includes(stage));
}

export function isFieldEditableInPhase(fieldName: string, stage: ProjectStage, userRole: PhaseRole): boolean {
  const field = PHASE_CONFIGS[stage].fields.find(f => f.name === fieldName);
  if (!field) return false;
  return field.editableByRoles.includes(userRole) && field.visibleInPhases.includes(stage);
}

export function isFieldVisibleInPhase(fieldName: string, stage: ProjectStage): boolean {
  const field = Object.values(PHASE_CONFIGS)
    .flatMap(config => config.fields)
    .find(f => f.name === fieldName && f.visibleInPhases.includes(stage));
  return !!field;
}
