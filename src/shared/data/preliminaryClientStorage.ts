const PRELIMINARY_CLIENTS_KEY = "odiseo_preliminary_clients";

export type PreliminaryClientStatus = "En validación" | "Rechazado" | "Convertido a cliente SI";
export type ClientOrigin = "Portal ODISEO";

export interface PreliminaryClient {
  id: string;
  code: string;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  status: PreliminaryClientStatus;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  siCode?: string; // Se asigna cuando se vincula con cliente del SI
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistClients(records: PreliminaryClient[]) {
  localStorage.setItem(PRELIMINARY_CLIENTS_KEY, JSON.stringify(records));
}

function getNextClientCode(): string {
  const clients = getAllPreliminaryClients();
  const codes = clients.map((c) => Number(c.code.replace("CLI-P-", "")));
  const maxCode = Math.max(0, ...codes);
  return `CLI-P-${String(maxCode + 1).padStart(6, "0")}`;
}

export function getAllPreliminaryClients(): PreliminaryClient[] {
  return safeParseArray<PreliminaryClient>(localStorage.getItem(PRELIMINARY_CLIENTS_KEY));
}

export function getPreliminaryClientByRuc(ruc: string): PreliminaryClient | undefined {
  return getAllPreliminaryClients().find((c) => c.ruc === ruc);
}

export function getPreliminaryClientByRazonSocial(razonSocial: string): PreliminaryClient | undefined {
  return getAllPreliminaryClients().find(
    (c) => c.razonSocial.toLowerCase() === razonSocial.toLowerCase()
  );
}

export function getPreliminaryClientById(id: string): PreliminaryClient | undefined {
  return getAllPreliminaryClients().find((c) => c.id === id);
}

export function getPreliminaryClientByCode(code: string): PreliminaryClient | undefined {
  return getAllPreliminaryClients().find((c) => c.code === code);
}

export function createPreliminaryClient(
  clientData: Omit<PreliminaryClient, "id" | "code" | "createdAt" | "updatedAt">
): PreliminaryClient {
  const now = new Date().toISOString();
  const code = getNextClientCode();
  const id = `PRELI-${code}`;

  const client: PreliminaryClient = {
    ...clientData,
    id,
    code,
    createdAt: now,
    updatedAt: now,
  };

  const existing = getAllPreliminaryClients();
  persistClients([client, ...existing]);
  return client;
}

export function updatePreliminaryClient(
  id: string,
  updates: Partial<Omit<PreliminaryClient, "id" | "code" | "createdAt">>
): PreliminaryClient | null {
  const client = getPreliminaryClientById(id);
  if (!client) return null;

  const updated: PreliminaryClient = {
    ...client,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const existing = getAllPreliminaryClients();
  const filtered = existing.filter((c) => c.id !== id);
  persistClients([updated, ...filtered]);
  return updated;
}

export function deletePreliminaryClient(id: string): boolean {
  const existing = getAllPreliminaryClients();
  const filtered = existing.filter((c) => c.id !== id);
  persistClients(filtered);
  return true;
}

export function changePreliminaryClientStatus(
  id: string,
  status: PreliminaryClientStatus
): PreliminaryClient | null {
  return updatePreliminaryClient(id, { status });
}

export function linkPreliminaryClientToSI(
  id: string,
  siCode: string
): PreliminaryClient | null {
  return updatePreliminaryClient(id, {
    siCode,
    status: "Convertido a cliente SI",
  });
}

export function getValidationPreliminaryClients(): PreliminaryClient[] {
  return getAllPreliminaryClients().filter((c) => c.status === "En validación");
}
