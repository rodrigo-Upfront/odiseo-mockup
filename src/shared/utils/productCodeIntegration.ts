/**
 * Integración de códigos de producto con sistemas externos
 *
 * Gestiona el mapeo y validación de códigos según interfaces de sistemas:
 * - WebCenter: Recibe solo EDAG
 * - Sistema Integral: Recibe EDAG y EM
 * - ODISEO interno: Mantiene SKU (no se envía)
 */

import {
  validateSKU,
  validateEDAG,
  validateEM,
  parseSKU,
  parseEDAG,
  parseEM,
  getSKUCycleLabel,
} from './productCodeRules';

// ============= Interfaces de Integraciones =============

/**
 * Payload para WebCenter
 * WebCenter solo recibe EDAG
 */
export interface WebCenterPayload {
  edagCode: string;
}

/**
 * Payload para Sistema Integral
 * Sistema Integral recibe EDAG y EM
 */
export interface SistemaIntegralPayload {
  edagCode: string;
  emCode: string;
}

/**
 * Datos internos de ODISEO
 * Incluye SKU (no se envía a sistemas externos)
 */
export interface ODISEOProductCodes {
  skuCode: string;
  skuSequence: number;
  skuLifecycleCode: 'E' | 'B' | 'A' | 'I';
  skuVersion: number;
  edagCode: string;
  edagSequence: number;
  edagVersion: number;
  emCode: string;
  emSequence: number;
  emVersion: number;
}

// ============= Validaciones de Integraciones =============

/**
 * Valida que los códigos sean apropiados para enviar a WebCenter
 */
export function validateForWebCenter(edagCode: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar que EDAG sea válido
  const edagValidation = validateEDAG(edagCode);
  if (!edagValidation.valid) {
    errors.push(`EDAG inválido para WebCenter: ${edagValidation.errors.join(', ')}`);
  }

  // EDAG siempre debe tener versión
  const edagParsed = parseEDAG(edagCode);
  if (edagParsed.valid && edagParsed.version === 0) {
    // Versión 0 es permitida pero se recomienda revisar
    console.warn('EDAG con versión 0 se envía a WebCenter - confirma si es intencional');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida que los códigos sean apropiados para enviar a Sistema Integral
 */
export function validateForSistemaIntegral(
  edagCode: string,
  emCode: string
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar que EDAG sea válido
  const edagValidation = validateEDAG(edagCode);
  if (!edagValidation.valid) {
    errors.push(`EDAG inválido para Sistema Integral: ${edagValidation.errors.join(', ')}`);
  }

  // Validar que EM sea válido
  const emValidation = validateEM(emCode);
  if (!emValidation.valid) {
    errors.push(`EM inválido para Sistema Integral: ${emValidation.errors.join(', ')}`);
  }

  // Ambos códigos deben tener versión
  const edagParsed = parseEDAG(edagCode);
  const emParsed = parseEM(emCode);

  if (edagParsed.valid && edagParsed.version === 0) {
    console.warn('EDAG con versión 0 se envía a Sistema Integral - confirma si es intencional');
  }

  if (emParsed.valid && emParsed.version === 0) {
    console.warn('EM con versión 0 se envía a Sistema Integral - confirma si es intencional');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida que NO se envíe SKU a sistemas externos
 */
export function validateSKUNotSent(skuCode?: string): {
  valid: boolean;
  message: string;
} {
  if (!skuCode) {
    return { valid: true, message: 'SKU no presente (correcto)' };
  }

  // Si llegamos aquí, alguien intentó enviar SKU
  return {
    valid: false,
    message: 'ERROR: SKU no debe enviarse a sistemas externos',
  };
}

/**
 * Valida que NO se envíe EM a WebCenter
 */
export function validateEMNotSentToWebCenter(emCode?: string): {
  valid: boolean;
  message: string;
} {
  if (!emCode) {
    return { valid: true, message: 'EM no presente (correcto)' };
  }

  // Si llegamos aquí, alguien intentó enviar EM a WebCenter
  return {
    valid: false,
    message: 'ERRO: EM no debe enviarse a WebCenter',
  };
}

// ============= Generación de Payloads =============

/**
 * Genera payload para WebCenter
 * Solo contiene EDAG
 */
export function generateWebCenterPayload(edagCode: string): WebCenterPayload | null {
  const validation = validateForWebCenter(edagCode);

  if (!validation.valid) {
    console.error('Error generando payload WebCenter:', validation.errors);
    return null;
  }

  // Verificar que NO se envíe SKU ni EM
  if (!validateSKUNotSent().valid || !validateEMNotSentToWebCenter().valid) {
    console.error('Intento de enviar códigos no permitidos a WebCenter');
    return null;
  }

  return {
    edagCode,
  };
}

/**
 * Genera payload para Sistema Integral
 * Contiene EDAG y EM
 */
export function generateSistemaIntegralPayload(
  edagCode: string,
  emCode: string
): SistemaIntegralPayload | null {
  const validation = validateForSistemaIntegral(edagCode, emCode);

  if (!validation.valid) {
    console.error('Error generando payload Sistema Integral:', validation.errors);
    return null;
  }

  // Verificar que NO se envíe SKU
  if (!validateSKUNotSent().valid) {
    console.error('Intento de enviar SKU a Sistema Integral');
    return null;
  }

  return {
    edagCode,
    emCode,
  };
}

// ============= Validaciones de Consistencia =============

/**
 * Valida que los códigos sean consistentes entre sí
 */
export function validateCodeConsistency(productCodes: Partial<ODISEOProductCodes>): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // SKU debe ser válido si está presente
  if (productCodes.skuCode) {
    const skuValidation = validateSKU(productCodes.skuCode);
    if (!skuValidation.valid) {
      errors.push(`SKU inválido: ${skuValidation.errors.join(', ')}`);
    } else {
      const skuParsed = parseSKU(productCodes.skuCode);
      // Verificar que el ciclo coincida con skuLifecycleCode
      if (productCodes.skuLifecycleCode && skuParsed.cycle !== productCodes.skuLifecycleCode) {
        warnings.push(
          `Ciclo en SKU (${skuParsed.cycle}) no coincide con skuLifecycleCode (${productCodes.skuLifecycleCode})`
        );
      }
      // Verificar que la versión coincida con skuVersion
      if (productCodes.skuVersion !== undefined && skuParsed.version !== productCodes.skuVersion) {
        warnings.push(
          `Versión en SKU (${skuParsed.version}) no coincide con skuVersion (${productCodes.skuVersion})`
        );
      }
    }
  }

  // EDAG debe ser válido si está presente
  if (productCodes.edagCode) {
    const edagValidation = validateEDAG(productCodes.edagCode);
    if (!edagValidation.valid) {
      errors.push(`EDAG inválido: ${edagValidation.errors.join(', ')}`);
    } else {
      const edagParsed = parseEDAG(productCodes.edagCode);
      // Verificar que la secuencia coincida con edagSequence
      if (productCodes.edagSequence !== undefined && edagParsed.sequence !== productCodes.edagSequence) {
        warnings.push(
          `Secuencia en EDAG (${edagParsed.sequence}) no coincide con edagSequence (${productCodes.edagSequence})`
        );
      }
      // Verificar que la versión coincida con edagVersion
      if (productCodes.edagVersion !== undefined && edagParsed.version !== productCodes.edagVersion) {
        warnings.push(
          `Versión en EDAG (${edagParsed.version}) no coincide con edagVersion (${productCodes.edagVersion})`
        );
      }
    }
  }

  // EM debe ser válido si está presente
  if (productCodes.emCode) {
    const emValidation = validateEM(productCodes.emCode);
    if (!emValidation.valid) {
      errors.push(`EM inválido: ${emValidation.errors.join(', ')}`);
    } else {
      const emParsed = parseEM(productCodes.emCode);
      // Verificar que la secuencia coincida con emSequence
      if (productCodes.emSequence !== undefined && emParsed.sequence !== productCodes.emSequence) {
        warnings.push(
          `Secuencia en EM (${emParsed.sequence}) no coincide con emSequence (${productCodes.emSequence})`
        );
      }
      // Verificar que la versión coincida con emVersion
      if (productCodes.emVersion !== undefined && emParsed.version !== productCodes.emVersion) {
        warnings.push(
          `Versión en EM (${emParsed.version}) no coincide con emVersion (${productCodes.emVersion})`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

// ============= Resumen de Códigos =============

/**
 * Obtiene un resumen legible de todos los códigos de un producto
 */
export function getProductCodesSummary(productCodes: Partial<ODISEOProductCodes>): string {
  const lines: string[] = [];

  lines.push('=== CÓDIGOS DE PRODUCTO ===');
  lines.push('');

  // SKU (Interno ODISEO)
  if (productCodes.skuCode) {
    lines.push('🔒 SKU (Interno ODISEO):');
    lines.push(`   Código: ${productCodes.skuCode}`);
    lines.push(`   Ciclo: ${productCodes.skuLifecycleCode} (${getSKUCycleLabel(productCodes.skuLifecycleCode!)})`);
    lines.push(`   Versión: ${String(productCodes.skuVersion).padStart(2, '0')}`);
    lines.push(`   → No se envía a sistemas externos`);
    lines.push('');
  }

  // EDAG (WebCenter + Sistema Integral)
  if (productCodes.edagCode) {
    lines.push('🌐 EDAG (WebCenter + Sistema Integral):');
    lines.push(`   Código: ${productCodes.edagCode}`);
    lines.push(`   Versión: ${String(productCodes.edagVersion).padStart(2, '0')}`);
    lines.push(`   → Se envía a: WebCenter, Sistema Integral`);
    lines.push('');
  }

  // EM (Solo Sistema Integral)
  if (productCodes.emCode) {
    lines.push('📋 EM (Solo Sistema Integral):');
    lines.push(`   Código: ${productCodes.emCode}`);
    lines.push(`   Versión: ${String(productCodes.emVersion).padStart(2, '0')}`);
    lines.push(`   → Se envía a: Sistema Integral`);
    lines.push('');
  }

  lines.push('=== PAYLOADS GENERADOS ===');
  lines.push('');
  lines.push('WebCenter:');
  if (productCodes.edagCode) {
    lines.push(`  { edagCode: "${productCodes.edagCode}" }`);
  } else {
    lines.push('  (sin EDAG)');
  }
  lines.push('');
  lines.push('Sistema Integral:');
  if (productCodes.edagCode && productCodes.emCode) {
    lines.push(`  { edagCode: "${productCodes.edagCode}", emCode: "${productCodes.emCode}" }`);
  } else {
    lines.push('  (faltan códigos)');
  }

  return lines.join('\n');
}
