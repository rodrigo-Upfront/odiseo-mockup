import { useState } from "react";
import { getUserById, unblockUserAccess } from "../../data/userStorage";
import { getAccessStatusByCode, getAccessStatusLabel } from "../../data/accessStatusCatalog";
import type { User } from "../../data/userStorage";

interface UserAccessManagementProps {
  user: User | null;
  currentUser?: any;
  onAccessChanged?: () => void;
}

export default function UserAccessManagement({
  user,
  currentUser,
  onAccessChanged,
}: UserAccessManagementProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Usuario no encontrado</div>
      </div>
    );
  }

  const BLOQUEADO_STATUS_ID = 3;
  const PENDIENTE_ACTIVACION_STATUS_ID = 1;
  const HABILITADO_STATUS_ID = 2;

  const isBlocked = user.accessStatusId === BLOQUEADO_STATUS_ID;
  const isPendingActivation = user.accessStatusId === PENDIENTE_ACTIVACION_STATUS_ID;
  const isEnabled = user.accessStatusId === HABILITADO_STATUS_ID;
  const isInactive = !user.activeLogical;

  const handleUnblock = async () => {
    if (!isBlocked) return;

    setLoading(true);
    setMessage(null);

    try {
      const unlockedBy = currentUser?.fullName || "SISTEMA";
      const success = unblockUserAccess(user.id, unlockedBy);

      if (success) {
        setMessage({
          type: "success",
          text: "Usuario desbloqueado exitosamente",
        });
        setTimeout(() => {
          onAccessChanged?.();
          setMessage(null);
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: "No se pudo desbloquear el usuario",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error al desbloquear el usuario",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Gestión de Acceso
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Ver y controlar el estado de acceso del usuario
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Estado de Acceso */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">Estado de Acceso</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {getAccessStatusLabel(
                (user.accessStatusId === 1
                  ? "PENDIENTE_ACTIVACION"
                  : user.accessStatusId === 2
                    ? "HABILITADO"
                    : "BLOQUEADO") as any
              )}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isBlocked
                  ? "bg-red-100 text-red-600"
                  : isPendingActivation
                    ? "bg-amber-100 text-amber-600"
                    : "bg-green-100 text-green-600"
              }`}
            >
              {isBlocked ? "Bloqueado" : isPendingActivation ? "Pendiente" : "Activo"}
            </span>
          </div>
        </div>

        {/* Vigencia */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">Vigencia</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {isInactive ? "Inactivo" : "Activo"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isInactive
                  ? "bg-slate-200 text-slate-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {isInactive ? "Baja Lógica" : "Vigente"}
            </span>
          </div>
        </div>
      </div>

      {/* Intentos Fallidos */}
      {user.failedLoginAttempts > 0 && (
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs font-medium text-orange-600">
            Intentos Fallidos de Login
          </p>
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-700">
                {user.failedLoginAttempts}/3
              </span>
              <div className="flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-orange-200">
                  <div
                    className="h-full bg-orange-600"
                    style={{
                      width: `${(user.failedLoginAttempts / 3) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fecha de Bloqueo */}
      {user.blockedAt && (
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs font-medium text-red-600">Fecha de Bloqueo</p>
          <p className="mt-1 text-sm text-red-700">
            {new Date(user.blockedAt).toLocaleString("es-MX")}
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="space-y-2 border-t border-slate-200 pt-4">
        {isBlocked && (
          <button
            onClick={handleUnblock}
            disabled={loading}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Desbloqueando..." : "Desbloquear Usuario"}
          </button>
        )}

        {!isBlocked && (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-600">
              {isPendingActivation
                ? "El usuario debe activar su contraseña para acceder."
                : isInactive
                  ? "El usuario está inactivo (baja lógica)."
                  : "El usuario tiene acceso normal."}
            </p>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
