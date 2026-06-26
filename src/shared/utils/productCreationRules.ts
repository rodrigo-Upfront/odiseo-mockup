/**
 * Business rules for product creation in ODISEO
 * Manages validation requirements based on request type and causal
 */

export type TipoSolicitud = "Producto nuevo" | "Producto modificado" | "Extensión de línea" | "ICO / BCP";
export type SkuLifecycleCode = "A" | "E" | "B" | "P";

/**
 * Determines if the "Producto base / SKU vigente" field is required
 * for a given request type and causal combination
 */
export function requiresOriginProduct(tipoSolicitud: TipoSolicitud, causal: string): boolean {
  // Only "Producto nuevo + Nueva estructura" allows creation without origin product
  if (tipoSolicitud === "Producto nuevo" && causal === "Nueva estructura") {
    return false;
  }

  return true;
}

/**
 * Returns the allowed SKU lifecycle codes that can be used as origin
 * for a given request type and causal combination
 */
export function getAllowedOriginLifecycle(tipoSolicitud: TipoSolicitud, causal: string): SkuLifecycleCode[] {
  if (tipoSolicitud === "Producto nuevo") {
    if (causal === "Nueva estructura") {
      // Can optionally use any approved product as reference
      return ["A", "B"];
    }
    // Other causals require Base products
    return ["B"];
  }

  if (tipoSolicitud === "Producto modificado") {
    // Must use only Approved products
    return ["A"];
  }

  if (tipoSolicitud === "Extensión de línea") {
    // Can use approved or base products
    return ["A", "B"];
  }

  if (tipoSolicitud === "ICO / BCP") {
    // Can use approved or base products
    return ["A", "B"];
  }

  return [];
}

/**
 * Returns contextual help text based on request type and causal
 */
export function getOriginProductHelpText(tipoSolicitud: TipoSolicitud, causal: string): string {
  if (tipoSolicitud === "Producto nuevo" && causal === "Nueva estructura") {
    return "Puedes iniciar una nueva estructura desde cero o seleccionar una referencia técnica opcional.";
  }

  if (tipoSolicitud === "Producto nuevo") {
    return "Selecciona un producto base aprobado para reutilizar la estructura técnica.";
  }

  if (tipoSolicitud === "Producto modificado") {
    return "Selecciona un SKU aprobado / dado de alta como origen de la modificación.";
  }

  if (tipoSolicitud === "Extensión de línea") {
    return "Selecciona un producto base o SKU aprobado para evaluar la nueva presentación.";
  }

  if (tipoSolicitud === "ICO / BCP") {
    return "Selecciona un producto base o SKU existente para evaluar el cambio de insumo.";
  }

  return "";
}

/**
 * Returns the label for the "Producto base / SKU vigente" field
 */
export function getOriginProductLabel(tipoSolicitud: TipoSolicitud, _causal: string): string {
  if (tipoSolicitud === "Producto modificado") {
    return "SKU aprobado a modificar";
  }

  return "Producto base / SKU vigente";
}

/**
 * Validates if a selected origin product is allowed for the given request type and causal
 */
export function isOriginProductAllowed(
  tipoSolicitud: TipoSolicitud,
  causal: string,
  originProductLifecycle: SkuLifecycleCode | undefined
): { valid: boolean; message?: string } {
  if (!requiresOriginProduct(tipoSolicitud, causal)) {
    // Origin product is optional, so undefined is valid
    if (!originProductLifecycle) {
      return { valid: true };
    }
  }

  if (requiresOriginProduct(tipoSolicitud, causal) && !originProductLifecycle) {
    const label = getOriginProductLabel(tipoSolicitud, causal);
    return {
      valid: false,
      message: `${label} es requerido para continuar.`,
    };
  }

  const allowedCodes = getAllowedOriginLifecycle(tipoSolicitud, causal);

  if (originProductLifecycle && !allowedCodes.includes(originProductLifecycle)) {
    const lifecycleLabels: Record<SkuLifecycleCode, string> = {
      A: "Aprobado",
      B: "Base",
      E: "Muestra",
      P: "Portafolio estándar",
    };

    return {
      valid: false,
      message: `El producto origen debe ser de tipo ${allowedCodes.map((c) => lifecycleLabels[c]).join(" o ")} para este tipo de solicitud.`,
    };
  }

  return { valid: true };
}

/**
 * Returns the initial suggested SKU lifecycle code for a new product
 */
export function getInitialSuggestedSkuLifecycle(): SkuLifecycleCode {
  // New products typically start as "Muestra" (Sample)
  return "E";
}
