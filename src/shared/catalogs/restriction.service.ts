// Servicio de restricciones (reglas de validación entre campos)
// Nota: No se crean restricciones ficticias hasta que se identifiquen reglas reales en el sistema

import type { Restriction, RestrictionCheckResult, RestrictionValidationError } from "./restriction.types";

// En memoria - En producción, esto vendría de una base de datos
let restrictions: Restriction[] = [];

export function getRestrictions(status?: "Activo" | "Inactivo" | "Bloqueado"): Restriction[] {
  if (status) {
    return restrictions.filter((r) => r.status === status);
  }
  return restrictions;
}

export function getRestriction(id: string): Restriction | undefined {
  return restrictions.find((r) => r.id === id);
}

export function getRestrictionsBySourceField(
  sourceField: string,
  sourceValue: string
): Restriction[] {
  return restrictions.filter(
    (r) => r.sourceField === sourceField && r.sourceValue === sourceValue && r.status === "Activo"
  );
}

export function addRestriction(restriction: Omit<Restriction, "id">): Restriction {
  const newRestriction: Restriction = {
    ...restriction,
    id: `restriction_${Date.now()}`,
  };
  restrictions.push(newRestriction);
  return newRestriction;
}

export function updateRestriction(id: string, updates: Partial<Restriction>): Restriction | undefined {
  const index = restrictions.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  restrictions[index] = {
    ...restrictions[index],
    ...updates,
    id: restrictions[index].id, // No permitir cambiar el ID
    updatedAt: new Date().toISOString(),
  };

  return restrictions[index];
}

export function deleteRestriction(id: string): boolean {
  const index = restrictions.findIndex((r) => r.id === id);
  if (index === -1) return false;

  restrictions.splice(index, 1);
  return true;
}

// Validar que un valor cumple con las restricciones asociadas
export function checkRestrictions(
  sourceField: string,
  sourceValue: string,
  dependentField: string,
  dependentValue: string
): RestrictionCheckResult {
  const applicableRestrictions = getRestrictionsBySourceField(sourceField, sourceValue);

  if (applicableRestrictions.length === 0) {
    return { valid: true, errors: [] };
  }

  const errors: RestrictionValidationError[] = [];

  for (const restriction of applicableRestrictions) {
    if (restriction.dependentField === dependentField) {
      if (dependentValue !== restriction.allowedValue && restriction.status === "Activo") {
        errors.push({
          field: dependentField,
          value: dependentValue,
          message: `No permitido: Cuando ${sourceField} es "${sourceValue}", ${dependentField} debe ser "${restriction.allowedValue}"`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function resetRestrictions(): void {
  restrictions = [];
}
