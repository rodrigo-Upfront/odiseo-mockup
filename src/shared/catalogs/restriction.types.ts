// Tipos para restricciones (reglas de validación entre campos)
// Las restricciones son diferentes de los catálogos
// Definen relaciones y validaciones entre valores de catálogos

export interface Restriction {
  id: string;
  code: string;
  name: string;
  description?: string;
  sourceField: string;
  sourceValue: string;
  dependentField: string;
  allowedValue: string;
  status: "Activo" | "Inactivo" | "Bloqueado";
  createdAt?: string;
  updatedAt?: string;
}

export interface RestrictionValidationError {
  field: string;
  value: string;
  message: string;
}

export interface RestrictionCheckResult {
  valid: boolean;
  errors: RestrictionValidationError[];
}
