import { useEffect, useState } from "react";
import { getEntityAuditHistory, type AccessAuditEvent } from "../../data/userAccessAuditStorage";
import { getAccessStatusLabel } from "../../data/accessStatusCatalog";

interface UserAccessAuditHistoryProps {
  userId: string;
  maxItems?: number;
}

export default function UserAccessAuditHistory({
  userId,
  maxItems = 10,
}: UserAccessAuditHistoryProps) {
  const [events, setEvents] = useState<AccessAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      const history = getEntityAuditHistory(userId);
      setEvents(history.slice(0, maxItems));
      setIsLoading(false);
    };

    loadHistory();
  }, [userId, maxItems]);

  const getEventColor = (eventType: string) => {
    const colorMap: Record<string, string> = {
      CREAR_USUARIO: "bg-blue-50 text-blue-700",
      EDITAR_USUARIO: "bg-slate-50 text-slate-700",
      CAMBIO_PERFIL: "bg-purple-50 text-purple-700",
      CAMBIO_ESTADO_ACCESO: "bg-indigo-50 text-indigo-700",
      ACTIVAR_USUARIO: "bg-green-50 text-green-700",
      INACTIVAR_USUARIO: "bg-red-50 text-red-700",
      BLOQUEAR_USUARIO: "bg-red-50 text-red-700",
      DESBLOQUEAR_USUARIO: "bg-green-50 text-green-700",
      INTENTO_LOGIN_FALLIDO: "bg-orange-50 text-orange-700",
      LOGIN_EXITOSO: "bg-green-50 text-green-700",
      ACTIVACION_CONTRASENA: "bg-blue-50 text-blue-700",
      RESETEO_INTENTOS: "bg-green-50 text-green-700",
    };
    return colorMap[eventType] || "bg-slate-50 text-slate-700";
  };

  const getOriginBadge = (origin: string) => {
    const badgeMap: Record<string, string> = {
      Manual: "bg-slate-100 text-slate-600",
      Sistema: "bg-blue-100 text-blue-600",
      Seguridad: "bg-red-100 text-red-600",
    };
    return badgeMap[origin] || "bg-slate-100 text-slate-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Cargando historial...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">No hay eventos registrados</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className={`rounded-lg border border-slate-200 p-3 ${getEventColor(
            event.eventType
          )}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{event.eventType}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getOriginBadge(event.origin)}`}>
                  {event.origin}
                </span>
              </div>

              {event.details && (
                <p className="mt-1 text-xs">{event.details}</p>
              )}

              {event.fieldModified && (
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs md:grid-cols-3">
                  <div>
                    <span className="font-medium">Campo:</span> {event.fieldModified}
                  </div>
                  {event.oldValue !== undefined && (
                    <div>
                      <span className="font-medium">Antes:</span> {String(event.oldValue)}
                    </div>
                  )}
                  {event.newValue !== undefined && (
                    <div>
                      <span className="font-medium">Después:</span> {String(event.newValue)}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span>Por: {event.executedBy}</span>
                <span>
                  {new Date(event.executedAt).toLocaleString("es-MX")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
