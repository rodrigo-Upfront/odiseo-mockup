const VENDORS_MIRROR_KEY = "odiseo_vendors_mirror";
const SYNC_TIMESTAMP_KEY = "odiseo_vendors_sync_timestamp";

export type VendorStatus = "Activo" | "Inactivo";

export interface VendorMirror {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  area: string;
  status: VendorStatus;
  lastSyncedAt: string;
}

const INITIAL_VENDORS_MIRROR: VendorMirror[] = [
  {
    id: "VND-001",
    code: "EJC-000001",
    name: "JOSÉ CANNY",
    email: "jose.canny@amcor.com",
    phone: "+51 999 001 001",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-002",
    code: "EJC-000002",
    name: "AUGUSTO OTERO",
    email: "augusto.otero@amcor.com",
    phone: "+51 999 002 002",
    position: "Líder Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-003",
    code: "EJC-000003",
    name: "DIANA FERNANDEZ",
    email: "diana.fernandez@amcor.com",
    phone: "+51 999 003 003",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-004",
    code: "EJC-000004",
    name: "GUSTAVO LOBATÓN",
    email: "gustavo.lobaton@amcor.com",
    phone: "+51 999 004 004",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-005",
    code: "EJC-000005",
    name: "OSWALDO LOAYZA",
    email: "oswaldo.loayza@amcor.com",
    phone: "+51 999 005 005",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-006",
    code: "EJC-000006",
    name: "MATEO PALOMINO",
    email: "mateo.palomino@amcor.com",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Inactivo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-007",
    code: "EJC-000007",
    name: "FERNANDO PATRONI",
    email: "fernando.patroni@amcor.com",
    phone: "+51 999 007 007",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-008",
    code: "EJC-000008",
    name: "DAVID RODRIGUEZ",
    email: "david.rodriguez@amcor.com",
    phone: "+51 999 008 008",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-009",
    code: "EJC-000009",
    name: "ANDREA PEREZ",
    email: "andrea.perez@amcor.com",
    phone: "+51 999 009 009",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-010",
    code: "EJC-000010",
    name: "NICOLAS BARREDA",
    email: "nicolas.barreda@amcor.com",
    phone: "+51 999 010 010",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-011",
    code: "EJC-000011",
    name: "MARCIO SOTO",
    email: "marcio.soto@amcor.com",
    phone: "+51 999 011 011",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
  {
    id: "VND-012",
    code: "EJC-000012",
    name: "ARLYS SALINAS",
    email: "arlys.salinas@amcor.com",
    phone: "+51 999 012 012",
    position: "Ingeniero de Desarrollo",
    area: "R&D",
    status: "Activo",
    lastSyncedAt: "2026-04-24T10:30:00.000Z",
  },
];

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParse<T>(value: string | null): T | null {
  try {
    return JSON.parse(value || "null");
  } catch {
    return null;
  }
}

function persistVendors(records: VendorMirror[]) {
  localStorage.setItem(VENDORS_MIRROR_KEY, JSON.stringify(records));
}

function persistSyncTimestamp(timestamp: string) {
  localStorage.setItem(SYNC_TIMESTAMP_KEY, timestamp);
}

export function getLastSyncTimestamp(): string {
  const timestamp = safeParse<string>(localStorage.getItem(SYNC_TIMESTAMP_KEY));
  return timestamp || "2026-04-24T10:30:00.000Z";
}

export function getAllVendorsMirror(): VendorMirror[] {
  const synced = safeParseArray<VendorMirror>(localStorage.getItem(VENDORS_MIRROR_KEY));
  const syncedIds = new Set(synced.map((v) => v.id));
  const initialWithoutDuplicates = INITIAL_VENDORS_MIRROR.filter(
    (v) => !syncedIds.has(v.id)
  );
  return [...synced, ...initialWithoutDuplicates];
}

export function getActiveVendorsMirror(): VendorMirror[] {
  return getAllVendorsMirror().filter((v) => v.status === "Activo");
}

export function getVendorMirrorByCode(code: string): VendorMirror | undefined {
  return getAllVendorsMirror().find((v) => v.code === code);
}

export function getVendorMirrorById(id: string): VendorMirror | undefined {
  return getAllVendorsMirror().find((v) => v.id === id);
}

export function syncVendorsFromSI(vendorsList: VendorMirror[]): void {
  const existingIds = new Set(
    safeParseArray<VendorMirror>(localStorage.getItem(VENDORS_MIRROR_KEY)).map((v) => v.id)
  );

  const newVendors = vendorsList.filter((v) => !existingIds.has(v.id));
  const existingVendors = safeParseArray<VendorMirror>(
    localStorage.getItem(VENDORS_MIRROR_KEY)
  );

  const updatedVendors = existingVendors.map((existing) => {
    const updated = vendorsList.find((v) => v.id === existing.id);
    return updated ? { ...updated, lastSyncedAt: new Date().toISOString() } : existing;
  });

  const allVendors = [...updatedVendors, ...newVendors.map((v) => ({
    ...v,
    lastSyncedAt: new Date().toISOString(),
  }))];

  persistVendors(allVendors);
  persistSyncTimestamp(new Date().toISOString());
}

export function updateVendorStatus(vendorId: string, status: VendorStatus): void {
  const vendor = getVendorMirrorById(vendorId);
  if (!vendor) return;

  const synced = safeParseArray<VendorMirror>(localStorage.getItem(VENDORS_MIRROR_KEY));
  const filtered = synced.filter((v) => v.id !== vendorId);
  const updated = {
    ...vendor,
    status,
    lastSyncedAt: new Date().toISOString(),
  };

  persistVendors([updated, ...filtered]);
}

export function formatSyncTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function searchSistemaIntegralUsers(query: string): VendorMirror[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();
  const allVendors = getAllVendorsMirror();

  return allVendors.filter((vendor) => {
    const code = vendor.code.toLowerCase();
    const name = vendor.name.toLowerCase();
    const email = (vendor.email || "").toLowerCase();
    const area = vendor.area.toLowerCase();

    return (
      code.includes(searchTerm) ||
      name.includes(searchTerm) ||
      email.includes(searchTerm) ||
      area.includes(searchTerm)
    );
  });
}
