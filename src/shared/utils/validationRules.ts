import { type ProjectRecord, type ValidationStatus } from "../data/projectStorage";

export interface ValidationPermissions {
  canEdit: boolean;
  canReSubmit: boolean;
  canExportPDF: boolean;
  canLoadPrice: boolean;
  canAdvanceToRFQ: boolean;
  reason?: string;
}

export function getValidationPermissions(project: ProjectRecord): ValidationPermissions {
  const { estadoValidacionGeneral, validaciones } = project;

  // Si está rechazado, bloquear todo flujo
  if (estadoValidacionGeneral === "Rechazada") {
    return {
      canEdit: false,
      canReSubmit: false,
      canExportPDF: false,
      canLoadPrice: false,
      canAdvanceToRFQ: false,
      reason: "Proyecto rechazado - no puede continuar el flujo. Requiere reapertura por administrador.",
    };
  }

  // Si está observado, permitir edición y re-envío
  if (estadoValidacionGeneral === "Observada") {
    const hasObservations = validaciones.some((v) => v.estado === "Observada");
    return {
      canEdit: true,
      canReSubmit: hasObservations,
      canExportPDF: false,
      canLoadPrice: false,
      canAdvanceToRFQ: false,
      reason: "Proyecto tiene observaciones - debe corregir y reenviar a validación.",
    };
  }

  // Si está validado por áreas, permitir RFQ pero no PDF/Precio
  if (estadoValidacionGeneral === "Validada por áreas") {
    return {
      canEdit: false,
      canReSubmit: false,
      canExportPDF: true,
      canLoadPrice: false,
      canAdvanceToRFQ: true,
      reason: "Proyecto validado - puede avanzar a RFQ",
    };
  }

  // Si está en validación, no permitir edición
  if (estadoValidacionGeneral === "En validación") {
    return {
      canEdit: false,
      canReSubmit: false,
      canExportPDF: false,
      canLoadPrice: false,
      canAdvanceToRFQ: false,
      reason: "Proyecto en validación - espere resultado de los validadores",
    };
  }

  // Default: permitir edición
  return {
    canEdit: true,
    canReSubmit: false,
    canExportPDF: false,
    canLoadPrice: false,
    canAdvanceToRFQ: false,
  };
}

export function getValidationStatusMessage(status: ValidationStatus): string {
  switch (status) {
    case "Sin solicitar":
      return "El proyecto aún no ha solicitado validación";
    case "Pendiente de validación":
      return "En espera de ser revisado por los validadores";
    case "En validación":
      return "Los validadores están revisando el proyecto";
    case "Observada":
      return "Requiere correcciones antes de continuar";
    case "Rechazada":
      return "El proyecto ha sido rechazado y no puede continuar";
    case "Validada por áreas":
      return "Todas las áreas aprobaron - listo para RFQ";
    default:
      return "";
  }
}
