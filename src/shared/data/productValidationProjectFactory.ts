import {
  getNextProjectCode,
  saveProjectRecord,
  type ProjectRecord,
} from "./projectStorage";
import {
  updateProductPreliminaryRecord,
} from "./productPreliminaryStorage";
import type {
  ProductPreliminaryRecord,
  ValidationRoute,
} from "./productPreliminaryTypes";

type AnyPortfolioRecord = Record<string, any>;

function getPortfolioValue(portfolio: AnyPortfolioRecord | undefined, keys: string[]): string {
  if (!portfolio) return "";

  for (const key of keys) {
    if (portfolio[key]) return String(portfolio[key]);
  }

  return "";
}

function deriveClassification(product: ProductPreliminaryRecord): string {
  if (product.requestReason === "Producto nuevo") return "Nuevo";
  return "Modificado";
}

function getGraphicArtsStatus(route: ValidationRoute): any {
  if (route === "AG" || route === "AG_RD_DESARROLLO" || route === "AG_RD_AREA_TECNICA") {
    return "En Revisión";
  }

  return "Aprobado automático";
}

function getTechnicalStatus(route: ValidationRoute): any {
  if (
    route === "RD_DESARROLLO" ||
    route === "RD_AREA_TECNICA" ||
    route === "AG_RD_DESARROLLO" ||
    route === "AG_RD_AREA_TECNICA"
  ) {
    return "En Revisión";
  }

  return "Sin solicitar";
}

function getCurrentValidationStep(route: ValidationRoute): any {
  if (route === "AG" || route === "AG_RD_DESARROLLO" || route === "AG_RD_AREA_TECNICA") {
    return "Artes Gráficas";
  }

  if (route === "RD_DESARROLLO") return "R&D Desarrollo";
  if (route === "RD_AREA_TECNICA") return "R&D Técnica";

  return "Sin validación";
}

export function createValidationProjectFromProduct(
  product: ProductPreliminaryRecord,
  portfolio?: AnyPortfolioRecord
): ProjectRecord {
  const now = new Date().toISOString();
  const projectCode = getNextProjectCode();

  const portfolioName = getPortfolioValue(portfolio, [
    "name",
    "nom",
    "portfolioName",
    "nombre",
  ]);

  const clientName =
    product.clientName ||
    getPortfolioValue(portfolio, ["clientName", "cli", "cliente"]);

  const plantName =
    product.plantName ||
    getPortfolioValue(portfolio, ["plantaName", "pl", "plantName"]);

  const project: ProjectRecord = {
    id: projectCode,
    code: projectCode,

    portfolioCode: product.portfolioCode,
    portfolioName,

    clientName,
    projectName: `Validación - ${product.calculatedName || product.commercialName}`,
    projectDescription: `Proyecto de validación generado desde el Producto Preliminar ${product.productCode}. Motivo: ${product.requestReason}. Causal: ${product.causal}.`,

    status: "En validación" as any,
    stage: "P2_VIABILIDAD_TECNICA" as any,
    completionPercentage: 100,

    projectPurpose: "VALIDACION_PRODUCTO",
    sourceProductCode: product.productCode,
    sourcePortfolioCode: product.portfolioCode,
    assignedReferenceProjectCode: product.assignedProjectCode,
    validationRoute: product.validationRoute,

    classification: deriveClassification(product),
    projectType: product.causal,

    plantaName: plantName,
    wrappingName: product.wrappingName,
    envoltura: product.wrappingName,
    useFinalName: product.useFinalName,
    usoFinal: product.useFinalName,
    maquinaCliente: product.packingMachineName,
    packingMachineName: product.packingMachineName,

    structureType: product.structureType,
    layers: product.structureSummary,
    layer1Material: product.layers[0]?.material || "",
    layer2Material: product.layers[1]?.material || "",
    layer3Material: product.layers[2]?.material || "",
    layer4Material: product.layers[3]?.material || "",

    estimatedVolume: product.quoteQuantity,
    unitOfMeasure: product.quoteUnit,

    requiereValidacion: true,
    validacionSolicitada: true,
    fechaSolicitudValidacion: now,
    estadoValidacionGeneral: "En validación" as any,
    validaciones: [],

    graphicArtsValidationStatus: getGraphicArtsStatus(product.validationRoute),
    technicalValidationStatus: getTechnicalStatus(product.validationRoute),
    currentValidationStep: getCurrentValidationStep(product.validationRoute),

    validationRequestedAt: now,
    statusUpdatedAt: now,
    stageUpdatedAt: now,

    createdAt: now,
    updatedAt: now,
  } as unknown as ProjectRecord;

  saveProjectRecord(project);

  updateProductPreliminaryRecord(product.productCode, {
    status: "En validación",
    validationProjectCode: projectCode,
  });

  return project;
}