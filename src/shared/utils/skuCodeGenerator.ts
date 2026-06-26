/**
 * Gestor de generación automática de códigos SKU
 * Integra las reglas de negocio con el flujo de creación/modificación de productos
 */

import {
  generateNewProductSKU,
  generateModifiedProductSKU,
  approveSKU,
  markSKUAsBase,
  inactivateSKU,
  formatSKU,
  parseSKUCode,
  validateSKUCode,
  getNextCorrelativo,
  type SKULifecycle,
} from './skuCodeRules';

export interface SKUGenerationContext {
  classification: 'Producto Nuevo' | 'Producto Modificado' | '';
  projectType: string;
  baseSKUCode?: string;
  currentSKUCode?: string;
  allExistingSKUs?: string[];
  isApprovalFlow?: boolean;
  isBaseMarkingFlow?: boolean;
  isInactivationFlow?: boolean;
}

/**
 * Genera automáticamente un nuevo SKU según el contexto del producto
 */
export function generateAutoSKU(context: SKUGenerationContext): {
  skuCode: string | null;
  reason: string;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar contexto mínimo
  if (!context.classification) {
    errors.push('Clasificación requerida para generar SKU');
    return { skuCode: null, reason: 'Error: clasificación no especificada', errors };
  }

  // Flujo de Aprobación
  if (context.isApprovalFlow && context.currentSKUCode) {
    const approved = approveSKU(context.currentSKUCode);
    if (!approved) {
      errors.push('No se puede aprobar este SKU (debe estar en estado E)');
      return {
        skuCode: null,
        reason: 'Error al aprobar SKU',
        errors,
      };
    }
    return {
      skuCode: approved,
      reason: `SKU aprobado: ${context.currentSKUCode} → ${approved}`,
      errors: [],
    };
  }

  // Flujo de Marcación como Base
  if (context.isBaseMarkingFlow && context.currentSKUCode) {
    const asBase = markSKUAsBase(context.currentSKUCode);
    if (!asBase) {
      errors.push('No se puede marcar como Base este SKU (debe estar en estado E)');
      return {
        skuCode: null,
        reason: 'Error al marcar como Base',
        errors,
      };
    }
    return {
      skuCode: asBase,
      reason: `SKU marcado como Base: ${context.currentSKUCode} → ${asBase}`,
      errors: [],
    };
  }

  // Flujo de Inactivación
  if (context.isInactivationFlow && context.currentSKUCode) {
    const inactive = inactivateSKU(context.currentSKUCode);
    if (!inactive) {
      errors.push('No se puede inactivar este SKU');
      return {
        skuCode: null,
        reason: 'Error al inactivar SKU',
        errors,
      };
    }
    return {
      skuCode: inactive,
      reason: `SKU inactivado: ${context.currentSKUCode} → ${inactive}`,
      errors: [],
    };
  }

  // Producto Nuevo
  if (context.classification === 'Producto Nuevo') {
    const nextCorrelativo = getNextCorrelativo(context.allExistingSKUs || []);
    const newSKU = generateNewProductSKU(nextCorrelativo);
    return {
      skuCode: newSKU,
      reason: `Nuevo producto: correlativo ${String(nextCorrelativo).padStart(5, '0')} generado`,
      errors: [],
    };
  }

  // Producto Modificado
  if (context.classification === 'Producto Modificado') {
    if (!context.baseSKUCode) {
      errors.push('Se requiere SKU base para generar SKU de producto modificado');
      return {
        skuCode: null,
        reason: 'Error: SKU base no especificado',
        errors,
      };
    }

    const baseParsed = parseSKUCode(context.baseSKUCode);
    if (!baseParsed.valid) {
      errors.push(`SKU base inválido: ${baseParsed.error}`);
      return {
        skuCode: null,
        reason: 'Error: SKU base inválido',
        errors,
      };
    }

    const newSKU = generateModifiedProductSKU(context.baseSKUCode);
    if (!newSKU) {
      errors.push('No se puede generar SKU modificado (versión máxima alcanzada)');
      return {
        skuCode: null,
        reason: 'Error al generar SKU modificado',
        errors,
      };
    }

    return {
      skuCode: newSKU,
      reason: `Producto modificado: ${context.baseSKUCode} → ${newSKU}`,
      errors: [],
    };
  }

  return {
    skuCode: null,
    reason: 'Tipo de clasificación no reconocido',
    errors: ['Clasificación no soportada'],
  };
}

/**
 * Valida que un SKU sea apropiado para una acción específica
 */
export function validateSKUForAction(
  action: 'approve' | 'markAsBase' | 'inactivate',
  skuCode: string
): { canProceed: boolean; message: string } {
  const validation = validateSKUCode(skuCode);
  if (!validation.valid) {
    return {
      canProceed: false,
      message: `SKU inválido: ${validation.errors.join(', ')}`,
    };
  }

  const parsed = parseSKUCode(skuCode);

  switch (action) {
    case 'approve':
      if (parsed.cycle !== 'E') {
        return {
          canProceed: false,
          message: `No se puede aprobar un SKU en estado ${parsed.cycle}. Solo estado E puede ser aprobado.`,
        };
      }
      return { canProceed: true, message: 'SKU listo para aprobación' };

    case 'markAsBase':
      if (parsed.cycle !== 'E') {
        return {
          canProceed: false,
          message: `No se puede marcar como Base un SKU en estado ${parsed.cycle}. Solo estado E puede ser marcado como Base.`,
        };
      }
      return { canProceed: true, message: 'SKU listo para marcar como Base' };

    case 'inactivate':
      if (parsed.cycle === 'I') {
        return {
          canProceed: false,
          message: 'Este SKU ya está inactivo',
        };
      }
      return { canProceed: true, message: 'SKU listo para inactivación' };

    default:
      return { canProceed: false, message: 'Acción no reconocida' };
  }
}

/**
 * Obtiene información legible de un SKU
 */
export function getSKUInfo(skuCode: string): {
  valid: boolean;
  correlativo: string;
  cycle: string;
  cycleLabel: string;
  version: string;
  formatted: string;
} | null {
  const parsed = parseSKUCode(skuCode);
  if (!parsed.valid) return null;

  const cycleLabels: Record<SKULifecycle, string> = {
    E: 'Preliminar',
    B: 'Base',
    A: 'Aprobado',
    I: 'Inactivo',
  };

  return {
    valid: true,
    correlativo: String(parsed.correlativo).padStart(5, '0'),
    cycle: parsed.cycle,
    cycleLabel: cycleLabels[parsed.cycle],
    version: String(parsed.version).padStart(2, '0'),
    formatted: skuCode,
  };
}
