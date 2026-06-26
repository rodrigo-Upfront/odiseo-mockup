// Persistencia de catálogos
// En producción, esto interactuaría con una base de datos o API backend
// Por ahora, usa localStorage como fallback

import type { CatalogValue, CatalogChangeLog } from "./catalog.types";

const STORAGE_KEY_VALUES = "odiseo_catalog_values";
const STORAGE_KEY_LOGS = "odiseo_catalog_logs";

export function loadCatalogValuesFromStorage(): CatalogValue[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VALUES);
    if (stored) {
      return JSON.parse(stored) as CatalogValue[];
    }
  } catch (error) {
    console.error("Error loading catalog values from storage:", error);
  }
  return null;
}

export function saveCatalogValuesToStorage(values: CatalogValue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VALUES, JSON.stringify(values));
  } catch (error) {
    console.error("Error saving catalog values to storage:", error);
  }
}

export function loadCatalogLogsFromStorage(): CatalogChangeLog[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LOGS);
    if (stored) {
      return JSON.parse(stored) as CatalogChangeLog[];
    }
  } catch (error) {
    console.error("Error loading catalog logs from storage:", error);
  }
  return null;
}

export function saveCatalogLogsToStorage(logs: CatalogChangeLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error("Error saving catalog logs to storage:", error);
  }
}

export function clearCatalogStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_VALUES);
    localStorage.removeItem(STORAGE_KEY_LOGS);
  } catch (error) {
    console.error("Error clearing catalog storage:", error);
  }
}
