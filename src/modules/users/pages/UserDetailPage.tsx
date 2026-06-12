import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLayout } from "../../../components/layout/LayoutContext";
import {
  getUserById,
  STATUS_LABELS,
  STATUS_COLORS,
  getCurrentUser,
  activateUser,
  deactivateUser,
  blockUser,
  unblockUser,
  setPendingActivation,
  deleteUser,
  getAllUsers,
} from "../../../shared/data/userStorage";
import {
  registerUserStatusChange,
  getLatestStatusEvent,
  getUserStatusHistory,
} from "../../../shared/data/userStatusStorage";
import { mockSendEmail } from "../../../shared/data/notificationStorage";
import FormCard from "../../../shared/components/forms/FormCard";
import ActionButton from "../../../shared/components/buttons/ActionButton";
import UserAccessAuditHistory from "../../../shared/components/audit/UserAccessAuditHistory";
import UserAccessManagement from "../../../shared/components/audit/UserAccessManagement";

const STATUS_DESCRIPTIONS: Record<string, string> = {
  active: "El usuario está activo y puede acceder al sistema.",
  inactive: "El usuario está inactivo. Puede ser reactivado en cualquier momento.",
  pending_activation: "El usuario está pendiente de activación. Se ha enviado una notificación de bienvenida.",
  pending_validation: "El usuario está pendiente de validación por un administrador.",
  blocked: "El usuario está bloqueado. Solo un administrador puede desbloquearlo.",
};

const ACTION_DESCRIPTIONS: Record<string, { title: string; subtitle: string }> = {
  activation: {
    title: "Usuario creado",
    subtitle: "Pendiente de activación",
  },
  reactivation: {
    title: "Usuario reactivado",
    subtitle: "Vuelto a estado activo",
  },
  unblock: {
    title: "Usuario desbloqueado",
    subtitle: "Vuelto a estado activo",
  },
  approval_request: {
    title: "Solicitud de aprobación",
    subtitle: "Esperando revisión",
  },
  approval_result: {
    title: "Resultado de aprobación",
    subtitle: "Acción completada",
  },
};

export default function UserDetailPage() {
  const navigate = useNavigate();
  const { setHeader, resetHeader } = useLayout();
  const { userId } = useParams<{ userId: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [modalState, setModalState] = useState<{
    type: "resend" | "delete" | "deactivate" | "block" | "unblock" | null;
    isOpen: boolean;
    hasAssociations?: boolean;
  }>({ type: null, isOpen: false });

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!userId) {
      setError("ID de usuario no válido");
      setLoading(false);
      return;
    }

    const userData = getUserById(userId);
    if (!userData) {
      setError(`Usuario con ID ${userId} no encontrado`);
      setLoading(false);
      return;
    }

    setUser(userData);
    setStatusHistory(getUserStatusHistory(userId));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (user) {
      setHeader({
        title: user.fullName,
        breadcrumbs: [
          { label: "Usuarios", href: "/users" },
          { label: "Ver detalle de usuario" },
        ],
      });
    }
    return () => resetHeader();
  }, [user, setHeader, resetHeader]);

  const handleStatusChange = (newStatus: any, action?: string) => {
    if (!user) return;
    setActionInProgress(true);

    try {
      // Determinar la función a llamar basada en el nuevo estado
      if (newStatus === "active") {
        activateUser(user.id);
      } else if (newStatus === "inactive") {
        deactivateUser(user.id);
      } else if (newStatus === "blocked") {
        blockUser(user.id);
      } else if (newStatus === "pending_activation") {
        setPendingActivation(user.id);
      }

      // Registrar el cambio de estado
      registerUserStatusChange(
        user.id,
        user.status,
        newStatus,
        currentUser?.id || "system",
        action || undefined
      );

      // Si es reactivación desde pending_activation, enviar email
      if (newStatus === "pending_activation" && user.status !== "pending_activation") {
        mockSendEmail(
          user.email,
          "Reenvío de Activación de Cuenta - ODISEO",
          `Hola ${user.firstName},\n\nTu cuenta ha sido reiniciada. Por favor, completa el proceso de activación.\n\nEquipo ODISEO`,
          user.id,
          "reactivation"
        );
      }

      // Recargar datos
      const updatedUser = getUserById(user.id);
      setUser(updatedUser);
      setStatusHistory(getUserStatusHistory(user.id));
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResendActivation = () => {
    if (!user) return;
    setActionInProgress(true);

    try {
      mockSendEmail(
        user.email,
        "Reenvío de Link de Activación - ODISEO",
        `Hola ${user.firstName},\n\nSe te reenviará el link de activación de tu cuenta.\n\nEquipo ODISEO`,
        user.id,
        "activation"
      );

      registerUserStatusChange(
        user.id,
        user.status,
        user.status,
        currentUser?.id || "system",
        "Reenvío de link de activación"
      );

      // Mostrar mensaje de éxito
      setModalState({ type: "resend", isOpen: false });
      alert("Link de activación reenviado correctamente.");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteUser = () => {
    if (!user) return;

    // Verificar asociaciones con Portfolio y Proyectos
    const allUsers = getAllUsers();
    const hasPortfolioAssociations = allUsers.some(
      (u: any) => u.portfolios && u.portfolios.includes(user.id)
    );
    const hasProjectAssociations = allUsers.some(
      (u: any) => u.projects && u.projects.includes(user.id)
    );

    const hasAssociations = hasPortfolioAssociations || hasProjectAssociations;

    if (hasAssociations) {
      setModalState({
        type: "delete",
        isOpen: true,
        hasAssociations: true,
      });
      return;
    }

    setActionInProgress(true);

    try {
      deleteUser(user.id);
      registerUserStatusChange(
        user.id,
        user.status,
        "inactive",
        currentUser?.id || "system",
        "Usuario eliminado"
      );

      // Mostrar mensaje de éxito y redirigir
      alert("Usuario eliminado correctamente.");
      navigate("/users");
    } finally {
      setActionInProgress(false);
    }
  };

  const closeModal = () => {
    setModalState({ type: null, isOpen: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Cargando usuario...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-600 font-semibold">{error || "Error cargando usuario"}</div>
        <button
          onClick={() => navigate("/users")}
          className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium"
        >
          Volver a Usuarios
        </button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[user.status] || "bg-slate-100 text-slate-700";

  return (
    <div className="w-full max-w-none bg-[#f6f8fb]">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="mb-3 flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Atrás
      </button>

      <div className="grid min-h-[calc(100vh-230px)] grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(380px,0.5fr)] p-5">
        {/* Columna izquierda - Ficha */}
        <div className="space-y-5">
          <FormCard title="Datos del Trabajador" icon="👤" color="#00395A">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Código Trabajador</p>
                  <p className="text-sm font-medium text-slate-900">{user.workerCode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Nombre</p>
                  <p className="text-sm font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Correo Corporativo</p>
                  <p className="text-sm font-medium text-slate-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Puesto</p>
                  <p className="text-sm font-medium text-slate-900">{user.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Área</p>
                  <p className="text-sm font-medium text-slate-900">{user.area || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Estado</p>
                  <p className="text-sm font-medium">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
                      {STATUS_LABELS[user.status]}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </FormCard>

          {statusHistory.length > 0 && (
            <FormCard title="Historial de Cambios" icon="📋" color="#EA580C">
              <div className="space-y-2">
                {statusHistory.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {STATUS_LABELS[event.toStatus]}
                      </p>
                      <p className="text-xs text-slate-500">
                        {event.fromStatus ? `De ${STATUS_LABELS[event.fromStatus]}` : "Creación"}
                        {event.changedBy && ` · Por ${event.changedBy}`}
                      </p>
                      {event.comment && <p className="text-xs text-slate-600 mt-1 italic">"{event.comment}"</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(event.changedAt).toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FormCard>
          )}
        </div>

        {/* Columna derecha - Acciones */}
        <div className="space-y-5">
          <FormCard title="Estado Actual" icon="⚡" color="#EA580C">
            <div className="space-y-4">
              <div>
                <div className={`rounded-lg px-4 py-3 ${statusColor}`}>
                  <p className="text-sm font-bold">{STATUS_LABELS[user.status]}</p>
                  <p className="text-xs mt-1 opacity-90">
                    {STATUS_DESCRIPTIONS[user.status] || ""}
                  </p>
                </div>
              </div>

              {/* Botones de acción por estado */}
              <div className="space-y-2">
                {user.status === "pending_activation" && (
                  <>
                    <ActionButton
                      onClick={() => handleStatusChange("active", "Cuenta activada")}
                      disabled={actionInProgress}
                      variant="primary"
                      size="sm"
                      label="Activar Cuenta"
                      fullWidth
                    />
                    <ActionButton
                      onClick={() => handleStatusChange("inactive", "Activación rechazada")}
                      disabled={actionInProgress}
                      variant="outline"
                      size="sm"
                      label="Rechazar"
                      fullWidth
                    />
                    <ActionButton
                      onClick={() => setModalState({ type: "resend", isOpen: true })}
                      disabled={actionInProgress}
                      variant="outline"
                      size="sm"
                      label="Reenviar Link de Activación"
                      fullWidth
                    />
                    {currentUser?.role === "administrator" && (
                      <ActionButton
                        onClick={() => setModalState({ type: "delete", isOpen: true })}
                        disabled={actionInProgress}
                        variant="danger"
                        size="sm"
                        label="Eliminar Usuario"
                        fullWidth
                      />
                    )}
                  </>
                )}

                {user.status === "pending_validation" && (
                  <>
                    <ActionButton
                      onClick={() => handleStatusChange("active", "Validación aprobada")}
                      disabled={actionInProgress}
                      variant="primary"
                      size="sm"
                      label="Aprobar y Activar"
                      fullWidth
                    />
                    <ActionButton
                      onClick={() => handleStatusChange("inactive", "Validación rechazada")}
                      disabled={actionInProgress}
                      variant="outline"
                      size="sm"
                      label="Rechazar → Inactivo"
                      fullWidth
                    />
                    {currentUser?.role === "administrator" && (
                      <ActionButton
                        onClick={() => setModalState({ type: "delete", isOpen: true })}
                        disabled={actionInProgress}
                        variant="danger"
                        size="sm"
                        label="Eliminar Usuario"
                        fullWidth
                      />
                    )}
                  </>
                )}

                {user.status === "active" && (
                  <>
                    <ActionButton
                      onClick={() => setModalState({ type: "deactivate", isOpen: true })}
                      disabled={actionInProgress}
                      variant="outline"
                      size="sm"
                      label="Desactivar"
                      fullWidth
                    />
                    {currentUser?.role === "administrator" && (
                      <ActionButton
                        onClick={() => setModalState({ type: "block", isOpen: true })}
                        disabled={actionInProgress}
                        variant="danger"
                        size="sm"
                        label="Bloquear"
                        fullWidth
                      />
                    )}
                  </>
                )}

                {user.status === "inactive" && (
                  <ActionButton
                    onClick={() => handleStatusChange("pending_activation", "Reactivación solicitada")}
                    disabled={actionInProgress}
                    variant="primary"
                    size="sm"
                    label="Reactivar"
                    fullWidth
                  />
                )}

                {user.status === "blocked" && currentUser?.role === "administrator" && (
                  <ActionButton
                    onClick={() => setModalState({ type: "unblock", isOpen: true })}
                    disabled={actionInProgress}
                    variant="success"
                    size="sm"
                    label="Desbloquear"
                    fullWidth
                  />
                )}
              </div>
            </div>
          </FormCard>

          <div>
            <ActionButton
              onClick={() => navigate(`/users/${user.id}/edit`)}
              variant="outline"
              size="sm"
              label="✏️ Editar Usuario"
              fullWidth
            />
          </div>

          {/* Access Management Component */}
          <UserAccessManagement
            user={user}
            currentUser={currentUser}
            onAccessChanged={() => {
              const updatedUser = getUserById(user.id);
              if (updatedUser) {
                setUser(updatedUser);
              }
            }}
          />

          {/* Audit History Component */}
          <FormCard title="Historial de Auditoría" icon="🔍" color="#0EA5E9">
            <UserAccessAuditHistory userId={user.id} maxItems={5} />
          </FormCard>
        </div>
      </div>

      {/* Modal: Resend Activation Link */}
      {modalState.type === "resend" && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reenviar Link de Activación</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Desea reenviar el link de activación a <strong>{user.email}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResendActivation}
                disabled={actionInProgress}
                className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-[#002944] disabled:opacity-50"
              >
                Reenviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete User */}
      {modalState.type === "delete" && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            {modalState.hasAssociations ? (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-2">No se puede eliminar el usuario</h3>
                <p className="text-sm text-slate-600 mb-6">
                  No se puede eliminar el usuario porque está asociado a un portafolio o proyecto.
                  Primero debe desasociar al usuario de todas sus asignaciones.
                </p>
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-medium hover:bg-slate-700"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Eliminar Usuario</h3>
                <p className="text-sm text-slate-600 mb-6">
                  El usuario <strong>{user.firstName} {user.lastName}</strong> será eliminado porque aún no activó su cuenta y no tiene asociaciones activas. ¿Desea continuar?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={actionInProgress}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Deactivate Confirmation */}
      {modalState.type === "deactivate" && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Desactivar Usuario</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Desea desactivar a <strong>{user.firstName} {user.lastName}</strong>? El usuario no podrá acceder al sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleStatusChange("inactive", "Desactivado por administrador");
                  closeModal();
                }}
                disabled={actionInProgress}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Block Confirmation */}
      {modalState.type === "block" && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Bloquear Usuario</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Desea bloquear a <strong>{user.firstName} {user.lastName}</strong>? El usuario no podrá acceder al sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleStatusChange("blocked", "Bloqueado por administrador");
                  closeModal();
                }}
                disabled={actionInProgress}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Unblock Confirmation */}
      {modalState.type === "unblock" && modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Desbloquear Usuario</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Desea desbloquear a <strong>{user.firstName} {user.lastName}</strong>? El usuario volverá a tener acceso al sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleStatusChange("active", "Desbloqueado por administrador");
                  closeModal();
                }}
                disabled={actionInProgress}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
