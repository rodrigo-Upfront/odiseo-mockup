import * as XLSX from "xlsx";
import type { ProjectRecord } from "../data/projectStorage";
import type { PortfolioRecord } from "../data/portfolioStorage";
import type { ProjectPreliminaryProductRecord } from "../data/projectProductStorage";

function pickValue(...values: (string | number | boolean | undefined | null)[]): string {
  for (const v of values) {
    if (v != null && v !== "" && v !== false) return String(v);
  }
  return "";
}

function boolStr(v: boolean | "Sí" | "No" | string | undefined | null): string {
  if (v === true || v === "Sí") return "Sí";
  if (v === false || v === "No") return "No";
  return "";
}

function getCommercialExecutive(
  project: ProjectRecord,
  portfolio: PortfolioRecord | null
): string {
  return pickValue(
    project.ejecutivoName,
    (project as any).ejecutivoNames,
    (project as any).ejecutivoComercial,
    (project as any).comercialExecutive,
    (project as any).salesExecutiveName,
    (project as any).salesExecutive,
    (portfolio as any)?.ejecutivoName,
    (portfolio as any)?.ejecutivoNames,
    (portfolio as any)?.ejecutivoComercial,
    (portfolio as any)?.comercialExecutive,
    (portfolio as any)?.executiveName,
    (portfolio as any)?.salesExecutiveName,
    (portfolio as any)?.salesExecutive,
    (portfolio as any)?.executiveNameLabel,
    (portfolio as any)?.salesExecutiveLabel
  );
}

function buildQuotationExportRow(
  product: ProjectPreliminaryProductRecord,
  project: ProjectRecord,
  portfolio: PortfolioRecord | null
): Record<string, string> {
  return {
    "Código Portafolio": portfolio?.codigo || project.portfolioCode || "",
    "Planta de Origen": project.plantaName || "",
    "Nombre del Cliente": project.clientName || "",
    "Ejecutivo Comercial": getCommercialExecutive(project, portfolio),
    "Portafolio del Cliente": portfolio?.codigo || project.portfolioName || "",
    "Envoltura": pickValue(portfolio?.envoltura, project.wrappingName, project.envoltura),
    "Código Proyecto": project.code || "",
    "Acción Salesforce": project.salesforceAction || "",
    "Nombre de Proyecto": project.projectName || "",
    "Clasificación": project.classification || "",
    "SubClasificación": project.subClassification || "",
    "Tipo de Proyecto": pickValue(project.projectType, project.tipoProyecto),
    "Responsable Commercial Finance": project.commercialFinanceResponsible || "",
    "Formato de Plano": pickValue(product.blueprintFormat, project.blueprintFormat),
    "Aplicación Técnica": pickValue(product.technicalApplication, product.aplicacionTecnica, project.technicalApplication),
    "Uso Final (autocompletado)": pickValue(
      (portfolio as any)?.usoFinal,
      project.useFinalName,
      project.usoFinal
    ),
    "Sub-segmento (autocompletado)": pickValue((portfolio as any)?.subSegmento, project.subSegment),
    "Segmento (autocompletado)": pickValue((portfolio as any)?.segmento, project.segment),
    "Sector (autocompletado)": pickValue(portfolio?.sector, project.sector),
    "AFMarketID (autocompletado)": pickValue(portfolio?.afMarketId, project.afMarketId),
    "Cantidades (Volumen Estimado)": pickValue(product.estimatedVolume, project.estimatedVolume),
    "Unidad de Medida": pickValue(product.unitOfMeasure, project.unitOfMeasure),
    "Código de Empaque del Cliente (Opcional)": pickValue(
      product.customerPackingCode,
      (product as any).customerPackagingCode,
      project.customerPackingCode,
      (project as any).clientPackagingCode
    ),
    "Clase de Impresión": pickValue(product.printClass, project.printClass),
    "Tipo de Impresión": pickValue(product.printType, project.printType),
    "¿Es un Diseño ya Trabajado?": boolStr(project.isPreviousDesign),
    "Cód. EDAG del Diseño Trabajado": pickValue(
      project.previousEdagCode,
      project.edagCode
    ),
    "Versión de Cód. EDAG del Diseño Trabajado": pickValue(
      project.previousEdagVersion,
      project.edagVersion
    ),
    "Especificaciones de Diseño Especiales": project.specialDesignSpecs || "",
    "Comentarios de Diseño Especiales": project.specialDesignComments || "",
    "¿Tiene Archivos Digitales?": boolStr(project.hasDigitalFiles),
    "Archivos de Trabajo de Arte Adjuntos": project.artworkAttachments || "",
    "¿Requiere Trabajo de Diseño?": boolStr(project.requiresDesignWork),
    "¿Tiene Estructura de Referencia? (EM)": boolStr(project.hasReferenceStructure),
    "Código E/M referencia": pickValue(product.referenceEmCode, project.referenceEmCode),
    "Versión E/M": pickValue(product.referenceEmVersion, project.referenceEmVersion),
    "Tipo de Estructura": pickValue(product.structureType, project.structureType),
    "¿Tiene Especificación Técnica del Cliente?": boolStr(project.hasCustomerTechnicalSpec),
    "Especificación Técnica del Cliente Adjunto": project.customerTechnicalSpecAttachment || "",
    "Capa 1 - Tipo de Material y micraje": pickValue(
      product.layer1Material,
      project.layer1Material
    ),
    "Número de Micraje (Polietileno) - Capa 1": pickValue(
      product.layer1Micron,
      project.layer1Micron
    ),
    "Gramaje Capa 1 (g/m2)": pickValue(product.layer1Grammage, project.layer1Grammage),
    "Capa 2 - Tipo de Material y Micraje": pickValue(
      product.layer2Material,
      project.layer2Material
    ),
    "Número de Micraje (Polietileno) - Capa 2": pickValue(
      product.layer2Micron,
      project.layer2Micron
    ),
    "Gramaje - Capa 2 (g/m2)": pickValue(product.layer2Grammage, project.layer2Grammage),
    "Capa 3 - Tipo de Material y Micraje": pickValue(
      product.layer3Material,
      project.layer3Material
    ),
    "Número de Micraje (Polietileno) - Capa 3": pickValue(
      product.layer3Micron,
      project.layer3Micron
    ),
    "Gramaje - Capa 3 (g/m2)": pickValue(product.layer3Grammage, project.layer3Grammage),
    "Capa 4 - Tipo de Material y Micraje": pickValue(
      product.layer4Material,
      project.layer4Material
    ),
    "Número de Micraje (Polietileno) - Capa 4": pickValue(
      product.layer4Micron,
      project.layer4Micron
    ),
    "Gramaje - Capa 4 (g/m2)": pickValue(product.layer4Grammage, project.layer4Grammage),
    "Especificaciones Especiales (Estructura)": project.specialStructureSpecs || "",
    "Gramaje (g/m2)": pickValue(product.grammage, project.grammage),
    "Tolerancia de Gramaje (+-)": pickValue(product.grammageTolerance, project.grammageTolerance),
    "Tipo de Envasado (Máquina de cliente)": pickValue(
      (portfolio as any)?.maquinaCliente,
      project.maquinaCliente,
      project.packingMachineName
    ),
    "¿Solicitud de Muestra?": boolStr(product.requiresSample ?? project.sampleRequest),
    "Dimensiones (Ancho)": pickValue(product.width, project.width),
    "Dimensiones (Largo)": pickValue(product.length, project.length),
    "Repetición": project.repetition || "",
    "Base del Doy Pack": project.doyPackBase || "",
    "Ancho Fuelle": pickValue(product.gusset, project.gussetWidth),
    "Tipo de Fuelle": project.gussetType || "",
    "Accesorios Consumibles - Zipper": boolStr(
      pickValue(product.hasZipper, project.hasZipper)
    ),
    "Tipo de Zipper": pickValue(product.zipperType, project.zipperType),
    "Accesorios Consumibles - Tin-Tie": boolStr(project.hasTinTie),
    "Accesorios Consumibles - Válvula": boolStr(
      pickValue(product.hasValve, project.hasValve)
    ),
    "Tipo de Válvula": pickValue(product.valveType, project.valveType),
    "Accesorios producto - Asa Troquelada": boolStr(project.hasDieCutHandle),
    "Accesorios producto - Refuerzo": boolStr(
      pickValue(product.hasReinforcement, project.hasReinforcement)
    ),
    "Espesor Refuerzo (g/m2)": pickValue(
      product.reinforcementThickness,
      project.reinforcementThickness
    ),
    "Ancho Refuerzo": pickValue(product.reinforcementWidth, project.reinforcementWidth),
    "Accesorios internos - Corte Angular": boolStr(project.hasAngularCut),
    "Accesorios internos - Esquinas Redondas": boolStr(
      pickValue(product.hasRoundedCorners, project.hasRoundedCorners)
    ),
    "Tipo de Esquinas Redondas": pickValue(
      product.roundedCornersType,
      project.roundedCornersType
    ),
    "Accesorios internos - Muesca": boolStr(project.hasNotch),
    "Accesorios internos - Perforación": boolStr(
      pickValue(product.hasPerforation, project.hasPerforation)
    ),
    "Tipo de Perforación Pouch": project.pouchPerforationType || "",
    "Tipo de Perforación Bolsa": project.bagPerforationType || "",
    "Ubicación de Perforaciones": pickValue(
      product.perforationLocation,
      project.perforationLocation
    ),
    "Accesorios internos - Pre-Corte": boolStr(
      pickValue(product.hasPreCut, project.hasPreCut)
    ),
    "Tipo de pre-corte": pickValue(product.preCutType, project.preCutType),
    "Accesorios internos - Otros": "",
    "Otros accesorios (si aplica)": project.otherAccessories || "",
    "Código Producto": product.preliminaryProductCode || "",
    "Nombre Producto": pickValue(product.name, product.productName),
    "Colores":
      Array.isArray(product.colorObjective) && product.colorObjective.length > 0
        ? product.colorObjective.join(", ")
        : Array.isArray((product as any).objetivoColor) && (product as any).objetivoColor.length > 0
        ? (product as any).objetivoColor.join(", ")
        : Array.isArray(project.colorObjective)
        ? project.colorObjective.join(", ")
        : project.colors || "",
    "Comentario de objetivo de color": pickValue(
      product.colorObjectiveComment,
      (product as any).comentarioObjetivoColor,
      project.colorObjectiveComment,
      (project as any).comentarioObjetivoColor
    ),
    'Logo "Producto Peruano"': pickValue(
      product.peruvianProductLogo,
      (product as any).logoProductoPeruano,
      project.peruvianProductLogo,
      "No"
    ),
    "Pie de Imprenta": pickValue(
      product.printingFooter,
      (product as any).pieImprenta,
      project.printingFooter,
      "Sí"
    ),
    "Número de colores": "",
    "Tintas y Barnices": "",
    "Gramaje de la tinta (g)": "",
    "Material Adhesivos": "",
    "Material de tuco": project.coreMaterial || "",
    "Peso máximo de la bobina (kg)": project.maxRollWeight || "",
    "Proceso 1": "",
    "Proceso 2": "",
    "Proceso 3": "",
    "Proceso 4": "",
    "Proceso 5": "",
    "Proceso 6": "",
    "Proceso 7": "",
    "Proceso 8": "",
    "Venta Nacional / Internacional": pickValue(product.saleScope, project.saleType),
    "Incoterm": pickValue(product.incoterm, project.incoterm),
    "País de Destino": pickValue(product.destinationCountry, project.destinationCountry),
    "Precio Venta": pickValue(
      product.targetPrice,
      product.targetPriceMin,
      project.targetPrice,
      project.salePrice
    ),
    "Tipo de Moneda": pickValue(product.currencyType, project.currencyType),
  };
}

export function exportProjectQuotationExcel(params: {
  project: ProjectRecord;
  portfolio: PortfolioRecord | null;
  products: ProjectPreliminaryProductRecord[];
}): void {
  const { project, portfolio, products } = params;

  // Validate products before export
  const invalid = products.filter(
    (p) => !p.name?.trim() || !p.estimatedVolume || !p.unitOfMeasure?.trim()
  );
  if (invalid.length > 0) {
    alert(
      `${invalid.length} producto(s) faltan nombre, volumen o unidad de medida. Por favor complete estos campos antes de exportar.`
    );
    return;
  }

  // Build rows
  const rows = products.map((product) => buildQuotationExportRow(product, project, portfolio));

  // Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for better readability
  const columnWidths = Array(105).fill(18);
  worksheet["!cols"] = columnWidths.map((w) => ({ wch: w }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos a cotizar");

  // Generate filename with date and time
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `Cotizacion_${project.code}_${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
}
