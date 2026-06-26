import { useCallback, useMemo } from "react";
import type { ProjectStage } from "../data/projectStageConfig";
import type { PhaseRole } from "../data/projectPhaseConfig";
import {
  getPhaseConfig,
  getEditableFields,
  getVisibleFields,
  isFieldEditableInPhase,
  isFieldVisibleInPhase,
} from "../data/projectPhaseConfig";

interface UseProjectPhaseOptions {
  currentStage: ProjectStage;
  userRole: PhaseRole;
}

export function useProjectPhase({ currentStage, userRole }: UseProjectPhaseOptions) {
  const phaseConfig = useMemo(() => getPhaseConfig(currentStage), [currentStage]);

  const editableFields = useMemo(() => {
    return getEditableFields(currentStage, userRole);
  }, [currentStage, userRole]);

  const visibleFields = useMemo(() => {
    return getVisibleFields(currentStage);
  }, [currentStage]);

  const canEditField = useCallback(
    (fieldName: string) => {
      return isFieldEditableInPhase(fieldName, currentStage, userRole);
    },
    [currentStage, userRole]
  );

  const canSeeField = useCallback(
    (fieldName: string) => {
      return isFieldVisibleInPhase(fieldName, currentStage);
    },
    [currentStage]
  );

  const getFieldStatus = useCallback(
    (fieldName: string) => ({
      visible: canSeeField(fieldName),
      editable: canEditField(fieldName),
      readonly: canSeeField(fieldName) && !canEditField(fieldName),
    }),
    [canSeeField, canEditField]
  );

  return {
    currentPhase: phaseConfig,
    editableFields,
    visibleFields,
    canEditField,
    canSeeField,
    getFieldStatus,
    isPortalPhase: ["P1", "P2", "P3", "P4", "P5"].includes(currentStage as string),
  };
}
