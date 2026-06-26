// Estado de acceso del usuario ODISEO
export type AccessStatusCode =
  | "PENDIENTE_ACTIVACION"
  | "HABILITADO"
  | "BLOQUEADO";

export interface AccessStatus {
  id: number;
  code: AccessStatusCode;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  createdByUser: string;
  updatedAt?: string;
  updatedByUser?: string;
}

// Catálogo maestro de estados de acceso
export const ACCESS_STATUS_CATALOG: AccessStatus[] = [
  {
    id: 1,
    code: "PENDIENTE_ACTIVACION",
    name: "Pendiente de activación",
    description: "El usuario aún no genera su contraseña",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdByUser: "SISTEMA",
  },
  {
    id: 2,
    code: "HABILITADO",
    name: "Habilitado",
    description: "El usuario ya puede ingresar a ODISEO",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdByUser: "SISTEMA",
  },
  {
    id: 3,
    code: "BLOQUEADO",
    name: "Bloqueado",
    description: "El usuario está bloqueado por intentos fallidos o acción administrativa",
    active: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdByUser: "SISTEMA",
  },
];

const CATALOG_STORAGE_KEY = "odiseo_access_status_catalog";

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCatalog(catalog: AccessStatus[]) {
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
}

export function getAccessStatusCatalog(): AccessStatus[] {
  const saved = safeParseArray<AccessStatus>(
    localStorage.getItem(CATALOG_STORAGE_KEY)
  );

  if (saved.length === 0) {
    persistCatalog(ACCESS_STATUS_CATALOG);
    return ACCESS_STATUS_CATALOG;
  }

  return saved;
}

export function getAccessStatusById(id: number): AccessStatus | undefined {
  return getAccessStatusCatalog().find((status) => status.id === id);
}

export function getAccessStatusByCode(code: AccessStatusCode): AccessStatus | undefined {
  return getAccessStatusCatalog().find((status) => status.code === code);
}

export function getActiveAccessStatuses(): AccessStatus[] {
  return getAccessStatusCatalog().filter((status) => status.active);
}

export function getAccessStatusLabel(code: AccessStatusCode): string {
  const status = getAccessStatusByCode(code);
  return status?.name || code;
}
