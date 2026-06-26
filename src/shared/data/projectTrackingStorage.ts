import { type ProjectStage, getStageConfig } from "./projectStageConfig";
import { registerProjectStatusChange } from "./slaStorage";

const PROJECT_TRACKING_KEY = "odiseo_project_tracking";

export type ProjectTrackingState = {
  projectCode: string;
  currentStage: ProjectStage;
  stageUpdatedAt: string;
  isCompleted: boolean;
};

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getAllProjectTrackingStates(): ProjectTrackingState[] {
  return safeParseArray<ProjectTrackingState>(localStorage.getItem(PROJECT_TRACKING_KEY));
}

export function getProjectTrackingState(projectCode: string): ProjectTrackingState | undefined {
  const allStates = getAllProjectTrackingStates();
  return allStates.find((s) => s.projectCode === projectCode);
}

export function initializeProjectTracking(projectCode: string, changedBy: string) {
  const currentStates = getAllProjectTrackingStates();
  if (currentStates.some((s) => s.projectCode === projectCode)) return;

  const newState: ProjectTrackingState = {
    projectCode,
    currentStage: "P1_FICHA_PROYECTO",
    stageUpdatedAt: new Date().toISOString(),
    isCompleted: false,
  };

  localStorage.setItem(PROJECT_TRACKING_KEY, JSON.stringify([newState, ...currentStates]));

  // Register initial SLA
  const stageConfig = getStageConfig("P1_FICHA_PROYECTO");
  if (stageConfig) {
    registerProjectStatusChange({
      projectCode,
      fromStatus: "Nuevo",
      toStatus: stageConfig.name,
      responsibleArea: stageConfig.responsibleArea as any,
      changedBy,
      comment: "Inicialización de proyecto",
      stageId: "P1",
      slaDays: stageConfig.slaDays
    });
  }
}

export function advanceProjectStage(projectCode: string, toStage: ProjectStage, changedBy: string, comment?: string) {
  const currentStates = getAllProjectTrackingStates();
  const index = currentStates.findIndex((s) => s.projectCode === projectCode);
  
  if (index === -1) return;

  const prevState = currentStates[index];
  const stageConfig = getStageConfig(toStage);
  
  if (!stageConfig) return;

  currentStates[index] = {
    ...prevState,
    currentStage: toStage,
    stageUpdatedAt: new Date().toISOString(),
    isCompleted: toStage === "P4_APROBACION_CLIENTE",
  };

  localStorage.setItem(PROJECT_TRACKING_KEY, JSON.stringify(currentStates));

  registerProjectStatusChange({
    projectCode,
    fromStatus: getStageConfig(prevState.currentStage)?.name || "Desconocido",
    toStatus: stageConfig.name,
    responsibleArea: stageConfig.responsibleArea as any,
    changedBy,
    comment,
    stageId: toStage,
    slaDays: stageConfig.slaDays
  });
}
