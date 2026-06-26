import { type ProjectRecord } from "../../data/projectStorage";
import { getValidationPermissions, getValidationStatusMessage } from "../../utils/validationRules";

interface ValidationStatusCardProps {
  project: ProjectRecord;
  showActions?: boolean;
  onReSubmit?: () => void;
}

export default function ValidationStatusCard({
  project,
  showActions = false,
  onReSubmit,
}: ValidationStatusCardProps) {
  const permissions = getValidationPermissions(project);
  const statusMessage = getValidationStatusMessage(project.estadoValidacionGeneral);

  const getStatusColor = (): string => {
    const status = project.estadoValidacionGeneral;
    if (status === "Sin solicitar") return "bg-gray-50 border-gray-200";
    if (status === "Pendiente de validación" || status === "En validación") return "bg-blue-50 border-blue-200";
    if (status === "Observada") return "bg-orange-50 border-orange-200";
    if (status === "Rechazada") return "bg-red-50 border-red-200";
    if (status === "Validada por áreas") return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  const getStatusBadgeColor = (): string => {
    switch (project.estadoValidacionGeneral) {
      case "Observada":
        return "bg-orange-100 text-orange-700";
      case "Rechazada":
        return "bg-red-100 text-red-700";
      case "Validada por áreas":
        return "bg-green-100 text-green-700";
      case "En validación":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-2">Estado de Validación</h3>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor()}`}
          >
            {project.estadoValidacionGeneral}
          </span>
        </div>
        {project.estadoValidacionGeneral === "Observada" && (
          <div className="text-2xl">⚠️</div>
        )}
        {project.estadoValidacionGeneral === "Rechazada" && (
          <div className="text-2xl">❌</div>
        )}
      </div>

      {statusMessage && (
        <p className="text-sm text-slate-700 mb-3">{statusMessage}</p>
      )}

      {permissions.reason && (
        <div className="text-xs text-slate-600 italic">{permissions.reason}</div>
      )}

      {showActions && project.estadoValidacionGeneral === "Observada" && onReSubmit && (
        <div className="mt-4 pt-4 border-t border-orange-200">
          <button
            onClick={onReSubmit}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 text-sm transition-colors"
          >
            Reenviar a validación
          </button>
          <p className="text-xs text-slate-600 mt-2">
            Guarde los cambios primero, luego haga clic para reenviar
          </p>
        </div>
      )}

      {/* Restricciones visuales */}
      {(project.estadoValidacionGeneral === "Observada" || project.estadoValidacionGeneral === "Rechazada") && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-2">
          <div className="text-xs font-semibold text-slate-700">Acciones disponibles:</div>
          <div className="space-y-1">
            <div className={`text-xs ${permissions.canEdit ? "text-green-700" : "text-red-700"}`}>
              {permissions.canEdit ? "✓" : "✗"} Editar ficha
            </div>
            <div className={`text-xs ${permissions.canReSubmit ? "text-green-700" : "text-red-700"}`}>
              {permissions.canReSubmit ? "✓" : "✗"} Reenviar a validación
            </div>
            <div className={`text-xs ${permissions.canExportPDF ? "text-green-700" : "text-red-700"}`}>
              {permissions.canExportPDF ? "✓" : "✗"} Exportar PDF
            </div>
            <div className={`text-xs ${permissions.canLoadPrice ? "text-green-700" : "text-red-700"}`}>
              {permissions.canLoadPrice ? "✓" : "✗"} Cargar precio
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
