export type ManagementType = "catalog" | "restriction";

export type DetectedChangeAction =
  | "new"
  | "modified"
  | "status_changed"
  | "inactive"
  | "blocked"
  | "unchanged"
  | "error";

export type ValidationStatus = "pending" | "validating" | "with_observations" | "valid" | "applied";

export type RecordStatus = "active" | "inactive" | "blocked";

export interface CatalogItem {
  id: string;
  name: string;
  code: string;
  source: "ODISEO" | "SISTEMA_INTEGRAL";
}

export interface RestrictionItem {
  id: string;
  name: string;
}

export interface CatalogChangePreviewRow {
  item: string;
  currentName: string;
  newName: string;
  currentStatus: string;
  newStatus: string;
  detectedAction: DetectedChangeAction;
  status: "valid" | "error" | "warning";
  observation?: string;
}

export interface RestrictionChangePreviewRow {
  ruleCode: string;
  sourceField: string;
  sourceValue: string;
  dependentField: string;
  allowedValue: string;
  currentStatus: string;
  newStatus: string;
  detectedAction: DetectedChangeAction;
  status: "valid" | "error" | "warning";
  observation?: string;
}

export type ChangePreviewRow = CatalogChangePreviewRow | RestrictionChangePreviewRow;

export interface ValidationSummary {
  status: ValidationStatus;
  newRecords: number;
  modifiedRecords: number;
  inactivatedRecords: number;
  blockedRecords: number;
  observations: number;
  criticalErrors: number;
  rows: ChangePreviewRow[];
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  user: string;
  managementType: ManagementType;
  element: string;
  action: string;
  processedRecords: number;
  result: "success" | "error";
  source?: "ODISEO" | "SISTEMA_INTEGRAL";
}

export interface ManagementState {
  managementType: ManagementType;
  selectedTarget: string;
  reason: string;
  uploadedFile: File | null;
  uploadedFileName: string;
  validationSummary: ValidationSummary | null;
  uploadStatus: ValidationStatus;
}
