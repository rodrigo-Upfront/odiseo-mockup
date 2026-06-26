import { useState } from "react";
import { type ProjectStage, getStageConfig, PORTAL_PROJECT_STAGES, SI_PROJECT_STAGES } from "../../../shared/data/projectStageConfig";
import Button from "../ui/Button";

interface ProjectAreaValidationPanelProps {
  currentStage: ProjectStage | string;
  hasOpenBlockingObservations: boolean;
  onAdvance: (nextStage: ProjectStage | string) => void;
}

export default function ProjectAreaValidationPanel({ currentStage, hasOpenBlockingObservations, onAdvance }: ProjectAreaValidationPanelProps) {
  const config = getStageConfig(currentStage as ProjectStage);

  if (!config) return null;

  const handleAdvance = (nextStage: ProjectStage | string) => {
    if (hasOpenBlockingObservations) {
      alert("No se puede avanzar la etapa mientras existan observaciones bloqueantes abiertas.");
      return;
    }
    onAdvance(nextStage);
  };

  const isP1 = currentStage === "P1";
  const isP2 = currentStage === "P2";
  const isP5 = currentStage === "P5";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
      <h3 className="font-bold text-brand-primary mb-4">Acciones de Área: {config.responsibleArea}</h3>
      
      {hasOpenBlockingObservations && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          <strong>Atención:</strong> Existen observaciones bloqueantes sin resolver. Debe cerrarlas antes de aprobar o avanzar el flujo.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isP1 && (
          <Button 
            variant="primary" 
            onClick={() => handleAdvance("P2")}
            disabled={hasOpenBlockingObservations}
          >
            Completar Ficha (Avanzar a P2)
          </Button>
        )}
        
        {isP2 && (
          <>
            <Button 
              variant="success" 
              onClick={() => handleAdvance("P3")}
              disabled={hasOpenBlockingObservations}
            >
              Aprobar Diseño (Avanzar a P3)
            </Button>
            {config.skippable && (
              <Button 
                variant="outline" 
                onClick={() => handleAdvance("P3")}
                disabled={hasOpenBlockingObservations}
              >
                Saltar (Sin Diseño)
              </Button>
            )}
          </>
        )}

        {currentStage === "P3" && (
          <Button 
            variant="success" 
            onClick={() => handleAdvance("P4")}
            disabled={hasOpenBlockingObservations}
          >
            Aprobar Técnica (Avanzar a P4)
          </Button>
        )}

        {currentStage === "P4" && (
          <Button 
            variant="success" 
            onClick={() => handleAdvance("P5")}
            disabled={hasOpenBlockingObservations}
          >
            Aprobar Viabilidad (Avanzar a P5)
          </Button>
        )}

        {isP5 && (
          <Button 
            variant="primary" 
            onClick={() => handleAdvance("P6")}
            disabled={hasOpenBlockingObservations}
          >
            Aprobar y Enviar a Desarrollo (Handover SI)
          </Button>
        )}
      </div>
    </div>
  );
}
