import {
  getClientMirrorByRuc,
  getClientMirrorByRazonSocial,
} from "./clientMirrorStorage";
import {
  getPreliminaryClientByRuc,
  getPreliminaryClientByRazonSocial,
} from "./preliminaryClientStorage";

export interface ClientDuplicityCheck {
  isDuplicate: boolean;
  duplicateIn: "Sistema Integral" | "Portal ODISEO" | null;
  duplicateField: "RUC" | "Razón Social" | null;
  conflictingClient?: {
    type: "Espejo SI" | "Preliminar";
    code: string;
    razonSocial: string;
  };
}

export function checkClientDuplicity(
  ruc: string,
  razonSocial: string
): ClientDuplicityCheck {
  // Buscar por RUC en tabla espejo
  const siClientByRuc = getClientMirrorByRuc(ruc);
  if (siClientByRuc) {
    return {
      isDuplicate: true,
      duplicateIn: "Sistema Integral",
      duplicateField: "RUC",
      conflictingClient: {
        type: "Espejo SI",
        code: siClientByRuc.code,
        razonSocial: siClientByRuc.razonSocial,
      },
    };
  }

  // Buscar por Razón Social en tabla espejo
  const siClientByRazonSocial = getClientMirrorByRazonSocial(razonSocial);
  if (siClientByRazonSocial) {
    return {
      isDuplicate: true,
      duplicateIn: "Sistema Integral",
      duplicateField: "Razón Social",
      conflictingClient: {
        type: "Espejo SI",
        code: siClientByRazonSocial.code,
        razonSocial: siClientByRazonSocial.razonSocial,
      },
    };
  }

  // Buscar por RUC en clientes preliminares
  const preliminaryByRuc = getPreliminaryClientByRuc(ruc);
  if (preliminaryByRuc) {
    return {
      isDuplicate: true,
      duplicateIn: "Portal ODISEO",
      duplicateField: "RUC",
      conflictingClient: {
        type: "Preliminar",
        code: preliminaryByRuc.code,
        razonSocial: preliminaryByRuc.razonSocial,
      },
    };
  }

  // Buscar por Razón Social en clientes preliminares
  const preliminaryByRazonSocial = getPreliminaryClientByRazonSocial(razonSocial);
  if (preliminaryByRazonSocial) {
    return {
      isDuplicate: true,
      duplicateIn: "Portal ODISEO",
      duplicateField: "Razón Social",
      conflictingClient: {
        type: "Preliminar",
        code: preliminaryByRazonSocial.code,
        razonSocial: preliminaryByRazonSocial.razonSocial,
      },
    };
  }

  return {
    isDuplicate: false,
    duplicateIn: null,
    duplicateField: null,
  };
}
