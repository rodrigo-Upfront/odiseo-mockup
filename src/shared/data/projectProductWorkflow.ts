/* ============================================================================
   WORKFLOW DE PRODUCTO PRELIMINAR - MÓDULO DE PROYECTOS ODISEO

   Este archivo centraliza toda la lógica de estados del Producto Preliminar.
   Los Productos Preliminares son fichas de producto a cotizar.
   No son SKU técnicos — esos son responsabilidad del Sistema Integral.
   ============================================================================ */

// ============================================================================
// TIPOS DE PRODUCTO PRELIMINAR
// ============================================================================

export type PreliminaryProductStatus =
  | "Registrado"
  | "Listo para cotizar"
  | "En Cotización"
  | "Cotizado"
  | "Aprobado por Cliente"
  | "Alta"
  | "Desestimado";

export type PreliminaryProductType = "Base" | "Variación";

export type ProjectProductSummaryStatus =
  | "Sin productos"
  | "Producto base registrado"
  | "Con variaciones"
  | "En cotización"
  | "Cotización completa"
  | "Aprobados"
  | "Alta parcial"
  | "Alta completa"
  | "Con desestimados";

// ============================================================================
// FUNCIONES DE NORMALIZACIÓN
// ============================================================================

/**
 * Normaliza estados antiguos de producto al modelo oficial
 */
export function normalizePreliminaryProductStatus(
  rawStatus?: string
): PreliminaryProductStatus {
  if (!rawStatus) return "Registrado";

  const status = String(rawStatus).trim().toLowerCase();

  if (status.includes("registr")) return "Registrado";
  if (status.includes("generado") || status.includes("variación generada"))
    return "Registrado";
  if (status.includes("listo") && status.includes("cotizar"))
    return "Listo para cotizar";
  if (status.includes("en cotización") || status.includes("cotizando"))
    return "En Cotización";
  if (status.includes("cotizado")) return "Cotizado";
  if (status.includes("aprobado") && status.includes("cliente"))
    return "Aprobado por Cliente";
  if (status.includes("aprobado")) return "Aprobado por Cliente"; // Migration from old "Aprobado"
  if (status.includes("alta") || status.includes("dado de alta"))
    return "Alta";
  if (status.includes("desestim")) return "Desestimado";

  return "Registrado";
}

// ============================================================================
// FUNCIONES DE TRANSICIÓN Y VALIDACIÓN
// ============================================================================

/**
 * Verifica si se puede crear una variación desde un producto
 */
export function canCreateVariation(
  productStatus: PreliminaryProductStatus,
  isBaseProduct?: boolean
): boolean {
  if (isBaseProduct) return true;
  return productStatus === "Aprobado por Cliente" || productStatus === "Alta";
}

/**
 * Verifica si un campo está bloqueado en variaciones
 */
export function isLockedField(fieldName: string): boolean {
  const lockedFields = [
    "structureType",
    "blueprintFormat",
    "printType",
    "printClass",
    "layer1Material",
    "layer1Micron",
    "layer1Grammage",
    "layer2Material",
    "layer2Micron",
    "layer2Grammage",
    "layer3Material",
    "layer3Micron",
    "layer3Grammage",
    "layer4Material",
    "layer4Micron",
    "layer4Grammage",
    "grammage",
    "grammageTolerance",
    "referenceEmCode",
    "referenceEmVersion",
    "bomReference",
  ];
  return lockedFields.includes(fieldName);
}

// ============================================================================
// FUNCIONES DE RESUMEN Y ESTADO
// ============================================================================

/**
 * Calcula el estado resumen de productos del proyecto
 */
export function computeProjectProductSummaryStatus(
  products: any[]
): ProjectProductSummaryStatus {
  if (products.length === 0) {
    return "Sin productos";
  }

  const hasBase = products.some((p) => p.isBaseProduct);
  const hasVariations = products.some((p) => p.isDerived);
  const hasDesestimados = products.some((p) => p.status === "Desestimado");
  const inQuote = products.some((p) => p.status === "En Cotización" || p.status === "Cotizado");
  const approved = products.filter((p) => p.status === "Aprobado por Cliente");
  const alta = products.filter((p) => p.status === "Alta");
  const activeProducts = products.filter((p) => p.status !== "Desestimado");

  if (hasDesestimados && activeProducts.length > 0) {
    return "Con desestimados";
  }

  if (alta.length === activeProducts.length && activeProducts.length > 0) {
    return "Alta completa";
  }

  if (alta.length > 0 && activeProducts.length > 0) {
    return "Alta parcial";
  }

  if (approved.length === activeProducts.length && activeProducts.length > 0) {
    return "Aprobados";
  }

  if (inQuote) {
    return "En cotización";
  }

  if (hasVariations) {
    return "Con variaciones";
  }

  if (hasBase && !hasVariations) {
    return "Producto base registrado";
  }

  return "Sin productos";
}

/**
 * Retorna las acciones disponibles para un estado de producto preliminar
 */
export function getActionsForProductStatus(
  status: PreliminaryProductStatus
): string[] {
  switch (status) {
    case "Registrado":
      return ["editar", "seleccionar-cotizacion", "crear-variacion", "desestimar"];

    case "Listo para cotizar":
      return ["editar", "enviar-cotizacion", "crear-variacion", "desestimar"];

    case "En Cotización":
      return [
        "editar",
        "registrar-cotizacion-completada",
        "crear-variacion",
        "desestimar",
      ];

    case "Cotizado":
      return ["crear-variacion", "marcar-aprobado", "desestimar"];

    case "Aprobado por Cliente":
      return ["crear-variacion", "marcar-alta", "desestimar"];

    case "Alta":
      return ["crear-variacion"];

    case "Desestimado":
      return ["ver-motivo"];

    default:
      return [];
  }
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN PARA LICITACIÓN
// ============================================================================

/**
 * Verifica si se puede crear un nuevo producto preliminar basado en la licitación
 * Si es licitación (LICITACIÓN = Sí), verifica que no se excedan los N ítems
 */
export function canCreatePreliminaryProduct(
  project: any,
  products: any[]
): {
  allowed: boolean;
  message: string;
} {
  const activeProducts = products.filter(
    (product) => product.status !== "Desestimado"
  );

  if (
    project.status !== "Validado" &&
    project.status !== "Productos preliminares"
  ) {
    return {
      allowed: false,
      message:
        "Solo se pueden crear productos preliminares cuando el proyecto está validado.",
    };
  }

  if (project.licitacion === "Sí") {
    const requiredItems = Number(project.numeroItemsLicitacion || 0);

    if (requiredItems <= 0) {
      return {
        allowed: false,
        message:
          "La licitación no tiene configurado el N° de ítems.",
      };
    }

    if (activeProducts.length >= requiredItems) {
      return {
        allowed: false,
        message:
          `Esta licitación tiene ${requiredItems} ítems. Ya se registraron todos los productos preliminares permitidos.`,
      };
    }
  }

  return {
    allowed: true,
    message: "",
  };
}

/**
 * Verifica si se pueden enviar productos preliminares a cotización
 * Si es licitación, todos los productos activos deben enviarse (no permite selección parcial)
 * Si no es licitación, se envían solo los seleccionados
 */
export function canSendProductsToQuote(
  project: any,
  products: any[]
): {
  allowed: boolean;
  message: string;
  productsToQuote: any[];
} {
  const activeProducts = products.filter(
    (product) => product.status !== "Desestimado"
  );

  if (activeProducts.length === 0) {
    return {
      allowed: false,
      message:
        "Debe existir al menos un producto preliminar para enviar a cotizar.",
      productsToQuote: [],
    };
  }

  if (project.licitacion === "Sí") {
    const requiredItems = Number(project.numeroItemsLicitacion || 0);

    if (requiredItems <= 0) {
      return {
        allowed: false,
        message:
          "La licitación no tiene configurado el N° de ítems.",
        productsToQuote: [],
      };
    }

    if (activeProducts.length < requiredItems) {
      return {
        allowed: false,
        message:
          `La licitación requiere ${requiredItems} ítems. Actualmente hay ${activeProducts.length} productos preliminares registrados. Debe registrar los ${requiredItems} productos antes de solicitar cotización.`,
        productsToQuote: [],
      };
    }

    if (activeProducts.length > requiredItems) {
      return {
        allowed: false,
        message:
          `La licitación tiene configurados ${requiredItems} ítems, pero existen ${activeProducts.length} productos preliminares activos. Ajuste la cantidad antes de solicitar cotización.`,
        productsToQuote: [],
      };
    }

    const notReady = activeProducts.filter(
      (product) => product.status !== "Registrado" && product.status !== "Listo para cotizar"
    );

    if (notReady.length > 0) {
      return {
        allowed: false,
        message:
          "Todos los productos preliminares de la licitación deben estar registrados y listos para cotizar.",
        productsToQuote: [],
      };
    }

    return {
      allowed: true,
      message: "",
      productsToQuote: activeProducts,
    };
  }

  const selectedProducts = activeProducts.filter(
    (product) => (product as any).selectedForQuote
  );

  if (selectedProducts.length === 0) {
    return {
      allowed: false,
      message:
        "Selecciona al menos un producto preliminar para cotizar.",
      productsToQuote: [],
    };
  }

  const notReadySelected = selectedProducts.filter(
    (product) => product.status !== "Registrado" && product.status !== "Listo para cotizar"
  );

  if (notReadySelected.length > 0) {
    return {
      allowed: false,
      message:
        "Los productos seleccionados deben estar registrados y listos para cotizar.",
      productsToQuote: [],
    };
  }

  return {
    allowed: true,
    message: "",
    productsToQuote: selectedProducts,
  };
}
