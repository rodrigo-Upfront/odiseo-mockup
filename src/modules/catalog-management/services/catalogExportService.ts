import * as XLSX from "xlsx";
import { getCatalogs, getCatalogValues } from "../../../shared/catalogs";
import { getAvailableRestrictions } from "./catalogRestrictionService";

export async function exportAllCatalogs(): Promise<void> {
  const catalogs = getCatalogs();
  const wb = XLSX.utils.book_new();

  // Crear una hoja por cada catálogo
  for (const catalog of catalogs) {
    const values = getCatalogValues(catalog.code);

    const data = values.map((v) => ({
      Item: v.item,
      Nombre: v.name,
      Descripción: v.description || "",
      Estado: v.status,
      "Orden": v.sortOrder,
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-ajustar ancho de columnas
    ws["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 8 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, catalog.code);
  }

  // Crear una hoja de resumen
  const summaryData = catalogs.map((catalog) => {
    const values = getCatalogValues(catalog.code);
    const activeCount = values.filter((v) => v.status === "Activo").length;
    const inactiveCount = values.filter((v) => v.status === "Inactivo").length;
    const blockedCount = values.filter((v) => v.status === "Bloqueado").length;

    return {
      Catálogo: catalog.name,
      Código: catalog.code,
      Total: values.length,
      Activos: activeCount,
      Inactivos: inactiveCount,
      Bloqueados: blockedCount,
      Sistema: catalog.ownerSystem,
      Módulo: catalog.ownerModule,
    };
  });

  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");
  // Move summary sheet to the beginning
  wb.SheetNames.unshift(wb.SheetNames.pop()!);

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Catalogos_${timestamp}.xlsx`);
}

export async function exportAllRestrictions(): Promise<void> {
  const restrictions = getAvailableRestrictions();

  if (restrictions.length === 0) {
    alert("No hay restricciones disponibles para exportar");
    return;
  }

  const wb = XLSX.utils.book_new();

  const data = restrictions.map((r) => ({
    ID: r.id,
    Nombre: r.name,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [
    { wch: 20 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Restricciones");

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Restricciones_${timestamp}.xlsx`);
}

export async function exportAllData(): Promise<void> {
  const catalogs = getCatalogs();
  const restrictions = getAvailableRestrictions();
  const wb = XLSX.utils.book_new();

  // Agregar catálogos
  for (const catalog of catalogs) {
    const values = getCatalogValues(catalog.code);

    const data = values.map((v) => ({
      Item: v.item,
      Nombre: v.name,
      Descripción: v.description || "",
      Estado: v.status,
      Orden: v.sortOrder,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 8 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, `CAT_${catalog.code}`);
  }

  // Agregar restricciones si las hay
  if (restrictions.length > 0) {
    const restrictionData = restrictions.map((r) => ({
      ID: r.id,
      Nombre: r.name,
    }));

    const restrictionWs = XLSX.utils.json_to_sheet(restrictionData);
    restrictionWs["!cols"] = [
      { wch: 20 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, restrictionWs, "Restricciones");
  }

  // Crear hoja de resumen de catálogos
  const catalogSummaryData = catalogs.map((catalog) => {
    const values = getCatalogValues(catalog.code);
    const activeCount = values.filter((v) => v.status === "Activo").length;
    const inactiveCount = values.filter((v) => v.status === "Inactivo").length;
    const blockedCount = values.filter((v) => v.status === "Bloqueado").length;

    return {
      Catálogo: catalog.name,
      Código: catalog.code,
      Total: values.length,
      Activos: activeCount,
      Inactivos: inactiveCount,
      Bloqueados: blockedCount,
      Sistema: catalog.ownerSystem,
    };
  });

  const catalogSummaryWs = XLSX.utils.json_to_sheet(catalogSummaryData);
  catalogSummaryWs["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, catalogSummaryWs, "Resumen Catálogos");
  // Move summary sheet to the beginning
  wb.SheetNames.unshift(wb.SheetNames.pop()!);

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Catalogos_Restricciones_${timestamp}.xlsx`);
}
