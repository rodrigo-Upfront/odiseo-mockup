/**
 * Reglas de generación y validación de códigos de producto en ODISEO
 *
 * ODISEO maneja tres conceptos separados:
 * 1. SKU - Interno, ciclo de vida, NO se envía a sistemas externos
 * 2. EDAG - Se envía a WebCenter y Sistema Integral
 * 3. EM - Se envía solo a Sistema Integral
 */

// ============= SKU (Interno ODISEO) =============

export type SKULifecycle = 'E' | 'B' | 'A' | 'I';

export interface ParsedSKU {
  correlativo: number;
  cycle: SKULifecycle;
  version: number;
  valid: boolean;
  error?: string;
}

/**
 * Parsea un código SKU interno
 * Formato: SKU-#####-C-##
 */
export function parseSKU(skuCode: string): ParsedSKU {
  if (!skuCode) {
    return { correlativo: 0, cycle: 'E', version: 0, valid: false, error: 'SKU vacío' };
  }

  const skuRegex = /^SKU-(\d{5})-([EBAI])-(\d{2})$/;
  const match = skuCode.trim().match(skuRegex);

  if (!match) {
    return {
      correlativo: 0,
      cycle: 'E',
      version: 0,
      valid: false,
      error: `Formato SKU inválido. Esperado: SKU-#####-[EBAI]-##`,
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
 * Valida que un código SKU cumpla con las reglas
 */
export function validateSKU(skuCode: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseSKU(skuCode);

  if (!parsed.valid) {
    errors.push(parsed.error || 'Formato SKU inválido');
    return { valid: false, errors };
  }

  if (!['E', 'B', 'A', 'I'].includes(parsed.cycle)) {
    errors.push(`Ciclo '${parsed.cycle}' no es válido. Use: E, B, A, I`);
  }

  if (parsed.correlativo < 1 || parsed.correlativo > 99999) {
    errors.push('Correlativo debe estar entre 00001 y 99999');
  }

  if (parsed.version < 0 || parsed.version > 99) {
    errors.push('Versión debe estar entre 00 y 99');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Genera un nuevo SKU interno
 */
export function generateNewSKU(skuSequence: number = 1): string {
  const correlativo = Math.max(1, skuSequence);
  return formatSKU(correlativo, 'E', 0);
}

// ============= EDAG (Para WebCenter y Sistema Integral) =============

export interface ParsedEDAG {
  sequence: number;
  version: number;
  valid: boolean;
  error?: string;
}

/**
 * Parsea un código EDAG
 * Formato: #####-##
 * Rango inicial: 60000-00
 */
export function parseEDAG(edagCode: string): ParsedEDAG {
  if (!edagCode) {
    return { sequence: 0, version: 0, valid: false, error: 'EDAG vacío' };
  }

  const edagRegex = /^(\d{5})-(\d{2})$/;
  const match = edagCode.trim().match(edagRegex);

  if (!match) {
    return {
      sequence: 0,
      version: 0,
      valid: false,
      error: `Formato EDAG inválido. Esperado: #####-##`,
    };
  }

  const sequence = parseInt(match[1], 10);

  // EDAG debe iniciar desde 60000
  if (sequence < 60000) {
    return {
      sequence,
      version: 0,
      valid: false,
      error: `Secuencia EDAG debe ser >= 60000 (fue ${sequence})`,
    };
  }

  return {
    sequence,
    version: parseInt(match[2], 10),
    valid: true,
  };
}

/**
 * Formatea un EDAG con componentes individuales
 */
export function formatEDAG(sequence: number, version: number): string {
  const paddedSequence = String(sequence).padStart(5, '0');
  const paddedVersion = String(version).padStart(2, '0');
  return `${paddedSequence}-${paddedVersion}`;
}

/**
 * Valida que un código EDAG cumpla con las reglas
 */
export function validateEDAG(edagCode: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseEDAG(edagCode);

  if (!parsed.valid) {
    errors.push(parsed.error || 'Formato EDAG inválido');
    return { valid: false, errors };
  }

  if (parsed.sequence < 60000 || parsed.sequence > 99999) {
    errors.push('Secuencia EDAG debe estar entre 60000 y 99999');
  }

  if (parsed.version < 0 || parsed.version > 99) {
    errors.push('Versión debe estar entre 00 y 99');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Genera un nuevo EDAG
 * El primer EDAG inicia en 60000-00
 */
export function generateNewEDAG(edagSequence: number = 60000): string {
  // Asegurar que sea >= 60000
  const sequence = Math.max(60000, edagSequence);
  return formatEDAG(sequence, 0);
}

/**
 * Incrementa la versión de un EDAG
 */
export function incrementEDAGVersion(edagCode: string): string | null {
  const parsed = parseEDAG(edagCode);

  if (!parsed.valid) {
    return null;
  }

  if (parsed.version >= 99) {
    return null; // Versión máxima alcanzada
  }

  return formatEDAG(parsed.sequence, parsed.version + 1);
}

// ============= EM (Para Sistema Integral) =============

export interface ParsedEM {
  sequence: number;
  version: number;
  valid: boolean;
  error?: string;
}

/**
 * Parsea un código EM
 * Formato: #####-##
 * Rango inicial: 50000-00
 */
export function parseEM(emCode: string): ParsedEM {
  if (!emCode) {
    return { sequence: 0, version: 0, valid: false, error: 'EM vacío' };
  }

  const emRegex = /^(\d{5})-(\d{2})$/;
  const match = emCode.trim().match(emRegex);

  if (!match) {
    return {
      sequence: 0,
      version: 0,
      valid: false,
      error: `Formato EM inválido. Esperado: #####-##`,
    };
  }

  const sequence = parseInt(match[1], 10);

  // EM debe iniciar desde 50000
  if (sequence < 50000) {
    return {
      sequence,
      version: 0,
      valid: false,
      error: `Secuencia EM debe ser >= 50000 (fue ${sequence})`,
    };
  }

  return {
    sequence,
    version: parseInt(match[2], 10),
    valid: true,
  };
}

/**
 * Formatea un EM con componentes individuales
 */
export function formatEM(sequence: number, version: number): string {
  const paddedSequence = String(sequence).padStart(5, '0');
  const paddedVersion = String(version).padStart(2, '0');
  return `${paddedSequence}-${paddedVersion}`;
}

/**
 * Valida que un código EM cumpla con las reglas
 */
export function validateEM(emCode: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const parsed = parseEM(emCode);

  if (!parsed.valid) {
    errors.push(parsed.error || 'Formato EM inválido');
    return { valid: false, errors };
  }

  if (parsed.sequence < 50000 || parsed.sequence > 99999) {
    errors.push('Secuencia EM debe estar entre 50000 y 99999');
  }

  if (parsed.version < 0 || parsed.version > 99) {
    errors.push('Versión debe estar entre 00 y 99');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Genera un nuevo EM
 * El primer EM inicia en 50000-00
 */
export function generateNewEM(emSequence: number = 50000): string {
  // Asegurar que sea >= 50000
  const sequence = Math.max(50000, emSequence);
  return formatEM(sequence, 0);
}

/**
 * Incrementa la versión de un EM
 */
export function incrementEMVersion(emCode: string): string | null {
  const parsed = parseEM(emCode);

  if (!parsed.valid) {
    return null;
  }

  if (parsed.version >= 99) {
    return null; // Versión máxima alcanzada
  }

  return formatEM(parsed.sequence, parsed.version + 1);
}

// ============= Utilidades Generales =============

/**
 * Obtiene etiqueta legible del ciclo de vida SKU
 */
export function getSKUCycleLabel(cycle: SKULifecycle): string {
  const labels: Record<SKULifecycle, string> = {
    E: 'Preliminar',
    B: 'Base',
    A: 'Aprobado',
    I: 'Inactivo',
  };
  return labels[cycle] || cycle;
}

/**
 * Obtiene información completa legible de un SKU
 */
export function getSKUInfo(skuCode: string): {
  valid: boolean;
  correlativo: string;
  cycle: string;
  cycleLabel: string;
  version: string;
  formatted: string;
} | null {
  const parsed = parseSKU(skuCode);
  if (!parsed.valid) return null;

  return {
    valid: true,
    correlativo: String(parsed.correlativo).padStart(5, '0'),
    cycle: parsed.cycle,
    cycleLabel: getSKUCycleLabel(parsed.cycle),
    version: String(parsed.version).padStart(2, '0'),
    formatted: skuCode,
  };
}

/**
 * Obtiene información completa legible de un EDAG
 */
export function getEDAGInfo(edagCode: string): {
  valid: boolean;
  sequence: string;
  version: string;
  formatted: string;
} | null {
  const parsed = parseEDAG(edagCode);
  if (!parsed.valid) return null;

  return {
    valid: true,
    sequence: String(parsed.sequence).padStart(5, '0'),
    version: String(parsed.version).padStart(2, '0'),
    formatted: edagCode,
  };
}

/**
 * Obtiene información completa legible de un EM
 */
export function getEMInfo(emCode: string): {
  valid: boolean;
  sequence: string;
  version: string;
  formatted: string;
} | null {
  const parsed = parseEM(emCode);
  if (!parsed.valid) return null;

  return {
    valid: true,
    sequence: String(parsed.sequence).padStart(6, '0'),
    version: String(parsed.version).padStart(2, '0'),
    formatted: emCode,
  };
}

/**
 * Valida que el producto tenga códigos válidos
 */
export function validateProductCodes(
  skuCode?: string,
  edagCode?: string,
  emCode?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (skuCode) {
    const skuValidation = validateSKU(skuCode);
    if (!skuValidation.valid) {
      errors.push(`SKU inválido: ${skuValidation.errors.join(', ')}`);
    }
  }

  if (edagCode) {
    const edagValidation = validateEDAG(edagCode);
    if (!edagValidation.valid) {
      errors.push(`EDAG inválido: ${edagValidation.errors.join(', ')}`);
    }
  }

  if (emCode) {
    const emValidation = validateEM(emCode);
    if (!emValidation.valid) {
      errors.push(`EM inválido: ${emValidation.errors.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
