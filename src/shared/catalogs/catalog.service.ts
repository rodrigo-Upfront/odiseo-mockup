// Servicio centralizado de catálogos
// Proporciona funciones reutilizables para acceder y modificar catálogos

import { CATALOG_REGISTRY, getCatalogDefinition } from "./catalog.registry";
import { CATALOG_VALUES_SEED } from "./catalog.seed";
import type {
  CatalogDefinition,
  CatalogValue,
  CatalogOption,
  CatalogUpdateResult,
  CatalogChangeLog,
  CatalogChangeLogDetail,
} from "./catalog.types";

// En memoria - En producción, esto vendría de una base de datos
let catalogValues: CatalogValue[] = [...CATALOG_VALUES_SEED];
let catalogChangeLogs: CatalogChangeLog[] = [];

// Sistema de notificación de cambios para mantener la UI sincronizada
const catalogChangeListeners = new Set<(catalogCode: string) => void>();

export function onCatalogChange(callback: (catalogCode: string) => void): () => void {
  catalogChangeListeners.add(callback);
  return () => catalogChangeListeners.delete(callback);
}

function notifyCatalogChange(catalogCode: string): void {
  catalogChangeListeners.forEach((listener) => listener(catalogCode));
}

export function getCatalogs(): CatalogDefinition[] {
  return CATALOG_REGISTRY;
}

export function getCatalogByCode(code: string): CatalogDefinition | undefined {
  return getCatalogDefinition(code);
}

export function getCatalogValues(
  catalogCode: string,
  options?: { activeOnly?: boolean }
): CatalogValue[] {
  const values = catalogValues.filter((v) => v.catalogCode === catalogCode);

  if (options?.activeOnly) {
    return values.filter((v) => v.status === "Activo");
  }

  return values;
}

export function getCatalogOptions(
  catalogCode: string,
  options?: { activeOnly?: boolean }
): CatalogOption[] {
  const values = getCatalogValues(catalogCode, options);
  return values.map((v) => ({
    value: v.item,
    label: v.name,
    item: v.item,
    status: v.status,
  }));
}

export function getCatalogValue(
  catalogCode: string,
  itemCode: string
): CatalogValue | undefined {
  return catalogValues.find((v) => v.catalogCode === catalogCode && v.item === itemCode);
}

export function getCatalogValueByName(
  catalogCode: string,
  name: string
): CatalogValue | undefined {
  return catalogValues.find((v) => v.catalogCode === catalogCode && v.name === name);
}

// Actualizar catálogo con validación de cambios
export function upsertCatalogValues(params: {
  catalogCode: string;
  rows: Array<{ item: string; name: string; status: "Activo" | "Inactivo" | "Bloqueado" }>;
  user: string;
  reason: string;
}): CatalogUpdateResult {
  const catalogDef = getCatalogByCode(params.catalogCode);
  if (!catalogDef) {
    return {
      success: false,
      catalogCode: params.catalogCode,
      catalogName: "",
      logId: "",
      newRecords: 0,
      modifiedRecords: 0,
      inactivatedRecords: 0,
      blockedRecords: 0,
      errors: [`Catálogo no encontrado: ${params.catalogCode}`],
      timestamp: new Date().toISOString(),
    };
  }

  const errors: string[] = [];
  let newRecords = 0;
  let modifiedRecords = 0;
  let inactivatedRecords = 0;
  let blockedRecords = 0;
  const details: CatalogChangeLogDetail[] = [];

  for (const row of params.rows) {
    const existing = getCatalogValue(params.catalogCode, row.item);

    if (!existing) {
      // Nuevo registro
      const newValue: CatalogValue = {
        id: `${params.catalogCode}_${row.item}_${Date.now()}`,
        catalogId: catalogDef.id,
        catalogCode: params.catalogCode,
        item: row.item,
        name: row.name,
        status: row.status,
        sortOrder: (catalogValues.filter((v) => v.catalogCode === params.catalogCode).length || 0) + 1,
        createdAt: new Date().toISOString(),
      };
      catalogValues.push(newValue);
      newRecords++;
      details.push({
        item: row.item,
        name: row.name,
        detectedAction: "new",
        newStatus: row.status,
      });
    } else if (existing.name !== row.name || existing.status !== row.status) {
      // Modificado
      const oldStatus = existing.status;
      existing.name = row.name;
      existing.status = row.status;
      existing.updatedAt = new Date().toISOString();

      if (oldStatus !== row.status) {
        if (row.status === "Inactivo") {
          existing.inactivatedAt = new Date().toISOString();
          inactivatedRecords++;
          details.push({
            item: row.item,
            name: row.name,
            detectedAction: "inactive",
            currentStatus: oldStatus,
            newStatus: row.status,
          });
        } else if (row.status === "Bloqueado") {
          existing.blockedAt = new Date().toISOString();
          blockedRecords++;
          details.push({
            item: row.item,
            name: row.name,
            detectedAction: "blocked",
            currentStatus: oldStatus,
            newStatus: row.status,
          });
        } else {
          modifiedRecords++;
          details.push({
            item: row.item,
            name: row.name,
            detectedAction: "modified",
            currentStatus: oldStatus,
            newStatus: row.status,
          });
        }
      } else {
        modifiedRecords++;
        details.push({
          item: row.item,
          name: row.name,
          detectedAction: "modified",
          currentStatus: oldStatus,
          newStatus: row.status,
        });
      }
    }
  }

  const logId = `log_${catalogDef.code}_${Date.now()}`;
  const log: CatalogChangeLog = {
    id: logId,
    timestamp: new Date().toISOString(),
    user: params.user,
    catalogCode: params.catalogCode,
    catalogName: catalogDef.name,
    action: "Actualización por plantilla",
    reason: params.reason,
    newRecords,
    modifiedRecords,
    inactivatedRecords,
    blockedRecords,
    result: errors.length === 0 ? "success" : "error",
    details,
  };

  catalogChangeLogs.push(log);

  // Notificar a los listeners sobre el cambio
  notifyCatalogChange(params.catalogCode);

  return {
    success: errors.length === 0,
    catalogCode: params.catalogCode,
    catalogName: catalogDef.name,
    logId,
    newRecords,
    modifiedRecords,
    inactivatedRecords,
    blockedRecords,
    errors,
    timestamp: new Date().toISOString(),
  };
}

export function getCatalogChangeLogs(catalogCode?: string): CatalogChangeLog[] {
  if (catalogCode) {
    return catalogChangeLogs.filter((log) => log.catalogCode === catalogCode);
  }
  return catalogChangeLogs;
}

export function getCatalogChangeLog(logId: string): CatalogChangeLog | undefined {
  return catalogChangeLogs.find((log) => log.id === logId);
}

// Restablecer catálogos a estado inicial (solo para testing)
export function resetCatalogs(): void {
  catalogValues = [...CATALOG_VALUES_SEED];
  catalogChangeLogs = [];
}

// Exportar datos en formato para plantilla Excel
export function exportCatalogToExcel(catalogCode: string): {
  catalogName: string;
  data: Array<{
    Item: string;
    Nombre: string;
    Estado: string;
  }>;
} {
  const catalogDef = getCatalogByCode(catalogCode);
  if (!catalogDef) {
    throw new Error(`Catálogo no encontrado: ${catalogCode}`);
  }

  const values = getCatalogValues(catalogCode);
  const data = values.map((v) => ({
    Item: v.item,
    Nombre: v.name,
    Estado: v.status,
  }));

  return {
    catalogName: catalogDef.name,
    data,
  };
}

// Validar plantilla cargada contra valores reales
export function validateCatalogTemplate(
  catalogCode: string,
  rows: Array<{ item: string; name: string; status: string }>
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  detectedChanges: Array<{
    item: string;
    name: string;
    action: "new" | "modified" | "status_changed" | "unchanged" | "error";
    observation?: string;
  }>;
} {
  const catalogDef = getCatalogByCode(catalogCode);
  if (!catalogDef) {
    return {
      valid: false,
      errors: [`Catálogo no encontrado: ${catalogCode}`],
      warnings: [],
      detectedChanges: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const detectedChanges: Array<any> = [];

  for (const row of rows) {
    if (!row.item || !row.name) {
      errors.push(`Fila incompleta: Item o Nombre vacío`);
      continue;
    }

    const validStatuses = ["Activo", "Inactivo", "Bloqueado"];
    if (!validStatuses.includes(row.status)) {
      errors.push(`Estado inválido en ${row.item}: "${row.status}". Debe ser Activo, Inactivo o Bloqueado.`);
      continue;
    }

    const existing = getCatalogValue(catalogCode, row.item);

    if (!existing) {
      detectedChanges.push({
        item: row.item,
        name: row.name,
        action: "new",
      });
    } else if (existing.name !== row.name || existing.status !== row.status) {
      if (existing.status !== row.status) {
        let action: "status_changed" | "inactive" | "blocked" = "status_changed";
        if (row.status === "Inactivo") {
          action = "inactive";
        } else if (row.status === "Bloqueado") {
          action = "blocked";
        }
        detectedChanges.push({
          item: row.item,
          name: row.name,
          action,
          observation: `Estado: ${existing.status} → ${row.status}`,
        });
      } else {
        detectedChanges.push({
          item: row.item,
          name: row.name,
          action: "modified",
          observation: `Nombre: "${existing.name}" → "${row.name}"`,
        });
      }
    } else {
      detectedChanges.push({
        item: row.item,
        name: row.name,
        action: "unchanged",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    detectedChanges: detectedChanges.filter((c) => c.action !== "unchanged"),
  };
}
