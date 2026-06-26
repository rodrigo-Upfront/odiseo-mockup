// Sistema Integral - User Mirror Catalog (read-only, for validation/autocomplete)
// Independent from ODISEO Users and Commercial Executives
// Tabla origen referencial:
// - Código: TbUsuCVen
// - Estado: TbUsuEReg
// - Nombre de usuario Sistema Integral: TbUsuDAbv

import { seedSiUsers } from "./seeds/siUsers";

export type SiUserStatus = "Activo" | "Inactivo";

export interface SiUserMirror {
  integralSystemUserId: string; // TbUsuCVen - Código
  integralSystemUserValue: string; // TbUsuDAbv - Nombre de usuario
  integralSystemUserStatus: string; // TbUsuEReg - Estado ("*" = Inactivo, vacío = Activo)
  status: SiUserStatus; // Estado normalizado para uso interno
}

let siUsersMirrorCache: SiUserMirror[] = [];

function initializeSiUsersMirror(): void {
  if (siUsersMirrorCache.length === 0) {
    const stored = localStorage.getItem("odiseo_si_users_mirror");
    if (stored) {
      siUsersMirrorCache = JSON.parse(stored);
    } else {
      siUsersMirrorCache = seedSiUsers;
      localStorage.setItem("odiseo_si_users_mirror", JSON.stringify(seedSiUsers));
    }
  }
}

export function getSiUsersMirror(): SiUserMirror[] {
  initializeSiUsersMirror();
  return siUsersMirrorCache;
}

export function getActiveSiUsersMirror(): SiUserMirror[] {
  initializeSiUsersMirror();
  return siUsersMirrorCache.filter((user) => user.status === "Activo");
}

export function getSiUserMirrorByCode(code: string): SiUserMirror | undefined {
  initializeSiUsersMirror();
  const normalizedCode = code.trim().toUpperCase();
  return siUsersMirrorCache.find(
    (user) => user.integralSystemUserId.trim().toUpperCase() === normalizedCode
  );
}

export function getSiUserMirrorById(id: string): SiUserMirror | undefined {
  initializeSiUsersMirror();
  return siUsersMirrorCache.find((user) => user.integralSystemUserId === id);
}

export function getSiUserMirrorByValue(value: string): SiUserMirror | undefined {
  initializeSiUsersMirror();
  const normalizedValue = value.trim().toUpperCase();
  return siUsersMirrorCache.find(
    (user) => user.integralSystemUserValue.trim().toUpperCase() === normalizedValue
  );
}

export function validateSiUser(code: string): {
  exists: boolean;
  user?: SiUserMirror;
  message: string;
} {
  const user = getSiUserMirrorByCode(code);

  if (!user) {
    return {
      exists: false,
      message: "Usuario del Sistema Integral no encontrado.",
    };
  }

  if (user.status === "Inactivo") {
    return {
      exists: true,
      user,
      message: "El usuario del Sistema Integral se encuentra inactivo.",
    };
  }

  return {
    exists: true,
    user,
    message: "Usuario del Sistema Integral encontrado y activo.",
  };
}

export function searchSiUsers(query: string): SiUserMirror[] {
  initializeSiUsersMirror();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return siUsersMirrorCache.filter((user) => user.status === "Activo");
  }

  return siUsersMirrorCache.filter(
    (user) =>
      user.status === "Activo" &&
      (user.integralSystemUserId.toLowerCase().includes(normalizedQuery) ||
        user.integralSystemUserValue.toLowerCase().includes(normalizedQuery))
  );
}

export function searchAllSiUsers(query: string): SiUserMirror[] {
  initializeSiUsersMirror();
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return siUsersMirrorCache;
  }

  return siUsersMirrorCache.filter(
    (user) =>
      user.integralSystemUserId.toLowerCase().includes(normalizedQuery) ||
      user.integralSystemUserValue.toLowerCase().includes(normalizedQuery)
  );
}

export function getSiValidationStatus(
  code: string
): "matched" | "not_found" | "inactive" {
  const user = getSiUserMirrorByCode(code);

  if (!user) {
    return "not_found";
  }

  if (user.status === "Inactivo") {
    return "inactive";
  }

  return "matched";
}
