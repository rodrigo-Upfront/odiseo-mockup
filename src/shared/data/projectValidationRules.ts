import { getProjectObservations } from "./observationStorage";
import type { ProjectFieldSchema } from "./projectFieldSchema";
import { getRequiredFieldsByStage } from "./projectFieldSchema";

export type ValidationRule = {
  fieldKey: string;
  rule: "required" | "conditional" | "range" | "format" | "custom";
  message: string;
  condition?: (data: Record<string, unknown>) => boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  dependsOn?: string;
  dependsValue?: string | boolean;
};

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
};

// === REGLAS DE VALIDACIÓN POR ETAPA ===

export const STAGE_VALIDATION_RULES: Record<string, ValidationRule[]> = {
  P1: [
    { fieldKey: "projectName", rule: "required", message: "El nombre del proyecto es obligatorio" },
    { fieldKey: "salesforceAction", rule: "required", message: "La acción Salesforce es obligatoria" },
    { fieldKey: "classification", rule: "required", message: "La clasificación es obligatoria" },
    { fieldKey: "subClassification", rule: "required", message: "La sub-clasificación es obligatoria" },
    { fieldKey: "projectType", rule: "required", message: "El tipo de proyecto es obligatorio" },
    { fieldKey: "blueprintFormat", rule: "required", message: "El formato de plano es obligatorio" },
    { fieldKey: "technicalApplication", rule: "required", message: "La aplicación técnica es obligatoria" },
    { fieldKey: "estimatedVolume", rule: "required", message: "El volumen estimado es obligatorio" },
    { fieldKey: "unitOfMeasure", rule: "required", message: "La unidad de medida es obligatoria" },
  ],
  P2: [
    { fieldKey: "printClass", rule: "required", message: "La clase de impresión es obligatoria" },
    { fieldKey: "printType", rule: "required", message: "El tipo de impresión es obligatorio" },
    { fieldKey: "isPreviousDesign", rule: "required", message: "Debe indicar si tiene diseño trabajado" },
    {
      fieldKey: "previousEdagCode",
      rule: "conditional",
      message: "El código EDAG es obligatorio si tiene diseño trabajado",
      dependsOn: "isPreviousDesign",
      dependsValue: "Sí",
    },
    {
      fieldKey: "previousEdagVersion",
      rule: "conditional",
      message: "La versión EDAG es obligatoria si tiene diseño trabajado",
      dependsOn: "isPreviousDesign",
      dependsValue: "Sí",
    },
  ],
  P3: [
    { fieldKey: "structureType", rule: "required", message: "El tipo de estructura es obligatorio" },
    { fieldKey: "width", rule: "required", message: "El ancho es obligatorio" },
    { fieldKey: "length", rule: "required", message: "El largo es obligatorio" },
    {
      fieldKey: "width",
      rule: "range",
      message: "El ancho debe estar entre 50mm y 2000mm",
      min: 50,
      max: 2000,
    },
    {
      fieldKey: "length",
      rule: "range",
      message: "El largo debe estar entre 50mm y 2000mm",
      min: 50,
      max: 2000,
    },
    {
      fieldKey: "gussetWidth",
      rule: "range",
      message: "El fuelle debe estar entre 5mm y 150mm",
      min: 5,
      max: 150,
    },
    {
      fieldKey: "layer1Material",
      rule: "conditional",
      message: "El material de la capa 1 es obligatorio para estructuras con más de 1 capa",
      condition: (data) => {
        const structureType = data.structureType as string;
        return structureType !== "Monocapa" && structureType !== undefined;
      },
    },
    {
      fieldKey: "layer1Micron",
      rule: "conditional",
      message: "El micraje de la capa 1 es obligatorio para estructuras con más de 1 capa",
      condition: (data) => {
        const structureType = data.structureType as string;
        return structureType !== "Monocapa" && structureType !== undefined;
      },
    },
    // Reglas condicionales para accesorios
    {
      fieldKey: "zipperType",
      rule: "conditional",
      message: "El tipo de zipper es obligatorio si tiene zipper",
      dependsOn: "hasZipper",
      dependsValue: true,
    },
    {
      fieldKey: "valveType",
      rule: "conditional",
      message: "El tipo de válvula es obligatorio si tiene válvula",
      dependsOn: "hasValve",
      dependsValue: true,
    },
    {
      fieldKey: "roundedCornersType",
      rule: "conditional",
      message: "El tipo de esquinas redondeadas es obligatorio si tiene esquinas redondeadas",
      dependsOn: "hasRoundedCorners",
      dependsValue: true,
    },
    {
      fieldKey: "preCutType",
      rule: "conditional",
      message: "El tipo de pre-corte es obligatorio si tiene pre-corte",
      dependsOn: "hasPreCut",
      dependsValue: true,
    },
  ],
  P4: [
    { fieldKey: "saleType", rule: "required", message: "El tipo de venta es obligatorio" },
    {
      fieldKey: "incoterm",
      rule: "conditional",
      message: "El incoterm es obligatorio para ventas internacionales",
      condition: (data) => data.saleType === "Internacional",
    },
    {
      fieldKey: "destinationCountry",
      rule: "conditional",
      message: "El país de destino es obligatorio para ventas internacionales",
      condition: (data) => data.saleType === "Internacional",
    },
    {
      fieldKey: "salePrice",
      rule: "conditional",
      message: "El precio de venta es recomendado para completar la etapa",
      condition: () => true, // Advertencia
    },
  ],
  P5: [
    {
      fieldKey: "status",
      rule: "required",
      message: "El estado de aprobación es obligatorio",
    },
    {
      fieldKey: "paymentTerms",
      rule: "required",
      message: "Las condiciones de pago son obligatorias para la aprobación",
    },
    {
      fieldKey: "salePrice",
      rule: "required",
      message: "El precio de venta final es obligatorio para la aprobación",
    },
  ],
};

// === REGLAS DE VALIDACIÓN POR ÁREA ===

export const AREA_VALIDATION_RULES: Record<string, ValidationRule[]> = {
  "P1 - Comercial": [
    { fieldKey: "projectName", rule: "required", message: "Nombre del proyecto requerido" },
    { fieldKey: "salesforceAction", rule: "required", message: "Acción Salesforce requerida" },
    { fieldKey: "estimatedVolume", rule: "required", message: "Volumen estimado requerido" },
  ],
  "P2 - Artes Gráficas": [
    { fieldKey: "printClass", rule: "required", message: "Clase de impresión requerida" },
    { fieldKey: "printType", rule: "required", message: "Tipo de impresión requerido" },
    { fieldKey: "isPreviousDesign", rule: "required", message: "Debe indicar si tiene diseño trabajado" },
  ],
  "P3 - R&D": [
    { fieldKey: "structureType", rule: "required", message: "Tipo de estructura requerido" },
    { fieldKey: "width", rule: "required", message: "Ancho requerido" },
    { fieldKey: "length", rule: "required", message: "Largo requerido" },
  ],
  "P4 - Commercial Finance": [
    { fieldKey: "saleType", rule: "required", message: "Tipo de venta requerido" },
  ],
  "P5 - Crédito / Cierre": [
    { fieldKey: "salePrice", rule: "required", message: "Precio de venta requerido" },
    { fieldKey: "paymentTerms", rule: "required", message: "Condiciones de pago requeridas" },
  ],
};

// === RESTRICCIONES DE DIMENSIONES POR FORMATO DE PLANO ===

export const DIMENSION_CONSTRAINTS: Record<string, { minWidth: number; maxWidth: number; minLength: number; maxLength: number; minGusset?: number; maxGusset?: number }> = {
  "FP-001": { minWidth: 50, maxWidth: 500, minLength: 50, maxLength: 800 }, // Sachet / Pillow
  "FP-002": { minWidth: 80, maxWidth: 400, minLength: 100, maxLength: 500, minGusset: 0, maxGusset: 80 }, // Doy Pack - Stand Up
  "FP-003": { minWidth: 100, maxWidth: 350, minLength: 120, maxLength: 450, minGusset: 30, maxGusset: 100 }, // Doy Pack - Stand Up con Fuelle
  "FP-004": { minWidth: 60, maxWidth: 400, minLength: 80, maxLength: 600 }, // Bolsa Lateral
  "FP-005": { minWidth: 80, maxWidth: 450, minLength: 80, maxLength: 550 }, // Four Side Seal
  "FP-006": { minWidth: 60, maxWidth: 400, minLength: 60, maxLength: 500 }, // Three Side Seal
  "FP-007": { minWidth: 100, maxWidth: 500, minLength: 150, maxLength: 700 }, // Preformado
  "FP-008": { minWidth: 50, maxWidth: 600, minLength: 50, maxLength: 1000 }, // Flow Pack
  "FP-013": { minWidth: 300, maxWidth: 2000, minLength: 0, maxLength: 0 }, // Roll Stock (solo ancho relevante)
};

// === FUNCIONES DE VALIDACIÓN ===

export function validateField(
  // @ts-ignore
  fieldKey: string,
  value: unknown,
  rule: ValidationRule,
  allData: Record<string, unknown>
): { isValid: boolean; message?: string } {
  // Validar reglas condicionales
  if (rule.rule === "conditional") {
    let shouldValidate = false;
    
    if (rule.dependsOn && rule.dependsValue !== undefined) {
      const dependsValue = allData[rule.dependsOn];
      shouldValidate = dependsValue === rule.dependsValue;
    } else if (rule.condition) {
      shouldValidate = rule.condition(allData);
    }
    
    if (shouldValidate && (value === undefined || value === null || value === "")) {
      return { isValid: false, message: rule.message };
    }
    
    return { isValid: true };
  }
  
  // Validar campos requeridos
  if (rule.rule === "required") {
    if (value === undefined || value === null || value === "") {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  }
  
  // Validar rangos numéricos
  if (rule.rule === "range") {
    const numValue = typeof value === "string" ? parseFloat(value) : Number(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, message: rule.message };
    }
    
    if (rule.min !== undefined && numValue < rule.min) {
      return { isValid: false, message: rule.message };
    }
    
    if (rule.max !== undefined && numValue > rule.max) {
      return { isValid: false, message: rule.message };
    }
    
    return { isValid: true };
  }
  
  // Validar formato (regex)
  if (rule.rule === "format") {
    const strValue = String(value);
    if (rule.pattern && !rule.pattern.test(strValue)) {
      return { isValid: false, message: rule.message };
    }
    return { isValid: true };
  }
  
  return { isValid: true };
}

export function validateProjectByStage(
  data: Record<string, unknown>,
  stage: string
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  const rules = STAGE_VALIDATION_RULES[stage] || [];
  
  for (const rule of rules) {
    const value = data[rule.fieldKey];
    const result = validateField(rule.fieldKey, value, rule, data);
    
    if (!result.isValid) {
      errors[rule.fieldKey] = result.message || "Campo inválido";
    }
  }
  
  // Validar dimensiones según formato de plano
  if (data.blueprintFormat) {
    const formatCode = String(data.blueprintFormat);
    const constraints = DIMENSION_CONSTRAINTS[formatCode];
    
    if (constraints) {
      const width = data.width ? Number(data.width) : undefined;
      const length = data.length ? Number(data.length) : undefined;
      const gusset = data.gussetWidth ? Number(data.gussetWidth) : undefined;
      
      if (width !== undefined) {
        if (width < constraints.minWidth || width > constraints.maxWidth) {
          errors["width"] = `Ancho debe estar entre ${constraints.minWidth}mm y ${constraints.maxWidth}mm para este formato`;
        }
      }
      
      if (length !== undefined && constraints.maxLength > 0) {
        if (length < constraints.minLength || length > constraints.maxLength) {
          errors["length"] = `Largo debe estar entre ${constraints.minLength}mm y ${constraints.maxLength}mm para este formato`;
        }
      }
      
      if (gusset !== undefined && constraints.minGusset !== undefined && constraints.maxGusset !== undefined) {
        if (gusset > 0 && (gusset < constraints.minGusset || gusset > constraints.maxGusset)) {
          errors["gussetWidth"] = `Fuelle debe estar entre ${constraints.minGusset}mm y ${constraints.maxGusset}mm para este formato`;
        }
      }
    }
  }
  
  // Verificar observaciones bloqueantes para etapas finales
  if (stage === "P4" || stage === "P5") {
    const projectCode = data.code as string;
    if (projectCode) {
      const hasBlockingObservations = hasBlockingOpenObservations(projectCode);
      if (hasBlockingObservations) {
        errors["blockingObservations"] = "Hay observaciones bloqueantes abiertas que deben resolverse antes de aprobar";
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

export function validateProjectByArea(
  data: Record<string, unknown>,
  area: string
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  const rules = AREA_VALIDATION_RULES[area] || [];
  
  for (const rule of rules) {
    const value = data[rule.fieldKey];
    const result = validateField(rule.fieldKey, value, rule, data);
    
    if (!result.isValid) {
      errors[rule.fieldKey] = result.message || "Campo inválido";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

export function validateProjectComplete(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  
  // Validar todas las etapas
  const stages = ["P1", "P2", "P3", "P4", "P5"];
  
  for (const stage of stages) {
    const stageResult = validateProjectByStage(data, stage);
    
    // Agregar prefijo de etapa a los errores
    for (const [key, message] of Object.entries(stageResult.errors)) {
      errors[`${stage}.${key}`] = message;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

export function hasBlockingOpenObservations(projectCode: string): boolean {
  const observations = getProjectObservations();
  return observations.some(
    (obs) =>
      obs.projectCode === projectCode &&
      obs.status === "Abierta" &&
      obs.isBlocking === true
  );
}

export function canSkipP2(data: Record<string, unknown>): boolean {
  return data.isPreviousDesign === "Sí" || data.hasDigitalFiles === true;
}

export function getP2Status(data: Record<string, unknown>): "aplica" | "saltado" {
  return canSkipP2(data) ? "aplica" : "saltado";
}

export function isStageComplete(
  data: Record<string, unknown>,
  stage: string
): boolean {
  const result = validateProjectByStage(data, stage);
  return result.isValid;
}

export function getMissingFieldsForStage(
  data: Record<string, unknown>,
  stage: string
): string[] {
  const result = validateProjectByStage(data, stage);
  return Object.keys(result.errors);
}

export function getCompletionPercentageByStage(
  data: Record<string, unknown>,
  stage: string
): number {
  const requiredFields = getRequiredFieldsByStage(stage);
  if (requiredFields.length === 0) return 100;
  
  let completed = 0;
  for (const field of requiredFields) {
    const value = data[field.key];
    if (value !== undefined && value !== null && value !== "") {
      completed++;
    }
  }
  
  return Math.round((completed / requiredFields.length) * 100);
}

export function getOverallCompletionPercentage(data: Record<string, unknown>): number {
  const stages = ["P1", "P2", "P3", "P4", "P5"];
  let totalPercentage = 0;
  
  for (const stage of stages) {
    totalPercentage += getCompletionPercentageByStage(data, stage);
  }
  
  return Math.round(totalPercentage / stages.length);
}
