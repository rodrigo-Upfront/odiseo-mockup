// Exportaciones centrales del sistema de catálogos

// Types
export type {
  CatalogDefinition,
  CatalogValue,
  CatalogOption,
  CatalogUpdateResult,
  CatalogChangeLog,
  CatalogChangeLogDetail,
  OwnerModule,
  OwnerSystem,
  CatalogStatus,
  ItemStatus,
} from "./catalog.types";

export type {
  Restriction,
  RestrictionValidationError,
  RestrictionCheckResult,
} from "./restriction.types";

// Registry
export { CATALOG_REGISTRY, getCatalogDefinition, getCatalogDefinitionById, getActiveCatalogs, getCatalogsByModule } from "./catalog.registry";

// Seed (datos iniciales)
export { CATALOG_VALUES_SEED } from "./catalog.seed";

// Service (funciones reutilizables)
export {
  getCatalogs,
  getCatalogByCode,
  getCatalogValues,
  getCatalogOptions,
  getCatalogValue,
  getCatalogValueByName,
  upsertCatalogValues,
  getCatalogChangeLogs,
  getCatalogChangeLog,
  resetCatalogs,
  exportCatalogToExcel,
  validateCatalogTemplate,
} from "./catalog.service";

// Storage
export {
  loadCatalogValuesFromStorage,
  saveCatalogValuesToStorage,
  loadCatalogLogsFromStorage,
  saveCatalogLogsToStorage,
  clearCatalogStorage,
} from "./catalog.storage";

// Events
export {
  CATALOGS_UPDATED_EVENT,
  emitCatalogsUpdated,
  subscribeToCatalogsUpdated,
  useCatalogsUpdatedSubscription,
} from "./catalog.events";

export type { CatalogsUpdatedEventDetail } from "./catalog.events";

// Restriction Service
export {
  getRestrictions,
  getRestriction,
  getRestrictionsBySourceField,
  addRestriction,
  updateRestriction,
  deleteRestriction,
  checkRestrictions,
  resetRestrictions,
} from "./restriction.service";
