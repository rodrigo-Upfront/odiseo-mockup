import { type ProjectRecord } from "../../../shared/data/projectStorage";
import { type CurrentUser } from "../types/checks";

export function getProjectsForUser(
  projects: ProjectRecord[],
  currentUser: CurrentUser
): ProjectRecord[] {
  const role = currentUser.role;

  // Filtro base: proyectos con validación solicitada
  const baseFilter = projects.filter(
    (p) => p.validacionSolicitada && p.requiereValidacion
  );

  if (role === "Artes Gráficas") {
    return baseFilter.filter((p) => {
      const arteValidation = p.validaciones.find((v) => v.area === "Artes Gráficas");
      if (!arteValidation) return false;
      return (
        ["Pendiente", "Observada", "Rechazada"].includes(arteValidation.estado)
      );
    });
  }

  if (role === "R&D Técnica") {
    return baseFilter.filter((p) => {
      const rdValidation = p.validaciones.find((v) => v.area === "R&D Técnica");
      if (!rdValidation) return false;
      return (
        ["Pendiente", "Observada", "Rechazada"].includes(rdValidation.estado)
      );
    });
  }

  if (role === "R&D Desarrollo") {
    return baseFilter.filter((p) => {
      const rdValidation = p.validaciones.find((v) => v.area === "R&D Desarrollo");
      if (!rdValidation) return false;
      return (
        ["Pendiente", "Observada", "Rechazada"].includes(rdValidation.estado)
      );
    });
  }

  if (role === "Ejecutivo Comercial") {
    return baseFilter.filter((p) => {
      const statusesToShow = [
        "Observada",
        "Rechazada",
        "En validación",
        "Validada por áreas",
        "Lista para RFQ",
        "Pendiente de precio",
        "Precio cargado",
      ];
      return statusesToShow.includes(p.status);
    });
  }

  // Administrador, PMO, Master Data - ver todos
  if (["Administrador", "PMO", "Master Data"].includes(role)) {
    return baseFilter;
  }

  return [];
}

export function getObservationsByArea(
  project: ProjectRecord,
  area: string
): string[] {
  const areaValidation = project.validaciones.find((v) => v.area === area);
  if (!areaValidation) return [];

  return areaValidation.comentarios.map((c) => c.comentario);
}

export function getLastValidationDate(
  project: ProjectRecord,
  area?: string
): Date | null {
  if (area) {
    const areaVal = project.validaciones.find((v) => v.area === area);
    if (areaVal?.fechaValidacion) {
      return new Date(areaVal.fechaValidacion);
    }
  } else {
    const latestDate = project.validaciones
      .filter((v) => v.fechaValidacion)
      .map((v) => new Date(v.fechaValidacion!))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return latestDate || null;
  }

  return null;
}

export function getStatusOrder(status: string): number {
  const order: Record<string, number> = {
    "Pendiente de validación": 1,
    "En validación": 2,
    "Observada": 3,
    "Rechazada": 4,
    "Validada por áreas": 5,
    "Lista para RFQ": 6,
    "Pendiente de precio": 7,
    "Precio cargado": 8,
    "Ficha aprobada": 9,
  };
  return order[status] ?? 10;
}
