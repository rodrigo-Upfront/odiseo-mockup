import type {
  ProductPreliminaryRecord,
  ProductCausal,
  ProductRequestReason,
  ResultOdiseo,
  ValidationRoute,
} from "./productPreliminaryTypes";
import {
  causalRequiresReference,
  reasonRequiresReference,
} from "./productCausalRules";

export type ProductValidationDecision = {
  resultOdiseo: ResultOdiseo;
  validationRoute: ValidationRoute;
  shouldCreateValidationProject: boolean;
  canQuoteDirectly: boolean;
  statusAfterDecision:
    | "Pendiente referencia"
    | "Referencia asignada"
    | "Requiere validación"
    | "Listo para cotizar";
  reason: string;
};

function hasAssignedReference(product: ProductPreliminaryRecord): boolean {
  return Boolean(product.assignedProjectCode && (product.similarityScore ?? 0) >= 70);
}

function addGraphicArtsRoute(route: ValidationRoute): ValidationRoute {
  if (route === "SIN_VALIDACION") return "AG";
  if (route === "RD_DESARROLLO") return "AG_RD_DESARROLLO";
  if (route === "RD_AREA_TECNICA") return "AG_RD_AREA_TECNICA";
  return route;
}

function routeRequiresProject(route: ValidationRoute): boolean {
  return route !== "SIN_VALIDACION";
}

function resolveBaseResultOdiseo(
  reason: ProductRequestReason,
  causal: ProductCausal
): ResultOdiseo {
  if (reason === "Portafolio estándar") return "Sin cambio de SKU";
  if (reason === "ICO / BCP" && causal === "Mismo producto, misma especificación") {
    return "Sin cambio de SKU";
  }

  if (
    causal === "Cambia diseño" ||
    causal === "Nuevo equipamiento / proceso / temperatura"
  ) {
    return "Versiona producto existente";
  }

  if (
    causal === "Modifica dimensiones" ||
    causal === "Modifica propiedades" ||
    causal === "Cambia materia prima" ||
    causal === "Cambio de insumo no homologado"
  ) {
    return "Condicionado";
  }

  return "Nuevo SKU sugerido";
}

function resolveBaseRoute(
  reason: ProductRequestReason,
  causal: ProductCausal,
  hasReference: boolean,
  product: ProductPreliminaryRecord
): ValidationRoute {
  if (reason === "Producto nuevo") {
    if (causal === "Nuevo diseño") {
      return hasReference ? "AG" : "AG_RD_DESARROLLO";
    }

    if (
      causal === "Nueva estructura" ||
      causal === "Nuevos insumos" ||
      causal === "Nuevo formato de envasado"
    ) {
      return "RD_DESARROLLO";
    }
  }

  if (reason === "Producto modificado") {
    if (causal === "Cambia diseño") return "AG";

    if (causal === "Modifica dimensiones") {
      return product.dimensionOutOfTolerance ? "RD_AREA_TECNICA" : "SIN_VALIDACION";
    }

    if (
      causal === "Nuevo equipamiento / proceso / temperatura" ||
      causal === "Modifica propiedades" ||
      causal === "Cambia estructura" ||
      causal === "Cambia materia prima"
    ) {
      return "RD_AREA_TECNICA";
    }
  }

  if (reason === "Extensión de línea") {
    if (causal === "Misma estructura") return "SIN_VALIDACION";
    if (causal === "Cambia dimensión fuera de tolerancia") return "RD_AREA_TECNICA";
    if (causal === "Cambia diseño por variante") return "AG";
  }

  if (reason === "Portafolio estándar") {
    return "SIN_VALIDACION";
  }

  if (reason === "ICO / BCP") {
    if (causal === "Mismo producto, misma especificación") return "SIN_VALIDACION";
    if (causal === "Cambio de insumo no homologado") return "RD_AREA_TECNICA";
  }

  return "SIN_VALIDACION";
}

export function resolveProductValidationDecision(
  product: ProductPreliminaryRecord
): ProductValidationDecision {
  const hasReference = hasAssignedReference(product);
  const requiresReference =
    reasonRequiresReference(product.requestReason) ||
    causalRequiresReference(product.causal);

  if (requiresReference && !hasReference) {
    const route: ValidationRoute =
      product.requestReason === "Producto nuevo"
        ? "RD_DESARROLLO"
        : "RD_AREA_TECNICA";

    const finalRoute =
      product.hasSpecialDesign === "Sí" ? addGraphicArtsRoute(route) : route;

    return {
      resultOdiseo: resolveBaseResultOdiseo(product.requestReason, product.causal),
      validationRoute: finalRoute,
      shouldCreateValidationProject: true,
      canQuoteDirectly: false,
      statusAfterDecision: "Pendiente referencia",
      reason:
        "La causal requiere una referencia aprobada, pero no se seleccionó un proyecto asignado con similitud suficiente.",
    };
  }

  let route = resolveBaseRoute(
    product.requestReason,
    product.causal,
    hasReference,
    product
  );

  if (
    product.hasCriticalTechnicalDifference ||
    product.materialNotHomologated ||
    product.changesFunctionalSpecification
  ) {
    route = product.requestReason === "Producto nuevo"
      ? "RD_DESARROLLO"
      : "RD_AREA_TECNICA";
  }

  if (product.hasSpecialDesign === "Sí") {
    route = addGraphicArtsRoute(route);
  }

  const shouldCreateValidationProject = routeRequiresProject(route);
  const canQuoteDirectly = !shouldCreateValidationProject;

  return {
    resultOdiseo: resolveBaseResultOdiseo(product.requestReason, product.causal),
    validationRoute: route,
    shouldCreateValidationProject,
    canQuoteDirectly,
    statusAfterDecision: canQuoteDirectly ? "Listo para cotizar" : "Requiere validación",
    reason: canQuoteDirectly
      ? "El producto no requiere validación AG/R&D y puede pasar a cotización."
      : "El producto requiere validación AG/R&D antes de cotizar.",
  };
}