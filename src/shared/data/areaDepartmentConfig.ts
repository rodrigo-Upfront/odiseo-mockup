import type { UserRole } from "./userStorage";

export type PortalRole = "operador" | "validador" | "supervisor" | "administrador";

export interface AreaConfig {
  name: string;
  positions: string[];
}

export const AREA_POSITION_CONFIG: Record<string, AreaConfig> = {
  "Comercial": {
    name: "Comercial",
    positions: ["Ejecutivo Comercial", "Líder Comercial"],
  },
  "Artes Gráficas": {
    name: "Artes Gráficas",
    positions: ["Operador", "Coordinador"],
  },
  "R&D": {
    name: "R&D",
    positions: ["Ingeniero de Desarrollo", "Ingeniero de Área Técnica"],
  },
  "Commercial Finance": {
    name: "Commercial Finance",
    positions: ["Responsable"],
  },
  "Master Data": {
    name: "Master Data",
    positions: ["Data Manager", "Data Steward"],
  },
  "Minsait": {
    name: "Minsait",
    positions: ["Consultores", "Data Engineer", "Data Governance", "Funcional"],
  },
  "Administración": {
    name: "Administración",
    positions: ["Administrador", "Coordinador"],
  },
  "TI": {
    name: "TI",
    positions: ["Administrador", "Técnico"],
  },
};

// Mapeo de Puesto → Rol del Portal ODISEO
const POSITION_TO_ROLE_MAP: Record<string, PortalRole> = {
  // Comercial
  "Ejecutivo Comercial": "operador",
  "Líder Comercial": "supervisor",

  // Artes Gráficas
  "Operador": "validador",
  "Coordinador": "supervisor",

  // R&D
  "Ingeniero de Desarrollo": "validador",
  "Ingeniero de Área Técnica": "validador",

  // Commercial Finance
  "Responsable": "supervisor",

  // Master Data
  "Data Manager": "supervisor",
  "Data Steward": "supervisor",

  // Minsait
  "Consultores": "validador",
  "Consultor": "validador",
  "Data Engineer": "validador",
  "Data Governance": "validador",
  "Funcional": "validador",

  // Administración
  "Administrador": "administrador",

  // TI
  "Técnico": "administrador",
};

export const AREAS = Object.keys(AREA_POSITION_CONFIG);

export const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  operador: "Operador",
  validador: "Validador",
  supervisor: "Supervisor",
  administrador: "Administrador",
};

export const PORTAL_ROLE_DESCRIPTIONS: Record<PortalRole, string> = {
  operador: "Ejecutivo comercial. Puede imputar datos de entrada para Portafolio y Proyecto.",
  validador: "Artes Gráficas y R&D. Puede hacer validaciones en P2 y P3 respectivamente.",
  supervisor: "Master Data. Puede modificar datos en caso de observaciones o errores. También puede modificar estados y datos.",
  administrador: "Creador de usuarios y clientes. Solo ellos pueden realizar estas actividades.",
};

export function getPositionsByArea(area: string): string[] {
  return AREA_POSITION_CONFIG[area]?.positions || [];
}

export function getRoleByPosition(position: string): PortalRole {
  return POSITION_TO_ROLE_MAP[position] || "operador";
}

const normalizeText = (value?: string) =>
  value?.trim().toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") || "";

export const isLeadershipPosition = (position?: string): boolean => {
  const normalizedPosition = normalizeText(position);

  return (
    normalizedPosition.includes("lider") ||
    normalizedPosition.includes("jefe") ||
    normalizedPosition.includes("coordinador") ||
    normalizedPosition.includes("supervisor") ||
    normalizedPosition.includes("gerente") ||
    normalizedPosition.includes("manager") ||
    normalizedPosition.includes("head")
  );
};

export function getRoleByAreaAndPosition(
  area?: string,
  position?: string
): UserRole {
  const normalizedArea = normalizeText(area);

  if (
    normalizedArea.includes("customer service") ||
    normalizedArea.includes("costumer service") ||
    normalizedArea.includes("servicio al cliente")
  ) {
    return "customer_service";
  }

  if (normalizedArea.includes("comercial")) {
    return "commercial";
  }

  if (
    normalizedArea.includes("master data") ||
    normalizedArea.includes("datos maestros") ||
    normalizedArea.includes("maestro de datos")
  ) {
    return "master_data";
  }

  if (
    normalizedArea.includes("ti") ||
    normalizedArea.includes("sistemas") ||
    normalizedArea.includes("administracion") ||
    normalizedArea.includes("administrador")
  ) {
    return "administrator";
  }

  return "commercial";
}

export function getAllowedRolesByAreaAndPosition(
  area?: string,
  position?: string
): UserRole[] {
  const mainRole = getRoleByAreaAndPosition(area, position);
  return [mainRole];
}
