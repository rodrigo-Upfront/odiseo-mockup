const AREA_RESPONSIBLES_STORAGE_KEY = "odiseo_area_responsibles";

export type AreaType = "Técnica" | "Desarrollo" | "Master Data";

export type AreaResponsibleRecord = {
  id: number;
  name: string;
  email?: string;
  area: AreaType;
  status: "Activo" | "Inactivo";
  createdAt: string;
  updatedAt: string;
};

const INITIAL_AREA_RESPONSIBLES: AreaResponsibleRecord[] = [
  {
    id: 1,
    name: "ELIZABETH GONZALES",
    email: "elizabeth.gonzales@amcor.com",
    area: "Técnica",
    status: "Activo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "ROSARIO HUANACO",
    email: "rosario.huanaco@amcor.com",
    area: "Desarrollo",
    status: "Activo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "JULIO VALERIO",
    email: "julio.valerio@amcor.com",
    area: "Master Data",
    status: "Activo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 4,
    name: "ANDREA PEREZ",
    email: "andrea.perez@amcor.com",
    area: "Master Data",
    status: "Activo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
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

function persistAreaResponsibles(records: AreaResponsibleRecord[]) {
  localStorage.setItem(AREA_RESPONSIBLES_STORAGE_KEY, JSON.stringify(records));
}

export function getCreatedAreaResponsibles(): AreaResponsibleRecord[] {
  return safeParseArray<AreaResponsibleRecord>(
    localStorage.getItem(AREA_RESPONSIBLES_STORAGE_KEY)
  );
}

export function getAreaResponsibleRecords(): AreaResponsibleRecord[] {
  const createdResponsibles = getCreatedAreaResponsibles();

  const createdNames = new Set(
    createdResponsibles.map((responsible) => responsible.name)
  );

  const initialWithoutDuplicates = INITIAL_AREA_RESPONSIBLES.filter(
    (responsible) => !createdNames.has(responsible.name)
  );

  return [...createdResponsibles, ...initialWithoutDuplicates];
}

export function getActiveAreaResponsibles(): AreaResponsibleRecord[] {
  return getAreaResponsibleRecords().filter(
    (responsible) => responsible.status === "Activo"
  );
}

export function getAreaResponsiblesByArea(
  area: AreaType
): AreaResponsibleRecord[] {
  return getActiveAreaResponsibles().filter(
    (responsible) => responsible.area === area
  );
}

export function getAreaResponsibleById(
  id: number
): AreaResponsibleRecord | undefined {
  return getAreaResponsibleRecords().find((responsible) => responsible.id === id);
}

export function getAreaResponsibleByName(
  name: string
): AreaResponsibleRecord | undefined {
  return getAreaResponsibleRecords().find(
    (responsible) => responsible.name.toUpperCase() === name.toUpperCase()
  );
}

export function saveAreaResponsibleRecord(record: AreaResponsibleRecord) {
  const saved = getCreatedAreaResponsibles();

  const filtered = saved.filter((responsible) => responsible.name !== record.name);

  persistAreaResponsibles([record, ...filtered]);
}

export function updateAreaResponsibleRecord(
  name: string,
  updatedRecord: Partial<AreaResponsibleRecord>
) {
  const saved = getCreatedAreaResponsibles();

  const existsInCreated = saved.some((responsible) => responsible.name === name);

  if (!existsInCreated) {
    const responsible = getAreaResponsibleByName(name);
    if (!responsible) return;

    persistAreaResponsibles([
      {
        ...responsible,
        ...updatedRecord,
        updatedAt: new Date().toISOString(),
      },
      ...saved,
    ]);

    return;
  }

  const updated = saved.map((responsible) =>
    responsible.name === name
      ? {
          ...responsible,
          ...updatedRecord,
          updatedAt: new Date().toISOString(),
        }
      : responsible
  );

  persistAreaResponsibles(updated);
}

export function deactivateAreaResponsibleRecord(name: string) {
  const responsible = getAreaResponsibleByName(name);

  if (!responsible) return;

  updateAreaResponsibleRecord(name, {
    status: "Inactivo",
    updatedAt: new Date().toISOString(),
  });
}

export function getNextAreaResponsibleId() {
  const responsibles = getAreaResponsibleRecords();
  const ids = responsibles.map((r) => Number(r.id)).filter(Boolean);

  return Math.max(0, ...ids) + 1;
}
