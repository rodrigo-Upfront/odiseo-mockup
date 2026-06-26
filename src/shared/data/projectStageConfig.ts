/**
 * CONFIGURACIÓN DE ETAPAS DEL PROYECTO - MÓDULO ODISEO
 *
 * Define las etapas del flujo de proyectos en ODISEO (P1 a P4).
 */

import type { ProjectStage as NewProjectStage } from "./projectWorkflow";

// Re-exportar ProjectStage para compatibilidad con componentes existentes
export type { ProjectStage as NewProjectStage } from "./projectWorkflow";

/**
 * Type de etapa que incluye tanto las nuevas como las legacy
 * para compatibilidad durante la transición de componentes
 * @deprecated Los componentes deben migrar a NewProjectStage gradualmente
 */
export type ProjectStage = NewProjectStage | "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8" | "P9";

/**
 * Configuración de una etapa del proyecto
 */
export interface StageConfig {
  id: ProjectStage;
  name: string;
  description: string;
  responsibleArea: string;
  slaDays: number;
  skippable?: boolean; // Legacy: compatibilidad con componentes antiguos
}

/**
 * Configuraciones de las 4 etapas ODISEO (P1-P4)
 */
export const PROJECT_STAGE_CONFIGS: Record<NewProjectStage, StageConfig> = {
  P1_FICHA_PROYECTO: {
    id: "P1_FICHA_PROYECTO",
    name: "Preparación de Ficha de Proyecto",
    description: "Registra el proyecto y completa la ficha técnica: datos base del cliente, portafolio, ruta de diseño, dimensiones, estructura y especificaciones.",
    responsibleArea: "Comercial",
    slaDays: 3,
  },

  P2_VIABILIDAD_TECNICA: {
    id: "P2_VIABILIDAD_TECNICA",
    name: "Validación de Viabilidad Técnica",
    description: "Artes Gráficas valida diseño e impresión. Luego, R&D Técnica o R&D Desarrollo valida estructura, especificaciones técnicas y viabilidad de manufactura.",
    responsibleArea: "Artes Gráficas / R&D Técnica / R&D Desarrollo",
    slaDays: 5,
  },

  P3_GESTION_PRODUCTOS_PRELIMINARES: {
    id: "P3_GESTION_PRODUCTOS_PRELIMINARES",
    name: "Gestión Comercial de Productos Preliminares",
    description: "Solicita cotización a proveedores, genera productos preliminares y envía presupuesto a cliente para cotizar.",
    responsibleArea: "Commercial Finance",
    slaDays: 7,
  },

  P4_APROBACION_CLIENTE: {
    id: "P4_APROBACION_CLIENTE",
    name: "Aprobación de Cliente y Alta",
    description: "Aprobación por parte del cliente, validación de tesorería y alta en el sistema integral.",
    responsibleArea: "Comercial / Tesorería / Master Data",
    slaDays: 5,
  },
};

/**
 * Array de todas las etapas ODISEO (P1-P4) en orden secuencial
 */
export const ALL_PROJECT_STAGES: StageConfig[] = [
  PROJECT_STAGE_CONFIGS.P1_FICHA_PROYECTO,
  PROJECT_STAGE_CONFIGS.P2_VIABILIDAD_TECNICA,
  PROJECT_STAGE_CONFIGS.P3_GESTION_PRODUCTOS_PRELIMINARES,
  PROJECT_STAGE_CONFIGS.P4_APROBACION_CLIENTE,
];

/**
 * Obtiene la configuración de una etapa por su ID
 */
export function getStageConfig(stageId: ProjectStage): StageConfig | undefined {
  return PROJECT_STAGE_CONFIGS[stageId as NewProjectStage];
}

/**
 * Verifica si un ID corresponde a una etapa ODISEO
 */
export function isPortalStage(stageId: string): boolean {
  return stageId in PROJECT_STAGE_CONFIGS;
}

/**
 * Obtiene el orden secuencial de una etapa
 */
export function getStageSequence(stageId: ProjectStage): number {
  return ALL_PROJECT_STAGES.findIndex((s) => s.id === stageId);
}

/**
 * Verifica si es posible avanzar de una etapa a otra
 */
export function canAdvanceStage(fromStage: ProjectStage, toStage: ProjectStage): boolean {
  const fromIdx = getStageSequence(fromStage);
  const toIdx = getStageSequence(toStage);
  return toIdx >= fromIdx && fromIdx !== -1 && toIdx !== -1;
}

// ============================================================================
// COMPATIBILIDAD LEGACY (para transición gradual de componentes)
// ============================================================================

/**
 * @deprecated Alias de ALL_PROJECT_STAGES para compatibilidad
 */
export const PORTAL_PROJECT_STAGES = ALL_PROJECT_STAGES;

/**
 * @deprecated No hay etapas SI separadas en ODISEO. Mantener vacío para compatibilidad.
 */
export const SI_PROJECT_STAGES: StageConfig[] = [];

/**
 * Mapeo de etapas legacy (P1-P5, P6-P9) a nuevas etapas (P1-P4)
 * @deprecated Usar las nuevas etapas directamente
 */
export const LEGACY_STAGE_MAPPING: Record<string, NewProjectStage> = {
  P1: "P1_FICHA_PROYECTO",
  P2: "P1_FICHA_PROYECTO",
  P3: "P2_VIABILIDAD_TECNICA",
  P4: "P3_GESTION_PRODUCTOS_PRELIMINARES",
  P5: "P3_GESTION_PRODUCTOS_PRELIMINARES",
  P6: "P4_APROBACION_CLIENTE",
  P7: "P4_APROBACION_CLIENTE",
  P8: "P4_APROBACION_CLIENTE",
  P9: "P4_APROBACION_CLIENTE",
};

/**
 * Convierte una etapa legacy (P1-P9) a nueva etapa (P1-P4)
 * @deprecated Usar directamente las nuevas etapas
 */
export function convertLegacyStage(legacyStage: string): NewProjectStage | undefined {
  return LEGACY_STAGE_MAPPING[legacyStage];
}
