// src/shared/data/productCausalRules.ts

import type {
  ProductRequestReason,
  ProductCausal,
} from "./productPreliminaryTypes";

/**
 * Motivos disponibles para registrar un Producto Preliminar.
 */
export const PRODUCT_REQUEST_REASONS: ProductRequestReason[] = [
  "Producto nuevo",
  "Producto modificado",
  "Extensión de línea",
  "Portafolio estándar",
  "ICO / BCP",
];

/**
 * Causales permitidas por cada motivo.
 *
 * Regla:
 * - El Motivo controla las opciones disponibles en Causal.
 * - Si cambia el Motivo, el formulario debe limpiar la Causal seleccionada.
 */
export const CAUSAL_RULES: Record<ProductRequestReason, ProductCausal[]> = {
  "Producto nuevo": [
    "Nueva estructura",
    "Nuevos insumos",
    "Nuevo formato de envasado",
    "Nuevo diseño",
  ],

  "Producto modificado": [
    "Nuevo equipamiento / proceso / temperatura",
    "Modifica dimensiones",
    "Modifica propiedades",
    "Cambia estructura",
    "Cambia materia prima",
    "Cambia diseño",
  ],

  "Extensión de línea": [
    "Misma estructura",
    "Cambia dimensión fuera de tolerancia",
    "Cambia diseño por variante",
  ],

  "Portafolio estándar": [
    "Referencia aprobada sin cambios",
  ],

  "ICO / BCP": [
    "Mismo producto, misma especificación",
    "Cambio de insumo no homologado",
  ],
};

/**
 * Alias para compatibilidad con archivos que ya importen CAUSALS_BY_REASON.
 * Mantener mientras migras el código.
 */
export const CAUSALS_BY_REASON = CAUSAL_RULES;

/**
 * Retorna las causales permitidas según el motivo seleccionado.
 */
export function getCausalsByReason(
  reason?: ProductRequestReason | string
): ProductCausal[] {
  if (!reason) return [];

  return CAUSAL_RULES[reason as ProductRequestReason] || [];
}

/**
 * Valida si una causal pertenece al motivo seleccionado.
 */
export function isCausalAllowedForReason(
  reason: ProductRequestReason | string,
  causal: ProductCausal | string
): boolean {
  return getCausalsByReason(reason).includes(causal as ProductCausal);
}

/**
 * Causales que requieren una referencia aprobada / proyecto asignado.
 *
 * No significa que siempre se bloquee el flujo.
 * Significa que ODISEO debe intentar buscar una referencia aprobada
 * y, si no la encuentra, debe crear o recomendar un Proyecto de Validación.
 */
const CAUSALS_REQUIRING_REFERENCE: ProductCausal[] = [
  // Producto nuevo con referencia técnica deseable/obligatoria
  "Nuevos insumos",
  "Nuevo formato de envasado",
  "Nuevo diseño",

  // Producto modificado siempre parte de una referencia existente
  "Nuevo equipamiento / proceso / temperatura",
  "Modifica dimensiones",
  "Modifica propiedades",
  "Cambia estructura",
  "Cambia materia prima",
  "Cambia diseño",

  // Extensión de línea siempre parte de un producto/proyecto base
  "Misma estructura",
  "Cambia dimensión fuera de tolerancia",
  "Cambia diseño por variante",

  // Portafolio estándar
  "Referencia aprobada sin cambios",

  // ICO / BCP
  "Mismo producto, misma especificación",
  "Cambio de insumo no homologado",
];

/**
 * Indica si una causal requiere búsqueda de referencia.
 */
export function causalRequiresReference(
  causal?: ProductCausal | string
): boolean {
  if (!causal) return false;

  return CAUSALS_REQUIRING_REFERENCE.includes(causal as ProductCausal);
}

/**
 * Motivos que normalmente requieren una referencia aprobada.
 *
 * Producto nuevo no siempre requiere referencia, porque puede ser una nueva estructura.
 */
const REASONS_REQUIRING_REFERENCE: ProductRequestReason[] = [
  "Producto modificado",
  "Extensión de línea",
  "Portafolio estándar",
  "ICO / BCP",
];

/**
 * Indica si un motivo requiere búsqueda de referencia.
 */
export function reasonRequiresReference(
  reason?: ProductRequestReason | string
): boolean {
  if (!reason) return false;

  return REASONS_REQUIRING_REFERENCE.includes(reason as ProductRequestReason);
}

// ============================================================================
// TEXTOS DE AYUDA PARA UI
// ============================================================================

/**
 * Texto de ayuda para explicar el campo Motivo.
 */
export function getReasonHelpText(
  reason?: ProductRequestReason | string
): string {
  switch (reason) {
    case "Producto nuevo":
      return "Se usa cuando el producto solicitado no existe como producto comercial para esta oportunidad, presentación o portafolio.";

    case "Producto modificado":
      return "Se usa cuando ya existe un producto, SKU, ficha o proyecto aprobado y se modificará alguna característica.";

    case "Extensión de línea":
      return "Se usa cuando se crean variantes a partir de un producto base aprobado, manteniendo una lógica común.";

    case "Portafolio estándar":
      return "Se usa cuando se toma una referencia aprobada sin cambios para ir directo a cotización.";

    case "ICO / BCP":
      return "Se usa para continuidad operativa, intercompany, abastecimiento alternativo o contingencia.";

    default:
      return "";
  }
}

/**
 * Texto de ayuda para explicar el campo Causal.
 */
export function getCausalHelpText(
  causal?: ProductCausal | string
): string {
  switch (causal) {
    case "Nueva estructura":
      return "Aplica cuando se define una nueva composición técnica del producto: materiales, capas, micrajes, barrera o sellante. Puede cambiar dimensiones, accesorios y diseño.";

    case "Nuevos insumos":
      return "Aplica cuando se mantiene la estructura base, diseño, dimensiones críticas y accesorios, pero cambia un insumo equivalente o de la misma familia.";

    case "Nuevo formato de envasado":
      return "Aplica cuando se mantiene la estructura técnica, pero cambia la presentación física del empaque: formato, ancho, largo, fuelle, configuración o accesorios.";

    case "Nuevo diseño":
      return "Aplica cuando se mantiene estructura, materiales, capas, dimensiones críticas, accesorios y propiedades. Solo cambia el diseño gráfico.";

    case "Nuevo equipamiento / proceso / temperatura":
      return "Aplica cuando existe un producto aprobado y no cambia su estructura, diseño ni dimensiones, pero será usado en una nueva máquina, proceso, temperatura o condición operativa del cliente.";

    case "Modifica dimensiones":
      return "Aplica cuando existe un producto base aprobado y cambian medidas como ancho, largo, fuelle, diámetro, capacidad, espesor o tolerancias.";

    case "Modifica propiedades":
      return "Aplica cuando existe un producto base aprobado, pero cambia una propiedad funcional: barrera, rigidez, resistencia, sellabilidad, transparencia o desempeño.";

    case "Cambia estructura":
      return "Aplica cuando existe un producto base aprobado, pero cambia la composición técnica: capas, materiales, secuencia, micraje por capa, barrera o sellante.";

    case "Cambia materia prima":
      return "Aplica cuando se reemplaza, elimina o incorpora una materia prima respecto al producto base.";

    case "Cambia diseño":
      return "Aplica cuando existe un producto, SKU o ficha aprobada y solo cambia el diseño gráfico: arte, colores, logo, código de empaque, textos o pie de imprenta.";

    case "Misma estructura":
      return "Aplica cuando se crean variantes de un producto base validado, manteniendo estructura, materiales, capas, propiedades críticas y condiciones de uso.";

    case "Cambia dimensión fuera de tolerancia":
      return "Aplica cuando la variante mantiene la estructura base, pero una dimensión sale del rango permitido o puede afectar fabricación, sellado, desempeño o uso.";

    case "Cambia diseño por variante":
      return "Aplica cuando las variantes mantienen la misma estructura técnica, pero cada una tiene arte, logo, color, sabor, texto o código gráfico distinto.";

    case "Referencia aprobada sin cambios":
      return "Aplica cuando se toma un producto aprobado existente y no se modifica diseño, estructura, materiales, dimensiones, propiedades ni condiciones de uso.";

    case "Mismo producto, misma especificación":
      return "Aplica cuando se mantiene exactamente el mismo producto y especificación, pero el caso responde a continuidad operativa, intercompany, abastecimiento alternativo o contingencia.";

    case "Cambio de insumo no homologado":
      return "Aplica cuando por continuidad operativa o abastecimiento se propone usar un insumo alternativo que aún no está homologado.";

    default:
      return "";
  }
}

/**
 * Texto resumido del resultado funcional esperado en ODISEO.
 *
 * Importante:
 * - No reemplaza el enum ResultOdiseo.
 * - Solo sirve para mostrar ayuda al usuario.
 */
export function getCausalResultText(
  causal?: ProductCausal | string
): string {
  switch (causal) {
    case "Nueva estructura":
      return "Nuevo SKU sugerido.";

    case "Nuevos insumos":
      return "Nuevo SKU sugerido.";

    case "Nuevo formato de envasado":
      return "Nuevo SKU sugerido.";

    case "Nuevo diseño":
      return "Nuevo SKU sugerido.";

    case "Nuevo equipamiento / proceso / temperatura":
      return "Sin cambio de SKU / versiona validación de aplicación.";

    case "Modifica dimensiones":
      return "Condicionado: versiona si está dentro de tolerancia; nuevo SKU sugerido si sale de tolerancia o crea otra presentación.";

    case "Modifica propiedades":
      return "Condicionado: versiona si queda dentro de especificación; nuevo SKU sugerido si cambia especificación funcional.";

    case "Cambia estructura":
      return "Nuevo SKU sugerido / nueva versión técnica, según decisión de SI y R&D.";

    case "Cambia materia prima":
      return "Condicionado: versiona si es equivalente u homologada; nuevo SKU sugerido si cambia desempeño o especificación.";

    case "Cambia diseño":
      return "Versiona producto existente.";

    case "Misma estructura":
      return "Nuevo SKU sugerido por variante comercial.";

    case "Cambia dimensión fuera de tolerancia":
      return "Nuevo SKU sugerido.";

    case "Cambia diseño por variante":
      return "Nuevo SKU sugerido si la variante se vende/gestiona separada; versiona si solo reemplaza arte de una variante existente.";

    case "Referencia aprobada sin cambios":
      return "Sin cambio de SKU / cotización directa con referencia aprobada.";

    case "Mismo producto, misma especificación":
      return "Sin cambio de SKU / gestión operativa.";

    case "Cambio de insumo no homologado":
      return "Condicionado: versiona si R&D homologa equivalencia; nuevo SKU sugerido si cambia especificación.";

    default:
      return "";
  }
}