import * as XLSX from "xlsx";
import {
  getCatalogs,
  getCatalogByCode,
  getCatalogValues,
  getCatalogOptions,
  upsertCatalogValues as upsertCentralCatalog,
  getCatalogChangeLogs,
  exportCatalogToExcel,
  validateCatalogTemplate as validateCentralTemplate,
  emitCatalogsUpdated,
  type CatalogDefinition,
  type CatalogValue,
  type CatalogChangeLog,
} from "../../../shared/catalogs";
import type {
  CatalogItem,
  RestrictionItem,
  ValidationSummary,
  ChangeLogEntry,
  ManagementType,
  CatalogChangePreviewRow,
  DetectedChangeAction,
} from "../types/catalogRestriction.types";
import { getCurrentUser } from "../../../shared/data/userStorage";

// Adapter: Convertir CatalogDefinition a CatalogItem para compatibilidad
export function getAvailableCatalogs(): CatalogItem[] {
  return getCatalogs().map((cat) => ({
    id: cat.id,
    code: cat.code,
    name: cat.name,
    source: cat.ownerSystem === "SISTEMA_INTEGRAL" ? "SISTEMA_INTEGRAL" : "ODISEO",
  }));
}

// Placeholder: Restricciones no existen aún en el sistema
export function getAvailableRestrictions(): RestrictionItem[] {
  return [];
}

// Descargar plantilla Excel con datos reales del catálogo
export async function downloadTemplate(catalogCode: string): Promise<void> {
  const catalogDef = getCatalogByCode(catalogCode);
  if (!catalogDef) {
    throw new Error(`Catálogo no encontrado: ${catalogCode}`);
  }

  const exportData = exportCatalogToExcel(catalogCode);
  const ws = XLSX.utils.json_to_sheet(exportData.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Catálogo");

  const fileName = `Plantilla_${catalogDef.name.replace(/\s+/g, "_")}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Cargar y validar plantilla Excel contra datos reales
export async function uploadAndValidateTemplate(
  file: File,
  catalogCode: string
): Promise<ValidationSummary> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(worksheet);

        // Validar contra catálogo real
        const validation = validateCentralTemplate(
          catalogCode,
          rows.map((r) => ({
            item: r.Item || r.item || "",
            name: r.Nombre || r.name || "",
            status: r.Estado || r.status || "Activo",
          }))
        );

        const previewRows: CatalogChangePreviewRow[] = validation.detectedChanges.map(
          (change) => ({
            item: change.item,
            currentName:
              getCatalogValues(catalogCode).find((v) => v.item === change.item)?.name || "",
            newName: rows.find((r) => r.Item === change.item || r.item === change.item)?.Nombre ||
              rows.find((r) => r.Item === change.item || r.item === change.item)?.name ||
              "",
            currentStatus:
              getCatalogValues(catalogCode).find((v) => v.item === change.item)?.status ||
              "Activo",
            newStatus:
              rows.find((r) => r.Item === change.item || r.item === change.item)?.Estado ||
              rows.find((r) => r.Item === change.item || r.item === change.item)?.status ||
              "Activo",
            detectedAction: change.action as DetectedChangeAction,
            status: validation.errors.length > 0 ? "error" : "valid",
            observation: change.observation,
          })
        );

        const criticalErrors = validation.errors.length;
        const newRecords = previewRows.filter((r) => r.detectedAction === "new").length;
        const modifiedRecords = previewRows.filter((r) => r.detectedAction === "modified").length;
        const inactivatedRecords = previewRows.filter((r) => r.detectedAction === "inactive").length;
        const blockedRecords = previewRows.filter((r) => r.detectedAction === "blocked").length;
        const totalChanges = newRecords + modifiedRecords + inactivatedRecords + blockedRecords;

        // Status is "valid" if no critical errors and there are changes
        // Status is "with_observations" if there are critical errors or no changes detected
        const status = criticalErrors === 0 && totalChanges > 0 ? "valid" : "with_observations";

        const summary: ValidationSummary = {
          status,
          newRecords,
          modifiedRecords,
          inactivatedRecords,
          blockedRecords,
          observations: validation.warnings.length,
          criticalErrors,
          rows: previewRows,
        };

        resolve(summary);
      } catch (error) {
        reject(new Error(`Error al procesar plantilla: ${error}`));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// Confirmar y aplicar cambios del catálogo
export async function confirmChanges(
  catalogCode: string,
  rows: Array<{ item: string; name: string; status: "Activo" | "Inactivo" | "Bloqueado" }>,
  reason: string
): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("Usuario no autenticado");
  }

  const result = upsertCentralCatalog({
    catalogCode,
    rows,
    user: currentUser.fullName || "Sistema",
    reason,
  });

  if (!result.success) {
    throw new Error(`Error al actualizar catálogo: ${result.errors.join(", ")}`);
  }

  // Emitir evento global para que otros módulos se actualicen
  emitCatalogsUpdated({
    catalogCode,
    catalogName: result.catalogName,
    logId: result.logId,
    newRecords: result.newRecords,
    modifiedRecords: result.modifiedRecords,
    inactivatedRecords: result.inactivatedRecords,
    blockedRecords: result.blockedRecords,
    timestamp: result.timestamp,
  });
}

// Obtener historial de cambios
export function getChangeLog(): ChangeLogEntry[] {
  return getCatalogChangeLogs().map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    user: log.user,
    managementType: "catalog",
    element: log.catalogName,
    action: log.action,
    processedRecords:
      log.newRecords + log.modifiedRecords + log.inactivatedRecords + log.blockedRecords,
    result: log.result,
  }));
}
