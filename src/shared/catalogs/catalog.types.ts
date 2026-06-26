// Tipos e interfaces para el sistema de catálogos centralizado

export type OwnerModule = "products" | "portfolio" | "clients" | "users" | "shared";
export type OwnerSystem = "ODISEO" | "SISTEMA_INTEGRAL" | "SAP" | "EXTERNO";
export type CatalogStatus = "active" | "inactive";
export type ItemStatus = "Activo" | "Inactivo" | "Bloqueado";

export interface CatalogDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  ownerModule: OwnerModule;
  ownerSystem: OwnerSystem;
  status: CatalogStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogValue {
  id: string;
  catalogId: string;
  catalogCode?: string;
  item: string; // Código del item (ENV-001, UM-001, etc.)
  name: string;
  description?: string;
  status: ItemStatus;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  inactivatedAt?: string;
  blockedAt?: string;
  blockedReason?: string;
  // Relaciones y metadatos opcionales
  wrappingType?: "pouch" | "bolsa" | "lamina" | null;
  wrappingId?: string | number | null;
  wrappingCode?: string | null;
  [key: string]: any; // Permite campos adicionales
}

export interface CatalogOption {
  value: string; // item code
  label: string; // name
  item: string;
  status: ItemStatus;
}

export interface CatalogUpdateResult {
  success: boolean;
  catalogCode: string;
  catalogName: string;
  logId: string;
  newRecords: number;
  modifiedRecords: number;
  inactivatedRecords: number;
  blockedRecords: number;
  errors: string[];
  timestamp: string;
}

export interface CatalogChangeLog {
  id: string;
  timestamp: string;
  user: string;
  catalogCode: string;
  catalogName: string;
  action: "Actualización por plantilla";
  reason: string;
  newRecords: number;
  modifiedRecords: number;
  inactivatedRecords: number;
  blockedRecords: number;
  result: "success" | "error";
  details: CatalogChangeLogDetail[];
}

export interface CatalogChangeLogDetail {
  item: string;
  name: string;
  detectedAction: "new" | "modified" | "status_changed" | "inactive" | "blocked" | "unchanged" | "error";
  currentStatus?: ItemStatus;
  newStatus?: ItemStatus;
  observation?: string;
}
