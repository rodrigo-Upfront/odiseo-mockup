import { isValidUnit } from "../data/unitOfMeasureStorage";

export interface ProyectoValidationErrors {
  nombreBase?: string;
  valorPresentacion?: string;
  unidadMedida?: string;
}

export interface FichaProductoValidationErrors {
  nombreBase?: string;
}

// Validaciones para Proyecto
export function validateProyecto(
  nombreBase: string,
  valorPresentacion: number | string,
  unidadMedida: string
): ProyectoValidationErrors {
  const errors: ProyectoValidationErrors = {};

  // Validar nombre base
  if (!nombreBase || !nombreBase.trim()) {
    errors.nombreBase = "El nombre base del proyecto es obligatorio";
  } else if (nombreBase.trim().length < 3) {
    errors.nombreBase = "El nombre debe tener al menos 3 caracteres";
  } else if (nombreBase.trim().length > 100) {
    errors.nombreBase = "El nombre no puede exceder 100 caracteres";
  }

  // Validar valor presentación
  const valor = typeof valorPresentacion === "string" ? parseFloat(valorPresentacion) : valorPresentacion;

  if (!valorPresentacion || valorPresentacion === "") {
    errors.valorPresentacion = "El valor de presentación es obligatorio";
  } else if (isNaN(valor)) {
    errors.valorPresentacion = "El valor debe ser numérico";
  } else if (valor <= 0) {
    errors.valorPresentacion = "El valor debe ser mayor a 0";
  }

  // Validar unidad de medida
  if (!unidadMedida) {
    errors.unidadMedida = "La unidad de medida es obligatoria";
  } else if (!isValidUnit(unidadMedida)) {
    errors.unidadMedida = "Unidad de medida no válida";
  }

  return errors;
}

// Validaciones para Ficha de Producto
export function validateFichaProducto(
  nombreBase: string
): FichaProductoValidationErrors {
  const errors: FichaProductoValidationErrors = {};

  // Validar nombre base
  if (!nombreBase || !nombreBase.trim()) {
    errors.nombreBase = "El nombre base de la ficha es obligatorio";
  } else if (nombreBase.trim().length < 2) {
    errors.nombreBase = "El nombre debe tener al menos 2 caracteres";
  } else if (nombreBase.trim().length > 100) {
    errors.nombreBase = "El nombre no puede exceder 100 caracteres";
  }

  return errors;
}

// Validaciones de portafolio
export function validatePortafolio(nombre: string): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!nombre || !nombre.trim()) {
    errors.nombre = "El nombre del portafolio es obligatorio";
  } else if (nombre.trim().length < 3) {
    errors.nombre = "El nombre debe tener al menos 3 caracteres";
  } else if (nombre.trim().length > 150) {
    errors.nombre = "El nombre no puede exceder 150 caracteres";
  }

  return errors;
}

// Validación de compatibilidad entre proyecto y ficha
export function validateFichaCompatibilityWithProyecto(
  fichaValor: number,
  fichaUnidad: string,
  proyectoValor: number,
  proyectoUnidad: string
): boolean {
  return fichaValor === proyectoValor && fichaUnidad === proyectoUnidad;
}
