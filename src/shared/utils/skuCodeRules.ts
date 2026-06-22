/**
 * Reglas de generación y validación de códigos SKU
 *
 * Formato: SKU-#####-C-##
 * - SKU: dominio fijo
 * - #####: correlativo único de 5 dígitos
 * - C: ciclo de vida (E=Preliminar, B=Base, A=Aprobado, I=Inactivo)
 * - ##: versión de 2 dígitos
 */

export type SKULifecycle = 'E' | 'B' | 'A' | 'I';

export interface ParsedSKU {
  correlativo: number;
  cycle: SKULifecycle;
  version: number;
  valid: boolean;
  error?: string;
}

/**
 * Parsea un código SKU y extrae sus componentes
 */
export function parseSKUCode(skuCode: string): ParsedSKU {
  if (!skuCode) {
    return { correlativo: 0, cycle: 'E', version: 0, valid: false, error: 'SKU vacío' };
  }

  const skuRegex = /^SKU-(\d{5})-([EABI])-(\d{2})$/;
  const match = skuCode.trim().match(skuRegex);

  if (!match) {
    return {
      correlativo: 0,
      cycle: 'E',
      version: 0,
      valid: false,
      error: `Formato SKU inválido. Esperado: SKU-#####-C-##`,
    };
  }

  return {
    correlativo: parseInt(match[1], 10),
    cycle: match[2] as SKULifecycle,
    version: parseInt(match[3], 10),
    valid: true,
  };
}

/**
 * Formatea un SKU con componentes individuales
 */
export function formatSKU(
  correlativo: number,
  cycle: SKULifecycle,
  version: number
): string {
  const paddedCorrelativo = String(correlativo).padStart(5, '0');
  const paddedVersion = String(version).padStart(2, '0');
  return `SKU-${paddedCorrelativo}-${cycle}-${paddedVersion}`;
}

/**
 * Valida que un código SKU cumpla con todas las reglas
 */
export function validateSKUCode(skuCode: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseSKUCode(skuCode);

  if (!parsed.valid) {
    errors.push(parsed.error || 'Formato SKU inválido');
    return { valid: false, errors };
  }

  // No usar P como ciclo de vida
  if (parsed.cycle === 'P' as any) {
    errors.push('P no es un ciclo de vida válido');
  }

  // Validar que ciclo sea uno de los permitidos
  if (!['E', 'B', 'A', 'I'].includes(parsed.cycle)) {
    errors.push(`Ciclo '${parsed.cycle}' no es válido. Use: E, B, A, I`);
  }

  // Validar correlativo válido
  if (parsed.correlativo < 1 || parsed.correlativo > 99999) {
    errors.push('Correlativo debe estar entre 00001 y 99999');
  }

  // Validar versión válida
  if (parsed.version < 0 || parsed.version > 99) {
    errors.push('Versión debe estar entre 00 y 99');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Genera un nuevo SKU para Producto Nuevo
 * Formato: SKU-00001-E-00 (o el próximo correlativo disponible)
 */
export function generateNewProductSKU(nextCorrelativo: number = 1): string {
  const correlativo = Math.max(1, nextCorrelativo);
  return formatSKU(correlativo, 'E', 0);
}

/**
 * Genera un nuevo SKU para Producto Modificado
 * Toma correlativo del SKU base, ciclo E, incrementa versión +1
 * Ejemplo: Base SKU-00001-A-01 → Modificado SKU-00001-E-02
 */
export function generateModifiedProductSKU(baseSKUCode: string): string | null {
  const baseParsed = parseSKUCode(baseSKUCode);

  if (!baseParsed.valid) {
    return null;
  }

  // Incrementar versión en +1
  const newVersion = baseParsed.version + 1;

  // Validar que la nueva versión no exceda 99
  if (newVersion > 99) {
    return null;
  }

  return formatSKU(baseParsed.correlativo, 'E', newVersion);
}

/**
 * Aprueba un SKU: cambia ciclo de E a A
 * Ejemplo: SKU-00001-E-02 → SKU-00001-A-02
 */
export function approveSKU(skuCode: string): string | null {
  const parsed = parseSKUCode(skuCode);

  if (!parsed.valid) {
    return null;
  }

  // Solo se puede aprobar desde estado E
  if (parsed.cycle !== 'E') {
    return null;
  }

  return formatSKU(parsed.correlativo, 'A', parsed.version);
}

/**
 * Marca un SKU como Base: cambia ciclo de E a B
 * Ejemplo: SKU-00001-E-02 → SKU-00001-B-02
 */
export function markSKUAsBase(skuCode: string): string | null {
  const parsed = parseSKUCode(skuCode);

  if (!parsed.valid) {
    return null;
  }

  // Solo se puede marcar como Base desde estado E
  if (parsed.cycle !== 'E') {
    return null;
  }

  return formatSKU(parsed.correlativo, 'B', parsed.version);
}

/**
 * Inactiva un SKU: cambia ciclo a I
 * Ejemplo: SKU-00005-A-00 → SKU-00005-I-00
 */
export function inactivateSKU(skuCode: string): string | null {
  const parsed = parseSKUCode(skuCode);

  if (!parsed.valid) {
    return null;
  }

  // Se puede inactivar desde cualquier ciclo
  return formatSKU(parsed.correlativo, 'I', parsed.version);
}

/**
 * Obtiene el ciclo de vida de un SKU
 */
export function getSKUCycle(skuCode: string): SKULifecycle | null {
  const parsed = parseSKUCode(skuCode);
  return parsed.valid ? parsed.cycle : null;
}

/**
 * Obtiene la versión de un SKU
 */
export function getSKUVersion(skuCode: string): number | null {
  const parsed = parseSKUCode(skuCode);
  return parsed.valid ? parsed.version : null;
}

/**
 * Obtiene el correlativo de un SKU
 */
export function getSKUCorrelativo(skuCode: string): number | null {
  const parsed = parseSKUCode(skuCode);
  return parsed.valid ? parsed.correlativo : null;
}

/**
 * Obtiene la etiqueta del ciclo de vida
 */
export function getCycleLabel(cycle: SKULifecycle): string {
  const labels: Record<SKULifecycle, string> = {
    E: 'Preliminar',
    B: 'Base',
    A: 'Aprobado',
    I: 'Inactivo',
  };
  return labels[cycle] || cycle;
}

/**
 * Valida reglas de negocio para generación de nuevo SKU
 */
export function validateNewSKUGeneration(
  classificationType: 'Producto Nuevo' | 'Producto Modificado',
  baseSKUCode?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (classificationType === 'Producto Nuevo') {
    // No aplica validaciones adicionales para producto nuevo
  } else if (classificationType === 'Producto Modificado') {
    if (!baseSKUCode) {
      errors.push('Se requiere SKU base para producto modificado');
    } else {
      const baseParsed = parseSKUCode(baseSKUCode);
      if (!baseParsed.valid) {
        errors.push('SKU base inválido');
      } else if (baseParsed.version >= 99) {
        errors.push('No se puede incrementar versión: versión máxima alcanzada (99)');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Obtiene el próximo correlativo disponible basado en proyectos existentes
 */
export function getNextCorrelativo(existingSKUCodes: string[]): number {
  const correlatives = existingSKUCodes
    .map(skuCode => parseSKUCode(skuCode))
    .filter(parsed => parsed.valid)
    .map(parsed => parsed.correlativo);

  if (correlatives.length === 0) {
    return 1;
  }

  const maxCorrelativo = Math.max(...correlatives);
  return maxCorrelativo + 1;
}
