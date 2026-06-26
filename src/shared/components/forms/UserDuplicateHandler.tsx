import { AlertTriangle } from "lucide-react";
import { type User, STATUS_LABELS, STATUS_COLORS } from "../../data/userStorage";
import ActionButton from "../buttons/ActionButton";

interface UserDuplicateHandlerProps {
  existingUser: User;
  onReactiveUser?: () => void;
  onUnblockUser?: () => void;
  onResendActivation?: () => void;
  onViewDetails?: () => void;
  loading?: boolean;
}

export default function UserDuplicateHandler({
  existingUser,
  onReactiveUser,
  onUnblockUser,
  onResendActivation,
  onViewDetails,
  loading = false,
}: UserDuplicateHandlerProps) {
  const statusColor = STATUS_COLORS[existingUser.status] || "bg-slate-100 text-slate-700";
  const statusLabel = STATUS_LABELS[existingUser.status];

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-amber-900">Usuario ya registrado</h3>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-amber-800">
              <strong>{existingUser.fullName}</strong> ({existingUser.email})
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700">Estado actual:</span>
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {existingUser.status === "pending_activation" && (
            <div className="mt-4">
              <p className="text-sm text-amber-900 mb-3">
                El usuario ya fue creado, pero aún no activó su cuenta.
              </p>
              <ActionButton
                label="Reenviar correo de activación"
                onClick={onResendActivation}
                disabled={loading}
                variant="warning"
                size="sm"
              />
            </div>
          )}

          {existingUser.status === "inactive" && (
            <div className="mt-4">
              <p className="text-sm text-amber-900 mb-3">
                El usuario existe, pero se encuentra inactivo.
              </p>
              <ActionButton
                label="Reactivar usuario"
                onClick={onReactiveUser}
                disabled={loading}
                variant="warning"
                size="sm"
              />
            </div>
          )}

          {existingUser.status === "blocked" && (
            <div className="mt-4">
              <p className="text-sm text-amber-900 mb-3">
                El usuario se encuentra bloqueado.
              </p>
              <ActionButton
                label="Desbloquear usuario"
                onClick={onUnblockUser}
                disabled={loading}
                variant="warning"
                size="sm"
              />
            </div>
          )}

          {existingUser.status === "active" && (
            <div className="mt-4">
              <p className="text-sm text-amber-900 mb-3">
                El usuario ya existe y se encuentra activo.
              </p>
              <ActionButton
                label="Ver detalle del usuario"
                onClick={onViewDetails}
                disabled={loading}
                variant="outline"
                size="sm"
              />
            </div>
          )}

          {existingUser.status === "pending_validation" && (
            <div className="mt-4">
              <p className="text-sm text-amber-900 mb-3">
                El usuario se encuentra pendiente de validación.
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Contacta al administrador para más información.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
