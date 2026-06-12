import seedUsers from "./seeds/users.json";
import { canTransitionUserStatus, registerUserStatusChange } from "./userStatusStorage";
import type { SyncStatus, ProfileCode, InternalRoleCode } from "../security/roleProfiles";
import { getAccessStatusByCode, getAccessStatusById } from "./accessStatusCatalog";
import type { AccessStatusCode } from "./accessStatusCatalog";
import { registerAccessAuditEvent } from "./userAccessAuditStorage";

const USERS_STORAGE_KEY = "odiseo_users";
const CURRENT_USER_KEY = "odiseo_current_user";
const DEFAULT_DEMO_PASSWORD = "123456";

export type UserRole =
  | "administrator"
  | "master_data"
  | "commercial"
  | "customer_service";

export type UserStatus =
  | "active"
  | "inactive"
  | "pending_activation"
  | "pending_validation"
  | "pending_sync"
  | "blocked";

export type User = {
  // Technical Primary Key and Visible Code
  id: string; // TbUSuPk (USR-XXXXXX)
  code: string; // TbUSuCd (US-XXXXXX)

  // User Information
  email: string; // TbUSuCrr - Login principal
  password: string;
  fullName: string; // TbUSuNc
  phone?: string; // TbUSuTel
  position: string; // TbUSuPt
  area?: string; // TbUSuAr
  areaCode?: string;
  areaLabel?: string;

  // Access Control
  profileCode?: ProfileCode; // TbUSuPl
  profileLabel?: string;
  roles?: InternalRoleCode[];
  accessStatusId: number; // TbUSuEstFk - Foreign key to access status catalog

  // Security
  failedLoginAttempts: number; // TbUSuIntFall - Default 0, blocks user at 3
  blockedAt?: string; // TbUSuFBloq - When user was blocked

  // Logical Control
  activeLogical: boolean; // TbUSuActi - 1 = Vigente, 0 = Inactivo/baja lógica

  // Legacy System Integration
  role: UserRole;
  status: UserStatus;
  workerCode: string;
  integralSystemUserId?: string;
  integralSystemUserValue?: string;
  integralSystemUserName?: string;
  integralSystemUserStatus?: string;
  syncStatus?: SyncStatus;

  // Audit Fields
  createdAt: string; // TbUSuReg
  createdByUser: string; // TbUSuUsuRegFk
  updatedAt?: string; // TbUSuFUlt
  updatedByUser?: string; // TbUSuUsuModFk
};

export type UserPublic = Omit<User, "password">;

const SEED_DATE = "2026-01-01T00:00:00.000Z";
const SYSTEM_USER = "SISTEMA";
const HABILITADO_STATUS_ID = 2; // ID from ACCESS_STATUS_CATALOG

const AREA_USERS: User[] = [
  {
    id: "USR-000001",
    code: "US-000001",
    email: "admin@amcor.com",
    password: DEFAULT_DEMO_PASSWORD,
    fullName: "Administrador Sistema",
    role: "administrator",
    status: "active",
    workerCode: "GEN-ADMIN",
    position: "Administrador del Portal",
    area: "TI",
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    activeLogical: true,
    createdAt: SEED_DATE,
    createdByUser: SYSTEM_USER,
  },
  {
    id: "USR-000002",
    code: "US-000002",
    email: "comercial@amcor.com",
    password: DEFAULT_DEMO_PASSWORD,
    fullName: "Usuario Comercial",
    role: "commercial",
    status: "active",
    workerCode: "GEN-COMERCIAL",
    position: "Ejecutivo Comercial",
    area: "Comercial",
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    activeLogical: true,
    createdAt: SEED_DATE,
    createdByUser: SYSTEM_USER,
  },
  {
    id: "USR-000003",
    code: "US-000003",
    email: "customerservice@amcor.com",
    password: DEFAULT_DEMO_PASSWORD,
    fullName: "Usuario Customer Service",
    role: "customer_service",
    status: "active",
    workerCode: "GEN-CS",
    position: "Customer Service",
    area: "Customer Service",
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    activeLogical: true,
    createdAt: SEED_DATE,
    createdByUser: SYSTEM_USER,
  },
  {
    id: "USR-000004",
    code: "US-000004",
    email: "masterdata@amcor.com",
    password: DEFAULT_DEMO_PASSWORD,
    fullName: "Usuario Master Data",
    role: "master_data",
    status: "active",
    workerCode: "GEN-MD",
    position: "Master Data",
    area: "Master Data",
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    activeLogical: true,
    createdAt: SEED_DATE,
    createdByUser: SYSTEM_USER,
  },
];

const JSON_SEED_USERS: User[] = seedUsers as User[];

const INITIAL_USERS: User[] = mergeUsersByIdAndEmail([
  ...AREA_USERS,
  ...JSON_SEED_USERS,
]);

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizeUser(user: any): User {
  const password = user.password || DEFAULT_DEMO_PASSWORD;

  return {
    ...user,
    password,
    email: normalizeEmail(user.email),
    fullName: user.fullName || user.name || "Usuario",
    accessStatusId: user.accessStatusId || HABILITADO_STATUS_ID,
    failedLoginAttempts: user.failedLoginAttempts || 0,
    activeLogical: user.activeLogical !== false,
    createdByUser: user.createdByUser || SYSTEM_USER,
  };
}

function getUserNumberFromCode(code: string): number {
  const match = code.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function mergeUsersByIdAndEmail(users: User[]): User[] {
  const ids = new Set<string>();
  const emails = new Set<string>();
  const result: User[] = [];

  users.forEach((user) => {
    const normalized = normalizeUser(user);
    const email = normalizeEmail(normalized.email);

    if (ids.has(normalized.id) || emails.has(email)) {
      return;
    }

    ids.add(normalized.id);
    emails.add(email);
    result.push(normalized);
  });

  return result;
}

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistUsers(records: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(records));
}

export function getAllUsers(): User[] {
  const saved = safeParseArray<User>(localStorage.getItem(USERS_STORAGE_KEY));

  const savedIds = new Set(saved.map((u) => u.id));
  const savedEmails = new Set(saved.map((u) => normalizeEmail(u.email)));

  const initialWithoutDuplicates = INITIAL_USERS.filter((user) => {
    return !savedIds.has(user.id) && !savedEmails.has(normalizeEmail(user.email));
  });

  return mergeUsersByIdAndEmail([...saved, ...initialWithoutDuplicates]);
}

export function getUserById(id: string): User | undefined {
  return getAllUsers().find((user) => user.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  const normalizedEmail = normalizeEmail(email);
  return getAllUsers().find(
    (user) => normalizeEmail(user.email) === normalizedEmail
  );
}

export function getUserByCode(code: string): User | undefined {
  return getAllUsers().find((user) => user.code === code);
}

export function authenticateUser(
  email: string,
  password: string
): UserPublic | null {
  const normalizedEmail = normalizeEmail(email);
  const user = getAllUsers().find(
    (u) => normalizeEmail(u.email) === normalizedEmail
  );

  // User not found - don't reveal this for security
  if (!user) {
    return null;
  }

  // Check if user is logically inactive (soft deleted)
  if (!user.activeLogical) {
    registerAccessAuditEvent(
      user.id,
      "INTENTO_LOGIN_FALLIDO",
      user.id,
      SYSTEM_USER,
      {
        origin: "Seguridad",
        details: "Intento de login con usuario inactivo (baja lógica)",
      }
    );
    return null;
  }

  // Check if user is blocked by security (3 failed attempts)
  const BLOQUEADO_STATUS_ID = 3;
  if (user.accessStatusId === BLOQUEADO_STATUS_ID) {
    registerAccessAuditEvent(
      user.id,
      "INTENTO_LOGIN_FALLIDO",
      user.id,
      SYSTEM_USER,
      {
        origin: "Seguridad",
        details: "Intento de login con usuario bloqueado",
      }
    );
    return null;
  }

  // Check if user is pending activation
  const PENDIENTE_ACTIVACION_STATUS_ID = 1;
  if (user.accessStatusId === PENDIENTE_ACTIVACION_STATUS_ID) {
    // Allow login but they'll be redirected to password setup
    // This is allowed - they're setting up their account
  }

  const storedPassword = (user as any).password || DEFAULT_DEMO_PASSWORD;

  // Check password
  if (storedPassword !== password) {
    recordFailedLoginAttempt(user.id);
    return null;
  }

  // Legacy status check (backward compatibility)
  if (user.status !== "active") {
    recordFailedLoginAttempt(user.id);
    return null;
  }

  // Login successful - reset failed attempts and update last login
  recordSuccessfulLogin(user.id);

  const updatedUser = {
    ...user,
    password: storedPassword,
  };

  saveUserRecord(updatedUser);

  registerAccessAuditEvent(
    user.id,
    "LOGIN_EXITOSO",
    user.id,
    user.email,
    {
      origin: "Sistema",
      details: "Login exitoso",
    }
  );

  const { password: _, ...publicUser } = updatedUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(publicUser));

  return publicUser;
}

export function getCurrentUser(): UserPublic | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem("odiseo_current_user");
}

export function saveUserRecord(record: User): void {
  const saved = safeParseArray<User>(localStorage.getItem(USERS_STORAGE_KEY));

  const normalizedRecord: User = normalizeUser({
    ...record,
  });

  const filtered = saved.filter((user) => {
    const sameId = user.id === normalizedRecord.id;
    const sameEmail = normalizeEmail(user.email) === normalizeEmail(normalizedRecord.email);
    return !sameId && !sameEmail;
  });

  const nextRecords = mergeUsersByIdAndEmail([normalizedRecord, ...filtered]);

  persistUsers(nextRecords);
  saveSeedUsers(nextRecords);
}

export function createUser(
  newUser: Partial<Pick<User, "workerCode" | "position" | "fullName" | "phone" | "areaCode" | "areaLabel" | "profileCode" | "profileLabel" | "roles" | "integralSystemUserId" | "integralSystemUserValue" | "integralSystemUserName" | "integralSystemUserStatus" | "syncStatus" | "createdByUser" | "updatedByUser" | "accessStatusId" | "failedLoginAttempts" | "activeLogical">> &
    Omit<
      User,
      | "id"
      | "code"
      | "createdAt"
      | "fullName"
      | "workerCode"
      | "position"
      | "phone"
      | "areaCode"
      | "areaLabel"
      | "profileCode"
      | "profileLabel"
      | "roles"
      | "integralSystemUserId"
      | "integralSystemUserValue"
      | "integralSystemUserName"
      | "integralSystemUserStatus"
      | "syncStatus"
      | "createdByUser"
      | "updatedByUser"
      | "accessStatusId"
      | "failedLoginAttempts"
      | "activeLogical"
    >
): User {
  const now = new Date().toISOString();
  const allUsers = getAllUsers();
  const currentUser = getCurrentUser();
  const executingUser = currentUser?.fullName || SYSTEM_USER;

  const maxNumber = Math.max(
    0,
    ...allUsers.map((u) => getUserNumberFromCode(u.code))
  );

  const nextNumber = maxNumber + 1;
  const PENDIENTE_ACTIVACION_STATUS_ID = 1; // From ACCESS_STATUS_CATALOG

  const user: User = {
    ...newUser,
    id: `USR-${String(nextNumber).padStart(6, "0")}`,
    code: `US-${String(nextNumber).padStart(6, "0")}`,
    email: normalizeEmail(newUser.email),
    fullName: newUser.fullName || "Usuario",
    phone: newUser.phone,
    workerCode: newUser.workerCode || "",
    position: newUser.position || "",
    area: newUser.area,
    areaCode: newUser.areaCode,
    areaLabel: newUser.areaLabel,
    profileCode: newUser.profileCode,
    profileLabel: newUser.profileLabel,
    roles: newUser.roles,
    integralSystemUserId: newUser.integralSystemUserId,
    integralSystemUserValue: newUser.integralSystemUserValue,
    integralSystemUserName: newUser.integralSystemUserName,
    integralSystemUserStatus: newUser.integralSystemUserStatus,
    accessStatusId: PENDIENTE_ACTIVACION_STATUS_ID, // Always PENDIENTE_ACTIVACION on creation
    failedLoginAttempts: 0,
    syncStatus: newUser.syncStatus || "PENDIENTE_SINCRONIZACION",
    activeLogical: true, // Always true on creation
    status: newUser.status || "pending_activation",
    role: newUser.role,
    createdAt: now,
    createdByUser: newUser.createdByUser || executingUser,
    updatedAt: now,
    updatedByUser: newUser.updatedByUser || executingUser,
  };

  saveUserRecord(user);

  registerUserStatusChange(
    user.id,
    null,
    user.status,
    "system",
    "Usuario ODISEO creado - pendiente de activación"
  );

  // Register audit event
  registerAccessAuditEvent(
    user.id,
    "CREAR_USUARIO",
    user.id,
    executingUser,
    {
      origin: "Manual",
      details: `Usuario creado: ${user.fullName} (${user.email})`,
    }
  );

  return user;
}

export function updateUser(
  id: string,
  updates: Partial<Omit<User, "id" | "code" | "createdAt">>
): User | null {
  const user = getUserById(id);
  if (!user) return null;

  const nextStatus = updates.status || user.status;

  if (
    updates.status &&
    updates.status !== user.status &&
    !canTransitionUserStatus(user.status, updates.status)
  ) {
    throw new Error(
      `Transición de estado no permitida: ${user.status} → ${updates.status}`
    );
  }

  const currentUser = getCurrentUser();
  const executingUser = currentUser?.fullName || SYSTEM_USER;

  const updated: User = {
    ...user,
    ...updates,
    email: updates.email ? normalizeEmail(updates.email) : user.email,
    fullName: updates.fullName || user.fullName,
    status: nextStatus,
    phone: updates.phone !== undefined ? updates.phone : user.phone,
    area: updates.area !== undefined ? updates.area : user.area,
    areaCode: updates.areaCode !== undefined ? updates.areaCode : user.areaCode,
    areaLabel: updates.areaLabel !== undefined ? updates.areaLabel : user.areaLabel,
    profileCode: updates.profileCode !== undefined ? updates.profileCode : user.profileCode,
    profileLabel: updates.profileLabel !== undefined ? updates.profileLabel : user.profileLabel,
    roles: updates.roles !== undefined ? updates.roles : user.roles,
    integralSystemUserId: updates.integralSystemUserId !== undefined ? updates.integralSystemUserId : user.integralSystemUserId,
    integralSystemUserValue: updates.integralSystemUserValue !== undefined ? updates.integralSystemUserValue : user.integralSystemUserValue,
    integralSystemUserName: updates.integralSystemUserName !== undefined ? updates.integralSystemUserName : user.integralSystemUserName,
    integralSystemUserStatus: updates.integralSystemUserStatus !== undefined ? updates.integralSystemUserStatus : user.integralSystemUserStatus,
    accessStatusId: updates.accessStatusId !== undefined ? updates.accessStatusId : user.accessStatusId,
    failedLoginAttempts: updates.failedLoginAttempts !== undefined ? updates.failedLoginAttempts : user.failedLoginAttempts,
    blockedAt: updates.blockedAt !== undefined ? updates.blockedAt : user.blockedAt,
    syncStatus: updates.syncStatus !== undefined ? updates.syncStatus : user.syncStatus,
    activeLogical: updates.activeLogical !== undefined ? updates.activeLogical : user.activeLogical,
    updatedAt: new Date().toISOString(),
    updatedByUser: updates.updatedByUser || executingUser,
  };

  saveUserRecord(updated);

  if (updates.status && updates.status !== user.status) {
    registerUserStatusChange(
      user.id,
      user.status,
      updates.status,
      "system",
      "Cambio de estado desde edición de usuario"
    );
  }

  return updated;
}

function changeUserStatus(
  id: string,
  toStatus: UserStatus,
  comment: string,
  changedBy: string = "system"
): boolean {
  const user = getUserById(id);
  if (!user) return false;

  if (user.status === toStatus) {
    return true;
  }

  if (!canTransitionUserStatus(user.status, toStatus)) {
    return false;
  }

  saveUserRecord({
    ...user,
    status: toStatus,
  });

  registerUserStatusChange(
    user.id,
    user.status,
    toStatus,
    changedBy,
    comment
  );

  return true;
}

export function deactivateUser(id: string): boolean {
  return changeUserStatus(id, "inactive", "Usuario desactivado");
}

export function activateUser(id: string): boolean {
  return changeUserStatus(id, "active", "Usuario activado");
}

export function blockUser(id: string): boolean {
  return changeUserStatus(id, "blocked", "Usuario bloqueado");
}

export function unblockUser(id: string): boolean {
  return changeUserStatus(id, "active", "Usuario desbloqueado");
}

export function setPendingActivation(id: string): boolean {
  return changeUserStatus(
    id,
    "pending_activation",
    "Usuario enviado a pendiente de activación"
  );
}

export function setPendingValidation(id: string): boolean {
  return changeUserStatus(
    id,
    "pending_validation",
    "Usuario enviado a pendiente de validación"
  );
}

export function deleteUser(id: string): boolean {
  const saved = safeParseArray<User>(localStorage.getItem(USERS_STORAGE_KEY));
  const filtered = saved.filter((user) => user.id !== id);

  persistUsers(filtered);
  saveSeedUsers(filtered);

  return true;
}

export function getNextUserCode(): string {
  const allUsers = getAllUsers();

  const maxNumber = Math.max(
    0,
    ...allUsers.map((u) => getUserNumberFromCode(u.code))
  );

  return `US-${String(maxNumber + 1).padStart(6, "0")}`;
}

export function getUsersByRole(role: UserRole): User[] {
  return getAllUsers().filter((user) => user.role === role);
}

export function getCommercialExecutives(): User[] {
  return getAllUsers().filter(
    (user) =>
      user.status === "active" &&
      (user.area === "Comercial" || user.role === "administrator")
  );
}

export function getActiveUsers(): User[] {
  return getAllUsers().filter((user) => user.status === "active");
}

export function getUserByWorkerCode(workerCode: string): User | undefined {
  return getAllUsers().find((user) => user.workerCode === workerCode);
}

export function findDuplicateUser(
  email?: string,
  workerCode?: string,
  excludeUserId?: string
): User | undefined {
  const allUsers = getAllUsers();
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedWorkerCode = workerCode?.trim().toLowerCase();

  return allUsers.find((user) => {
    if (excludeUserId && user.id === excludeUserId) {
      return false;
    }

    const emailMatch =
      normalizedEmail &&
      normalizeEmail(user.email) === normalizedEmail;

    const workerCodeMatch =
      normalizedWorkerCode &&
      user.workerCode?.toLowerCase() === normalizedWorkerCode;

    return Boolean(emailMatch || workerCodeMatch);
  });
}

export function searchOdiseoUsers(query: string): User[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return getAllUsers().filter((user) => {
    const searchableFields = [
      user.fullName,
      user.email,
      user.code,
      user.workerCode,
      user.area,
      ROLE_LABELS[user.role],
    ]
      .filter(Boolean)
      .map((field) => field.toLowerCase());

    return searchableFields.some((field) => field.includes(normalizedQuery));
  });
}

export const ROLE_LABELS: Record<UserRole, string> = {
  administrator: "Administrador",
  master_data: "Master Data",
  commercial: "Comercial",
  customer_service: "Customer Service",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  administrator: "bg-red-100 text-red-700",
  master_data: "bg-amber-100 text-amber-700",
  commercial: "bg-green-100 text-green-700",
  customer_service: "bg-blue-100 text-blue-700",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending_activation: "Pendiente de activación",
  pending_validation: "Pendiente de validación",
  pending_sync: "Pendiente de sincronización",
  blocked: "Bloqueado",
};

export const STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
  pending_activation: "bg-amber-100 text-amber-700",
  pending_validation: "bg-blue-100 text-blue-700",
  pending_sync: "bg-purple-100 text-purple-700",
  blocked: "bg-red-100 text-red-700",
};

export const getUserFullName = (user: any) =>
  user.fullName ||
  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
  "—";

export const splitFullName = (value: string) => {
  const parts = value.trim().split(/\s+/);
  return {
  };
};

// Access Status Management Functions
export function changeAccessStatus(
  userId: string,
  newAccessStatusId: number,
  changedBy: string,
  details?: string
): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  const oldAccessStatusId = user.accessStatusId;

  const updated = updateUser(userId, {
    accessStatusId: newAccessStatusId,
    updatedByUser: changedBy,
  });

  if (updated) {
    registerAccessAuditEvent(
      userId,
      "CAMBIO_ESTADO_ACCESO",
      userId,
      changedBy,
      {
        fieldModified: "accessStatusId",
        oldValue: oldAccessStatusId,
        newValue: newAccessStatusId,
        origin: "Manual",
        details: details || `Estado de acceso cambiado de ${oldAccessStatusId} a ${newAccessStatusId}`,
      }
    );
    return true;
  }

  return false;
}

export function recordFailedLoginAttempt(userId: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  const currentAttempts = user.failedLoginAttempts;
  const newAttempts = currentAttempts + 1;
  const MAX_ATTEMPTS = 3;
  const BLOCKED_STATUS_ID = 3; // From ACCESS_STATUS_CATALOG

  registerAccessAuditEvent(
    userId,
    "INTENTO_LOGIN_FALLIDO",
    userId,
    SYSTEM_USER,
    {
      fieldModified: "failedLoginAttempts",
      oldValue: currentAttempts,
      newValue: newAttempts,
      origin: "Seguridad",
      details: `Intento fallido de login (${newAttempts}/${MAX_ATTEMPTS})`,
    }
  );

  // Block user if max attempts reached
  if (newAttempts >= MAX_ATTEMPTS) {
    const now = new Date().toISOString();
    updateUser(userId, {
      failedLoginAttempts: newAttempts,
      accessStatusId: BLOCKED_STATUS_ID,
      blockedAt: now,
      updatedByUser: SYSTEM_USER,
    });

    registerAccessAuditEvent(
      userId,
      "BLOQUEAR_USUARIO",
      userId,
      SYSTEM_USER,
      {
        fieldModified: "accessStatusId",
        oldValue: user.accessStatusId,
        newValue: BLOCKED_STATUS_ID,
        origin: "Seguridad",
        details: `Usuario bloqueado por ${MAX_ATTEMPTS} intentos fallidos de login`,
      }
    );

    return true;
  }

  // Update failed attempts only
  updateUser(userId, {
    failedLoginAttempts: newAttempts,
    updatedByUser: SYSTEM_USER,
  });

  return false;
}

export function recordSuccessfulLogin(userId: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  if (user.failedLoginAttempts > 0) {
    updateUser(userId, {
      failedLoginAttempts: 0,
      updatedByUser: SYSTEM_USER,
    });

    registerAccessAuditEvent(
      userId,
      "LOGIN_EXITOSO",
      userId,
      SYSTEM_USER,
      {
        fieldModified: "failedLoginAttempts",
        oldValue: user.failedLoginAttempts,
        newValue: 0,
        origin: "Sistema",
        details: "Reinicio de contador de intentos fallidos tras login exitoso",
      }
    );
  }

  return true;
}

export function unblockUserAccess(userId: string, unlockedBy: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  const HABILITADO_STATUS_ID = 2; // From ACCESS_STATUS_CATALOG

  updateUser(userId, {
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    blockedAt: undefined,
    updatedByUser: unlockedBy,
  });

  registerAccessAuditEvent(
    userId,
    "DESBLOQUEAR_USUARIO",
    userId,
    unlockedBy,
    {
      fieldModified: "accessStatusId",
      oldValue: user.accessStatusId,
      newValue: HABILITADO_STATUS_ID,
      origin: "Manual",
      details: "Usuario desbloqueado administrativamente",
    }
  );

  return true;
}

export function activateUserPassword(userId: string, activatedBy: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  const HABILITADO_STATUS_ID = 2; // From ACCESS_STATUS_CATALOG
  const PENDIENTE_STATUS_ID = 1;

  updateUser(userId, {
    accessStatusId: HABILITADO_STATUS_ID,
    failedLoginAttempts: 0,
    updatedByUser: activatedBy,
  });

  registerAccessAuditEvent(
    userId,
    "ACTIVACION_CONTRASENA",
    userId,
    activatedBy,
    {
      fieldModified: "accessStatusId",
      oldValue: PENDIENTE_STATUS_ID,
      newValue: HABILITADO_STATUS_ID,
      origin: "Sistema",
      details: "Usuario activó su contraseña con éxito",
    }
  );

  return true;
}

export function inactivateUserLogical(userId: string, inactivatedBy: string): boolean {
  const user = getUserById(userId);
  if (!user) return false;

  updateUser(userId, {
    activeLogical: false,
    updatedByUser: inactivatedBy,
  });

  registerAccessAuditEvent(
    userId,
    "INACTIVAR_USUARIO",
    userId,
    inactivatedBy,
    {
      fieldModified: "activeLogical",
      oldValue: true,
      newValue: false,
      origin: "Manual",
      details: "Usuario desactivado (baja lógica)",
    }
  );

  return true;
}

export async function saveSeedUsers(users: User[]): Promise<void> {
  try {
    const response = await fetch("/__update-seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "users", data: users }),
    });

    if (!response.ok) {
      console.error("Failed to save seed users");
    }
  } catch (error) {
    console.error("Error saving seed users:", error);
  }
}