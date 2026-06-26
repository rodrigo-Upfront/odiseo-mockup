export type WorkArea =
  | "P1 - Comercial"
  | "P2 - Artes Gráficas"
  | "P3 - R&D"
  | "P4 - Commercial Finance"
  | "P5 - Crédito / Cierre";

export interface FieldImpactConfig {
  fieldKey: string;
  label: string;
  impactLevel: "alta" | "media" | "baja" | "info";
  description?: string;
  editable: boolean;
  required: boolean;
}

export interface AreaImpactConfig {
  area: WorkArea;
  fields: FieldImpactConfig[];
  description: string;
}

// Matriz de impacto por área según especificaciones del Excel "02_Proyecto v0 (Técnico)"
export const PROJECT_FIELD_IMPACT_BY_AREA: Record<WorkArea, AreaImpactConfig> = {
  "P1 - Comercial": {
    area: "P1 - Comercial",
    description: "Información general y datos heredados del portafolio",
    fields: [
      // Información General
      { fieldKey: "code", label: "Código de Proyecto", impactLevel: "info", editable: false, required: true },
      { fieldKey: "plantName", label: "Planta de Origen", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "clientName", label: "Cliente", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "executiveName", label: "Ejecutivo Comercial", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "portfolioName", label: "Portafolio", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "wrappingName", label: "Envoltura", impactLevel: "media", editable: false, required: true },
      { fieldKey: "classification", label: "Clasificación", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "subClassification", label: "Sub-clasificación", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "projectType", label: "Tipo de Proyecto", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "salesforceAction", label: "Acción Salesforce", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "projectName", label: "Nombre del Proyecto", impactLevel: "alta", editable: true, required: true },
      // Datos de Producto Comercial
      { fieldKey: "blueprintFormat", label: "Formato de Plano", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "technicalApplication", label: "Aplicación Técnica", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "finalUseName", label: "Uso Final", impactLevel: "media", editable: false, required: true },
      { fieldKey: "subSegment", label: "Sub-segmento", impactLevel: "media", editable: false, required: false },
      { fieldKey: "segment", label: "Segmento", impactLevel: "media", editable: false, required: false },
      { fieldKey: "sector", label: "Sector", impactLevel: "media", editable: false, required: false },
      { fieldKey: "afMarketId", label: "AFMarketID", impactLevel: "info", editable: false, required: false },
      { fieldKey: "estimatedVolume", label: "Volumen Estimado", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "unitOfMeasure", label: "Unidad de Medida", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "customerPackingCode", label: "Código de Empaque Cliente", impactLevel: "baja", editable: true, required: false },
      // Especificaciones de Estructura
      { fieldKey: "packingMachineName", label: "Máquina de Envasado Cliente", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "sampleRequest", label: "Solicitud de Muestra", impactLevel: "media", editable: true, required: false },
    ],
  },
  "P2 - Artes Gráficas": {
    area: "P2 - Artes Gráficas",
    description: "Especificaciones de diseño y arte",
    fields: [
      { fieldKey: "printClass", label: "Clase de Impresión", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "printType", label: "Tipo de Impresión", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "isPreviousDesign", label: "¿Tiene diseño trabajado?", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "previousEdagCode", label: "Código EDAG", impactLevel: "alta", editable: true, required: false, description: "Requerido si tiene diseño trabajado = Sí" },
      { fieldKey: "previousEdagVersion", label: "Versión EDAG", impactLevel: "alta", editable: true, required: false, description: "Requerido si tiene diseño trabajado = Sí" },
      { fieldKey: "specialDesignSpecs", label: "Especificaciones Especiales de Diseño", impactLevel: "media", editable: true, required: false },
      { fieldKey: "specialDesignComments", label: "Comentarios de Diseño Especial", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasDigitalFiles", label: "¿Cuenta con archivos digitales?", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "artworkFileType", label: "Tipo de Archivo de Arte", impactLevel: "media", editable: true, required: false },
      { fieldKey: "artworkAttachments", label: "Adjuntos de Arte", impactLevel: "media", editable: true, required: false },
      { fieldKey: "requiresDesignWork", label: "¿Requiere trabajo de diseño?", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "graphicResponsible", label: "Responsable Artes Gráficas", impactLevel: "media", editable: true, required: false },
      { fieldKey: "graphicComments", label: "Comentarios Artes Gráficas", impactLevel: "media", editable: true, required: false },
      // Campos heredados relevantes
      { fieldKey: "blueprintFormat", label: "Formato de Plano", impactLevel: "media", editable: false, required: true },
      { fieldKey: "width", label: "Ancho", impactLevel: "media", editable: false, required: true },
      { fieldKey: "length", label: "Largo", impactLevel: "media", editable: false, required: true },
    ],
  },
  "P3 - R&D": {
    area: "P3 - R&D",
    description: "Especificaciones de estructura, dimensiones y accesorios",
    fields: [
      // Datos heredados relevantes
      { fieldKey: "blueprintFormat", label: "Formato de Plano", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "technicalApplication", label: "Aplicación Técnica", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "packingMachineName", label: "Máquina de Envasado Cliente", impactLevel: "alta", editable: false, required: true },
      // Estructura
      { fieldKey: "hasReferenceStructure", label: "¿Tiene estructura de referencia?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "referenceEmCode", label: "Código EM de Referencia", impactLevel: "media", editable: true, required: false },
      { fieldKey: "referenceEmVersion", label: "Versión EM de Referencia", impactLevel: "media", editable: true, required: false },
      { fieldKey: "structureType", label: "Tipo de Estructura", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "hasCustomerTechnicalSpec", label: "¿Tiene especificación técnica del cliente?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "customerTechnicalSpecAttachment", label: "Adjunto Especificación Técnica Cliente", impactLevel: "media", editable: true, required: false },
      // Capas
      { fieldKey: "layer1Material", label: "Material Capa 1", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer1Micron", label: "Micraje Capa 1", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer1Grammage", label: "Gramaje Capa 1", impactLevel: "media", editable: false, required: false },
      { fieldKey: "layer2Material", label: "Material Capa 2", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer2Micron", label: "Micraje Capa 2", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer2Grammage", label: "Gramaje Capa 2", impactLevel: "media", editable: false, required: false },
      { fieldKey: "layer3Material", label: "Material Capa 3", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer3Micron", label: "Micraje Capa 3", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer3Grammage", label: "Gramaje Capa 3", impactLevel: "media", editable: false, required: false },
      { fieldKey: "layer4Material", label: "Material Capa 4", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer4Micron", label: "Micraje Capa 4", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "layer4Grammage", label: "Gramaje Capa 4", impactLevel: "media", editable: false, required: false },
      { fieldKey: "specialStructureSpecs", label: "Especificaciones Especiales de Estructura / Comentarios", impactLevel: "media", editable: true, required: false },
      { fieldKey: "grammage", label: "Gramaje Total", impactLevel: "alta", editable: false, required: false },
      { fieldKey: "grammageTolerance", label: "Tolerancia de Gramaje", impactLevel: "media", editable: true, required: false },
      // Dimensiones
      { fieldKey: "width", label: "Ancho (mm)", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "length", label: "Largo (mm)", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "repetition", label: "Repetición (mm)", impactLevel: "media", editable: true, required: false },
      { fieldKey: "doyPackBase", label: "Base Doy Pack (mm)", impactLevel: "media", editable: true, required: false },
      { fieldKey: "gussetWidth", label: "Ancho de Fuelle (mm)", impactLevel: "media", editable: true, required: false },
      // Accesorios
      { fieldKey: "hasZipper", label: "¿Tiene Zipper?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "zipperType", label: "Tipo de Zipper", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasTinTie", label: "¿Tiene Tin Tie?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasValve", label: "¿Tiene Válvula?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "valveType", label: "Tipo de Válvula", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasDieCutHandle", label: "¿Tiene Troquel Asa?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasReinforcement", label: "¿Tiene Refuerzo?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "reinforcementThickness", label: "Espesor de Refuerzo", impactLevel: "media", editable: true, required: false },
      { fieldKey: "reinforcementWidth", label: "Ancho de Refuerzo", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasAngularCut", label: "¿Tiene Corte Angular?", impactLevel: "baja", editable: true, required: false },
      { fieldKey: "hasRoundedCorners", label: "¿Tiene Esquinas Redondeadas?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "roundedCornersType", label: "Tipo de Esquinas Redondeadas", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasNotch", label: "¿Tiene Muesca?", impactLevel: "baja", editable: true, required: false },
      { fieldKey: "hasPerforation", label: "¿Tiene Perforación?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "pouchPerforationType", label: "Tipo de Perforación Pouch", impactLevel: "media", editable: true, required: false },
      { fieldKey: "bagPerforationType", label: "Tipo de Perforación Bolsa", impactLevel: "media", editable: true, required: false },
      { fieldKey: "perforationLocation", label: "Ubicación de Perforación", impactLevel: "media", editable: true, required: false },
      { fieldKey: "hasPreCut", label: "¿Tiene Pre-Corte?", impactLevel: "media", editable: true, required: false },
      { fieldKey: "preCutType", label: "Tipo de Pre-Corte", impactLevel: "media", editable: true, required: false },
      { fieldKey: "otherAccessories", label: "Otros Accesorios", impactLevel: "baja", editable: true, required: false },
      // Tuco
      { fieldKey: "coreMaterial", label: "Material de Tuco", impactLevel: "media", editable: true, required: false },
      { fieldKey: "coreDiameter", label: "Diámetro de Tuco", impactLevel: "media", editable: true, required: false },
      { fieldKey: "externalDiameter", label: "Diámetro Exterior", impactLevel: "media", editable: true, required: false },
      { fieldKey: "externalVariationPlus", label: "Variación Exterior (+)", impactLevel: "baja", editable: true, required: false },
      { fieldKey: "externalVariationMinus", label: "Variación Exterior (-)", impactLevel: "baja", editable: true, required: false },
      { fieldKey: "maxRollWeight", label: "Peso Máximo de Bobina", impactLevel: "media", editable: true, required: false },
      // Logos
      { fieldKey: "peruvianProductLogo", label: "Logo Producto Peruano", impactLevel: "baja", editable: true, required: false },
      { fieldKey: "printingFooter", label: "Pie de Imprenta", impactLevel: "baja", editable: true, required: false },
      // Responsable
      { fieldKey: "rdResponsible", label: "Responsable R&D", impactLevel: "media", editable: true, required: false },
      { fieldKey: "rdComments", label: "Comentarios R&D", impactLevel: "media", editable: true, required: false },
    ],
  },
  "P4 - Commercial Finance": {
    area: "P4 - Commercial Finance",
    description: "Especificaciones financieras y comerciales",
    fields: [
      // Datos heredados
      { fieldKey: "estimatedVolume", label: "Volumen Estimado", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "unitOfMeasure", label: "Unidad de Medida", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "grammage", label: "Gramaje Total", impactLevel: "media", editable: false, required: false },
      { fieldKey: "structureType", label: "Tipo de Estructura", impactLevel: "media", editable: false, required: true },
      // Especificaciones Financieras
      { fieldKey: "saleType", label: "Tipo de Venta", impactLevel: "alta", editable: true, required: true },
      { fieldKey: "incoterm", label: "Incoterm", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "destinationCountry", label: "País de Destino", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "targetPrice", label: "Precio Objetivo", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "salePrice", label: "Precio de Venta", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "currencyType", label: "Tipo de Moneda", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "paymentTerms", label: "Condiciones de Pago", impactLevel: "alta", editable: true, required: false },
      { fieldKey: "customerAdditionalInfo", label: "Información Adicional Cliente", impactLevel: "baja", editable: true, required: false },
      // Responsable
      { fieldKey: "commercialFinanceResponsible", label: "Responsable Commercial Finance", impactLevel: "media", editable: true, required: false },
    ],
  },
  "P5 - Crédito / Cierre": {
    area: "P5 - Crédito / Cierre",
    description: "Aprobación final y condiciones de cierre",
    fields: [
      // Datos heredados de P4
      { fieldKey: "salePrice", label: "Precio de Venta", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "paymentTerms", label: "Condiciones de Pago", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "currencyType", label: "Tipo de Moneda", impactLevel: "alta", editable: false, required: true },
      { fieldKey: "saleType", label: "Tipo de Venta", impactLevel: "media", editable: false, required: true },
      { fieldKey: "incoterm", label: "Incoterm", impactLevel: "media", editable: false, required: false },
      { fieldKey: "destinationCountry", label: "País de Destino", impactLevel: "media", editable: false, required: false },
      // Aprobaciones
      { fieldKey: "sampleRequest", label: "Solicitud de Muestra", impactLevel: "alta", editable: false, required: false, description: "Aprobación para fabricación de muestra" },
      { fieldKey: "status", label: "Estado de Aprobación", impactLevel: "alta", editable: false, required: true },
    ],
  },
};

export function getFieldsByArea(area: WorkArea): FieldImpactConfig[] {
  return PROJECT_FIELD_IMPACT_BY_AREA[area]?.fields || [];
}

export function getAllAreas(): WorkArea[] {
  return Object.keys(PROJECT_FIELD_IMPACT_BY_AREA) as WorkArea[];
}

export function getAreaConfig(area: WorkArea): AreaImpactConfig | undefined {
  return PROJECT_FIELD_IMPACT_BY_AREA[area];
}

export function getFieldsForMultipleAreas(areas: WorkArea[]): FieldImpactConfig[] {
  const fieldMap = new Map<string, FieldImpactConfig>();
  
  areas.forEach((area) => {
    const fields = getFieldsByArea(area);
    fields.forEach((field) => {
      if (!fieldMap.has(field.fieldKey)) {
        fieldMap.set(field.fieldKey, field);
      }
    });
  });
  
  return Array.from(fieldMap.values());
}

export function isFieldEditableInArea(fieldKey: string, area: WorkArea): boolean {
  const fields = getFieldsByArea(area);
  const field = fields.find((f) => f.fieldKey === fieldKey);
  return field?.editable ?? false;
}

export function isFieldRequiredInArea(fieldKey: string, area: WorkArea): boolean {
  const fields = getFieldsByArea(area);
  const field = fields.find((f) => f.fieldKey === fieldKey);
  return field?.required ?? false;
}

export function getFieldImpactLevel(fieldKey: string, area: WorkArea): "alta" | "media" | "baja" | "info" | undefined {
  const fields = getFieldsByArea(area);
  const field = fields.find((f) => f.fieldKey === fieldKey);
  return field?.impactLevel;
}

// Mapeo de campos a etapas donde son relevantes
export const FIELD_TO_STAGE_RELEVANCE: Record<string, string[]> = {
  // P1
  "salesforceAction": ["P1"],
  "projectName": ["P1", "P2", "P3", "P4", "P5"],
  "classification": ["P1"],
  "subClassification": ["P1"],
  "projectType": ["P1", "P3"],
  "blueprintFormat": ["P1", "P3"],
  "technicalApplication": ["P1", "P3"],
  "estimatedVolume": ["P1", "P4"],
  "unitOfMeasure": ["P1", "P4"],
  "sampleRequest": ["P1", "P5"],
  // P2
  "printClass": ["P2"],
  "printType": ["P2"],
  "isPreviousDesign": ["P2"],
  "previousEdagCode": ["P2"],
  "previousEdagVersion": ["P2"],
  "specialDesignSpecs": ["P2"],
  "hasDigitalFiles": ["P2"],
  "requiresDesignWork": ["P2"],
  "graphicResponsible": ["P2"],
  "graphicComments": ["P2"],
  // P3
  "structureType": ["P3", "P4"],
  "layer1Material": ["P3"],
  "layer1Micron": ["P3"],
  "layer2Material": ["P3"],
  "layer2Micron": ["P3"],
  "layer3Material": ["P3"],
  "layer3Micron": ["P3"],
  "layer4Material": ["P3"],
  "layer4Micron": ["P3"],
  "width": ["P2", "P3"],
  "length": ["P2", "P3"],
  "repetition": ["P3"],
  "doyPackBase": ["P3"],
  "gussetWidth": ["P3"],
  "hasZipper": ["P3"],
  "zipperType": ["P3"],
  "hasTinTie": ["P3"],
  "hasValve": ["P3"],
  "valveType": ["P3"],
  "hasDieCutHandle": ["P3"],
  "hasReinforcement": ["P3"],
  "hasRoundedCorners": ["P3"],
  "roundedCornersType": ["P3"],
  "hasNotch": ["P3"],
  "hasPerforation": ["P3"],
  "hasPreCut": ["P3"],
  "rdResponsible": ["P3"],
  "rdComments": ["P3"],
  // P4
  "saleType": ["P4", "P5"],
  "incoterm": ["P4", "P5"],
  "destinationCountry": ["P4", "P5"],
  "targetPrice": ["P4"],
  "salePrice": ["P4", "P5"],
  "currencyType": ["P4", "P5"],
  "paymentTerms": ["P4", "P5"],
  "commercialFinanceResponsible": ["P4"],
  // P5
  "status": ["P5"],
};

export function getRelevantStagesForField(fieldKey: string): string[] {
  return FIELD_TO_STAGE_RELEVANCE[fieldKey] || [];
}

export function isFieldRelevantInStage(fieldKey: string, stage: string): boolean {
  const stages = getRelevantStagesForField(fieldKey);
  return stages.includes(stage);
}

export function getImpactFieldsForStage(stage: string): FieldImpactConfig[] {
  // Map stage to work area
  const stageToAreaMap: Record<string, WorkArea> = {
    "P1": "P1 - Comercial",
    "P2": "P2 - Artes Gráficas",
    "P3": "P3 - R&D",
    "P4": "P4 - Commercial Finance",
    "P5": "P5 - Crédito / Cierre",
  };

  const area = stageToAreaMap[stage];
  if (!area) return [];

  return getFieldsByArea(area);
}
