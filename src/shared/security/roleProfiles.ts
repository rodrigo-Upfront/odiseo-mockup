// Roles internos del sistema
export type InternalRoleCode =
  | "ADMIN"
  | "EDITOR"
  | "APPROVER"
  | "AUDITOR"
  | "VIEWER";

// Perfiles visibles para el usuario
export type ProfileCode =
  | "ADMINISTRADOR"
  | "EDITOR"
  | "AUDITOR"
  | "VISOR";

// Estado propio del Usuario ODISEO
export type OdiseoUserStatus =
  | "PENDIENTE_ACTIVACION"
  | "ACTIVO"
  | "INACTIVO"
  | "BLOQUEADO";

// Estado de sincronización con Sistema Integral
export type SyncStatus =
  | "PENDIENTE_SINCRONIZACION"
  | "SINCRONIZADO"
  | "ERROR_SINCRONIZACION";

// Legacy role codes for backward compatibility
export type RoleCode =
  | "admin"
  | "it_support"
  | "master_data"
  | "commercial"
  | "customer_service"
  | "rd"
  | "readonly";

export type PermissionCode =
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.deactivate"
  | "clients.read"
  | "portfolios.read"
  | "portfolios.create"
  | "portfolios.update"
  | "products.read"
  | "products.create"
  | "products.update"
  | "catalogs.read"
  | "catalogs.update"
  | "restrictions.read"
  | "restrictions.update"
  | "imports.execute"
  | "audit.read"
  | "settings.update";

export interface InternalRole {
  code: InternalRoleCode;
  name: string;
  description: string;
}

export interface AccessProfile {
  code: ProfileCode;
  name: string;
  internalRoles: InternalRoleCode[];
}

export interface RoleProfile {
  code: RoleCode;
  name: string;
  description: string;
  permissions: PermissionCode[];
}

// Roles internos del sistema
export const INTERNAL_ROLES: InternalRole[] = [
  {
    code: "ADMIN",
    name: "Administrador",
    description: "Control total del sistema.",
  },
  {
    code: "EDITOR",
    name: "Editor",
    description: "Puede crear, modificar y mantener información operativa.",
  },
  {
    code: "APPROVER",
    name: "Aprobador",
    description: "Puede aprobar, rechazar o devolver registros.",
  },
  {
    code: "AUDITOR",
    name: "Auditor",
    description: "Puede revisar bitácoras, historial, trazabilidad y cambios.",
  },
  {
    code: "VIEWER",
    name: "Visor",
    description: "Puede consultar información en modo solo lectura.",
  },
];

// Perfiles de acceso visibles para el usuario
export const ACCESS_PROFILES: AccessProfile[] = [
  {
    code: "ADMINISTRADOR",
    name: "Administrador",
    internalRoles: ["ADMIN", "EDITOR", "APPROVER", "AUDITOR", "VIEWER"],
  },
  {
    code: "EDITOR",
    name: "Editor",
    internalRoles: ["EDITOR", "VIEWER"],
  },
  {
    code: "AUDITOR",
    name: "Auditor",
    internalRoles: ["AUDITOR", "VIEWER"],
  },
  {
    code: "VISOR",
    name: "Visor",
    internalRoles: ["VIEWER"],
  },
];

// Legacy ROLE_PROFILES for backward compatibility
export const ROLE_PROFILES: RoleProfile[] = [
  {
    code: "admin",
    name: "Administrador",
    description: "Acceso total al portal ODISEO.",
    permissions: [
      "users.read",
      "users.create",
      "users.update",
      "users.deactivate",
      "clients.read",
      "portfolios.read",
      "portfolios.create",
      "portfolios.update",
      "products.read",
      "products.create",
      "products.update",
      "catalogs.read",
      "catalogs.update",
      "restrictions.read",
      "restrictions.update",
      "imports.execute",
      "audit.read",
      "settings.update",
    ],
  },
  {
    code: "it_support",
    name: "TI Soporte",
    description: "Perfil técnico para soporte, usuarios, auditoría y configuración.",
    permissions: [
      "users.read",
      "users.create",
      "users.update",
      "users.deactivate",
      "clients.read",
      "portfolios.read",
      "products.read",
      "catalogs.read",
      "catalogs.update",
      "restrictions.read",
      "restrictions.update",
      "audit.read",
      "settings.update",
    ],
  },
  {
    code: "master_data",
    name: "Master Data",
    description: "Gestión de datos maestros de negocio, portafolios, productos, catálogos y restricciones.",
    permissions: [
      "clients.read",
      "portfolios.read",
      "portfolios.create",
      "portfolios.update",
      "products.read",
      "products.create",
      "products.update",
      "catalogs.read",
      "catalogs.update",
      "restrictions.read",
      "restrictions.update",
      "imports.execute",
      "audit.read",
    ],
  },
  {
    code: "commercial",
    name: "Comercial",
    description: "Gestión comercial de portafolios y consulta de clientes/productos.",
    permissions: [
      "clients.read",
      "portfolios.read",
      "portfolios.create",
      "portfolios.update",
      "products.read",
      "catalogs.read",
    ],
  },
  {
    code: "customer_service",
    name: "Customer Service",
    description: "Creación y actualización de portafolios y productos, consulta de clientes.",
    permissions: [
      "clients.read",
      "portfolios.read",
      "portfolios.create",
      "portfolios.update",
      "products.read",
      "products.create",
      "products.update",
      "catalogs.read",
      "restrictions.read",
    ],
  },
  {
    code: "rd",
    name: "R&D",
    description: "Perfil para creación y actualización de productos y soporte técnico funcional en datos del producto.",
    permissions: [
      "clients.read",
      "portfolios.read",
      "portfolios.create",
      "portfolios.update",
      "products.read",
      "products.create",
      "products.update",
      "catalogs.read",
      "restrictions.read",
    ],
  },
  {
    code: "readonly",
    name: "Solo Consulta",
    description: "Acceso solo lectura al portal.",
    permissions: [
      "clients.read",
      "portfolios.read",
      "products.read",
      "catalogs.read",
    ],
  },
];

export function hasPermission(role: RoleCode, permission: PermissionCode): boolean {
  const profile = ROLE_PROFILES.find((item) => item.code === role);
  return Boolean(profile?.permissions.includes(permission));
}

export function getRoleProfile(code: RoleCode): RoleProfile | undefined {
  return ROLE_PROFILES.find((item) => item.code === code);
}

export function getAccessProfile(code: ProfileCode): AccessProfile | undefined {
  return ACCESS_PROFILES.find((item) => item.code === code);
}

export function getInternalRole(code: InternalRoleCode): InternalRole | undefined {
  return INTERNAL_ROLES.find((item) => item.code === code);
}

export function suggestRoleByArea(area: string): RoleCode {
  const normalizedArea = area.trim().toLowerCase();

  if (normalizedArea.includes("ti") || normalizedArea.includes("sistemas")) {
    return "it_support";
  }

  if (normalizedArea.includes("master data")) {
    return "master_data";
  }

  if (normalizedArea.includes("comercial")) {
    return "commercial";
  }

  if (normalizedArea.includes("customer service") || normalizedArea.includes("servicio")) {
    return "customer_service";
  }

  if (normalizedArea.includes("r&d") || normalizedArea.includes("rd") || normalizedArea.includes("desarrollo")) {
    return "rd";
  }

  return "readonly";
}

// Helper function to get profile options for dropdown
export function getAccessProfileOptions() {
  return ACCESS_PROFILES.map((profile) => ({
    value: profile.code,
    label: profile.name,
  }));
}

// Helper function to check if a profile has a specific internal role
export function profileHasInternalRole(profileCode: ProfileCode, internalRole: InternalRoleCode): boolean {
  const profile = getAccessProfile(profileCode);
  return Boolean(profile?.internalRoles.includes(internalRole));
}

// Helper function to get all internal roles for a profile
export function getProfileInternalRoles(profileCode: ProfileCode): InternalRoleCode[] {
  const profile = getAccessProfile(profileCode);
  return profile?.internalRoles || [];
}

// Labels para estado ODISEO
export const ODISEO_USER_STATUS_LABELS: Record<OdiseoUserStatus, string> = {
  PENDIENTE_ACTIVACION: "Pendiente de activación",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  BLOQUEADO: "Bloqueado",
};

// Labels para estado de sincronización
export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  PENDIENTE_SINCRONIZACION: "Pendiente de sincronización",
  SINCRONIZADO: "Sincronizado",
  ERROR_SINCRONIZACION: "Error de sincronización",
};
