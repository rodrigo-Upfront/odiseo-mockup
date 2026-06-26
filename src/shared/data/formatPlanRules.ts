// src/shared/data/formatPlanRules.ts

function normalizeWrapping(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export function isBolsaWrapping(envoltura?: string): boolean {
  if (!envoltura) return false;
  return normalizeWrapping(envoltura) === "bolsa";
}

export function isLaminaWrapping(envoltura?: string): boolean {
  if (!envoltura) return false;
  return normalizeWrapping(envoltura) === "lamina";
}

export function isPouchWrapping(envoltura?: string): boolean {
  if (!envoltura) return false;
  return normalizeWrapping(envoltura) === "pouch";
}

export interface BolsaParams {
  tipoPresentacionBolsa?: string;
  tipoSelloBolsa?: string;
  acabadoBolsa?: string;
  tieneFuelleBolsa?: string;
}

export interface PouchParams {
  tipoFamiliaPouch?: string;
  tipoStandUpPouch?: string;
  formaDoyPackPouch?: string;
  tipoFuelleStandUpPouch?: string;
  cantidadSellosPouchPlano?: string;
  tieneFuelleSelloCentralPouch?: string;
  materialSelloCentralPouch?: string;
  tipoSelloEnFuellePouch?: string;
}

export function isGuidedFormatEnabled(envoltura?: string): boolean {
  if (!envoltura) return false;
  return (
    isBolsaWrapping(envoltura) ||
    isLaminaWrapping(envoltura) ||
    isPouchWrapping(envoltura)
  );
}

export function calculateFormatPlanByWrapping(params: any): string {
  const envoltura = params.envoltura || params.env || "";

  if (isBolsaWrapping(envoltura)) {
    return calculateBolsaFormatPlan(params);
  }

  if (isLaminaWrapping(envoltura)) {
    return calculateLaminaFormatPlan(params);
  }

  if (isPouchWrapping(envoltura)) {
    return calculatePouchFormatPlan(params);
  }

  return params.blueprintFormat || params.formatoPlano || "";
}

export function calculateBolsaFormatPlan(params: BolsaParams): string {
  const {
    tipoPresentacionBolsa,
    tipoSelloBolsa,
    acabadoBolsa,
    tieneFuelleBolsa,
  } = params;

  if (!tipoPresentacionBolsa) return "";

  if (tipoPresentacionBolsa === "Wicket") return "WICKET";
  if (tipoPresentacionBolsa === "Hojas") return "HOJAS";

  if (tipoPresentacionBolsa === "Bolsa sellada") {
    if (tipoSelloBolsa === "Sello lateral") {
      if (acabadoBolsa === "Corte") {
        if (tieneFuelleBolsa === "Sí") return "SELLO LATERAL\\CORTE\\CON FUELLE FONDO";
        if (tieneFuelleBolsa === "No") return "SELLO LATERAL\\CORTE\\SIN FUELLE FONDO";
      } else if (acabadoBolsa === "Pestaña") {
        if (tieneFuelleBolsa === "Sí") return "SELLO LATERAL\\PESTAÑA\\CON FUELLE FONDO";
        if (tieneFuelleBolsa === "No") return "SELLO LATERAL\\PESTAÑA\\SIN FUELLE FONDO";
      }
    } else if (tipoSelloBolsa === "Sello de fondo") {
      if (tieneFuelleBolsa === "Sí") return "SELLO DE FONDO\\CON FUELLE LATERAL";
      if (tieneFuelleBolsa === "No") return "SELLO DE FONDO\\SIN FUELLE LATERAL";
    }
  }

  return "";
}

export function calculateLaminaFormatPlan(params: any): string {
  const tipoLamina = String(params.tipoFormatoLamina || "").trim();

  if (tipoLamina === "Genérica") return "GENERICA";
  if (tipoLamina === "Tissue") return "TISSUE";
  if (tipoLamina === "Food") return "FOOD";

  return "";
}

export function calculatePouchFormatPlan(params: PouchParams): string {
  const familia = String(params.tipoFamiliaPouch || "").trim();
  const standUp = String(params.tipoStandUpPouch || "").trim();
  const formaDoyPack = String(params.formaDoyPackPouch || "").trim();
  const fuelleStandUp = String(params.tipoFuelleStandUpPouch || "").trim();
  const sellosPlano = String(params.cantidadSellosPouchPlano || "").trim();
  const tieneFuelleCentral = String(params.tieneFuelleSelloCentralPouch || "").trim();
  const materialCentral = String(params.materialSelloCentralPouch || "").trim();
  const tipoSelloEnFuelle = String(params.tipoSelloEnFuellePouch || "").trim();

  if (familia === "Pouch Stand Up") {
    if (standUp === "Tipo K") {
      return "POUCH STAND UP\\TIPO K\\FUELLE PROPIO";
    }

    if (standUp === "Normal") {
      return "POUCH STAND UP\\NORMAL\\FUELLE PROPIO";
    }

    if (standUp === "Doy Pack") {
      if (formaDoyPack === "Redondo" && fuelleStandUp === "Fuelle Propio") {
        return "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE PROPIO";
      }

      if (formaDoyPack === "Cuadrado" && fuelleStandUp === "Fuelle Propio") {
        return "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE PROPIO";
      }

      if (formaDoyPack === "Redondo" && fuelleStandUp === "Fuelle Insertado") {
        return "POUCH STAND UP\\DOY PACK REDONDO\\FUELLE INSERTADO";
      }

      if (formaDoyPack === "Cuadrado" && fuelleStandUp === "Fuelle Insertado") {
        return "POUCH STAND UP\\DOY PACK CUADRADO\\FUELLE INSERTADO";
      }
    }
  }

  if (familia === "Pouch Plano") {
    if (sellosPlano === "Dos sellos") {
      return "POUCH PLANO\\DOS SELLOS";
    }

    if (sellosPlano === "Tres sellos") {
      return "POUCH PLANO\\TRES SELLOS";
    }
  }

  if (familia === "Pouch con Sello Central") {
    const isPePe = materialCentral === "PE-PE/PE";

    if (tieneFuelleCentral === "Sí" && isPePe) {
      return "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE (PE-PE/PE)";
    }

    if (tieneFuelleCentral === "No" && isPePe) {
      return "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE (PE-PE/PE)";
    }

    if (tieneFuelleCentral === "Sí") {
      return "POUCH C/SELLO CENTRAL\\TIPO ALETA\\CON FUELLE";
    }

    if (tieneFuelleCentral === "No") {
      return "POUCH C/SELLO CENTRAL\\TIPO ALETA\\SIN FUELLE";
    }
  }

  if (familia === "Pouch con Sello en Fuelle") {
    if (tipoSelloEnFuelle === "Tipo 4-1") {
      return "POUCH C/SELLO EN FUELLE\\TIPO 4-1\\FUELLE PROPIO";
    }

    if (tipoSelloEnFuelle === "Tipo 1-1") {
      return "POUCH C/SELLO EN FUELLE\\TIPO 1-1";
    }
  }

  return "";
}

export function validatePouchFormatPlan(params: PouchParams & { envoltura?: string }): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!isPouchWrapping(params.envoltura)) return errors;

  if (!params.tipoFamiliaPouch) {
    errors.tipoFamiliaPouch = "Selecciona la familia de pouch.";
    return errors;
  }

  if (params.tipoFamiliaPouch === "Pouch Stand Up") {
    if (!params.tipoStandUpPouch) {
      errors.tipoStandUpPouch = "Selecciona el tipo de Stand Up.";
    }

    if (params.tipoStandUpPouch === "Doy Pack") {
      if (!params.formaDoyPackPouch) {
        errors.formaDoyPackPouch = "Selecciona la forma del Doy Pack.";
      }

      if (!params.tipoFuelleStandUpPouch) {
        errors.tipoFuelleStandUpPouch = "Selecciona el tipo de fuelle.";
      }
    }
  }

  if (params.tipoFamiliaPouch === "Pouch Plano") {
    if (!params.cantidadSellosPouchPlano) {
      errors.cantidadSellosPouchPlano = "Selecciona la cantidad de sellos.";
    }
  }

  if (params.tipoFamiliaPouch === "Pouch con Sello Central") {
    if (!params.tieneFuelleSelloCentralPouch) {
      errors.tieneFuelleSelloCentralPouch = "Indica si tendrá fuelle.";
    }

    if (!params.materialSelloCentralPouch) {
      errors.materialSelloCentralPouch = "Selecciona la especificación de material.";
    }
  }

  if (params.tipoFamiliaPouch === "Pouch con Sello en Fuelle") {
    if (!params.tipoSelloEnFuellePouch) {
      errors.tipoSelloEnFuellePouch = "Selecciona el tipo de sello en fuelle.";
    }
  }

  const calculated = calculatePouchFormatPlan(params);

  if (Object.keys(errors).length === 0 && !calculated) {
    errors.blueprintFormat = "No se pudo calcular el formato de plano del pouch.";
  }

  return errors;
}
