import type { ManagementType, ValidationSummary, DetectedChangeAction } from "../types/catalogRestriction.types";

export function validateManagementParams(
  type: ManagementType,
  targetId: string,
  reason: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!type) {
    errors.type = "Selecciona un tipo de gestión.";
  }

  if (!targetId) {
    const label = type === "catalog" ? "catálogo" : "restricción";
    errors.target = `Selecciona ${type === "catalog" ? "el" : "la"} ${label} a actualizar.`;
  }

  if (!reason.trim()) {
    errors.reason = "Ingresa el motivo del cambio.";
  }

  return errors;
}

export function validateFileUpload(file: File | null): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!file) {
    errors.file = "Carga un archivo para continuar.";
    return errors;
  }

  const validExtensions = [".xlsx", ".csv"];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    errors.file = "El archivo debe ser .xlsx o .csv.";
  }

  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.file = `El archivo no debe superar ${maxSizeMB}MB.`;
  }

  return errors;
}

export function canConfirmChanges(summary: ValidationSummary | null): boolean {
  if (!summary) return false;
  if (summary.criticalErrors > 0) return false;
  const totalChanges = summary.newRecords + summary.modifiedRecords + summary.inactivatedRecords + summary.blockedRecords;
  return totalChanges > 0;
}

export function getValidationStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-slate-100 text-slate-600";
    case "validating":
      return "bg-blue-100 text-blue-700";
    case "with_observations":
      return "bg-amber-100 text-amber-700";
    case "valid":
      return "bg-green-100 text-green-700";
    case "applied":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function getActionColor(action: string): string {
  switch (action) {
    case "new":
      return "bg-green-100 text-green-700";
    case "modified":
      return "bg-blue-100 text-blue-700";
    case "status_changed":
      return "bg-orange-100 text-orange-700";
    case "inactive":
      return "bg-slate-100 text-slate-600";
    case "blocked":
      return "bg-red-100 text-red-700";
    case "unchanged":
      return "bg-slate-50 text-slate-400";
    case "error":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "valid":
      return "bg-green-50 border-green-200 text-green-700";
    case "error":
      return "bg-red-50 border-red-200 text-red-700";
    case "warning":
      return "bg-amber-50 border-amber-200 text-amber-700";
    default:
      return "bg-slate-50 border-slate-200 text-slate-700";
  }
}
