// Auditoría de cambios de estado de acceso del usuario
import type { AccessStatusCode } from "./accessStatusCatalog";

export type AccessAuditEventType =
  | "CREAR_USUARIO"
  | "EDITAR_USUARIO"
  | "CAMBIO_PERFIL"
  | "CAMBIO_ESTADO_ACCESO"
  | "ACTIVAR_USUARIO"
  | "INACTIVAR_USUARIO"
  | "BLOQUEAR_USUARIO"
  | "DESBLOQUEAR_USUARIO"
  | "INTENTO_LOGIN_FALLIDO"
  | "LOGIN_EXITOSO"
  | "ACTIVACION_CONTRASENA"
  | "RESETEO_INTENTOS";

export type AuditOrigin = "Manual" | "Sistema" | "Seguridad";

export interface AccessAuditEvent {
  id: string;
  userId: string;
  eventType: AccessAuditEventType;
  entity: "TABUSUODISEO";
  entityId: string;
  fieldModified?: string;
  oldValue?: string | number | boolean;
  newValue?: string | number | boolean;
  executedBy: string;
  executedAt: string;
  origin: AuditOrigin;
  details?: string;
}

const AUDIT_STORAGE_KEY = "odiseo_access_audit_log";

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAudit(events: AccessAuditEvent[]) {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(events));
}

function generateEventId(): string {
  return `AUDIT-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function registerAccessAuditEvent(
  userId: string,
  eventType: AccessAuditEventType,
  entityId: string,
  executedBy: string,
  options?: {
    fieldModified?: string;
    oldValue?: string | number | boolean;
    newValue?: string | number | boolean;
    origin?: AuditOrigin;
    details?: string;
  }
): AccessAuditEvent {
  const audit = safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  );

  const event: AccessAuditEvent = {
    id: generateEventId(),
    userId,
    eventType,
    entity: "TABUSUODISEO",
    entityId,
    fieldModified: options?.fieldModified,
    oldValue: options?.oldValue,
    newValue: options?.newValue,
    executedBy,
    executedAt: new Date().toISOString(),
    origin: options?.origin || "Manual",
    details: options?.details,
  };

  persistAudit([event, ...audit]);

  return event;
}

export function getUserAccessAuditHistory(userId: string): AccessAuditEvent[] {
  const audit = safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  );

  return audit
    .filter((event) => event.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
}

export function getEntityAuditHistory(entityId: string): AccessAuditEvent[] {
  const audit = safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  );

  return audit
    .filter((event) => event.entityId === entityId)
    .sort(
      (a, b) =>
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
}

export function getAllAccessAuditHistory(): AccessAuditEvent[] {
  return safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  ).sort(
    (a, b) =>
      new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  );
}

export function getAuditEventsByType(eventType: AccessAuditEventType): AccessAuditEvent[] {
  const audit = safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  );

  return audit
    .filter((event) => event.eventType === eventType)
    .sort(
      (a, b) =>
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );
}

export function clearUserAccessAudit(userId: string): void {
  const audit = safeParseArray<AccessAuditEvent>(
    localStorage.getItem(AUDIT_STORAGE_KEY)
  );

  persistAudit(audit.filter((event) => event.userId !== userId));
}

export function clearAllAccessAudit(): void {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
}
