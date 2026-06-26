/**
 * Sistema de historial de validaciones — Auditoría completa del flujo
 *
 * Registra TODOS los eventos de validación:
 * - Solicitud de validación
 * - Toma en revisión
 * - Aprobaciones (AG, R&D)
 * - Observaciones
 * - Cambios de paso (Artes Gráficas → R&D)
 * - Retornos a corrección
 */

export type ValidationEventType =
  | "validation_requested"           // Ejecutivo solicita validación
  | "graphic_arts_pending"            // Artes Gráficas: En Revisión
  | "graphic_arts_auto_approved"      // Artes Gráficas: automático
  | "graphic_arts_review_started"     // Artes Gráficas: comienza revisión
  | "graphic_arts_approved"           // Artes Gráficas: aprobada
  | "graphic_arts_observed"           // Artes Gráficas: observada
  | "derived_to_rnd_tecnica"          // Derivado a R&D Técnica
  | "derived_to_rnd_desarrollo"       // Derivado a R&D Desarrollo
  | "rnd_review_started"              // R&D: comienza revisión
  | "rnd_approved"                    // R&D: aprobada (proyecto validado)
  | "rnd_observed"                    // R&D: observada
  | "project_validated"               // Proyecto completamente validado
  | "returned_to_edit"                // Devuelto a Ejecutivo para correcciones
  | "validation_restarted";           // Nueva ronda de validación

export interface ValidationHistoryRecord {
  id: string;
  projectCode: string;
  timestamp: string;
  eventType: ValidationEventType;

  // Quién realizó la acción
  actedBy?: string;           // Nombre del validador o ejecutivo
  actedByRole?: "Ejecutivo" | "Artes Gráficas" | "R&D Técnica" | "R&D Desarrollo";

  // Contexto del evento
  fromStatus?: string;        // Estado anterior
  toStatus?: string;          // Estado nuevo
  fromValidationStep?: string;
  toValidationStep?: string;

  // Validaciones implicadas
  graphicArtsStatus?: string; // Estado AG en este punto
  technicalStatus?: string;   // Estado R&D en este punto
  technicalSubArea?: string;  // R&D Técnica o R&D Desarrollo

  // Comentarios y observaciones
  comment?: string;           // Comentario del validador
  observation?: string;       // Si es observación
  observationReason?: string;

  // Metadata
  validationRound?: number;
  isAutomatic?: boolean;      // Si fue aprobación automática
  metadata?: Record<string, any>;
}

const VALIDATION_HISTORY_KEY = "odiseo_validation_history";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readHistoryFromStorage(): ValidationHistoryRecord[] {
  if (!isBrowser()) return [];
  try {
    const stored = localStorage.getItem(VALIDATION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeHistoryToStorage(records: ValidationHistoryRecord[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(VALIDATION_HISTORY_KEY, JSON.stringify(records));
  } catch {
    console.error("Failed to save validation history");
  }
}

export function recordValidationEvent(event: Omit<ValidationHistoryRecord, 'id'>): ValidationHistoryRecord {
  const history = readHistoryFromStorage();

  const record: ValidationHistoryRecord = {
    ...event,
    id: `${event.projectCode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  history.push(record);
  writeHistoryToStorage(history);

  return record;
}

export function getProjectValidationHistory(projectCode: string): ValidationHistoryRecord[] {
  const history = readHistoryFromStorage();
  return history
    .filter((record) => record.projectCode === projectCode)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function clearProjectHistory(projectCode: string) {
  const history = readHistoryFromStorage();
  const filtered = history.filter((record) => record.projectCode !== projectCode);
  writeHistoryToStorage(filtered);
}

export function getValidationEventLabel(eventType: ValidationEventType): string {
  const labels: Record<ValidationEventType, string> = {
    validation_requested: "Solicitud de validación",
    graphic_arts_pending: "Artes Gráficas: En Revisión",
    graphic_arts_auto_approved: "Artes Gráficas: Aprobada automáticamente",
    graphic_arts_review_started: "Artes Gráficas: Revisión iniciada",
    graphic_arts_approved: "Artes Gráficas: Aprobada ✓",
    graphic_arts_observed: "Artes Gráficas: Observada",
    derived_to_rnd_tecnica: "Derivado a R&D Técnica →",
    derived_to_rnd_desarrollo: "Derivado a R&D Desarrollo →",
    rnd_review_started: "R&D: Revisión iniciada",
    rnd_approved: "R&D: Aprobada ✓",
    rnd_observed: "R&D: Observada",
    project_validated: "✅ Proyecto VALIDADO",
    returned_to_edit: "Devuelto a Ejecutivo para correcciones",
    validation_restarted: "Nueva ronda de validación iniciada",
  };
  return labels[eventType] || eventType;
}

export function getValidationEventColor(eventType: ValidationEventType): string {
  if (eventType.includes("approved") || eventType === "project_validated") {
    return "bg-green-50 border-green-200 text-green-900";
  }
  if (eventType.includes("observed")) {
    return "bg-orange-50 border-orange-200 text-orange-900";
  }
  if (eventType.includes("started") || eventType.includes("pending")) {
    return "bg-yellow-50 border-yellow-200 text-yellow-900";
  }
  if (eventType.includes("derived")) {
    return "bg-blue-50 border-blue-200 text-blue-900";
  }
  if (eventType === "returned_to_edit") {
    return "bg-red-50 border-red-200 text-red-900";
  }
  return "bg-slate-50 border-slate-200 text-slate-900";
}
