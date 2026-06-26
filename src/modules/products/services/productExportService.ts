import * as XLSX from "xlsx";
import { getProjectByCode } from "../../../shared/data/projectStorage";
import { getProjectTrackingState } from "../../../shared/data/projectTrackingStorage";
import { getProjectObservations } from "../../../shared/data/observationStorage";
import { getProjectProducts } from "../../../shared/data/projectProductStorage";

export const exportProjectToExcelMock = (projectCode: string) => {
  const project = getProjectByCode(projectCode);
  if (!project) {
    alert("No se pudo encontrar el proyecto para exportar.");
    return;
  }

  const tracking = getProjectTrackingState(projectCode);
  const observations = getProjectObservations().filter(o => o.projectCode === projectCode);

  console.group(`Exportando Ficha Técnica de Producto: ${project.code}`);
  console.log("Datos del Cliente y Portafolio:", {
    Cliente: project.clientName,
    Portafolio: project.portfolioCode,
    Ruta_Diseño: project.designRoute,
  });
  console.log("Especificaciones:", {
    Envoltura: project.envoltura,
    Sector: project.sector,
    Dimensiones: project.dimensions,
    Sostenibilidad: project.sustainability,
  });
  console.log("Validaciones (Tracking):", tracking);
  console.log("Observaciones Abiertas:", observations.filter(o => o.status === "Abierta"));
  console.groupEnd();

  alert(`Ficha del Producto ${project.code} exportada exitosamente a Excel para Commercial Finance.`);
};

export const exportProductsToExcel = (projectCode: string): void => {
  const project = getProjectByCode(projectCode);
  if (!project) {
    alert("No se pudo encontrar el proyecto.");
    return;
  }

  const products = getProjectProducts(projectCode).filter((p) => p.selectedForQuote);
  if (products.length === 0) {
    alert("No hay productos seleccionados para cotizar.");
    return;
  }

  const rows = products.map((p) => ({
    "ID Proyecto": project.code,
    "ID Producto Preliminar": p.productRequestCode,
    "Código": p.siProductCode || p.productRequestCode,
    "Cliente": project.clientName || "",
    "Portafolio": project.portfolioCode || "",
    "Tipo": p.productType,
    "Formato": p.format || project.blueprintFormat || "",
    "Estructura": p.structure || project.structureType || "",
    "Ancho": p.width ?? project.width ?? "",
    "Largo": p.length ?? project.length ?? "",
    "Fuelle": p.gusset ?? project.gussetWidth ?? "",
    "Espesor": p.micron ?? "",
    "Gramaje": p.grammage ?? project.grammage ?? "",
    "Volumen Estimado": p.estimatedVolume ?? project.estimatedVolume ?? "",
    "Unidad": p.unitOfMeasure || project.unitOfMeasure || "",
    "Requiere Diseño Especial": p.requiresDesign ? "Sí" : "No",
    "Requiere Muestra": p.requiresSample ? "Sí" : "No",
    "Estado AG": p.agValidationStatus || "Sin solicitar",
    "Estado R&D": p.rdValidationStatus || "Sin solicitar",
    "Observación AG": p.agObservation || "",
    "Observación R&D": p.rdObservation || "",
    "Precio Mínimo": p.targetPriceMin ?? "",
    "Precio Máximo": p.targetPriceMax ?? "",
    "Comentario Comercial Finance": p.commercialFinanceComment || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  XLSX.writeFile(wb, `Productos_${projectCode}_${Date.now()}.xlsx`);
};
