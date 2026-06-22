/**
 * Utilidades para generación inteligente de códigos SKU en ODISEO
 *
 * Maneja la lógica específica de generación basada en:
 * - Clasificación (Producto Nuevo vs Producto Modificado)
 * - Producto base (cuando existe)
 */

import {
  parseSKU,
  formatSKU,
  validateSKU,
  generateNewSKU,
  type SKULifecycle,
} from './productCodeRules';

/**
 * Resultado de generación de SKU para nueva solicitud
 */
export interface SKUGenerationResult {
  skuCode: string;
  skuSequence: number;
  skuLifecycleCode: 'E';
  skuVersion: number;
  reason: string;
  errors: string[];
}

/**
 * Genera SKU para una nueva solicitud basado en clasificación
 *
 * Reglas:
 * - Producto Nuevo: Nuevo correlativo, ciclo E, versión 00
 * - Producto Modificado: Correlativo base, ciclo E, versión +1 del base
 * - Todo nace en estado PRELIMINAR (E)
 */
export function generateSKUForNewRequest(
  classification: string,
  allExistingProjects: Array<{ skuSequence?: number; skuCode?: string; skuVersion?: number }>,
  baseProductSku?: string
): SKUGenerationResult {
  const errors: string[] = [];
  const isProductoModificado = normalizeClassification(classification) === 'Producto Modificado';

  // ============ Caso 1: Producto Nuevo ============
  if (!isProductoModificado) {
    // Extraer secuencias existentes
    const existingSequences = allExistingProjects
      .map(p => p.skuSequence)
      .filter((seq): seq is number => typeof seq === 'number' && seq > 0);

    // Calcular siguiente correlativo
    const nextSequence = existingSequences.length > 0
      ? Math.max(...existingSequences) + 1
      : 1;

    if (nextSequence > 99999) {
      errors.push('No hay más correlativas disponibles (máximo 99999)');
      return {
        skuCode: '',
        skuSequence: 0,
        skuLifecycleCode: 'E',
        skuVersion: 0,
        reason: 'Error: Límite de correlativas alcanzado',
        errors,
      };
    }

    const skuCode = formatSKU(nextSequence, 'E', 0);

    return {
      skuCode,
      skuSequence: nextSequence,
      skuLifecycleCode: 'E',
      skuVersion: 0,
      reason: `Producto Nuevo: Nuevo correlativo ${String(nextSequence).padStart(5, '0')}, preliminar (E), versión 00`,
      errors: [],
    };
  }

  // ============ Caso 2: Producto Modificado ============
  if (!baseProductSku) {
    errors.push('Producto Modificado requiere un SKU base válido');
    return {
      skuCode: '',
      skuSequence: 0,
      skuLifecycleCode: 'E',
      skuVersion: 0,
      reason: 'Error: Falta SKU base para Producto Modificado',
      errors,
    };
  }

  // Parsear SKU base
  const parsedBase = parseSKU(baseProductSku);
  if (!parsedBase.valid) {
    errors.push(`SKU base inválido: ${parsedBase.error}`);
    return {
      skuCode: '',
      skuSequence: 0,
      skuLifecycleCode: 'E',
      skuVersion: 0,
      reason: `Error: SKU base "${baseProductSku}" es inválido`,
      errors,
    };
  }

  // Extraer componentes del SKU base
  const baseCorrelativo = parsedBase.correlativo;
  const baseVersion = parsedBase.version;

  // Incrementar versión
  const newVersion = baseVersion + 1;

  if (newVersion > 99) {
    errors.push(`Versión base (${baseVersion}) + 1 excede el máximo de 99`);
    return {
      skuCode: '',
      skuSequence: 0,
      skuLifecycleCode: 'E',
      skuVersion: 0,
      reason: `Error: Versión máxima (99) excedida`,
      errors,
    };
  }

  // Generar nuevo SKU: mismo correlativo, ciclo E, versión incrementada
  const newSkuCode = formatSKU(baseCorrelativo, 'E', newVersion);

  return {
    skuCode: newSkuCode,
    skuSequence: baseCorrelativo,
    skuLifecycleCode: 'E',
    skuVersion: newVersion,
    reason: `Producto Modificado: Correlativo ${String(baseCorrelativo).padStart(5, '0')}, preliminar (E), versión ${String(newVersion).padStart(2, '0')} (base: ${baseProductSku})`,
    errors: [],
  };
}

/**
 * Normaliza la clasificación a los valores estándar
 */
function normalizeClassification(classification: string): string {
  const normalized = (classification || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  if (normalized.includes('producto') && normalized.includes('nuevo')) {
    return 'Producto Nuevo';
  }
  if (normalized.includes('producto') && normalized.includes('modificado')) {
    return 'Producto Modificado';
  }

  return classification;
}

/**
 * Valida si un SKU es aceptable para una nueva solicitud
 * (Debe estar en ciclo E)
 */
export function isValidSKUForNewRequest(skuCode: string): boolean {
  const parsed = parseSKU(skuCode);
  if (!parsed.valid) return false;

  // Debe estar en ciclo preliminar
  return parsed.cycle === 'E';
}

/**
 * Extrae el correlativo de un SKU
 */
export function extractSKUCorrelativo(skuCode: string): number | null {
  const parsed = parseSKU(skuCode);
  if (!parsed.valid) return null;
  return parsed.correlativo;
}

/**
 * Extrae la versión de un SKU
 */
export function extractSKUVersion(skuCode: string): number | null {
  const parsed = parseSKU(skuCode);
  if (!parsed.valid) return null;
  return parsed.version;
}

/**
 * Obtiene información legible del SKU generado
 */
export function getSKUGenerationInfo(result: SKUGenerationResult): string {
  if (result.errors.length > 0) {
    return `Error: ${result.errors.join(', ')}`;
  }
  return `SKU: ${result.skuCode} - ${result.reason}`;
}
